import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

export const runtime = "edge";

// Define the request schema
const requestSchema = z.object({
  prompt: z.string(),
  context: z.string().optional().default(""),
});

export type CompletionResponse = {
  text: string;
};

export async function POST(req: Request) {
  const result = requestSchema.safeParse(await req.json());

  if (!result.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { prompt, context } = result.data;

  try {
    // Create a system prompt that includes the context if provided
    let systemPrompt =
      "You are a helpful writing assistant. Complete the user's sentence naturally and concisely. IMPORTANT: Only provide the completion text that should come AFTER what the user has already typed. Do NOT repeat any part of what the user has already written. Keep the completion short and relevant. Maintain the same case format as the user's last word.";

    if (context) {
      systemPrompt += `\n\nContext for this writing: ${context}\n\nUse this context to make your completions more relevant and specific. Pay special attention to names, dates, and specific details mentioned in the context.`;
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt,
    });

    return Response.json({ text } satisfies CompletionResponse);
  } catch (error) {
    console.error("Error generating completion:", error);
    return Response.json(
      { error: "Failed to generate completion" },
      { status: 500 },
    );
  }
}
