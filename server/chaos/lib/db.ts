import 'dotenv/config';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.DB_FILE_NAME!,
});

const db = drizzle(client);

export default db;
