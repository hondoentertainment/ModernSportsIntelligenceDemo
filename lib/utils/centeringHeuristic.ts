/**
 * Disclosed non-CV centering / grade-probability heuristic.
 * Uses image metadata (aspect, resolution, bytes) — not pixel CV, not a PSA model.
 */

export const CENTERING_HEURISTIC_DISCLOSURE =
  'Geometry and file-metadata heuristic only — not a production computer-vision model and not a PSA, BGS, or SGC grade prediction. Third-party grading can differ.';

/** Standard sports-card face ratio (2.5 × 3.5 in). */
export const STANDARD_CARD_ASPECT = 2.5 / 3.5;

export interface CenteringHeuristicInput {
  width?: number;
  height?: number;
  byteLength?: number;
  mimeType?: string;
}

export interface GradeProbabilityBucket {
  grade: string;
  probabilityPct: number;
}

export interface CenteringHeuristicResult {
  leftRightRatio: string;
  topBottomRatio: string;
  centeringScore: number;
  buckets: GradeProbabilityBucket[];
  confidencePct: number;
  disclosure: string;
  source: 'image_metadata_heuristic' | 'demo_path';
  productionCv: false;
  psaPrediction: false;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function ratioPair(bias: number): { left: number; right: number; label: string } {
  const left = clamp(50 + bias, 35, 65);
  const right = 100 - left;
  return {
    left: Math.round(left * 10) / 10,
    right: Math.round(right * 10) / 10,
    label: `${Math.round(left)}/${Math.round(right)}`,
  };
}

function buildBuckets(centeringScore: number): GradeProbabilityBucket[] {
  const gem = clamp((centeringScore - 55) / 45, 0, 1);
  const psa10 = Math.round(8 + gem * 42);
  const psa9 = Math.round(18 + (1 - Math.abs(gem - 0.65)) * 28);
  const psa8 = Math.round(12 + (1 - gem) * 22);
  let remainder = 100 - psa10 - psa9 - psa8;
  if (remainder < 4) remainder = 4;
  const psa7 = Math.min(remainder, 24);
  const below = 100 - psa10 - psa9 - psa8 - psa7;
  return [
    { grade: 'PSA 10', probabilityPct: psa10 },
    { grade: 'PSA 9', probabilityPct: psa9 },
    { grade: 'PSA 8', probabilityPct: psa8 },
    { grade: 'PSA 7', probabilityPct: psa7 },
    { grade: 'PSA 6 or below', probabilityPct: Math.max(0, below) },
  ];
}

export function estimateByteLengthFromDataUrl(dataUrl: string): number {
  const payload = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Math.round((payload?.length ?? 0) * 0.75);
}

export function loadImageDimensions(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function estimateCenteringFromDataUrl(
  dataUrl: string,
  mimeType?: string,
  byteLength?: number,
): Promise<CenteringHeuristicResult> {
  const dims = await loadImageDimensions(dataUrl);
  return estimateCenteringFromMetadata({
    width: dims?.width,
    height: dims?.height,
    byteLength: byteLength ?? estimateByteLengthFromDataUrl(dataUrl),
    mimeType: mimeType ?? 'image/jpeg',
  });
}

export async function estimateCenteringFromFile(file: File): Promise<CenteringHeuristicResult> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return estimateCenteringFromDataUrl(dataUrl, file.type, file.size);
}

export function estimateCenteringFromMetadata(input: CenteringHeuristicInput = {}): CenteringHeuristicResult {
  const width = Number.isFinite(input.width) && (input.width ?? 0) > 0 ? Number(input.width) : null;
  const height = Number.isFinite(input.height) && (input.height ?? 0) > 0 ? Number(input.height) : null;
  const hasGeometry = width != null && height != null;
  const source: CenteringHeuristicResult['source'] = hasGeometry ? 'image_metadata_heuristic' : 'demo_path';

  let aspectDelta = 0.04;
  if (hasGeometry) {
    const raw = width! / height!;
    const portrait = raw > 1 ? 1 / raw : raw;
    aspectDelta = Math.abs(portrait - STANDARD_CARD_ASPECT);
  }

  const lrBias = clamp((aspectDelta - 0.02) * 80, -12, 12);
  const tbBias = clamp((aspectDelta - 0.01) * 55, -10, 10);
  const lr = ratioPair(-lrBias);
  const tb = ratioPair(tbBias);

  const geometryScore = clamp(100 - aspectDelta * 280, 42, 98);
  const pixels = hasGeometry ? width! * height! : 0;
  const resolutionPenalty = hasGeometry && pixels < 180_000 ? 8 : 0;
  const bytes = Number.isFinite(input.byteLength) ? Number(input.byteLength) : 0;
  const sizePenalty = bytes > 0 && bytes < 18_000 ? 6 : 0;
  const mime = (input.mimeType || '').toLowerCase();
  const mimePenalty = mime.includes('gif') || mime.includes('webp') ? 3 : 0;

  const centeringScore = Math.round(clamp(geometryScore - resolutionPenalty - sizePenalty - mimePenalty, 38, 97));
  const confidencePct = hasGeometry
    ? clamp(58 + (pixels > 400_000 ? 18 : 8) - sizePenalty, 40, 82)
    : 36;

  return {
    leftRightRatio: lr.label,
    topBottomRatio: tb.label,
    centeringScore,
    buckets: buildBuckets(centeringScore),
    confidencePct,
    disclosure: CENTERING_HEURISTIC_DISCLOSURE,
    source,
    productionCv: false,
    psaPrediction: false,
  };
}
