import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildShareURL, getPhraseFromURL, setPhraseInURL } from '../src/ui/share.ts';

describe('share deep-link', () => {
  beforeEach(() => {
    // mock window.location and history
    delete (globalThis as unknown as { window: unknown }).window;
    (globalThis as unknown as { window: Window }).window = globalThis as unknown as Window;
    const url = new URL('https://example.com/');
    Object.defineProperty(window, 'location', {
      value: url,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'history', {
      value: { replaceState: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  it('buildShareURL encodes phrase', () => {
    const u = buildShareURL('Markets ==TACO==', 'https://example.com/');
    expect(u).toContain('phrase=');
    expect(new URL(u).searchParams.get('phrase')).toBe('Markets ==TACO==');
  });

  it('buildShareURL removes empty', () => {
    const u = buildShareURL('   ', 'https://example.com/?phrase=old');
    expect(u).not.toContain('phrase=');
  });

  it('getPhraseFromURL reads param', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com/?phrase=hello%20%3D%3DTACO%3D%3D'),
      writable: true,
      configurable: true,
    });
    expect(getPhraseFromURL()).toBe('hello ==TACO==');
  });

  it('setPhraseInURL calls replaceState', () => {
    const spy = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { replaceState: spy },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com/'),
      writable: true,
      configurable: true,
    });
    setPhraseInURL('hi ==there==');
    expect(spy).toHaveBeenCalled();
  });
});
