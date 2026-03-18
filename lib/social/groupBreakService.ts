/**
 * Group Break Planning & Cost Splitting Service
 * Organize group breaks with automated cost splitting, hit tracking, and break history.
 */

export type BreakFormat = 'random-team' | 'pick-your-team' | 'hit-draft' | 'personal-box' | 'half-case';
export type BreakStatus = 'planning' | 'filling' | 'locked' | 'live' | 'completed' | 'settled';
export type SlotStatus = 'open' | 'claimed' | 'paid';

export interface BreakSlot {
  slotNumber: number;
  team: string | null;
  claimedBy: string | null;
  cost: number;
  status: SlotStatus;
  hitsReceived: number;
  hitValue: number;
}

export interface BreakHit {
  id: string;
  cardName: string;
  estimatedValue: number;
  recipientHandle: string;
  slotNumber: number;
  isHighlight: boolean;
  timestamp: string;
}

export interface GroupBreak {
  id: string;
  name: string;
  product: string;
  format: BreakFormat;
  status: BreakStatus;
  hostHandle: string;
  totalCost: number;
  totalSlots: number;
  filledSlots: number;
  costPerSlot: number;
  scheduledDate: string;
  slots: BreakSlot[];
  hits: BreakHit[];
  totalHitValue: number;
  avgROIPerSlot: number;
  streamUrl: string | null;
}

export interface BreakHistoryEntry {
  breakId: string;
  product: string;
  format: BreakFormat;
  date: string;
  yourSlotCost: number;
  yourHitValue: number;
  roi: number;
  topHit: string;
}

export interface GroupBreakStats {
  totalBreaksJoined: number;
  totalSpent: number;
  totalHitValue: number;
  overallROI: number;
  bestBreakROI: number;
  avgGroupSize: number;
  favoriteFormat: string;
}

function getGroupBreaks(): GroupBreak[] {
  return [
    {
      id: 'gb-1',
      name: 'Friday Night 2025 Bowman Chrome HJ Case',
      product: '2025 Bowman Chrome Hobby Jumbo',
      format: 'random-team',
      status: 'filling',
      hostHandle: 'WaxBreaker99',
      totalCost: 4800,
      totalSlots: 30,
      filledSlots: 22,
      costPerSlot: 160,
      scheduledDate: '2026-03-21 8:00 PM ET',
      slots: [
        { slotNumber: 1, team: 'Yankees', claimedBy: 'CardShark92', cost: 160, status: 'paid', hitsReceived: 0, hitValue: 0 },
        { slotNumber: 2, team: 'Dodgers', claimedBy: 'ProspectHunter', cost: 160, status: 'paid', hitsReceived: 0, hitValue: 0 },
        { slotNumber: 3, team: 'Braves', claimedBy: 'GrailChaser', cost: 160, status: 'paid', hitsReceived: 0, hitValue: 0 },
        { slotNumber: 4, team: 'Astros', claimedBy: null, cost: 160, status: 'open', hitsReceived: 0, hitValue: 0 },
        { slotNumber: 5, team: 'Phillies', claimedBy: 'SlabCollector', cost: 160, status: 'claimed', hitsReceived: 0, hitValue: 0 },
      ],
      hits: [],
      totalHitValue: 0,
      avgROIPerSlot: 0,
      streamUrl: null,
    },
    {
      id: 'gb-2',
      name: 'PYT: 2024 Panini Prizm Basketball Hobby',
      product: '2024-25 Panini Prizm Basketball',
      format: 'pick-your-team',
      status: 'completed',
      hostHandle: 'HoopsInvestor',
      totalCost: 2400,
      totalSlots: 30,
      filledSlots: 30,
      costPerSlot: 80,
      scheduledDate: '2026-03-10 7:00 PM ET',
      slots: [
        { slotNumber: 1, team: 'Spurs', claimedBy: 'DunkTrader', cost: 180, status: 'paid', hitsReceived: 4, hitValue: 620 },
        { slotNumber: 2, team: 'Grizzlies', claimedBy: 'CourtVision', cost: 120, status: 'paid', hitsReceived: 2, hitValue: 180 },
        { slotNumber: 3, team: 'Thunder', claimedBy: 'CardShark92', cost: 150, status: 'paid', hitsReceived: 3, hitValue: 340 },
      ],
      hits: [
        { id: 'h1', cardName: 'Stephon Castle Prizm Silver Auto /25', estimatedValue: 480, recipientHandle: 'DunkTrader', slotNumber: 1, isHighlight: true, timestamp: '2026-03-10 7:42 PM' },
        { id: 'h2', cardName: 'Zach Edey Base RC', estimatedValue: 15, recipientHandle: 'CourtVision', slotNumber: 2, isHighlight: false, timestamp: '2026-03-10 7:18 PM' },
        { id: 'h3', cardName: 'Chet Holmgren Gold /10', estimatedValue: 340, recipientHandle: 'CardShark92', slotNumber: 3, isHighlight: true, timestamp: '2026-03-10 8:05 PM' },
      ],
      totalHitValue: 3850,
      avgROIPerSlot: 60,
      streamUrl: 'https://whatnot.com/past/break-xyz',
    },
    {
      id: 'gb-3',
      name: 'Half Case: 2024 Topps Chrome Update',
      product: '2024 Topps Chrome Update Hobby',
      format: 'half-case',
      status: 'live',
      hostHandle: 'CardShark92',
      totalCost: 1800,
      totalSlots: 6,
      filledSlots: 6,
      costPerSlot: 300,
      scheduledDate: '2026-03-17 9:00 PM ET',
      slots: [
        { slotNumber: 1, team: null, claimedBy: 'ProspectHunter', cost: 300, status: 'paid', hitsReceived: 2, hitValue: 190 },
        { slotNumber: 2, team: null, claimedBy: 'WaxBreaker99', cost: 300, status: 'paid', hitsReceived: 1, hitValue: 85 },
        { slotNumber: 3, team: null, claimedBy: 'VintageKing', cost: 300, status: 'paid', hitsReceived: 3, hitValue: 410 },
      ],
      hits: [
        { id: 'h4', cardName: 'Paul Skenes Chrome RC Auto /25', estimatedValue: 380, recipientHandle: 'VintageKing', slotNumber: 3, isHighlight: true, timestamp: '2026-03-17 9:22 PM' },
      ],
      totalHitValue: 685,
      avgROIPerSlot: -18,
      streamUrl: 'https://whatnot.com/live/break-abc',
    },
  ];
}

