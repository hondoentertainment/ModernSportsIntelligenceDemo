// @ts-nocheck
// Portfolio DNA Rebalancer Service — Bonus #143
// Intelligent portfolio rebalancing via DNA-strand analysis of collection composition.

// ─── Enums & Constants ────────────────────────────────────────────────────────

export type DNAStrandKey = 'sport' | 'era' | 'grade' | 'tier' | 'liquidity';

export const DNA_STRAND_LABELS: Record<DNAStrandKey, string> = {
  sport: 'Sport Mix',
  era: 'Era Distribution',
  grade: 'Grade Quality',
  tier: 'Player Tier',
  liquidity: 'Liquidity Profile',
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface TargetAllocation {
  category: string;
  targetPct: number;
  currentPct: number;
  label: string;
}

export interface DNAStrand {
  key: DNAStrandKey;
  label: string;
  allocations: TargetAllocation[];
  healthScore: number; // 0-100
}

export interface PortfolioDNA {
  overallScore: number; // 0-100 composite
  strands: DNAStrand[];
  totalCards: number;
  totalValue: number;
  lastAnalyzed: string;
}

export interface AllocationModel {
  id: string;
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive' | 'speculative';
  expectedReturn: number; // annualized %
  volatility: number;
  targets: Record<DNAStrandKey, TargetAllocation[]>;
  color: string;
  icon: string;
}

export interface DriftItem {
  strand: DNAStrandKey;
  category: string;
  label: string;
  currentPct: number;
  targetPct: number;
  driftPct: number; // signed
  driftMagnitude: number; // abs
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DriftAnalysis {
  modelId: string;
  modelName: string;
  overallDrift: number;
  items: DriftItem[];
  alerts: DriftAlert[];
  timestamp: string;
}

export interface DriftAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  strand: DNAStrandKey;
  category: string;
  driftPct: number;
}

export interface RebalanceTrade {
  id: string;
  action: 'sell' | 'buy' | 'trade';
  cardName: string;
  sport: string;
  era: string;
  grade: string;
  playerTier: string;
  estimatedValue: number;
  impactScore: number; // how much this trade reduces drift (0-100)
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  strand: DNAStrandKey;
  targetCategory: string;
}

export interface SimulationResult {
  before: PortfolioDNA;
  after: PortfolioDNA;
  tradesApplied: number;
  projectedMonths: ProjectedMonth[];
  netCostToRebalance: number;
  driftReduction: number; // percentage improvement
  newOverallScore: number;
}

export interface ProjectedMonth {
  month: string;
  currentValue: number;
  rebalancedValue: number;
  benchmarkValue: number;
}

// ─── Mock Portfolio DNA (Current Collection) ──────────────────────────────────

const CURRENT_SPORT_ALLOCATIONS: TargetAllocation[] = [
  { category: 'baseball', targetPct: 0, currentPct: 38, label: 'Baseball' },
  { category: 'basketball', targetPct: 0, currentPct: 28, label: 'Basketball' },
  { category: 'football', targetPct: 0, currentPct: 22, label: 'Football' },
  { category: 'hockey', targetPct: 0, currentPct: 7, label: 'Hockey' },
  { category: 'soccer', targetPct: 0, currentPct: 5, label: 'Soccer' },
];

const CURRENT_ERA_ALLOCATIONS: TargetAllocation[] = [
  { category: 'pre_war', targetPct: 0, currentPct: 5, label: 'Pre-War (<1945)' },
  { category: 'vintage', targetPct: 0, currentPct: 12, label: 'Vintage (1945-1979)' },
  { category: 'junk_wax', targetPct: 0, currentPct: 18, label: 'Junk Wax (1980-1994)' },
  { category: 'modern', targetPct: 0, currentPct: 35, label: 'Modern (1995-2015)' },
  { category: 'ultra_modern', targetPct: 0, currentPct: 30, label: 'Ultra-Modern (2016+)' },
];

const CURRENT_GRADE_ALLOCATIONS: TargetAllocation[] = [
  { category: 'gem_mint', targetPct: 0, currentPct: 15, label: 'Gem Mint (PSA 10 / BGS 9.5+)' },
  { category: 'mint', targetPct: 0, currentPct: 22, label: 'Mint (PSA 9 / BGS 9)' },
  { category: 'near_mint', targetPct: 0, currentPct: 28, label: 'Near Mint (PSA 7-8)' },
  { category: 'excellent', targetPct: 0, currentPct: 20, label: 'Excellent (PSA 5-6)' },
  { category: 'raw', targetPct: 0, currentPct: 15, label: 'Raw / Ungraded' },
];

const CURRENT_TIER_ALLOCATIONS: TargetAllocation[] = [
  { category: 'hof', targetPct: 0, currentPct: 20, label: 'Hall of Fame' },
  { category: 'superstar', targetPct: 0, currentPct: 25, label: 'Superstar Active' },
  { category: 'star', targetPct: 0, currentPct: 22, label: 'Star / Starter' },
  { category: 'rookie_prospect', targetPct: 0, currentPct: 18, label: 'Rookie / Prospect' },
  { category: 'commons', targetPct: 0, currentPct: 15, label: 'Commons / Role Player' },
];

const CURRENT_LIQUIDITY_ALLOCATIONS: TargetAllocation[] = [
  { category: 'high', targetPct: 0, currentPct: 30, label: 'High Liquidity (<7 day avg sale)' },
  { category: 'medium', targetPct: 0, currentPct: 35, label: 'Medium Liquidity (7-30 days)' },
  { category: 'low', targetPct: 0, currentPct: 25, label: 'Low Liquidity (30-90 days)' },
  { category: 'illiquid', targetPct: 0, currentPct: 10, label: 'Illiquid (90+ days)' },
];

// ─── Model Portfolios ────────────────────────────────────────────────────────

const MODEL_PORTFOLIOS: AllocationModel[] = [
  {
    id: 'conservative_vintage',
    name: 'Conservative Vintage',
    description:
      'Focused on blue-chip vintage cards with proven long-term appreciation. Emphasizes HOF players, high grades, and stable sports like baseball. Low volatility, steady growth.',
    riskLevel: 'conservative',
    expectedReturn: 6.5,
    volatility: 8,
    color: '#6366f1',
    icon: 'shield',
    targets: {
      sport: [
        { category: 'baseball', targetPct: 45, currentPct: 0, label: 'Baseball' },
        { category: 'basketball', targetPct: 20, currentPct: 0, label: 'Basketball' },
        { category: 'football', targetPct: 20, currentPct: 0, label: 'Football' },
        { category: 'hockey', targetPct: 10, currentPct: 0, label: 'Hockey' },
        { category: 'soccer', targetPct: 5, currentPct: 0, label: 'Soccer' },
      ],
      era: [
        { category: 'pre_war', targetPct: 15, currentPct: 0, label: 'Pre-War (<1945)' },
        { category: 'vintage', targetPct: 35, currentPct: 0, label: 'Vintage (1945-1979)' },
        { category: 'junk_wax', targetPct: 10, currentPct: 0, label: 'Junk Wax (1980-1994)' },
        { category: 'modern', targetPct: 25, currentPct: 0, label: 'Modern (1995-2015)' },
        { category: 'ultra_modern', targetPct: 15, currentPct: 0, label: 'Ultra-Modern (2016+)' },
      ],
      grade: [
        { category: 'gem_mint', targetPct: 25, currentPct: 0, label: 'Gem Mint (PSA 10 / BGS 9.5+)' },
        { category: 'mint', targetPct: 30, currentPct: 0, label: 'Mint (PSA 9 / BGS 9)' },
        { category: 'near_mint', targetPct: 25, currentPct: 0, label: 'Near Mint (PSA 7-8)' },
        { category: 'excellent', targetPct: 15, currentPct: 0, label: 'Excellent (PSA 5-6)' },
        { category: 'raw', targetPct: 5, currentPct: 0, label: 'Raw / Ungraded' },
      ],
      tier: [
        { category: 'hof', targetPct: 40, currentPct: 0, label: 'Hall of Fame' },
        { category: 'superstar', targetPct: 25, currentPct: 0, label: 'Superstar Active' },
        { category: 'star', targetPct: 20, currentPct: 0, label: 'Star / Starter' },
        { category: 'rookie_prospect', targetPct: 10, currentPct: 0, label: 'Rookie / Prospect' },
        { category: 'commons', targetPct: 5, currentPct: 0, label: 'Commons / Role Player' },
      ],
      liquidity: [
        { category: 'high', targetPct: 40, currentPct: 0, label: 'High Liquidity (<7 day avg sale)' },
        { category: 'medium', targetPct: 35, currentPct: 0, label: 'Medium Liquidity (7-30 days)' },
        { category: 'low', targetPct: 20, currentPct: 0, label: 'Low Liquidity (30-90 days)' },
        { category: 'illiquid', targetPct: 5, currentPct: 0, label: 'Illiquid (90+ days)' },
      ],
    },
  },
  {
    id: 'growth_rookie',
    name: 'Growth Rookie',
    description:
      'Targets high-upside rookies and young stars with breakout potential. Higher volatility but significant growth opportunity. Skews basketball and football.',
    riskLevel: 'aggressive',
    expectedReturn: 14.2,
    volatility: 24,
    color: '#22c55e',
    icon: 'rocket',
    targets: {
      sport: [
        { category: 'baseball', targetPct: 20, currentPct: 0, label: 'Baseball' },
        { category: 'basketball', targetPct: 35, currentPct: 0, label: 'Basketball' },
        { category: 'football', targetPct: 30, currentPct: 0, label: 'Football' },
        { category: 'hockey', targetPct: 5, currentPct: 0, label: 'Hockey' },
        { category: 'soccer', targetPct: 10, currentPct: 0, label: 'Soccer' },
      ],
      era: [
        { category: 'pre_war', targetPct: 0, currentPct: 0, label: 'Pre-War (<1945)' },
        { category: 'vintage', targetPct: 5, currentPct: 0, label: 'Vintage (1945-1979)' },
        { category: 'junk_wax', targetPct: 5, currentPct: 0, label: 'Junk Wax (1980-1994)' },
        { category: 'modern', targetPct: 30, currentPct: 0, label: 'Modern (1995-2015)' },
        { category: 'ultra_modern', targetPct: 60, currentPct: 0, label: 'Ultra-Modern (2016+)' },
      ],
      grade: [
        { category: 'gem_mint', targetPct: 35, currentPct: 0, label: 'Gem Mint (PSA 10 / BGS 9.5+)' },
        { category: 'mint', targetPct: 30, currentPct: 0, label: 'Mint (PSA 9 / BGS 9)' },
        { category: 'near_mint', targetPct: 15, currentPct: 0, label: 'Near Mint (PSA 7-8)' },
        { category: 'excellent', targetPct: 5, currentPct: 0, label: 'Excellent (PSA 5-6)' },
        { category: 'raw', targetPct: 15, currentPct: 0, label: 'Raw / Ungraded' },
      ],
      tier: [
        { category: 'hof', targetPct: 10, currentPct: 0, label: 'Hall of Fame' },
        { category: 'superstar', targetPct: 25, currentPct: 0, label: 'Superstar Active' },
        { category: 'star', targetPct: 15, currentPct: 0, label: 'Star / Starter' },
        { category: 'rookie_prospect', targetPct: 40, currentPct: 0, label: 'Rookie / Prospect' },
        { category: 'commons', targetPct: 10, currentPct: 0, label: 'Commons / Role Player' },
      ],
      liquidity: [
        { category: 'high', targetPct: 35, currentPct: 0, label: 'High Liquidity (<7 day avg sale)' },
        { category: 'medium', targetPct: 30, currentPct: 0, label: 'Medium Liquidity (7-30 days)' },
        { category: 'low', targetPct: 25, currentPct: 0, label: 'Low Liquidity (30-90 days)' },
        { category: 'illiquid', targetPct: 10, currentPct: 0, label: 'Illiquid (90+ days)' },
      ],
    },
  },
  {
    id: 'balanced_all_era',
    name: 'Balanced All-Era',
    description:
      'Diversified across all eras and sports for smooth, consistent returns. The "index fund" of card portfolios — broad exposure with moderate risk.',
    riskLevel: 'moderate',
    expectedReturn: 9.8,
    volatility: 14,
    color: '#3b82f6',
    icon: 'scale',
    targets: {
      sport: [
        { category: 'baseball', targetPct: 25, currentPct: 0, label: 'Baseball' },
        { category: 'basketball', targetPct: 25, currentPct: 0, label: 'Basketball' },
        { category: 'football', targetPct: 25, currentPct: 0, label: 'Football' },
        { category: 'hockey', targetPct: 12, currentPct: 0, label: 'Hockey' },
        { category: 'soccer', targetPct: 13, currentPct: 0, label: 'Soccer' },
      ],
      era: [
        { category: 'pre_war', targetPct: 10, currentPct: 0, label: 'Pre-War (<1945)' },
        { category: 'vintage', targetPct: 20, currentPct: 0, label: 'Vintage (1945-1979)' },
        { category: 'junk_wax', targetPct: 15, currentPct: 0, label: 'Junk Wax (1980-1994)' },
        { category: 'modern', targetPct: 30, currentPct: 0, label: 'Modern (1995-2015)' },
        { category: 'ultra_modern', targetPct: 25, currentPct: 0, label: 'Ultra-Modern (2016+)' },
      ],
      grade: [
        { category: 'gem_mint', targetPct: 20, currentPct: 0, label: 'Gem Mint (PSA 10 / BGS 9.5+)' },
        { category: 'mint', targetPct: 25, currentPct: 0, label: 'Mint (PSA 9 / BGS 9)' },
        { category: 'near_mint', targetPct: 25, currentPct: 0, label: 'Near Mint (PSA 7-8)' },
        { category: 'excellent', targetPct: 20, currentPct: 0, label: 'Excellent (PSA 5-6)' },
        { category: 'raw', targetPct: 10, currentPct: 0, label: 'Raw / Ungraded' },
      ],
      tier: [
        { category: 'hof', targetPct: 25, currentPct: 0, label: 'Hall of Fame' },
        { category: 'superstar', targetPct: 25, currentPct: 0, label: 'Superstar Active' },
        { category: 'star', targetPct: 20, currentPct: 0, label: 'Star / Starter' },
        { category: 'rookie_prospect', targetPct: 20, currentPct: 0, label: 'Rookie / Prospect' },
        { category: 'commons', targetPct: 10, currentPct: 0, label: 'Commons / Role Player' },
      ],
      liquidity: [
        { category: 'high', targetPct: 30, currentPct: 0, label: 'High Liquidity (<7 day avg sale)' },
        { category: 'medium', targetPct: 35, currentPct: 0, label: 'Medium Liquidity (7-30 days)' },
        { category: 'low', targetPct: 25, currentPct: 0, label: 'Low Liquidity (30-90 days)' },
        { category: 'illiquid', targetPct: 10, currentPct: 0, label: 'Illiquid (90+ days)' },
      ],
    },
  },
  {
    id: 'income_yield',
    name: 'Income Yield',
    description:
      'Optimized for cards that can be flipped or consigned quickly. High-liquidity, high-grade cards from proven HOF and superstar players. Steady cash flow focus.',
    riskLevel: 'conservative',
    expectedReturn: 7.8,
    volatility: 10,
    color: '#f59e0b',
    icon: 'banknote',
    targets: {
      sport: [
        { category: 'baseball', targetPct: 30, currentPct: 0, label: 'Baseball' },
        { category: 'basketball', targetPct: 30, currentPct: 0, label: 'Basketball' },
        { category: 'football', targetPct: 25, currentPct: 0, label: 'Football' },
        { category: 'hockey', targetPct: 10, currentPct: 0, label: 'Hockey' },
        { category: 'soccer', targetPct: 5, currentPct: 0, label: 'Soccer' },
      ],
      era: [
        { category: 'pre_war', targetPct: 5, currentPct: 0, label: 'Pre-War (<1945)' },
        { category: 'vintage', targetPct: 15, currentPct: 0, label: 'Vintage (1945-1979)' },
        { category: 'junk_wax', targetPct: 10, currentPct: 0, label: 'Junk Wax (1980-1994)' },
        { category: 'modern', targetPct: 40, currentPct: 0, label: 'Modern (1995-2015)' },
        { category: 'ultra_modern', targetPct: 30, currentPct: 0, label: 'Ultra-Modern (2016+)' },
      ],
      grade: [
        { category: 'gem_mint', targetPct: 30, currentPct: 0, label: 'Gem Mint (PSA 10 / BGS 9.5+)' },
        { category: 'mint', targetPct: 35, currentPct: 0, label: 'Mint (PSA 9 / BGS 9)' },
        { category: 'near_mint', targetPct: 20, currentPct: 0, label: 'Near Mint (PSA 7-8)' },
        { category: 'excellent', targetPct: 10, currentPct: 0, label: 'Excellent (PSA 5-6)' },
        { category: 'raw', targetPct: 5, currentPct: 0, label: 'Raw / Ungraded' },
      ],
      tier: [
        { category: 'hof', targetPct: 35, currentPct: 0, label: 'Hall of Fame' },
        { category: 'superstar', targetPct: 30, currentPct: 0, label: 'Superstar Active' },
        { category: 'star', targetPct: 20, currentPct: 0, label: 'Star / Starter' },
        { category: 'rookie_prospect', targetPct: 10, currentPct: 0, label: 'Rookie / Prospect' },
        { category: 'commons', targetPct: 5, currentPct: 0, label: 'Commons / Role Player' },
      ],
      liquidity: [
        { category: 'high', targetPct: 50, currentPct: 0, label: 'High Liquidity (<7 day avg sale)' },
        { category: 'medium', targetPct: 30, currentPct: 0, label: 'Medium Liquidity (7-30 days)' },
        { category: 'low', targetPct: 15, currentPct: 0, label: 'Low Liquidity (30-90 days)' },
        { category: 'illiquid', targetPct: 5, currentPct: 0, label: 'Illiquid (90+ days)' },
      ],
    },
  },
  {
    id: 'speculative_prospect',
    name: 'Speculative Prospect',
    description:
      'High-risk, high-reward strategy targeting unproven prospects, raw cards, and emerging sports like soccer. Maximum upside with significant downside risk.',
    riskLevel: 'speculative',
    expectedReturn: 22.5,
    volatility: 38,
    color: '#ef4444',
    icon: 'flame',
    targets: {
      sport: [
        { category: 'baseball', targetPct: 15, currentPct: 0, label: 'Baseball' },
        { category: 'basketball', targetPct: 25, currentPct: 0, label: 'Basketball' },
        { category: 'football', targetPct: 20, currentPct: 0, label: 'Football' },
        { category: 'hockey', targetPct: 10, currentPct: 0, label: 'Hockey' },
        { category: 'soccer', targetPct: 30, currentPct: 0, label: 'Soccer' },
      ],
      era: [
        { category: 'pre_war', targetPct: 0, currentPct: 0, label: 'Pre-War (<1945)' },
        { category: 'vintage', targetPct: 0, currentPct: 0, label: 'Vintage (1945-1979)' },
        { category: 'junk_wax', targetPct: 5, currentPct: 0, label: 'Junk Wax (1980-1994)' },
        { category: 'modern', targetPct: 20, currentPct: 0, label: 'Modern (1995-2015)' },
        { category: 'ultra_modern', targetPct: 75, currentPct: 0, label: 'Ultra-Modern (2016+)' },
      ],
      grade: [
        { category: 'gem_mint', targetPct: 15, currentPct: 0, label: 'Gem Mint (PSA 10 / BGS 9.5+)' },
        { category: 'mint', targetPct: 15, currentPct: 0, label: 'Mint (PSA 9 / BGS 9)' },
        { category: 'near_mint', targetPct: 15, currentPct: 0, label: 'Near Mint (PSA 7-8)' },
        { category: 'excellent', targetPct: 15, currentPct: 0, label: 'Excellent (PSA 5-6)' },
        { category: 'raw', targetPct: 40, currentPct: 0, label: 'Raw / Ungraded' },
      ],
      tier: [
        { category: 'hof', targetPct: 5, currentPct: 0, label: 'Hall of Fame' },
        { category: 'superstar', targetPct: 10, currentPct: 0, label: 'Superstar Active' },
        { category: 'star', targetPct: 15, currentPct: 0, label: 'Star / Starter' },
        { category: 'rookie_prospect', targetPct: 50, currentPct: 0, label: 'Rookie / Prospect' },
        { category: 'commons', targetPct: 20, currentPct: 0, label: 'Commons / Role Player' },
      ],
      liquidity: [
        { category: 'high', targetPct: 15, currentPct: 0, label: 'High Liquidity (<7 day avg sale)' },
        { category: 'medium', targetPct: 25, currentPct: 0, label: 'Medium Liquidity (7-30 days)' },
        { category: 'low', targetPct: 35, currentPct: 0, label: 'Low Liquidity (30-90 days)' },
        { category: 'illiquid', targetPct: 25, currentPct: 0, label: 'Illiquid (90+ days)' },
      ],
    },
  },
];

// ─── Mock Suggested Trades ────────────────────────────────────────────────────

const MOCK_TRADES: RebalanceTrade[] = [
  {
    id: 'rt-001',
    action: 'sell',
    cardName: '1987 Topps Barry Bonds RC #320',
    sport: 'Baseball',
    era: 'Junk Wax',
    grade: 'PSA 9',
    playerTier: 'HOF',
    estimatedValue: 45,
    impactScore: 82,
    reason: 'Junk wax era overweight by 8%. Low appreciation potential relative to portfolio value.',
    urgency: 'medium',
    strand: 'era',
    targetCategory: 'junk_wax',
  },
  {
    id: 'rt-002',
    action: 'buy',
    cardName: '2023 Bowman Chrome Victor Wembanyama 1st Auto',
    sport: 'Basketball',
    era: 'Ultra-Modern',
    grade: 'BGS 9.5',
    playerTier: 'Rookie / Prospect',
    estimatedValue: 1250,
    impactScore: 95,
    reason: 'Ultra-modern and rookie allocation both below target. High-upside franchise player.',
    urgency: 'high',
    strand: 'tier',
    targetCategory: 'rookie_prospect',
  },
  {
    id: 'rt-003',
    action: 'sell',
    cardName: '1990 Fleer Michael Jordan #26',
    sport: 'Basketball',
    era: 'Junk Wax',
    grade: 'PSA 8',
    playerTier: 'HOF',
    estimatedValue: 25,
    impactScore: 68,
    reason: 'Overexposure to junk wax basketball. Minimal upside at PSA 8 grade level.',
    urgency: 'low',
    strand: 'era',
    targetCategory: 'junk_wax',
  },
  {
    id: 'rt-004',
    action: 'buy',
    cardName: '1956 Topps Mickey Mantle #135',
    sport: 'Baseball',
    era: 'Vintage',
    grade: 'PSA 5',
    playerTier: 'HOF',
    estimatedValue: 4800,
    impactScore: 91,
    reason: 'Vintage allocation 8% below target. Blue-chip HOF card with strong long-term appreciation.',
    urgency: 'high',
    strand: 'era',
    targetCategory: 'vintage',
  },
  {
    id: 'rt-005',
    action: 'trade',
    cardName: '2021 Panini Prizm Trevor Lawrence RC Silver',
    sport: 'Football',
    era: 'Ultra-Modern',
    grade: 'PSA 10',
    playerTier: 'Star / Starter',
    estimatedValue: 180,
    impactScore: 74,
    reason: 'Trade for vintage football to balance era distribution. Star tier slightly overweight.',
    urgency: 'medium',
    strand: 'sport',
    targetCategory: 'football',
  },
  {
    id: 'rt-006',
    action: 'buy',
    cardName: '2024 Topps Chrome Elly De La Cruz RC Auto',
    sport: 'Baseball',
    era: 'Ultra-Modern',
    grade: 'Raw',
    playerTier: 'Rookie / Prospect',
    estimatedValue: 320,
    impactScore: 78,
    reason: 'Raw card allocation below target. High-ceiling prospect with grading upside.',
    urgency: 'medium',
    strand: 'grade',
    targetCategory: 'raw',
  },
  {
    id: 'rt-007',
    action: 'sell',
    cardName: '2019 Panini Mosaic Zion Williamson RC Silver',
    sport: 'Basketball',
    era: 'Ultra-Modern',
    grade: 'PSA 10',
    playerTier: 'Superstar Active',
    estimatedValue: 150,
    impactScore: 65,
    reason: 'Basketball slightly overweight. Injury-risk player — lock in gains while value holds.',
    urgency: 'medium',
    strand: 'sport',
    targetCategory: 'basketball',
  },
  {
    id: 'rt-008',
    action: 'buy',
    cardName: '2023 Topps MLS Lionel Messi #1',
    sport: 'Soccer',
    era: 'Ultra-Modern',
    grade: 'PSA 10',
    playerTier: 'HOF',
    estimatedValue: 95,
    impactScore: 72,
    reason: 'Soccer allocation 8% below target in balanced model. GOAT-tier player in growing market.',
    urgency: 'low',
    strand: 'sport',
    targetCategory: 'soccer',
  },
  {
    id: 'rt-009',
    action: 'sell',
    cardName: '1989 Upper Deck Ken Griffey Jr. RC #1',
    sport: 'Baseball',
    era: 'Junk Wax',
    grade: 'PSA 9',
    playerTier: 'HOF',
    estimatedValue: 110,
    impactScore: 60,
    reason: 'Further reduce junk wax overweight. Strong sell price currently — market may soften.',
    urgency: 'low',
    strand: 'era',
    targetCategory: 'junk_wax',
  },
  {
    id: 'rt-010',
    action: 'buy',
    cardName: '1971 Topps Roberto Clemente #630',
    sport: 'Baseball',
    era: 'Vintage',
    grade: 'PSA 6',
    playerTier: 'HOF',
    estimatedValue: 650,
    impactScore: 85,
    reason: 'Strengthens vintage and HOF allocations simultaneously. Iconic card with museum-grade appeal.',
    urgency: 'high',
    strand: 'era',
    targetCategory: 'vintage',
  },
];

// ─── Helper Utilities ─────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function classifySeverity(absDrift: number): DriftItem['severity'] {
  if (absDrift >= 15) return 'critical';
  if (absDrift >= 10) return 'high';
  if (absDrift >= 5) return 'medium';
  return 'low';
}

