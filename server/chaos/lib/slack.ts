import { slackKnownUsers } from '@/db/schema';
import db from '@/lib/db';
import { App, Assistant, LogLevel } from '@slack/bolt';
import { eq } from 'drizzle-orm';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_BOT_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.INFO,
});

const userStore: Record<string, string> = {};

export async function getUserInfo(userId: string) {
  if (userStore[userId]) {
    return userStore[userId];
  }

  if (userId === 'chaosbot') {
    return 'chaosbot';
  }

  try {
    const user = await app.client.users.info({ user: userId });
    userStore[userId] = user.user?.name || 'unknown';
    return userStore[userId];
  } catch (error) {
    console.error('Error getting user info', error);
    return 'unknown';
  }
}

export async function getUserByName(name: string) {
  if (userStore[name]) {
    return name; // the user sent in the id by mistake
  }
  for (const userKey of Object.keys(userStore)) {
    if (userStore[userKey] === name) {
      return userKey;
    }
  }

  return null;
}

export async function allUsersByName() {
  let store = [];
  for (const userKey of Object.keys(userStore)) {
    store.push({
      id: userKey,
      name: userStore[userKey],
    });
  }
  return store;
}

// load known users on boot
async function loadUsers() {
  const currentUsers = await db.select().from(slackKnownUsers);
  for (const user of currentUsers) {
    userStore[user.slackId] = user.name;
  }
}

loadUsers();

// Periodically store all users in the database
async function storeUsers() {
  const currentUsers = await db.select().from(slackKnownUsers);
  for (const user of currentUsers) {
    if (userStore[user.slackId] && userStore[user.slackId] !== user.name) {
      await db
        .update(slackKnownUsers)
        .set({ name: userStore[user.slackId] })
        .where(eq(slackKnownUsers.slackId, user.slackId))
        .execute();
    }
  }

  for (const userKey of Object.keys(userStore)) {
    if (!currentUsers.find((u) => u.slackId === userKey)) {
      await db
        .insert(slackKnownUsers)
        .values({ slackId: userKey, name: userStore[userKey] })
        .execute();
    }
  }

  setTimeout(storeUsers, 60 * 1000);
}

storeUsers();

export default app;
