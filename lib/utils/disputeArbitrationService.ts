// Community Dispute Arbitration Service
// Peer-driven arbitration for trade disputes with evidence submission, reputation stakes, and binding resolution

// ---- Types ----

export type DisputeStatus = 'filed' | 'evidence' | 'arbitration' | 'deliberation' | 'resolved' | 'appealed';
export type DisputeCategory = 'misrepresented-condition' | 'not-as-described' | 'non-delivery' | 'counterfeit' | 'payment' | 'other';
export type Resolution = 'refund' | 'partial-refund' | 'return-exchange' | 'dismissed' | 'warning-issued' | 'ban';
export type ArbitratorRole = 'lead' | 'panel' | 'observer';

export interface Evidence {
  id: string;
  submittedBy: string;
  type: 'photo' | 'message' | 'receipt' | 'tracking' | 'cert' | 'video';
  description: string;
  timestamp: string;
  verified: boolean;
}

export interface Arbitrator {
  userId: string;
  handle: string;
  role: ArbitratorRole;
  casesResolved: number;
  rating: number;
  specialties: string[];
  vote: Resolution | null;
  reasoning: string | null;
}

export interface Dispute {
  id: string;
  title: string;
  category: DisputeCategory;
  status: DisputeStatus;
  filedBy: string;
  respondent: string;
  filedDate: string;
  tradeId: string | null;
  tradeValue: number;
  description: string;
  evidence: Evidence[];
  arbitrators: Arbitrator[];
  resolution: Resolution | null;
  resolutionDetails: string | null;
  resolutionDate: string | null;
  daysOpen: number;
  reputationStake: number;
}

export interface DisputeStats {
  totalDisputes: number;
  activeDisputes: number;
  resolvedDisputes: number;
  avgResolutionDays: number;
  arbitratorPool: number;
  satisfactionRate: number;
  dismissalRate: number;
  repeatOffenders: number;
}

// ---- Data ----

const ARBITRATOR_POOL: Arbitrator[] = [
  {
    userId: 'arb-001',
    handle: 'JudgeCardwell',
    role: 'lead',
    casesResolved: 247,
    rating: 4.93,
    specialties: ['counterfeit detection', 'grading disputes', 'high-value trades'],
    vote: null,
    reasoning: null,
  },
  {
    userId: 'arb-002',
    handle: 'FairTradeRick',
    role: 'panel',
    casesResolved: 182,
    rating: 4.87,
    specialties: ['shipping disputes', 'condition assessment', 'vintage cards'],
    vote: null,
    reasoning: null,
  },
  {
    userId: 'arb-003',
    handle: 'ArbitrationAce',
    role: 'panel',
    casesResolved: 156,
    rating: 4.81,
    specialties: ['payment disputes', 'escrow issues', 'international trades'],
    vote: null,
    reasoning: null,
  },
  {
    userId: 'arb-004',
    handle: 'CardCourtSara',
    role: 'panel',
    casesResolved: 134,
    rating: 4.76,
    specialties: ['modern cards', 'autograph authentication', 'misrepresentation'],
    vote: null,
    reasoning: null,
  },
  {
    userId: 'arb-005',
    handle: 'NeutralNate',
    role: 'observer',
    casesResolved: 89,
    rating: 4.69,
    specialties: ['rookie cards', 'set completions', 'bulk trades'],
    vote: null,
    reasoning: null,
  },
  {
    userId: 'arb-006',
    handle: 'MediatorMaya',
    role: 'panel',
    casesResolved: 112,
    rating: 4.72,
    specialties: ['memorabilia', 'non-delivery', 'platform policy'],
    vote: null,
    reasoning: null,
  },
];

