import { courseMaterials } from "@/lib/course-materials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const windowMs = 10 * 60 * 1000;
const requestLimit = 12;
const requests = new Map<string, { count: number; resetAt: number }>();

function responseHeaders(extra: Record<string, string> = {}) {
  return { "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff", ...extra };
}

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateLimit(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (current.count >= requestLimit) return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  current.count += 1;
  return null;
}

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._ -]+/g, "").replace(/\s+/g, " ").trim().slice(0, 140) || "NOUN-course-material";
}

function verifiedMaterial(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code") ?? "";
  const url = params.get("url") ?? "";
  return courseMaterials.find((item) => item.code === code && item.url === url);
}

export async function HEAD(request: Request) {
  const material = verifiedMaterial(request);
  if (!material) return new Response(null, { status: 404, headers: responseHeaders({ "Cache-Control": "no-store" }) });
  return new Response(null, { status: 200, headers: responseHeaders({ "Cache-Control": "no-store", "X-Downloaded-Via": "NOUN Compass" }) });
}

export async function GET(request: Request) {
  const retryAfter = rateLimit(request);
  if (retryAfter) {
    return Response.json({ error: "Download limit reached. Please wait before trying again." }, { status: 429, headers: responseHeaders({ "Retry-After": String(retryAfter), "Cache-Control": "no-store" }) });
  }

  const material = verifiedMaterial(request);
  if (!material) return Response.json({ error: "Course material not found." }, { status: 404, headers: responseHeaders() });

  const source = new URL(material.url);
  if (source.protocol !== "https:" || source.hostname !== "nou.edu.ng" || !source.pathname.startsWith("/coursewarecontent/")) {
    return Response.json({ error: "Unapproved material source." }, { status: 400, headers: responseHeaders() });
  }

  try {
    const upstream = await fetch(source, {
      headers: { "user-agent": "NOUN Compass student academic support downloader" },
      redirect: "follow",
      signal: AbortSignal.timeout(90000),
    });
    if (!upstream.ok || !upstream.body) throw new Error("Source unavailable");
    const length = Number(upstream.headers.get("content-length"));
    if (length && length > 100 * 1024 * 1024) return Response.json({ error: "This file is too large for direct delivery." }, { status: 413, headers: responseHeaders() });

    const filename = `NounCompass - ${safeFilename(material.code)} - ${safeFilename(material.title)}.pdf`;
    return new Response(upstream.body, {
      headers: responseHeaders({
        "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Downloaded-Via": "NOUN Compass",
        ...(length ? { "Content-Length": String(length) } : {}),
      }),
    });
  } catch {
    return Response.json({ error: "This material is temporarily unavailable." }, { status: 502, headers: responseHeaders({ "Cache-Control": "no-store" }) });
  }
}
