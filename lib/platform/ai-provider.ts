export type AiProvider = "groq" | "openrouter";

export type AiProviderConfig = {
  provider: AiProvider;
  endpoint: string;
  model: string;
  headers: Record<string, string>;
};

/**
 * Reasoning models emit a chain-of-thought before the answer. Left unchecked it
 * consumes the whole max_tokens budget, so the reply arrives truncated and every
 * JSON.parse downstream fails.
 *
 * `reasoning_format: "hidden"` does NOT prevent this. Measured against Groq:
 * qwen3.6-27b spent all 600 completion tokens on reasoning and returned empty
 * content, because "hidden" only strips the thinking from the response after it
 * has been generated and billed. Disabling reasoning outright is what actually
 * frees the budget: the same request then cost 6 tokens.
 *
 * Groq validates these parameters per model family and rejects the whole request
 * when one does not apply, so only send what the family accepts:
 *   qwen/*          -> reasoning_effort must be "none" or "default"
 *   openai/gpt-oss* -> reasoning_effort must be "low", "medium" or "high"
 *   llama-3.3-70b   -> rejects both parameters outright
 * Anything unrecognised therefore gets no reasoning parameters at all, so a
 * changed GROQ_MODEL cannot take every AI feature down with 400s.
 */
export function reasoningControlFor(provider: AiProviderConfig): Record<string, unknown> {
  if (provider.provider === "groq") {
    if (provider.model.startsWith("openai/gpt-oss")) {
      return { reasoning_effort: "low", reasoning_format: "hidden" };
    }
    if (provider.model.startsWith("qwen/")) return { reasoning_effort: "none" };
    return {};
  }
  return { reasoning: { exclude: true } };
}

export function getAiProviderConfig(
  env: Record<string, string | undefined> = process.env,
): AiProviderConfig | null {
  const provider = env.AI_PROVIDER?.trim().toLowerCase();

  if (provider === "groq") {
    const apiKey = env.GROQ_API_KEY?.replace(/\s+/g, "");
    const model = env.GROQ_MODEL?.trim();
    if (!apiKey || !model) return null;

    return {
      provider,
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };
  }

  if (provider === "openrouter") {
    const apiKey = env.OPENROUTER_API_KEY?.replace(/\s+/g, "");
    const model = env.OPENROUTER_MODEL?.trim();
    if (!apiKey || !model) return null;

    return {
      provider,
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          env.OPENROUTER_SITE_URL?.trim() ||
          env.NEXT_PUBLIC_SITE_URL?.trim() ||
          "https://nouncompass.me",
        "X-Title": env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
      },
    };
  }

  return null;
}

/**
 * Gate for student-facing AI features (Practice Exam, exam summaries).
 *
 * These previously gated on AI_QUESTION_DRAFTS_ENABLED, an admin
 * content-authoring switch. That coupled the paid product to an internal tool:
 * turning the admin tool off silently removed Practice Exams for every paying
 * student. The student gate now depends only on a configured provider, with its
 * own kill switch for incidents.
 */
export function aiStudentFeaturesConfigured(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.AI_STUDENT_FEATURES_ENABLED?.trim().toLowerCase() === "false") return false;
  return Boolean(getAiProviderConfig(env));
}

export function getAiProviderConfigs(
  env: Record<string, string | undefined> = process.env,
): AiProviderConfig[] {
  const primary = getAiProviderConfig(env);
  const providers: AiProviderConfig[] = primary ? [primary] : [];
  const groqApiKey = env.GROQ_API_KEY?.replace(/\s+/g, "");
  const groqFallbackModel = env.GROQ_FALLBACK_MODEL?.trim() || "openai/gpt-oss-20b";

  if (groqApiKey) {
    providers.push({
      provider: "groq",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: groqFallbackModel,
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  const openRouterApiKey = env.OPENROUTER_API_KEY?.replace(/\s+/g, "");
  const openRouterModel = env.OPENROUTER_MODEL?.trim();
  if (openRouterApiKey) {
    // "openrouter/free" resolves to an arbitrary free model per request, so
    // output quality varied unpredictably for students. Pin a known model.
    // Note: OpenRouter only serves as a fallback while the key has credit;
    // a zero-limit key returns 403 for every model, free or paid.
    const openRouterFallbackModel = env.OPENROUTER_FALLBACK_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct";
    providers.push({
      provider: "openrouter",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: openRouterFallbackModel,
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          env.OPENROUTER_SITE_URL?.trim() ||
          env.NEXT_PUBLIC_SITE_URL?.trim() ||
          "https://nouncompass.me",
        "X-Title": env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
      },
    });
    if (openRouterModel && primary?.provider === "openrouter") {
      providers.push({
        provider: "openrouter",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        model: openRouterModel,
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            env.OPENROUTER_SITE_URL?.trim() ||
            env.NEXT_PUBLIC_SITE_URL?.trim() ||
            "https://nouncompass.me",
          "X-Title": env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
        },
      });
    }
  }

  const seen = new Set<string>();
  return providers.filter((provider) => {
    const key = `${provider.provider}:${provider.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getStructuredAiProviderConfigs(
  env: Record<string, string | undefined> = process.env,
) {
  const priority = (provider: AiProviderConfig) => {
    if (provider.provider === "groq" && provider.model.startsWith("openai/gpt-oss")) return 0;
    if (provider.provider === "groq") return 1;
    return 2;
  };
  return getAiProviderConfigs(env).sort((left, right) => priority(left) - priority(right));
}
