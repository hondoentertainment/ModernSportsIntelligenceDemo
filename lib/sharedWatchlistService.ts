/**
 * Shared Watchlists & Collaborative Research Service
 * Multi-user watchlists with real-time collaboration, shared notes, and consensus signals.
 */

export type WatchlistVisibility = 'private' | 'shared' | 'public';
export type ResearchStatus = 'proposed' | 'researching' | 'consensus-buy' | 'consensus-hold' | 'consensus-sell' | 'archived';
export type ContributorRole = 'owner' | 'editor' | 'viewer';

export interface WatchlistContributor {
  userId: string;
  handle: string;
  role: ContributorRole;
  joinedDate: string;
  notesCount: number;
  lastActive: string;
}

export interface SharedNote {
  id: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  upvotes: number;
}

export interface WatchlistCard {
  id: string;
  cardName: string;
  currentPrice: number;
  priceAtAdd: number;
  addedBy: string;
  addedDate: string;
  researchStatus: ResearchStatus;
  notes: SharedNote[];
  consensusScore: number; // -100 to 100
  targetPrice: number | null;
  alertsTriggered: number;
}

export interface SharedWatchlist {
  id: string;
  name: string;
  description: string;
  visibility: WatchlistVisibility;
  createdBy: string;
  createdDate: string;
  contributors: WatchlistContributor[];
  cards: WatchlistCard[];
  activeResearchThreads: number;
  totalAlerts: number;
  avgConsensus: number;
}

export interface CollaborationStats {
  totalSharedWatchlists: number;
  totalCollaborators: number;
  activeResearchThreads: number;
  consensusBuySignals: number;
  avgGroupAlpha: number;
  topPerformingWatchlist: string;
}

