// Swap Meet & Trade Night Engine Service
// Scheduled virtual trade events with auto-matching, live deal rooms, and post-event analytics

// ── Types ───────────────────────────────────────────────────────────────────────

export type EventStatus = 'scheduled' | 'registration' | 'matching' | 'live' | 'closing' | 'completed';
export type MatchQuality = 'perfect' | 'strong' | 'moderate' | 'weak';
export type DealStatus = 'proposed' | 'negotiating' | 'accepted' | 'declined' | 'completed';

// ── Interfaces ──────────────────────────────────────────────────────────────────

export interface TradeMatch {
  id: string;
  memberA: string;
  memberB: string;
  matchQuality: MatchQuality;
  memberAOffers: string[];
  memberBOffers: string[];
  estimatedValueDiff: number;
  matchReason: string;
}

export interface LiveDeal {
  id: string;
  proposer: string;
  responder: string;
  offeredCards: string[];
  requestedCards: string[];
  cashDiff: number | null;
  status: DealStatus;
  timestamp: string;
  completedAt: string | null;
}

export interface EventParticipant {
  userId: string;
  handle: string;
  itemsListed: number;
  matchesFound: number;
  dealsCompleted: number;
  totalTradeValue: number;
  rating: number;
  wantList: string[];
  haveList: string[];
}

export interface SwapMeetEvent {
  id: string;
  name: string;
  theme: string;
  status: EventStatus;
  hostHandle: string;
  scheduledDate: string;
  duration: number;
  registeredCount: number;
  maxParticipants: number;
  participants: EventParticipant[];
  matches: TradeMatch[];
  liveDeals: LiveDeal[];
  totalTradeVolume: number;
  dealCompletionRate: number;
  avgDealValue: number;
  nextEvent: string | null;
}

export interface SwapMeetStats {
  eventsHosted: number;
  totalParticipants: number;
  totalDealsCompleted: number;
  totalTradeVolume: number;
  avgMatchRate: number;
  avgDealCompletionRate: number;
  bestEventVolume: number;
  upcomingEvents: number;
}

// ── Data ────────────────────────────────────────────────────────────────────────

const fridayNightParticipants: EventParticipant[] = [
  {
    userId: 'usr-401',
    handle: 'CardKingMike',
    itemsListed: 18,
    matchesFound: 5,
    dealsCompleted: 3,
    totalTradeValue: 4250,
    rating: 4.9,
    wantList: ['2020 Prizm Joe Burrow RC', '2018 Optic Luka Doncic RC', '2021 Bowman Wander Franco'],
    haveList: ['2019 Prizm Zion Williamson RC', '2022 Topps Julio Rodriguez RC', '2017 Donruss Patrick Mahomes RC'],
  },
  {
    userId: 'usr-402',
    handle: 'VintageVault99',
    itemsListed: 12,
    matchesFound: 4,
    dealsCompleted: 2,
    totalTradeValue: 3100,
    rating: 4.7,
    wantList: ['2019 Prizm Zion Williamson RC', '2021 Topps Chrome Kyle Trout', '1986 Fleer Michael Jordan'],
    haveList: ['2020 Prizm Joe Burrow RC', '2022 Panini Chet Holmgren RC', '2018 Topps Update Ohtani RC'],
  },
  {
    userId: 'usr-403',
    handle: 'SlabQueen',
    itemsListed: 24,
    matchesFound: 6,
    dealsCompleted: 4,
    totalTradeValue: 6800,
    rating: 4.95,
    wantList: ['2022 Topps Julio Rodriguez RC', '2020 Select Justin Herbert RC', '2023 Bowman Elly De La Cruz'],
    haveList: ['2018 Optic Luka Doncic RC', '2021 Bowman Wander Franco', '2020 Mosaic Tua Tagovailoa RC'],
  },
  {
    userId: 'usr-404',
    handle: 'GrailHunterX',
    itemsListed: 15,
    matchesFound: 3,
    dealsCompleted: 2,
    totalTradeValue: 5200,
    rating: 4.8,
    wantList: ['2017 Donruss Patrick Mahomes RC', '2003 Topps Chrome LeBron James RC', '2011 Topps Update Mike Trout RC'],
    haveList: ['2020 Select Justin Herbert RC', '2023 Bowman Elly De La Cruz', '2019 Topps Chrome Vlad Guerrero Jr RC'],
  },
  {
    userId: 'usr-405',
    handle: 'PackRipperJoe',
    itemsListed: 9,
    matchesFound: 2,
    dealsCompleted: 1,
    totalTradeValue: 1450,
    rating: 4.5,
    wantList: ['2022 Panini Chet Holmgren RC', '2020 Mosaic Tua Tagovailoa RC', '2019 Topps Chrome Vlad Guerrero Jr RC'],
    haveList: ['2021 Topps Chrome Kyle Trout', '2020 Donruss Optic Tyrese Maxey RC', '2023 Topps Chrome Corbin Carroll RC'],
  },
];

