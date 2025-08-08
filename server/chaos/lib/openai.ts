import OpenAI from 'openai';

/** Assistant */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function quickAI(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.choices[0].message.content;
}

export default openai;
