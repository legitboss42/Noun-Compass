export type AiProvider = "groq" | "openrouter";

export type AiProviderConfig = {
  provider: AiProvider;
  endpoint: string;
  model: string;
  headers: Record<string, string>;
};

/**
 * Reasoning models (Groq qwen/*, OpenRouter nvidia/nemotron-*, deepseek-r1 and
 * friends) emit a hidden chain-of-thought before the answer. Left unchecked it
 * consumes the whole max_tokens budget, so the reply arrives truncated or as a
 * bare `<think>` block and every JSON.parse downstream fails. These flags keep
 * the thinking out of the response body.
 */
export function reasoningControlFor(provider: AiProviderConfig): Record<string, unknown> {
  if (provider.provider === "groq") {
    return { reasoning_format: "hidden" };
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
