// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// Cultural Velocity Tracker – Service Layer
// Tracks how cultural moments create price shocks in the card market
// ─────────────────────────────────────────────────────────────

export type CulturalDomain = 'film' | 'music' | 'social-media' | 'politics' | 'fashion' | 'gaming' | 'documentary' | 'streaming';

export type VelocityPhase = 'pre-catalyst' | 'ignition' | 'acceleration' | 'peak-velocity' | 'deceleration' | 'stabilization';

export interface CulturalEvent {
  id: string;
  title: string;
  domain: CulturalDomain;
  phase: VelocityPhase;
  detectedDate: string;
  peakDate: string;
  velocityScore: number; // 0-100
  priceImpact: number; // %
  reachEstimate: number; // millions of people
  affectedPlayers: {
    name: string;
    sport: string;
    priceChange: number;
  }[];
  affectedSets: string[];
  estimatedDuration: string;
  monetizationWindow: string;
  confidence: number; // 0-100
  source: string;
}

export interface VelocityStats {
  activeCatalysts: number;
  preCatalysts: number;
  peakEvents: number;
  avgVelocityScore: number;
  biggestImpact: {
    event: string;
    impact: number;
  };
  totalOpportunities: number;
}

// ── Mock Cultural Events (8 items) ───────────────────────────

