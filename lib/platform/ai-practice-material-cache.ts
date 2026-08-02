import "server-only";

import { createHash } from "crypto";
import type { CourseMaterial } from "@/lib/course-materials";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMaterialChunks, type ExtractedPdfPage, type MaterialTextChunk } from "./ai-practice-generation-core";

const MAX_PDF_BYTES = 14 * 1024 * 1024;
const MIN_EXTRACTED_CHARACTERS = 900;
const CACHE_DAYS = 30;

export type StoredMaterialChunk = MaterialTextChunk & { id: string };

export type StoredMaterialManifest = {
  id: string;
  materialKey: string;
  contentHash: string;
  pageCount: number;
  chunks: StoredMaterialChunk[];
};

export class MaterialExtractionError extends Error {
  constructor(message: string, readonly status = 422) {
    super(message);
  }
}

type PdfTextItem = { str?: string; transform?: number[] };
type PdfPageData = {
  pageNumber?: number;
  getTextContent(options: { normalizeWhitespace: boolean; disableCombineTextItems: boolean }): Promise<{ items: PdfTextItem[] }>;
};

async function downloadAndExtractPages(material: CourseMaterial) {
  const response = await fetch(material.url, {
    headers: { "User-Agent": "NounCompass/1.0 page-aware official material extraction" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new MaterialExtractionError("The selected official material could not be downloaded.", 502);
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_PDF_BYTES) throw new MaterialExtractionError("This material is too large for instant Practice Exam extraction.", 413);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_PDF_BYTES) throw new MaterialExtractionError("This material is too large for instant Practice Exam extraction.", 413);

  const pages: ExtractedPdfPage[] = [];
  let fallbackPageNumber = 0;
  const renderPage = async (pageData: PdfPageData) => {
    fallbackPageNumber += 1;
    const pageNumber = Number(pageData.pageNumber ?? fallbackPageNumber);
    const content = await pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
    let lastY: number | undefined;
    let text = "";
    for (const item of content.items) {
      const y = item.transform?.[5];
      if (lastY === undefined || y === lastY) text += item.str ?? "";
      else text += `\n${item.str ?? ""}`;
      lastY = y;
    }
    pages.push({ pageNumber, text: text.trim() });
    return text;
  };
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse");
  await pdfParse(bytes, { pagerender: renderPage, max: 0 });
  pages.sort((left, right) => left.pageNumber - right.pageNumber);
  const extractedCharacters = pages.reduce((sum, page) => sum + page.text.length, 0);
  if (extractedCharacters < MIN_EXTRACTED_CHARACTERS) {
    throw new MaterialExtractionError("Could not extract enough readable text from this PDF to generate grounded questions.");
  }
  return { bytes, pages };
}

async function loadStoredManifest(materialKey: string) {
  const admin = createAdminClient();
  if (!admin) throw new MaterialExtractionError("Practice database is not configured.", 503);
  const freshnessCutoff = new Date(Date.now() - CACHE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: manifest } = await admin
    .from("ai_material_manifests")
    .select("id,material_key,content_hash,page_count,extracted_at")
    .eq("material_key", materialKey)
    .eq("status", "ready")
    .gte("extracted_at", freshnessCutoff)
    .order("extracted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!manifest) return null;
  const { data: chunks, error } = await admin
    .from("ai_material_chunks")
    .select("id,chunk_index,heading,page_start,page_end,char_count,chunk_text")
    .eq("manifest_id", manifest.id)
    .order("chunk_index", { ascending: true });
  if (error || !chunks?.length) return null;
  return {
    id: manifest.id,
    materialKey: manifest.material_key,
    contentHash: manifest.content_hash,
    pageCount: manifest.page_count,
    chunks: chunks.map((chunk) => ({
      id: chunk.id,
      chunkIndex: chunk.chunk_index,
      heading: chunk.heading,
      pageStart: chunk.page_start,
      pageEnd: chunk.page_end,
      charCount: chunk.char_count,
      text: chunk.chunk_text,
    })),
  } satisfies StoredMaterialManifest;
}

export async function ensureMaterialManifest(
  materialKey: string,
  material: CourseMaterial,
): Promise<StoredMaterialManifest> {
  const cached = await loadStoredManifest(materialKey);
  if (cached) return cached;
  const admin = createAdminClient();
  if (!admin) throw new MaterialExtractionError("Practice database is not configured.", 503);
  const { bytes, pages } = await downloadAndExtractPages(material);
  const chunks = buildMaterialChunks(pages);
  if (!chunks.length) throw new MaterialExtractionError("No readable course units or page ranges could be prepared from this material.");
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const now = new Date().toISOString();

  const { data: manifest, error: manifestError } = await admin
    .from("ai_material_manifests")
    .insert({
      material_key: materialKey,
      course_code: material.code,
      course_title: material.title,
      material_url: material.url,
      content_hash: contentHash,
      page_count: pages.length,
      chunk_count: chunks.length,
      status: "ready",
      extracted_at: now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (manifestError || !manifest) {
    const raced = await loadStoredManifest(materialKey);
    if (raced) return raced;
    throw new MaterialExtractionError("The extracted material manifest could not be saved.", 503);
  }

  for (let start = 0; start < chunks.length; start += 100) {
    const slice = chunks.slice(start, start + 100);
    const { error } = await admin.from("ai_material_chunks").insert(slice.map((chunk) => ({
      manifest_id: manifest.id,
      chunk_index: chunk.chunkIndex,
      heading: chunk.heading,
      page_start: chunk.pageStart,
      page_end: chunk.pageEnd,
      char_count: chunk.charCount,
      chunk_text: chunk.text,
    })));
    if (error) {
      await admin.from("ai_material_manifests").delete().eq("id", manifest.id);
      throw new MaterialExtractionError("The extracted material chunks could not be saved.", 503);
    }
  }
  const stored = await loadStoredManifest(materialKey);
  if (!stored) throw new MaterialExtractionError("The extracted material could not be reloaded.", 503);
  return stored;
}
