import { App } from "@slack/bolt";
import { logger } from "../lib/logger.js";
import { mentionEvent } from "./handlers.js";

export async function startSlackBot() {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const appToken = process.env.SLACK_APP_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!botToken || !appToken || !signingSecret) {
    throw new Error("Missing Slack env variables");
  }
  const slackApp = new App({
    token: botToken,
    socketMode: true,
    signingSecret: signingSecret,
    appToken: appToken,
  });
  mentionEvent(slackApp);
  await slackApp.start();
  logger.info("Slack bot started");
}
