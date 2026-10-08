/**
 * Local-book calculations for v5 desks that previously rendered sample rows.
 * Figures come from the collection, watchlist, and audit log. They are planning
 * models with on-screen disclosure — not live marketplace tape, grader queues,
 * or a tax filing position.
 */
import type { AgentRecommendationRecord, CardInventory, MarketComp, Sport, TargetWatchlist } from '../../types';
import { preferredValueForCard } from '../pricing/compConsensus';

const DAY_MS = 86_400_000;
const LIQUID_SCORE = 60;
const RESERVE_TARGET_PCT = 15;
const WASH_DAYS = 30;

export const NEXT_FEATURE_DISCLOSURE =
  'Calculated from this collection. Not a live eBay, PSA, or statute feed.';

export function formatDeskMoney(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function cardLabel(card: Pick<CardInventory, 'year' | 'manufacturer' | 'player' | 'set' | 'cardNumber' | 'isGraded' | 'gradingCompany' | 'grade'>): string {
  const grade = card.isGraded && card.grade ? ` ${card.gradingCompany ?? ''} ${card.grade}` : '';
  return `${card.year} ${card.manufacturer} ${card.player} ${card.set} #${card.cardNumber}${grade}`.replace(/\s+/g, ' ').trim();
}

export function heldCards(cards: CardInventory[]): CardInventory[] {
  return cards.filter(card => card.status !== 'sold');
}

export function soldCards(cards: CardInventory[]): CardInventory[] {
  return cards.filter(card => card.status === 'sold' || Boolean(card.saleDate && card.salePrice));
}

export function markOf(card: CardInventory): number {
  return preferredValueForCard(card);
}

export function liquidityOf(card: CardInventory): number {
  if (typeof card.liquidityScore === 'number' && Number.isFinite(card.liquidityScore)) {
    return clamp(card.liquidityScore, 0, 100);
  }
  if (card.isVaulted) return 75;
  if (card.isGraded) return 55;
  return 35;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function daysSince(iso: string | undefined, now: number): number | null {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor((now - parsed) / DAY_MS));
}

function returnPct(card: CardInventory): number | null {
  if (!(card.purchasePrice > 0)) return null;
  const mark = markOf(card);
  if (!(mark > 0)) return null;
  return (mark - card.purchasePrice) / card.purchasePrice;
}

export interface LedgerSale {
  id: string;
  asset: string;
  price: number;
  venue: string;
  date: string;
  kind: 'sold-comp' | 'recorded-sale';
}

export function marketTruthLedger(cards: CardInventory[]): LedgerSale[] {
  const sales: LedgerSale[] = [];
  for (const card of cards) {
    for (const comp of card.salesData ?? []) {
      if (!(comp.price > 0)) continue;
      sales.push({
        id: `${card.id}-${comp.itemId ?? comp.soldAt}-${comp.price}`,
        asset: comp.title?.trim() || cardLabel(card),
        price: comp.price,
        venue: compVenue(comp),
        date: comp.soldAt?.slice(0, 10) || '—',
        kind: 'sold-comp',
      });
    }
    if (card.salePrice && card.salePrice > 0 && card.saleDate) {
      sales.push({
        id: `${card.id}-recorded`,
        asset: cardLabel(card),
        price: card.salePrice,
        venue: 'Recorded sale',
        date: card.saleDate.slice(0, 10),
        kind: 'recorded-sale',
      });
    }
  }
  return sales.sort((a, b) => b.date.localeCompare(a.date));
}

function compVenue(comp: MarketComp): string {
  const meta = comp.metadata?.venue;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();
  if (comp.listingUrl?.includes('ebay')) return 'eBay';
  return 'Sold comp';
}

export interface FairValueInterval {
  id: string;
  card: string;
  point: number;
  low: number;
  high: number;
  confidencePct: number;
  method: 'comps' | 'stored-mark';
}

export function fairValueIntervals(cards: CardInventory[]): FairValueInterval[] {
  return heldCards(cards).flatMap(card => {
    const prices = (card.salesData ?? []).map(comp => comp.price).filter(price => price > 0).sort((a, b) => a - b);
    if (prices.length > 0) {
      const mid = prices[Math.floor(prices.length / 2)];
      return [{
        id: card.id,
        card: cardLabel(card),
        point: mid,
        low: prices[0],
        high: prices[prices.length - 1],
        confidencePct: Math.min(90, 40 + prices.length * 10),
        method: 'comps' as const,
      }];
    }
    const stored = markOf(card);
    if (!(stored > 0)) return [];
    const width = card.valuationConfidence && card.valuationConfidence > 0
      ? clamp(1 - card.valuationConfidence, 0.08, 0.45)
      : 0.28;
    return [{
      id: card.id,
      card: cardLabel(card),
      point: stored,
      low: Math.round(stored * (1 - width)),
      high: Math.round(stored * (1 + width)),
      confidencePct: Math.round((card.valuationConfidence && card.valuationConfidence > 0 ? card.valuationConfidence : 0.4) * 100),
      method: 'stored-mark' as const,
    }];
  });
}

/** Higher liquidity and a longer horizon raise the odds. Asking closer to FMV lowers them. */
export function exitProbability(liquidityScore: number, horizonDays: number, fmvFraction: number): number {
  const liq = clamp(liquidityScore, 0, 100) / 100;
  const ask = clamp(fmvFraction, 0.5, 1);
  const daily = clamp(liq * (1.05 - ask), 0, 0.5);
  const probability = 1 - Math.pow(1 - daily, Math.max(1, horizonDays));
  return Math.round(clamp(probability, 0, 0.99) * 1000) / 1000;
}

export interface LiquidityHorizonRow {
  label: string;
  days: number;
  pct90: number;
  pct95: number;
  pct99: number;
}

export function portfolioLiquidityHorizons(cards: CardInventory[]): LiquidityHorizonRow[] {
  const held = heldCards(cards).filter(card => markOf(card) > 0);
  const nav = held.reduce((sum, card) => sum + markOf(card), 0);
  const horizons = [1, 7, 30, 90];
  return horizons.map(days => {
    const weighted = (fraction: number) => {
      if (nav <= 0) return 0;
      const total = held.reduce((sum, card) => sum + exitProbability(liquidityOf(card), days, fraction) * markOf(card), 0);
      return Math.round((total / nav) * 100);
    };
    return {
      label: days === 1 ? '1 day' : `${days} days`,
      days,
      pct90: weighted(0.9),
      pct95: weighted(0.95),
      pct99: weighted(0.99),
    };
  });
}

export interface WashWindow {
  lotId: string;
  asset: string;
  soldDate: string;
  washWindowEnd: string;
  clear: boolean;
}

export function washSaleWindows(cards: CardInventory[], now = Date.now()): WashWindow[] {
  return soldCards(cards).flatMap(card => {
    if (!card.saleDate) return [];
    const sold = Date.parse(card.saleDate);
    if (!Number.isFinite(sold)) return [];
    const end = sold + WASH_DAYS * DAY_MS;
    return [{
      lotId: card.id,
      asset: cardLabel(card),
      soldDate: card.saleDate.slice(0, 10),
      washWindowEnd: new Date(end).toISOString().slice(0, 10),
      clear: now > end,
    }];
  });
}

export interface ImmunizationView {
  durationMonths: number;
  targetMonths: number;
  trim: { id: string; asset: string; durationMonths: number }[];
}

export function portfolioImmunization(cards: CardInventory[]): ImmunizationView {
  const held = heldCards(cards).filter(card => markOf(card) > 0);
  const nav = held.reduce((sum, card) => sum + markOf(card), 0);
  const rows = held.map(card => {
    const durationMonths = Math.round(((100 - liquidityOf(card)) / 100) * 18 * 10) / 10;
    return { id: card.id, asset: cardLabel(card), durationMonths, weight: markOf(card) };
  });
  const durationMonths = nav > 0
    ? Math.round((rows.reduce((sum, row) => sum + row.durationMonths * row.weight, 0) / nav) * 10) / 10
    : 0;
  return {
    durationMonths,
    targetMonths: Math.round(durationMonths * 0.6 * 10) / 10,
    trim: [...rows].sort((a, b) => b.durationMonths - a.durationMonths).slice(0, 5),
  };
}

export interface ReserveView {
  recommendedPct: number;
  currentPct: number;
  gapPct: number;
  liquidNames: string[];
}

export function liquidityReserve(cards: CardInventory[]): ReserveView {
  const held = heldCards(cards);
  const nav = held.reduce((sum, card) => sum + markOf(card), 0);
  const liquid = held.filter(card => liquidityOf(card) >= LIQUID_SCORE);
  const liquidNav = liquid.reduce((sum, card) => sum + markOf(card), 0);
  const currentPct = nav > 0 ? Math.round((liquidNav / nav) * 1000) / 10 : 0;
  return {
    recommendedPct: RESERVE_TARGET_PCT,
    currentPct,
    gapPct: Math.round((RESERVE_TARGET_PCT - currentPct) * 10) / 10,
    liquidNames: liquid.slice(0, 8).map(cardLabel),
  };
}

export interface SnapshotBeta {
  beta: number | null;
  portfolioReturnPct: number | null;
  basketReturnPct: number | null;
  sports: number;
  note: string;
}

export function snapshotBeta(cards: CardInventory[]): SnapshotBeta {
  const held = heldCards(cards).filter(card => returnPct(card) !== null);
  if (held.length === 0) {
    return {
      beta: null,
      portfolioReturnPct: null,
      basketReturnPct: null,
      sports: 0,
      note: 'Add holdings with a cost and a mark. This snapshot is not a statistical beta.',
    };
  }
  let cost = 0;
  let value = 0;
  const bySport = new Map<string, { cost: number; value: number }>();
  for (const card of held) {
    const mark = markOf(card);
    cost += card.purchasePrice;
    value += mark;
    const bucket = bySport.get(card.sport) ?? { cost: 0, value: 0 };
    bucket.cost += card.purchasePrice;
    bucket.value += mark;
    bySport.set(card.sport, bucket);
  }
  const portfolio = (value - cost) / cost;
  const sportReturns = [...bySport.values()].filter(bucket => bucket.cost > 0).map(bucket => (bucket.value - bucket.cost) / bucket.cost);
  const basket = sportReturns.reduce((sum, row) => sum + row, 0) / sportReturns.length;
  const beta = Math.abs(basket) < 0.0001 ? null : Math.round((portfolio / basket) * 100) / 100;
  return {
    beta,
    portfolioReturnPct: Math.round(portfolio * 1000) / 10,
    basketReturnPct: Math.round(basket * 1000) / 10,
    sports: bySport.size,
    note: 'Single snapshot versus the equal-weight sport basket in this book. A statistical beta needs a price history.',
  };
}

export interface SpreadRow {
  id: string;
  card: string;
  venue: string;
  predictedSpreadPct: number;
}

export function bidAskSpreads(cards: CardInventory[]): SpreadRow[] {
  return heldCards(cards).filter(card => markOf(card) > 0).slice(0, 24).map(card => {
    const liq = liquidityOf(card);
    return {
      id: card.id,
      card: cardLabel(card),
      venue: card.vaultProvider || card.consignment?.houseName || 'Local book',
      predictedSpreadPct: Math.round(Math.max(2, (100 - liq) * 0.15) * 10) / 10,
    };
  });
}

export interface UrgencyRow {
  id: string;
  title: string;
  daysListed: number;
  urgencyScore: number;
}

export function sellerUrgency(targets: TargetWatchlist[], now = Date.now()): UrgencyRow[] {
  return targets
    .filter(target => target.status === 'active')
    .map(target => {
      const daysListed = daysSince(target.createdAt, now) ?? 0;
      const belowTarget = typeof target.currentMarketPrice === 'number'
        && target.targetPrice > 0
        && target.currentMarketPrice <= target.targetPrice;
      const urgencyScore = Math.round(clamp(daysListed / 90 * 70 + (belowTarget ? 30 : 0), 0, 100));
      return {
        id: target.id,
        title: target.cardDescription || target.player,
        daysListed,
        urgencyScore,
      };
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

export interface QueueRow {
  id: string;
  asset: string;
  tier: string;
  etaDays: string;
}

export function gradingQueue(cards: CardInventory[]): QueueRow[] {
  return heldCards(cards).filter(card => !card.isGraded).map(card => {
    const value = markOf(card) || card.purchasePrice;
    const tier = value >= 2000 ? 'Express planning band' : value >= 400 ? 'Regular planning band' : 'Economy planning band';
    const etaDays = value >= 2000 ? '5–15d' : value >= 400 ? '20–45d' : '45–120d';
    return { id: card.id, asset: cardLabel(card), tier, etaDays };
  });
}

export interface AttributionRow {
  id: string;
  event: string;
  asset: string;
  impactPct: number;
}

export function eventAttribution(cards: CardInventory[]): AttributionRow[] {
  return heldCards(cards).flatMap(card => {
    const change = returnPct(card);
    if (change === null) return [];
    const tagged = card.salesData?.find(comp => typeof comp.metadata?.event === 'string');
    const event = tagged && typeof tagged.metadata?.event === 'string'
      ? tagged.metadata.event
      : 'Holding period (no event tape)';
    return [{
      id: card.id,
      event,
      asset: cardLabel(card),
      impactPct: Math.round(change * 1000) / 10,
    }];
  }).sort((a, b) => Math.abs(b.impactPct) - Math.abs(a.impactPct));
}

export interface MomentumRow {
  sport: Sport;
  momentum: number;
  returnPct: number;
  lead: boolean;
}

export function crossSportMomentum(cards: CardInventory[]): MomentumRow[] {
  const buckets = new Map<Sport, { cost: number; value: number }>();
  for (const card of heldCards(cards)) {
    if (!(card.purchasePrice > 0) || !(markOf(card) > 0)) continue;
    const bucket = buckets.get(card.sport) ?? { cost: 0, value: 0 };
    bucket.cost += card.purchasePrice;
    bucket.value += markOf(card);
    buckets.set(card.sport, bucket);
  }
  const rows = [...buckets.entries()].map(([sport, bucket]) => {
    const change = (bucket.value - bucket.cost) / bucket.cost;
    return { sport, returnPct: Math.round(change * 1000) / 10, momentum: Math.round((1 + change) * 100) / 100, lead: false };
  }).sort((a, b) => b.momentum - a.momentum);
  if (rows[0]) rows[0].lead = true;
  return rows;
}

export interface FlowRow {
  segment: string;
  direction: 'inflow' | 'outflow' | 'flat';
  change: number;
  volume: number;
}

export function capitalFlows(cards: CardInventory[]): FlowRow[] {
  const groups = new Map<string, { cost: number; value: number }>();
  const add = (key: string, card: CardInventory) => {
    const bucket = groups.get(key) ?? { cost: 0, value: 0 };
    bucket.cost += card.purchasePrice;
    bucket.value += markOf(card);
    groups.set(key, bucket);
  };
  for (const card of heldCards(cards)) {
    add(card.sport, card);
    add(card.isGraded ? 'Graded' : 'Raw', card);
  }
  return [...groups.entries()].map(([segment, bucket]) => {
    const change = bucket.cost > 0 ? Math.round(((bucket.value - bucket.cost) / bucket.cost) * 1000) / 10 : 0;
    return {
      segment,
      direction: change > 0.5 ? 'inflow' : change < -0.5 ? 'outflow' : 'flat',
      change,
      volume: bucket.value,
    };
  }).sort((a, b) => b.volume - a.volume);
}

export interface LiquidationStep {
  order: number;
  id: string;
  asset: string;
  estRecovery: number;
  recoveryPct: number;
  timeline: string;
  cumulative: number;
}

export function liquidationPlan(cards: CardInventory[], targetCash: number): { sequence: LiquidationStep[]; recovered: number; shortfall: number } {
  const ranked = heldCards(cards)
    .map(card => {
      const liq = liquidityOf(card);
      const value = markOf(card);
      const haircut = ((100 - liq) / 100) * 0.45;
      return {
        id: card.id,
        asset: cardLabel(card),
        estRecovery: value * (1 - haircut),
        recoveryPct: Math.round((1 - haircut) * 100),
        timeline: liq >= 70 ? '0–24h' : liq >= 40 ? '1–7d' : '7d+',
        liquidity: liq,
      };
    })
    .filter(row => row.estRecovery > 0)
    .sort((a, b) => b.liquidity - a.liquidity || b.estRecovery - a.estRecovery);

  const sequence: LiquidationStep[] = [];
  let cumulative = 0;
  for (const row of ranked) {
    if (targetCash > 0 && cumulative >= targetCash) break;
    cumulative += row.estRecovery;
    sequence.push({
      order: sequence.length + 1,
      id: row.id,
      asset: row.asset,
      estRecovery: row.estRecovery,
      recoveryPct: row.recoveryPct,
      timeline: row.timeline,
      cumulative,
    });
  }
  return {
    sequence,
    recovered: cumulative,
    shortfall: Math.max(0, targetCash - cumulative),
  };
}

export interface CounterpartyNode {
  id: string;
  name: string;
  venues: string[];
  deals: number;
  lastActivity: string | null;
  idleDays: number | null;
  score: number;
  decay: number;
  disputesOnFile: number;
}

export function counterparties(cards: CardInventory[], now = Date.now()): CounterpartyNode[] {
  const map = new Map<string, { venues: Set<string>; deals: number; last: string | null }>();
  for (const card of cards) {
    const name = card.consignment?.houseName || (card.isVaulted ? card.vaultProvider : undefined);
    if (!name) continue;
    const node = map.get(name) ?? { venues: new Set<string>(), deals: 0, last: null };
    node.deals += 1;
    if (card.vaultProvider) node.venues.add(card.vaultProvider);
    if (card.consignment?.houseName) node.venues.add(card.consignment.houseName);
    const activity = card.consignment?.submittedAt || card.purchaseDate;
    if (activity && (!node.last || activity > node.last)) node.last = activity;
    map.set(name, node);
  }
  return [...map.entries()].map(([name, node]) => {
    const idleDays = daysSince(node.last ?? undefined, now);
    const idlePast = idleDays === null ? 0 : Math.max(0, idleDays - 90);
    const decay = -Math.min(40, Math.floor(idlePast / 30) * 2);
    return {
      id: name,
      name,
      venues: [...node.venues],
      deals: node.deals,
      lastActivity: node.last,
      idleDays,
      score: 80 + decay,
      decay,
      disputesOnFile: 0,
    };
  }).sort((a, b) => b.deals - a.deals);
}

export interface NarrativeRow {
  id: string;
  name: string;
  stage: string;
  progress: number;
  holdings: number;
}

export function narrativeLifecycles(cards: CardInventory[], now = Date.now()): NarrativeRow[] {
  const groups = new Map<string, CardInventory[]>();
  for (const card of heldCards(cards)) {
    const list = groups.get(card.player) ?? [];
    list.push(card);
    groups.set(card.player, list);
  }
  return [...groups.entries()].map(([player, list]) => {
    const changes = list.map(returnPct).filter((value): value is number => value !== null);
    const avg = changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : 0;
    const age = Math.max(...list.map(card => daysSince(card.purchaseDate, now) ?? 0));
    let stage = 'Mark drift';
    if (age < 30 && avg < 0.05) stage = 'Early hold';
    else if (avg >= 0.15) stage = 'Price move';
    else if (avg <= -0.1) stage = 'Exhaustion';
    return {
      id: player,
      name: player,
      stage,
      progress: Math.round(clamp(Math.abs(avg) * 100, 0, 100)),
      holdings: list.length,
    };
  }).sort((a, b) => b.progress - a.progress);
}

export interface IndexDefinition {
  id: string;
  name: string;
  sport: Sport | 'All';
  yearMin: number;
  yearMax: number;
  gradedOnly: boolean;
  playerQuery: string;
}

export function priceIndex(cards: CardInventory[], definition: IndexDefinition): { constituents: number; level: number | null; mark: number; cost: number } {
  const query = definition.playerQuery.trim().toLowerCase();
  const matched = heldCards(cards).filter(card => {
    if (definition.sport !== 'All' && card.sport !== definition.sport) return false;
    if (card.year < definition.yearMin || card.year > definition.yearMax) return false;
    if (definition.gradedOnly && !card.isGraded) return false;
    if (query && !card.player.toLowerCase().includes(query)) return false;
    return true;
  });
  const cost = matched.reduce((sum, card) => sum + card.purchasePrice, 0);
  const mark = matched.reduce((sum, card) => sum + markOf(card), 0);
  return {
    constituents: matched.length,
    level: cost > 0 ? Math.round((mark / cost) * 1000) / 10 : null,
    mark,
    cost,
  };
}

export interface RegulatoryItem {
  id: string;
  title: string;
  detail: string;
  severity: 'high' | 'info';
}

export function regulatoryChecklist(cards: CardInventory[], now = new Date()): RegulatoryItem[] {
  const year = now.getFullYear();
  const proceeds = soldCards(cards)
    .filter(card => card.saleDate && new Date(card.saleDate).getFullYear() === year)
    .reduce((sum, card) => sum + (card.salePrice || 0), 0);
  const longTerm = heldCards(cards).filter(card => (daysSince(card.purchaseDate, now.getTime()) ?? 0) >= 365).length;
  return [
    {
      id: 'proceeds',
      title: `${year} recorded sale proceeds ${formatDeskMoney(proceeds)}`,
      detail: 'Compare this with the 1099-K threshold your platforms and a tax advisor confirm. This desk does not monitor statute changes.',
      severity: proceeds >= 5000 ? 'high' : 'info',
    },
    {
      id: 'holding-period',
      title: `${longTerm} holding${longTerm === 1 ? '' : 's'} owned at least 365 days`,
      detail: 'Long-term collectibles gains have historically used a 28% federal maximum. Confirm the rate that applies before you file.',
      severity: 'info',
    },
    {
      id: 'wash-advisory',
      title: '30-day sale proximity is advisory',
      detail: 'The wash-sale calendar measures days around a recorded sale. It does not decide whether that rule applies to the card.',
      severity: 'info',
    },
  ];
}

export interface DelegationRow {
  id: string;
  agentAction: string;
  humanDecision: string;
  outcome: string;
  ts: string;
}

export function delegationRows(events: Array<Record<string, unknown>>): DelegationRow[] {
  return events.filter(event => {
    const category = String(event.category ?? '');
    const action = String(event.action ?? '');
    return category === 'autonomy' || /agent|autopilot|approv|delegat/i.test(action);
  }).map((event, index) => {
    const metadata = (event.metadata && typeof event.metadata === 'object') ? event.metadata as Record<string, unknown> : {};
    return {
      id: String(event.id ?? event.entity_id ?? index),
      agentAction: String(event.action ?? 'Agent action'),
      humanDecision: String(metadata.decision ?? metadata.humanDecision ?? 'Logged'),
      outcome: String(metadata.outcome ?? event.entity_type ?? '—'),
      ts: String(event.created_at ?? event.timestamp ?? ''),
    };
  });
}

export function delegationCsv(rows: DelegationRow[]): string {
  const header = 'timestamp,action,decision,outcome';
  const lines = rows.map(row => [row.ts, row.agentAction, row.humanDecision, row.outcome].map(csvCell).join(','));
  return [header, ...lines].join('\n');
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export interface ThesisResult {
  pnl: number;
  cagrPct: number | null;
  recommendations: number;
  matched: { id: string; player: string; pnl: number }[];
}

export function thesisBacktest(
  recommendations: AgentRecommendationRecord[],
  cards: CardInventory[],
  horizonMonths: number,
  now = Date.now(),
): ThesisResult {
  const cutoff = now - horizonMonths * 30 * DAY_MS;
  const inWindow = recommendations.filter(row => Date.parse(row.createdAt) >= cutoff);
  const acted = inWindow.filter(row => row.status === 'approved' || row.status === 'filled' || row.status === 'submitted');
  const matched: ThesisResult['matched'] = [];
  let cost = 0;
  for (const card of heldCards(cards)) {
    if (!(card.purchasePrice > 0)) continue;
    const hit = acted.find(row => `${row.summary} ${row.recommendedAction}`.toLowerCase().includes(card.player.toLowerCase()));
    if (!hit) continue;
    const pnl = markOf(card) - card.purchasePrice;
    matched.push({ id: card.id, player: card.player, pnl });
    cost += card.purchasePrice;
  }
  const pnl = matched.reduce((sum, row) => sum + row.pnl, 0);
  return {
    pnl,
    cagrPct: cost > 0 ? Math.round((pnl / cost) * (12 / horizonMonths) * 1000) / 10 : null,
    recommendations: inWindow.length,
    matched,
  };
}

export interface ConfidenceBucket {
  label: string;
  count: number;
  approvalPct: number | null;
}

const ACTED = new Set(['approved', 'filled', 'submitted']);

export function confidenceHistory(recommendations: AgentRecommendationRecord[], now = Date.now()): {
  approvalPct: number | null;
  rolling30: number | null;
  total: number;
  buckets: ConfidenceBucket[];
} {
  const rate = (rows: AgentRecommendationRecord[]) => {
    if (rows.length === 0) return null;
    const acted = rows.filter(row => ACTED.has(row.status)).length;
    return Math.round((acted / rows.length) * 100);
  };
  const last30 = recommendations.filter(row => Date.parse(row.createdAt) >= now - 30 * DAY_MS);
  const buckets: ConfidenceBucket[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(now);
    start.setMonth(start.getMonth() - offset, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const slice = recommendations.filter(row => {
      const created = Date.parse(row.createdAt);
      return created >= start.getTime() && created < end.getTime();
    });
    buckets.push({
      label: start.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      count: slice.length,
      approvalPct: rate(slice),
    });
  }
  return {
    approvalPct: rate(recommendations),
    rolling30: rate(last30),
    total: recommendations.length,
    buckets,
  };
}
