/**
 * Priority 1.2 leftover — field-level diffs for local vs cloud duplicate inventory.
 * Demo-safe: pure compare, no restore / no writes.
 */
import type { CardInventory, TargetWatchlist } from '../../types';

export interface FieldConflict {
  field: string;
  label: string;
  local: string;
  cloud: string;
}

export const CARD_DIFF_FIELDS = [
  { key: 'currentValue', label: 'Mark' },
  { key: 'purchasePrice', label: 'Cost' },
  { key: 'purchaseDate', label: 'Acquired' },
  { key: 'lastValuationDate', label: 'Valued' },
  { key: 'condition', label: 'Condition' },
  { key: 'grade', label: 'Grade' },
  { key: 'gradingCompany', label: 'Grader' },
  { key: 'notes', label: 'Notes' },
  { key: 'status', label: 'Status' },
  { key: 'certNumber', label: 'Cert' },
] as const;

export const TARGET_DIFF_FIELDS = [
  { key: 'targetPrice', label: 'Target' },
  { key: 'currentMarketPrice', label: 'Mark' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
] as const;

function formatFieldValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

function sameDisplay(a: unknown, b: unknown): boolean {
  return formatFieldValue(a) === formatFieldValue(b);
}

export function diffCardFields(local: CardInventory, cloud: CardInventory): FieldConflict[] {
  const rows: FieldConflict[] = [];
  for (const field of CARD_DIFF_FIELDS) {
    const localVal = local[field.key];
    const cloudVal = cloud[field.key];
    if (sameDisplay(localVal, cloudVal)) continue;
    rows.push({
      field: field.key,
      label: field.label,
      local: formatFieldValue(localVal),
      cloud: formatFieldValue(cloudVal),
    });
  }
  return rows;
}

export function diffTargetFields(local: TargetWatchlist, cloud: TargetWatchlist): FieldConflict[] {
  const rows: FieldConflict[] = [];
  for (const field of TARGET_DIFF_FIELDS) {
    const localVal = local[field.key];
    const cloudVal = cloud[field.key];
    if (sameDisplay(localVal, cloudVal)) continue;
    rows.push({
      field: field.key,
      label: field.label,
      local: formatFieldValue(localVal),
      cloud: formatFieldValue(cloudVal),
    });
  }
  return rows;
}

export function countFieldConflicts(conflicts: FieldConflict[]): number {
  return conflicts.length;
}

export function formatFieldConflictLine(conflict: FieldConflict): string {
  return `${conflict.label}: local ${conflict.local} · cloud ${conflict.cloud}`;
}
