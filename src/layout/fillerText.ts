// src/layout/fillerText.ts — filler sentences, word bank, and generator

import type { RNG } from '../types.ts';

export const FILLER_SENTENCES: string[] = [
  'Markets closed higher on steady volume.',
  'Analysts warned of volatility ahead.',
  'Officials met to discuss the proposal.',
  'The report cites a sharp increase in demand.',
  'Investors await the quarterly results.',
  'A new study highlights the trend.',
  'Traders reacted to the morning headlines.',
  'The committee approved the measure by a narrow margin.',
  'Economists forecast a modest recovery.',
  'Local leaders announced a joint initiative.',
  'The survey found broad public support.',
  'Shares fluctuated throughout the session.',
  'The agency released its annual review.',
  'Experts debated the policy in a forum.',
  'The forecast points to continued growth.',
  'Companies reported stronger than expected earnings.',
  'The mayor outlined a plan for the district.',
  'Researchers noted a pattern in the data.',
  'The edition went to press before midnight.',
  'Editors reviewed the final copy for errors.',
  'The front page carried the breaking story.',
  'Correspondents filed updates from the scene.',
  'The bulletin was printed on recycled paper.',
  'Readers queued for the morning edition.',
  'The headline drew attention on newsstands.',
  'Archives hold decades of printed history.',
  'The press run finished ahead of schedule.',
  'Circulation rose for the third week in a row.',
  'The column offered a different perspective.',
  'The article quoted several independent sources.',
  'The story continued on page four.',
  'Late wires added a final correction.',
];

export const FILLER_WORDS: string[] = [
  'market',
  'report',
  'analysis',
  'policy',
  'economy',
  'trade',
  'growth',
  'forecast',
  'record',
  'update',
  'brief',
  'press',
  'edition',
  'column',
  'source',
  'data',
  'survey',
  'trend',
  'volume',
  'session',
  'review',
  'measure',
  'plan',
  'study',
];

export const SAMPLE_PHRASES: string[] = [
  'Breaking news from the wire.',
  'Extra edition now on sale.',
  'Daily bulletin for subscribers.',
];

/**
 * Generate filler lines deterministically via RNG.
 * - No line repeats consecutively within the returned array.
 * - If avgWords provided, each line will have word count within ±2 of it.
 * - If avgWords omitted, each line is a random sentence from FILLER_SENTENCES.
 */
export function generateFillerLines(rng: RNG, count: number, avgWords?: number): string[] {
  if (count <= 0) return [];
  const out: string[] = [];
  let prev = '';
  for (let i = 0; i < count; i++) {
    let line: string;
    if (avgWords !== undefined) {
      const target = Math.max(3, avgWords + (rng.nextInt(5) - 2)); // ±2
      const words: string[] = [];
      while (words.length < target) {
        const w = FILLER_WORDS[rng.nextInt(FILLER_WORDS.length)];
        words.push(w);
      }
      // capitalize first
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      line = words.join(' ') + '.';
      // avoid repeat
      let guard = 0;
      while (line === prev && guard < 10) {
        // mutate last word
        words[words.length - 1] = FILLER_WORDS[rng.nextInt(FILLER_WORDS.length)];
        line = words.join(' ') + '.';
        if (words[0]) words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        guard++;
      }
    } else {
      let guard = 0;
      do {
        const idx = rng.nextInt(FILLER_SENTENCES.length);
        line = FILLER_SENTENCES[idx];
        guard++;
      } while (line === prev && guard < 20);
    }
    out.push(line);
    prev = line;
  }
  return out;
}
