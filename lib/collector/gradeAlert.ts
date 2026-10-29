/**
 * A watchlist target that names a grade alerts on that grade's sold-comps
 * median. The mixed mark does not stand in when that grade is missing.
 * A demo sketch is not split. Not a live tape.
 */
import { gradeBands, preferredGradeKey, rangeForSeat } from './saleRange';

export const GRADE_ALERT_NOTE =
  'A target that names a grade uses that grade\'s sold-comps median. The mixed mark does not stand in for a missing grade. A demo sketch is not split. Not a live tape.';

export interface AlertMark {
  usd: number;
  kind: 'market' | 'band';
  label: string;
}

interface AlertTarget {
  id: string;
  cardDescription?: string;
  currentMarketPrice?: number;
  salesData?: readonly {
    price: number;
    totalPrice?: number;
    soldAt?: string;
    title?: string;
    condition?: string;
  }[];
}

function positive(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function watchlistAlertMark(target: AlertTarget): AlertMark | null {
  const market = positive(target.currentMarketPrice);
  const input = {
    id: target.id,
    currentValue: market ?? undefined,
    salesData: target.salesData,
    gradeText: typeof target.cardDescription === 'string' ? target.cardDescription : '',
  };
  const named = preferredGradeKey(input);
  if (!named) {
    if (market == null) return null;
    return { usd: market, kind: 'market', label: 'Local mark' };
  }
  const range = rangeForSeat(input);
  if (range.source !== 'comps' || range.median == null) return null;
  const band = gradeBands(input).find((row) => row.key === named);
  if (!band) return null;
  return { usd: band.median, kind: 'band', label: `${band.label} sold comps median` };
}
