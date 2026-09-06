export type SwipeTriageAction = 'keep' | 'sell' | 'consign' | 'review';

export const SWIPE_TRIAGE_THRESHOLD = 80;

export const SWIPE_TRIAGE_LABELS: Record<SwipeTriageAction, string> = {
  keep: 'Keep',
  sell: 'Sell',
  consign: 'Consign',
  review: 'Review',
};

export const SWIPE_TRIAGE_HINT =
  'Mobile: swipe right to keep, left to sell, up to consign, down to review.';

/**
 * Resolve a completed touch gesture into a Collection triage action.
 * Dominant axis wins once it clears the threshold so vertical page scroll
 * does not steal a clearly horizontal swipe (and vice versa).
 */
export function resolveSwipeTriage(
  dx: number,
  dy: number,
  threshold: number = SWIPE_TRIAGE_THRESHOLD
): SwipeTriageAction | null {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX < threshold && absY < threshold) return null;
  if (absX >= absY) {
    return dx > 0 ? 'keep' : 'sell';
  }
  return dy < 0 ? 'consign' : 'review';
}
