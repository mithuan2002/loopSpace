import OpenAI from "openai";

// Groq-only AI client (OpenAI-compatible).
// Requires GROQ_API_KEY in environment — get a free key at console.groq.com.
let _client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not set. Add it in the Secrets panel (free key at console.groq.com).",
      );
    }
    _client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _client;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
