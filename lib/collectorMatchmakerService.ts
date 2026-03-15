// ─── Collector Compatibility Matchmaker Service ─────────────────────────────
// Industry-first: Nash equilibrium-optimized trading partner matching

import { Sport } from '../types';

// ---- Types ----

export interface CollectorProfile {
  id: string;
  alias: string;
  avatar: string;
  collectionFocus: {
    sports: Sport[];
    eras: string[];
    sets: string[];
  };
  totalCards: number;
  totalValue: number;
  needsList: CardNeed[];
  surplusList: CardSurplus[];
  tradingStyle: 'aggressive' | 'fair' | 'conservative';
  responseRate: number;
  completedTrades: number;
  rating: number;
  joinedDate: string;
  lastActive: string;
  bio: string;
  location: string;
}

export interface CardNeed {
  id: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  priority: 'high' | 'medium' | 'low';
  maxBudget: number;
}

export interface CardSurplus {
  id: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  condition: string;
  estimatedValue: number;
  quantity: number;
}

export interface MatchResult {
  matchId: string;
  collector1: CollectorProfile;
  collector2: CollectorProfile;
  compatibilityScore: number;
  mutualBenefitScore: number;
  tradeProposals: TradeProposal[];
  gaps: CollectionGap[];
  overlaps: CollectionOverlap[];
  nashEquilibriumValue: number;
  matchReason: string;
  matchedAt: string;
  radarData: RadarDataPoint[];
}

export interface TradeProposal {
  id: string;
  matchId: string;
  offeredCards: ProposalCard[];
  requestedCards: ProposalCard[];
  equityDelta: number;
  fairnessScore: number;
  status: 'proposed' | 'accepted' | 'countered' | 'declined';
  messages: TradeMessage[];
  createdAt: string;
  updatedAt: string;
  proposedBy: string;
}

export interface ProposalCard {
  id: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  condition: string;
  estimatedValue: number;
}

export interface TradeMessage {
  id: string;
  senderId: string;
  senderAlias: string;
  text: string;
  timestamp: string;
}

export interface CompatibilityScore {
  overall: number;
  sportOverlap: number;
  eraOverlap: number;
  setOverlap: number;
  needsFulfillment: number;
  tradingStyleFit: number;
  reliabilityScore: number;
}

export interface CollectionGap {
  id: string;
  description: string;
  sport: Sport;
  era: string;
  set: string;
  priority: 'high' | 'medium' | 'low';
  potentialFillers: string[];
  estimatedCost: number;
}

export interface CollectionOverlap {
  id: string;
  area: string;
  sport: Sport;
  overlapPercentage: number;
  sharedInterests: string[];
}

export interface MatchPreference {
  preferredSports: Sport[];
  preferredEras: string[];
  tradingStylePreference: ('aggressive' | 'fair' | 'conservative')[];
  minRating: number;
  maxDistanceMiles: number;
  dealBreakers: string[];
  autoMatch: boolean;
}

export interface TradeEquity {
  offeredTotal: number;
  requestedTotal: number;
  delta: number;
  fairnessScore: number;
  recommendation: 'great_deal' | 'fair' | 'slightly_uneven' | 'unfair';
  adjustmentSuggestion: string;
}

export interface NashEquilibrium {
  matchId: string;
  optimalOffered: ProposalCard[];
  optimalRequested: ProposalCard[];
  equilibriumValue: number;
  collector1Utility: number;
  collector2Utility: number;
  paretoOptimal: boolean;
  explanation: string;
  chartData: { name: string; collector1: number; collector2: number }[];
}

export interface MatchHistory {
  id: string;
  matchId: string;
  partnerAlias: string;
  partnerAvatar: string;
  tradeDate: string;
  offeredCount: number;
  receivedCount: number;
  equityDelta: number;
  rating: number;
  outcome: 'completed' | 'cancelled' | 'expired';
}

export interface CollectorNeed {
  id: string;
  description: string;
  sport: Sport;
  priority: 'high' | 'medium' | 'low';
  matchCount: number;
}

export interface CollectorSurplus {
  id: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  estimatedValue: number;
  quantity: number;
  interestedCollectors: number;
}

export interface MutualBenefit {
  matchId: string;
  collector1Gains: string[];
  collector2Gains: string[];
  combinedValue: number;
  synergyScore: number;
}

export interface MatchNotification {
  id: string;
  type: 'new_match' | 'proposal_received' | 'proposal_accepted' | 'proposal_declined' | 'counter_offer' | 'trade_completed' | 'rating_received';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedMatchId?: string;
  relatedProfileId?: string;
}

export interface RadarDataPoint {
  axis: string;
  collector1: number;
  collector2: number;
}

// ---- Mock Data ----

const AVATARS = ['🃏', '🏆', '⚾', '🏀', '🏈', '🎯', '💎', '🔥', '⭐', '🦅'];

