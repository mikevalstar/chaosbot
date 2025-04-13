import { prHistory } from '@/db/schema';
import db from '@/lib/db';
import fastifyServer from '@/lib/fastify';
import { desc } from 'drizzle-orm';

fastifyServer.get('/api/pr-history', async (request, reply) => {
  try {
    const prs = await db.select().from(prHistory).orderBy(desc(prHistory.updatedAt));

    return { prs };
  } catch (error) {
    reply.status(500).send({ error: 'Failed to retrieve PR history' });
  }
});
