import { CardInventory, Sport } from '../types';
import { store } from './dal/syncStore';

// ---- Types ----

export type StrategyProfile = 'conservative' | 'aggressive' | 'long_term' | 'completion';

export interface CollectionGap {
  id: string;
  type: 'sport' | 'decade' | 'manufacturer' | 'grade';
  description: string;
  priority: number; // 1-5
  suggestion: string;
}

export interface BuyRecommendation {
  id: string;
  player: string;
  sport: Sport;
  year: number;
  set: string;
  estimatedPrice: number;
  fitScore: number; // 0-100
  reasoning: string;
}

export interface SellRecommendation {
  id: string;
  cardId: string;
  player: string;
  reasoning: string;
  urgency: 'high' | 'medium' | 'low';
  estimatedPeakWindow: string;
}

export interface RiskAssessment {
  concentrationRisk: number; // 0-100
  liquidityRisk: number; // 0-100
  marketExposure: number; // 0-100
  compositeScore: number; // 0-100
  mitigations: string[];
}

export interface WeeklyDigest {
  topBuys: BuyRecommendation[];
  topSells: SellRecommendation[];
  gapToFill: CollectionGap | null;
  riskSummary: string;
  strategyAlignment: number; // 0-100
}

export interface AdvisorFeedback {
  recommendationId: string;
  feedback: 'thumbs_up' | 'thumbs_down';
  timestamp: string;
}

// ---- Constants ----

const STRATEGY_KEY = 'msi_advisor_strategy';
const FEEDBACK_KEY = 'msi_advisor_feedback';

const ALL_SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
const ALL_DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const MAJOR_MANUFACTURERS = ['Topps', 'Panini', 'Upper Deck', 'Bowman', 'Donruss', 'Fleer'];
const _GRADE_TIERS = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'SGC 10', 'Raw'];

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function seededPick<T>(arr: T[], seed: number, offset: number): T {
  const idx = Math.floor(seededRange(seed, offset, 0, arr.length));
  return arr[Math.min(idx, arr.length - 1)];
}

// ---- localStorage helpers ----

export function getStrategy(): StrategyProfile {
  const raw = store.get<string>(STRATEGY_KEY, 'conservative');
  if (['conservative', 'aggressive', 'long_term', 'completion'].includes(raw)) {
    return raw as StrategyProfile;
  }
  return 'conservative';
}

export function setStrategy(strategy: StrategyProfile): void {
  store.set(STRATEGY_KEY, strategy);
}

function loadFeedback(): AdvisorFeedback[] {
  return store.get<AdvisorFeedback[]>(FEEDBACK_KEY, []);
}

function saveFeedback(feedbacks: AdvisorFeedback[]): void {
  store.set(FEEDBACK_KEY, feedbacks);
}

export function submitFeedback(recommendationId: string, feedback: 'thumbs_up' | 'thumbs_down'): void {
  const existing = loadFeedback();
  // Replace existing feedback for this recommendation or add new
  const filtered = existing.filter(f => f.recommendationId !== recommendationId);
  filtered.push({
    recommendationId,
    feedback,
    timestamp: new Date().toISOString(),
  });
  saveFeedback(filtered);
}

export function getFeedbackStats(): { totalFeedback: number; positiveRate: number } {
  const feedbacks = loadFeedback();
  const total = feedbacks.length;
  if (total === 0) return { totalFeedback: 0, positiveRate: 0 };
  const positive = feedbacks.filter(f => f.feedback === 'thumbs_up').length;
  return {
    totalFeedback: total,
    positiveRate: Math.round((positive / total) * 100),
  };
}

// ---- Gap Analysis ----

