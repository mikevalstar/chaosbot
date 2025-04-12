import OpenAI from 'openai';

/** Assistant */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
