import { describe, it, expect } from 'vitest';
import { getBitrateForQuality, getExportDims, EXPORT_DIMS } from '../src/config.ts';

describe('getBitrateForQuality (C1 fix)', () => {
  it('720p -> 2.5 Mbps', () => expect(getBitrateForQuality('720p')).toBe(2_500_000));
  it('1080p -> 6 Mbps', () => expect(getBitrateForQuality('1080p')).toBe(6_000_000));
  it('4K -> 16 Mbps', () => expect(getBitrateForQuality('4K')).toBe(16_000_000));
});

describe('getExportDims (HD/FHD/4K table)', () => {
  it('720p dims per aspect', () => {
    expect(getExportDims('9:16', '720p')).toEqual({ width: 720, height: 1280 });
    expect(getExportDims('1:1', '720p')).toEqual({ width: 720, height: 720 });
    expect(getExportDims('16:9', '720p')).toEqual({ width: 1280, height: 720 });
  });
  it('1080p dims per aspect', () => {
    expect(getExportDims('9:16', '1080p')).toEqual({ width: 1080, height: 1920 });
    expect(getExportDims('1:1', '1080p')).toEqual({ width: 1080, height: 1080 });
    expect(getExportDims('16:9', '1080p')).toEqual({ width: 1920, height: 1080 });
  });
  it('4K dims per aspect (C1 1:1 2160 supremacy)', () => {
    expect(getExportDims('9:16', '4K')).toEqual({ width: 2160, height: 3840 });
    expect(getExportDims('1:1', '4K')).toEqual({ width: 2160, height: 2160 });
    expect(getExportDims('16:9', '4K')).toEqual({ width: 3840, height: 2160 });
  });
  it('4K area 1:1 is 4.6M not 8.29M but still 16Mbps via quality (C1)', () => {
    const area11 = EXPORT_DIMS['4K']['1:1'].width * EXPORT_DIMS['4K']['1:1'].height;
    expect(area11).toBe(4_665_600);
    // via quality, not area heuristic
    expect(getBitrateForQuality('4K')).toBe(16_000_000);
  });
  it('HD area 720p exactly 921600 for 9:16', () => {
    const area = EXPORT_DIMS['720p']['9:16'].width * EXPORT_DIMS['720p']['9:16'].height;
    expect(area).toBe(921_600);
    expect(getBitrateForQuality('720p')).toBe(2_500_000);
  });
});