function getSharedWatchlists(): SharedWatchlist[] {
  return [
    {
      id: 'sw-1',
      name: 'Rookie Class 2025 Targets',
      description: 'Collaborative scouting for 2025 draft picks with high card potential',
      visibility: 'shared',
      createdBy: 'CardShark92',
      createdDate: '2025-12-01',
      contributors: [
        { userId: 'u1', handle: 'CardShark92', role: 'owner', joinedDate: '2025-12-01', notesCount: 23, lastActive: '2h ago' },
        { userId: 'u2', handle: 'ProspectHunter', role: 'editor', joinedDate: '2025-12-05', notesCount: 41, lastActive: '15m ago' },
        { userId: 'u3', handle: 'WaxBreaker99', role: 'editor', joinedDate: '2025-12-10', notesCount: 12, lastActive: '1h ago' },
        { userId: 'u4', handle: 'GrailChaser', role: 'viewer', joinedDate: '2026-01-03', notesCount: 5, lastActive: '3h ago' },
      ],
      cards: [
        {
          id: 'wc-1', cardName: '2025 Bowman Chrome Travis Bazzana Auto /50', currentPrice: 850, priceAtAdd: 620,
          addedBy: 'ProspectHunter', addedDate: '2025-12-06', researchStatus: 'consensus-buy',
          notes: [
            { id: 'n1', authorHandle: 'ProspectHunter', content: 'Elite bat-to-ball skills, #1 pick ceiling', timestamp: '2025-12-06', sentiment: 'bullish', upvotes: 4 },
            { id: 'n2', authorHandle: 'CardShark92', content: 'Comps to Witt Jr. trajectory at this price point', timestamp: '2025-12-08', sentiment: 'bullish', upvotes: 3 },
          ],
          consensusScore: 82, targetPrice: 1200, alertsTriggered: 2,
        },
        {
          id: 'wc-2', cardName: '2025 Topps Chrome Jace Jung RC /199', currentPrice: 180, priceAtAdd: 210,
          addedBy: 'CardShark92', addedDate: '2025-12-12', researchStatus: 'researching',
          notes: [
            { id: 'n3', authorHandle: 'CardShark92', content: 'Power bat but strikeout rate concerns me', timestamp: '2025-12-12', sentiment: 'neutral', upvotes: 2 },
            { id: 'n4', authorHandle: 'WaxBreaker99', content: 'Buying dip - swing mechanics look improved in spring', timestamp: '2026-01-15', sentiment: 'bullish', upvotes: 5 },
          ],
          consensusScore: 35, targetPrice: 300, alertsTriggered: 1,
        },
        {
          id: 'wc-3', cardName: '2024 Bowman 1st Charlie Condon Auto', currentPrice: 420, priceAtAdd: 380,
          addedBy: 'WaxBreaker99', addedDate: '2026-01-02', researchStatus: 'consensus-hold',
          notes: [
            { id: 'n5', authorHandle: 'GrailChaser', content: 'Waiting for assignment before adding more', timestamp: '2026-01-05', sentiment: 'neutral', upvotes: 3 },
          ],
          consensusScore: 15, targetPrice: 550, alertsTriggered: 0,
        },
      ],
      activeResearchThreads: 3,
      totalAlerts: 3,
      avgConsensus: 44,
    },
    {
      id: 'sw-2',
      name: 'Vintage HOF Grail Tracker',
      description: 'Tracking premium vintage opportunities across PSA 7-9 range',
      visibility: 'shared',
      createdBy: 'VintageKing',
      createdDate: '2025-10-15',
      contributors: [
        { userId: 'u5', handle: 'VintageKing', role: 'owner', joinedDate: '2025-10-15', notesCount: 55, lastActive: '30m ago' },
        { userId: 'u6', handle: 'SlabCollector', role: 'editor', joinedDate: '2025-10-20', notesCount: 38, lastActive: '4h ago' },
        { userId: 'u1', handle: 'CardShark92', role: 'editor', joinedDate: '2025-11-01', notesCount: 19, lastActive: '2h ago' },
      ],
      cards: [
        {
          id: 'wc-4', cardName: '1956 Topps Mickey Mantle PSA 7', currentPrice: 42000, priceAtAdd: 38500,
          addedBy: 'VintageKing', addedDate: '2025-10-16', researchStatus: 'consensus-buy',
          notes: [
            { id: 'n6', authorHandle: 'VintageKing', content: 'Pop 245 PSA 7, floor rising consistently', timestamp: '2025-10-16', sentiment: 'bullish', upvotes: 6 },
          ],
          consensusScore: 90, targetPrice: 55000, alertsTriggered: 1,
        },
        {
          id: 'wc-5', cardName: '1955 Topps Roberto Clemente RC PSA 6', currentPrice: 18500, priceAtAdd: 19200,
          addedBy: 'SlabCollector', addedDate: '2025-11-05', researchStatus: 'consensus-hold',
          notes: [
            { id: 'n7', authorHandle: 'SlabCollector', content: 'Heritage auction next month — wait for result', timestamp: '2025-11-05', sentiment: 'neutral', upvotes: 4 },
          ],
          consensusScore: 20, targetPrice: 22000, alertsTriggered: 0,
        },
      ],
      activeResearchThreads: 2,
      totalAlerts: 1,
      avgConsensus: 55,
    },
    {
      id: 'sw-3',
      name: 'Basketball Breakout Alert',
      description: 'Real-time monitoring of NBA breakout candidates with group signals',
      visibility: 'public',
      createdBy: 'HoopsInvestor',
      createdDate: '2026-01-10',
      contributors: [
        { userId: 'u7', handle: 'HoopsInvestor', role: 'owner', joinedDate: '2026-01-10', notesCount: 30, lastActive: '5m ago' },
        { userId: 'u8', handle: 'DunkTrader', role: 'editor', joinedDate: '2026-01-12', notesCount: 22, lastActive: '1h ago' },
        { userId: 'u9', handle: 'CourtVision', role: 'editor', joinedDate: '2026-01-15', notesCount: 18, lastActive: '20m ago' },
        { userId: 'u10', handle: 'RookieWatcher', role: 'viewer', joinedDate: '2026-02-01', notesCount: 8, lastActive: '6h ago' },
      ],
      cards: [
        {
          id: 'wc-6', cardName: '2024 Panini Prizm Zach Edey Silver RC', currentPrice: 95, priceAtAdd: 55,
          addedBy: 'HoopsInvestor', addedDate: '2026-01-11', researchStatus: 'consensus-sell',
          notes: [
            { id: 'n8', authorHandle: 'CourtVision', content: 'Take profits — ceiling is limited in modern NBA pace', timestamp: '2026-02-20', sentiment: 'bearish', upvotes: 7 },
          ],
          consensusScore: -45, targetPrice: 60, alertsTriggered: 3,
        },
        {
          id: 'wc-7', cardName: '2024 Donruss Optic Stephon Castle Auto /99', currentPrice: 320, priceAtAdd: 180,
          addedBy: 'DunkTrader', addedDate: '2026-01-20', researchStatus: 'consensus-buy',
          notes: [
            { id: 'n9', authorHandle: 'DunkTrader', content: 'Two-way stud, Spurs building around him', timestamp: '2026-01-20', sentiment: 'bullish', upvotes: 9 },
            { id: 'n10', authorHandle: 'HoopsInvestor', content: 'All-rookie team lock, still underpriced', timestamp: '2026-02-05', sentiment: 'bullish', upvotes: 6 },
          ],
          consensusScore: 75, targetPrice: 500, alertsTriggered: 2,
        },
      ],
      activeResearchThreads: 4,
      totalAlerts: 5,
      avgConsensus: 15,
    },
  ];
}

function getCollaborationStats(): CollaborationStats {
  return {
    totalSharedWatchlists: 12,
    totalCollaborators: 47,
    activeResearchThreads: 28,
    consensusBuySignals: 15,
    avgGroupAlpha: 18.4,
    topPerformingWatchlist: 'Rookie Class 2025 Targets',
  };
}

function getResearchStatusLabel(status: ResearchStatus): string {
  const labels: Record<ResearchStatus, string> = {
    'proposed': 'Proposed',
    'researching': 'Researching',
    'consensus-buy': 'Consensus Buy',
    'consensus-hold': 'Consensus Hold',
    'consensus-sell': 'Consensus Sell',
    'archived': 'Archived',
  };
  return labels[status];
}

function getResearchStatusColor(status: ResearchStatus): string {
  const colors: Record<ResearchStatus, string> = {
    'proposed': 'text-slate-400 bg-slate-500/10',
    'researching': 'text-blue-400 bg-blue-500/10',
    'consensus-buy': 'text-green-400 bg-green-500/10',
    'consensus-hold': 'text-amber-400 bg-amber-500/10',
    'consensus-sell': 'text-red-400 bg-red-500/10',
    'archived': 'text-slate-500 bg-slate-600/10',
  };
  return colors[status];
}

export {
  getSharedWatchlists,
  getCollaborationStats,
  getResearchStatusLabel,
  getResearchStatusColor,
};
