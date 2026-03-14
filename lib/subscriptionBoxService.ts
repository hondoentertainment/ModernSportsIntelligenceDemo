// ─── Phase 116: Subscription Box Intelligence ──────────────────────────────

export type SubscriptionProvider =
  | 'layton'
  | 'boombox'
  | 'mojobreak'
  | 'firehand'
  | 'cardboard_connection';

export interface SubscriptionTier {
  id: string;
  provider: SubscriptionProvider;
  tierName: string;            // e.g., "Gold", "Platinum", "Diamond"
  monthlyCost: number;
  sport: string;
  description: string;
  avgBoxesPerMonth: number;
  active: boolean;
}

export interface BoxHit {
  id: string;
  player: string;
  year: number;
  set: string;
  cardDescription: string;     // e.g., "Bowman Chrome Auto /250"
  estimatedValue: number;
  isNumbered: boolean;
  isAuto: boolean;
  is1of1: boolean;
  datePulled: string;
}

export interface BoxOpening {
  id: string;
  subscriptionId: string;
  provider: SubscriptionProvider;
  tierName: string;
  productName: string;
  openDate: string;
  cost: number;                // Allocated monthly cost for this box
  hits: BoxHit[];
  totalValue: number;
  roi: number;
  profit: number;
}

export interface SubscriptionROI {
  provider: SubscriptionProvider;
  tierName: string;
  totalSpent: number;
  totalValue: number;
  totalProfit: number;
  roi: number;
  boxCount: number;
  hitRate: number;             // avg hits per box
  bestHit: BoxHit | null;
}

export interface EVAnalysis {
  provider: SubscriptionProvider;
  tierName: string;
  month: string;
  expectedValue: number;
  actualValue: number;
  evRatio: number;             // actualValue / cost
  cost: number;
}

export interface MonthlyReport {
  month: string;
  totalSpent: number;
  totalValue: number;
  profit: number;
  roi: number;
  boxesOpened: number;
  totalHits: number;
  notableHits: BoxHit[];
  byProvider: {
    provider: SubscriptionProvider;
    spent: number;
    value: number;
    profit: number;
    roi: number;
  }[];
}

export interface ProviderComparison {
  provider: SubscriptionProvider;
  displayName: string;
  avgMonthlyROI: number;
  avgEVRatio: number;
  totalBoxes: number;
  hitRate: number;
  bestHitValue: number;
  consistencyScore: number;    // 0-100, lower variance = higher score
  overallRank: number;
}

// ─── Provider Display Names ─────────────────────────────────────────────────

const PROVIDER_NAMES: Record<SubscriptionProvider, string> = {
  layton: 'Layton Sports Cards',
  boombox: 'Boombox',
  mojobreak: 'Mojo Break',
  firehand: 'Firehand Cards',
  cardboard_connection: 'Cardboard Connection',
};

export function getProviderName(provider: SubscriptionProvider): string {
  return PROVIDER_NAMES[provider];
}

// ─── Mock Subscription Tiers ────────────────────────────────────────────────

const MOCK_SUBSCRIPTIONS: SubscriptionTier[] = [
  { id: 'sub-1', provider: 'layton', tierName: 'Silver', monthlyCost: 75, sport: 'Baseball', description: 'Monthly hobby box with guaranteed hit', avgBoxesPerMonth: 1, active: true },
  { id: 'sub-2', provider: 'layton', tierName: 'Gold', monthlyCost: 150, sport: 'Baseball', description: 'Premium hobby box + bonus packs', avgBoxesPerMonth: 1.5, active: true },
  { id: 'sub-3', provider: 'boombox', tierName: 'Standard', monthlyCost: 100, sport: 'Multi-Sport', description: 'Curated multi-sport box', avgBoxesPerMonth: 1, active: true },
  { id: 'sub-4', provider: 'boombox', tierName: 'Premium', monthlyCost: 200, sport: 'Multi-Sport', description: 'Premium multi-sport with guaranteed auto', avgBoxesPerMonth: 2, active: true },
  { id: 'sub-5', provider: 'mojobreak', tierName: 'Bronze', monthlyCost: 60, sport: 'Football', description: 'Entry-level football hobby box', avgBoxesPerMonth: 1, active: true },
  { id: 'sub-6', provider: 'mojobreak', tierName: 'Platinum', monthlyCost: 250, sport: 'Football', description: 'High-end football product', avgBoxesPerMonth: 1, active: false },
  { id: 'sub-7', provider: 'firehand', tierName: 'Starter', monthlyCost: 85, sport: 'Basketball', description: 'Basketball hobby box monthly', avgBoxesPerMonth: 1, active: true },
  { id: 'sub-8', provider: 'cardboard_connection', tierName: 'Elite', monthlyCost: 300, sport: 'Baseball', description: 'Premium high-end product each month', avgBoxesPerMonth: 1, active: true },
];