const fridayNightMatches: TradeMatch[] = [
  {
    id: 'match-001',
    memberA: 'CardKingMike',
    memberB: 'VintageVault99',
    matchQuality: 'perfect',
    memberAOffers: ['2019 Prizm Zion Williamson RC'],
    memberBOffers: ['2020 Prizm Joe Burrow RC'],
    estimatedValueDiff: 15,
    matchReason: 'Both have the exact card the other wants — mutual want/have list overlap on top-tier rookies',
  },
  {
    id: 'match-002',
    memberA: 'SlabQueen',
    memberB: 'CardKingMike',
    matchQuality: 'strong',
    memberAOffers: ['2018 Optic Luka Doncic RC', '2021 Bowman Wander Franco'],
    memberBOffers: ['2022 Topps Julio Rodriguez RC'],
    estimatedValueDiff: 45,
    matchReason: 'SlabQueen wants JRod RC, CardKingMike wants both Luka and Franco — 2-for-1 swap balances value',
  },
  {
    id: 'match-003',
    memberA: 'GrailHunterX',
    memberB: 'CardKingMike',
    matchQuality: 'strong',
    memberAOffers: ['2020 Select Justin Herbert RC'],
    memberBOffers: ['2017 Donruss Patrick Mahomes RC'],
    estimatedValueDiff: 80,
    matchReason: 'GrailHunterX seeking Mahomes RC, CardKingMike has it — small cash balancer needed',
  },
  {
    id: 'match-004',
    memberA: 'PackRipperJoe',
    memberB: 'VintageVault99',
    matchQuality: 'moderate',
    memberAOffers: ['2021 Topps Chrome Kyle Trout'],
    memberBOffers: ['2022 Panini Chet Holmgren RC'],
    estimatedValueDiff: 120,
    matchReason: 'Partial want list overlap — PackRipperJoe wants Chet, VintageVault wants Chrome Trout variant',
  },
  {
    id: 'match-005',
    memberA: 'SlabQueen',
    memberB: 'GrailHunterX',
    matchQuality: 'moderate',
    memberAOffers: ['2020 Mosaic Tua Tagovailoa RC'],
    memberBOffers: ['2023 Bowman Elly De La Cruz'],
    estimatedValueDiff: 60,
    matchReason: 'Cross-sport trade — SlabQueen wants Elly, GrailHunterX is offloading baseball for football focus',
  },
];

const fridayNightDeals: LiveDeal[] = [
  {
    id: 'deal-001',
    proposer: 'CardKingMike',
    responder: 'VintageVault99',
    offeredCards: ['2019 Prizm Zion Williamson RC'],
    requestedCards: ['2020 Prizm Joe Burrow RC'],
    cashDiff: null,
    status: 'completed',
    timestamp: '2026-03-13T20:12:00Z',
    completedAt: '2026-03-13T20:18:30Z',
  },
  {
    id: 'deal-002',
    proposer: 'SlabQueen',
    responder: 'CardKingMike',
    offeredCards: ['2018 Optic Luka Doncic RC', '2021 Bowman Wander Franco'],
    requestedCards: ['2022 Topps Julio Rodriguez RC'],
    cashDiff: 45,
    status: 'completed',
    timestamp: '2026-03-13T20:25:00Z',
    completedAt: '2026-03-13T20:34:15Z',
  },
  {
    id: 'deal-003',
    proposer: 'GrailHunterX',
    responder: 'CardKingMike',
    offeredCards: ['2020 Select Justin Herbert RC'],
    requestedCards: ['2017 Donruss Patrick Mahomes RC'],
    cashDiff: 80,
    status: 'negotiating',
    timestamp: '2026-03-13T20:40:00Z',
    completedAt: null,
  },
  {
    id: 'deal-004',
    proposer: 'PackRipperJoe',
    responder: 'VintageVault99',
    offeredCards: ['2021 Topps Chrome Kyle Trout'],
    requestedCards: ['2022 Panini Chet Holmgren RC'],
    cashDiff: 120,
    status: 'proposed',
    timestamp: '2026-03-13T20:52:00Z',
    completedAt: null,
  },
  {
    id: 'deal-005',
    proposer: 'SlabQueen',
    responder: 'GrailHunterX',
    offeredCards: ['2020 Mosaic Tua Tagovailoa RC'],
    requestedCards: ['2023 Bowman Elly De La Cruz'],
    cashDiff: 60,
    status: 'negotiating',
    timestamp: '2026-03-13T21:01:00Z',
    completedAt: null,
  },
  {
    id: 'deal-006',
    proposer: 'VintageVault99',
    responder: 'SlabQueen',
    offeredCards: ['2018 Topps Update Ohtani RC'],
    requestedCards: ['2020 Mosaic Tua Tagovailoa RC'],
    cashDiff: null,
    status: 'declined',
    timestamp: '2026-03-13T21:10:00Z',
    completedAt: null,
  },
];

