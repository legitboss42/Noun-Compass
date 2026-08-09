import "server-only";

import type { CourseMaterial } from "@/lib/course-materials";
import { createAdminClient } from "@/lib/supabase/admin";
import { aiQuestionDraftsConfigured } from "./ai-question-drafts-core";
import { getAiProviderConfig, reasoningControlFor } from "./ai-provider";
import { membershipIsActive } from "./membership";
import { resolveAiPracticeMaterial } from "./ai-practice-materials";
import { normalizeCourseCode } from "./course-codes";

const MAX_PDF_BYTES = 16 * 1024 * 1024;
const MAX_EXCERPT_LENGTH = 32_000;
const MIN_EXTRACTED_CHARS = 900;
const SUMMARY_CACHE_DAYS = 30;

export type CourseSummaryResult = {
  courseCode: string;
  courseTitle: string;
  materialTitle: string;
  generatedAt: string;
  expiresAt?: string;
  model: string;
  summary: {
    title: string;
    examFocus: string;
    keyAreas: Array<{
      heading: string;
      whyItMatters: string;
      points: string[];
    }>;
    definitions: string[];
    formulasOrProcesses: string[];
    likelyQuestionAngles: string[];
    revisionChecklist: string[];
    caution: string;
  };
};

export type SavedCourseSummary = CourseSummaryResult & {
  materialKey: string;
  expiresAt: string;
};

export class AiSummaryError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

async function userHasPremium(userId: string) {
  const admin = createAdminClient();
  if (!admin) throw new AiSummaryError("Summary database is not configured.", 503);
  const { data } = await admin
    .from("memberships")
    .select("status,ends_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return membershipIsActive(data?.status, data?.ends_at);
}

async function userHasRegisteredCourse(userId: string, courseCode: string) {
  const admin = createAdminClient();
  if (!admin) throw new AiSummaryError("Summary database is not configured.", 503);

  const { data, error } = await admin
    .from("profiles")
    .select("selected_course_codes")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new AiSummaryError("Could not verify your registered courses.", 503);

  const selectedCourseCodes = Array.isArray(data?.selected_course_codes)
    ? data.selected_course_codes.map((code) => normalizeCourseCode(String(code))).filter(Boolean)
    : [];

  return selectedCourseCodes.includes(normalizeCourseCode(courseCode));
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function coerceCachedSummary(payload: unknown, fallback: {
  courseCode: string;
  courseTitle: string;
  expiresAt: string;
  generatedAt: string;
  materialTitle: string;
  model: string | null;
}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const cached = payload as CourseSummaryResult;
  if (!cached.summary || typeof cached.summary !== "object") return null;
  return {
    ...cached,
    courseCode: cached.courseCode || fallback.courseCode,
    courseTitle: cached.courseTitle || fallback.courseTitle,
    materialTitle: cached.materialTitle || fallback.materialTitle,
    generatedAt: cached.generatedAt || fallback.generatedAt,
    expiresAt: cached.expiresAt || fallback.expiresAt,
    model: cached.model || fallback.model || "saved",
  } satisfies CourseSummaryResult;
}

async function verifySummaryAccess(userId: string, material: CourseMaterial) {
  if (!await userHasPremium(userId)) {
    throw new AiSummaryError("Exam summaries are available to active Semester Pass members.", 403);
  }
  if (!await userHasRegisteredCourse(userId, material.code)) {
    throw new AiSummaryError(
      "Exam summaries are limited to courses saved in your dashboard registered-course list.",
      403,
    );
  }
}

export async function getCachedCourseMaterialSummary(userId: string, materialKey: string): Promise<CourseSummaryResult | null> {
  const material = resolveAiPracticeMaterial(materialKey);
  if (!material) throw new AiSummaryError("Choose a valid official course material.", 400);

  await verifySummaryAccess(userId, material);

  const admin = createAdminClient();
  if (!admin) throw new AiSummaryError("Summary database is not configured.", 503);

  const { data, error } = await admin
    .from("course_material_summaries")
    .select("course_code,course_title,material_title,model,summary_payload,generated_at,expires_at")
    .eq("user_id", userId)
    .eq("material_key", materialKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    if (["42P01", "42703"].includes(error.code ?? "")) return null;
    throw new AiSummaryError("Saved summary could not be loaded.", 503);
  }
  if (!data) return null;

  return coerceCachedSummary(data.summary_payload, {
    courseCode: data.course_code,
    courseTitle: data.course_title,
    materialTitle: data.material_title,
    generatedAt: data.generated_at,
    expiresAt: data.expires_at,
    model: data.model,
  });
}

export async function listSavedCourseMaterialSummaries(userId: string): Promise<SavedCourseSummary[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("course_material_summaries")
    .select("material_key,course_code,course_title,material_title,model,summary_payload,generated_at,expires_at")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("generated_at", { ascending: false })
    .limit(20);

  if (error) return [];

  return (data ?? []).flatMap((row) => {
    const summary = coerceCachedSummary(row.summary_payload, {
      courseCode: row.course_code,
      courseTitle: row.course_title,
      materialTitle: row.material_title,
      generatedAt: row.generated_at,
      expiresAt: row.expires_at,
      model: row.model,
    });
    return summary ? [{ ...summary, materialKey: row.material_key, expiresAt: row.expires_at }] : [];
  });
}

async function extractMaterialText(material: CourseMaterial) {
  const response = await fetch(material.url, {
    headers: { "User-Agent": "NounCompass/1.0 premium course summary extraction" },
  });
  if (!response.ok) throw new AiSummaryError("The selected material could not be downloaded.", 502);
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_PDF_BYTES) throw new AiSummaryError("This material is too large for instant summary generation.", 413);
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PDF_BYTES) throw new AiSummaryError("This material is too large for instant summary generation.", 413);
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse");
  const parsed = await pdfParse(Buffer.from(arrayBuffer));
  const text = parsed.text.replace(/\s+/g, " ").trim();
  if (text.length < MIN_EXTRACTED_CHARS) throw new AiSummaryError("Could not extract enough readable text from this PDF.", 422);
  return text.slice(0, MAX_EXCERPT_LENGTH);
}

