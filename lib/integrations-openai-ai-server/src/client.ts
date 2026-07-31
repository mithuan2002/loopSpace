import OpenAI from "openai";

// Lazy client — created on first use so the server starts without a key.
// Prefers GROQ_API_KEY (free tier, OpenAI-compatible) over OPENAI_API_KEY.
let _client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!_client) {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      _client = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    } else if (openaiKey) {
      _client = new OpenAI({ apiKey: openaiKey });
    } else {
      throw new Error(
        "No AI key found. Set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY in the Secrets panel.",
      );
    }
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
