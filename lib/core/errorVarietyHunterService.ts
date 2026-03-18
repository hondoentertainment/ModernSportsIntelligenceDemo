// Phase 251 — Error & Variety Hunter Service
// Identifies and catalogs card errors and varieties that command premium prices

// ---- Types ----

export interface CardError {
  id: string;
  card: string;
  player: string;
  year: number;
  errorType: 'misprint' | 'miscut' | 'double-print' | 'wrong-back' | 'color-variation' | 'missing-foil';
  description: string;
  rarity: 'common' | 'scarce' | 'rare' | 'ultra-rare';
  premiumMultiplier: number;
  confirmed: boolean;
  imageDescription: string;
}

export interface ErrorAlert {
  card: string;
  errorType: string;
  discoveredDate: string;
  estimatedPremium: number;
}

// ---- Mock Data ----

const cardErrors: CardError[] = [
  {
    id: 'ce-001',
    card: '2024 Topps Series 1 #150',
    player: 'Ronald Acuna Jr.',
    year: 2024,
    errorType: 'misprint',
    description: 'Missing team name on card front — "Atlanta Braves" text completely absent from nameplate',
    rarity: 'rare',
    premiumMultiplier: 8.5,
    confirmed: true,
    imageDescription: 'Card front showing blank nameplate area where team name should appear below player photo',
  },
  {
    id: 'ce-002',
    card: '2023 Panini Prizm #280',
    player: 'Victor Wembanyama',
    year: 2023,
    errorType: 'color-variation',
    description: 'Unannounced silver prizm with pink tint — not matching any known parallel color scheme',
    rarity: 'ultra-rare',
    premiumMultiplier: 15.0,
    confirmed: false,
    imageDescription: 'Side-by-side comparison showing standard silver prizm next to pink-tinted variation under identical lighting',
  },
  {
    id: 'ce-003',
    card: '2024 Bowman Chrome #BCP-55',
    player: 'Jackson Holliday',
    year: 2024,
    errorType: 'double-print',
    description: 'Double-printed image with visible ghost offset approximately 2mm to the right',
    rarity: 'scarce',
    premiumMultiplier: 4.2,
    confirmed: true,
    imageDescription: 'Close-up of card showing doubled player image with clear shadow offset visible on jersey lettering',
  },
  {
    id: 'ce-004',
    card: '2023 Topps Chrome #220',
    player: 'Corbin Carroll',
    year: 2023,
    errorType: 'wrong-back',
    description: 'Card back shows Mike Trout stats and bio instead of Corbin Carroll information',
    rarity: 'rare',
    premiumMultiplier: 12.0,
    confirmed: true,
    imageDescription: 'Card back displaying Mike Trout career statistics and biographical data with Corbin Carroll card number',
  },
  {
    id: 'ce-005',
    card: '2024 Panini Prizm Basketball #1',
    player: 'Luka Doncic',
    year: 2024,
    errorType: 'missing-foil',
    description: 'Missing holographic foil stamp on card front — smooth surface where Prizm foil pattern should be',
    rarity: 'scarce',
    premiumMultiplier: 5.5,
    confirmed: true,
    imageDescription: 'Card front with visibly absent holographic pattern in the border area compared to standard issue',
  },
  {
    id: 'ce-006',
    card: '2024 Upper Deck Series 1 #201',
    player: 'Connor Bedard',
    year: 2024,
    errorType: 'miscut',
    description: 'Severe miscut showing approximately 40% of adjacent card visible on left edge',
    rarity: 'common',
    premiumMultiplier: 2.5,
    confirmed: true,
    imageDescription: 'Full card scan showing dramatic miscut with neighboring card art visible along the left border',
  },
];

const errorAlerts: ErrorAlert[] = [
  {
    card: '2024 Topps Series 2 #400 Gunnar Henderson',
    errorType: 'wrong-back',
    discoveredDate: '2026-03-12',
    estimatedPremium: 450,
  },
  {
    card: '2024 Panini Prizm Football #301 Caleb Williams',
    errorType: 'color-variation',
    discoveredDate: '2026-03-15',
    estimatedPremium: 1200,
  },
  {
    card: '2024 Bowman Draft #BD-1 Travis Bazzana',
    errorType: 'misprint',
    discoveredDate: '2026-03-16',
    estimatedPremium: 320,
  },
];

// ---- Service Functions ----

export function getCardErrors(): CardError[] {
  return [...cardErrors];
}

export function getErrorAlerts(): ErrorAlert[] {
  return [...errorAlerts];
}

export function getErrorStats() {
  const totalErrors = cardErrors.length;
  const confirmedErrors = cardErrors.filter((e) => e.confirmed).length;
  const unconfirmedErrors = totalErrors - confirmedErrors;
  const avgPremiumMultiplier =
    Math.round(
      (cardErrors.reduce((sum, e) => sum + e.premiumMultiplier, 0) / totalErrors) * 10
    ) / 10;
  const rarityBreakdown = cardErrors.reduce<Record<string, number>>((acc, e) => {
    acc[e.rarity] = (acc[e.rarity] || 0) + 1;
    return acc;
  }, {});
  const errorTypeBreakdown = cardErrors.reduce<Record<string, number>>((acc, e) => {
    acc[e.errorType] = (acc[e.errorType] || 0) + 1;
    return acc;
  }, {});
  const activeAlerts = errorAlerts.length;
  const highestMultiplier = cardErrors.reduce(
    (best, e) => (e.premiumMultiplier > best.premiumMultiplier ? e : best),
    cardErrors[0]
  );

  return {
    totalErrors,
    confirmedErrors,
    unconfirmedErrors,
    avgPremiumMultiplier,
    rarityBreakdown,
    errorTypeBreakdown,
    activeAlerts,
    highestMultiplierCard: highestMultiplier.card,
    highestMultiplierValue: highestMultiplier.premiumMultiplier,
  };
}

const errorVarietyHunterService = {
  getCardErrors,
  getErrorAlerts,
  getErrorStats,
};

export default errorVarietyHunterService;
