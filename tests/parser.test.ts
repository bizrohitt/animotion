import { describe, it, expect } from 'vitest';
import {
  parseInput,
  wrapWordWithMarkers,
  unwrapMarkers,
  getFocalLength,
} from '../src/parser/parseInput.ts';

describe('parseInput', () => {
  it('parses simple ==word== at end', () => {
    const r = parseInput('hello ==world==');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.parsed.focalWord).toBe('world');
      expect(r.parsed.fullPhrase).toBe('hello world');
      expect(r.parsed.focalStart).toBe(6);
      expect(r.parsed.focalEnd).toBe(11);
    }
  });

  it('parses ==word== at start', () => {
    const r = parseInput('==TACO== is tasty');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.parsed.focalWord).toBe('TACO');
      expect(r.parsed.fullPhrase).toBe('TACO is tasty');
      expect(r.parsed.focalStart).toBe(0);
    }
  });

  it('parses middle ==word== with punctuation', () => {
    const r = parseInput('Markets jittery. ==TACO again==.');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.parsed.focalWord).toBe('TACO again');
      expect(r.parsed.fullPhrase).toBe('Markets jittery. TACO again.');
      expect(r.parsed.focalWord.length).toBeLessThanOrEqual(23);
    }
  });

  it('parses single word exactly 23 chars', () => {
    const word = 'A'.repeat(23);
    const r = parseInput(`==${word}==`);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.parsed.focalWord.length).toBe(23);
  });

  it('rejects >23 chars', () => {
    const word = 'B'.repeat(24);
    const r = parseInput(`==${word}==`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/≤23/);
  });

  it('rejects empty focal == ==', () => {
    const r = parseInput('hello == == world');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/cannot be empty/i);
  });

  it('rejects empty ======', () => {
    const r = parseInput('====');
    expect(r.ok).toBe(false);
  });

  it('rejects no marker', () => {
    const r = parseInput('hello world');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/No highlighted word/);
  });

  it('rejects two markers', () => {
    const r = parseInput('==hello== and ==world==');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Only one highlighted word/);
  });

  it('rejects three markers count !=2', () => {
    const r = parseInput('==a== b ==c');
    expect(r.ok).toBe(false);
  });

  it('rejects malformed single == without closing', () => {
    const r = parseInput('hello ==world');
    expect(r.ok).toBe(false);
  });

  it('trims spaces inside markers', () => {
    const r = parseInput('hello ==  world  ==');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.parsed.focalWord).toBe('world');
  });

  it('handles unicode focal', () => {
    const r = parseInput('say ==café== now');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.parsed.focalWord).toBe('café');
  });

  it('handles numbers and symbols', () => {
    const r = parseInput('price ==$42== today');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.parsed.focalWord).toBe('$42');
  });

  it('rejects whitespace-only focal', () => {
    const r = parseInput('==   ==');
    expect(r.ok).toBe(false);
  });

  it('preserves fullPhrase correctly with before/after', () => {
    const r = parseInput('A ==B== C');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.parsed.fullPhrase).toBe('A B C');
      expect(r.parsed.focalStart).toBe(2);
      expect(r.parsed.focalEnd).toBe(3);
    }
  });

  it('counts focal length correctly', () => {
    expect(getFocalLength('hello ==world==')).toBe(5);
    expect(getFocalLength('hello world')).toBe(0);
    expect(getFocalLength('==12345678901234567890123==')).toBe(23);
  });

  it('wrapWordWithMarkers wraps selection', () => {
    const phrase = 'hello world';
    const wrapped = wrapWordWithMarkers(phrase, 6, 11);
    expect(wrapped).toBe('hello ==world==');
    const parsed = parseInput(wrapped);
    expect(parsed.ok).toBe(true);
  });

  it('wrapWordWithMarkers avoids double wrapping if already has ==', () => {
    const phrase = 'hello ==world==';
    expect(wrapWordWithMarkers(phrase, 6, 8)).toBe(phrase);
  });

  it('unwrapMarkers removes ==', () => {
    expect(unwrapMarkers('a ==b== c')).toBe('a b c');
  });

  it('leftover == in fullPhrase is error', () => {
    // raw has 2 markers but inside word contains ==? impossible, but test stray
    const r = parseInput('==hello== world ==');
    expect(r.ok).toBe(false);
  });
});
