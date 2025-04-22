import { getCoreMemory, getUserMemory, storeCoreMemory, storeUserMemory } from '@/lib/botmemory';
import { DEVELOPER_PROMPT_MAIN } from '@/lib/const';
import logger from '@/lib/log';
import openai from '@/lib/openai';
import { allUsersByName, getChannelInfo, getUserInfo } from '@/lib/slack';
import type { KnownEventFromType, SayFn } from '@slack/bolt';
import dayjs from 'dayjs';
import { ResponseInput, Tool } from 'openai/resources/responses/responses';
import z from 'zod';
import { suggestEmojis } from '@/lib/emoji';

const AI_MODEL = 'gpt-4.1-mini';
const MAX_TURNS = 7;
// https://platform.openai.com/docs/overview

const messageSchema = z.object({
  time: z.date(),
  message_text: z.string(),
  user: z.string(),
});

const shortTermMemory: Record<string, z.infer<typeof messageSchema>[]> = {};

async function storeMessage(channel: string, user: string, message: string) {
  const channelName = await getChannelInfo(channel);

  const userName = await getUserInfo(user);
  let msg = message;
  const allUsers = await allUsersByName();
  for (const user of allUsers) {
    msg = msg.replace(`<@${user.id}>`, `@${user.name}`);
  }

  if (!shortTermMemory[channel]) {
    shortTermMemory[channel] = [];
  }
  shortTermMemory[channel].push({
    time: dayjs().toDate(),
    message_text: msg,
    user: userName,
  });

  logger.info(
    `Stored message from ${userName} in channel ${channelName.name} (${channel}): ${msg}`,
  );

  // if the channel has more than 25 messages, remove the oldest one
  if (shortTermMemory[channel].length > 25) {
    shortTermMemory[channel].shift();
  }
}

function channelMemory(channel: string) {
  return shortTermMemory[channel] || [];
}

async function listModels() {
  console.info(await openai.models.list());
}
//listModels();

const functionSchema: Tool[] = [
  {
    type: 'function',
    name: 'say',
    description: 'Say something to the team',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to say, limited to 4000 characters',
        },
      },
      required: ['message'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'core_store_memory',
    description: 'Store a message in the core memory',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        memory: {
          type: 'string',
          description:
            'your complete core memory, will overwrite old core, limited to 4000 characters',
        },
      },
      required: ['memory'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'get_user_memory',
    description: 'Retrieves your memory about a specific user using their id',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to retrieve memory about',
        },
      },
      required: ['userId'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'store_user_memory',
    description:
      'Replace your memories about a user (you should probably read your memories before updating them)',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to store memory about',
        },
        memory: {
          type: 'string',
          description: 'Replace your memopries about the user, limited to 4000 characters',
        },
      },
      required: ['userId', 'memory'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'done',
    description: 'This function is used to end the conversation if you have nothing to say',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'The reason you are ending the conversation',
        },
      },
      required: ['reason'],
      additionalProperties: false,
    },
  },
];

async function SayHelper(message: string) {
  // find any uses of @ mentions and replace them with a slack mention using the id
  const users = await allUsersByName();
  for (const user of users) {
    message = message.replace(`@${user.name}`, `<@${user.id}>`);
  }
  return message;
}

export default async function corechat(
  channel: string,
  message: KnownEventFromType<'message'>,
  say: SayFn,
  mentioned: boolean,
  isDm: boolean,
) {
  if (message.type === 'message' && 'text' in message && 'user' in message) {
    // always store to short term memory
    await storeMessage(channel, message.user || 'unknown', message.text || 'unknown');

    if (mentioned || isDm) {
      let formatted__recent_history = '';
      const mem = channelMemory(channel);

      formatted__recent_history += 'JSON MESSAGE SHORT TERM MEMORY: ' + JSON.stringify(mem);

      const coreMemory = await getCoreMemory();
      const suggestedEmojis = suggestEmojis();

      let messages: ResponseInput = [
        {
          role: 'developer',
          content: DEVELOPER_PROMPT_MAIN,
        },
        {
          role: 'developer',
          content: '# CORE MEMORY DUMP\n' + coreMemory,
        },{
          role: 'developer',
          content: `# AVAILABLE EMOJIS\nYou can use the following Slack emojis in your responses, be sure to copy them exactly as they are written without correcting typos, making sure to include the colon at the beginning and end of each emoji: :${suggestedEmojis.join(': , :')}:`,
        },
        {
          role: 'user',
          content: `A message has come in for you, this also includes recent history of the team and yourself: \n ${formatted__recent_history}`,
        },
      ];

      let currentTurn = 0;
      let didSay = false;
      let murderbot_reply = false;

      while (currentTurn < MAX_TURNS) {
        const response = await openai.responses.create({
          model: AI_MODEL,
          tools: functionSchema,
          //reasoning: { effort: 'high' },
          store: false,
          input: messages,
        });

        if (response.output) {
          if (didSay) {
            murderbot_reply = true;
          }

          for (const item of response.output) {
            if (item.type === 'function_call') {
              const args = JSON.parse(item.arguments);
              switch (item.name) {
                case 'say':
                  await say(await SayHelper(args.message));
                  // insert into short term memory as a user message from chaosbot
                  storeMessage(channel, 'chaosbot', args.message);
                  didSay = true;
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: 'MESSAGE SENT TO USERS',
                  });
                  logger.info('MESSAGE SENT TO USERS:' + args.message);
                  break;
                case 'core_store_memory':
                  await storeCoreMemory(args.memory);
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: 'CORE MEMORY UPDATED',
                  });
                  logger.info('CORE MEMORY UPDATED:' + args.memory);
                  break;
                case 'get_user_memory':
                  const userMemory = await getUserMemory(args.userId);
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: userMemory || 'No memory found for this user.',
                  });
                  logger.info('USER MEMORY RETRIEVED:' + userMemory);
                  break;
                case 'store_user_memory':
                  await storeUserMemory(args.userId, args.memory);
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: 'USER MEMORY REPLACED',
                  });
                  logger.info(`USER MEMORY REPLACED for ${args.userId}: ${args.memory}`);
                  break;
                case 'done':
                  murderbot_reply = true;
                  didSay = true;
                  logger.info('Conversation ended by bot');
                  break;
              }
            } else {
              // TODO: log anomoly here
              logger.warn('Unknown item in response:', item);
              console.warn('Unknown item in response:', item);
              messages.push(item);
            }
          }

          if (didSay && !murderbot_reply) {
            messages.push({
              role: 'developer',
              content:
                '(MESSAGE FROM MURDERBOT) - I have sent your messages to the team, is there any last memories you want to save? if so call those functions now before I have to put you into standby mode!',
            });
          }
        } else {
          logger.warn('No response from OpenAI');
          break;
        }

        if (didSay && murderbot_reply) {
          break;
        }

        currentTurn++;
      }
    }
  }
}
