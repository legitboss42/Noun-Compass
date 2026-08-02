import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAiProviderConfig } from "./ai-provider";
import { membershipIsActive } from "./membership";

export type GovernedAiFeature =
  | "performance-coach"
  | "course-qa"
  | "answer-explanation"
  | "admission-guidance"
  | "fee-explanation"
  | "academic-support"
  | "support-draft"
  | "admin-content-review";

const limits: Record<GovernedAiFeature, { free: number; premium: number; staff?: number }> = {
  "performance-coach": { free: 1, premium: 3 },
  "course-qa": { free: 3, premium: 20 },
  "answer-explanation": { free: 3, premium: 20 },
  "admission-guidance": { free: 1, premium: 3 },
  "fee-explanation": { free: 1, premium: 3 },
  "academic-support": { free: 3, premium: 15 },
  "support-draft": { free: 1, premium: 5, staff: 20 },
  "admin-content-review": { free: 0, premium: 0, staff: 25 },
};

export class AiGovernanceError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function lagosDayStart() {
  const value = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${value}T00:00:00+01:00`).toISOString();
}

async function premiumForUser(userId: string) {
  const admin = createAdminClient();
  if (!admin) throw new AiGovernanceError("AI storage is not configured.", 503);
  const { data } = await admin
    .from("memberships")
    .select("status,ends_at")
    .eq("user_id", userId)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return membershipIsActive(data?.status, data?.ends_at);
}

export async function readAiCache(cacheKey: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("ai_feature_cache")
    .select("response_json")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data?.response_json ?? null;
}

export async function writeAiCache(input: {
  cacheKey: string;
  feature: GovernedAiFeature;
  userId?: string | null;
  response: unknown;
  ttlHours: number;
}) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("ai_feature_cache").upsert({
    cache_key: input.cacheKey,
    feature: input.feature,
    user_id: input.userId ?? null,
    response_json: input.response,
    expires_at: new Date(Date.now() + input.ttlHours * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function runGovernedAi(input: {
  feature: GovernedAiFeature;
  userId: string;
  requestHash: string;
  system: string;
  prompt: string;
  maxTokens?: number;
  staff?: boolean;
}) {
  const admin = createAdminClient();
  const provider = getAiProviderConfig();
  if (!admin || !provider) throw new AiGovernanceError("AI assistance is temporarily unavailable.", 503);
  const premium = input.staff ? false : await premiumForUser(input.userId);
  const featureLimit = limits[input.feature];
  const userLimit = input.staff ? (featureLimit.staff ?? 0) : premium ? featureLimit.premium : featureLimit.free;
  if (userLimit < 1) throw new AiGovernanceError("This AI feature is not available for this account.", 403);
  const globalLimit = Math.max(10, Math.min(10_000, Number(process.env.AI_GLOBAL_DAILY_LIMIT ?? 250)));
  const { data, error } = await admin.rpc("claim_ai_feature_request", {
    p_user_id: input.userId,
    p_feature: input.feature,
    p_request_hash: input.requestHash,
    p_window_started_at: lagosDayStart(),
    p_user_limit: userLimit,
    p_global_limit: globalLimit,
  });
  const claim = (Array.isArray(data) ? data[0] : data) as { allowed?: boolean; usage_id?: string; user_count?: number } | null;
  if (error || !claim) throw new AiGovernanceError("AI usage could not be checked safely.", 503);
  if (!claim.allowed || !claim.usage_id) {
    throw new AiGovernanceError("Your AI allowance for this feature has been reached. It resets at midnight Lagos time.", 429);
  }
  try {
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: provider.headers,
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.prompt },
        ],
        temperature: 0.15,
        max_tokens: Math.max(300, Math.min(1800, input.maxTokens ?? 900)),
      }),
    });
    if (!response.ok) throw new AiGovernanceError(`AI provider returned ${response.status}.`, 502);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AiGovernanceError("AI provider returned an empty response.", 502);
    await admin.from("ai_feature_usage").update({
      status: "completed",
      provider: provider.provider,
      model: provider.model,
      input_chars: input.prompt.length,
      output_chars: content.length,
      completed_at: new Date().toISOString(),
    }).eq("id", claim.usage_id);
    return { content, premium, remaining: Math.max(0, userLimit - Number(claim.user_count ?? 1)) };
  } catch (error) {
    await admin.from("ai_feature_usage").update({
      status: "failed",
      error_code: error instanceof AiGovernanceError ? String(error.status) : "provider_error",
      completed_at: new Date().toISOString(),
    }).eq("id", claim.usage_id);
    throw error instanceof AiGovernanceError ? error : new AiGovernanceError("AI assistance could not complete this request.", 502);
  }
}