const vintageSwapParticipants: EventParticipant[] = [
  {
    userId: 'usr-501',
    handle: 'RetroCardKing',
    itemsListed: 22,
    matchesFound: 0,
    dealsCompleted: 0,
    totalTradeValue: 0,
    rating: 4.85,
    wantList: ['1952 Topps Mickey Mantle', '1969 Topps Reggie Jackson RC', '1955 Topps Roberto Clemente RC'],
    haveList: ['1956 Topps Mickey Mantle', '1963 Topps Pete Rose RC', '1971 Topps Nolan Ryan'],
  },
  {
    userId: 'usr-502',
    handle: 'PreWarCollector',
    itemsListed: 8,
    matchesFound: 0,
    dealsCompleted: 0,
    totalTradeValue: 0,
    rating: 4.92,
    wantList: ['1933 Goudey Babe Ruth', '1941 Play Ball Ted Williams', '1963 Topps Pete Rose RC'],
    haveList: ['1952 Topps Mickey Mantle (trimmed)', '1969 Topps Reggie Jackson RC', '1948 Leaf Jackie Robinson'],
  },
  {
    userId: 'usr-503',
    handle: 'WaxPackWendy',
    itemsListed: 16,
    matchesFound: 0,
    dealsCompleted: 0,
    totalTradeValue: 0,
    rating: 4.78,
    wantList: ['1971 Topps Nolan Ryan', '1975 Topps George Brett RC', '1980 Topps Rickey Henderson RC'],
    haveList: ['1955 Topps Roberto Clemente RC', '1968 Topps Nolan Ryan RC', '1973 Topps Mike Schmidt RC'],
  },
  {
    userId: 'usr-504',
    handle: 'HallOfFameHank',
    itemsListed: 14,
    matchesFound: 0,
    dealsCompleted: 0,
    totalTradeValue: 0,
    rating: 4.88,
    wantList: ['1968 Topps Nolan Ryan RC', '1956 Topps Mickey Mantle', '1948 Leaf Jackie Robinson'],
    haveList: ['1975 Topps George Brett RC', '1969 Topps Reggie Jackson RC', '1980 Topps Rickey Henderson RC'],
  },
];

const vintageSwapMatches: TradeMatch[] = [
  {
    id: 'match-v01',
    memberA: 'RetroCardKing',
    memberB: 'PreWarCollector',
    matchQuality: 'perfect',
    memberAOffers: ['1963 Topps Pete Rose RC'],
    memberBOffers: ['1969 Topps Reggie Jackson RC'],
    estimatedValueDiff: 200,
    matchReason: 'Direct want/have overlap — both seeking each other\'s vintage rookies',
  },
  {
    id: 'match-v02',
    memberA: 'WaxPackWendy',
    memberB: 'RetroCardKing',
    matchQuality: 'strong',
    memberAOffers: ['1955 Topps Roberto Clemente RC'],
    memberBOffers: ['1971 Topps Nolan Ryan'],
    estimatedValueDiff: 350,
    matchReason: 'Wendy wants the Ryan, RetroCardKing wants the Clemente — era-appropriate swap',
  },
  {
    id: 'match-v03',
    memberA: 'HallOfFameHank',
    memberB: 'WaxPackWendy',
    matchQuality: 'strong',
    memberAOffers: ['1975 Topps George Brett RC', '1980 Topps Rickey Henderson RC'],
    memberBOffers: ['1968 Topps Nolan Ryan RC'],
    estimatedValueDiff: 150,
    matchReason: 'Two 70s/80s stars for a premier 60s rookie — balanced vintage trade',
  },
  {
    id: 'match-v04',
    memberA: 'PreWarCollector',
    memberB: 'HallOfFameHank',
    matchQuality: 'moderate',
    memberAOffers: ['1948 Leaf Jackie Robinson'],
    memberBOffers: ['1969 Topps Reggie Jackson RC'],
    estimatedValueDiff: 800,
    matchReason: 'Significant value gap but both cards are on want lists — cash balancer likely needed',
  },
];

