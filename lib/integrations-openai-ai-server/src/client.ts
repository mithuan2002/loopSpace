import OpenAI from "openai";

// Lazy client — created on first use so the server starts without the key.
// Only the /analysis route needs this; all other routes work without it.
let _client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY must be set to use AI analysis. Add it in the Secrets panel.",
      );
    }
    _client = new OpenAI({ apiKey });
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
