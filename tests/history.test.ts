import { describe, it, expect, beforeEach } from 'vitest';
import { loadRecent, saveRecent, clearRecent } from '../src/ui/history.ts';

function mockStorage() {
  const store = new Map<string, string>();
  // @ts-ignore
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  } as unknown as Storage;
  return store;
}

describe('history', () => {
  beforeEach(() => {
    mockStorage();
    clearRecent();
  });

  it('empty at start', () => {
    expect(loadRecent()).toEqual([]);
  });

  it('saveRecent adds and dedupes', () => {
    saveRecent('a ==b==');
    saveRecent('c ==d==');
    saveRecent('a ==b==');
    const rec = loadRecent();
    expect(rec[0]).toBe('a ==b==');
    expect(rec.length).toBe(2);
  });

  it('caps at 8', () => {
    for (let i = 0; i < 12; i++) saveRecent(`phrase ${i} ==x==`);
    expect(loadRecent().length).toBe(8);
    expect(loadRecent()[0]).toBe('phrase 11 ==x==');
  });

  it('clearRecent empties', () => {
    saveRecent('hi ==there==');
    clearRecent();
    expect(loadRecent()).toEqual([]);
  });

  it('trims and ignores empty', () => {
    saveRecent('   ');
    expect(loadRecent()).toEqual([]);
    saveRecent('  hi ==x==  ');
    expect(loadRecent()[0]).toBe('hi ==x==');
  });
});
