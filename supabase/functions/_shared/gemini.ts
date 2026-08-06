import { GoogleGenAI } from "npm:@google/genai";

let client = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") });
  }
  return client;
}

// Both tiers use the same model: "gemini-flash-latest" has an internal
// "thinking" step enabled by default that consumes an unpredictable, often
// large share of maxOutputTokens (observed 380-980+ tokens on internal
// reasoning alone across identical prompts) before writing anything visible,
// cutting real output off mid-sentence — and thinkingConfig.thinkingBudget
// does not reliably cap it. "gemini-flash-lite-latest" has no thinking step
// and produced complete, good-quality output in every test.
export const AI_MODELS = {
  fast: "gemini-flash-lite-latest",
  quality: "gemini-flash-lite-latest",
};

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs)
    ),
  ]);
}

export async function generateText(prompt, opts = {}) {
  const response = await withTimeout(
    getClient().models.generateContent({
      model: opts.model || AI_MODELS.quality,
      contents: prompt,
      config: {
        systemInstruction: opts.system,
        maxOutputTokens: opts.maxTokens ?? 512,
      },
    }),
    opts.timeoutMs ?? 15000
  );

  return response.text ?? "";
}

export async function generateStructured(prompt, schema, opts = {}) {
  const response = await withTimeout(
    getClient().models.generateContent({
      model: opts.model || AI_MODELS.fast,
      contents: prompt,
      config: {
        systemInstruction: opts.system,
        maxOutputTokens: opts.maxTokens ?? 512,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
    opts.timeoutMs ?? 15000
  );

  try {
    return JSON.parse(response.text ?? "");
  } catch {
    throw new Error("Model did not return valid structured JSON.");
  }
}
