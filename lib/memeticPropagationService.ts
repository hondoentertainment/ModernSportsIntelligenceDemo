// ─────────────────────────────────────────────────────────────
// Memetic Propagation Tracker – Service Layer
// Applies SIR epidemiological models to card market narratives
// ─────────────────────────────────────────────────────────────

export type NarrativePhase = 'emergence' | 'exponential-growth' | 'peak-saturation' | 'decay' | 'endemic';

export type PropagationChannel = 'youtube' | 'twitter' | 'reddit' | 'whatnot' | 'tiktok' | 'discord' | 'podcast';

export interface Narrative {
  id: string;
  title: string;
  patientZero: {
    handle: string;
    platform: PropagationChannel;
    date: string;
  };
  currentPhase: NarrativePhase;
  r0: number; // reproductive number
  viralLoad: number; // price impact %
  peakDate: string;
  decayDate: string;
  exposures: number;
  priceImpactPercent: number;
  infectedChannels: PropagationChannel[];
  susceptibleChannels: PropagationChannel[];
  recoveredChannels: PropagationChannel[];
  topAmplifiers: {
    handle: string;
    platform: PropagationChannel;
    reach: number;
    amplificationDate: string;
  }[];
  affectedCards: {
    name: string;
    priceChange: number;
  }[];
  daysToFullPricing: number;
  confidence: number; // 0-100
}

export interface PropagationStats {
  activeNarratives: number;
  emergingNarratives: number;
  peakNarratives: number;
  decayingNarratives: number;
  avgR0: number;
  highestViralLoad: {
    narrative: string;
    load: number;
  };
}

// ── Mock Narratives (8 items) ────────────────────────────────

