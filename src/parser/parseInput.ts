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

export function wrapWordWithMarkers(phrase: string, start: number, end: number): string {
  const before = phrase.slice(0, start);
  const word = phrase.slice(start, end);
  const after = phrase.slice(end);
  if (word.includes('==')) return phrase;
  if (word.trim().length === 0) return phrase;
  if (word.trim().length > LIMITS.focalMaxChars) return phrase;
  return `${before}==${word.trim()}==${after}`;
}

export function unwrapMarkers(raw: string): string {
  return raw.replace(/==/g, '');
}

export function getFocalLength(raw: string): number {
  const res = parseInput(raw);
  return res.ok ? res.parsed.focalWord.length : 0;
}

export function extractFocal(raw: string): string | null {
  const r = parseInput(raw);
  return r.ok ? r.parsed.focalWord : null;
}

export function validateLength(focal: string): { ok: boolean; error?: string } {
  const t = focal.trim();
  if (t.length === 0) return { ok: false, error: 'Focal text cannot be empty.' };
  if (t.length > LIMITS.focalMaxChars)
    return {
      ok: false,
      error: `Focal text must be ≤${LIMITS.focalMaxChars} characters (got ${t.length}).`,
    };
  return { ok: true };
}

export function sanitizeInput(raw: string): string {
  // Trim outer whitespace and collapse inner multiple spaces (preserve markers)
  return raw.trim().replace(/\s{2,}/g, ' ');
}

/**
 * Toggle == markers around a selection.
 * - If raw already has a highlight and selection overlaps it, unwrap.
 * - Otherwise, wrap the selected substring.
 * Selection indices are in raw string coordinates.
 */
export function toggleMarkers(raw: string, start: number, end: number): string {
  if (start === end) return raw;
  const hasMarkers = raw.includes('==');
  if (hasMarkers) {
    const res = parseInput(raw);
    if (res.ok) {
      const m = [...raw.matchAll(/==(.+?)==/g)][0];
      if (m && m.index !== undefined) {
        const open = m.index;
        const close = open + m[0].length;
        // Overlaps the highlighted region (including markers)
        if (start < close && end > open) {
          return unwrapMarkers(raw);
        }
      }
    }
    // Has markers but selection does not overlap — do not double-wrap
    return raw;
  }
  // No markers: wrap selection
  return wrapWordWithMarkers(raw, start, end);
}