const vintageSwapDeals: LiveDeal[] = [
  {
    id: 'deal-v01',
    proposer: 'RetroCardKing',
    responder: 'PreWarCollector',
    offeredCards: ['1963 Topps Pete Rose RC'],
    requestedCards: ['1969 Topps Reggie Jackson RC'],
    cashDiff: 200,
    status: 'proposed',
    timestamp: '2026-03-20T19:00:00Z',
    completedAt: null,
  },
  {
    id: 'deal-v02',
    proposer: 'WaxPackWendy',
    responder: 'RetroCardKing',
    offeredCards: ['1955 Topps Roberto Clemente RC'],
    requestedCards: ['1971 Topps Nolan Ryan'],
    cashDiff: 350,
    status: 'proposed',
    timestamp: '2026-03-20T19:00:00Z',
    completedAt: null,
  },
  {
    id: 'deal-v03',
    proposer: 'HallOfFameHank',
    responder: 'WaxPackWendy',
    offeredCards: ['1975 Topps George Brett RC', '1980 Topps Rickey Henderson RC'],
    requestedCards: ['1968 Topps Nolan Ryan RC'],
    cashDiff: 150,
    status: 'proposed',
    timestamp: '2026-03-20T19:00:00Z',
    completedAt: null,
  },
  {
    id: 'deal-v04',
    proposer: 'PreWarCollector',
    responder: 'HallOfFameHank',
    offeredCards: ['1948 Leaf Jackie Robinson'],
    requestedCards: ['1969 Topps Reggie Jackson RC'],
    cashDiff: 800,
    status: 'proposed',
    timestamp: '2026-03-20T19:00:00Z',
    completedAt: null,
  },
];

const rookieExchangeParticipants: EventParticipant[] = [
  {
    userId: 'usr-601',
    handle: 'RookieKing23',
    itemsListed: 20,
    matchesFound: 5,
    dealsCompleted: 4,
    totalTradeValue: 7200,
    rating: 4.95,
    wantList: ['2023 Topps Chrome Corbin Carroll RC', '2022 Bowman Chrome Gunnar Henderson RC'],
    haveList: ['2023 Prizm Victor Wembanyama RC', '2022 Topps Julio Rodriguez RC'],
  },
  {
    userId: 'usr-602',
    handle: 'MintCondMaria',
    itemsListed: 16,
    matchesFound: 4,
    dealsCompleted: 3,
    totalTradeValue: 5400,
    rating: 4.88,
    wantList: ['2023 Prizm Victor Wembanyama RC', '2023 Bowman Elly De La Cruz'],
    haveList: ['2023 Topps Chrome Corbin Carroll RC', '2022 Bowman Chrome Gunnar Henderson RC'],
  },
  {
    userId: 'usr-603',
    handle: 'FlipMaster',
    itemsListed: 28,
    matchesFound: 6,
    dealsCompleted: 5,
    totalTradeValue: 9100,
    rating: 4.72,
    wantList: ['2022 Topps Julio Rodriguez RC', '2023 Panini Select Stroud RC'],
    haveList: ['2023 Bowman Elly De La Cruz', '2023 Panini Select CJ Stroud RC'],
  },
  {
    userId: 'usr-604',
    handle: 'PSA10Chaser',
    itemsListed: 11,
    matchesFound: 3,
    dealsCompleted: 2,
    totalTradeValue: 3800,
    rating: 4.82,
    wantList: ['2023 Bowman Elly De La Cruz', '2022 Topps Julio Rodriguez RC'],
    haveList: ['2023 Topps Chrome Corbin Carroll RC', '2023 Panini Select Stroud RC'],
  },
  {
    userId: 'usr-605',
    handle: 'DynastyDave',
    itemsListed: 19,
    matchesFound: 4,
    dealsCompleted: 3,
    totalTradeValue: 6500,
    rating: 4.9,
    wantList: ['2023 Panini Select Stroud RC', '2023 Prizm Victor Wembanyama RC'],
    haveList: ['2022 Bowman Chrome Gunnar Henderson RC', '2022 Topps Julio Rodriguez RC'],
  },
  {
    userId: 'usr-606',
    handle: 'NewWaveNick',
    itemsListed: 13,
    matchesFound: 3,
    dealsCompleted: 2,
    totalTradeValue: 2900,
    rating: 4.65,
    wantList: ['2022 Bowman Chrome Gunnar Henderson RC', '2023 Topps Chrome Corbin Carroll RC'],
    haveList: ['2023 Prizm Victor Wembanyama RC', '2023 Bowman Elly De La Cruz'],
  },
];