const MOCK_NARRATIVES: Narrative[] = [
  {
    id: 'nar-001',
    title: 'Cooper Flagg is the next LeBron',
    patientZero: {
      handle: '@HoopsCentral',
      platform: 'twitter',
      date: '2026-02-18',
    },
    currentPhase: 'exponential-growth',
    r0: 4.7,
    viralLoad: 34.2,
    peakDate: '2026-03-25',
    decayDate: '2026-04-15',
    exposures: 2400000,
    priceImpactPercent: 34.2,
    infectedChannels: ['twitter', 'youtube', 'reddit', 'tiktok'],
    susceptibleChannels: ['whatnot', 'discord', 'podcast'],
    recoveredChannels: [],
    topAmplifiers: [
      { handle: '@HoopsCentral', platform: 'twitter', reach: 890000, amplificationDate: '2026-02-18' },
      { handle: 'CardCollectorTV', platform: 'youtube', reach: 620000, amplificationDate: '2026-02-21' },
      { handle: 'u/NBACardInvestor', platform: 'reddit', reach: 340000, amplificationDate: '2026-02-23' },
    ],
    affectedCards: [
      { name: '2025 Cooper Flagg Prizm Silver PSA 10', priceChange: 42.5 },
      { name: '2025 Cooper Flagg Optic Holo PSA 10', priceChange: 38.1 },
      { name: '2025 Cooper Flagg Select Courtside PSA 10', priceChange: 28.7 },
    ],
    daysToFullPricing: 12,
    confidence: 82,
  },
  {
    id: 'nar-002',
    title: 'Wemby rookie correction incoming',
    patientZero: {
      handle: 'MarketMoversPod',
      platform: 'podcast',
      date: '2026-03-01',
    },
    currentPhase: 'peak-saturation',
    r0: 3.2,
    viralLoad: 18.5,
    peakDate: '2026-03-14',
    decayDate: '2026-03-28',
    exposures: 1800000,
    priceImpactPercent: -18.5,
    infectedChannels: ['podcast', 'twitter', 'youtube', 'reddit', 'discord'],
    susceptibleChannels: ['tiktok'],
    recoveredChannels: ['whatnot'],
    topAmplifiers: [
      { handle: 'MarketMoversPod', platform: 'podcast', reach: 420000, amplificationDate: '2026-03-01' },
      { handle: '@CardMarketWatch', platform: 'twitter', reach: 710000, amplificationDate: '2026-03-03' },
      { handle: 'SportsCardRadio', platform: 'youtube', reach: 550000, amplificationDate: '2026-03-05' },
    ],
    affectedCards: [
      { name: '2023 Victor Wembanyama Prizm Silver PSA 10', priceChange: -22.3 },
      { name: '2023 Victor Wembanyama Optic Holo PSA 10', priceChange: -16.8 },
      { name: '2023 Victor Wembanyama Select Courtside PSA 10', priceChange: -14.2 },
    ],
    daysToFullPricing: 5,
    confidence: 74,
  },
  {
    id: 'nar-003',
    title: '1990s junk wax renaissance — nostalgia buyers returning',
    patientZero: {
      handle: '@RetroBreaks',
      platform: 'tiktok',
      date: '2026-01-15',
    },
    currentPhase: 'decay',
    r0: 2.1,
    viralLoad: 8.4,
    peakDate: '2026-02-20',
    decayDate: '2026-03-10',
    exposures: 5200000,
    priceImpactPercent: 8.4,
    infectedChannels: ['tiktok', 'youtube', 'twitter', 'whatnot'],
    susceptibleChannels: [],
    recoveredChannels: ['reddit', 'discord', 'podcast'],
    topAmplifiers: [
      { handle: '@RetroBreaks', platform: 'tiktok', reach: 2100000, amplificationDate: '2026-01-15' },
      { handle: 'JunkWaxHeroes', platform: 'youtube', reach: 890000, amplificationDate: '2026-01-22' },
      { handle: '@90sCardNostalgia', platform: 'twitter', reach: 340000, amplificationDate: '2026-01-28' },
    ],
    affectedCards: [
      { name: '1989 Ken Griffey Jr. Upper Deck #1 PSA 10', priceChange: 15.2 },
      { name: '1993 Derek Jeter SP #279 PSA 10', priceChange: 12.1 },
      { name: '1986 Jerry Rice Topps #161 PSA 9', priceChange: 6.8 },
    ],
    daysToFullPricing: 0,
    confidence: 91,
  },
  {
    id: 'nar-004',
    title: 'AI-graded cards will replace PSA within 2 years',
    patientZero: {
      handle: 'u/TechMeetsHobby',
      platform: 'reddit',
      date: '2026-03-08',
    },
    currentPhase: 'emergence',
    r0: 1.8,
    viralLoad: 3.2,
    peakDate: '2026-04-10',
    decayDate: '2026-05-15',
    exposures: 320000,
    priceImpactPercent: -3.2,
    infectedChannels: ['reddit', 'twitter'],
    susceptibleChannels: ['youtube', 'tiktok', 'whatnot', 'discord', 'podcast'],
    recoveredChannels: [],
    topAmplifiers: [
      { handle: 'u/TechMeetsHobby', platform: 'reddit', reach: 180000, amplificationDate: '2026-03-08' },
      { handle: '@GradingDisruptor', platform: 'twitter', reach: 95000, amplificationDate: '2026-03-11' },
    ],
    affectedCards: [
      { name: 'PSA 10 premiums across all sports', priceChange: -3.2 },
      { name: 'Raw card premiums increasing', priceChange: 2.1 },
    ],
    daysToFullPricing: 28,
    confidence: 35,
  },
  {
    id: 'nar-005',
    title: 'Soccer cards outperform basketball by 2027',
    patientZero: {
      handle: 'GlobalCardEconomics',
      platform: 'youtube',
      date: '2026-02-05',
    },
    currentPhase: 'exponential-growth',
    r0: 3.8,
    viralLoad: 22.1,
    peakDate: '2026-04-01',
    decayDate: '2026-05-20',
    exposures: 1500000,
    priceImpactPercent: 22.1,
    infectedChannels: ['youtube', 'twitter', 'reddit', 'podcast'],
    susceptibleChannels: ['tiktok', 'whatnot', 'discord'],
    recoveredChannels: [],
    topAmplifiers: [
      { handle: 'GlobalCardEconomics', platform: 'youtube', reach: 480000, amplificationDate: '2026-02-05' },
      { handle: '@SoccerCardKing', platform: 'twitter', reach: 620000, amplificationDate: '2026-02-10' },
      { handle: 'TheBeautifulGame', platform: 'podcast', reach: 210000, amplificationDate: '2026-02-18' },
    ],
    affectedCards: [
      { name: '2022 Jude Bellingham Topps Chrome Refractor PSA 10', priceChange: 31.4 },
      { name: '2024 Lamine Yamal Topps Chrome PSA 10', priceChange: 28.9 },
      { name: '2023 Endrick Prizm Silver PSA 10', priceChange: 19.2 },
    ],
    daysToFullPricing: 18,
    confidence: 68,
  },
  {
    id: 'nar-006',
    title: 'Caitlin Clark effect — WNBA cards are the new frontier',
    patientZero: {
      handle: '@WNBACardWatch',
      platform: 'twitter',
      date: '2026-01-28',
    },
    currentPhase: 'endemic',
    r0: 1.1,
    viralLoad: 45.8,
    peakDate: '2026-02-15',
    decayDate: '2026-03-01',
    exposures: 8900000,
    priceImpactPercent: 45.8,
    infectedChannels: [],
    susceptibleChannels: [],
    recoveredChannels: ['twitter', 'youtube', 'reddit', 'tiktok', 'whatnot', 'discord', 'podcast'],
    topAmplifiers: [
      { handle: '@WNBACardWatch', platform: 'twitter', reach: 1200000, amplificationDate: '2026-01-28' },
      { handle: 'SportsCardInvestor', platform: 'youtube', reach: 950000, amplificationDate: '2026-02-01' },
      { handle: '@ClarkCardTracker', platform: 'tiktok', reach: 3400000, amplificationDate: '2026-02-03' },
    ],
    affectedCards: [
      { name: '2024 Caitlin Clark Prizm Silver PSA 10', priceChange: 68.4 },
      { name: '2024 Angel Reese Optic Holo PSA 10', priceChange: 34.2 },
      { name: '2024 Cameron Brink Prizm Base PSA 10', priceChange: 22.7 },
    ],
    daysToFullPricing: 0,
    confidence: 95,
  },
  {
    id: 'nar-007',
    title: 'LeBron retirement announcement will crash rookie prices',
    patientZero: {
      handle: '@NBAInsider_J',
      platform: 'twitter',
      date: '2026-03-12',
    },
    currentPhase: 'emergence',
    r0: 5.2,
    viralLoad: 12.6,
    peakDate: '2026-03-30',
    decayDate: '2026-04-20',
    exposures: 680000,
    priceImpactPercent: 12.6,
    infectedChannels: ['twitter', 'reddit'],
    susceptibleChannels: ['youtube', 'tiktok', 'whatnot', 'discord', 'podcast'],
    recoveredChannels: [],
    topAmplifiers: [
      { handle: '@NBAInsider_J', platform: 'twitter', reach: 450000, amplificationDate: '2026-03-12' },
      { handle: 'u/LeBronCardCollector', platform: 'reddit', reach: 120000, amplificationDate: '2026-03-14' },
    ],
    affectedCards: [
      { name: '2003 LeBron James Topps Chrome Refractor PSA 10', priceChange: 8.5 },
      { name: '2003 LeBron James Prizm Draft Picks PSA 10', priceChange: 5.2 },
    ],
    daysToFullPricing: 22,
    confidence: 42,
  },
  {
    id: 'nar-008',
    title: 'Fractional card ownership is killing the hobby',
    patientZero: {
      handle: 'HobbyGatekeeper',
      platform: 'discord',
      date: '2026-02-25',
    },
    currentPhase: 'peak-saturation',
    r0: 2.5,
    viralLoad: 5.1,
    peakDate: '2026-03-15',
    decayDate: '2026-03-30',
    exposures: 920000,
    priceImpactPercent: -5.1,
    infectedChannels: ['discord', 'twitter', 'reddit', 'youtube', 'podcast'],
    susceptibleChannels: ['tiktok'],
    recoveredChannels: ['whatnot'],
    topAmplifiers: [
      { handle: 'HobbyGatekeeper', platform: 'discord', reach: 85000, amplificationDate: '2026-02-25' },
      { handle: '@TradFiCards', platform: 'twitter', reach: 310000, amplificationDate: '2026-02-28' },
      { handle: 'CardDebatePod', platform: 'podcast', reach: 190000, amplificationDate: '2026-03-04' },
    ],
    affectedCards: [
      { name: 'Fractional platforms (Dibbs, Rally) listings', priceChange: -8.3 },
      { name: 'Physical card premiums vs. fractional', priceChange: 4.2 },
    ],
    daysToFullPricing: 3,
    confidence: 61,
  },
];

