import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const env = sqliteTable('bot_env', {
  id: text().primaryKey(),
  value: text().notNull(),
});

export const people = sqliteTable('people', {
  id: int().primaryKey({ autoIncrement: true }),
  slackId: text().notNull(),
  name: text().notNull(),
  keyInfo: text().notNull(),
});

export const slackKnownUsers = sqliteTable('slack_known_users', {
  id: int().primaryKey({ autoIncrement: true }),
  slackId: text().notNull(),
  name: text().notNull(),
});
