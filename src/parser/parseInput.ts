import type { ParseResult, ParsedInput } from '../types.ts';
import { LIMITS } from '../config.ts';

export function parseInput(raw: string): ParseResult {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Input must be a string.' };
  }

  // Count marker occurrences
  const markerCount = (raw.match(/==/g) ?? []).length;

  if (markerCount === 0) {
    return {
      ok: false,
      error: 'No highlighted word found. Wrap one word with ==word==.',
    };
  }

  if (markerCount !== 2) {
    // Either multiple words or malformed
    const matches = [...raw.matchAll(/==(.+?)==/g)];
    if (matches.length > 1) {
      return { ok: false, error: 'Only one highlighted word allowed.' };
    }
    return { ok: false, error: 'Malformed highlight markers. Use exactly ==word==.' };
  }

  const match = [...raw.matchAll(/==(.+?)==/g)][0];
  if (!match || match.index === undefined) {
    return { ok: false, error: 'Malformed highlight markers. Use exactly ==word==.' };
  }

  const inside = match[1] ?? '';
  const focalWord = inside.trim();

  if (focalWord.length === 0) {
    return { ok: false, error: 'Highlighted text cannot be empty.' };
  }

  if (focalWord.length > LIMITS.focalMaxChars) {
    return {
      ok: false,
      error: `Highlighted text must be ≤${LIMITS.focalMaxChars} characters (got ${focalWord.length}).`,
    };
  }

  const before = raw.slice(0, match.index);
  const after = raw.slice(match.index + match[0].length);
  const fullPhrase = before + focalWord + after;

  // Ensure no leftover markers
  if (fullPhrase.includes('==')) {
    return { ok: false, error: 'Malformed highlight markers. Use exactly ==word==.' };
  }

  const focalStart = before.length;
  const focalEnd = focalStart + focalWord.length;

  const parsed: ParsedInput = {
    raw,
    fullPhrase,
    focalWord,
    focalStart,
    focalEnd,
  };

  return { ok: true, parsed };
}

// Helper for future word-select wrapping (used in T-011, exposed now for testability)
export function wrapWordWithMarkers(phrase: string, start: number, end: number): string {
  const before = phrase.slice(0, start);
  const word = phrase.slice(start, end);
  const after = phrase.slice(end);
  if (word.includes('==')) return phrase;
  return `${before}==${word}==${after}`;
}

export function unwrapMarkers(raw: string): string {
  return raw.replace(/==/g, '');
}

export function getFocalLength(raw: string): number {
  const res = parseInput(raw);
  return res.ok ? res.parsed.focalWord.length : 0;
}