function stripJsonFences(value: string) {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function asTextArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 12)
    : [];
}

function parseSummary(content: string): CourseSummaryResult["summary"] {
  const parsed = JSON.parse(stripJsonFences(content)) as Record<string, unknown>;
  const keyAreas = Array.isArray(parsed.keyAreas)
    ? parsed.keyAreas.slice(0, 8).map((item) => {
        const area = item as Record<string, unknown>;
        return {
          heading: String(area.heading ?? "Important area").replace(/\s+/g, " ").trim(),
          whyItMatters: String(area.whyItMatters ?? "").replace(/\s+/g, " ").trim(),
          points: asTextArray(area.points).slice(0, 6),
        };
      }).filter((area) => area.heading && area.points.length)
    : [];
  if (!keyAreas.length) throw new Error("AI provider returned no summary areas.");
  return {
    title: String(parsed.title ?? "Exam-focused course summary").replace(/\s+/g, " ").trim(),
    examFocus: String(parsed.examFocus ?? "").replace(/\s+/g, " ").trim(),
    keyAreas,
    definitions: asTextArray(parsed.definitions),
    formulasOrProcesses: asTextArray(parsed.formulasOrProcesses),
    likelyQuestionAngles: asTextArray(parsed.likelyQuestionAngles),
    revisionChecklist: asTextArray(parsed.revisionChecklist),
    caution: String(parsed.caution ?? "This is a study aid, not an official NOUN exam forecast.").replace(/\s+/g, " ").trim(),
  };
}

function buildPrompt(material: CourseMaterial, excerpt: string) {
  return `Create an exam-focused study summary from the official course-material excerpt.

Strict rules:
- Use only the provided material excerpt.
- Do not claim certainty about future exam questions.
- Do not copy long passages verbatim.
- Focus on examinable concepts, definitions, formulas, processes, comparisons, and likely question angles.
- Return JSON only. No markdown, comments, or code fences.
- JSON keys: title, examFocus, keyAreas, definitions, formulasOrProcesses, likelyQuestionAngles, revisionChecklist, caution.
- keyAreas must be an array of 5 to 8 items. Each item must have heading, whyItMatters, points.
- points must be short student-friendly bullets.

Course code: ${material.code}
Course title: ${material.title}
Source: Official NOUN eCourseware

Course-material excerpt:
${excerpt}`;
}

export async function generateCourseMaterialSummary(userId: string, materialKey: string): Promise<CourseSummaryResult> {
  const material = resolveAiPracticeMaterial(materialKey);
  if (!material) throw new AiSummaryError("Choose a valid official course material.", 400);

  await verifySummaryAccess(userId, material);
  const cached = await getCachedCourseMaterialSummary(userId, materialKey);
  if (cached) return cached;

  if (!aiQuestionDraftsConfigured()) throw new AiSummaryError("Exam summaries are not configured yet.", 503);
  const excerpt = await extractMaterialText(material);
  const provider = getAiProviderConfig();
  if (!provider) throw new AiSummaryError("Exam summaries are not configured yet.", 503);
  const { model } = provider;
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: provider.headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You create grounded student study summaries from authorised course-material excerpts. You never promise exact exam questions.",
        },
        { role: "user", content: buildPrompt(material, excerpt) },
      ],
      ...reasoningControlFor(provider),
      temperature: 0.25,
      max_tokens: 2_000,
    }),
  });
  if (!response.ok) throw new AiSummaryError(`AI provider request failed with status ${response.status}.`, 502);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new AiSummaryError("AI provider returned no summary.", 502);
  const generatedAt = new Date();
  const expiresAt = addDays(generatedAt, SUMMARY_CACHE_DAYS).toISOString();
  const result = {
    courseCode: material.code,
    courseTitle: material.title,
    materialTitle: material.title,
    generatedAt: generatedAt.toISOString(),
    expiresAt,
    model,
    summary: parseSummary(content),
  };
  const admin = createAdminClient();
  await admin?.from("user_tool_activity").upsert(
    {
      user_id: userId,
      tool_key: "material-summary",
      summary: {
        courseCode: result.courseCode,
        courseTitle: result.courseTitle,
        generatedAt: result.generatedAt,
        keyAreas: result.summary.keyAreas.length,
      },
      updated_at: result.generatedAt,
    },
    { onConflict: "user_id,tool_key" },
  );
  await admin?.from("course_material_summaries").upsert(
    {
      user_id: userId,
      material_key: materialKey,
      course_code: result.courseCode,
      course_title: result.courseTitle,
      material_title: result.materialTitle,
      material_url: material.url,
      source_label: "Official NOUN eCourseware",
      model: result.model,
      summary_payload: result,
      generated_at: result.generatedAt,
      expires_at: expiresAt,
      updated_at: result.generatedAt,
    },
    { onConflict: "user_id,material_key" },
  );
  return result;
}
