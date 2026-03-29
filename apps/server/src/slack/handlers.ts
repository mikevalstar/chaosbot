import type { App } from "@slack/bolt";
import { generateSlackResponse } from "../openRouter/openrouter";

export function mentionEvent(app: App) {
  app.message(/chaosbot.*/i, async ({ message, say, logger }) => {
    try {
      if (!("text" in message) || !message.text) return;
      if ("subtype" in message && message.subtype) return;

      const reply = await generateSlackResponse("minimax/minimax-m2.7", message.text);

      await say(reply);
    } catch (error) {
      logger.error({ error }, "mentionEvent handler failed");
    }
  });
}
