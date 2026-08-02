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