export function analyzeGaps(inventory: CardInventory[]): CollectionGap[] {
  const gaps: CollectionGap[] = [];
  const _seed = dateSeed();

  if (inventory.length === 0) {
    gaps.push({
      id: 'gap-empty',
      type: 'sport',
      description: 'Your collection is empty. Start building across multiple sports for diversification.',
      priority: 5,
      suggestion: 'Begin with blue-chip cards from Baseball and Basketball to establish a foundation.',
    });
    return gaps;
  }

  // Sport gaps
  const sportCounts: Record<string, number> = {};
  for (const card of inventory) {
    sportCounts[card.sport] = (sportCounts[card.sport] || 0) + 1;
  }
  for (const sport of ALL_SPORTS) {
    if (!sportCounts[sport]) {
      gaps.push({
        id: `gap-sport-${sport.toLowerCase()}`,
        type: 'sport',
        description: `No ${sport} cards in your collection. This limits diversification across major sports markets.`,
        priority: 4,
        suggestion: `Add 2-3 ${sport} cards from recent sets to establish a position in the ${sport} market.`,
      });
    } else if (sportCounts[sport] < 3 && inventory.length > 10) {
      gaps.push({
        id: `gap-sport-low-${sport.toLowerCase()}`,
        type: 'sport',
        description: `Only ${sportCounts[sport]} ${sport} card${sportCounts[sport] === 1 ? '' : 's'}. Underrepresented relative to collection size.`,
        priority: 2,
        suggestion: `Consider adding more ${sport} cards to balance your portfolio distribution.`,
      });
    }
  }

  // Decade gaps
  const decadeCounts: Record<number, number> = {};
  for (const card of inventory) {
    const decade = Math.floor(card.year / 10) * 10;
    decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
  }
  for (const decade of ALL_DECADES) {
    if (!decadeCounts[decade] && decade < 2020) {
      const priority = decade < 1980 ? 3 : 2;
      gaps.push({
        id: `gap-decade-${decade}`,
        type: 'decade',
        description: `No cards from the ${decade}s. ${decade < 1980 ? 'Vintage cards provide long-term value stability.' : 'This era has strong collector demand.'}`,
        priority,
        suggestion: `Look for affordable ${decade}s cards from major sets to fill this era gap.`,
      });
    }
  }

  // Manufacturer gaps
  const mfgCounts: Record<string, number> = {};
  for (const card of inventory) {
    mfgCounts[card.manufacturer] = (mfgCounts[card.manufacturer] || 0) + 1;
  }
  const representedMfgs = Object.keys(mfgCounts);
  for (const mfg of MAJOR_MANUFACTURERS) {
    if (!mfgCounts[mfg] && representedMfgs.length < 4) {
      gaps.push({
        id: `gap-mfg-${mfg.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'manufacturer',
        description: `No ${mfg} cards. Diversifying across manufacturers reduces brand-specific market risk.`,
        priority: 2,
        suggestion: `Add a ${mfg} flagship product card to broaden manufacturer exposure.`,
      });
    }
  }

  // Grade gaps
  const hasGraded = inventory.some(c => c.isGraded);
  const hasRaw = inventory.some(c => !c.isGraded);
  const hasHighGrade = inventory.some(c => c.grade && (c.grade.includes('10') || c.grade.includes('9.5')));
  const hasMidGrade = inventory.some(c => c.grade && (c.grade.includes('8') || c.grade.includes('7')));

  if (!hasGraded && inventory.length > 5) {
    gaps.push({
      id: 'gap-grade-none',
      type: 'grade',
      description: 'No graded cards in your collection. Graded cards typically command premium prices and are easier to liquidate.',
      priority: 4,
      suggestion: 'Submit your best raw cards for grading or purchase PSA/BGS graded cards directly.',
    });
  }
  if (hasGraded && !hasHighGrade) {
    gaps.push({
      id: 'gap-grade-high',
      type: 'grade',
      description: 'No gem mint (PSA 10/BGS 9.5+) cards. High-grade cards drive the most appreciation.',
      priority: 3,
      suggestion: 'Target PSA 10 or BGS 9.5+ graded cards for maximum long-term value.',
    });
  }
  if (hasGraded && !hasMidGrade && !hasRaw) {
    gaps.push({
      id: 'gap-grade-mid',
      type: 'grade',
      description: 'Collection skews entirely high-grade. Mid-grade cards offer value entry points.',
      priority: 1,
      suggestion: 'Consider mid-grade vintage cards which offer better value relative to population.',
    });
  }

  // Sort by priority descending
  gaps.sort((a, b) => b.priority - a.priority);
  return gaps;
}

// ---- Buy Recommendations ----

const BUY_PLAYERS: Record<Sport, string[]> = {
  Baseball: ['Mike Trout', 'Shohei Ohtani', 'Juan Soto', 'Ronald Acuna Jr.', 'Julio Rodriguez', 'Corbin Carroll', 'Gunnar Henderson', 'Bobby Witt Jr.'],
  Basketball: ['Luka Doncic', 'Victor Wembanyama', 'Anthony Edwards', 'Jayson Tatum', 'Shai Gilgeous-Alexander', 'Tyrese Haliburton', 'Chet Holmgren', 'Paolo Banchero'],
  Football: ['Patrick Mahomes', 'Caleb Williams', 'CJ Stroud', 'Brock Purdy', 'Lamar Jackson', 'Joe Burrow', 'Ja\'Marr Chase', 'Puka Nacua'],
  Hockey: ['Connor McDavid', 'Connor Bedard', 'Auston Matthews', 'Cale Makar', 'Nathan MacKinnon', 'Macklin Celebrini', 'Leon Draisaitl', 'Igor Shesterkin'],
  Soccer: ['Jude Bellingham', 'Kylian Mbappe', 'Erling Haaland', 'Lamine Yamal', 'Florian Wirtz', 'Phil Foden', 'Vinicius Jr.', 'Pedri'],
};

const BUY_SETS: Record<Sport, string[]> = {
  Baseball: ['Topps Chrome', 'Bowman Chrome', 'Topps Heritage', 'Topps Finest', 'Bowman 1st'],
  Basketball: ['Prizm', 'Select', 'Optic', 'National Treasures', 'Flawless'],
  Football: ['Prizm', 'Optic', 'Mosaic', 'Select', 'National Treasures'],
  Hockey: ['Upper Deck Young Guns', 'O-Pee-Chee', 'SP Authentic', 'Upper Deck Series 1', 'Tim Hortons'],
  Soccer: ['Topps Chrome UCL', 'Panini Prizm', 'Topps Merlin', 'Donruss', 'Select'],
};

export function getBuyRecommendations(inventory: CardInventory[], strategy: StrategyProfile): BuyRecommendation[] {
  const seed = dateSeed();
  const recommendations: BuyRecommendation[] = [];

  // Determine owned players to avoid duplicates
  const ownedPlayers = new Set(inventory.map(c => c.player));

  // Determine inventory sport distribution for gap-filling
  const sportCounts: Record<string, number> = {};
  for (const card of inventory) {
    sportCounts[card.sport] = (sportCounts[card.sport] || 0) + 1;
  }
  const _totalCards = inventory.length;

  const count = Math.floor(seededRange(seed, 200, 5, 10));

  for (let i = 0; i < count; i++) {
    const recSeed = seed + hashString(`buy-${i}`);

    // Pick sport - bias based on strategy
    let sport: Sport;
    if (strategy === 'completion') {
      // Favor underrepresented sports
      const underrep = ALL_SPORTS.filter(s => !sportCounts[s] || sportCounts[s] < 2);
      sport = underrep.length > 0
        ? seededPick(underrep, recSeed, 0)
        : seededPick(ALL_SPORTS, recSeed, 0);
    } else if (strategy === 'conservative') {
      // Favor Baseball and Basketball (blue chips)
      sport = seededRandom(recSeed, 0) < 0.6
        ? seededPick(['Baseball', 'Basketball'] as Sport[], recSeed, 1)
        : seededPick(ALL_SPORTS, recSeed, 1);
    } else if (strategy === 'aggressive') {
      // Favor high-volatility sports
      sport = seededPick(ALL_SPORTS, recSeed, 0);
    } else {
      // long_term — favor Baseball
      sport = seededRandom(recSeed, 0) < 0.5
        ? 'Baseball' as Sport
        : seededPick(ALL_SPORTS, recSeed, 1);
    }

    const playerPool = BUY_PLAYERS[sport];
    const setPool = BUY_SETS[sport];
    const player = seededPick(playerPool, recSeed, 10);
    const set = seededPick(setPool, recSeed, 20);

    // Year selection based on strategy
    let year: number;
    if (strategy === 'long_term') {
      year = Math.floor(seededRange(recSeed, 30, 1960, 2015));
    } else if (strategy === 'aggressive') {
      year = Math.floor(seededRange(recSeed, 30, 2020, 2026));
    } else if (strategy === 'conservative') {
      year = Math.floor(seededRange(recSeed, 30, 2015, 2025));
    } else {
      year = Math.floor(seededRange(recSeed, 30, 1980, 2025));
    }

    // Price based on strategy
    let estimatedPrice: number;
    if (strategy === 'conservative') {
      estimatedPrice = seededRange(recSeed, 40, 100, 2000);
    } else if (strategy === 'aggressive') {
      estimatedPrice = seededRange(recSeed, 40, 20, 300);
    } else if (strategy === 'long_term') {
      estimatedPrice = seededRange(recSeed, 40, 200, 5000);
    } else {
      estimatedPrice = seededRange(recSeed, 40, 30, 500);
    }

    // Fit score
    let fitScore = Math.round(seededRange(recSeed, 50, 50, 98));
    // Boost fit score if not already owned
    if (!ownedPlayers.has(player)) fitScore = Math.min(100, fitScore + 10);
    // Boost if fills sport gap
    if (!sportCounts[sport]) fitScore = Math.min(100, fitScore + 15);

    // Reasoning based on strategy
    let reasoning: string;
    switch (strategy) {
      case 'conservative':
        reasoning = `${player} is a proven star with consistent demand. ${set} ${year} holds value well in the ${sport} market. Blue-chip investment with low downside risk.`;
        break;
      case 'aggressive':
        reasoning = `${player} is showing breakout momentum. ${set} ${year} is currently undervalued relative to comparable sales. High upside potential for a quick flip.`;
        break;
      case 'long_term':
        reasoning = `${year < 2000 ? 'Vintage' : 'Modern'} ${player} cards have strong long-term appreciation. ${set} carries premium demand among serious collectors.`;
        break;
      case 'completion':
        reasoning = `Adding ${player} fills a ${sport} gap in your collection. ${set} ${year} is a core set that improves overall portfolio completeness.`;
        break;
    }

    recommendations.push({
      id: `buy-${i}-${hashString(player + set + year)}`,
      player,
      sport,
      year,
      set,
      estimatedPrice: Math.round(estimatedPrice * 100) / 100,
      fitScore,
      reasoning,
    });
  }

  // Sort by fit score descending
  recommendations.sort((a, b) => b.fitScore - a.fitScore);
  return recommendations;
}

// ---- Sell Recommendations ----

export function getSellRecommendations(inventory: CardInventory[]): SellRecommendation[] {
  const seed = dateSeed();
  const recommendations: SellRecommendation[] = [];

  const activeCards = inventory.filter(c => c.status !== 'sold');
  if (activeCards.length === 0) return [];

  for (const card of activeCards) {
    const cv = card.currentValue ?? card.purchasePrice;
    const pp = card.purchasePrice;
    const ratio = cv / pp;
    const cardHash = hashString(card.id + card.player);
    const cardSeed = seed + cardHash;

    // Only recommend selling ~30-40% of cards
    if (seededRandom(cardSeed, 300) > 0.38) continue;

    let urgency: 'high' | 'medium' | 'low';
    let reasoning: string;
    let peakWindow: string;

    if (ratio > 2.0) {
      // Card has more than doubled — high urgency sell signal
      urgency = 'high';
      reasoning = `${card.player} ${card.year} ${card.set} has appreciated ${((ratio - 1) * 100).toFixed(0)}% from purchase. Historical patterns suggest taking profits at this level. Market sentiment may be peaking.`;
      peakWindow = '1-2 weeks';
    } else if (ratio > 1.4) {
      // Solid gains — medium urgency
      urgency = 'medium';
      reasoning = `Strong ${((ratio - 1) * 100).toFixed(0)}% gain on ${card.player}. Consider partial position exit to lock in profits while maintaining upside exposure.`;
      peakWindow = '2-4 weeks';
    } else if (ratio < 0.7) {
      // Declining — consider tax-loss harvest
      urgency = 'medium';
      reasoning = `${card.player} is down ${((1 - ratio) * 100).toFixed(0)}% from purchase. Consider selling for tax-loss harvesting or reallocating capital to higher-conviction positions.`;
      peakWindow = 'Already past peak — sell for reallocation';
    } else {
      // Moderate position — low urgency
      urgency = 'low';
      const weeksToWindow = Math.round(seededRange(cardSeed, 310, 3, 12));
      reasoning = `${card.player} ${card.year} ${card.set} is approaching a seasonal demand window. ${card.sport} cards typically see elevated prices during the upcoming season.`;
      peakWindow = `${weeksToWindow}-${weeksToWindow + 4} weeks`;
    }

    recommendations.push({
      id: `sell-${card.id}-${cardHash}`,
      cardId: card.id,
      player: card.player,
      reasoning,
      urgency,
      estimatedPeakWindow: peakWindow,
    });
  }

  // Sort: high urgency first, then medium, then low
  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  return recommendations;
}

// ---- Risk Assessment ----

export function assessRisk(inventory: CardInventory[]): RiskAssessment {
  if (inventory.length === 0) {
    return {
      concentrationRisk: 0,
      liquidityRisk: 0,
      marketExposure: 0,
      compositeScore: 0,
      mitigations: ['Add cards to your collection to begin risk analysis.'],
    };
  }

  const activeCards = inventory.filter(c => c.status !== 'sold');
  const totalValue = activeCards.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);

  // Concentration risk: how much value is in a single player/sport
  const playerValues: Record<string, number> = {};
  const sportValues: Record<string, number> = {};
  for (const card of activeCards) {
    const cv = card.currentValue ?? card.purchasePrice;
    playerValues[card.player] = (playerValues[card.player] || 0) + cv;
    sportValues[card.sport] = (sportValues[card.sport] || 0) + cv;
  }

  const maxPlayerConcentration = totalValue > 0
    ? (Math.max(...Object.values(playerValues)) / totalValue) * 100
    : 0;
  const maxSportConcentration = totalValue > 0
    ? (Math.max(...Object.values(sportValues)) / totalValue) * 100
    : 0;
  const concentrationRisk = Math.min(100, Math.round(
    maxPlayerConcentration * 0.6 + maxSportConcentration * 0.4
  ));

  // Liquidity risk: based on graded vs raw, autographed, condition
  const rawCount = activeCards.filter(c => !c.isGraded).length;
  const rawRatio = activeCards.length > 0 ? rawCount / activeCards.length : 0;
  const lowLiquidityCount = activeCards.filter(c => {
    const ls = c.liquidityScore ?? 50;
    return ls < 40;
  }).length;
  const lowLiqRatio = activeCards.length > 0 ? lowLiquidityCount / activeCards.length : 0;
  const liquidityRisk = Math.min(100, Math.round(
    rawRatio * 40 + lowLiqRatio * 60
  ));

  // Market exposure: how correlated positions are (sport/year clustering)
  const uniqueSports = new Set(activeCards.map(c => c.sport)).size;
  const yearSpread = activeCards.length > 1
    ? Math.max(...activeCards.map(c => c.year)) - Math.min(...activeCards.map(c => c.year))
    : 0;
  const sportDiversification = Math.min(5, uniqueSports) / 5;
  const yearDiversification = Math.min(50, yearSpread) / 50;
  const marketExposure = Math.min(100, Math.round(
    (1 - sportDiversification * 0.5 - yearDiversification * 0.5) * 100
  ));

  // Composite score
  const compositeScore = Math.round(
    concentrationRisk * 0.35 + liquidityRisk * 0.3 + marketExposure * 0.35
  );

  // Generate mitigations
  const mitigations: string[] = [];
  if (concentrationRisk > 60) {
    const topPlayer = Object.entries(playerValues).sort((a, b) => b[1] - a[1])[0];
    if (topPlayer) {
      mitigations.push(`Reduce ${topPlayer[0]} concentration — currently ${((topPlayer[1] / totalValue) * 100).toFixed(0)}% of portfolio value.`);
    }
  }
  if (concentrationRisk > 40) {
    const sportCount = Object.keys(sportValues).length;
    if (sportCount < 3) {
      mitigations.push(`Diversify across more sports. Currently only ${sportCount} sport${sportCount === 1 ? '' : 's'} represented.`);
    }
  }
  if (liquidityRisk > 50) {
    mitigations.push('Grade your highest-value raw cards to improve liquidity and marketability.');
  }
  if (liquidityRisk > 30) {
    mitigations.push('Consider adding more widely-traded cards (flagship sets, star players) to improve overall liquidity.');
  }
  if (marketExposure > 60) {
    mitigations.push('Add cards from different eras and sports to reduce market correlation risk.');
  }
  if (marketExposure > 40) {
    mitigations.push('Include some vintage cards (pre-2000) to hedge against modern market volatility.');
  }
  if (compositeScore > 70) {
    mitigations.push('Overall risk is elevated. Consider rebalancing: sell concentrated positions and reinvest in diversified assets.');
  }
  if (mitigations.length === 0) {
    mitigations.push('Portfolio risk levels are well-managed. Continue monitoring and rebalancing periodically.');
  }

  return {
    concentrationRisk: Math.min(100, concentrationRisk),
    liquidityRisk: Math.min(100, liquidityRisk),
    marketExposure: Math.min(100, marketExposure),
    compositeScore: Math.min(100, compositeScore),
    mitigations,
  };
}

// ---- Weekly Digest ----

export function generateWeeklyDigest(inventory: CardInventory[], strategy: StrategyProfile): WeeklyDigest {
  const buys = getBuyRecommendations(inventory, strategy).slice(0, 3);
  const sells = getSellRecommendations(inventory).slice(0, 3);
  const gaps = analyzeGaps(inventory);
  const risk = assessRisk(inventory);

  const gapToFill = gaps.length > 0 ? gaps[0] : null;

  // Risk summary
  let riskSummary: string;
  if (risk.compositeScore < 30) {
    riskSummary = 'Your portfolio risk is low. Good diversification across sports, eras, and grades. Stay the course.';
  } else if (risk.compositeScore < 60) {
    riskSummary = `Moderate risk detected (score: ${risk.compositeScore}/100). ${risk.mitigations[0] || 'Review your concentration levels.'}`;
  } else {
    riskSummary = `Elevated risk level (score: ${risk.compositeScore}/100). Immediate attention recommended: ${risk.mitigations[0] || 'Rebalance your portfolio.'}`;
  }

  // Strategy alignment: how well the current collection matches the chosen strategy
  let strategyAlignment: number;
  const activeCards = inventory.filter(c => c.status !== 'sold');
  const totalCards = activeCards.length;

  if (totalCards === 0) {
    strategyAlignment = 0;
  } else {
    const gradedRatio = activeCards.filter(c => c.isGraded).length / totalCards;
    const highValueRatio = activeCards.filter(c => (c.currentValue ?? c.purchasePrice) > 200).length / totalCards;
    const vintageRatio = activeCards.filter(c => c.year < 2000).length / totalCards;
    const uniqueSports = new Set(activeCards.map(c => c.sport)).size;
    const sportCoverage = uniqueSports / ALL_SPORTS.length;

    switch (strategy) {
      case 'conservative':
        // High grades, high values, established players
        strategyAlignment = Math.round(
          gradedRatio * 40 + highValueRatio * 40 + (1 - risk.compositeScore / 100) * 20
        );
        break;
      case 'aggressive': {
        // Recent cards, undervalued cards, diverse sports
        const recentRatio = activeCards.filter(c => c.year >= 2020).length / totalCards;
        const undervaluedRatio = activeCards.filter(c => {
          const cv = c.currentValue ?? c.purchasePrice;
          return cv < c.purchasePrice * 1.1;
        }).length / totalCards;
        strategyAlignment = Math.round(
          recentRatio * 35 + undervaluedRatio * 30 + sportCoverage * 35
        );
        break;
      }
      case 'long_term':
        // Vintage cards, graded, high value
        strategyAlignment = Math.round(
          vintageRatio * 40 + gradedRatio * 30 + highValueRatio * 30
        );
        break;
      case 'completion': {
        // Sport coverage, manufacturer diversity, era coverage
        const mfgs = new Set(activeCards.map(c => c.manufacturer)).size;
        const decades = new Set(activeCards.map(c => Math.floor(c.year / 10) * 10)).size;
        const mfgCoverage = Math.min(1, mfgs / 4);
        const decadeCoverage = Math.min(1, decades / 5);
        strategyAlignment = Math.round(
          sportCoverage * 40 + mfgCoverage * 30 + decadeCoverage * 30
        );
        break;
      }
    }
    strategyAlignment = Math.min(100, Math.max(0, strategyAlignment));
  }

  return {
    topBuys: buys,
    topSells: sells,
    gapToFill,
    riskSummary,
    strategyAlignment,
  };
}
