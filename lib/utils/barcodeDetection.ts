/**
 * Barcode / QR detection via the browser Barcode Detection API (no extra npm deps).
 * Supported mainly on Chromium (desktop + Android). Safari support is limited.
 */

export function isBarcodeDetectionSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.BarcodeDetector === 'function';
}

export async function createBarcodeDetector(): Promise<BarcodeDetector | null> {
  const Ctor = typeof window !== 'undefined' ? window.BarcodeDetector : undefined;
  if (!Ctor) return null;

  let formats: string[];
  try {
    formats = await Ctor.getSupportedFormats();
  } catch {
    formats = [];
  }

  const safe = formats.length > 0 ? formats : ['qr_code'];
  try {
    return new Ctor({ formats: safe });
  } catch {
    return null;
  }
}
