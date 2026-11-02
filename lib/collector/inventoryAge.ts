/**
 * Days held on the show profit and loss.
 * Unsold inventory ages from the note, or from the book purchase date when
 * that copy is filed. A recorded sale uses the book purchase date and sale
 * date. Short-term and long-term follow the same 365.25-day line as the
 * holding-horizon rail. Inside 45 days of that line matches the sell planner.
 * The download is sold inventory only. Not a tax form and not a live tape.
 */

export const REALIZED_EXPORT_NOTE =
  'The file lists sold inventory from this profit and loss: the price, the ~4% card-show fee, the realized result, and the holding when both dates are on the book. Unsold inventory stays off the file. Not a tax form and not a live tape.';

export const REALIZED_CSV_HEADER =
  'player,paid,cost,taken,fee,realized,acquired,sold,days_held,holding';

/** Same window the sell planner uses for a short-term hold. */
export const NEAR_LONG_TERM_DAYS = 45;

const DAY_MS = 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365.25 * DAY_MS;
const LONG_TERM_DAYS = 365;

export type HoldTreatment = 'short-term' | 'long-term';

export interface AgedRow {
  side: 'unsold' | 'sold';
  player: string;
  paidUsd: number | null;
  costUsd: number | null;
  takenUsd: number | null;
  feeUsd: number | null;
  realizedUsd: number | null;
  acquiredAt?: string | null;
  soldAt?: string | null;
  daysHeld?: number | null;
  treatment?: HoldTreatment | null;
  daysToLongTerm?: number | null;
}

export interface HoldStamp {
  acquiredAt: string | null;
  soldAt: string | null;
  daysHeld: number | null;
  treatment: HoldTreatment | null;
  daysToLongTerm: number | null;
}

interface HoldAge {
  daysHeld: number;
  treatment: HoldTreatment;
  daysToLongTerm: number;
}