const rookieExchangeMatches: TradeMatch[] = [
  {
    id: 'match-r01',
    memberA: 'RookieKing23',
    memberB: 'MintCondMaria',
    matchQuality: 'perfect',
    memberAOffers: ['2023 Prizm Victor Wembanyama RC'],
    memberBOffers: ['2023 Topps Chrome Corbin Carroll RC', '2022 Bowman Chrome Gunnar Henderson RC'],
    estimatedValueDiff: 30,
    matchReason: 'Perfect double-match — Wemby for Carroll + Henderson, both want lists fully satisfied',
  },
  {
    id: 'match-r02',
    memberA: 'FlipMaster',
    memberB: 'PSA10Chaser',
    matchQuality: 'perfect',
    memberAOffers: ['2023 Bowman Elly De La Cruz'],
    memberBOffers: ['2023 Panini Select Stroud RC'],
    estimatedValueDiff: 25,
    matchReason: 'Direct 1-for-1 swap — both cards on each other\'s want list',
  },
  {
    id: 'match-r03',
    memberA: 'DynastyDave',
    memberB: 'NewWaveNick',
    matchQuality: 'strong',
    memberAOffers: ['2022 Bowman Chrome Gunnar Henderson RC'],
    memberBOffers: ['2023 Prizm Victor Wembanyama RC'],
    estimatedValueDiff: 110,
    matchReason: 'Dave wants Wemby for dynasty hold, Nick wants Henderson — era alignment for both',
  },
  {
    id: 'match-r04',
    memberA: 'FlipMaster',
    memberB: 'DynastyDave',
    matchQuality: 'strong',
    memberAOffers: ['2023 Panini Select CJ Stroud RC'],
    memberBOffers: ['2022 Topps Julio Rodriguez RC'],
    estimatedValueDiff: 65,
    matchReason: 'FlipMaster wants JRod for portfolio, Dave wants Stroud for dynasty football stack',
  },
  {
    id: 'match-r05',
    memberA: 'NewWaveNick',
    memberB: 'RookieKing23',
    matchQuality: 'moderate',
    memberAOffers: ['2023 Bowman Elly De La Cruz'],
    memberBOffers: ['2022 Topps Julio Rodriguez RC'],
    estimatedValueDiff: 90,
    matchReason: 'Partial overlap — both baseball rookies but value gap requires cash balancer',
  },
];

const rookieExchangeDeals: LiveDeal[] = [
  {
    id: 'deal-r01',
    proposer: 'RookieKing23',
    responder: 'MintCondMaria',
    offeredCards: ['2023 Prizm Victor Wembanyama RC'],
    requestedCards: ['2023 Topps Chrome Corbin Carroll RC', '2022 Bowman Chrome Gunnar Henderson RC'],
    cashDiff: 30,
    status: 'completed',
    timestamp: '2026-03-07T19:15:00Z',
    completedAt: '2026-03-07T19:28:00Z',
  },
  {
    id: 'deal-r02',
    proposer: 'FlipMaster',
    responder: 'PSA10Chaser',
    offeredCards: ['2023 Bowman Elly De La Cruz'],
    requestedCards: ['2023 Panini Select Stroud RC'],
    cashDiff: 25,
    status: 'completed',
    timestamp: '2026-03-07T19:32:00Z',
    completedAt: '2026-03-07T19:40:15Z',
  },
  {
    id: 'deal-r03',
    proposer: 'DynastyDave',
    responder: 'NewWaveNick',
    offeredCards: ['2022 Bowman Chrome Gunnar Henderson RC'],
    requestedCards: ['2023 Prizm Victor Wembanyama RC'],
    cashDiff: 110,
    status: 'completed',
    timestamp: '2026-03-07T19:45:00Z',
    completedAt: '2026-03-07T19:55:30Z',
  },
  {
    id: 'deal-r04',
    proposer: 'FlipMaster',
    responder: 'DynastyDave',
    offeredCards: ['2023 Panini Select CJ Stroud RC'],
    requestedCards: ['2022 Topps Julio Rodriguez RC'],
    cashDiff: 65,
    status: 'completed',
    timestamp: '2026-03-07T20:02:00Z',
    completedAt: '2026-03-07T20:12:45Z',
  },
  {
    id: 'deal-r05',
    proposer: 'NewWaveNick',
    responder: 'RookieKing23',
    offeredCards: ['2023 Bowman Elly De La Cruz'],
    requestedCards: ['2022 Topps Julio Rodriguez RC'],
    cashDiff: 90,
    status: 'declined',
    timestamp: '2026-03-07T20:18:00Z',
    completedAt: null,
  },
  {
    id: 'deal-r06',
    proposer: 'MintCondMaria',
    responder: 'FlipMaster',
    offeredCards: ['2023 Prizm Victor Wembanyama RC'],
    requestedCards: ['2023 Bowman Elly De La Cruz'],
    cashDiff: null,
    status: 'completed',
    timestamp: '2026-03-07T20:25:00Z',
    completedAt: '2026-03-07T20:31:00Z',
  },
];

