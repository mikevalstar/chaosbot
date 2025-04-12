import 'dotenv/config';

import fastify from 'fastify';

import corechat from './actors/corechat';
import { coreboot } from './jobs/coreboot';
import logger from './lib/log';
import slackApp from './lib/slack';

// fastify initialization
const server = fastify();

server.get('/api/ping', async (request, reply) => {
  return 'pong\n';
});

server.listen({ port: Number(process.env.PORT) || 8080 }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`Server listening at ${address}`);

  // booting the core
  coreboot();

  // start slack app
  slackApp.start(process.env.PORT_SLACK || 3000);

  slackApp.message(async ({ context, message, say }) => {
    if (message.type === 'message' && 'text' in message && 'user' in message) {
      const channel = message.channel;
      const botMentioned = message.text?.includes(`<@${context.botUserId}>`);
      const botNameMentioned = message.text
        ?.toLowerCase()
        .includes(process.env.SLACK_BOT_NAME?.toLowerCase() || '');
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
