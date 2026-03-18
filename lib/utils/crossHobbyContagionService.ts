// Cross-Hobby Contagion Network — Phase 229
// Track trend propagation between Pokémon, sports cards, comics, memorabilia

export interface HobbyNode {
  id: string;
  name: string;
  category: 'sports-cards' | 'pokemon-tcg' | 'comics' | 'memorabilia' | 'sneakers' | 'coins' | 'wine' | 'watches';
  marketCap: number;
  growth30d: number;
  sentimentScore: number;
  topAssets: string[];
  color: string;
}

export interface ContagionEdge {
  id: string;
  sourceHobby: string;
  targetHobby: string;
  correlationStrength: number;
  lagDays: number;
  direction: 'positive' | 'negative' | 'mixed';
  mechanism: string;
  recentExample: string;
}

export interface SpilloverEvent {
  id: string;
  originHobby: string;
  affectedHobbies: string[];
  trigger: string;
  date: string;
  magnitude: number;
  type: 'bullish' | 'bearish' | 'rotation';
  description: string;
  priceImpact: { hobby: string; impact: number }[];
}

export interface CrossHobbyIndex {
  date: string;
  sportsCards: number;
  pokemon: number;
  comics: number;
  memorabilia: number;
  sneakers: number;
}

const MOCK_NODES: HobbyNode[] = [
  { id: 'h-1', name: 'Sports Cards', category: 'sports-cards', marketCap: 28500000000, growth30d: 8.4, sentimentScore: 78, topAssets: ['1952 Topps Mantle', '2018 Prizm Luka Silver', '2020 Panini Contenders Burrow Auto'], color: '#34d399' },
  { id: 'h-2', name: 'Pokémon TCG', category: 'pokemon-tcg', marketCap: 12800000000, growth30d: 12.1, sentimentScore: 85, topAssets: ['1st Ed Charizard', 'Illustrator Pikachu', 'Gold Star Rayquaza'], color: '#fbbf24' },
  { id: 'h-3', name: 'Comics', category: 'comics', marketCap: 8400000000, growth30d: -2.3, sentimentScore: 62, topAssets: ['Action Comics #1', 'Amazing Fantasy #15', 'Batman #1'], color: '#818cf8' },
  { id: 'h-4', name: 'Game-Used Memorabilia', category: 'memorabilia', marketCap: 6200000000, growth30d: 5.7, sentimentScore: 71, topAssets: ['Jordan Game-Worn Jersey', 'Babe Ruth Bat', 'Super Bowl Rings'], color: '#f87171' },
  { id: 'h-5', name: 'Sneakers', category: 'sneakers', marketCap: 4800000000, growth30d: -5.2, sentimentScore: 54, topAssets: ['Air Jordan 1 Chicago', 'Nike MAG', 'Travis Scott Dunks'], color: '#a78bfa' },
  { id: 'h-6', name: 'Coins & Currency', category: 'coins', marketCap: 18200000000, growth30d: 3.1, sentimentScore: 68, topAssets: ['1933 Double Eagle', '1804 Silver Dollar', '1913 Liberty Nickel'], color: '#fb923c' },
];

const MOCK_EDGES: ContagionEdge[] = [
  { id: 'ce-1', sourceHobby: 'Pokémon TCG', targetHobby: 'Sports Cards', correlationStrength: 0.72, lagDays: 14, direction: 'positive', mechanism: 'Collector capital rotation — Pokémon hype draws new collectors who discover sports cards 2-3 weeks later', recentExample: 'Feb 2026 Pokémon 151 reprint drove 8% sports card volume increase in week 3' },
  { id: 'ce-2', sourceHobby: 'Sneakers', targetHobby: 'Sports Cards', correlationStrength: 0.58, lagDays: 21, direction: 'positive', mechanism: 'Athlete-brand crossover — sneaker release attention spills into card demand for same athletes', recentExample: 'LeBron 21 release correlated with 12% spike in LeBron card searches' },
  { id: 'ce-3', sourceHobby: 'Sports Cards', targetHobby: 'Game-Used Memorabilia', correlationStrength: 0.65, lagDays: 30, direction: 'positive', mechanism: 'Collector upgrade path — card collectors graduating to game-used items as portfolio matures', recentExample: 'HOF announcement drove card spikes first, then jersey/bat demand 4 weeks later' },
  { id: 'ce-4', sourceHobby: 'Comics', targetHobby: 'Sports Cards', correlationStrength: 0.41, lagDays: 45, direction: 'mixed', mechanism: 'MCU movie cycle — comic speculation capital rotates to sports during off-cycles', recentExample: 'Post-Avengers fatigue shifted $40M in speculator capital to sports Q1 2026' },
  { id: 'ce-5', sourceHobby: 'Sports Cards', targetHobby: 'Pokémon TCG', correlationStrength: 0.68, lagDays: 7, direction: 'positive', mechanism: 'Breaker crossover — sports card breakers adding Pokémon breaks, introducing card collectors to TCG', recentExample: 'Whatnot top sports breakers adding Pokémon streams saw 25% audience overlap' },
  { id: 'ce-6', sourceHobby: 'Coins & Currency', targetHobby: 'Sports Cards', correlationStrength: 0.34, lagDays: 60, direction: 'negative', mechanism: 'Safe haven rotation — economic uncertainty drives capital from sports cards to coins/bullion', recentExample: 'March 2026 bank concerns saw coin buying spike while card volumes dropped 6%' },
];

