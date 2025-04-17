import { z } from 'zod';
import { slackEmojis } from './emojis';

// Schema for validating emoji suggestions
export const emojiSuggestionSchema = z.object({
  emojis: z.array(z.string()),
});

export type EmojiSuggestion = z.infer<typeof emojiSuggestionSchema>;

/**
 * Suggests a random subset of emojis that could be used in responses
 * @param count Number of emojis to suggest (default: 50)
 * @returns Array of emoji names
 */
export function suggestEmojis(count: number = 50): string[] {
  // Shuffle the array and take the first 'count' elements
  const shuffled = [...slackEmojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Validates and processes emoji suggestions
 * @param emojis Array of emoji names to validate
 * @returns Validated emoji suggestions
 */
export function validateEmojiSuggestions(emojis: string[]): EmojiSuggestion {
  return emojiSuggestionSchema.parse({ emojis });
} 