import fastifyServer from '@/lib/fastify';

import './coreMemory';
import './prHistory';
import './usersMemory';

fastifyServer.get('/api/ping', async (request, reply) => {
  return 'pong\n';
});