export function calendarDay(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

export function acquiredDay(bookDate: string | undefined, noteDate: string | undefined): string | null {
  return calendarDay(bookDate) ?? calendarDay(noteDate);
}

export function soldDay(bookDate: string | undefined): string | null {
  return calendarDay(bookDate);
}

export function holdAge(
  acquired: string | null,
  asOf: number,
  sold: string | null,
  open: boolean,
): HoldAge | null {
  const start = calendarDay(acquired ?? undefined);
  if (start == null || !Number.isFinite(asOf)) return null;
  const end = open ? asOf : calendarDay(sold ?? undefined);
  if (end == null) return null;
  const startMs = Date.parse(start);
  const endMs = typeof end === 'number' ? end : Date.parse(end);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return null;
  const daysHeld = Math.max(0, Math.round((endMs - startMs) / DAY_MS));
  const treatment: HoldTreatment = endMs - startMs >= ONE_YEAR_MS ? 'long-term' : 'short-term';
  return {
    daysHeld,
    treatment,
    daysToLongTerm: treatment === 'long-term' ? 0 : Math.max(0, LONG_TERM_DAYS - daysHeld),
  };
}

export function applyHold(
  acquired: string | null,
  sold: string | null,
  asOf: number,
  open: boolean,
): HoldStamp {
  const age = holdAge(acquired, asOf, sold, open);
  return {
    acquiredAt: acquired,
    soldAt: open ? null : sold,
    daysHeld: age?.daysHeld ?? null,
    treatment: age?.treatment ?? null,
    daysToLongTerm: age?.daysToLongTerm ?? null,
  };
}

function daysLabel(count: number): string {
  return count === 1 ? '1 day' : `${count} days`;
}

export function ageRowBit(row: Pick<AgedRow, 'side' | 'daysHeld' | 'treatment' | 'daysToLongTerm'>): string {
  if (row.daysHeld == null || row.treatment == null) return '';
  const held = `held ${daysLabel(row.daysHeld)}`;
  if (row.side === 'sold' || row.treatment === 'long-term') return ` · ${held} · ${row.treatment}`;
  const left = row.daysToLongTerm ?? 0;
  const near = left > 0 && left <= NEAR_LONG_TERM_DAYS ? ' · inside 45 days of long-term' : '';
  return ` · ${held} · short-term · ${daysLabel(left)} to long-term${near}`;
}

function countWord(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function joinParts(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return `${parts[0]} and ${parts[1]}`;
}

function unsoldAge(rows: readonly AgedRow[]): string {
  let short = 0;
  let near = 0;
  let long = 0;
  let bare = 0;
  for (const row of rows) {
    if (row.treatment === 'long-term') long += 1;
    else if (row.treatment === 'short-term') {
      short += 1;
      const left = row.daysToLongTerm ?? 0;
      if (left > 0 && left <= NEAR_LONG_TERM_DAYS) near += 1;
    } else bare += 1;
  }
  if (short + long === 0) {
    return `Inventory age: ${countWord(bare, 'unsold card has', 'unsold cards have')} no date.`;
  }
  const bits: string[] = [];
  if (short > 0) {
    const including = near === 0
      ? ''
      : near === 1
        ? ', including 1 inside 45 days of long-term'
        : `, including ${near} inside 45 days of long-term`;
    bits.push(`${countWord(short, 'short-term', 'short-term')}${including}`);
  }
  if (long > 0) bits.push(countWord(long, 'long-term', 'long-term'));
  const missing = bare === 0
    ? ''
    : bare === 1
      ? ' 1 unsold card has no date.'
      : ` ${bare} unsold cards have no date.`;
  return `Inventory age: ${joinParts(bits)}.${missing}`;
}

function soldAge(rows: readonly AgedRow[]): string {
  let short = 0;
  let long = 0;
  let bare = 0;
  for (const row of rows) {
    if (row.treatment === 'short-term') short += 1;
    else if (row.treatment === 'long-term') long += 1;
    else bare += 1;
  }
  if (short + long === 0) {
    return `Recorded holding: ${countWord(bare, 'recorded sale has', 'recorded sales have')} no holding dates.`;
  }
  const bits: string[] = [];
  if (short > 0) bits.push(countWord(short, 'short-term', 'short-term'));
  if (long > 0) bits.push(countWord(long, 'long-term', 'long-term'));
  const missing = bare === 0
    ? ''
    : bare === 1
      ? ' 1 recorded sale has no holding dates.'
      : ` ${bare} recorded sales have no holding dates.`;
  return `Recorded holding: ${joinParts(bits)}.${missing}`;
}

export function inventoryAgeCopy(input: { unsold: readonly AgedRow[]; sold: readonly AgedRow[] }): string {
  const parts: string[] = [];
  if (input.unsold.length > 0) parts.push(unsoldAge(input.unsold));
  const priced = input.sold.filter((row) => row.takenUsd != null);
  if (priced.length > 0) parts.push(soldAge(priced));
  return parts.join(' ');
}

function textCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

function numCell(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return String(Math.round(value * 100) / 100);
}

export function canDownloadRealized(rows: readonly Pick<AgedRow, 'side' | 'takenUsd'>[]): boolean {
  return rows.some((row) => row.side === 'sold' && row.takenUsd != null);
}

export function realizedCsv(rows: readonly AgedRow[]): string {
  const lines = [REALIZED_CSV_HEADER];
  for (const row of rows) {
    if (row.side !== 'sold') continue;
    lines.push([
      textCell(row.player),
      numCell(row.paidUsd),
      numCell(row.costUsd),
      numCell(row.takenUsd),
      numCell(row.feeUsd),
      numCell(row.realizedUsd),
      textCell(row.acquiredAt ?? ''),
      textCell(row.soldAt ?? ''),
      row.daysHeld == null ? '' : String(row.daysHeld),
      textCell(row.treatment ?? ''),
    ].join(','));
  }
  return `${lines.join('\n')}\n`;
}

export function downloadRealizedCsv(
  rows: readonly AgedRow[],
  filename: string,
  host: Document | null = typeof document !== 'undefined' ? document : null,
): void {
  if (!host) return;
  const blob = new Blob([realizedCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = host.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  host.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
