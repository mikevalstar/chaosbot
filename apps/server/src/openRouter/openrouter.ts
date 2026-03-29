import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { logger } from "../lib/logger.js";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateSlackResponse(modelName: string, prompt: string): Promise<string> {
  logger.info(
    { modelName, promptLength: prompt.length },
    "Generating Slack response with OpenRouter",
  );

  try {
    const { text } = await generateText({
      model: openrouter.chat(modelName),
      system: "Your name is Chaosbot, you are highly sarcastic, very unhelpful and downright rude.",
      prompt,
      maxOutputTokens: 500,
    });

    logger.info(
      { modelName, responseLength: text.length },
      "Generated Slack response with OpenRouter",
    );

    return text;
  } catch (error) {
    logger.error(
      { error, modelName, promptLength: prompt.length },
      "Failed to generate Slack response with OpenRouter",
    );
    throw error;
  }
}