const mockProfiles: CollectorProfile[] = [
  {
    id: 'me',
    alias: 'CardShark_42',
    avatar: '🃏',
    collectionFocus: { sports: ['Baseball', 'Basketball'], eras: ['1980s', '1990s', '2000s'], sets: ['Topps Chrome', 'Bowman 1st', 'Prizm'] },
    totalCards: 1247,
    totalValue: 84500,
    needsList: [
      { id: 'n1', player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', sport: 'Baseball', priority: 'high', maxBudget: 800 },
      { id: 'n2', player: 'Michael Jordan', year: 1986, set: 'Fleer', sport: 'Basketball', priority: 'high', maxBudget: 15000 },
      { id: 'n3', player: 'Derek Jeter', year: 1993, set: 'SP Foil', sport: 'Baseball', priority: 'medium', maxBudget: 2500 },
      { id: 'n4', player: 'Shaquille O\'Neal', year: 1992, set: 'Topps', sport: 'Basketball', priority: 'low', maxBudget: 150 },
    ],
    surplusList: [
      { id: 's1', player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'Baseball', condition: 'PSA 9', estimatedValue: 1200, quantity: 2 },
      { id: 's2', player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'Basketball', condition: 'BGS 9.5', estimatedValue: 4500, quantity: 1 },
      { id: 's3', player: 'Bryce Harper', year: 2012, set: 'Bowman Chrome', sport: 'Baseball', condition: 'PSA 10', estimatedValue: 350, quantity: 3 },
      { id: 's4', player: 'Luka Doncic', year: 2018, set: 'Prizm Silver', sport: 'Basketball', condition: 'PSA 10', estimatedValue: 2200, quantity: 1 },
    ],
    tradingStyle: 'fair',
    responseRate: 94,
    completedTrades: 37,
    rating: 4.8,
    joinedDate: '2022-03-15',
    lastActive: '2026-03-14',
    bio: 'Focused on 90s rookies and modern Chrome. Always looking for clean trades.',
    location: 'Chicago, IL',
  },
  {
    id: 'c1',
    alias: 'VintageVault',
    avatar: '🏆',
    collectionFocus: { sports: ['Baseball'], eras: ['1950s', '1960s', '1970s', '1980s'], sets: ['Topps', 'Bowman', 'Fleer'] },
    totalCards: 3420,
    totalValue: 215000,
    needsList: [
      { id: 'n5', player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'Baseball', priority: 'high', maxBudget: 1500 },
      { id: 'n6', player: 'Bryce Harper', year: 2012, set: 'Bowman Chrome', sport: 'Baseball', priority: 'medium', maxBudget: 400 },
    ],
    surplusList: [
      { id: 's5', player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', sport: 'Baseball', condition: 'PSA 8', estimatedValue: 450, quantity: 2 },
      { id: 's6', player: 'Nolan Ryan', year: 1968, set: 'Topps', sport: 'Baseball', condition: 'PSA 6', estimatedValue: 3200, quantity: 1 },
      { id: 's7', player: 'Hank Aaron', year: 1954, set: 'Topps', sport: 'Baseball', condition: 'PSA 4', estimatedValue: 8500, quantity: 1 },
    ],
    tradingStyle: 'conservative',
    responseRate: 87,
    completedTrades: 112,
    rating: 4.9,
    joinedDate: '2020-01-10',
    lastActive: '2026-03-13',
    bio: 'Vintage baseball only. 40+ years collecting. Quality over quantity.',
    location: 'Boston, MA',
  },
  {
    id: 'c2',
    alias: 'HoopsKing',
    avatar: '🏀',
    collectionFocus: { sports: ['Basketball'], eras: ['1980s', '1990s', '2000s', '2010s'], sets: ['Fleer', 'Prizm', 'Topps Chrome', 'National Treasures'] },
    totalCards: 892,
    totalValue: 132000,
    needsList: [
      { id: 'n7', player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'Basketball', priority: 'high', maxBudget: 5000 },
      { id: 'n8', player: 'Luka Doncic', year: 2018, set: 'Prizm Silver', sport: 'Basketball', priority: 'high', maxBudget: 2500 },
    ],
    surplusList: [
      { id: 's8', player: 'Michael Jordan', year: 1986, set: 'Fleer', sport: 'Basketball', condition: 'PSA 7', estimatedValue: 8500, quantity: 1 },
      { id: 's9', player: 'Shaquille O\'Neal', year: 1992, set: 'Topps', sport: 'Basketball', condition: 'PSA 9', estimatedValue: 120, quantity: 3 },
      { id: 's10', player: 'Kobe Bryant', year: 1996, set: 'Topps Chrome', sport: 'Basketball', condition: 'BGS 9', estimatedValue: 3800, quantity: 1 },
    ],
    tradingStyle: 'aggressive',
    responseRate: 78,
    completedTrades: 64,
    rating: 4.5,
    joinedDate: '2021-06-20',
    lastActive: '2026-03-14',
    bio: 'Basketball or bust. Jordan collector. Will trade big for the right card.',
    location: 'Los Angeles, CA',
  },
  {
    id: 'c3',
    alias: 'GridironGuru',
    avatar: '🏈',
    collectionFocus: { sports: ['Football'], eras: ['1990s', '2000s', '2010s', '2020s'], sets: ['Prizm', 'Optic', 'National Treasures', 'Mosaic'] },
    totalCards: 2105,
    totalValue: 96000,
    needsList: [
      { id: 'n9', player: 'Patrick Mahomes', year: 2017, set: 'Prizm', sport: 'Football', priority: 'high', maxBudget: 3000 },
    ],
    surplusList: [
      { id: 's11', player: 'Tom Brady', year: 2000, set: 'Bowman Chrome', sport: 'Football', condition: 'PSA 9', estimatedValue: 5500, quantity: 1 },
      { id: 's12', player: 'Derek Jeter', year: 1993, set: 'SP Foil', sport: 'Baseball', condition: 'PSA 8', estimatedValue: 1800, quantity: 1 },
    ],
    tradingStyle: 'fair',
    responseRate: 91,
    completedTrades: 48,
    rating: 4.7,
    joinedDate: '2021-09-01',
    lastActive: '2026-03-12',
    bio: 'NFL fanatic. Always chasing Mahomes and Burrow rookies.',
    location: 'Dallas, TX',
  },
  {
    id: 'c4',
    alias: 'RookieHunter',
    avatar: '🎯',
    collectionFocus: { sports: ['Baseball', 'Basketball', 'Football'], eras: ['2010s', '2020s'], sets: ['Bowman 1st', 'Prizm', 'Topps Chrome'] },
    totalCards: 4350,
    totalValue: 178000,
    needsList: [
      { id: 'n10', player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'Baseball', priority: 'medium', maxBudget: 1300 },
      { id: 'n11', player: 'Bryce Harper', year: 2012, set: 'Bowman Chrome', sport: 'Baseball', priority: 'low', maxBudget: 400 },
    ],
    surplusList: [
      { id: 's13', player: 'Wander Franco', year: 2019, set: 'Bowman 1st Chrome', sport: 'Baseball', condition: 'PSA 10', estimatedValue: 220, quantity: 5 },
      { id: 's14', player: 'Victor Wembanyama', year: 2023, set: 'Prizm', sport: 'Basketball', condition: 'PSA 10', estimatedValue: 850, quantity: 2 },
      { id: 's15', player: 'CJ Stroud', year: 2023, set: 'Prizm Silver', sport: 'Football', condition: 'PSA 10', estimatedValue: 320, quantity: 3 },
    ],
    tradingStyle: 'aggressive',
    responseRate: 82,
    completedTrades: 156,
    rating: 4.3,
    joinedDate: '2020-11-15',
    lastActive: '2026-03-14',
    bio: 'Volume trader. Modern rookies specialist. Quick deals preferred.',
    location: 'Atlanta, GA',
  },
  {
    id: 'c5',
    alias: 'DiamondDave',
    avatar: '💎',
    collectionFocus: { sports: ['Baseball'], eras: ['1980s', '1990s'], sets: ['Topps', 'Donruss', 'Score', 'Upper Deck'] },
    totalCards: 8900,
    totalValue: 42000,
    needsList: [
      { id: 'n12', player: 'Ken Griffey Jr.', year: 1989, set: 'Score Traded', sport: 'Baseball', priority: 'high', maxBudget: 100 },
    ],
    surplusList: [
      { id: 's16', player: 'Cal Ripken Jr.', year: 1982, set: 'Topps Traded', sport: 'Baseball', condition: 'PSA 8', estimatedValue: 900, quantity: 1 },
      { id: 's17', player: 'Frank Thomas', year: 1990, set: 'Topps', sport: 'Baseball', condition: 'PSA 10', estimatedValue: 450, quantity: 2 },
      { id: 's18', player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', sport: 'Baseball', condition: 'PSA 7', estimatedValue: 300, quantity: 1 },
    ],
    tradingStyle: 'conservative',
    responseRate: 95,
    completedTrades: 89,
    rating: 4.9,
    joinedDate: '2019-05-20',
    lastActive: '2026-03-10',
    bio: 'Junk wax era completionist. Every set, every card. Also chasing HOF rookies.',
    location: 'St. Louis, MO',
  },
  {
    id: 'c6',
    alias: 'FlameTrader',
    avatar: '🔥',
    collectionFocus: { sports: ['Basketball', 'Football'], eras: ['2000s', '2010s', '2020s'], sets: ['Prizm', 'Select', 'Optic', 'Mosaic'] },
    totalCards: 1560,
    totalValue: 205000,
    needsList: [
      { id: 'n13', player: 'Luka Doncic', year: 2018, set: 'Prizm Silver', sport: 'Basketball', priority: 'high', maxBudget: 2800 },
      { id: 'n14', player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'Basketball', priority: 'medium', maxBudget: 5000 },
    ],
    surplusList: [
      { id: 's19', player: 'Jayson Tatum', year: 2017, set: 'Prizm Silver', sport: 'Basketball', condition: 'PSA 10', estimatedValue: 1800, quantity: 2 },
      { id: 's20', player: 'Josh Allen', year: 2018, set: 'Prizm', sport: 'Football', condition: 'PSA 10', estimatedValue: 2400, quantity: 1 },
      { id: 's21', player: 'Ja Morant', year: 2019, set: 'Prizm Silver', sport: 'Basketball', condition: 'PSA 10', estimatedValue: 600, quantity: 3 },
    ],
    tradingStyle: 'aggressive',
    responseRate: 72,
    completedTrades: 93,
    rating: 4.2,
    joinedDate: '2021-01-05',
    lastActive: '2026-03-14',
    bio: 'High-value modern only. Not afraid to make big moves. Quick responses.',
    location: 'Miami, FL',
  },
  {
    id: 'c7',
    alias: 'StarCollector',
    avatar: '⭐',
    collectionFocus: { sports: ['Baseball', 'Basketball', 'Football', 'Hockey'], eras: ['1970s', '1980s', '1990s', '2000s'], sets: ['Topps', 'Upper Deck', 'Fleer', 'O-Pee-Chee'] },
    totalCards: 12400,
    totalValue: 310000,
    needsList: [
      { id: 'n15', player: 'Wayne Gretzky', year: 1979, set: 'O-Pee-Chee', sport: 'Hockey', priority: 'high', maxBudget: 20000 },
      { id: 'n16', player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'Baseball', priority: 'low', maxBudget: 1200 },
    ],
    surplusList: [
      { id: 's22', player: 'Derek Jeter', year: 1993, set: 'SP Foil', sport: 'Baseball', condition: 'PSA 9', estimatedValue: 3200, quantity: 1 },
      { id: 's23', player: 'Michael Jordan', year: 1986, set: 'Fleer', sport: 'Basketball', condition: 'PSA 6', estimatedValue: 5500, quantity: 1 },
      { id: 's24', player: 'Mario Lemieux', year: 1985, set: 'Topps', sport: 'Hockey', condition: 'PSA 8', estimatedValue: 1200, quantity: 1 },
    ],
    tradingStyle: 'fair',
    responseRate: 88,
    completedTrades: 204,
    rating: 4.8,
    joinedDate: '2018-08-12',
    lastActive: '2026-03-13',
    bio: 'Multi-sport veteran. 30+ years collecting across all major sports. Fair trades only.',
    location: 'Toronto, ON',
  },
  {
    id: 'c8',
    alias: 'EagleEye',
    avatar: '🦅',
    collectionFocus: { sports: ['Baseball', 'Football'], eras: ['1990s', '2000s', '2010s'], sets: ['Topps Chrome', 'Bowman Chrome', 'Prizm'] },
    totalCards: 2780,
    totalValue: 127000,
    needsList: [
      { id: 'n17', player: 'Bryce Harper', year: 2012, set: 'Bowman Chrome', sport: 'Baseball', priority: 'high', maxBudget: 500 },
      { id: 'n18', player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'Basketball', priority: 'medium', maxBudget: 4800 },
    ],
    surplusList: [
      { id: 's25', player: 'Shaquille O\'Neal', year: 1992, set: 'Topps', sport: 'Basketball', condition: 'PSA 10', estimatedValue: 180, quantity: 2 },
      { id: 's26', player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', sport: 'Baseball', condition: 'PSA 9', estimatedValue: 650, quantity: 1 },
      { id: 's27', player: 'Peyton Manning', year: 1998, set: 'Topps Chrome', sport: 'Football', condition: 'PSA 9', estimatedValue: 1100, quantity: 1 },
    ],
    tradingStyle: 'fair',
    responseRate: 90,
    completedTrades: 71,
    rating: 4.6,
    joinedDate: '2021-04-08',
    lastActive: '2026-03-11',
    bio: 'Chrome enthusiast. Always grading. Looking for raw deals to flip graded.',
    location: 'Phoenix, AZ',
  },
];

function buildRadarData(c1: CollectorProfile, c2: CollectorProfile): RadarDataPoint[] {
  const sportOverlap = c1.collectionFocus.sports.filter(s => c2.collectionFocus.sports.includes(s)).length / Math.max(c1.collectionFocus.sports.length, c2.collectionFocus.sports.length) * 100;
  const eraOverlap = c1.collectionFocus.eras.filter(e => c2.collectionFocus.eras.includes(e)).length / Math.max(c1.collectionFocus.eras.length, c2.collectionFocus.eras.length) * 100;
  const setOverlap = c1.collectionFocus.sets.filter(s => c2.collectionFocus.sets.includes(s)).length / Math.max(c1.collectionFocus.sets.length, c2.collectionFocus.sets.length) * 100;
  const needsFulfill = c2.surplusList.filter(s => c1.needsList.some(n => n.player === s.player && n.set === s.set)).length / Math.max(c1.needsList.length, 1) * 100;
  const reverseNeedsFulfill = c1.surplusList.filter(s => c2.needsList.some(n => n.player === s.player && n.set === s.set)).length / Math.max(c2.needsList.length, 1) * 100;
  const reliability = (c2.responseRate + c2.rating * 20) / 2;

  return [
    { axis: 'Sport Match', collector1: Math.min(sportOverlap, 100), collector2: Math.min(sportOverlap, 100) },
    { axis: 'Era Match', collector1: Math.min(eraOverlap, 100), collector2: Math.min(eraOverlap, 100) },
    { axis: 'Set Overlap', collector1: Math.min(setOverlap, 100), collector2: Math.min(setOverlap, 100) },
    { axis: 'Needs Filled', collector1: Math.min(needsFulfill, 100), collector2: Math.min(reverseNeedsFulfill, 100) },
    { axis: 'Trade Value', collector1: Math.min(c1.totalValue / 3000, 100), collector2: Math.min(c2.totalValue / 3000, 100) },
    { axis: 'Reliability', collector1: (c1.responseRate + c1.rating * 20) / 2, collector2: reliability },
  ];
}

function computeCompatibility(me: CollectorProfile, other: CollectorProfile): number {
  let score = 0;
  // Sport overlap
  const sportMatch = me.collectionFocus.sports.filter(s => other.collectionFocus.sports.includes(s)).length;
  score += sportMatch * 10;
  // Needs fulfillment (they have what I need)
  const theyFillMyNeeds = other.surplusList.filter(s => me.needsList.some(n => n.player === s.player && n.set === s.set)).length;
  score += theyFillMyNeeds * 15;
  // I fill their needs
  const iFillTheirNeeds = me.surplusList.filter(s => other.needsList.some(n => n.player === s.player && n.set === s.set)).length;
  score += iFillTheirNeeds * 15;
  // Rating bonus
  score += other.rating * 4;
  // Response rate
  score += other.responseRate * 0.1;
  return Math.min(Math.round(score), 100);
}

function buildGaps(me: CollectorProfile, other: CollectorProfile): CollectionGap[] {
  const gaps: CollectionGap[] = [];
  me.needsList.forEach(need => {
    const filler = other.surplusList.find(s => s.player === need.player && s.set === need.set);
    if (filler) {
      gaps.push({
        id: `gap-${need.id}`,
        description: `${need.year} ${need.player} ${need.set}`,
        sport: need.sport,
        era: `${need.year}s`,
        set: need.set,
        priority: need.priority,
        potentialFillers: [other.alias],
        estimatedCost: filler.estimatedValue,
      });
    }
  });
  return gaps;
}

function buildOverlaps(me: CollectorProfile, other: CollectorProfile): CollectionOverlap[] {
  const overlaps: CollectionOverlap[] = [];
  const sharedSports = me.collectionFocus.sports.filter(s => other.collectionFocus.sports.includes(s));
  sharedSports.forEach((sport, i) => {
    const sharedEras = me.collectionFocus.eras.filter(e => other.collectionFocus.eras.includes(e));
    const sharedSets = me.collectionFocus.sets.filter(s => other.collectionFocus.sets.includes(s));
    overlaps.push({
      id: `overlap-${i}`,
      area: `${sport} Cards`,
      sport,
      overlapPercentage: Math.round((sharedEras.length + sharedSets.length) / (me.collectionFocus.eras.length + me.collectionFocus.sets.length) * 100),
      sharedInterests: [...sharedEras.map(e => `${e} era`), ...sharedSets],
    });
  });
  return overlaps;
}

const me = mockProfiles[0];

const mockMatchResults: MatchResult[] = mockProfiles.slice(1).map((other, idx) => {
  const compat = computeCompatibility(me, other);
  const gaps = buildGaps(me, other);
  const overlaps = buildOverlaps(me, other);
  const mutualBenefit = Math.round(compat * 0.8 + gaps.length * 10);

  const reasons = [];
  const theyHave = other.surplusList.filter(s => me.needsList.some(n => n.player === s.player));
  const iHave = me.surplusList.filter(s => other.needsList.some(n => n.player === s.player));
  if (theyHave.length > 0) reasons.push(`Has ${theyHave.map(c => c.player).join(', ')} you need`);
  if (iHave.length > 0) reasons.push(`Wants ${iHave.map(c => c.player).join(', ')} you have`);
  if (reasons.length === 0) reasons.push(`Strong ${other.collectionFocus.sports.join('/')} overlap`);

  return {
    matchId: `match-${idx + 1}`,
    collector1: me,
    collector2: other,
    compatibilityScore: compat,
    mutualBenefitScore: Math.min(mutualBenefit, 100),
    tradeProposals: [],
    gaps,
    overlaps,
    nashEquilibriumValue: Math.round(compat * 0.9 + Math.random() * 10),
    matchReason: reasons.join('. '),
    matchedAt: new Date(Date.now() - idx * 86400000 * 2).toISOString(),
    radarData: buildRadarData(me, other),
  };
}).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

const mockTradeProposals: TradeProposal[] = [
  {
    id: 'tp-1',
    matchId: 'match-1',
    offeredCards: [
      { id: 's1', player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'Baseball', condition: 'PSA 9', estimatedValue: 1200 },
    ],
    requestedCards: [
      { id: 's5', player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', sport: 'Baseball', condition: 'PSA 8', estimatedValue: 450 },
      { id: 's17', player: 'Frank Thomas', year: 1990, set: 'Topps', sport: 'Baseball', condition: 'PSA 10', estimatedValue: 450 },
    ],
    equityDelta: 300,
    fairnessScore: 72,
    status: 'proposed',
    messages: [
      { id: 'm1', senderId: 'me', senderAlias: 'CardShark_42', text: 'Would love to swap my Trout for your Griffey + Thomas. Lmk!', timestamp: '2026-03-13T14:30:00Z' },
    ],
    createdAt: '2026-03-13T14:30:00Z',
    updatedAt: '2026-03-13T14:30:00Z',
    proposedBy: 'me',
  },
  {
    id: 'tp-2',
    matchId: 'match-2',
    offeredCards: [
      { id: 's2', player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'Basketball', condition: 'BGS 9.5', estimatedValue: 4500 },
    ],
    requestedCards: [
      { id: 's8', player: 'Michael Jordan', year: 1986, set: 'Fleer', sport: 'Basketball', condition: 'PSA 7', estimatedValue: 8500 },
    ],
    equityDelta: -4000,
    fairnessScore: 38,
    status: 'countered',
    messages: [
      { id: 'm2', senderId: 'me', senderAlias: 'CardShark_42', text: 'LeBron Chrome for your Jordan Fleer?', timestamp: '2026-03-11T10:00:00Z' },
      { id: 'm3', senderId: 'c2', senderAlias: 'HoopsKing', text: 'Need more value on your side. Can you add the Doncic Prizm?', timestamp: '2026-03-11T18:45:00Z' },
    ],
    createdAt: '2026-03-11T10:00:00Z',
    updatedAt: '2026-03-11T18:45:00Z',
    proposedBy: 'me',
  },
  {
    id: 'tp-3',
    matchId: 'match-7',
    offeredCards: [],
    requestedCards: [
      { id: 's22', player: 'Derek Jeter', year: 1993, set: 'SP Foil', sport: 'Baseball', condition: 'PSA 9', estimatedValue: 3200 },
    ],
    equityDelta: -3200,
    fairnessScore: 0,
    status: 'proposed',
    messages: [
      { id: 'm4', senderId: 'c7', senderAlias: 'StarCollector', text: 'I see you need the Jeter SP. Interested in your Trout Update or LeBron Chrome. Open to discuss!', timestamp: '2026-03-14T09:15:00Z' },
    ],
    createdAt: '2026-03-14T09:15:00Z',
    updatedAt: '2026-03-14T09:15:00Z',
    proposedBy: 'c7',
  },
  {
    id: 'tp-4',
    matchId: 'match-4',
    offeredCards: [
      { id: 's3', player: 'Bryce Harper', year: 2012, set: 'Bowman Chrome', sport: 'Baseball', condition: 'PSA 10', estimatedValue: 350 },
    ],
    requestedCards: [
      { id: 's13', player: 'Wander Franco', year: 2019, set: 'Bowman 1st Chrome', sport: 'Baseball', condition: 'PSA 10', estimatedValue: 220 },
      { id: 's15', player: 'CJ Stroud', year: 2023, set: 'Prizm Silver', sport: 'Football', condition: 'PSA 10', estimatedValue: 320 },
    ],
    equityDelta: -190,
    fairnessScore: 65,
    status: 'accepted',
    messages: [
      { id: 'm5', senderId: 'me', senderAlias: 'CardShark_42', text: 'Harper Chrome 10 for your Franco + Stroud?', timestamp: '2026-03-08T12:00:00Z' },
      { id: 'm6', senderId: 'c4', senderAlias: 'RookieHunter', text: 'Deal! Sending tomorrow.', timestamp: '2026-03-08T13:30:00Z' },
    ],
    createdAt: '2026-03-08T12:00:00Z',
    updatedAt: '2026-03-08T13:30:00Z',
    proposedBy: 'me',
  },
];

const mockMatchHistory: MatchHistory[] = [
  { id: 'mh-1', matchId: 'match-4', partnerAlias: 'RookieHunter', partnerAvatar: '🎯', tradeDate: '2026-03-09', offeredCount: 1, receivedCount: 2, equityDelta: -190, rating: 5, outcome: 'completed' },
  { id: 'mh-2', matchId: 'match-5', partnerAlias: 'DiamondDave', partnerAvatar: '💎', tradeDate: '2026-02-20', offeredCount: 2, receivedCount: 1, equityDelta: 120, rating: 5, outcome: 'completed' },
  { id: 'mh-3', matchId: 'match-1', partnerAlias: 'VintageVault', partnerAvatar: '🏆', tradeDate: '2026-02-05', offeredCount: 3, receivedCount: 2, equityDelta: -50, rating: 4, outcome: 'completed' },
  { id: 'mh-4', matchId: 'match-6', partnerAlias: 'FlameTrader', partnerAvatar: '🔥', tradeDate: '2026-01-15', offeredCount: 1, receivedCount: 1, equityDelta: 200, rating: 3, outcome: 'completed' },
  { id: 'mh-5', matchId: 'match-3', partnerAlias: 'GridironGuru', partnerAvatar: '🏈', tradeDate: '2025-12-28', offeredCount: 2, receivedCount: 3, equityDelta: -340, rating: 4, outcome: 'cancelled' },
];

const mockNotifications: MatchNotification[] = [
  { id: 'notif-1', type: 'new_match', title: 'New Match Found!', message: 'StarCollector is a 91% match — they have the Jeter SP you need!', timestamp: '2026-03-14T09:00:00Z', read: false, relatedMatchId: 'match-7' },
  { id: 'notif-2', type: 'proposal_received', title: 'Trade Proposal', message: 'StarCollector wants to trade for your Trout or LeBron.', timestamp: '2026-03-14T09:15:00Z', read: false, relatedMatchId: 'match-7' },
  { id: 'notif-3', type: 'counter_offer', title: 'Counter Offer', message: 'HoopsKing countered your proposal — wants the Doncic added.', timestamp: '2026-03-11T18:45:00Z', read: true, relatedMatchId: 'match-2' },
  { id: 'notif-4', type: 'trade_completed', title: 'Trade Complete!', message: 'Your trade with RookieHunter is done. Rate the experience!', timestamp: '2026-03-09T16:00:00Z', read: true, relatedMatchId: 'match-4' },
  { id: 'notif-5', type: 'rating_received', title: 'New Rating', message: 'RookieHunter rated you 5 stars. Your rating is now 4.8!', timestamp: '2026-03-10T08:00:00Z', read: true },
  { id: 'notif-6', type: 'new_match', title: 'New Match Found!', message: 'EagleEye is an 82% match with overlapping Chrome interests.', timestamp: '2026-03-12T11:00:00Z', read: true, relatedMatchId: 'match-8' },
];

const mockPreferences: MatchPreference = {
  preferredSports: ['Baseball', 'Basketball'],
  preferredEras: ['1980s', '1990s', '2000s'],
  tradingStylePreference: ['fair', 'conservative'],
  minRating: 4.0,
  maxDistanceMiles: 500,
  dealBreakers: ['Low response rate (<70%)', 'No completed trades'],
  autoMatch: true,
};

// ---- Service Functions ----

export function findMatches(): MatchResult[] {
  return mockMatchResults;
}

export function getMatchDetails(matchId: string): MatchResult | undefined {
  return mockMatchResults.find(m => m.matchId === matchId);
}

export function createTradeProposal(matchId: string, offered: string[], requested: string[]): TradeProposal {
  const offeredCards: ProposalCard[] = offered.map(id => {
    const card = me.surplusList.find(s => s.id === id);
    return card ? { id: card.id, player: card.player, year: card.year, set: card.set, sport: card.sport, condition: card.condition, estimatedValue: card.estimatedValue } : { id, player: 'Unknown', year: 0, set: '', sport: 'Baseball' as Sport, condition: 'Raw', estimatedValue: 0 };
  });
  const requestedCards: ProposalCard[] = requested.map(id => {
    const match = mockMatchResults.find(m => m.matchId === matchId);
    const card = match?.collector2.surplusList.find(s => s.id === id);
    return card ? { id: card.id, player: card.player, year: card.year, set: card.set, sport: card.sport, condition: card.condition, estimatedValue: card.estimatedValue } : { id, player: 'Unknown', year: 0, set: '', sport: 'Baseball' as Sport, condition: 'Raw', estimatedValue: 0 };
  });
  const offeredTotal = offeredCards.reduce((sum, c) => sum + c.estimatedValue, 0);
  const requestedTotal = requestedCards.reduce((sum, c) => sum + c.estimatedValue, 0);
  const delta = offeredTotal - requestedTotal;
  const fairness = Math.max(0, 100 - Math.abs(delta) / Math.max(offeredTotal, requestedTotal, 1) * 100);

  return {
    id: `tp-new-${Date.now()}`,
    matchId,
    offeredCards,
    requestedCards,
    equityDelta: delta,
    fairnessScore: Math.round(fairness),
    status: 'proposed',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    proposedBy: 'me',
  };
}

export function evaluateTradeEquity(proposal: TradeProposal): TradeEquity {
  const offeredTotal = proposal.offeredCards.reduce((sum, c) => sum + c.estimatedValue, 0);
  const requestedTotal = proposal.requestedCards.reduce((sum, c) => sum + c.estimatedValue, 0);
  const delta = offeredTotal - requestedTotal;
  const ratio = Math.abs(delta) / Math.max(offeredTotal, requestedTotal, 1);

  let recommendation: TradeEquity['recommendation'];
  let adjustmentSuggestion: string;

  if (ratio < 0.05) {
    recommendation = 'great_deal';
    adjustmentSuggestion = 'This trade is nearly perfectly balanced.';
  } else if (ratio < 0.15) {
    recommendation = 'fair';
    adjustmentSuggestion = 'Slightly off but within acceptable range.';
  } else if (ratio < 0.35) {
    recommendation = 'slightly_uneven';
    adjustmentSuggestion = delta > 0 ? 'Consider requesting an additional card to balance.' : 'Consider adding a small card to even things out.';
  } else {
    recommendation = 'unfair';
    adjustmentSuggestion = delta > 0 ? `You're overpaying by ~$${Math.abs(delta)}. Remove a card or request more.` : `You're underpaying by ~$${Math.abs(delta)}. Add more to your offer.`;
  }

  return {
    offeredTotal,
    requestedTotal,
    delta,
    fairnessScore: Math.round(Math.max(0, 100 - ratio * 100)),
    recommendation,
    adjustmentSuggestion,
  };
}

export function getCollectorProfile(id: string): CollectorProfile | undefined {
  return mockProfiles.find(p => p.id === id);
}

export function getMyProfile(): CollectorProfile {
  return me;
}

export function getCollectionGaps(): CollectionGap[] {
  const gaps: CollectionGap[] = [];
  me.needsList.forEach(need => {
    const fillers = mockProfiles.filter(p => p.id !== 'me' && p.surplusList.some(s => s.player === need.player && s.set === need.set));
    gaps.push({
      id: `gap-${need.id}`,
      description: `${need.year} ${need.player} ${need.set}`,
      sport: need.sport,
      era: `${Math.floor(need.year / 10) * 10}s`,
      set: need.set,
      priority: need.priority,
      potentialFillers: fillers.map(f => f.alias),
      estimatedCost: need.maxBudget,
    });
  });
  return gaps;
}

export function getCollectionSurplus(): CollectorSurplus[] {
  return me.surplusList.map(s => {
    const interested = mockProfiles.filter(p => p.id !== 'me' && p.needsList.some(n => n.player === s.player));
    return {
      id: s.id,
      player: s.player,
      year: s.year,
      set: s.set,
      sport: s.sport,
      estimatedValue: s.estimatedValue,
      quantity: s.quantity,
      interestedCollectors: interested.length,
    };
  });
}

export function getMatchHistory(): MatchHistory[] {
  return mockMatchHistory;
}

export function getNashEquilibrium(matchId: string): NashEquilibrium {
  const match = mockMatchResults.find(m => m.matchId === matchId);
  if (!match) {
    return {
      matchId,
      optimalOffered: [],
      optimalRequested: [],
      equilibriumValue: 0,
      collector1Utility: 0,
      collector2Utility: 0,
      paretoOptimal: false,
      explanation: 'Match not found.',
      chartData: [],
    };
  }

  const c1 = match.collector1;
  const c2 = match.collector2;

  // Find mutually beneficial cards
  const optOffered = c1.surplusList
    .filter(s => c2.needsList.some(n => n.player === s.player))
    .map(s => ({ id: s.id, player: s.player, year: s.year, set: s.set, sport: s.sport, condition: s.condition, estimatedValue: s.estimatedValue }));

  const optRequested = c2.surplusList
    .filter(s => c1.needsList.some(n => n.player === s.player))
    .map(s => ({ id: s.id, player: s.player, year: s.year, set: s.set, sport: s.sport, condition: s.condition, estimatedValue: s.estimatedValue }));

  const offeredVal = optOffered.reduce((sum, c) => sum + c.estimatedValue, 0);
  const requestedVal = optRequested.reduce((sum, c) => sum + c.estimatedValue, 0);
  const equilibrium = (offeredVal + requestedVal) / 2;

  return {
    matchId,
    optimalOffered: optOffered,
    optimalRequested: optRequested,
    equilibriumValue: Math.round(equilibrium),
    collector1Utility: Math.round(requestedVal * 0.85),
    collector2Utility: Math.round(offeredVal * 0.85),
    paretoOptimal: Math.abs(offeredVal - requestedVal) / Math.max(offeredVal, requestedVal, 1) < 0.3,
    explanation: optOffered.length > 0 && optRequested.length > 0
      ? `Optimal trade: You send ${optOffered.map(c => c.player).join(' + ')} and receive ${optRequested.map(c => c.player).join(' + ')}. Both sides gain cards they actively need.`
      : 'No direct need overlap found. Consider expanding to related cards.',
    chartData: [
      { name: 'Your Offer', collector1: offeredVal, collector2: 0 },
      { name: 'Their Offer', collector1: 0, collector2: requestedVal },
      { name: 'Your Utility', collector1: Math.round(requestedVal * 0.85), collector2: 0 },
      { name: 'Their Utility', collector1: 0, collector2: Math.round(offeredVal * 0.85) },
      { name: 'Equilibrium', collector1: Math.round(equilibrium), collector2: Math.round(equilibrium) },
    ],
  };
}

export function getMatchPreferences(): MatchPreference {
  return { ...mockPreferences };
}

export function updatePreferences(prefs: Partial<MatchPreference>): void {
  Object.assign(mockPreferences, prefs);
}

export function getTradeProposals(): TradeProposal[] {
  return mockTradeProposals;
}

export function getMatchNotifications(): MatchNotification[] {
  return mockNotifications;
}

export function getLeaderboard(): { profile: CollectorProfile; score: number }[] {
  return mockProfiles
    .filter(p => p.id !== 'me')
    .map(p => ({ profile: p, score: Math.round(p.rating * 20 + p.completedTrades * 0.3 + p.responseRate * 0.2) }))
    .sort((a, b) => b.score - a.score);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}
