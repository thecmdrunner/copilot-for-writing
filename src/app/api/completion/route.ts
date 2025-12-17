import { groq } from "@ai-sdk/groq";
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
  console.log("API ENDPOINT CALLED");

  try {
    const parseResult = requestSchema.safeParse(await req.json());

    if (!parseResult.success) {
      console.error("VALIDATION ERROR", parseResult.error);
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { prompt, context } = parseResult.data;
    console.log("PARSED REQUEST", { prompt, context });

    const now = new Date();

    try {
      // Create a system prompt that includes the context if provided
      const systemPrompt = [
        "You are a helpful writing assistant. Complete the user's sentence naturally and concisely. IMPORTANT: Only provide the completion text that should come AFTER what the user has already typed. Do NOT repeat any part of what the user has already written. Keep the completion short and relevant. Maintain the same case format as the user's last word.",

        `Today is ${now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}.`,

        context &&
          `Context for this writing: ${context}\n\nUse this context to make your completions more relevant and specific. Pay special attention to names, dates, and specific details mentioned in the context.`,

        "Rules:",
        "1. Match the vibe of the communication based on the provided context.",
        "2. For corporate communication, use the recipient's name in the completion. If the context doesn't mention a name, use a generic salutation like 'Hi Team' or 'Hi [Recipient]'.",
        "3. Keep the language optimistic even when it's someone else's fault. We need to be positive and professional. Keep it always concise by using simpler vocabulary and shorter sentences. Use straight forward language. Avoid being coming across as very distant or cold. Make sure to sound more direct and human.",
        "4. Don't use any emojis.",
        "5. Don't output anything if the end is reached, for example of a letter, email, etc.",
      ]
        .filter(Boolean)
        .join("\n\n");

      // Special handling for empty or minimal prompts with context
      let effectivePrompt = prompt;
      let specialInstructions = "";

      // If the prompt is empty or just whitespace, and we have context
      if ((!prompt.trim() || prompt.trim() === " ") && context.trim()) {
        console.log("EMPTY PROMPT WITH CONTEXT - ADDING SPECIAL INSTRUCTIONS");

        // Add special instructions for generating a good starting sentence
        specialInstructions = `
          The user has provided context but hasn't started typing yet. 
          Generate a good opening sentence or greeting based on the context.
          If it's an email, start with an appropriate greeting.
          If it mentions specific people, use their names appropriately.
          Keep it natural and conversational.
          Don't include any placeholder text like [Name] or similar.
        `;

        // Use a minimal prompt to get the AI started
        effectivePrompt = " ";
      }

      console.log("GENERATING TEXT", {
        effectivePrompt,
        hasSpecialInstructions: !!specialInstructions,
        systemPromptLength: systemPrompt.length,
      });

      const { text } = await generateText({
        // model: groq("llama-3.2-1b-preview"),
        model: groq("openai/gpt-oss-20b"),
        system:
          systemPrompt +
          (specialInstructions ? `\n\n${specialInstructions}` : ""),
        prompt: effectivePrompt,
      });

      console.log("GENERATED TEXT", { text });

      return Response.json({ text } satisfies CompletionResponse);
    } catch (error) {
      console.error("ERROR GENERATING COMPLETION", error);
      return Response.json(
        { error: "Failed to generate completion" },
        { status: 500 },
      );
    }
  } catch (jsonError) {
    console.error("JSON PARSING ERROR", jsonError);
    return Response.json({ error: "Invalid JSON in request" }, { status: 400 });
  }
}
