import { afterEach, describe, expect, it } from 'vitest';
import { createBarcodeDetector, isBarcodeDetectionSupported } from '../../lib/utils/barcodeDetection';

describe('barcodeDetection', () => {
  const original = window.BarcodeDetector;

  afterEach(() => {
    window.BarcodeDetector = original;
  });

  it('reports unsupported when API missing', () => {
    Reflect.deleteProperty(window, 'BarcodeDetector');
    expect(isBarcodeDetectionSupported()).toBe(false);
  });

  it('createBarcodeDetector returns null when API missing', async () => {
    Reflect.deleteProperty(window, 'BarcodeDetector');
    await expect(createBarcodeDetector()).resolves.toBeNull();
  });

  it('creates detector with formats from getSupportedFormats', async () => {
    let constructedWith: { formats?: string[] } | undefined;
    window.BarcodeDetector = class {
      static getSupportedFormats() {
        return Promise.resolve(['qr_code', 'ean_13']);
      }
      constructor(opts?: { formats?: string[] }) {
        constructedWith = opts;
      }
      detect() {
        return Promise.resolve([]);
      }
    } as unknown as NonNullable<typeof window.BarcodeDetector>;

    const d = await createBarcodeDetector();
    expect(d).toBeTruthy();
    expect(constructedWith).toEqual({ formats: ['qr_code', 'ean_13'] });
  });

  it('falls back to qr_code when getSupportedFormats throws', async () => {
    let constructedWith: { formats?: string[] } | undefined;
    window.BarcodeDetector = class {
      static getSupportedFormats() {
        return Promise.reject(new Error('bad'));
      }
      constructor(opts?: { formats?: string[] }) {
        constructedWith = opts;
      }
      detect() {
        return Promise.resolve([]);
      }
    } as unknown as NonNullable<typeof window.BarcodeDetector>;

    await createBarcodeDetector();
    expect(constructedWith).toEqual({ formats: ['qr_code'] });
  });

  it('returns null when constructor throws', async () => {
    window.BarcodeDetector = class {
      static getSupportedFormats() {
        return Promise.resolve(['qr_code']);
      }
      constructor() {
        throw new Error('unsupported format combo');
      }
      detect() {
        return Promise.resolve([]);
      }
    } as unknown as NonNullable<typeof window.BarcodeDetector>;

    await expect(createBarcodeDetector()).resolves.toBeNull();
  });
});
