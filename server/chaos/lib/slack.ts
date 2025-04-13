import { prHistory, slackChannels, slackKnownUsers } from '@/db/schema';
import db from '@/lib/db';
import { quickAI } from '@/lib/openai';
import { App, LogLevel } from '@slack/bolt';
import { eq } from 'drizzle-orm';

import { PR_MERGED_PROMPT } from './const';
import logger from './log';

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

// channels

const channelStore: Record<string, string> = {};
const nonChannelStore: Record<string, string> = {}; // for DMs and other non-channel things

export async function getChannelInfo(channelId: string) {
  if (channelStore[channelId]) {
    return { name: channelStore[channelId], channel: true };
  }

  if (nonChannelStore[channelId]) {
    return { name: nonChannelStore[channelId], channel: false };
  }

  try {
    const channel = await app.client.conversations.info({ channel: channelId });
    if (channel.channel?.is_member && (channel.channel?.is_channel || channel.channel?.is_group)) {
      channelStore[channelId] = channel.channel?.name || 'unknown';
      return { name: channelStore[channelId], channel: true };
    } else {
      console.info('Channel not found', channelId);
      nonChannelStore[channelId] = channel.channel?.name || 'unknown';
      return { name: nonChannelStore[channelId], channel: false };
    }
  } catch (error) {
    console.error('Error getting channel info', error);
    return { name: 'unknown', channel: false };
  }
}

export async function channelByName(name: string) {
  for (const channelId of Object.keys(channelStore)) {
    if (channelStore[channelId] === name) {
      return channelId;
    }
  }
  return null;
}

export async function getAllChannels() {
  let store = [];
  for (const channelId of Object.keys(channelStore)) {
    store.push({
      id: channelId,
      name: channelStore[channelId],
    });
  }
  return store;
}

async function loadChannels() {
  const currentChannels = await db.select().from(slackChannels);
  for (const channel of currentChannels) {
    channelStore[channel.slackId] = channel.name;
  }
}

export async function storeChannels() {
  logger.info('Storing channels');
  const channels = await getAllChannels();
  const currentChannels = await db.select().from(slackChannels);

  for (const channel of channels) {
    if (!currentChannels.find((c) => c.slackId === channel.id)) {
      await db
        .insert(slackChannels)
        .values({
          slackId: channel.id,
          name: channel.name,
        })
        .execute();
    } else {
      await db
        .update(slackChannels)
        .set({ name: channel.name })
        .where(eq(slackChannels.slackId, channel.id))
        .execute();
    }
  }

  setTimeout(storeChannels, 60 * 1000);
}

// slack boot sequence

async function boot() {
  await loadUsers();
  await loadChannels();

  // announce coming online
  const announceChannel = process.env.SLACK_ANNOUNCE_CHANNEL;
  if (announceChannel) {
    const channelInfo = await channelByName(announceChannel);
    if (channelInfo) {
      const prsToAnnounce = await db.select().from(prHistory).where(eq(prHistory.announced, 0));

      if (prsToAnnounce.length > 0) {
        logger.info(`Announcing ${prsToAnnounce.length} PRs to ${announceChannel}`);
      } else {
        logger.info('No PRs to announce');
      }

      for (const pr of prsToAnnounce) {
        const message = await quickAI(
          PR_MERGED_PROMPT({ title: pr.title, author: pr.authorLogin }),
        );

        await app.client.chat.postMessage({
          channel: channelInfo,
          text: message || '',
        });

        logger.info(`Announced ${pr.title} to ${announceChannel}: ${message}`);

        await db.update(prHistory).set({ announced: 1 }).where(eq(prHistory.id, pr.id)).execute();
      }
    } else {
      logger.warn(`Announce channel ${announceChannel} not found`);
    }
  } else {
    logger.warn('No announce channel set, skipping');
  }

  await storeUsers();
  await storeChannels();
}

boot();

export default app;
