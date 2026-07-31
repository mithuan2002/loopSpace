import OpenAI from "openai";

// Groq does not support image generation.
// These exports are kept so imports don't break, but calling them throws a clear error.

function getClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it in the Secrets panel (free key at console.groq.com).",
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export async function generateImageBuffer(
  _prompt: string,
  _size?: "1024x1024" | "512x512" | "256x256"
): Promise<Buffer> {
  throw new Error(
    "Image generation is not supported by Groq. Use a different provider (e.g. OpenAI DALL·E) if you need this feature.",
  );
}

export async function editImages(
  _imageFiles: string[],
  _prompt: string,
  _outputPath?: string
): Promise<Buffer> {
  throw new Error(
    "Image editing is not supported by Groq. Use a different provider (e.g. OpenAI DALL·E) if you need this feature.",
  );
}