const MOCK_CULTURAL_EVENTS: CulturalEvent[] = [
  {
    id: 'ce-001',
    title: 'Michael Jordan documentary sequel announced',
    domain: 'documentary',
    phase: 'acceleration',
    detectedDate: '2026-03-02',
    peakDate: '2026-04-15',
    velocityScore: 88,
    priceImpact: 24.6,
    reachEstimate: 45000000,
    affectedPlayers: [
      { name: 'Michael Jordan', sport: 'Basketball', priceChange: 24.6 },
      { name: 'Scottie Pippen', sport: 'Basketball', priceChange: 12.3 },
      { name: 'Dennis Rodman', sport: 'Basketball', priceChange: 8.7 },
    ],
    affectedSets: ['1986 Fleer Basketball', '1997 Metal Universe', '1996 Topps Chrome'],
    estimatedDuration: '6-8 weeks',
    monetizationWindow: 'Buy now — sell within 2 weeks of release date',
    confidence: 85,
    source: 'Netflix press release + social media surge',
  },
  {
    id: 'ce-002',
    title: 'Drake wears vintage Vince Carter jersey in new music video',
    domain: 'music',
    phase: 'peak-velocity',
    detectedDate: '2026-03-10',
    peakDate: '2026-03-17',
    velocityScore: 72,
    priceImpact: 18.2,
    reachEstimate: 28000000,
    affectedPlayers: [
      { name: 'Vince Carter', sport: 'Basketball', priceChange: 18.2 },
      { name: 'Tracy McGrady', sport: 'Basketball', priceChange: 6.4 },
    ],
    affectedSets: ['1998 Topps Chrome Basketball', '1998 Finest Basketball', '1999 Upper Deck'],
    estimatedDuration: '2-3 weeks',
    monetizationWindow: 'Sell within 5 days — music video hype cycles are short',
    confidence: 78,
    source: 'YouTube trending + Twitter mentions',
  },
  {
    id: 'ce-003',
    title: 'Shohei Ohtani feature film greenlit by Sony',
    domain: 'film',
    phase: 'pre-catalyst',
    detectedDate: '2026-03-14',
    peakDate: '2026-09-01',
    velocityScore: 45,
    priceImpact: 8.5,
    reachEstimate: 12000000,
    affectedPlayers: [
      { name: 'Shohei Ohtani', sport: 'Baseball', priceChange: 8.5 },
      { name: 'Ichiro Suzuki', sport: 'Baseball', priceChange: 3.2 },
    ],
    affectedSets: ['2018 Topps Chrome Baseball', '2018 Bowman Chrome', '2024 Topps Series 1'],
    estimatedDuration: '12-18 months (production to release)',
    monetizationWindow: 'Accumulate now — price in 30% of expected impact at announcement',
    confidence: 62,
    source: 'Variety exclusive report',
  },
  {
    id: 'ce-004',
    title: 'Caitlin Clark named to Time 100 Most Influential',
    domain: 'social-media',
    phase: 'deceleration',
    detectedDate: '2026-02-20',
    peakDate: '2026-03-05',
    velocityScore: 65,
    priceImpact: 14.8,
    reachEstimate: 52000000,
    affectedPlayers: [
      { name: 'Caitlin Clark', sport: 'Basketball', priceChange: 14.8 },
      { name: 'Angel Reese', sport: 'Basketball', priceChange: 5.1 },
      { name: 'Paige Bueckers', sport: 'Basketball', priceChange: 4.3 },
    ],
    affectedSets: ['2024 Prizm WNBA', '2024 Optic WNBA', '2024 Select WNBA'],
    estimatedDuration: '4 weeks',
    monetizationWindow: 'Sell position now — decelerating phase, 70% of impact already priced',
    confidence: 88,
    source: 'Time Magazine + viral social media coverage',
  },
  {
    id: 'ce-005',
    title: 'Fortnite x NBA 2K crossover event with vintage player skins',
    domain: 'gaming',
    phase: 'ignition',
    detectedDate: '2026-03-15',
    peakDate: '2026-03-28',
    velocityScore: 58,
    priceImpact: 11.3,
    reachEstimate: 35000000,
    affectedPlayers: [
      { name: 'Allen Iverson', sport: 'Basketball', priceChange: 11.3 },
      { name: 'Kobe Bryant', sport: 'Basketball', priceChange: 7.8 },
      { name: 'Shaquille O\'Neal', sport: 'Basketball', priceChange: 5.2 },
    ],
    affectedSets: ['1996 Topps Chrome Basketball', '1996 Finest Basketball', '1996 Flair Showcase'],
    estimatedDuration: '3-4 weeks',
    monetizationWindow: 'Buy within 48 hours — gaming crossover events spike fast',
    confidence: 71,
    source: 'Fortnite leaker accounts + Epic Games press',
  },
  {
    id: 'ce-006',
    title: 'US presidential candidate wears vintage sports jerseys on campaign trail',
    domain: 'politics',
    phase: 'acceleration',
    detectedDate: '2026-03-08',
    peakDate: '2026-04-02',
    velocityScore: 42,
    priceImpact: 6.2,
    reachEstimate: 18000000,
    affectedPlayers: [
      { name: 'Roberto Clemente', sport: 'Baseball', priceChange: 6.2 },
      { name: 'Hank Aaron', sport: 'Baseball', priceChange: 4.8 },
    ],
    affectedSets: ['1955 Topps Baseball', '1956 Topps Baseball', '1973 Topps Baseball'],
    estimatedDuration: '6-10 weeks (tied to campaign cycle)',
    monetizationWindow: 'Hold through Super Tuesday — political cycles have extended tails',
    confidence: 48,
    source: 'CNN coverage + political social media',
  },
  {
    id: 'ce-007',
    title: 'Travis Kelce launches sports card subscription box on Instagram',
    domain: 'social-media',
    phase: 'peak-velocity',
    detectedDate: '2026-03-12',
    peakDate: '2026-03-18',
    velocityScore: 82,
    priceImpact: 28.4,
    reachEstimate: 62000000,
    affectedPlayers: [
      { name: 'Travis Kelce', sport: 'Football', priceChange: 28.4 },
      { name: 'Patrick Mahomes', sport: 'Football', priceChange: 9.6 },
      { name: 'Taylor Swift adjacent memorabilia', sport: 'Football', priceChange: 15.2 },
    ],
    affectedSets: ['2023 Prizm Football', '2023 Optic Football', '2017 Prizm Football'],
    estimatedDuration: '2-4 weeks',
    monetizationWindow: 'Sell Kelce cards now — celebrity-driven spikes revert within 10 days',
    confidence: 82,
    source: 'Instagram announcement + TMZ coverage',
  },
  {
    id: 'ce-008',
    title: 'Netflix "Untold" series covers 2004 Pistons — underdog narrative revival',
    domain: 'streaming',
    phase: 'stabilization',
    detectedDate: '2026-01-15',
    peakDate: '2026-02-10',
    velocityScore: 35,
    priceImpact: 9.1,
    reachEstimate: 8500000,
    affectedPlayers: [
      { name: 'Ben Wallace', sport: 'Basketball', priceChange: 9.1 },
      { name: 'Chauncey Billups', sport: 'Basketball', priceChange: 7.3 },
      { name: 'Rasheed Wallace', sport: 'Basketball', priceChange: 5.8 },
    ],
    affectedSets: ['2003 Topps Chrome Basketball', '2004 Upper Deck', '1996 Topps Chrome Basketball'],
    estimatedDuration: '8 weeks (long tail for documentaries)',
    monetizationWindow: 'Opportunity passed — prices have stabilized at new baseline',
    confidence: 92,
    source: 'Netflix viewership data + Rotten Tomatoes ratings',
  },
];