function getBreakHistory(): BreakHistoryEntry[] {
  return [
    { breakId: 'gb-2', product: '2024-25 Panini Prizm Basketball', format: 'pick-your-team', date: '2026-03-10', yourSlotCost: 150, yourHitValue: 340, roi: 127, topHit: 'Chet Holmgren Gold /10' },
    { breakId: 'bh-1', product: '2024 Topps Chrome Hobby', format: 'random-team', date: '2026-02-28', yourSlotCost: 120, yourHitValue: 45, roi: -63, topHit: 'Base RC lot' },
    { breakId: 'bh-2', product: '2025 Bowman Draft Jumbo', format: 'hit-draft', date: '2026-02-15', yourSlotCost: 200, yourHitValue: 890, roi: 345, topHit: 'Travis Bazzana 1st Auto /75' },
    { breakId: 'bh-3', product: '2024 Panini Select Football', format: 'random-team', date: '2026-01-20', yourSlotCost: 95, yourHitValue: 60, roi: -37, topHit: 'Caleb Williams Silver' },
    { breakId: 'bh-4', product: '2024 Topps Series 2 Hobby', format: 'personal-box', date: '2026-01-05', yourSlotCost: 85, yourHitValue: 120, roi: 41, topHit: 'SSP Variation pull' },
  ];
}

function getGroupBreakStats(): GroupBreakStats {
  return {
    totalBreaksJoined: 34,
    totalSpent: 4850,
    totalHitValue: 7230,
    overallROI: 49,
    bestBreakROI: 345,
    avgGroupSize: 18,
    favoriteFormat: 'Random Team',
  };
}

function getFormatLabel(format: BreakFormat): string {
  const labels: Record<BreakFormat, string> = {
    'random-team': 'Random Team',
    'pick-your-team': 'Pick Your Team',
    'hit-draft': 'Hit Draft',
    'personal-box': 'Personal Box',
    'half-case': 'Half Case',
  };
  return labels[format];
}

function getStatusColor(status: BreakStatus): string {
  const colors: Record<BreakStatus, string> = {
    'planning': 'text-slate-400 bg-slate-500/10',
    'filling': 'text-blue-400 bg-blue-500/10',
    'locked': 'text-amber-400 bg-amber-500/10',
    'live': 'text-red-400 bg-red-500/10',
    'completed': 'text-green-400 bg-green-500/10',
    'settled': 'text-purple-400 bg-purple-500/10',
  };
  return colors[status];
}

export {
  getGroupBreaks,
  getBreakHistory,
  getGroupBreakStats,
  getFormatLabel,
  getStatusColor,
};
