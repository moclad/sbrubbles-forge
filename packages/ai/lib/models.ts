import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

import { keys } from '../keys';

const anthropic = createAnthropic({
  apiKey: keys().ANTHROPIC_API_KEY ?? '',
});

const openai = createOpenAI({
  apiKey: keys().OPENAI_API_KEY ?? '',
});

export const models = {
  chat: anthropic('claude-haiku-4-5'), //claude-3-haiku-20240307
  embeddings: openai('text-embedding-3-small'), // Claude doesn't have embeddings, keeping OpenAI for this
};
