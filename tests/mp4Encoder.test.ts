import { describe, it, expect, afterEach } from 'vitest';
import { isMP4Supported } from '../src/encode/mp4Encoder.ts';
import { pickEncoder } from '../src/encode/pickEncoder.ts';

describe('mp4Encoder feature-detect', () => {
  const origWindow = (globalThis as unknown as { window?: unknown }).window;

  afterEach(() => {
    (globalThis as unknown as { window: unknown }).window = origWindow as Window;
  });

  it('isMP4Supported false in node', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(isMP4Supported()).toBe(false);
  });

  it('isMP4Supported true when mocked VideoEncoder and AudioEncoder', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (globalThis as unknown as { window: unknown }).window = {
      VideoEncoder: class {},
      AudioEncoder: class {},
    } as unknown as Window;
    expect(isMP4Supported()).toBe(true);
  });

  it('pickEncoder prefers MP4 when WebCodecs available', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (globalThis as unknown as { window: unknown }).window = {
      VideoEncoder: class {},
      AudioEncoder: class {},
      MediaRecorder: { isTypeSupported: () => true },
    } as unknown as Window;
    const pick = pickEncoder();
    expect(pick.mimeType).toBe('video/mp4');
    expect(pick.ext).toBe('mp4');
  });

  it('pickEncoder falls back to WebM when only MediaRecorder', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (globalThis as unknown as { window: unknown }).window = {
      MediaRecorder: { isTypeSupported: () => true },
    } as unknown as Window;
    const pick = pickEncoder();
    expect(pick.mimeType).toBe('video/webm');
  });

  it('pickEncoder throws when none supported', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as unknown as { window: unknown }).window;
    expect(() => pickEncoder()).toThrow(/No supported encoder/);
  });
});

describe('encodeMP4 throws on unsupported', () => {
  it('throws when WebCodecs absent', async () => {
    const { encodeMP4 } = await import('../src/encode/mp4Encoder.ts');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete (globalThis as unknown as { window: unknown }).window;
    await expect(
      encodeMP4(
        [],
        { raw: '', fullPhrase: '', focalWord: '', focalStart: 0, focalEnd: 0 },
        { dims: { width: 1080, height: 1920, aspect: '9:16' }, fps: 12 },
      ),
    ).rejects.toThrow(/WebCodecs not supported/);
  });
});