// ── Public API Functions ─────────────────────────────────────

export function getNarratives(): Narrative[] {
  return MOCK_NARRATIVES;
}

export function getPropagationStats(): PropagationStats {
  const narratives = MOCK_NARRATIVES;
  const emerging = narratives.filter(n => n.currentPhase === 'emergence').length;
  const peak = narratives.filter(n => n.currentPhase === 'peak-saturation').length;
  const decaying = narratives.filter(n => n.currentPhase === 'decay').length;
  const active = narratives.filter(n => n.currentPhase !== 'endemic' && n.currentPhase !== 'decay').length;
  const avgR0 = narratives.reduce((sum, n) => sum + n.r0, 0) / narratives.length;
  const highest = [...narratives].sort((a, b) => Math.abs(b.viralLoad) - Math.abs(a.viralLoad))[0];

  return {
    activeNarratives: active,
    emergingNarratives: emerging,
    peakNarratives: peak,
    decayingNarratives: decaying,
    avgR0: Math.round(avgR0 * 10) / 10,
    highestViralLoad: {
      narrative: highest.title,
      load: highest.viralLoad,
    },
  };
}

export function getPhaseColor(phase: NarrativePhase): string {
  const colors: Record<NarrativePhase, string> = {
    'emergence': 'text-blue-400',
    'exponential-growth': 'text-green-400',
    'peak-saturation': 'text-amber-400',
    'decay': 'text-orange-400',
    'endemic': 'text-gray-400',
  };
  return colors[phase];
}

