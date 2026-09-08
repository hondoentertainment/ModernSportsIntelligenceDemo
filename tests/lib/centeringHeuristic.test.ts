import { describe, expect, it, vi } from 'vitest';
import {
  CENTERING_HEURISTIC_DISCLOSURE,
  STANDARD_CARD_ASPECT,
  estimateCenteringFromMetadata,
} from '../../lib/utils/centeringHeuristic';

describe('centeringHeuristic', () => {
  it('uses a disclosed demo path when geometry is missing', () => {
    const result = estimateCenteringFromMetadata({});
    expect(result.source).toBe('demo_path');
    expect(result.productionCv).toBe(false);
    expect(result.psaPrediction).toBe(false);
    expect(result.disclosure).toBe(CENTERING_HEURISTIC_DISCLOSURE);
    expect(result.disclosure).toMatch(/not a production computer-vision/i);
    expect(result.disclosure).toMatch(/not a PSA/i);
    const total = result.buckets.reduce((sum, b) => sum + b.probabilityPct, 0);
    expect(total).toBe(100);
  });

  it('returns a demo-path result when Image cannot load', async () => {
    const { estimateCenteringFromDataUrl, loadImageDimensions } = await import(
      '../../lib/utils/centeringHeuristic'
    );
    class BrokenImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal('Image', BrokenImage);
    expect(await loadImageDimensions('data:image/jpeg;base64,xxxx')).toBeNull();
    const result = await estimateCenteringFromDataUrl('data:image/jpeg;base64,xxxx');
    expect(result.source).toBe('demo_path');
    vi.unstubAllGlobals();
  });

  it('reads a File through FileReader', async () => {
    const { estimateCenteringFromFile } = await import('../../lib/utils/centeringHeuristic');
    class MockFileReader {
      result = 'data:image/jpeg;base64,AAAA';
      onloadend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        queueMicrotask(() => this.onloadend?.());
      }
    }
    class MockImage {
      naturalWidth = 714;
      naturalHeight = 1000;
      width = 714;
      height = 1000;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);
    vi.stubGlobal('Image', MockImage);
    const file = new File(['card'], 'card.jpg', { type: 'image/jpeg' });
    const result = await estimateCenteringFromFile(file);
    expect(result.source).toBe('image_metadata_heuristic');
    expect(result.psaPrediction).toBe(false);
    vi.unstubAllGlobals();
  });

  it('derives byte length from a data URL payload', async () => {
    const { estimateByteLengthFromDataUrl, estimateCenteringFromDataUrl } = await import(
      '../../lib/utils/centeringHeuristic'
    );
    expect(estimateByteLengthFromDataUrl('data:image/png;base64,AAAA')).toBeGreaterThan(0);
    class MockImage {
      naturalWidth = 714;
      naturalHeight = 1000;
      width = 714;
      height = 1000;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', MockImage);
    const fromUrl = await estimateCenteringFromDataUrl('data:image/jpeg;base64,AAAA', 'image/jpeg', 220_000);
    expect(fromUrl.source).toBe('image_metadata_heuristic');
    expect(fromUrl.productionCv).toBe(false);
    vi.unstubAllGlobals();
  });

  it('scores a near-standard aspect higher than a stretched frame', () => {
    const good = estimateCenteringFromMetadata({
      width: 714,
      height: 1000,
      byteLength: 220_000,
      mimeType: 'image/jpeg',
    });
    const off = estimateCenteringFromMetadata({
      width: 1200,
      height: 1000,
      byteLength: 12_000,
      mimeType: 'image/gif',
    });
    expect(good.source).toBe('image_metadata_heuristic');
    expect(Math.abs(714 / 1000 - STANDARD_CARD_ASPECT)).toBeLessThan(0.01);
    expect(good.centeringScore).toBeGreaterThan(off.centeringScore);
    expect(good.buckets.some((b) => b.grade === 'PSA 10')).toBe(true);
  });
});
