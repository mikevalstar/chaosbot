import { env, people } from '@/db/schema';
import db from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function getCoreMemory() {
  const coreMemory = await db.select().from(env).where(eq(env.id, 'core_memory'));
  return coreMemory[0].value;
}

export async function storeCoreMemory(memory: string) {
  await db.update(env).set({ value: memory }).where(eq(env.id, 'core_memory'));
}

export async function getUserMemory(userId: string) {
  const userMemory = await db.select().from(people).where(eq(people.slackId, userId));
  return userMemory[0]?.keyInfo || '';
}

export async function storeUserMemory(userId: string, memory: string) {
  const userMem = await db.select().from(people).where(eq(people.slackId, userId));
  if (userMem.length === 0) {
    await db.insert(people).values({ slackId: userId, name: 'unknown', keyInfo: memory });
  } else {
    await db.update(people).set({ keyInfo: memory }).where(eq(people.id, userMem[0].id));
  }
}
