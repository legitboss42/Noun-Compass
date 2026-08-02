export type AiProvider = "groq" | "openrouter";

export type AiProviderConfig = {
  provider: AiProvider;
  endpoint: string;
  model: string;
  headers: Record<string, string>;
};

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
        "X-OpenRouter-Title": env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
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
    const openRouterFallbackModel = env.OPENROUTER_FALLBACK_MODEL?.trim() || "openrouter/free";
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
        "X-OpenRouter-Title": env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
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
          "X-OpenRouter-Title": env.OPENROUTER_APP_TITLE?.trim() || "NounCompass",
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
    if (provider.model === "openrouter/free") return 2;
    return 3;
  };
  return getAiProviderConfigs(env).sort((left, right) => priority(left) - priority(right));
}
