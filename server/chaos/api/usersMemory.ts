import { people } from '@/db/schema';
import db from '@/lib/db';
import fastifyServer from '@/lib/fastify';

fastifyServer.get('/api/users-memory', async (request, reply) => {
  try {
    const users = await db
      .select({
        id: people.id,
        slackId: people.slackId,
        name: people.name,
        keyInfo: people.keyInfo,
      })
      .from(people);

    return { users };
  } catch (error) {
    reply.status(500).send({ error: 'Failed to retrieve users memory' });
  }
});
