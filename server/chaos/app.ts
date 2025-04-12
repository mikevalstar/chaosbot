import 'dotenv/config';

import fastify from 'fastify';

import logger from './lib/log';

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
});
