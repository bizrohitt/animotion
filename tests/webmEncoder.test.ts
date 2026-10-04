import { describe, it, expect, afterEach } from 'vitest';
import { isWebMSupported } from '../src/encode/webmEncoder.ts';
import { pickEncoder } from '../src/encode/pickEncoder.ts';

describe('webmEncoder feature-detect', () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;
  const originalDocument = (globalThis as unknown as { document?: unknown }).document;
  const originalMediaRecorder = (globalThis as unknown as { MediaRecorder?: unknown })
    .MediaRecorder;

  afterEach(() => {
    (globalThis as unknown as { window: unknown }).window = originalWindow as Window;
    (globalThis as unknown as { document: unknown }).document = originalDocument as Document;
    (globalThis as unknown as { MediaRecorder: unknown }).MediaRecorder =
      originalMediaRecorder as typeof MediaRecorder;
    const w = (globalThis as unknown as { window?: { MediaRecorder?: unknown } }).window;
    if (w) delete (w as unknown as { MediaRecorder?: unknown }).MediaRecorder;
  });

  it('isWebMSupported false in node (no window)', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(isWebMSupported()).toBe(false);
  });

  it('isWebMSupported true when MediaRecorder mocked as supported', () => {
    const fakeMR = { isTypeSupported: () => true } as unknown as typeof MediaRecorder;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (globalThis as unknown as { window: unknown }).window = {
      MediaRecorder: fakeMR,
    } as unknown as Window;
    expect(isWebMSupported()).toBe(true);
  });

  it('pickEncoder throws when unsupported', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => pickEncoder()).toThrow(/No supported encoder/);
  });

  it('pickEncoder returns webm when supported', () => {
    const fakeMR = { isTypeSupported: () => true } as unknown as typeof MediaRecorder;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (globalThis as unknown as { window: unknown }).window = {
      MediaRecorder: fakeMR,
    } as unknown as Window;
    const pick = pickEncoder();
    expect(pick.mimeType).toBe('video/webm');
    expect(pick.ext).toBe('webm');
    expect(typeof pick.fn).toBe('function');
  });
});

describe('encodeWebM throws on unsupported', () => {
  it('throws when MediaRecorder not supported', async () => {
    const { encodeWebM } = await import('../src/encode/webmEncoder.ts');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as unknown as { window?: unknown }).window;
    await expect(
      encodeWebM(
        [],
        { raw: '', fullPhrase: '', focalWord: '', focalStart: 0, focalEnd: 0 },
        { dims: { width: 1080, height: 1920, aspect: '9:16' }, fps: 12 },
      ),
    ).rejects.toThrow(/not supported/);
  });
});
