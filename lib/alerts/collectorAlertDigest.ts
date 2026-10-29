/**
 * In-app digest of watchlist marks under target and seeded shows inside
 * the saved home radius. Demo tape only. Does not send Web Push.
 */
import type { CardInventory, TargetWatchlist } from '../../types';
import {
  getShowAlertPrefs,
  showsInAlertWindow,
  type ShowAlertPrefs,
} from '../shows/showAlerts';
import {
  LOCAL_CARD_SHOW_CATALOG,
  listResolvedLocalCardShows,
  type ResolvedLocalCardShow,
} from '../shows/localCardShowCatalog';
import { compsSnapshot } from '../collector/deskNext';
import { cardRanges, weekLadder, weekLadderCopy } from '../collector/ladderScore';
import { buyLadder, buyLadderCopy } from '../collector/offerLadder';
import { watchlistAlertMark } from '../collector/gradeAlert';
import { rangeForSeat, targetRangeDesk, type RangeRow } from '../collector/saleRange';
import { followUps, type FollowUp, type MarkRef } from '../collector/showClose';
import { haggleSnapshot, type HaggleNote } from '../shows/showHaggleLog';
import { store } from '../dal/syncStore';

export const ALERT_DIGEST_DISCLOSURE =
  'Local marks and the seeded show calendar. Not a live tape. Not live Market Movers or Sports Card Investor parity. Server Web Push still needs owner-held VAPID keys.';

export const MIN_PRICE_DROP = 0.05;

export interface DigestRow {
  id: string;
  title: string;
  detail: string;
  href: string;
}

export interface CollectorAlertDigest {
  drops: DigestRow[];
  shows: DigestRow[];
  follows: FollowUp[];
  ranges: RangeRow[];
  rangeOmitted: number;
  ladderCopy: string;
  showAlertsArmed: boolean;
  disclosure: string;
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function pctLabel(drop: number): string {
  const pct = Math.round(drop * 1000) / 10;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

export function readDigestTargets(raw: unknown): TargetWatchlist[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is TargetWatchlist => {
    if (!row || typeof row !== 'object') return false;
    const target = row as TargetWatchlist;
    return typeof target.id === 'string'
      && typeof target.player === 'string'
      && typeof target.targetPrice === 'number'
      && (target.status === 'active' || target.status === 'acquired' || target.status === 'expired');
  });
}

export function priceDropRows(targets: readonly TargetWatchlist[], minDrop = MIN_PRICE_DROP): DigestRow[] {
  const rows: Array<DigestRow & { drop: number }> = [];
  for (const target of targets) {
    if (target.status !== 'active') continue;
    const ceiling = target.targetPrice;
    if (!Number.isFinite(ceiling) || ceiling <= 0) continue;
    const mark = watchlistAlertMark(target);
    if (!mark || mark.usd >= ceiling) continue;
    const drop = (ceiling - mark.usd) / ceiling;
    if (drop + 1e-9 < minDrop) continue;
    const player = target.player.trim() || 'Watchlist card';
    rows.push({
      id: `drop:${target.id}`,
      title: `${player} under target`,
      detail: `${mark.label} ${money(mark.usd)} is ${pctLabel(drop)} under your ${money(ceiling)} target. ${target.cardDescription?.trim() || 'Watchlist row'}.`,
      href: '/collection',
      drop,
    });
  }
  rows.sort((a, b) => b.drop - a.drop || a.title.localeCompare(b.title));
  return rows.map((row) => ({ id: row.id, title: row.title, detail: row.detail, href: row.href }));
}

export function showProximityRows(shows: readonly ResolvedLocalCardShow[], prefs: ShowAlertPrefs): DigestRow[] {
  return showsInAlertWindow(shows, prefs).map((hit) => ({
    id: `show:${hit.show.id}:${hit.show.startDate}`,
    title: hit.show.name,
    detail: `${hit.distanceMiles.toFixed(1)} mi · ${hit.show.city}, ${hit.show.state} · ${hit.show.daysUntilStart === 0 ? 'Open now' : `In ${hit.show.daysUntilStart} days`}.`,
    href: '/local-card-shows',
  }));
}

function medianByCard(inventory: readonly CardInventory[]): Record<string, MarkRef> {
  const map: Record<string, MarkRef> = {};
  for (const card of inventory) {
    if (card.status === 'sold' || card.status === 'consignment') continue;
    const snap = compsSnapshot(card);
    if (snap.median == null || snap.median <= 0) continue;
    if (snap.source === 'comps' || snap.source === 'demo') map[card.id] = { usd: snap.median, kind: snap.source };
  }
  return map;
}

function readInventory(raw: unknown): CardInventory[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is CardInventory => {
    if (!row || typeof row !== 'object') return false;
    const card = row as CardInventory;
    return typeof card.id === 'string' && typeof card.player === 'string';
  });
}

export function buildCollectorAlertDigest(input: {
  targets: readonly TargetWatchlist[];
  shows: readonly ResolvedLocalCardShow[];
  prefs: ShowAlertPrefs;
  notes?: readonly HaggleNote[];
  inventory?: readonly CardInventory[];
}): CollectorAlertDigest {
  const armed = input.prefs.enabled && input.prefs.home != null;
  const notes = input.notes ?? [];
  const inventory = input.inventory ?? [];
  const ranges = targetRangeDesk(input.targets);
  return {
    drops: priceDropRows(input.targets),
    ranges: ranges.rows.map((row) => {
      const id = row.id.startsWith('range:') ? row.id.slice('range:'.length) : row.id;
      const target = input.targets.find((item) => item.id === id);
      if (!target) return row;
      const copy = buyLadderCopy(buyLadder(rangeForSeat({
        id: target.id,
        currentValue: target.currentMarketPrice,
        salesData: target.salesData,
        gradeText: target.cardDescription,
      }), { targetUsd: target.targetPrice }));
      return copy ? { ...row, detail: `${row.detail} ${copy}` } : row;
    }),
    rangeOmitted: ranges.omitted,
    ladderCopy: weekLadderCopy(weekLadder(notes, cardRanges(inventory))),
    shows: armed ? showProximityRows(input.shows, input.prefs) : [],
    follows: followUps({
      notes,
      shows: LOCAL_CARD_SHOW_CATALOG.map(show => ({ id: show.id, name: show.name })),
      medianByCardId: medianByCard(inventory),
      targets: input.targets,
    }),
    showAlertsArmed: armed,
    disclosure: ALERT_DIGEST_DISCLOSURE,
  };
}

export function loadCollectorAlertDigest(
  targetsRaw: unknown,
  now = new Date(),
  inventoryRaw: unknown = undefined,
): CollectorAlertDigest {
  const inventory = inventoryRaw === undefined ? store.get('cardx_inventory', []) : inventoryRaw;
  return buildCollectorAlertDigest({
    targets: readDigestTargets(targetsRaw),
    shows: listResolvedLocalCardShows(now),
    prefs: getShowAlertPrefs(),
    notes: haggleSnapshot(),
    inventory: readInventory(inventory),
  });
}
