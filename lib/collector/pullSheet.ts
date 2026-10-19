/**
 * Groups shopping-list sell lines by the place saved on this browser
 * so a collector can pull them before a seeded show.
 * Demo or stale tape. Not a warehouse system.
 */
export const PULL_SHEET_NOTE =
  'Pull these sell lines from the binder, box, or slab case saved on this browser. Not a warehouse system and not a live tape.';

export type PullPlace = 'binder' | 'box' | 'slab' | 'unplaced';

export interface PullLine {
  id: string;
  cardId: string | null;
  player: string;
  detail: string;
  markUsd: number | null;
}

export interface PullItem {
  id: string;
  player: string;
  detail: string;
  markUsd: number | null;
}

export interface PullGroup {
  place: PullPlace;
  label: string;
  items: PullItem[];
}

export interface PullSheet {
  groups: PullGroup[];
  count: number;
  note: string;
}

const ORDER: readonly PullPlace[] = ['binder', 'box', 'slab', 'unplaced'];

const LABELS: Record<PullPlace, string> = {
  binder: 'Binder',
  box: 'Box',
  slab: 'Slab case',
  unplaced: 'No saved place',
};

function knownPlace(value: string | undefined): PullPlace {
  if (value === 'binder' || value === 'box' || value === 'slab') return value;
  return 'unplaced';
}

function markOrNull(value: number | null): number | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

export function buildPullSheet(
  lines: readonly PullLine[],
  places: Readonly<Record<string, string | undefined>>,
): PullSheet {
  const buckets = new Map<PullPlace, PullItem[]>();
  const seen = new Set<string>();
  for (const line of lines) {
    const cardId = line.cardId?.trim() ?? '';
    const key = cardId || line.id.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const place = cardId ? knownPlace(places[cardId]) : 'unplaced';
    const items = buckets.get(place) ?? [];
    items.push({
      id: key,
      player: line.player.trim() || 'Untitled',
      detail: line.detail.trim(),
      markUsd: markOrNull(line.markUsd),
    });
    buckets.set(place, items);
  }

  const groups: PullGroup[] = [];
  for (const place of ORDER) {
    const items = buckets.get(place);
    if (!items) continue;
    items.sort((a, b) => a.player.localeCompare(b.player) || a.id.localeCompare(b.id));
    groups.push({ place, label: LABELS[place], items });
  }
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);
  return { groups, count, note: PULL_SHEET_NOTE };
}

export function pullSheetCopy(sheet: Pick<PullSheet, 'count' | 'groups'>): string {
  if (sheet.count === 0) return `No sell lines to pull for this show. ${PULL_SHEET_NOTE}`;
  const noun = sheet.count === 1 ? 'card' : 'cards';
  const parts = sheet.groups.map((group) => `${group.items.length} from ${group.label}`);
  return `${sheet.count} ${noun} to pull: ${parts.join(', ')}. ${PULL_SHEET_NOTE}`;
}
