import type { CardInventory, League, Sport } from '../../types';
import { getSeasonalWindows, type WindowType } from './seasonalStrategyService';

export type CalendarEvent = 'spring_training' | 'all_star' | 'playoffs' | 'off_season' | 'in_season';

export interface PlayerSeasonalHint {
  player: string;
  sport: Sport;
  league: League;
  cardCount: number;
  windowType: WindowType | 'hold';
  event: CalendarEvent;
  eventLabel: string;
  label: string;
  rationale: string;
  source: 'seeded_heuristic';
}

const BASEBALL_EVENTS: Record<number, { event: CalendarEvent; label: string }> = {
  1: { event: 'off_season', label: 'Off-Season' },
  2: { event: 'off_season', label: 'Off-Season' },
  3: { event: 'spring_training', label: 'Spring Training' },
  4: { event: 'in_season', label: 'Opening stretch' },
  5: { event: 'in_season', label: 'Regular season' },
  6: { event: 'in_season', label: 'Regular season' },
  7: { event: 'all_star', label: 'All-Star Break' },
  8: { event: 'in_season', label: 'Pennant race' },
  9: { event: 'in_season', label: 'Pennant race' },
  10: { event: 'playoffs', label: 'Playoffs' },
  11: { event: 'playoffs', label: 'World Series hangover' },
  12: { event: 'off_season', label: 'Off-Season' },
};

const NBA_EVENTS: Record<number, { event: CalendarEvent; label: string }> = {
  1: { event: 'in_season', label: 'Mid-season' },
  2: { event: 'all_star', label: 'All-Star' },
  3: { event: 'in_season', label: 'Stretch run' },
  4: { event: 'playoffs', label: 'Playoffs' },
  5: { event: 'playoffs', label: 'Conference finals' },
  6: { event: 'playoffs', label: 'Finals' },
  7: { event: 'off_season', label: 'Off-Season' },
  8: { event: 'off_season', label: 'Off-Season' },
  9: { event: 'off_season', label: 'Off-Season' },
  10: { event: 'in_season', label: 'Tip-off' },
  11: { event: 'in_season', label: 'Regular season' },
  12: { event: 'in_season', label: 'Holiday slate' },
};

const NFL_EVENTS: Record<number, { event: CalendarEvent; label: string }> = {
  1: { event: 'playoffs', label: 'Playoffs' },
  2: { event: 'playoffs', label: 'Super Bowl' },
  3: { event: 'off_season', label: 'Off-Season' },
  4: { event: 'off_season', label: 'Draft window' },
  5: { event: 'off_season', label: 'Off-Season' },
  6: { event: 'off_season', label: 'Off-Season' },
  7: { event: 'off_season', label: 'Training camp' },
  8: { event: 'in_season', label: 'Preseason' },
  9: { event: 'in_season', label: 'Kickoff' },
  10: { event: 'in_season', label: 'Regular season' },
  11: { event: 'in_season', label: 'Regular season' },
  12: { event: 'in_season', label: 'Fantasy playoffs' },
};

const NHL_EVENTS: Record<number, { event: CalendarEvent; label: string }> = {
  1: { event: 'in_season', label: 'Mid-season' },
  2: { event: 'all_star', label: 'All-Star' },
  3: { event: 'in_season', label: 'Stretch run' },
  4: { event: 'playoffs', label: 'Playoffs' },
  5: { event: 'playoffs', label: 'Conference finals' },
  6: { event: 'playoffs', label: 'Stanley Cup' },
  7: { event: 'off_season', label: 'Off-Season' },
  8: { event: 'off_season', label: 'Off-Season' },
  9: { event: 'off_season', label: 'Off-Season' },
  10: { event: 'in_season', label: 'Puck drop' },
  11: { event: 'in_season', label: 'Regular season' },
  12: { event: 'in_season', label: 'Holiday slate' },
};

function eventMapForSport(sport: Sport): Record<number, { event: CalendarEvent; label: string }> {
  if (sport === 'Basketball') return NBA_EVENTS;
  if (sport === 'Football') return NFL_EVENTS;
  if (sport === 'Hockey') return NHL_EVENTS;
  return BASEBALL_EVENTS;
}

export function resolveCalendarEvent(
  sport: Sport,
  month = new Date().getMonth() + 1,
): { event: CalendarEvent; label: string } {
  const clamped = Math.min(12, Math.max(1, month));
  return eventMapForSport(sport)[clamped] ?? { event: 'in_season', label: 'In season' };
}

export function windowTypeForEvent(event: CalendarEvent, sportWindow?: WindowType): WindowType | 'hold' {
  if (event === 'off_season' || event === 'spring_training') return 'buy';
  if (event === 'playoffs') return 'sell';
  if (event === 'all_star') return 'hold';
  return sportWindow ?? 'hold';
}

function activeSportWindow(sport: Sport, now = new Date()): WindowType | undefined {
  const month = now.getMonth() + 1;
  const windows = getSeasonalWindows().filter((w) => w.sport === sport && w.isActive);
  if (windows.length > 0) return windows[0].type;
  // getSeasonalWindows already marks isActive from "now"; keep a fallback for tests that stub Date.
  const fallback = getSeasonalWindows().find((w) => {
    if (w.sport !== sport) return false;
    return w.startMonth <= w.endMonth
      ? month >= w.startMonth && month <= w.endMonth
      : month >= w.startMonth || month <= w.endMonth;
  });
  return fallback?.type;
}

export function getPlayerSeasonalHint(
  card: Pick<CardInventory, 'player' | 'sport' | 'league'>,
  now = new Date(),
): PlayerSeasonalHint {
  const calendar = resolveCalendarEvent(card.sport, now.getMonth() + 1);
  const sportWindow = activeSportWindow(card.sport, now);
  const windowType = windowTypeForEvent(calendar.event, sportWindow);
  const verb = windowType === 'buy' ? 'Buy window' : windowType === 'sell' ? 'Sell window' : 'Hold / monitor';
  return {
    player: card.player,
    sport: card.sport,
    league: card.league,
    cardCount: 1,
    windowType,
    event: calendar.event,
    eventLabel: calendar.label,
    label: `${verb} · ${calendar.label}`,
    rationale: `${card.player} (${card.league}) sits in a seeded ${calendar.label.toLowerCase()} window. Heuristic only — not a live tape.`,
    source: 'seeded_heuristic',
  };
}

/**
 * Per-player seasonal buy/sell hints for holdings. Seeded calendar + sport windows.
 */
export function getHoldingsSeasonalWindows(
  cards: CardInventory[],
  now = new Date(),
): PlayerSeasonalHint[] {
  const active = cards.filter((c) => c.status !== 'sold');
  const byPlayer = new Map<string, CardInventory[]>();
  for (const card of active) {
    const key = `${card.player.toLowerCase()}|${card.sport}`;
    const list = byPlayer.get(key) ?? [];
    list.push(card);
    byPlayer.set(key, list);
  }

  return [...byPlayer.values()]
    .map((group) => {
      const hint = getPlayerSeasonalHint(group[0], now);
      return { ...hint, cardCount: group.length };
    })
    .sort((a, b) => {
      const rank = (w: PlayerSeasonalHint['windowType']) => (w === 'sell' ? 0 : w === 'buy' ? 1 : 2);
      return rank(a.windowType) - rank(b.windowType) || b.cardCount - a.cardCount;
    });
}
