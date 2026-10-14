/**
 * Collection CSV round-trip. Demo book only. No cloud import.
 */
import type { CardInventory, League, Sport } from '../../types';

export const CSV_DISCLOSURE =
  'CSV of this browser’s book. Round-trip keeps the rows you export. Not a marketplace import.';

const COLUMNS = [
  'id',
  'player',
  'year',
  'manufacturer',
  'cardNumber',
  'set',
  'sport',
  'league',
  'purchasePrice',
  'purchaseDate',
  'currentValue',
  'status',
] as const;

const SPORTS = new Set<Sport>(['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer']);
const LEAGUES = new Set<League>(['MLB', 'MiLB', 'NBA', 'NFL', 'Other']);
const STATUSES = new Set(['active', 'sold', 'consignment']);

const LEAGUE_FOR: Record<Sport, League> = {
  Baseball: 'MLB',
  Basketball: 'NBA',
  Football: 'NFL',
  Hockey: 'Other',
  Soccer: 'Other',
};

export interface CsvApplyResult {
  inventory: CardInventory[];
  applied: number;
  added: number;
  updated: number;
  skipped: number;
  error: string | null;
}

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

function unescapeCell(value: string): string {
  if (value.startsWith("'") && /^[=+\-@]/.test(value.slice(1))) return value.slice(1);
  return value;
}

export function exportCollectionCsv(cards: CardInventory[]): string {
  const lines = [COLUMNS.join(',')];
  for (const card of cards) {
    const cells = COLUMNS.map((column) => csvCell(String(card[column] ?? '')));
    lines.push(cells.join(','));
  }
  return lines.join('\n');
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function money(value: string): number | null {
  const n = Number(value.replace(/[$,]/g, '').trim());
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) return null;
  return Math.round(n * 100) / 100;
}

function uniqueId(used: Set<string>, player: string, year: number): string {
  const slug = player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'card';
  let id = `csv-${year}-${slug}`;
  let n = 2;
  while (used.has(id)) {
    id = `csv-${year}-${slug}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

export function applyCollectionCsv(existing: CardInventory[], text: string): CsvApplyResult {
  const fail = (error: string): CsvApplyResult => ({
    inventory: existing,
    applied: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    error,
  });
  if (text.length > 80_000) return fail('CSV is too large for this demo.');
  const rows = parseCsv(text);
  if (rows.length < 2) return fail('CSV needs a header and one row.');
  const header = rows[0].map((cell) => cell.trim());
  if (!COLUMNS.every((column) => header.includes(column))) return fail('Missing collection columns.');
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const byId = new Map(existing.map((card) => [card.id, { ...card }]));
  const used = new Set(byId.keys());
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const body = rows.slice(1, 201);
  skipped += Math.max(0, rows.length - 1 - body.length);
  for (const raw of body) {
    const cell = (name: string) => unescapeCell((raw[index[name]] ?? '').trim());
    const player = cell('player').slice(0, 80);
    const year = Number(cell('year'));
    const purchasePrice = money(cell('purchasePrice'));
    const purchaseDate = cell('purchaseDate');
    const sportRaw = cell('sport') as Sport;
    const sport = SPORTS.has(sportRaw) ? sportRaw : 'Baseball';
    const leagueRaw = cell('league') as League;
    const league = LEAGUES.has(leagueRaw) ? leagueRaw : LEAGUE_FOR[sport];
    const statusRaw = cell('status');
    const status = STATUSES.has(statusRaw) ? (statusRaw as CardInventory['status']) : 'active';
    if (!player || !Number.isInteger(year) || year < 1900 || year > 2100 || purchasePrice == null || !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
      skipped += 1;
      continue;
    }
    const currentRaw = cell('currentValue');
    const currentValue = currentRaw === '' ? undefined : money(currentRaw);
    if (currentRaw !== '' && currentValue == null) {
      skipped += 1;
      continue;
    }
    const patch = {
      player,
      year,
      manufacturer: cell('manufacturer').slice(0, 80) || 'Unknown',
      cardNumber: cell('cardNumber').slice(0, 20),
      set: cell('set').slice(0, 80),
      sport,
      league,
      purchasePrice,
      purchaseDate,
      currentValue,
      status,
    };
    const id = cell('id');
    const found = id ? byId.get(id) : undefined;
    if (found) {
      byId.set(id, { ...found, ...patch });
      updated += 1;
    } else {
      const nextId = id && !used.has(id) ? id : uniqueId(used, player, year);
      used.add(nextId);
      byId.set(nextId, {
        id: nextId,
        isAutographed: false,
        condition: 'Near Mint',
        isGraded: false,
        ...patch,
      });
      added += 1;
    }
  }
  if (added + updated === 0) return fail('No rows imported.');
  return {
    inventory: [...byId.values()],
    applied: added + updated,
    added,
    updated,
    skipped,
    error: null,
  };
}