export function getPhaseLabel(phase: NarrativePhase): string {
  const labels: Record<NarrativePhase, string> = {
    'emergence': 'Emerging',
    'exponential-growth': 'Exponential Growth',
    'peak-saturation': 'Peak Saturation',
    'decay': 'Decaying',
    'endemic': 'Endemic',
  };
  return labels[phase];
}

export function getChannelColor(channel: PropagationChannel): string {
  const colors: Record<PropagationChannel, string> = {
    youtube: 'text-red-400',
    twitter: 'text-sky-400',
    reddit: 'text-orange-400',
    whatnot: 'text-purple-400',
    tiktok: 'text-pink-400',
    discord: 'text-indigo-400',
    podcast: 'text-emerald-400',
  };
  return colors[channel];
}

export function formatR0(r0: number): string {
  if (r0 >= 4.0) return `R₀ ${r0.toFixed(1)} — Super-spreader`;
  if (r0 >= 2.5) return `R₀ ${r0.toFixed(1)} — Highly contagious`;
  if (r0 >= 1.5) return `R₀ ${r0.toFixed(1)} — Spreading`;
  if (r0 >= 1.0) return `R₀ ${r0.toFixed(1)} — Endemic`;
  return `R₀ ${r0.toFixed(1)} — Dying out`;
}