function computeStrandHealth(allocations: TargetAllocation[], targets: TargetAllocation[]): number {
  if (targets.length === 0) return 100;
  const totalDrift = targets.reduce((sum, t) => {
    const current = allocations.find((a) => a.category === t.category);
    return sum + Math.abs((current?.currentPct ?? 0) - t.targetPct);
  }, 0);
  // Max possible drift per item is ~100, so normalize by count * 50 for reasonable scaling
  return clamp(100 - (totalDrift / targets.length) * 2.5, 0, 100);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Analyze the current portfolio DNA composition. */
export function analyzePortfolioDNA(): PortfolioDNA {
  const strands: DNAStrand[] = [
    { key: 'sport', label: 'Sport Mix', allocations: CURRENT_SPORT_ALLOCATIONS, healthScore: 78 },
    { key: 'era', label: 'Era Distribution', allocations: CURRENT_ERA_ALLOCATIONS, healthScore: 62 },
    { key: 'grade', label: 'Grade Quality', allocations: CURRENT_GRADE_ALLOCATIONS, healthScore: 71 },
    { key: 'tier', label: 'Player Tier', allocations: CURRENT_TIER_ALLOCATIONS, healthScore: 75 },
    { key: 'liquidity', label: 'Liquidity Profile', allocations: CURRENT_LIQUIDITY_ALLOCATIONS, healthScore: 68 },
  ];

  const overallScore = Math.round(strands.reduce((s, st) => s + st.healthScore, 0) / strands.length);

  return {
    overallScore,
    strands,
    totalCards: 347,
    totalValue: 84250,
    lastAnalyzed: new Date().toISOString(),
  };
}

/** Return all available model portfolios. */
export function getModelPortfolios(): AllocationModel[] {
  return MODEL_PORTFOLIOS;
}

/** Calculate drift between current portfolio and a model. */
export function calculateDrift(modelId: string): DriftAnalysis {
  const model = MODEL_PORTFOLIOS.find((m) => m.id === modelId) ?? MODEL_PORTFOLIOS[2];
  const dna = analyzePortfolioDNA();
  const items: DriftItem[] = [];
  const alerts: DriftAlert[] = [];

  const strandKeys: DNAStrandKey[] = ['sport', 'era', 'grade', 'tier', 'liquidity'];

  for (const key of strandKeys) {
    const targets = model.targets[key];
    const strand = dna.strands.find((s) => s.key === key);
    if (!strand || !targets) continue;

    for (const target of targets) {
      const current = strand.allocations.find((a) => a.category === target.category);
      const currentPct = current?.currentPct ?? 0;
      const driftPct = currentPct - target.targetPct;
      const driftMagnitude = Math.abs(driftPct);
      const severity = classifySeverity(driftMagnitude);

      items.push({
        strand: key,
        category: target.category,
        label: target.label,
        currentPct,
        targetPct: target.targetPct,
        driftPct,
        driftMagnitude,
        severity,
      });

      if (severity === 'high' || severity === 'critical') {
        const direction = driftPct > 0 ? 'overweight' : 'underweight';
        alerts.push({
          id: `alert-${key}-${target.category}`,
          message: `${target.label} is ${direction} by ${driftMagnitude.toFixed(1)}% in ${DNA_STRAND_LABELS[key]}`,
          severity: severity === 'critical' ? 'critical' : 'warning',
          strand: key,
          category: target.category,
          driftPct,
        });
      }
    }
  }

  const overallDrift = items.length > 0 ? items.reduce((s, i) => s + i.driftMagnitude, 0) / items.length : 0;

  return {
    modelId: model.id,
    modelName: model.name,
    overallDrift: Math.round(overallDrift * 10) / 10,
    items,
    alerts: alerts.sort((a, b) => Math.abs(b.driftPct) - Math.abs(a.driftPct)),
    timestamp: new Date().toISOString(),
  };
}

/** Suggest rebalancing trades to reduce drift for a given model. */
export function suggestRebalanceTrades(modelId: string): RebalanceTrade[] {
  // In production this would use drift analysis to generate trades.
  // For demo, return pre-built mock trades sorted by impact score.
  const _drift = calculateDrift(modelId);
  return [...MOCK_TRADES].sort((a, b) => b.impactScore - a.impactScore);
}

/** Compute a composite DNA health score (0-100). */
export function getDNAScore(modelId?: string): number {
  if (!modelId) return analyzePortfolioDNA().overallScore;

  const model = MODEL_PORTFOLIOS.find((m) => m.id === modelId);
  if (!model) return analyzePortfolioDNA().overallScore;

  const dna = analyzePortfolioDNA();
  const strandKeys: DNAStrandKey[] = ['sport', 'era', 'grade', 'tier', 'liquidity'];
  let totalHealth = 0;

  for (const key of strandKeys) {
    const strand = dna.strands.find((s) => s.key === key);
    const targets = model.targets[key];
    if (strand && targets) {
      totalHealth += computeStrandHealth(strand.allocations, targets);
    }
  }

  return Math.round(totalHealth / strandKeys.length);
}

/** Simulate the result of applying suggested rebalance trades. */
export function simulateRebalance(modelId: string): SimulationResult {
  const before = analyzePortfolioDNA();
  const model = MODEL_PORTFOLIOS.find((m) => m.id === modelId) ?? MODEL_PORTFOLIOS[2];
  const trades = suggestRebalanceTrades(modelId);

  // Build simulated "after" DNA — move allocations ~60-80% toward targets
  const afterStrands: DNAStrand[] = before.strands.map((strand) => {
    const targets = model.targets[strand.key];
    if (!targets) return { ...strand };

    const newAllocations = strand.allocations.map((alloc) => {
      const target = targets.find((t) => t.category === alloc.category);
      if (!target) return { ...alloc };
      const shift = (target.targetPct - alloc.currentPct) * 0.72;
      return { ...alloc, currentPct: Math.round((alloc.currentPct + shift) * 10) / 10 };
    });

    return {
      ...strand,
      allocations: newAllocations,
      healthScore: clamp(strand.healthScore + Math.round(Math.random() * 12 + 8), 0, 98),
    };
  });

  const after: PortfolioDNA = {
    ...before,
    strands: afterStrands,
    overallScore: clamp(before.overallScore + 18, 0, 97),
  };

  // Projected performance over 12 months
  const baseValue = before.totalValue;
  const projectedMonths: ProjectedMonth[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 12; i++) {
    const monthFactor = (i + 1) / 12;
    const noise = 1 + (Math.sin(i * 1.8) * 0.015);
    projectedMonths.push({
      month: monthNames[i],
      currentValue: Math.round(baseValue * (1 + 0.065 * monthFactor) * noise),
      rebalancedValue: Math.round(baseValue * (1 + model.expectedReturn / 100 * monthFactor) * noise),
      benchmarkValue: Math.round(baseValue * (1 + 0.08 * monthFactor)),
    });
  }

  const sellTotal = trades.filter((t) => t.action === 'sell').reduce((s, t) => s + t.estimatedValue, 0);
  const buyTotal = trades.filter((t) => t.action === 'buy').reduce((s, t) => s + t.estimatedValue, 0);

  return {
    before,
    after,
    tradesApplied: trades.length,
    projectedMonths,
    netCostToRebalance: buyTotal - sellTotal,
    driftReduction: 62.4,
    newOverallScore: after.overallScore,
  };
}
