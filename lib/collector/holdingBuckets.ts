/**
 * Short-term and long-term totals for recorded show sales, and a hold
 * call for unsold inventory. The line is the same 365.25-day test as
 * inventory age. The fee is the existing ~4% card-show heuristic.
 * A missing mark stays off the call. Not a tax form and not a live tape.
 */
import { NEAR_LONG_TERM_DAYS, type HoldTreatment } from './inventoryAge';
import { exitMath, signedUsd } from './showExit';

export const HOLDING_BUCKET_NOTE =
  'Holding buckets add the recorded sales that are short-term, the ones that are long-term, and the ones with no holding dates. The hold call uses the stored mark and the same ~4% card-show fee. Inside 45 days of long-term, and still ahead after that fee, is a hold. Already long-term and still ahead is clear. Not ahead after that fee is under. A missing mark, a buy that is not filed, and a short-term gain more than 45 days from the line stay off the call. Not a tax determination and not a live tape.';

const NAME_LIMIT = 4;

export type ShowHoldCall = 'hold' | 'clear' | 'under';

export interface BucketRow {
  side: 'unsold' | 'sold';
  player: string;
  takenUsd: number | null;
  feeUsd: number | null;
  realizedUsd: number | null;
  treatment?: HoldTreatment | null;
  daysToLongTerm?: number | null;
  holdCall?: ShowHoldCall | null;
  holdMarkUsd?: number | null;
}

interface BucketTotals {
  count: number;
  takenUsd: number;
  feeUsd: number;
  realizedUsd: number;
  realizedRows: number;
}

export function storedMarkUsd(value: number | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

export function holdCallFor(input: {
  treatment: HoldTreatment | null;
  daysToLongTerm: number | null;
  markUsd: number | null;
  costUsd: number | null;
}): ShowHoldCall | null {
  if (input.treatment == null || input.markUsd == null) return null;
  const realized = input.costUsd == null ? null : exitMath(input.markUsd, input.costUsd).realizedUsd;
  if (realized == null || !Number.isFinite(realized)) return null;
  if (realized <= 0) return 'under';
  if (input.treatment === 'long-term') return 'clear';
  const left = input.daysToLongTerm ?? 0;
  if (left > 0 && left <= NEAR_LONG_TERM_DAYS) return 'hold';
  return null;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function joinParts(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

function sum(rows: readonly BucketRow[]): BucketTotals {
  let count = 0;
  let takenUsd = 0;
  let feeUsd = 0;
  let realizedUsd = 0;
  let realizedRows = 0;
  for (const row of rows) {
    if (row.takenUsd == null) continue;
    count += 1;
    takenUsd = cents(takenUsd + row.takenUsd);
    feeUsd = cents(feeUsd + (row.feeUsd ?? 0));
    if (row.realizedUsd == null) continue;
    realizedUsd = cents(realizedUsd + row.realizedUsd);
    realizedRows += 1;
  }
  return { count, takenUsd, feeUsd, realizedUsd, realizedRows };
}

function labeled(bucket: BucketTotals): string {
  const noun = bucket.count === 1 ? '1 card' : `${bucket.count} cards`;
  const realized = bucket.realizedRows === 0
    ? 'realized stays off without a cost'
    : `realized ${signedUsd(bucket.realizedUsd)}`;
  return `${noun}, taken ${money(bucket.takenUsd)}, card-show fee ${money(bucket.feeUsd)}, ${realized}`;
}

export function holdingBucketCopy(rows: readonly BucketRow[]): string {
  const sold = rows.filter((row) => row.side === 'sold');
  const short = sum(sold.filter((row) => row.treatment === 'short-term'));
  const long = sum(sold.filter((row) => row.treatment === 'long-term'));
  const undated = sum(sold.filter((row) => row.treatment !== 'short-term' && row.treatment !== 'long-term'));
  if (short.count + long.count + undated.count === 0) return '';
  const parts: string[] = [];
  if (short.count > 0) parts.push(`short-term ${labeled(short)}`);
  if (long.count > 0) parts.push(`long-term ${labeled(long)}`);
  if (undated.count === 0) return `Holding buckets: ${joinParts(parts)}.`;
  const undatedBit = labeled(undated);
  if (parts.length === 0) return `Holding buckets: no holding dates on ${undatedBit}.`;
  return `Holding buckets: ${joinParts(parts)}. No holding dates: ${undatedBit}.`;
}

function names(rows: readonly BucketRow[]): string {
  const shown = rows.slice(0, NAME_LIMIT).map((row) => row.player);
  const more = rows.length - shown.length;
  return ` (${shown.join(', ')}${more > 0 ? `, and ${more} more` : ''})`;
}

function callPhrase(count: number, one: string, many: string): string {
  return count === 1 ? one : many.replace('%n', String(count));
}

export function holdCallCopy(rows: readonly BucketRow[]): string {
  const unsold = rows.filter((row) => row.side === 'unsold');
  const holds = unsold.filter((row) => row.holdCall === 'hold');
  const clears = unsold.filter((row) => row.holdCall === 'clear');
  const unders = unsold.filter((row) => row.holdCall === 'under');
  const called = holds.length + clears.length + unders.length;
  if (called === 0) return '';
  const parts: string[] = [];
  if (holds.length > 0) {
    parts.push(`${callPhrase(
      holds.length,
      'hold 1 card inside 45 days of long-term',
      'hold %n cards inside 45 days of long-term',
    )}${names(holds)}`);
  }
  if (clears.length > 0) {
    parts.push(`${callPhrase(
      clears.length,
      'clear 1 card already long-term and still ahead after the card-show fee',
      'clear %n cards already long-term and still ahead after the card-show fee',
    )}${names(clears)}`);
  }
  if (unders.length > 0) {
    parts.push(`${callPhrase(
      unders.length,
      'under 1 card not ahead after the card-show fee',
      'under %n cards not ahead after the card-show fee',
    )}${names(unders)}`);
  }
  const off = unsold.length - called;
  const aside = off === 0
    ? ''
    : off === 1
      ? ' 1 unsold card stays off this call.'
      : ` ${off} unsold cards stay off this call.`;
  return `Hold call: ${joinParts(parts)}.${aside}`;
}

export function holdRowBit(row: Pick<BucketRow, 'holdCall' | 'holdMarkUsd'>): string {
  if (row.holdCall == null || row.holdMarkUsd == null) return '';
  const mark = `mark ${money(row.holdMarkUsd)}`;
  if (row.holdCall === 'hold') return ` · hold until long-term · ${mark}`;
  if (row.holdCall === 'clear') return ` · clear after the card-show fee · ${mark}`;
  return ` · under after the card-show fee · ${mark}`;
}