const MOCK_SPILLOVERS: SpilloverEvent[] = [
  { id: 'se-1', originHobby: 'Pokémon TCG', affectedHobbies: ['Sports Cards', 'Comics'], trigger: 'Pokémon 30th Anniversary Announcement', date: '2026-02-27', magnitude: 78, type: 'bullish', description: 'Anniversary hype created collector enthusiasm spillover into all graded collectibles.', priceImpact: [{ hobby: 'Sports Cards', impact: 4.2 }, { hobby: 'Comics', impact: 2.8 }] },
  { id: 'se-2', originHobby: 'Sneakers', affectedHobbies: ['Sports Cards'], trigger: 'Nike/Jordan Brand Athlete Collab Wave', date: '2026-03-01', magnitude: 62, type: 'bullish', description: 'Multiple athlete sneaker releases drove cross-platform attention to player cards.', priceImpact: [{ hobby: 'Sports Cards', impact: 6.1 }] },
  { id: 'se-3', originHobby: 'Comics', affectedHobbies: ['Sports Cards', 'Pokémon TCG'], trigger: 'Marvel Phase 7 Fatigue', date: '2026-01-15', magnitude: 55, type: 'rotation', description: 'Declining comic speculation drove capital rotation into sports and Pokémon.', priceImpact: [{ hobby: 'Sports Cards', impact: 3.5 }, { hobby: 'Pokémon TCG', impact: 5.2 }] },
  { id: 'se-4', originHobby: 'Coins & Currency', affectedHobbies: ['Sports Cards', 'Game-Used Memorabilia'], trigger: 'Gold Price Correction', date: '2026-02-10', magnitude: 48, type: 'bullish', description: 'Profit-taking in precious metals reinvested into alternative collectibles.', priceImpact: [{ hobby: 'Sports Cards', impact: 2.1 }, { hobby: 'Game-Used Memorabilia', impact: 1.8 }] },
];

const MOCK_INDEX: CrossHobbyIndex[] = [
  { date: '2026-03-15', sportsCards: 112, pokemon: 118, comics: 94, memorabilia: 106, sneakers: 88 },
  { date: '2026-03-08', sportsCards: 110, pokemon: 115, comics: 95, memorabilia: 105, sneakers: 90 },
  { date: '2026-03-01', sportsCards: 108, pokemon: 112, comics: 96, memorabilia: 104, sneakers: 92 },
  { date: '2026-02-22', sportsCards: 106, pokemon: 108, comics: 97, memorabilia: 103, sneakers: 94 },
  { date: '2026-02-15', sportsCards: 104, pokemon: 105, comics: 98, memorabilia: 102, sneakers: 95 },
  { date: '2026-02-08', sportsCards: 102, pokemon: 102, comics: 99, memorabilia: 101, sneakers: 96 },
  { date: '2026-02-01', sportsCards: 100, pokemon: 100, comics: 100, memorabilia: 100, sneakers: 100 },
];

export function getNodes(): HobbyNode[] { return [...MOCK_NODES]; }
export function getEdges(): ContagionEdge[] { return [...MOCK_EDGES]; }
export function getSpillovers(): SpilloverEvent[] { return [...MOCK_SPILLOVERS]; }
export function getIndex(): CrossHobbyIndex[] { return [...MOCK_INDEX]; }

export default { getNodes, getEdges, getSpillovers, getIndex };
