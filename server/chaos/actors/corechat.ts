import { env } from '@/db/schema';
import { DEVELOPER_PROMPT_MAIN } from '@/lib/const';
import db from '@/lib/db';
import openai from '@/lib/openai';
import type { KnownEventFromType, SayFn } from '@slack/bolt';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { Tool } from 'openai/resources/responses/responses';
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

async function getCoreMemory() {
  const coreMemory = await db.select().from(env).where(eq(env.id, 'core_memory'));
  return coreMemory[0].value;
}

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

      while (currentTurn < MAX_TURNS) {
        const response = await openai.responses.create({
          model: AI_MODEL,
          tools: functionSchema,
          //reasoning: { effort: 'medium' },
          store: false,
          input: messages,
        });

        if (response.output) {
          console.info(response.output);
          for (const item of response.output) {
            if (item.type === 'function_call') {
              const args = JSON.parse(item.arguments);
              switch (item.name) {
                case 'say':
                  await say(args.message);
                  didSay = true;
                  break;
                case 'core_store_memory':
                  await db.update(env).set({ value: args.memory }).where(eq(env.id, 'core_memory'));
                  messages.push(item);
                  messages.push({
                    type: 'function_call_output',
                    call_id: item.id || 'unknown',
                    output: 'CORE MEMORY UPDATED',
                  });
                  console.info('CORE MEMORY UPDATED:' + args.memory);
                  break;
              }
            } else {
              // TODO: log anomoly here
            }
          }
        } else {
          console.warn('No response from OpenAI');
          break;
        }

        if (didSay) {
          break;
        }

        currentTurn++;
      }
    }
  }
}
