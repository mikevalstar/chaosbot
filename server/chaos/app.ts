import 'dotenv/config';

import corechat from './actors/corechat';
import './api/index';
import { coreboot } from './jobs/coreboot';
import { githubCheckPRs } from './jobs/github';
import fastifyServer from './lib/fastify';
import logger from './lib/log';
import slackApp from './lib/slack';

fastifyServer.listen({ port: Number(process.env.PORT) || 8080 }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`Server listening at ${address}`);

  // booting the core
  coreboot();
  githubCheckPRs();

  // start slack app
  slackApp.start(process.env.PORT_SLACK || 3000);

  slackApp.message(async ({ context, message, say }) => {
    if (message.type === 'message' && 'text' in message && 'user' in message) {
      const channel = message.channel;
      const botMentioned = message.text?.includes(`<@${context.botUserId}>`);
      const botNameMentioned = new RegExp(
        `\\b${process.env.SLACK_BOT_NAME?.toLowerCase() || ''}\\b`,
      ).test(message.text?.toLowerCase() || '');
      // detect if it's a dm
      const isDm = message.channel_type === 'im';

      if (botMentioned || botNameMentioned || isDm) {
        await corechat(channel, message, say, true, isDm);
      } else {
        await corechat(channel, message, say, false, isDm);
      }
    }
  });
});
