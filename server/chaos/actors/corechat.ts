import { getCoreMemory, getUserMemory, storeCoreMemory, storeUserMemory } from '@/lib/botmemory';
import { DEVELOPER_PROMPT_MAIN } from '@/lib/const';
import openai from '@/lib/openai';
import type { KnownEventFromType, SayFn } from '@slack/bolt';
import dayjs from 'dayjs';
import { ResponseInput, Tool } from 'openai/resources/responses/responses';
import z from 'zod';

const AI_MODEL = 'gpt-4o-mini';
const MAX_TURNS = 5;
// https://platform.openai.com/docs/overview

const messageSchema = z.object({
  time: z.date(),
  text: z.string(),
  user: z.string(),
});

const shortTermMemory: Record<string, z.infer<typeof messageSchema>[]> = {};

function storeMessage(channel: string, user: string, message: string) {
  if (!shortTermMemory[channel]) {
    shortTermMemory[channel] = [];
  }
  shortTermMemory[channel].push({
    time: dayjs().toDate(),
    text: message,
    user,
  });

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
    description: 'Retrieves your memory about a specific user',
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
];

interface inputMessage {
  role: 'developer' | 'user';
  content: string;
}

interface functionCallOutput {
  type: 'function_call_output';
  call_id: string;
  output: string;
}

interface functionCall {
  type: 'function_call';
  call_id: string;
  name: string;
  arguments: string;
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
    storeMessage(channel, message.user || 'unknown', message.text || 'unknown');
    if (mentioned || isDm) {
      let formatted__recent_history = '';
      for (const message of channelMemory(channel)) {
        formatted__recent_history += `
        _${message.user} (${dayjs(message.time).format('YYYY-MM-DD HH:mm')}):_ ${message.text}
        `;
      }

      const coreMemory = await getCoreMemory();

      let messages: (inputMessage | functionCall | functionCallOutput)[] = [
        {
          role: 'developer',
          content: DEVELOPER_PROMPT_MAIN,
        },
        {
          role: 'developer',
          content: '# CORE MEMORY DUMP\n' + coreMemory,
        },
        {
          role: 'user',
          content: `A message has come in for you: \n ${formatted__recent_history}`,
        },
      ];

      let currentTurn = 0;
      let didSay = false;
      let murderbot_reply = false;

      while (currentTurn < MAX_TURNS) {
        console.log('messages', messages);
        const response = await openai.responses.create({
          model: AI_MODEL,
          tools: functionSchema,
          //reasoning: { effort: 'medium' },
          store: false,
          input: messages,
        });

        if (response.output) {
          if (didSay) {
            murderbot_reply = true;
          }

          console.info(response.output);
          for (const item of response.output) {
            if (item.type === 'function_call') {
              const args = JSON.parse(item.arguments);
              switch (item.name) {
                case 'say':
                  await say(args.message);
                  // insert into short term memory as a user message from chaosbot
                  storeMessage(channel, 'chaosbot', args.message);
                  didSay = true;
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: 'MESSAGE SENT TO USERS',
                  });
                  break;
                case 'core_store_memory':
                  await storeCoreMemory(args.memory);
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: 'CORE MEMORY UPDATED',
                  });
                  console.info('CORE MEMORY UPDATED:' + args.memory);
                  break;
                case 'get_user_memory':
                  const userMemory = await getUserMemory(args.userId);
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: userMemory || 'No memory found for this user.',
                  });
                  break;
                case 'store_user_memory':
                  await storeUserMemory(args.userId, args.memory);
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.call_id || 'unknown',
                    output: 'USER MEMORY REPLACED',
                  });
                  console.info(`USER MEMORY REPLACED for ${args.userId}: ${args.memory}`);
                  break;
              }
            } else {
              // TODO: log anomoly here
              console.warn('Unknown item in response:', item);
              messages.push(item);
            }
          }

          if (didSay && !murderbot_reply) {
            messages.push({
              role: 'developer',
              content:
                '(MESSAGE FROM MURDERBOT) - I have sent your messages to the team, is theer any last memories you want to save? if so call those functions now before I have to put you into standby mode!',
            });
          }
        } else {
          console.warn('No response from OpenAI');
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
