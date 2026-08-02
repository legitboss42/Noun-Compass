import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getCurrentUser, getUserRoles } from "@/lib/platform/auth";
import { hasAdminPermission } from "@/lib/platform/admin-permissions";
import { inspectArticles } from "@/lib/platform/article-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { assistantCacheKey, parseAssistantAnswer, redactSensitiveText } from "@/lib/platform/ai-assistant-core";
import { AiGovernanceError, readAiCache, runGovernedAi, writeAiCache } from "@/lib/platform/ai-governance";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in as a staff member." }, { status: 401 });
  const roles = await getUserRoles(user.id);
  const body = await request.json().catch(() => null) as { feature?: "support-draft" | "admin-content-review"; ticketId?: string; articleSlug?: string } | null;
  const permission = body?.feature === "support-draft" ? "support.manage" : "articles.read";
  if (!body?.feature || !hasAdminPermission(roles, permission)) return NextResponse.json({ message: "You do not have permission to use this assistant." }, { status: 403 });
  const rate = enforceRateLimit({ bucket: "admin-ai-assistant", key: user.id, limit: 25, windowMs: 24 * 60 * 60 * 1000 });
  if (rate.limited) return NextResponse.json({ message: "The daily staff AI limit has been reached." }, { status: 429, headers: rateLimitHeaders(rate) });
  try {
    let prompt = "";
    let cacheKey = "";
    if (body.feature === "support-draft") {
      const admin = createAdminClient();
      if (!admin || !body.ticketId) throw new AiGovernanceError("Choose a support ticket.", 400);
      const [{ data: ticket }, { data: messages }] = await Promise.all([
        admin.from("support_tickets").select("id,subject,category,status,priority").eq("id", body.ticketId).maybeSingle(),
        admin.from("support_messages").select("body,internal_note,created_at").eq("ticket_id", body.ticketId).order("created_at").limit(30),
      ]);
      if (!ticket) throw new AiGovernanceError("Support ticket not found.", 404);
      const safeConversation = redactSensitiveText(JSON.stringify({ ticket, messages }));
      cacheKey = assistantCacheKey(["staff-support-draft", body.ticketId, safeConversation]);
      prompt = `Draft a concise staff reply for this NounCompass support ticket. Separate confirmed facts from questions that still need an answer. Do not claim a payment was verified, alter membership access, make an official NOUN decision, or expose internal notes. The reply is a suggestion for staff review and must never be sent automatically. Return strict JSON with title, answer, bullets, warnings, actions, and an empty citations array.\n${safeConversation}`;
    } else {
      const article = inspectArticles().find((item) => item.slug === body.articleSlug);
      if (!article) throw new AiGovernanceError("Choose a valid repository article.", 400);
      const source = await readFile(article.filePath, "utf8");
      const safeSource = redactSensitiveText(source.slice(0, 20_000));
      cacheKey = assistantCacheKey(["admin-content-review", article.slug, safeSource]);
      prompt = `Review this NounCompass MDX article for unclear AI-like wording, unsupported claims, missing trust qualifiers, thin passages, outdated-sounding statements, weak internal-link opportunities, and metadata/content mismatches. Do not rewrite the file, invent current facts, or claim verification. Return strict JSON with title, a concise answer, actionable bullets, warnings, actions, and an empty citations array.\nArticle: ${article.slug}\nMetadata health: ${JSON.stringify({ missingFields: article.missingFields, missingImage: article.missingImage, brokenRelatedArticles: article.brokenRelatedArticles })}\nSource:\n${safeSource}`;
    }
    const cached = await readAiCache(cacheKey);
    if (cached) return NextResponse.json({ result: cached, cached: true }, { headers: rateLimitHeaders(rate) });
    const generated = await runGovernedAi({
      feature: body.feature,
      userId: user.id,
      requestHash: cacheKey,
      staff: true,
      maxTokens: 1100,
      system: "You assist authorised NounCompass staff with read-only drafting and review. Never perform actions, reveal secrets, or treat unverified data as fact. Return strict JSON only.",
      prompt,
    });
    const result = parseAssistantAnswer(generated.content);
    await writeAiCache({ cacheKey, feature: body.feature, userId: user.id, response: result, ttlHours: body.feature === "support-draft" ? 24 : 24 * 7 });
    return NextResponse.json({ result, cached: false, remaining: generated.remaining }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    if (error instanceof AiGovernanceError) return NextResponse.json({ message: error.message }, { status: error.status, headers: rateLimitHeaders(rate) });
    return NextResponse.json({ message: "Staff AI assistance could not complete this request." }, { status: 500, headers: rateLimitHeaders(rate) });
  }
}
