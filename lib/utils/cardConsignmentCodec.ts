/**
 * Embeds CardConsignmentSnapshot in cards.notes for Supabase rows without a JSONB column.
 * Phase 17 institutional liquidity — consignment lifecycle on inventory.
 */

import type { CardConsignmentSnapshot } from '../../types';

const MARKER = '[[MSI:CONSIGNMENT:v1]]';

export function stripConsignmentFromNotes(notes: string | undefined | null): string {
  if (!notes) return '';
  const i = notes.indexOf(MARKER);
  if (i < 0) return notes.trimEnd();
  return notes.slice(0, i).replace(/\s+$/u, '').trimEnd();
}

export function mergeConsignmentIntoNotes(
  displayNotes: string | undefined | null,
  consignment: CardConsignmentSnapshot | undefined
): string {
  const base = stripConsignmentFromNotes(displayNotes);
  if (!consignment) return base;
  const tail = `${MARKER}${JSON.stringify(consignment)}`;
  return base ? `${base}\n${tail}` : tail;
}

export function parseConsignmentFromNotes(notes: string | undefined | null): {
  userNotes: string;
  consignment?: CardConsignmentSnapshot;
} {
  if (!notes || !notes.includes(MARKER)) {
    return { userNotes: notes?.trimEnd() ?? '' };
  }
  const i = notes.indexOf(MARKER);
  const userNotes = notes.slice(0, i).replace(/\s+$/u, '').trimEnd();
  const raw = notes.slice(i + MARKER.length);
  try {
    const o = JSON.parse(raw) as CardConsignmentSnapshot;
    if (o && typeof o.houseId === 'string' && typeof o.entryId === 'string') {
      return { userNotes, consignment: o };
    }
  } catch {
    /* ignore corrupt block */
  }
  return { userNotes: stripConsignmentFromNotes(notes) };
}