const DISPUTES: Dispute[] = [
  {
    id: 'DSP-2024-0417',
    title: 'PSA 10 Wembanyama Prizm listed as Mint but arrived with corner damage',
    category: 'misrepresented-condition',
    status: 'filed',
    filedBy: 'HoopCollector99',
    respondent: 'SlabKingTrades',
    filedDate: '2026-03-14',
    tradeId: 'TRD-88412',
    tradeValue: 1850,
    description: 'Purchased a PSA 10 2023-24 Prizm Victor Wembanyama Silver listed as "perfect slab, no issues." Card arrived with visible corner ding on the case and a hairline scratch across the front of the holder. Seller claims it was shipping damage, but the packaging was minimal — single bubble mailer with no padding.',
    evidence: [
      { id: 'ev-001', submittedBy: 'HoopCollector99', type: 'photo', description: 'Photos of damaged corner on PSA case upon arrival', timestamp: '2026-03-14T10:22:00Z', verified: true },
      { id: 'ev-002', submittedBy: 'HoopCollector99', type: 'photo', description: 'Photo of inadequate shipping packaging', timestamp: '2026-03-14T10:25:00Z', verified: true },
      { id: 'ev-003', submittedBy: 'SlabKingTrades', type: 'photo', description: 'Pre-shipment photos showing card in perfect condition', timestamp: '2026-03-15T08:10:00Z', verified: false },
      { id: 'ev-004', submittedBy: 'HoopCollector99', type: 'message', description: 'Screenshots of seller listing claiming "flawless slab"', timestamp: '2026-03-14T11:00:00Z', verified: true },
    ],
    arbitrators: [],
    resolution: null,
    resolutionDetails: null,
    resolutionDate: null,
    daysOpen: 3,
    reputationStake: 15,
  },
  {
    id: 'DSP-2024-0389',
    title: 'Alleged counterfeit 1986 Fleer Jordan rookie — authentication dispute',
    category: 'counterfeit',
    status: 'arbitration',
    filedBy: 'VintageVaultDan',
    respondent: 'ClassicCardsCo',
    filedDate: '2026-03-02',
    tradeId: 'TRD-87201',
    tradeValue: 14500,
    description: 'Purchased a raw 1986 Fleer Michael Jordan #57 rookie card for $14,500. Card was described as authentic with "strong centering and vibrant color." Upon receiving the card, I had it examined by a third-party authentication expert who flagged several red flags: the card stock feels slightly off, the dot pattern under magnification does not match known authentic prints, and the color saturation appears artificially enhanced. Seller insists the card is legitimate and was inherited from a family collection.',
    evidence: [
      { id: 'ev-010', submittedBy: 'VintageVaultDan', type: 'cert', description: 'Third-party authentication report flagging card as suspicious', timestamp: '2026-03-05T14:30:00Z', verified: true },
      { id: 'ev-011', submittedBy: 'VintageVaultDan', type: 'photo', description: 'High-magnification comparison of dot pattern vs. known authentic', timestamp: '2026-03-05T15:00:00Z', verified: true },
      { id: 'ev-012', submittedBy: 'ClassicCardsCo', type: 'receipt', description: 'Original purchase receipt from 1998 card show', timestamp: '2026-03-07T09:15:00Z', verified: false },
      { id: 'ev-013', submittedBy: 'ClassicCardsCo', type: 'photo', description: 'Photos of card alongside other authenticated vintage Jordan cards', timestamp: '2026-03-07T10:00:00Z', verified: false },
      { id: 'ev-014', submittedBy: 'VintageVaultDan', type: 'video', description: 'Video showing card under UV light with anomalous fluorescence', timestamp: '2026-03-08T11:45:00Z', verified: true },
    ],
    arbitrators: [
      { ...ARBITRATOR_POOL[0], role: 'lead', vote: null, reasoning: null },
      { ...ARBITRATOR_POOL[1], role: 'panel', vote: null, reasoning: null },
      { ...ARBITRATOR_POOL[3], role: 'panel', vote: null, reasoning: null },
    ],
    resolution: null,
    resolutionDetails: null,
    resolutionDate: null,
    daysOpen: 15,
    reputationStake: 50,
  },
  {
    id: 'DSP-2024-0312',
    title: 'Non-delivery of Luka Doncic National Treasures RPA after 45 days',
    category: 'non-delivery',
    status: 'resolved',
    filedBy: 'PatchHunterMike',
    respondent: 'BigHitsOnly',
    filedDate: '2026-01-20',
    tradeId: 'TRD-84550',
    tradeValue: 3200,
    description: 'Completed a trade for a 2018-19 National Treasures Luka Doncic RPA /99 on January 15th. Seller provided a USPS tracking number that has shown "Label Created" status for over 45 days with no movement. Seller initially claimed post office delays, then stopped responding to messages entirely. Trade was conducted through the platform escrow system and funds are currently held.',
    evidence: [
      { id: 'ev-020', submittedBy: 'PatchHunterMike', type: 'tracking', description: 'USPS tracking showing "Label Created" with no updates for 45+ days', timestamp: '2026-02-28T16:00:00Z', verified: true },
      { id: 'ev-021', submittedBy: 'PatchHunterMike', type: 'message', description: 'Complete message history showing seller going silent after 2 weeks', timestamp: '2026-02-28T16:30:00Z', verified: true },
      { id: 'ev-022', submittedBy: 'PatchHunterMike', type: 'receipt', description: 'Platform escrow confirmation and trade agreement', timestamp: '2026-01-20T12:00:00Z', verified: true },
    ],
    arbitrators: [
      { ...ARBITRATOR_POOL[2], role: 'lead', vote: 'refund', reasoning: 'Clear non-delivery with no proof of shipment. Tracking never moved past label creation. Seller became non-responsive, which is a strong indicator of bad faith.' },
      { ...ARBITRATOR_POOL[5], role: 'panel', vote: 'refund', reasoning: 'Unanimous — no evidence the card was ever shipped. Escrow funds should be returned to the buyer immediately.' },
      { ...ARBITRATOR_POOL[4], role: 'observer', vote: 'refund', reasoning: 'Concur with panel. Recommend a 30-day platform suspension for the seller based on pattern of non-responsiveness.' },
    ],
    resolution: 'refund',
    resolutionDetails: 'Full refund of $3,200 issued from escrow. Seller "BigHitsOnly" received a formal warning and 30-day trading suspension. If a similar incident occurs, a permanent ban will be considered.',
    resolutionDate: '2026-03-05',
    daysOpen: 44,
    reputationStake: 30,
  },
  {
    id: 'DSP-2024-0401',
    title: 'Appeal: Dismissed case on Ja Morant Optic auto — new evidence submitted',
    category: 'not-as-described',
    status: 'appealed',
    filedBy: 'MemphisMintCollector',
    respondent: 'AutoKingsShop',
    filedDate: '2026-02-10',
    tradeId: 'TRD-85930',
    tradeValue: 780,
    description: 'Originally filed a dispute claiming the 2019-20 Optic Ja Morant autograph was not an on-card auto as described but rather a sticker auto. Case was initially dismissed due to insufficient evidence. New evidence has emerged: a professional autograph authenticator has confirmed the signature is a sticker auto placed to resemble an on-card signature. Requesting case be re-opened.',
    evidence: [
      { id: 'ev-030', submittedBy: 'MemphisMintCollector', type: 'photo', description: 'Original listing screenshot showing "on-card auto" description', timestamp: '2026-02-10T09:00:00Z', verified: true },
      { id: 'ev-031', submittedBy: 'MemphisMintCollector', type: 'cert', description: 'New authenticator report confirming sticker auto, not on-card', timestamp: '2026-03-10T14:00:00Z', verified: true },
      { id: 'ev-032', submittedBy: 'MemphisMintCollector', type: 'video', description: 'Video showing sticker edge visible under side lighting', timestamp: '2026-03-11T08:30:00Z', verified: true },
      { id: 'ev-033', submittedBy: 'AutoKingsShop', type: 'message', description: 'Seller response claiming card was purchased as on-card from a distributor', timestamp: '2026-03-12T11:00:00Z', verified: false },
    ],
    arbitrators: [
      { ...ARBITRATOR_POOL[0], role: 'lead', vote: 'partial-refund', reasoning: 'New evidence is compelling. The authenticator report clearly identifies a sticker auto. However, seller may have been misled by their own supplier. Partial refund reflecting the value difference between on-card and sticker auto seems appropriate.' },
      { ...ARBITRATOR_POOL[3], role: 'panel', vote: 'return-exchange', reasoning: 'Buyer should return the card and receive a full refund. The listing was misleading regardless of seller intent.' },
    ],
    resolution: null,
    resolutionDetails: null,
    resolutionDate: null,
    daysOpen: 35,
    reputationStake: 20,
  },
];

