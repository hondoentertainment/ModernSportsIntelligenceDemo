// ---- Types ----

export type Generation = 'silent' | 'boomer' | 'gen-x' | 'millennial' | 'gen-z' | 'gen-alpha';
export type CulturalTier = 'iconic' | 'legendary' | 'notable' | 'emerging' | 'fading';

export interface MemoryScore {
  id: string;
  playerName: string;
  sport: string;
  era: string;
  overallScore: number;
  generationalScores: Record<Generation, number>;
  culturalTier: CulturalTier;
  peakYear: number;
  cardValueMultiplier: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface CulturalMetric {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  unit: string;
  category: 'media' | 'social' | 'merchandise' | 'historical';
  description: string;
  trend: 'rising' | 'falling' | 'stable';
}

export interface GenerationalView {
  generation: Generation;
  label: string;
  ageRange: string;
  marketShare: number;
  topPlayers: string[];
  avgSpendPerCard: number;
  nostalgiaPeakEra: string;
  collectingMotivation: string;
}

export interface IconicPlayer {
  id: string;
  name: string;
  sport: string;
  team: string;
  era: string;
  memoryScore: number;
  culturalTier: CulturalTier;
  signatureCard: string;
  signatureCardValue: number;
  careerHighlight: string;
  mediaAppearances: number;
  socialMentions: number;
  nostalgiaIndex: number;
}

export interface MemoryStats {
  totalPlayersIndexed: number;
  avgMemoryScore: number;
  iconicCount: number;
  legendaryCount: number;
  risingStars: number;
  fadingLegends: number;
  topGeneration: string;
}

// ---- Mock Data ----

const mockMemoryScores: MemoryScore[] = [
  {
    id: 'ms-001', playerName: 'Michael Jordan', sport: 'Basketball', era: '1984-2003', overallScore: 99,
    generationalScores: { silent: 45, boomer: 88, 'gen-x': 99, millennial: 95, 'gen-z': 78, 'gen-alpha': 62 },
    culturalTier: 'iconic', peakYear: 1996, cardValueMultiplier: 3.8, trend: 'stable',
  },
  {
    id: 'ms-002', playerName: 'Ken Griffey Jr.', sport: 'Baseball', era: '1989-2010', overallScore: 88,
    generationalScores: { silent: 22, boomer: 65, 'gen-x': 92, millennial: 90, 'gen-z': 48, 'gen-alpha': 25 },
    culturalTier: 'legendary', peakYear: 1997, cardValueMultiplier: 2.9, trend: 'falling',
  },
  {
    id: 'ms-003', playerName: 'LeBron James', sport: 'Basketball', era: '2003-present', overallScore: 96,
    generationalScores: { silent: 18, boomer: 55, 'gen-x': 72, millennial: 98, 'gen-z': 94, 'gen-alpha': 85 },
    culturalTier: 'iconic', peakYear: 2016, cardValueMultiplier: 3.2, trend: 'stable',
  },
  {
    id: 'ms-004', playerName: 'Derek Jeter', sport: 'Baseball', era: '1995-2014', overallScore: 82,
    generationalScores: { silent: 15, boomer: 58, 'gen-x': 78, millennial: 88, 'gen-z': 42, 'gen-alpha': 18 },
    culturalTier: 'legendary', peakYear: 2001, cardValueMultiplier: 2.1, trend: 'falling',
  },
  {
    id: 'ms-005', playerName: 'Patrick Mahomes', sport: 'Football', era: '2017-present', overallScore: 84,
    generationalScores: { silent: 5, boomer: 32, 'gen-x': 55, millennial: 82, 'gen-z': 96, 'gen-alpha': 91 },
    culturalTier: 'legendary', peakYear: 2023, cardValueMultiplier: 2.6, trend: 'rising',
  },
  {
    id: 'ms-006', playerName: 'Wayne Gretzky', sport: 'Hockey', era: '1979-1999', overallScore: 91,
    generationalScores: { silent: 52, boomer: 94, 'gen-x': 96, millennial: 68, 'gen-z': 35, 'gen-alpha': 15 },
    culturalTier: 'iconic', peakYear: 1985, cardValueMultiplier: 3.5, trend: 'falling',
  },
  {
    id: 'ms-007', playerName: 'Victor Wembanyama', sport: 'Basketball', era: '2023-present', overallScore: 62,
    generationalScores: { silent: 2, boomer: 12, 'gen-x': 28, millennial: 58, 'gen-z': 88, 'gen-alpha': 92 },
    culturalTier: 'emerging', peakYear: 2025, cardValueMultiplier: 1.8, trend: 'rising',
  },
  {
    id: 'ms-008', playerName: 'Tom Brady', sport: 'Football', era: '2000-2023', overallScore: 93,
    generationalScores: { silent: 25, boomer: 72, 'gen-x': 88, millennial: 96, 'gen-z': 75, 'gen-alpha': 42 },
    culturalTier: 'iconic', peakYear: 2017, cardValueMultiplier: 3.0, trend: 'stable',
  },
];

const mockCulturalMetrics: CulturalMetric[] = [
  { id: 'cm-001', name: 'Documentary Features', value: 847, maxValue: 1000, unit: 'titles', category: 'media', description: 'Total sports documentaries featuring indexed players across streaming platforms.', trend: 'rising' },
  { id: 'cm-002', name: 'Social Media Mentions', value: 12400000, maxValue: 20000000, unit: 'mentions/mo', category: 'social', description: 'Monthly aggregate social media mentions of indexed players across major platforms.', trend: 'stable' },
  { id: 'cm-003', name: 'Jersey Retirement Events', value: 23, maxValue: 50, unit: 'events/yr', category: 'historical', description: 'Annual jersey retirement ceremonies that drive memory score spikes for featured players.', trend: 'rising' },
  { id: 'cm-004', name: 'Licensed Merchandise Lines', value: 1240, maxValue: 2000, unit: 'product lines', category: 'merchandise', description: 'Active licensed merchandise lines featuring indexed players.', trend: 'stable' },
  { id: 'cm-005', name: 'Hall of Fame Inductees', value: 4, maxValue: 10, unit: 'players/yr', category: 'historical', description: 'Annual Hall of Fame inductions create permanent memory anchors and card value floors.', trend: 'stable' },
  { id: 'cm-006', name: 'Viral Highlight Clips', value: 3200, maxValue: 5000, unit: 'clips/mo', category: 'social', description: 'Monthly viral sports highlight clips exceeding 1M views.', trend: 'rising' },
];

const mockGenerationalViews: GenerationalView[] = [
  { generation: 'boomer', label: 'Baby Boomers', ageRange: '62-80', marketShare: 18.5, topPlayers: ['Hank Aaron', 'Mickey Mantle', 'Johnny Unitas'], avgSpendPerCard: 342, nostalgiaPeakEra: '1960s-1970s', collectingMotivation: 'Nostalgia and childhood completion' },
  { generation: 'gen-x', label: 'Generation X', ageRange: '46-61', marketShare: 31.2, topPlayers: ['Michael Jordan', 'Ken Griffey Jr.', 'Wayne Gretzky'], avgSpendPerCard: 287, nostalgiaPeakEra: '1980s-1990s', collectingMotivation: 'Junk wax era redemption and investment' },
  { generation: 'millennial', label: 'Millennials', ageRange: '30-45', marketShare: 34.8, topPlayers: ['LeBron James', 'Tom Brady', 'Derek Jeter'], avgSpendPerCard: 195, nostalgiaPeakEra: '2000s-2010s', collectingMotivation: 'Investment returns and community status' },
  { generation: 'gen-z', label: 'Generation Z', ageRange: '14-29', marketShare: 12.8, topPlayers: ['Patrick Mahomes', 'Victor Wembanyama', 'Shohei Ohtani'], avgSpendPerCard: 78, nostalgiaPeakEra: '2020s', collectingMotivation: 'Hype culture and social media flex' },
  { generation: 'gen-alpha', label: 'Generation Alpha', ageRange: '0-13', marketShare: 2.7, topPlayers: ['Victor Wembanyama', 'Connor Bedard', 'Caitlin Clark'], avgSpendPerCard: 22, nostalgiaPeakEra: '2020s-2030s', collectingMotivation: 'Digital-native collecting and gaming crossover' },
];

const mockIconicPlayers: IconicPlayer[] = [
  { id: 'ip-001', name: 'Michael Jordan', sport: 'Basketball', team: 'Chicago Bulls', era: '1984-2003', memoryScore: 99, culturalTier: 'iconic', signatureCard: '1986 Fleer #57', signatureCardValue: 738000, careerHighlight: '6x NBA Champion, 5x MVP', mediaAppearances: 2840, socialMentions: 4200000, nostalgiaIndex: 97 },
  { id: 'ip-002', name: 'LeBron James', sport: 'Basketball', team: 'Los Angeles Lakers', era: '2003-present', memoryScore: 96, culturalTier: 'iconic', signatureCard: '2003 Topps Chrome #111', signatureCardValue: 425000, careerHighlight: '4x NBA Champion, All-Time Scoring Leader', mediaAppearances: 3120, socialMentions: 5800000, nostalgiaIndex: 72 },
  { id: 'ip-003', name: 'Wayne Gretzky', sport: 'Hockey', team: 'Edmonton Oilers', era: '1979-1999', memoryScore: 91, culturalTier: 'iconic', signatureCard: '1979 O-Pee-Chee #18', signatureCardValue: 3750000, careerHighlight: '4x Stanley Cup Champion, 894 Goals', mediaAppearances: 1560, socialMentions: 890000, nostalgiaIndex: 94 },
  { id: 'ip-004', name: 'Tom Brady', sport: 'Football', team: 'New England Patriots', era: '2000-2023', memoryScore: 93, culturalTier: 'iconic', signatureCard: '2000 Playoff Contenders #144', signatureCardValue: 3107000, careerHighlight: '7x Super Bowl Champion', mediaAppearances: 2650, socialMentions: 3400000, nostalgiaIndex: 78 },
  { id: 'ip-005', name: 'Ken Griffey Jr.', sport: 'Baseball', team: 'Seattle Mariners', era: '1989-2010', memoryScore: 88, culturalTier: 'legendary', signatureCard: '1989 Upper Deck #1', signatureCardValue: 82000, careerHighlight: '630 HR, 13x All-Star', mediaAppearances: 980, socialMentions: 620000, nostalgiaIndex: 92 },
];

// ---- Public API ----

export function getMemoryScores(): MemoryScore[] {
  return mockMemoryScores;
}

export function getCulturalMetrics(): CulturalMetric[] {
  return mockCulturalMetrics;
}

export function getGenerationalViews(): GenerationalView[] {
  return mockGenerationalViews;
}

export function getIconicPlayers(): IconicPlayer[] {
  return mockIconicPlayers;
}

export function getMemoryStats(): MemoryStats {
  return {
    totalPlayersIndexed: mockMemoryScores.length,
    avgMemoryScore: Math.round(mockMemoryScores.reduce((a, b) => a + b.overallScore, 0) / mockMemoryScores.length),
    iconicCount: mockMemoryScores.filter(m => m.culturalTier === 'iconic').length,
    legendaryCount: mockMemoryScores.filter(m => m.culturalTier === 'legendary').length,
    risingStars: mockMemoryScores.filter(m => m.trend === 'rising').length,
    fadingLegends: mockMemoryScores.filter(m => m.trend === 'falling').length,
    topGeneration: 'Millennials',
  };
}