// ── Public API Functions ─────────────────────────────────────

export function getCulturalEvents(): CulturalEvent[] {
  return MOCK_CULTURAL_EVENTS;
}

export function getVelocityStats(): VelocityStats {
  const events = MOCK_CULTURAL_EVENTS;
  const active = events.filter(e => e.phase !== 'stabilization').length;
  const pre = events.filter(e => e.phase === 'pre-catalyst').length;
  const peak = events.filter(e => e.phase === 'peak-velocity').length;
  const avgVelocity = events.reduce((sum, e) => sum + e.velocityScore, 0) / events.length;
  const biggest = [...events].sort((a, b) => Math.abs(b.priceImpact) - Math.abs(a.priceImpact))[0];

  return {
    activeCatalysts: active,
    preCatalysts: pre,
    peakEvents: peak,
    avgVelocityScore: Math.round(avgVelocity),
    biggestImpact: {
      event: biggest.title,
      impact: biggest.priceImpact,
    },
    totalOpportunities: events.length,
  };
}

export function getDomainColor(domain: CulturalDomain): string {
  const colors: Record<CulturalDomain, string> = {
    film: 'text-amber-400',
    music: 'text-pink-400',
    'social-media': 'text-sky-400',
    politics: 'text-red-400',
    fashion: 'text-purple-400',
    gaming: 'text-green-400',
    documentary: 'text-orange-400',
    streaming: 'text-indigo-400',
  };
  return colors[domain];
}

export function getDomainIcon(domain: CulturalDomain): string {
  const icons: Record<CulturalDomain, string> = {
    film: 'Film',
    music: 'Music',
    'social-media': 'Share2',
    politics: 'Landmark',
    fashion: 'Shirt',
    gaming: 'Gamepad2',
    documentary: 'Clapperboard',
    streaming: 'Tv',
  };
  return icons[domain];
}

export function getPhaseColor(phase: VelocityPhase): string {
  const colors: Record<VelocityPhase, string> = {
    'pre-catalyst': 'text-blue-400',
    'ignition': 'text-cyan-400',
    'acceleration': 'text-green-400',
    'peak-velocity': 'text-amber-400',
    'deceleration': 'text-orange-400',
    'stabilization': 'text-gray-400',
  };
  return colors[phase];
}

export function getPhaseLabel(phase: VelocityPhase): string {
  const labels: Record<VelocityPhase, string> = {
    'pre-catalyst': 'Pre-Catalyst',
    'ignition': 'Ignition',
    'acceleration': 'Acceleration',
    'peak-velocity': 'Peak Velocity',
    'deceleration': 'Deceleration',
    'stabilization': 'Stabilization',
  };
  return labels[phase];
}
