import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// M3: integration smoke — quality param drives bitrate (fixes 1:1 4K bug), mocked WebCodecs path
// Does not test real MP4 bytes (needs browser VideoEncoder), but verifies configure bitrate via spy.

const MockVideoEncoderInstances: unknown[] = [];
const MockAudioEncoderInstances: unknown[] = [];

type ConfigureOpts = { bitrate?: number; width?: number; height?: number };

vi.mock('mp4-muxer', () => {
  return {
    ArrayBufferTarget: class {
      buffer = new ArrayBuffer(8);
    },
    Muxer: class {
      constructor(_opts: unknown) {}
      addVideoChunk() {}
      addAudioChunk() {}
      finalize() {}
    },
  };
});

function installMocks() {
  MockVideoEncoderInstances.length = 0;
  MockAudioEncoderInstances.length = 0;

  class MockVideoEncoder {
    configureOpts: ConfigureOpts | null = null;
    configure(o: ConfigureOpts) {
      this.configureOpts = o;
      MockVideoEncoderInstances.push(this);
    }
    encode() {}
    async flush() {}
    close() {}
  }
  class MockAudioEncoder {
    configureOpts: ConfigureOpts | null = null;
    configure(o: ConfigureOpts) {
      this.configureOpts = o;
      MockAudioEncoderInstances.push(this);
    }
    encode() {}
    async flush() {}
    close() {}
  }
  class MockVideoFrame {
    constructor(_src: unknown, _opts: unknown) {}
    close() {}
  }
  class MockAudioData {
    constructor(_opts: unknown) {}
    close() {}
  }

  // window feature-detect reads window.VideoEncoder/AudioEncoder
  (globalThis as unknown as { window: unknown }).window = {
    VideoEncoder: MockVideoEncoder as unknown as typeof VideoEncoder,
    AudioEncoder: MockAudioEncoder as unknown as typeof AudioEncoder,
    MediaRecorder: { isTypeSupported: () => false },
  } as unknown as Window;

  // also global for `VideoEncoder` direct reference in mp4Encoder
  (globalThis as unknown as { VideoEncoder: unknown }).VideoEncoder =
    MockVideoEncoder as unknown as typeof VideoEncoder;
  (globalThis as unknown as { AudioEncoder: unknown }).AudioEncoder =
    MockAudioEncoder as unknown as typeof AudioEncoder;
  (globalThis as unknown as { VideoFrame: unknown }).VideoFrame =
    MockVideoFrame as unknown as typeof VideoFrame;
  (globalThis as unknown as { AudioData: unknown }).AudioData =
    MockAudioData as unknown as typeof AudioData;
  (globalThis as unknown as { OffscreenCanvas: unknown }).OffscreenCanvas = class {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return {
        save() {},
        restore() {},
        clearRect() {},
        fillRect() {},
        fillText() {},
        strokeRect() {},
        rect() {},
        roundRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        quadraticCurveTo() {},
        closePath() {},
        stroke() {},
        fill() {},
        translate() {},
        rotate() {},
        scale() {},
        setTransform() {},
        drawImage() {},
        clip() {},
        measureText: () => ({ width: 50 }),
        createPattern: () => null,
      };
    }
  } as unknown as typeof OffscreenCanvas;
}

describe('encode quality integration (M3)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let origWindow: any;
  let origVE: unknown;
  let origAE: unknown;
  let origVF: unknown;
  let origAD: unknown;
  let origOC: unknown;

  beforeEach(() => {
    origWindow = (globalThis as unknown as { window?: unknown }).window;
    origVE = (globalThis as unknown as { VideoEncoder?: unknown }).VideoEncoder;
    origAE = (globalThis as unknown as { AudioEncoder?: unknown }).AudioEncoder;
    origVF = (globalThis as unknown as { VideoFrame?: unknown }).VideoFrame;
    origAD = (globalThis as unknown as { AudioData?: unknown }).AudioData;
    origOC = (globalThis as unknown as { OffscreenCanvas?: unknown }).OffscreenCanvas;
    installMocks();
  });

  afterEach(() => {
    (globalThis as unknown as { window: unknown }).window = origWindow;
    (globalThis as unknown as { VideoEncoder: unknown }).VideoEncoder = origVE as typeof VideoEncoder;
    (globalThis as unknown as { AudioEncoder: unknown }).AudioEncoder = origAE as typeof AudioEncoder;
    (globalThis as unknown as { VideoFrame: unknown }).VideoFrame = origVF as typeof VideoFrame;
    (globalThis as unknown as { AudioData: unknown }).AudioData = origAD as typeof AudioData;
    (globalThis as unknown as { OffscreenCanvas: unknown }).OffscreenCanvas = origOC as typeof OffscreenCanvas;
    vi.clearAllMocks();
  });

  it('4K quality -> 16 Mbps even for 1:1 2160 supremacy', async () => {
    const { encodeMP4 } = await import('../src/encode/mp4Encoder.ts');
    const timeline = [
      {
        index: 0,
        timestampMs: 0,
        durationMs: 83,
        fontFamily: '"Playfair Display", serif',
        fontWeight: 400,
        paperStyle: { id: 'cream', tint: '#f2e8d5', grain: 0.12 },
        rotation: 0,
        highlightStyle: 'marker' as const,
        fillerLines: [],
        zoom: 1,
        blur: 0,
      },
    ];
    const parsed = { raw: '==hi==', fullPhrase: 'hi', focalWord: 'hi', focalStart: 0, focalEnd: 2 };
    await encodeMP4(timeline as unknown as [], parsed as unknown as never, {
      dims: { width: 2160, height: 2160, aspect: '1:1' },
      fps: 12,
      quality: '4K',
    });
    // last VideoEncoder instance should have configure bitrate 16M
    const inst = MockVideoEncoderInstances[MockVideoEncoderInstances.length - 1] as {
      configureOpts: ConfigureOpts;
    };
    expect(inst?.configureOpts?.bitrate).toBe(16_000_000);
    expect(inst?.configureOpts?.width).toBe(2160);
  });

  it('720p quality -> 2.5 Mbps', async () => {
    const { encodeMP4 } = await import('../src/encode/mp4Encoder.ts');
    const timeline = [
      {
        index: 0,
        timestampMs: 0,
        durationMs: 83,
        fontFamily: '"Playfair Display", serif',
        fontWeight: 400,
        paperStyle: { id: 'cream', tint: '#f2e8d5', grain: 0.12 },
        rotation: 0,
        highlightStyle: 'marker' as const,
        fillerLines: [],
        zoom: 1,
        blur: 0,
      },
    ];
    const parsed = { raw: '==hi==', fullPhrase: 'hi', focalWord: 'hi', focalStart: 0, focalEnd: 2 };
    MockVideoEncoderInstances.length = 0;
    await encodeMP4(timeline as unknown as [], parsed as unknown as never, {
      dims: { width: 720, height: 1280, aspect: '9:16' },
      fps: 12,
      quality: '720p',
    });
    const inst = MockVideoEncoderInstances[MockVideoEncoderInstances.length - 1] as {
      configureOpts: ConfigureOpts;
    };
    expect(inst?.configureOpts?.bitrate).toBe(2_500_000);
  });
});