// ── Service Functions ───────────────────────────────────────────────────────────

export function getSwapMeetEvents(): SwapMeetEvent[] {
  return [
    {
      id: 'evt-friday-001',
      name: 'Friday Night Trades',
      theme: 'Modern Rookies & Stars — All Sports',
      status: 'live',
      hostHandle: 'CardKingMike',
      scheduledDate: '2026-03-13T20:00:00Z',
      duration: 120,
      registeredCount: 5,
      maxParticipants: 20,
      participants: fridayNightParticipants,
      matches: fridayNightMatches,
      liveDeals: fridayNightDeals,
      totalTradeVolume: 20800,
      dealCompletionRate: 0.33,
      avgDealValue: 3467,
      nextEvent: '2026-03-20T20:00:00Z',
    },
    {
      id: 'evt-vintage-002',
      name: 'Vintage Only Swap',
      theme: 'Pre-1985 Cards Only — Baseball & Football',
      status: 'scheduled',
      hostHandle: 'RetroCardKing',
      scheduledDate: '2026-03-20T19:00:00Z',
      duration: 150,
      registeredCount: 4,
      maxParticipants: 15,
      participants: vintageSwapParticipants,
      matches: vintageSwapMatches,
      liveDeals: vintageSwapDeals,
      totalTradeVolume: 0,
      dealCompletionRate: 0,
      avgDealValue: 0,
      nextEvent: '2026-04-03T19:00:00Z',
    },
    {
      id: 'evt-rookie-003',
      name: 'Rookie Exchange',
      theme: '2022-2023 Rookie Cards Only — All Sports',
      status: 'completed',
      hostHandle: 'FlipMaster',
      scheduledDate: '2026-03-07T19:00:00Z',
      duration: 120,
      registeredCount: 6,
      maxParticipants: 25,
      participants: rookieExchangeParticipants,
      matches: rookieExchangeMatches,
      liveDeals: rookieExchangeDeals,
      totalTradeVolume: 34900,
      dealCompletionRate: 0.83,
      avgDealValue: 5817,
      nextEvent: '2026-03-21T19:00:00Z',
    },
  ];
}

export function getSwapMeetStats(): SwapMeetStats {
  return {
    eventsHosted: 47,
    totalParticipants: 812,
    totalDealsCompleted: 1243,
    totalTradeVolume: 487600,
    avgMatchRate: 0.72,
    avgDealCompletionRate: 0.64,
    bestEventVolume: 34900,
    upcomingEvents: 3,
  };
}

export function getEventStatusColor(status: EventStatus): string {
  switch (status) {
    case 'scheduled': return 'text-blue-400';
    case 'registration': return 'text-cyan-400';
    case 'matching': return 'text-purple-400';
    case 'live': return 'text-green-400';
    case 'closing': return 'text-yellow-400';
    case 'completed': return 'text-slate-400';
  }
}

export function getMatchQualityColor(quality: MatchQuality): string {
  switch (quality) {
    case 'perfect': return 'text-green-400';
    case 'strong': return 'text-blue-400';
    case 'moderate': return 'text-yellow-400';
    case 'weak': return 'text-orange-400';
  }
}

export function getDealStatusColor(status: DealStatus): string {
  switch (status) {
    case 'proposed': return 'text-blue-400';
    case 'negotiating': return 'text-yellow-400';
    case 'accepted': return 'text-cyan-400';
    case 'declined': return 'text-red-400';
    case 'completed': return 'text-green-400';
  }
}
