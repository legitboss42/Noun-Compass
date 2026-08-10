import assert from "node:assert/strict";
import test from "node:test";
import { reasoningControlFor, type AiProviderConfig } from "../../lib/platform/ai-provider";

function groq(model: string): AiProviderConfig {
  return {
    provider: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model,
    headers: {},
  };
}

// Measured against the live Groq API: `reasoning_format: "hidden"` only strips
// the thinking after it has been generated and billed, so qwen3.6-27b spent all
// 600 completion tokens reasoning and returned empty content. Disabling
// reasoning is what frees the budget, and the accepted value differs per family.
test("qwen models disable reasoning rather than hiding it", () => {
  const control = reasoningControlFor(groq("qwen/qwen3.6-27b"));
  assert.equal(control.reasoning_effort, "none");
  assert.equal("reasoning_format" in control, false);
});

test("gpt-oss models use the lowest effort they accept", () => {
  const control = reasoningControlFor(groq("openai/gpt-oss-20b"));
  // Groq rejects "none" for this family with a 400.
  assert.equal(control.reasoning_effort, "low");
  assert.equal(control.reasoning_format, "hidden");
});

test("models that reject reasoning parameters are sent none", () => {
  // llama-3.3-70b-versatile answers 400 for both reasoning_effort and
  // reasoning_format, so an unrecognised GROQ_MODEL must not break every call.
  assert.deepEqual(reasoningControlFor(groq("llama-3.3-70b-versatile")), {});
  assert.deepEqual(reasoningControlFor(groq("moonshotai/kimi-k2")), {});
});

test("openrouter keeps its own reasoning control", () => {
  const control = reasoningControlFor({
    provider: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct",
    headers: {},
  });
  assert.deepEqual(control, { reasoning: { exclude: true } });
});