// ─── Mock Box Openings ──────────────────────────────────────────────────────

const MOCK_BOX_OPENINGS: BoxOpening[] = [
  {
    id: 'bo-1', subscriptionId: 'sub-1', provider: 'layton', tierName: 'Silver',
    productName: '2024 Topps Chrome Hobby', openDate: '2025-12-15', cost: 75,
    hits: [
      { id: 'h-1', player: 'Elly De La Cruz', year: 2024, set: 'Topps Chrome', cardDescription: 'Refractor Auto /499', estimatedValue: 120, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-12-15' },
      { id: 'h-2', player: 'Gunnar Henderson', year: 2024, set: 'Topps Chrome', cardDescription: 'Pink Refractor', estimatedValue: 18, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-12-15' },
    ],
    totalValue: 138, roi: 84, profit: 63,
  },
  {
    id: 'bo-2', subscriptionId: 'sub-2', provider: 'layton', tierName: 'Gold',
    productName: '2024 Bowman Chrome Hobby', openDate: '2025-12-20', cost: 150,
    hits: [
      { id: 'h-3', player: 'Ethan Salas', year: 2024, set: 'Bowman Chrome', cardDescription: '1st Bowman Chrome Auto', estimatedValue: 210, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-12-20' },
    ],
    totalValue: 210, roi: 40, profit: 60,
  },
  {
    id: 'bo-3', subscriptionId: 'sub-3', provider: 'boombox', tierName: 'Standard',
    productName: '2024 Panini Prizm Football Hobby', openDate: '2025-11-10', cost: 100,
    hits: [
      { id: 'h-4', player: 'Caleb Williams', year: 2024, set: 'Prizm', cardDescription: 'Silver Prizm RC', estimatedValue: 45, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-11-10' },
    ],
    totalValue: 65, roi: -35, profit: -35,
  },
  {
    id: 'bo-4', subscriptionId: 'sub-4', provider: 'boombox', tierName: 'Premium',
    productName: '2024 Panini Select Basketball Hobby', openDate: '2025-11-18', cost: 200,
    hits: [
      { id: 'h-5', player: 'Victor Wembanyama', year: 2024, set: 'Select', cardDescription: 'Courtside Silver Prizm', estimatedValue: 185, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-11-18' },
      { id: 'h-6', player: 'Chet Holmgren', year: 2024, set: 'Select', cardDescription: 'Auto /149', estimatedValue: 95, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-11-18' },
    ],
    totalValue: 280, roi: 40, profit: 80,
  },
  {
    id: 'bo-5', subscriptionId: 'sub-5', provider: 'mojobreak', tierName: 'Bronze',
    productName: '2024 Topps Football Hobby', openDate: '2025-10-05', cost: 60,
    hits: [
      { id: 'h-7', player: 'Marvin Harrison Jr', year: 2024, set: 'Topps', cardDescription: 'Rookie Auto /250', estimatedValue: 110, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-10-05' },
    ],
    totalValue: 130, roi: 116.7, profit: 70,
  },
  {
    id: 'bo-6', subscriptionId: 'sub-6', provider: 'mojobreak', tierName: 'Platinum',
    productName: '2024 Panini National Treasures Football', openDate: '2025-10-20', cost: 250,
    hits: [
      { id: 'h-8', player: 'Drake Maye', year: 2024, set: 'National Treasures', cardDescription: 'RPA /99', estimatedValue: 320, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-10-20' },
    ],
    totalValue: 320, roi: 28, profit: 70,
  },
  {
    id: 'bo-7', subscriptionId: 'sub-7', provider: 'firehand', tierName: 'Starter',
    productName: '2024 Panini Prizm Basketball Hobby', openDate: '2025-11-25', cost: 85,
    hits: [
      { id: 'h-9', player: 'Zach Edey', year: 2024, set: 'Prizm', cardDescription: 'Green Prizm RC', estimatedValue: 22, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-11-25' },
    ],
    totalValue: 42, roi: -50.6, profit: -43,
  },
  {
    id: 'bo-8', subscriptionId: 'sub-8', provider: 'cardboard_connection', tierName: 'Elite',
    productName: '2024 Topps Sterling Hobby', openDate: '2025-12-01', cost: 300,
    hits: [
      { id: 'h-10', player: 'Shohei Ohtani', year: 2024, set: 'Sterling', cardDescription: 'Auto Relic /25', estimatedValue: 475, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-12-01' },
      { id: 'h-11', player: 'Ronald Acuna Jr', year: 2024, set: 'Sterling', cardDescription: 'Patch Auto /50', estimatedValue: 180, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-12-01' },
    ],
    totalValue: 655, roi: 118.3, profit: 355,
  },
  {
    id: 'bo-9', subscriptionId: 'sub-1', provider: 'layton', tierName: 'Silver',
    productName: '2024 Topps Series 2 Hobby', openDate: '2025-11-15', cost: 75,
    hits: [
      { id: 'h-12', player: 'Jackson Holliday', year: 2024, set: 'Topps Series 2', cardDescription: 'SP Variation', estimatedValue: 35, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-11-15' },
    ],
    totalValue: 50, roi: -33.3, profit: -25,
  },
  {
    id: 'bo-10', subscriptionId: 'sub-2', provider: 'layton', tierName: 'Gold',
    productName: '2024 Topps Finest Hobby', openDate: '2025-11-22', cost: 150,
    hits: [
      { id: 'h-13', player: 'Junior Caminero', year: 2024, set: 'Finest', cardDescription: 'Green Refractor Auto /99', estimatedValue: 140, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-11-22' },
      { id: 'h-14', player: 'Corbin Carroll', year: 2024, set: 'Finest', cardDescription: 'Base Refractor', estimatedValue: 12, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-11-22' },
    ],
    totalValue: 152, roi: 1.3, profit: 2,
  },
  {
    id: 'bo-11', subscriptionId: 'sub-3', provider: 'boombox', tierName: 'Standard',
    productName: '2024 Topps Update Hobby', openDate: '2025-12-05', cost: 100,
    hits: [
      { id: 'h-15', player: 'Paul Skenes', year: 2024, set: 'Topps Update', cardDescription: 'Rookie Debut Auto', estimatedValue: 175, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-12-05' },
    ],
    totalValue: 195, roi: 95, profit: 95,
  },
  {
    id: 'bo-12', subscriptionId: 'sub-4', provider: 'boombox', tierName: 'Premium',
    productName: '2024 Panini Obsidian Football', openDate: '2025-12-12', cost: 200,
    hits: [
      { id: 'h-16', player: 'Jayden Daniels', year: 2024, set: 'Obsidian', cardDescription: 'Electric Etch Green Auto /50', estimatedValue: 225, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-12-12' },
    ],
    totalValue: 265, roi: 32.5, profit: 65,
  },
  {
    id: 'bo-13', subscriptionId: 'sub-5', provider: 'mojobreak', tierName: 'Bronze',
    productName: '2024 Panini Donruss Football Hobby', openDate: '2025-11-05', cost: 60,
    hits: [
      { id: 'h-17', player: 'Bo Nix', year: 2024, set: 'Donruss', cardDescription: 'Rated Rookie Auto', estimatedValue: 40, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-11-05' },
    ],
    totalValue: 55, roi: -8.3, profit: -5,
  },
  {
    id: 'bo-14', subscriptionId: 'sub-7', provider: 'firehand', tierName: 'Starter',
    productName: '2024 Panini Donruss Basketball Hobby', openDate: '2025-12-10', cost: 85,
    hits: [
      { id: 'h-18', player: 'Alexandre Sarr', year: 2024, set: 'Donruss', cardDescription: 'Rated Rookie Holo', estimatedValue: 28, isNumbered: false, isAuto: false, is1of1: false, datePulled: '2025-12-10' },
    ],
    totalValue: 38, roi: -55.3, profit: -47,
  },
  {
    id: 'bo-15', subscriptionId: 'sub-8', provider: 'cardboard_connection', tierName: 'Elite',
    productName: '2024 Bowman Draft Sapphire Hobby', openDate: '2025-12-22', cost: 300,
    hits: [
      { id: 'h-19', player: 'Travis Bazzana', year: 2024, set: 'Bowman Draft Sapphire', cardDescription: '1st Bowman Sapphire Auto', estimatedValue: 280, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-12-22' },
      { id: 'h-20', player: 'Charlie Condon', year: 2024, set: 'Bowman Draft Sapphire', cardDescription: '1st Bowman Sapphire /75', estimatedValue: 85, isNumbered: true, isAuto: false, is1of1: false, datePulled: '2025-12-22' },
    ],
    totalValue: 365, roi: 21.7, profit: 65,
  },
  {
    id: 'bo-16', subscriptionId: 'sub-3', provider: 'boombox', tierName: 'Standard',
    productName: '2024 Topps Chrome Black Hobby', openDate: '2025-10-15', cost: 100,
    hits: [
      { id: 'h-21', player: 'Yoshinobu Yamamoto', year: 2024, set: 'Chrome Black', cardDescription: 'Rookie Refractor Auto /199', estimatedValue: 160, isNumbered: true, isAuto: true, is1of1: false, datePulled: '2025-10-15' },
    ],
    totalValue: 178, roi: 78, profit: 78,
  },
  {
    id: 'bo-17', subscriptionId: 'sub-1', provider: 'layton', tierName: 'Silver',
    productName: '2024 Topps Heritage Hobby', openDate: '2025-10-18', cost: 75,
    hits: [
      { id: 'h-22', player: 'Wyatt Langford', year: 2024, set: 'Heritage', cardDescription: 'Real One Auto', estimatedValue: 65, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-10-18' },
    ],
    totalValue: 78, roi: 4, profit: 3,
  },
  {
    id: 'bo-18', subscriptionId: 'sub-7', provider: 'firehand', tierName: 'Starter',
    productName: '2024 Panini Contenders Basketball', openDate: '2025-10-28', cost: 85,
    hits: [
      { id: 'h-23', player: 'Reed Sheppard', year: 2024, set: 'Contenders', cardDescription: 'Rookie Ticket Auto', estimatedValue: 95, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-10-28' },
    ],
    totalValue: 108, roi: 27.1, profit: 23,
  },
  {
    id: 'bo-19', subscriptionId: 'sub-5', provider: 'mojobreak', tierName: 'Bronze',
    productName: '2024 Panini Mosaic Football', openDate: '2025-12-08', cost: 60,
    hits: [
      { id: 'h-24', player: 'Rome Odunze', year: 2024, set: 'Mosaic', cardDescription: 'Gold Mosaic /10', estimatedValue: 75, isNumbered: true, isAuto: false, is1of1: false, datePulled: '2025-12-08' },
    ],
    totalValue: 88, roi: 46.7, profit: 28,
  },
  {
    id: 'bo-20', subscriptionId: 'sub-4', provider: 'boombox', tierName: 'Premium',
    productName: '2024 Panini Prizm Football H2 Hybrid', openDate: '2025-10-25', cost: 200,
    hits: [
      { id: 'h-25', player: 'Malik Nabers', year: 2024, set: 'Prizm', cardDescription: 'Gold Vinyl /5', estimatedValue: 340, isNumbered: true, isAuto: false, is1of1: false, datePulled: '2025-10-25' },
    ],
    totalValue: 370, roi: 85, profit: 170,
  },
  {
    id: 'bo-21', subscriptionId: 'sub-2', provider: 'layton', tierName: 'Gold',
    productName: '2024 Topps Allen & Ginter Hobby', openDate: '2025-10-10', cost: 150,
    hits: [
      { id: 'h-26', player: 'Mike Trout', year: 2024, set: 'Allen & Ginter', cardDescription: 'Framed Mini Auto', estimatedValue: 190, isNumbered: false, isAuto: true, is1of1: false, datePulled: '2025-10-10' },
    ],
    totalValue: 210, roi: 40, profit: 60,
  },
];

// ─── Service Functions ──────────────────────────────────────────────────────

export function getSubscriptions(): SubscriptionTier[] {
  return MOCK_SUBSCRIPTIONS;
}

export function logBoxOpening(opening: Omit<BoxOpening, 'id' | 'totalValue' | 'roi' | 'profit'>): BoxOpening {
  const totalValue = opening.hits.reduce((s, h) => s + h.estimatedValue, 0);
  const profit = totalValue - opening.cost;
  const roi = opening.cost > 0 ? (profit / opening.cost) * 100 : 0;

  return {
    ...opening,
    id: crypto.randomUUID(),
    totalValue,
    roi,
    profit,
  };
}

export function getBoxOpenings(): BoxOpening[] {
  return MOCK_BOX_OPENINGS;
}

export function getROIByProvider(): SubscriptionROI[] {
  const openings = getBoxOpenings();
  const grouped = new Map<string, BoxOpening[]>();

  openings.forEach(o => {
    const key = `${o.provider}|${o.tierName}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(o);
  });

  const results: SubscriptionROI[] = [];
  grouped.forEach((boxes, key) => {
    const [provider, tierName] = key.split('|');
    const totalSpent = boxes.reduce((s, b) => s + b.cost, 0);
    const totalValue = boxes.reduce((s, b) => s + b.totalValue, 0);
    const totalProfit = totalValue - totalSpent;
    const allHits = boxes.flatMap(b => b.hits);
    const bestHit = allHits.length > 0
      ? allHits.reduce((best, h) => h.estimatedValue > best.estimatedValue ? h : best, allHits[0])
      : null;

    results.push({
      provider: provider as SubscriptionProvider,
      tierName,
      totalSpent,
      totalValue,
      totalProfit,
      roi: totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0,
      boxCount: boxes.length,
      hitRate: boxes.length > 0 ? allHits.length / boxes.length : 0,
      bestHit,
    });
  });

  return results.sort((a, b) => b.roi - a.roi);
}

export function getEVAnalysis(): EVAnalysis[] {
  const openings = getBoxOpenings();
  const byMonthProvider = new Map<string, BoxOpening[]>();

  openings.forEach(o => {
    const d = new Date(o.openDate);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const key = `${month}|${o.provider}|${o.tierName}`;
    if (!byMonthProvider.has(key)) byMonthProvider.set(key, []);
    byMonthProvider.get(key)!.push(o);
  });

  const results: EVAnalysis[] = [];
  byMonthProvider.forEach((boxes, key) => {
    const [month, provider, tierName] = key.split('|');
    const totalCost = boxes.reduce((s, b) => s + b.cost, 0);
    const totalValue = boxes.reduce((s, b) => s + b.totalValue, 0);

    results.push({
      provider: provider as SubscriptionProvider,
      tierName,
      month,
      expectedValue: totalCost * 0.9,  // Typical sealed product EV
      actualValue: totalValue,
      evRatio: totalCost > 0 ? totalValue / totalCost : 0,
      cost: totalCost,
    });
  });

  return results.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
}

export function getMonthlyReport(month?: string): MonthlyReport {
  const openings = getBoxOpenings();
  const targetMonth = month || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const monthOpenings = openings.filter(o => {
    const d = new Date(o.openDate);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === targetMonth;
  });

  const totalSpent = monthOpenings.reduce((s, b) => s + b.cost, 0);
  const totalValue = monthOpenings.reduce((s, b) => s + b.totalValue, 0);
  const profit = totalValue - totalSpent;
  const allHits = monthOpenings.flatMap(b => b.hits);
  const notableHits = allHits.filter(h => h.estimatedValue >= 75).sort((a, b) => b.estimatedValue - a.estimatedValue);

  // Group by provider
  const providerMap = new Map<SubscriptionProvider, { spent: number; value: number }>();
  monthOpenings.forEach(o => {
    const existing = providerMap.get(o.provider) || { spent: 0, value: 0 };
    existing.spent += o.cost;
    existing.value += o.totalValue;
    providerMap.set(o.provider, existing);
  });

  const byProvider = Array.from(providerMap.entries()).map(([provider, data]) => ({
    provider,
    spent: data.spent,
    value: data.value,
    profit: data.value - data.spent,
    roi: data.spent > 0 ? ((data.value - data.spent) / data.spent) * 100 : 0,
  }));

  return {
    month: targetMonth,
    totalSpent,
    totalValue,
    profit,
    roi: totalSpent > 0 ? (profit / totalSpent) * 100 : 0,
    boxesOpened: monthOpenings.length,
    totalHits: allHits.length,
    notableHits,
    byProvider,
  };
}

export function compareProviders(): ProviderComparison[] {
  const openings = getBoxOpenings();
  const grouped = new Map<SubscriptionProvider, BoxOpening[]>();

  openings.forEach(o => {
    if (!grouped.has(o.provider)) grouped.set(o.provider, []);
    grouped.get(o.provider)!.push(o);
  });

  const comparisons: ProviderComparison[] = [];
  grouped.forEach((boxes, provider) => {
    const totalSpent = boxes.reduce((s, b) => s + b.cost, 0);
    const totalValue = boxes.reduce((s, b) => s + b.totalValue, 0);
    const allHits = boxes.flatMap(b => b.hits);
    const avgROI = totalSpent > 0 ? ((totalValue - totalSpent) / totalSpent) * 100 : 0;
    const avgEV = totalSpent > 0 ? totalValue / totalSpent : 0;
    const bestHitValue = allHits.length > 0 ? Math.max(...allHits.map(h => h.estimatedValue)) : 0;

    // Consistency = inverse of ROI std dev (normalized)
    const rois = boxes.map(b => b.roi);
    const meanROI = rois.reduce((s, r) => s + r, 0) / rois.length;
    const variance = rois.reduce((s, r) => s + Math.pow(r - meanROI, 2), 0) / rois.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, Math.min(100, 100 - stdDev));

    comparisons.push({
      provider,
      displayName: PROVIDER_NAMES[provider],
      avgMonthlyROI: avgROI,
      avgEVRatio: avgEV,
      totalBoxes: boxes.length,
      hitRate: boxes.length > 0 ? allHits.length / boxes.length : 0,
      bestHitValue,
      consistencyScore,
      overallRank: 0,
    });
  });

  // Rank by a composite score: ROI weight 40%, EV 25%, consistency 20%, hit rate 15%
  comparisons.sort((a, b) => {
    const scoreA = a.avgMonthlyROI * 0.4 + a.avgEVRatio * 25 + a.consistencyScore * 0.2 + a.hitRate * 15;
    const scoreB = b.avgMonthlyROI * 0.4 + b.avgEVRatio * 25 + b.consistencyScore * 0.2 + b.hitRate * 15;
    return scoreB - scoreA;
  });

  comparisons.forEach((c, idx) => { c.overallRank = idx + 1; });
  return comparisons;
}

export function getHitHistory(): BoxHit[] {
  const openings = getBoxOpenings();
  return openings
    .flatMap(o => o.hits)
    .sort((a, b) => new Date(b.datePulled).getTime() - new Date(a.datePulled).getTime());
}

export function getBestValueTier(): SubscriptionTier | null {
  const roiData = getROIByProvider();
  if (roiData.length === 0) return null;

  const bestROI = roiData[0]; // Already sorted by ROI desc
  const subs = getSubscriptions();
  return subs.find(s => s.provider === bestROI.provider && s.tierName === bestROI.tierName) || null;
}

export function getMonthlyTrendData(): { month: string; spent: number; value: number; profit: number; roi: number }[] {
  const openings = getBoxOpenings();
  const byMonth = new Map<string, BoxOpening[]>();

  openings.forEach(o => {
    const d = new Date(o.openDate);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(o);
  });

  const results = Array.from(byMonth.entries()).map(([month, boxes]) => {
    const spent = boxes.reduce((s, b) => s + b.cost, 0);
    const value = boxes.reduce((s, b) => s + b.totalValue, 0);
    const profit = value - spent;
    return {
      month,
      spent,
      value,
      profit,
      roi: spent > 0 ? (profit / spent) * 100 : 0,
    };
  });

  return results.sort((a, b) => {
    // Sort chronologically
    const parseMonth = (m: string) => {
      const [mon, yr] = m.split(' ');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return parseInt('20' + yr) * 12 + months.indexOf(mon);
    };
    return parseMonth(a.month) - parseMonth(b.month);
  });
}
