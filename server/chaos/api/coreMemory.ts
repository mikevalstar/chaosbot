import { getCoreMemory } from '@/lib/botmemory';
import fastifyServer from '@/lib/fastify';

fastifyServer.get('/api/core-memory', async (request, reply) => {
  try {
    const memory = await getCoreMemory();
    return { memory };
  } catch (error) {
    reply.status(500).send({ error: 'Failed to retrieve core memory' });
  }
});
