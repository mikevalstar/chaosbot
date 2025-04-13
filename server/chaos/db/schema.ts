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

export const slackChannels = sqliteTable('slack_channels', {
  id: int().primaryKey({ autoIncrement: true }),
  slackId: text().notNull(),
  name: text().notNull(),
});

export const prHistory = sqliteTable('pr_history', {
  id: int().primaryKey(),
  prId: int().notNull(),
  title: text().notNull(),
  url: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
  authorAssociation: text().notNull(),
  authorLogin: text().notNull(),
  authorAvatarUrl: text(),
  authorUrl: text(),
  state: text().notNull(),
  fromBranch: text().notNull(),
  toBranch: text().notNull(),
  announced: int().default(0),
});
