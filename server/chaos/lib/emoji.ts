import { slackEmojis } from './emojis';
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