// ---- Functions ----

export function getDisputes(): Dispute[] {
  return DISPUTES;
}

export function getArbitratorPool(): Arbitrator[] {
  return ARBITRATOR_POOL;
}

export function getDisputeStats(): DisputeStats {
  return {
    totalDisputes: 417,
    activeDisputes: 23,
    resolvedDisputes: 386,
    avgResolutionDays: 11.4,
    arbitratorPool: ARBITRATOR_POOL.length,
    satisfactionRate: 91.2,
    dismissalRate: 8.7,
    repeatOffenders: 14,
  };
}

export function getDisputeStatusColor(status: DisputeStatus): string {
  switch (status) {
    case 'filed': return 'text-yellow-400';
    case 'evidence': return 'text-blue-400';
    case 'arbitration': return 'text-purple-400';
    case 'deliberation': return 'text-orange-400';
    case 'resolved': return 'text-green-400';
    case 'appealed': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function getCategoryLabel(cat: DisputeCategory): string {
  switch (cat) {
    case 'misrepresented-condition': return 'Misrepresented Condition';
    case 'not-as-described': return 'Not as Described';
    case 'non-delivery': return 'Non-Delivery';
    case 'counterfeit': return 'Counterfeit';
    case 'payment': return 'Payment Issue';
    case 'other': return 'Other';
    default: return cat;
  }
}

export function getResolutionLabel(res: Resolution): string {
  switch (res) {
    case 'refund': return 'Full Refund';
    case 'partial-refund': return 'Partial Refund';
    case 'return-exchange': return 'Return & Exchange';
    case 'dismissed': return 'Dismissed';
    case 'warning-issued': return 'Warning Issued';
    case 'ban': return 'Account Banned';
    default: return res;
  }
}
