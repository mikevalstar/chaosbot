import { eq } from 'drizzle-orm';

import { env } from '../db/schema';
import db from '../lib/db';

export const coreboot = async () => {
  // check for and insert the main env keys:

  // Core Memory
  const coreMemoryKey = 'core_memory';
  const coreMemoryValue = 'nothing yet';

  const coreMemory = await db.select().from(env).where(eq(env.id, coreMemoryKey));

  if (coreMemory.length === 0) {
    await db.insert(env).values({ id: coreMemoryKey, value: coreMemoryValue });
  }
};
