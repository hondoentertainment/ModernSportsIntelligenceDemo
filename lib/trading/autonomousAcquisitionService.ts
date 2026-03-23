// Phase 112: AI Deal Negotiation Agent with Autonomous Acquisition
// Autonomous agent that hunts, evaluates, negotiates, and acquires cards across platforms.

import { getSelectedPlaybook } from './negotiationPlaybooks';

// ── Types ──────────────────────────────────────────────────────────────────────

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'failed' | 'pending_review';
export type NegotiationStage = 'opening' | 'counter' | 'final_offer' | 'accepted' | 'rejected' | 'expired';
export type EscrowState = 'pending_payment' | 'payment_held' | 'item_shipped' | 'authentication_in_progress' | 'authentication_passed' | 'authentication_failed' | 'funds_released' | 'refunded';
export type AgentActionType = 'scan' | 'found' | 'analyze' | 'offer' | 'counter_received' | 'counter_sent' | 'accepted' | 'rejected' | 'escrow' | 'completed' | 'alert';
export type MarketplacePlatform = 'eBay' | 'COMC' | 'MySlabs' | 'Facebook Groups' | 'StockX' | 'Alt' | 'Goldin';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CampaignCriteria {
  player: string;
  year?: string;
  set?: string;
  cardNumber?: string;
  grade?: string;
  gradingCompany?: string;
  maxPrice: number;
  targetROI: number;
  urgency: UrgencyLevel;
  platforms: MarketplacePlatform[];
  notes?: string;
}

export interface AcquisitionCampaign {
  id: string;
  name: string;
  criteria: CampaignCriteria;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  listingsFound: number;
  negotiationsActive: number;
  negotiationsCompleted: number;
  acquisitions: number;
  totalSpent: number;
  totalSaved: number;
  estimatedFMV: number;
  progressPct: number;
}

export interface NegotiationMessage {
  id: string;
  timestamp: string;
  sender: 'agent' | 'seller';
  message: string;
  amount?: number;
  strategyAnnotation?: string;
}

export interface NegotiationSession {
  id: string;
  campaignId: string;
  sellerId: string;
  sellerName: string;
  platform: MarketplacePlatform;
  listingTitle: string;
  listingPrice: number;
  currentOffer: number;
  stage: NegotiationStage;
  messages: NegotiationMessage[];
  startedAt: string;
  updatedAt: string;
  rounds: number;
  openingOffer: number;
  estimatedFMV: number;
  targetPrice: number;
  finalPrice?: number;
  savings?: number;
}

export interface SellerProfile {
  id: string;
  name: string;
  platform: MarketplacePlatform;
  totalListings: number;
  avgResponseTime: number; // hours
  acceptanceRate: number;
  avgNegotiationRounds: number;
  avgDiscountPct: number;
  reputationScore: number; // 0-100
  preferredPaymentMethods: string[];
  lastActiveAt: string;
  behaviorNotes: string[];
}

export interface EscrowTransaction {
  id: string;
  negotiationId: string;
  campaignId: string;
  cardDescription: string;
  amount: number;
  state: EscrowState;
  createdAt: string;
  updatedAt: string;
  sellerName: string;
  platform: MarketplacePlatform;
  trackingNumber?: string;
  authenticationProvider?: string;
  authenticationResult?: string;
  estimatedCompletion?: string;
  events: { timestamp: string; event: string; detail: string }[];
}

export interface AcquisitionResult {
  id: string;
  campaignId: string;
  cardDescription: string;
  player: string;
  grade: string;
  platform: MarketplacePlatform;
  listingPrice: number;
  acquiredPrice: number;
  estimatedFMV: number;
  savings: number;
  savingsPct: number;
  roi: number;
  acquiredAt: string;
  sellerName: string;
  negotiationRounds: number;
  timeToAcquire: number; // hours
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  campaignId: string;
  campaignName: string;
  actionType: AgentActionType;
  message: string;
  platform?: MarketplacePlatform;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface AcquisitionAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalListingsScanned: number;
  totalNegotiations: number;
  successfulAcquisitions: number;
  totalSpent: number;
  totalSaved: number;
  avgDiscountPct: number;
  successRate: number;
  avgNegotiationRounds: number;
  avgTimeToAcquire: number; // hours
  bestDeal: { card: string; savings: number; savingsPct: number };
  platformBreakdown: { platform: MarketplacePlatform; acquisitions: number; avgDiscount: number }[];
  monthlySavings: { month: string; saved: number; spent: number }[];
}

export interface SmartPricingRecommendation {
  openingOffer: number;
  targetPrice: number;
  maxPrice: number;
  confidence: number;
  reasoning: string;
  sellerLikelihood: number;
  suggestedStrategy: string;
  comparables: { card: string; soldPrice: number; date: string }[];
  playbookId: string;
  playbookLabel: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: AcquisitionCampaign[] = [
  {
    id: 'camp-001', name: 'Ohtani Bowman Chrome Hunt',
    criteria: { player: 'Shohei Ohtani', year: '2018', set: 'Bowman Chrome', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 850, targetROI: 25, urgency: 'high', platforms: ['eBay', 'COMC', 'MySlabs'] },
    status: 'active', createdAt: '2026-03-01T08:00:00Z', updatedAt: '2026-03-13T14:22:00Z',
    listingsFound: 14, negotiationsActive: 3, negotiationsCompleted: 5, acquisitions: 2,
    totalSpent: 1480, totalSaved: 420, estimatedFMV: 1900, progressPct: 72,
  },
  {
    id: 'camp-002', name: 'Wembanyama Prizm RC Collection',
    criteria: { player: 'Victor Wembanyama', year: '2023', set: 'Prizm', grade: 'BGS 9.5', gradingCompany: 'BGS', maxPrice: 1200, targetROI: 30, urgency: 'critical', platforms: ['eBay', 'Goldin', 'StockX'] },
    status: 'active', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-03-13T15:10:00Z',
    listingsFound: 22, negotiationsActive: 4, negotiationsCompleted: 8, acquisitions: 3,
    totalSpent: 2850, totalSaved: 950, estimatedFMV: 3800, progressPct: 85,
  },
  {
    id: 'camp-003', name: 'Jeter Rookie Graded Lot',
    criteria: { player: 'Derek Jeter', year: '1993', set: 'SP', grade: 'PSA 9', gradingCompany: 'PSA', maxPrice: 600, targetROI: 15, urgency: 'low', platforms: ['eBay', 'COMC'] },
    status: 'completed', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-28T11:00:00Z',
    listingsFound: 8, negotiationsActive: 0, negotiationsCompleted: 4, acquisitions: 2,
    totalSpent: 980, totalSaved: 320, estimatedFMV: 1300, progressPct: 100,
  },
  {
    id: 'camp-004', name: 'Trout Update Chrome Autos',
    criteria: { player: 'Mike Trout', year: '2011', set: 'Topps Update', cardNumber: 'US175', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 3500, targetROI: 20, urgency: 'medium', platforms: ['eBay', 'Goldin', 'COMC'] },
    status: 'active', createdAt: '2026-02-10T07:00:00Z', updatedAt: '2026-03-13T12:45:00Z',
    listingsFound: 6, negotiationsActive: 1, negotiationsCompleted: 2, acquisitions: 0,
    totalSpent: 0, totalSaved: 0, estimatedFMV: 0, progressPct: 35,
  },
  {
    id: 'camp-005', name: 'Griffey Jr. Vintage Lot',
    criteria: { player: 'Ken Griffey Jr.', year: '1989', set: 'Upper Deck', grade: 'PSA 8+', gradingCompany: 'PSA', maxPrice: 400, targetROI: 18, urgency: 'low', platforms: ['eBay', 'Facebook Groups', 'COMC'] },
    status: 'paused', createdAt: '2026-01-05T06:00:00Z', updatedAt: '2026-03-10T09:00:00Z',
    listingsFound: 19, negotiationsActive: 0, negotiationsCompleted: 6, acquisitions: 3,
    totalSpent: 890, totalSaved: 310, estimatedFMV: 1200, progressPct: 60,
  },
  {
    id: 'camp-006', name: 'Judge Rookie Blitz',
    criteria: { player: 'Aaron Judge', year: '2017', set: 'Topps Chrome', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 500, targetROI: 22, urgency: 'high', platforms: ['eBay', 'MySlabs', 'StockX'] },
    status: 'active', createdAt: '2026-03-05T11:00:00Z', updatedAt: '2026-03-13T16:00:00Z',
    listingsFound: 11, negotiationsActive: 2, negotiationsCompleted: 3, acquisitions: 1,
    totalSpent: 420, totalSaved: 130, estimatedFMV: 550, progressPct: 55,
  },
  {
    id: 'camp-007', name: 'Soto Topps Chrome Auto',
    criteria: { player: 'Juan Soto', year: '2018', set: 'Topps Chrome Auto', grade: 'BGS 9.5', gradingCompany: 'BGS', maxPrice: 2000, targetROI: 28, urgency: 'medium', platforms: ['eBay', 'Goldin'] },
    status: 'active', createdAt: '2026-02-25T09:30:00Z', updatedAt: '2026-03-13T13:15:00Z',
    listingsFound: 5, negotiationsActive: 1, negotiationsCompleted: 1, acquisitions: 0,
    totalSpent: 0, totalSaved: 0, estimatedFMV: 0, progressPct: 20,
  },
  {
    id: 'camp-008', name: 'Tatis Jr. Heritage RC',
    criteria: { player: 'Fernando Tatis Jr.', year: '2019', set: 'Topps Heritage', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 300, targetROI: 15, urgency: 'low', platforms: ['eBay', 'COMC'] },
    status: 'completed', createdAt: '2025-12-10T08:00:00Z', updatedAt: '2026-01-20T14:00:00Z',
    listingsFound: 15, negotiationsActive: 0, negotiationsCompleted: 7, acquisitions: 4,
    totalSpent: 960, totalSaved: 440, estimatedFMV: 1400, progressPct: 100,
  },
  {
    id: 'camp-009', name: 'Acuna Optic Rated RC',
    criteria: { player: 'Ronald Acuna Jr.', year: '2018', set: 'Donruss Optic Rated Rookie', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 250, targetROI: 20, urgency: 'medium', platforms: ['eBay', 'MySlabs', 'Facebook Groups'] },
    status: 'active', createdAt: '2026-03-08T07:00:00Z', updatedAt: '2026-03-13T11:30:00Z',
    listingsFound: 9, negotiationsActive: 2, negotiationsCompleted: 1, acquisitions: 0,
    totalSpent: 0, totalSaved: 0, estimatedFMV: 0, progressPct: 15,
  },
  {
    id: 'camp-010', name: 'Mahomes Prizm Silver',
    criteria: { player: 'Patrick Mahomes', year: '2017', set: 'Prizm Silver', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 8000, targetROI: 15, urgency: 'medium', platforms: ['eBay', 'Goldin', 'Alt'] },
    status: 'pending_review', createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-13T09:00:00Z',
    listingsFound: 3, negotiationsActive: 1, negotiationsCompleted: 0, acquisitions: 0,
    totalSpent: 0, totalSaved: 0, estimatedFMV: 0, progressPct: 8,
  },
  {
    id: 'camp-011', name: 'Luka Doncic Select RC',
    criteria: { player: 'Luka Doncic', year: '2018', set: 'Select', grade: 'PSA 10', gradingCompany: 'PSA', maxPrice: 1500, targetROI: 25, urgency: 'high', platforms: ['eBay', 'StockX', 'COMC'] },
    status: 'failed', createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-02-15T12:00:00Z',
    listingsFound: 4, negotiationsActive: 0, negotiationsCompleted: 3, acquisitions: 0,
    totalSpent: 0, totalSaved: 0, estimatedFMV: 0, progressPct: 0,
  },
];

const MOCK_NEGOTIATIONS: NegotiationSession[] = [
  {
    id: 'neg-001', campaignId: 'camp-001', sellerId: 'seller-001', sellerName: 'CardKing2024', platform: 'eBay',
    listingTitle: '2018 Bowman Chrome Shohei Ohtani RC PSA 10 #1 Gem Mint', listingPrice: 899,
    currentOffer: 780, stage: 'counter', startedAt: '2026-03-11T14:00:00Z', updatedAt: '2026-03-13T10:30:00Z',
    rounds: 3, openingOffer: 720, estimatedFMV: 850, targetPrice: 750, messages: [
      { id: 'msg-001', timestamp: '2026-03-11T14:00:00Z', sender: 'agent', message: 'Hi, I\'m interested in your Ohtani Bowman Chrome PSA 10. Would you consider $720?', amount: 720, strategyAnnotation: 'Opening at 80% of ask — seller has 73% acceptance rate on first counters, typically settles at 85-90% of listing.' },
      { id: 'msg-002', timestamp: '2026-03-11T16:30:00Z', sender: 'seller', message: 'Thanks for the interest. I can do $850, that\'s my best price.', amount: 850 },
      { id: 'msg-003', timestamp: '2026-03-11T17:00:00Z', sender: 'agent', message: 'I appreciate the response. Recent comps show PSA 10s averaging $810-830 range. Would $760 work?', amount: 760, strategyAnnotation: 'Anchoring with comp data. Seller counter was aggressive (94% of ask), so we move up only 5.5% to show restraint.' },
      { id: 'msg-004', timestamp: '2026-03-12T09:00:00Z', sender: 'seller', message: 'I see your point on comps. Meet in the middle at $800?', amount: 800 },
      { id: 'msg-005', timestamp: '2026-03-12T09:30:00Z', sender: 'agent', message: 'Getting closer! I can go to $780 — that\'s strong for current market. Can ship payment today.', amount: 780, strategyAnnotation: 'Urgency close + payment speed incentive. Seller typically accepts within 2 rounds of this tactic.' },
    ],
  },
  {
    id: 'neg-002', campaignId: 'camp-002', sellerId: 'seller-002', sellerName: 'WembyWorld', platform: 'eBay',
    listingTitle: '2023 Prizm Victor Wembanyama RC BGS 9.5 Silver Prizm', listingPrice: 1150,
    currentOffer: 980, stage: 'accepted', startedAt: '2026-03-08T10:00:00Z', updatedAt: '2026-03-10T14:00:00Z',
    rounds: 4, openingOffer: 880, estimatedFMV: 1100, targetPrice: 950, finalPrice: 980, savings: 170, messages: [
      { id: 'msg-010', timestamp: '2026-03-08T10:00:00Z', sender: 'agent', message: 'Great card! Would you take $880 for the Wemby Prizm Silver BGS 9.5?', amount: 880, strategyAnnotation: 'Opening at 76.5% of ask. Seller is new with low volume — may be eager to sell.' },
      { id: 'msg-011', timestamp: '2026-03-08T18:00:00Z', sender: 'seller', message: 'That\'s too low for me. Best I can do is $1100.', amount: 1100 },
      { id: 'msg-012', timestamp: '2026-03-09T08:00:00Z', sender: 'agent', message: 'I understand your position. Looking at recent sales, BGS 9.5 Silvers have been moving at $1000-1050. How about $940?', amount: 940, strategyAnnotation: 'Comp-based counter. Moving up $60 (6.8%) to show good faith while staying below target.' },
      { id: 'msg-013', timestamp: '2026-03-09T12:00:00Z', sender: 'seller', message: 'Hmm, I could go $1020.', amount: 1020 },
      { id: 'msg-014', timestamp: '2026-03-09T12:30:00Z', sender: 'agent', message: 'Let me do $980 and I\'ll pay immediately via PayPal goods & services. Clean transaction.', amount: 980, strategyAnnotation: 'Final offer positioning with immediate payment incentive. Gap is now only $40 — most sellers close here.' },
      { id: 'msg-015', timestamp: '2026-03-10T14:00:00Z', sender: 'seller', message: 'Deal. Sending invoice now.', amount: 980 },
    ],
  },
  {
    id: 'neg-003', campaignId: 'camp-001', sellerId: 'seller-003', sellerName: 'PremiumSlabs', platform: 'COMC',
    listingTitle: '2018 Bowman Chrome Ohtani #1 PSA 10 Gem Mint', listingPrice: 920,
    currentOffer: 800, stage: 'accepted', startedAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-07T16:00:00Z',
    rounds: 2, openingOffer: 770, estimatedFMV: 850, targetPrice: 790, finalPrice: 800, savings: 120, messages: [
      { id: 'msg-020', timestamp: '2026-03-05T09:00:00Z', sender: 'agent', message: 'Interested in the Ohtani PSA 10. Can you do $770?', amount: 770, strategyAnnotation: 'Aggressive open — COMC sellers tend to accept quicker, avg 2.1 rounds.' },
      { id: 'msg-021', timestamp: '2026-03-06T11:00:00Z', sender: 'seller', message: 'I can do $820.', amount: 820 },
      { id: 'msg-022', timestamp: '2026-03-06T11:15:00Z', sender: 'agent', message: 'Split the difference at $800?', amount: 800, strategyAnnotation: 'Classic split — seller discount tendency is 12-15%, this is 13%. High confidence of acceptance.' },
      { id: 'msg-023', timestamp: '2026-03-07T16:00:00Z', sender: 'seller', message: 'Works for me. Accepted.', amount: 800 },
    ],
  },
  {
    id: 'neg-004', campaignId: 'camp-006', sellerId: 'seller-004', sellerName: 'YankeeCards99', platform: 'eBay',
    listingTitle: '2017 Topps Chrome Aaron Judge RC PSA 10 Rookie #169', listingPrice: 520,
    currentOffer: 450, stage: 'final_offer', startedAt: '2026-03-12T08:00:00Z', updatedAt: '2026-03-13T11:00:00Z',
    rounds: 3, openingOffer: 400, estimatedFMV: 500, targetPrice: 440, messages: [
      { id: 'msg-030', timestamp: '2026-03-12T08:00:00Z', sender: 'agent', message: 'Would you accept $400 for the Judge Chrome PSA 10?', amount: 400, strategyAnnotation: 'Opening at 77% of ask. Seller has moderate negotiation tolerance.' },
      { id: 'msg-031', timestamp: '2026-03-12T14:00:00Z', sender: 'seller', message: 'No, but I could do $490.', amount: 490 },
      { id: 'msg-032', timestamp: '2026-03-12T14:30:00Z', sender: 'agent', message: 'Recent PSA 10 comps showing $460-480 range. Would $430 work?', amount: 430, strategyAnnotation: 'Comp anchoring with conservative move up. Testing seller flexibility.' },
      { id: 'msg-033', timestamp: '2026-03-13T09:00:00Z', sender: 'seller', message: 'Meet me at $470 and it\'s yours.', amount: 470 },
      { id: 'msg-034', timestamp: '2026-03-13T11:00:00Z', sender: 'agent', message: 'Final offer: $450 with immediate payment. That\'s a fair deal for both sides.', amount: 450, strategyAnnotation: 'Final offer with payment urgency. 86.5% of ask — within seller\'s typical acceptance threshold.' },
    ],
  },
  {
    id: 'neg-005', campaignId: 'camp-002', sellerId: 'seller-005', sellerName: 'NextGenHoops', platform: 'StockX',
    listingTitle: '2023 Prizm Wembanyama BGS 9.5 Base RC', listingPrice: 890,
    currentOffer: 750, stage: 'rejected', startedAt: '2026-03-09T07:00:00Z', updatedAt: '2026-03-11T10:00:00Z',
    rounds: 3, openingOffer: 680, estimatedFMV: 820, targetPrice: 720, messages: [
      { id: 'msg-040', timestamp: '2026-03-09T07:00:00Z', sender: 'agent', message: 'Offering $680 for the Wemby Base BGS 9.5.', amount: 680, strategyAnnotation: 'Opening at 76% — StockX sellers tend to be firmer on price.' },
      { id: 'msg-041', timestamp: '2026-03-09T20:00:00Z', sender: 'seller', message: 'Need at least $860.', amount: 860 },
      { id: 'msg-042', timestamp: '2026-03-10T08:00:00Z', sender: 'agent', message: 'Market moving fast on Wemby. $720 is competitive — recent base 9.5s going for $780-800.', amount: 720, strategyAnnotation: 'Moderate increase. Seller is firm — may need to walk.' },
      { id: 'msg-043', timestamp: '2026-03-10T18:00:00Z', sender: 'seller', message: '$840 firm. Not going lower.', amount: 840 },
      { id: 'msg-044', timestamp: '2026-03-11T08:00:00Z', sender: 'agent', message: 'Best I can do is $750. Let me know if you change your mind.', amount: 750, strategyAnnotation: 'Walking away — $840 exceeds target ROI threshold. Leave door open for seller comeback.' },
      { id: 'msg-045', timestamp: '2026-03-11T10:00:00Z', sender: 'seller', message: 'Sorry, too low. Good luck.', amount: undefined },
    ],
  },
  {
    id: 'neg-006', campaignId: 'camp-004', sellerId: 'seller-006', sellerName: 'TroutCollector', platform: 'Goldin',
    listingTitle: '2011 Topps Update Mike Trout RC #US175 PSA 10', listingPrice: 3800,
    currentOffer: 3200, stage: 'opening', startedAt: '2026-03-13T08:00:00Z', updatedAt: '2026-03-13T08:00:00Z',
    rounds: 1, openingOffer: 3200, estimatedFMV: 3600, targetPrice: 3300, messages: [
      { id: 'msg-050', timestamp: '2026-03-13T08:00:00Z', sender: 'agent', message: 'Incredible card. Would you consider $3,200 for the Trout Update PSA 10?', amount: 3200, strategyAnnotation: 'Opening at 84% of ask — high-value card requires more respectful opening to maintain seller engagement.' },
    ],
  },
  {
    id: 'neg-007', campaignId: 'camp-009', sellerId: 'seller-007', sellerName: 'BravesNation', platform: 'Facebook Groups',
    listingTitle: '2018 Donruss Optic Rated Rookie Ronald Acuna Jr. PSA 10', listingPrice: 280,
    currentOffer: 220, stage: 'counter', startedAt: '2026-03-12T15:00:00Z', updatedAt: '2026-03-13T09:30:00Z',
    rounds: 2, openingOffer: 210, estimatedFMV: 260, targetPrice: 230, messages: [
      { id: 'msg-060', timestamp: '2026-03-12T15:00:00Z', sender: 'agent', message: 'Hey! Love the Acuna Optic PSA 10. Would you take $210?', amount: 210, strategyAnnotation: 'FB Group sellers respond to casual tone. Opening at 75% of ask.' },
      { id: 'msg-061', timestamp: '2026-03-12T19:00:00Z', sender: 'seller', message: 'Appreciate it! Lowest I can go is $260', amount: 260 },
      { id: 'msg-062', timestamp: '2026-03-13T09:30:00Z', sender: 'agent', message: 'Totally get it. Could you do $220 shipped? I\'ll cover G&S fees.', amount: 220, strategyAnnotation: 'Offering to cover fees is a strong FB Group incentive — effectively adds $8-10 to perceived value.' },
    ],
  },
];

const MOCK_SELLERS: SellerProfile[] = [
  { id: 'seller-001', name: 'CardKing2024', platform: 'eBay', totalListings: 342, avgResponseTime: 2.5, acceptanceRate: 73, avgNegotiationRounds: 3.2, avgDiscountPct: 12, reputationScore: 92, preferredPaymentMethods: ['PayPal', 'eBay Managed'], lastActiveAt: '2026-03-13T10:30:00Z', behaviorNotes: ['Responds quickly during business hours', 'Tends to counter once then accept split', 'More flexible on cards listed 14+ days'] },
  { id: 'seller-002', name: 'WembyWorld', platform: 'eBay', totalListings: 28, avgResponseTime: 8, acceptanceRate: 60, avgNegotiationRounds: 3.8, avgDiscountPct: 15, reputationScore: 78, preferredPaymentMethods: ['PayPal'], lastActiveAt: '2026-03-10T14:00:00Z', behaviorNotes: ['New seller, may overvalue cards', 'Responds to payment speed incentives', 'Weekend seller — slower weekday responses'] },
  { id: 'seller-003', name: 'PremiumSlabs', platform: 'COMC', totalListings: 1250, avgResponseTime: 1.5, acceptanceRate: 82, avgNegotiationRounds: 2.1, avgDiscountPct: 10, reputationScore: 96, preferredPaymentMethods: ['COMC Credit', 'PayPal'], lastActiveAt: '2026-03-07T16:00:00Z', behaviorNotes: ['High-volume seller, prefers quick deals', 'Rarely negotiates more than 2 rounds', 'Offers bulk discounts on 3+ cards'] },
  { id: 'seller-004', name: 'YankeeCards99', platform: 'eBay', totalListings: 156, avgResponseTime: 6, acceptanceRate: 68, avgNegotiationRounds: 3.5, avgDiscountPct: 11, reputationScore: 88, preferredPaymentMethods: ['PayPal', 'Venmo'], lastActiveAt: '2026-03-13T11:00:00Z', behaviorNotes: ['Yankees specialist — knows market well', 'Firm on high-demand cards', 'More flexible on slower inventory'] },
  { id: 'seller-005', name: 'NextGenHoops', platform: 'StockX', totalListings: 89, avgResponseTime: 12, acceptanceRate: 45, avgNegotiationRounds: 2.5, avgDiscountPct: 5, reputationScore: 80, preferredPaymentMethods: ['StockX'], lastActiveAt: '2026-03-11T10:00:00Z', behaviorNotes: ['Very firm on prices', 'Prefers platform-based transactions', 'Will walk if spread exceeds 10%'] },
  { id: 'seller-006', name: 'TroutCollector', platform: 'Goldin', totalListings: 45, avgResponseTime: 4, acceptanceRate: 55, avgNegotiationRounds: 4.0, avgDiscountPct: 8, reputationScore: 94, preferredPaymentMethods: ['Wire', 'PayPal'], lastActiveAt: '2026-03-13T08:00:00Z', behaviorNotes: ['Knowledgeable collector, not a flipper', 'Emotional attachment to high-end cards', 'Responds well to provenance discussions'] },
  { id: 'seller-007', name: 'BravesNation', platform: 'Facebook Groups', totalListings: 67, avgResponseTime: 3, acceptanceRate: 78, avgNegotiationRounds: 2.8, avgDiscountPct: 14, reputationScore: 85, preferredPaymentMethods: ['PayPal G&S', 'Venmo'], lastActiveAt: '2026-03-13T09:30:00Z', behaviorNotes: ['Active FB group member', 'Team collector — easier to negotiate non-Braves', 'Responds to fee coverage offers'] },
];

const MOCK_ESCROW: EscrowTransaction[] = [
  {
    id: 'esc-001', negotiationId: 'neg-002', campaignId: 'camp-002', cardDescription: '2023 Prizm Wembanyama BGS 9.5 Silver',
    amount: 980, state: 'authentication_in_progress', createdAt: '2026-03-10T15:00:00Z', updatedAt: '2026-03-13T10:00:00Z',
    sellerName: 'WembyWorld', platform: 'eBay', trackingNumber: '1Z999AA10123456784',
    authenticationProvider: 'PSA/DNA', estimatedCompletion: '2026-03-16T12:00:00Z',
    events: [
      { timestamp: '2026-03-10T15:00:00Z', event: 'Payment Initiated', detail: 'Buyer payment of $980 received and held in escrow.' },
      { timestamp: '2026-03-10T15:05:00Z', event: 'Payment Confirmed', detail: 'Funds verified and locked. Seller notified to ship.' },
      { timestamp: '2026-03-11T09:00:00Z', event: 'Item Shipped', detail: 'Tracking: 1Z999AA10123456784 — UPS Ground' },
      { timestamp: '2026-03-12T14:00:00Z', event: 'Item Received', detail: 'Package received at authentication center.' },
      { timestamp: '2026-03-13T10:00:00Z', event: 'Authentication Started', detail: 'Card submitted to PSA/DNA for verification. ETA 3 days.' },
    ],
  },
  {
    id: 'esc-002', negotiationId: 'neg-003', campaignId: 'camp-001', cardDescription: '2018 Bowman Chrome Ohtani PSA 10',
    amount: 800, state: 'funds_released', createdAt: '2026-03-07T17:00:00Z', updatedAt: '2026-03-12T11:00:00Z',
    sellerName: 'PremiumSlabs', platform: 'COMC', trackingNumber: '9400111899223100001234',
    authenticationProvider: 'PSA/DNA', authenticationResult: 'Verified Authentic', estimatedCompletion: '2026-03-12T11:00:00Z',
    events: [
      { timestamp: '2026-03-07T17:00:00Z', event: 'Payment Initiated', detail: 'Buyer payment of $800 received and held.' },
      { timestamp: '2026-03-08T10:00:00Z', event: 'Item Shipped', detail: 'Tracking: 9400111899223100001234 — USPS Priority' },
      { timestamp: '2026-03-09T15:00:00Z', event: 'Item Received', detail: 'Package received at authentication center.' },
      { timestamp: '2026-03-10T09:00:00Z', event: 'Authentication Passed', detail: 'PSA/DNA verified authentic. Card matches listing.' },
      { timestamp: '2026-03-12T11:00:00Z', event: 'Funds Released', detail: '$800 released to seller. Transaction complete.' },
    ],
  },
  {
    id: 'esc-003', negotiationId: 'neg-004', campaignId: 'camp-006', cardDescription: '2017 Topps Chrome Judge PSA 10',
    amount: 450, state: 'pending_payment', createdAt: '2026-03-13T12:00:00Z', updatedAt: '2026-03-13T12:00:00Z',
    sellerName: 'YankeeCards99', platform: 'eBay',
    events: [
      { timestamp: '2026-03-13T12:00:00Z', event: 'Escrow Created', detail: 'Awaiting buyer payment of $450 to initiate escrow.' },
    ],
  },
];

const MOCK_RESULTS: AcquisitionResult[] = [
  { id: 'acq-001', campaignId: 'camp-001', cardDescription: '2018 Bowman Chrome Ohtani #1 PSA 10', player: 'Shohei Ohtani', grade: 'PSA 10', platform: 'COMC', listingPrice: 920, acquiredPrice: 800, estimatedFMV: 850, savings: 120, savingsPct: 13.0, roi: 6.3, acquiredAt: '2026-03-07T16:00:00Z', sellerName: 'PremiumSlabs', negotiationRounds: 2, timeToAcquire: 55 },
  { id: 'acq-002', campaignId: 'camp-001', cardDescription: '2018 Bowman Chrome Ohtani #1 PSA 10 Refractor', player: 'Shohei Ohtani', grade: 'PSA 10', platform: 'eBay', listingPrice: 1100, acquiredPrice: 920, estimatedFMV: 1050, savings: 180, savingsPct: 16.4, roi: 14.1, acquiredAt: '2026-03-02T14:00:00Z', sellerName: 'SlabCity', negotiationRounds: 4, timeToAcquire: 72 },
  { id: 'acq-003', campaignId: 'camp-002', cardDescription: '2023 Prizm Wembanyama BGS 9.5 Base', player: 'Victor Wembanyama', grade: 'BGS 9.5', platform: 'eBay', listingPrice: 780, acquiredPrice: 650, estimatedFMV: 720, savings: 130, savingsPct: 16.7, roi: 10.8, acquiredAt: '2026-03-04T10:00:00Z', sellerName: 'HoopsVault', negotiationRounds: 3, timeToAcquire: 48 },
  { id: 'acq-004', campaignId: 'camp-002', cardDescription: '2023 Prizm Wembanyama BGS 9.5 Silver', player: 'Victor Wembanyama', grade: 'BGS 9.5', platform: 'eBay', listingPrice: 1150, acquiredPrice: 980, estimatedFMV: 1100, savings: 170, savingsPct: 14.8, roi: 12.2, acquiredAt: '2026-03-10T14:00:00Z', sellerName: 'WembyWorld', negotiationRounds: 4, timeToAcquire: 52 },
  { id: 'acq-005', campaignId: 'camp-002', cardDescription: '2023 Prizm Wembanyama BGS 9.5 Red Wave', player: 'Victor Wembanyama', grade: 'BGS 9.5', platform: 'Goldin', listingPrice: 1500, acquiredPrice: 1220, estimatedFMV: 1380, savings: 280, savingsPct: 18.7, roi: 13.1, acquiredAt: '2026-02-28T09:00:00Z', sellerName: 'EliteBreaks', negotiationRounds: 5, timeToAcquire: 96 },
  { id: 'acq-006', campaignId: 'camp-003', cardDescription: '1993 SP Derek Jeter RC PSA 9', player: 'Derek Jeter', grade: 'PSA 9', platform: 'eBay', listingPrice: 580, acquiredPrice: 480, estimatedFMV: 550, savings: 100, savingsPct: 17.2, roi: 14.6, acquiredAt: '2026-02-10T11:00:00Z', sellerName: 'VintageGems', negotiationRounds: 3, timeToAcquire: 62 },
  { id: 'acq-007', campaignId: 'camp-003', cardDescription: '1993 SP Derek Jeter RC PSA 9 Foil', player: 'Derek Jeter', grade: 'PSA 9', platform: 'COMC', listingPrice: 620, acquiredPrice: 500, estimatedFMV: 580, savings: 120, savingsPct: 19.4, roi: 16.0, acquiredAt: '2026-02-25T16:00:00Z', sellerName: 'RetroCards', negotiationRounds: 2, timeToAcquire: 30 },
  { id: 'acq-008', campaignId: 'camp-005', cardDescription: '1989 Upper Deck Ken Griffey Jr. RC PSA 9', player: 'Ken Griffey Jr.', grade: 'PSA 9', platform: 'Facebook Groups', listingPrice: 350, acquiredPrice: 280, estimatedFMV: 330, savings: 70, savingsPct: 20.0, roi: 17.9, acquiredAt: '2026-01-28T13:00:00Z', sellerName: 'OldSchoolWax', negotiationRounds: 2, timeToAcquire: 24 },
  { id: 'acq-009', campaignId: 'camp-005', cardDescription: '1989 Upper Deck Griffey Jr. RC PSA 8', player: 'Ken Griffey Jr.', grade: 'PSA 8', platform: 'eBay', listingPrice: 220, acquiredPrice: 175, estimatedFMV: 200, savings: 45, savingsPct: 20.5, roi: 14.3, acquiredAt: '2026-02-05T09:00:00Z', sellerName: 'CardBarn', negotiationRounds: 3, timeToAcquire: 40 },
  { id: 'acq-010', campaignId: 'camp-006', cardDescription: '2017 Topps Chrome Aaron Judge RC PSA 10', player: 'Aaron Judge', grade: 'PSA 10', platform: 'MySlabs', listingPrice: 480, acquiredPrice: 420, estimatedFMV: 470, savings: 60, savingsPct: 12.5, roi: 11.9, acquiredAt: '2026-03-09T17:00:00Z', sellerName: 'SlabDeals', negotiationRounds: 2, timeToAcquire: 18 },
  { id: 'acq-011', campaignId: 'camp-008', cardDescription: '2019 Topps Heritage Tatis Jr. RC PSA 10', player: 'Fernando Tatis Jr.', grade: 'PSA 10', platform: 'eBay', listingPrice: 280, acquiredPrice: 225, estimatedFMV: 260, savings: 55, savingsPct: 19.6, roi: 15.6, acquiredAt: '2026-01-08T10:00:00Z', sellerName: 'PadresFan', negotiationRounds: 3, timeToAcquire: 36 },
  { id: 'acq-012', campaignId: 'camp-008', cardDescription: '2019 Topps Heritage Tatis Jr. RC PSA 10 Action SP', player: 'Fernando Tatis Jr.', grade: 'PSA 10', platform: 'COMC', listingPrice: 320, acquiredPrice: 260, estimatedFMV: 300, savings: 60, savingsPct: 18.8, roi: 15.4, acquiredAt: '2026-01-15T14:00:00Z', sellerName: 'SPHunter', negotiationRounds: 2, timeToAcquire: 28 },
  { id: 'acq-013', campaignId: 'camp-005', cardDescription: '1989 Upper Deck Griffey Jr. RC PSA 9 Star Rookie', player: 'Ken Griffey Jr.', grade: 'PSA 9', platform: 'eBay', listingPrice: 400, acquiredPrice: 325, estimatedFMV: 370, savings: 75, savingsPct: 18.8, roi: 13.8, acquiredAt: '2026-02-18T11:00:00Z', sellerName: 'WaxNostalgia', negotiationRounds: 4, timeToAcquire: 58 },
  { id: 'acq-014', campaignId: 'camp-008', cardDescription: '2019 Topps Heritage Tatis Jr. Clubhouse SP PSA 10', player: 'Fernando Tatis Jr.', grade: 'PSA 10', platform: 'eBay', listingPrice: 350, acquiredPrice: 285, estimatedFMV: 330, savings: 65, savingsPct: 18.6, roi: 15.8, acquiredAt: '2026-01-18T09:00:00Z', sellerName: 'DiamondDeals', negotiationRounds: 3, timeToAcquire: 44 },
  { id: 'acq-015', campaignId: 'camp-008', cardDescription: '2019 Topps Heritage Tatis Jr. RC PSA 9', player: 'Fernando Tatis Jr.', grade: 'PSA 9', platform: 'Facebook Groups', listingPrice: 190, acquiredPrice: 150, estimatedFMV: 175, savings: 40, savingsPct: 21.1, roi: 16.7, acquiredAt: '2026-01-12T16:00:00Z', sellerName: 'GroupPulls', negotiationRounds: 1, timeToAcquire: 6 },
];

const MOCK_ACTIVITY: AgentActivity[] = [
  { id: 'act-001', timestamp: '2026-03-13T16:02:00Z', campaignId: 'camp-002', campaignName: 'Wembanyama Prizm RC Collection', actionType: 'scan', message: 'Scanning eBay for Wembanyama Prizm BGS 9.5 listings...', platform: 'eBay' },
  { id: 'act-002', timestamp: '2026-03-13T16:01:00Z', campaignId: 'camp-002', campaignName: 'Wembanyama Prizm RC Collection', actionType: 'found', message: 'Found 3 new listings matching criteria on eBay. Best price: $1,050.', platform: 'eBay', amount: 1050 },
  { id: 'act-003', timestamp: '2026-03-13T15:55:00Z', campaignId: 'camp-001', campaignName: 'Ohtani Bowman Chrome Hunt', actionType: 'counter_sent', message: 'Sent counter-offer of $780 to CardKing2024 for Ohtani PSA 10.', platform: 'eBay', amount: 780 },
  { id: 'act-004', timestamp: '2026-03-13T15:45:00Z', campaignId: 'camp-006', campaignName: 'Judge Rookie Blitz', actionType: 'offer', message: 'Initiated final offer of $450 to YankeeCards99 for Judge Chrome PSA 10.', platform: 'eBay', amount: 450 },
  { id: 'act-005', timestamp: '2026-03-13T15:30:00Z', campaignId: 'camp-009', campaignName: 'Acuna Optic Rated RC', actionType: 'counter_received', message: 'BravesNation countered at $260 for Acuna Optic PSA 10. Evaluating response...', platform: 'Facebook Groups', amount: 260 },
  { id: 'act-006', timestamp: '2026-03-13T15:15:00Z', campaignId: 'camp-004', campaignName: 'Trout Update Chrome Autos', actionType: 'offer', message: 'Sent opening offer of $3,200 to TroutCollector for Trout Update PSA 10.', platform: 'Goldin', amount: 3200 },
  { id: 'act-007', timestamp: '2026-03-13T15:00:00Z', campaignId: 'camp-010', campaignName: 'Mahomes Prizm Silver', actionType: 'analyze', message: 'Analyzing seller profile for MahomesCards on Alt. Acceptance rate: 52%, avg discount: 9%.', platform: 'Alt' },
  { id: 'act-008', timestamp: '2026-03-13T14:45:00Z', campaignId: 'camp-002', campaignName: 'Wembanyama Prizm RC Collection', actionType: 'escrow', message: 'Escrow authentication in progress for Wemby Silver BGS 9.5. PSA/DNA verification ETA: 3 days.' },
  { id: 'act-009', timestamp: '2026-03-13T14:30:00Z', campaignId: 'camp-001', campaignName: 'Ohtani Bowman Chrome Hunt', actionType: 'scan', message: 'Scanning COMC for Ohtani Bowman Chrome PSA 10 listings...', platform: 'COMC' },
  { id: 'act-010', timestamp: '2026-03-13T14:15:00Z', campaignId: 'camp-007', campaignName: 'Soto Topps Chrome Auto', actionType: 'found', message: 'Found 1 new listing on Goldin for Soto Chrome Auto BGS 9.5 at $2,200.', platform: 'Goldin', amount: 2200 },
  { id: 'act-011', timestamp: '2026-03-13T14:00:00Z', campaignId: 'camp-006', campaignName: 'Judge Rookie Blitz', actionType: 'counter_received', message: 'YankeeCards99 countered at $470 for Judge Chrome PSA 10. Preparing final offer.', platform: 'eBay', amount: 470 },
  { id: 'act-012', timestamp: '2026-03-13T13:45:00Z', campaignId: 'camp-009', campaignName: 'Acuna Optic Rated RC', actionType: 'offer', message: 'Sent offer of $220 to BravesNation for Acuna Optic PSA 10 (covering G&S fees).', platform: 'Facebook Groups', amount: 220 },
  { id: 'act-013', timestamp: '2026-03-13T13:30:00Z', campaignId: 'camp-001', campaignName: 'Ohtani Bowman Chrome Hunt', actionType: 'completed', message: 'Escrow completed for Ohtani PSA 10 from PremiumSlabs. $800 released. Savings: $120.', amount: 800 },
  { id: 'act-014', timestamp: '2026-03-13T13:00:00Z', campaignId: 'camp-002', campaignName: 'Wembanyama Prizm RC Collection', actionType: 'scan', message: 'Scanning StockX for Wembanyama Prizm BGS 9.5 asks...', platform: 'StockX' },
  { id: 'act-015', timestamp: '2026-03-13T12:30:00Z', campaignId: 'camp-010', campaignName: 'Mahomes Prizm Silver', actionType: 'found', message: 'Found Mahomes Prizm Silver PSA 10 on Alt for $8,500. Above max — monitoring for price drop.', platform: 'Alt', amount: 8500 },
  { id: 'act-016', timestamp: '2026-03-13T12:00:00Z', campaignId: 'camp-004', campaignName: 'Trout Update Chrome Autos', actionType: 'scan', message: 'Scanning Goldin for Trout Update PSA 10 listings...', platform: 'Goldin' },
  { id: 'act-017', timestamp: '2026-03-13T11:30:00Z', campaignId: 'camp-011', campaignName: 'Luka Doncic Select RC', actionType: 'alert', message: 'Campaign failed — all 3 negotiations rejected. Market price exceeds max budget of $1,500.' },
  { id: 'act-018', timestamp: '2026-03-13T11:00:00Z', campaignId: 'camp-006', campaignName: 'Judge Rookie Blitz', actionType: 'accepted', message: 'SlabDeals accepted $420 for Judge Chrome PSA 10 on MySlabs! Savings: $60.', platform: 'MySlabs', amount: 420 },
];

// ── Service Functions ──────────────────────────────────────────────────────────

export function createCampaign(criteria: CampaignCriteria): AcquisitionCampaign {
  const id = `camp-${Date.now()}`;
  const campaign: AcquisitionCampaign = {
    id,
    name: `${criteria.player} ${criteria.set || ''} ${criteria.grade || ''}`.trim(),
    criteria,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    listingsFound: 0,
    negotiationsActive: 0,
    negotiationsCompleted: 0,
    acquisitions: 0,
    totalSpent: 0,
    totalSaved: 0,
    estimatedFMV: 0,
    progressPct: 0,
  };
  MOCK_CAMPAIGNS.push(campaign);
  return campaign;
}

export function getActiveCampaigns(): AcquisitionCampaign[] {
  return [...MOCK_CAMPAIGNS].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getCampaignResults(campaignId: string): {
  campaign: AcquisitionCampaign | undefined;
  negotiations: NegotiationSession[];
  acquisitions: AcquisitionResult[];
  escrow: EscrowTransaction[];
} {
  return {
    campaign: MOCK_CAMPAIGNS.find(c => c.id === campaignId),
    negotiations: MOCK_NEGOTIATIONS.filter(n => n.campaignId === campaignId),
    acquisitions: MOCK_RESULTS.filter(r => r.campaignId === campaignId),
    escrow: MOCK_ESCROW.filter(e => e.campaignId === campaignId),
  };
}

export function getAgentActivityFeed(): AgentActivity[] {
  return [...MOCK_ACTIVITY].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getNegotiationHistory(sessionId: string): NegotiationSession | undefined {
  return MOCK_NEGOTIATIONS.find(n => n.id === sessionId);
}

export function getAllNegotiations(): NegotiationSession[] {
  return [...MOCK_NEGOTIATIONS].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getSellerAnalysis(sellerId: string): SellerProfile | undefined {
  return MOCK_SELLERS.find(s => s.id === sellerId);
}

export function getAllSellers(): SellerProfile[] {
  return [...MOCK_SELLERS];
}

export function getEscrowStatus(transactionId: string): EscrowTransaction | undefined {
  return MOCK_ESCROW.find(e => e.id === transactionId);
}

export function getAllEscrow(): EscrowTransaction[] {
  return [...MOCK_ESCROW].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getAcquisitionAnalytics(): AcquisitionAnalytics {
  const results = MOCK_RESULTS;
  const totalSaved = results.reduce((sum, r) => sum + r.savings, 0);
  const totalSpent = results.reduce((sum, r) => sum + r.acquiredPrice, 0);
  const avgDiscount = results.length > 0 ? results.reduce((sum, r) => sum + r.savingsPct, 0) / results.length : 0;
  const avgRounds = results.length > 0 ? results.reduce((sum, r) => sum + r.negotiationRounds, 0) / results.length : 0;
  const avgTime = results.length > 0 ? results.reduce((sum, r) => sum + r.timeToAcquire, 0) / results.length : 0;
  const successfulNegs = MOCK_NEGOTIATIONS.filter(n => n.stage === 'accepted').length;
  const totalNegs = MOCK_NEGOTIATIONS.length;

  const bestDeal = results.reduce((best, r) => r.savingsPct > best.savingsPct ? r : best, results[0]);

  const platformMap = new Map<MarketplacePlatform, { count: number; discountSum: number }>();
  for (const r of results) {
    const entry = platformMap.get(r.platform) || { count: 0, discountSum: 0 };
    entry.count += 1;
    entry.discountSum += r.savingsPct;
    platformMap.set(r.platform, entry);
  }

  return {
    totalCampaigns: MOCK_CAMPAIGNS.length,
    activeCampaigns: MOCK_CAMPAIGNS.filter(c => c.status === 'active').length,
    completedCampaigns: MOCK_CAMPAIGNS.filter(c => c.status === 'completed').length,
    totalListingsScanned: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.listingsFound, 0),
    totalNegotiations: totalNegs,
    successfulAcquisitions: results.length,
    totalSpent,
    totalSaved,
    avgDiscountPct: Math.round(avgDiscount * 10) / 10,
    successRate: totalNegs > 0 ? Math.round((successfulNegs / totalNegs) * 100) : 0,
    avgNegotiationRounds: Math.round(avgRounds * 10) / 10,
    avgTimeToAcquire: Math.round(avgTime),
    bestDeal: {
      card: bestDeal?.cardDescription || '',
      savings: bestDeal?.savings || 0,
      savingsPct: bestDeal?.savingsPct || 0,
    },
    platformBreakdown: Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      acquisitions: data.count,
      avgDiscount: Math.round((data.discountSum / data.count) * 10) / 10,
    })),
    monthlySavings: [
      { month: 'Oct 2025', saved: 0, spent: 0 },
      { month: 'Nov 2025', saved: 0, spent: 0 },
      { month: 'Dec 2025', saved: 95, spent: 450 },
      { month: 'Jan 2026', saved: 520, spent: 2100 },
      { month: 'Feb 2026', saved: 575, spent: 2280 },
      { month: 'Mar 2026', saved: totalSaved - 1190, spent: totalSpent - 4830 },
    ],
  };
}

export function pauseCampaign(id: string): AcquisitionCampaign | undefined {
  const campaign = MOCK_CAMPAIGNS.find(c => c.id === id);
  if (campaign && campaign.status === 'active') {
    campaign.status = 'paused';
    campaign.updatedAt = new Date().toISOString();
  }
  return campaign;
}

export function resumeCampaign(id: string): AcquisitionCampaign | undefined {
  const campaign = MOCK_CAMPAIGNS.find(c => c.id === id);
  if (campaign && campaign.status === 'paused') {
    campaign.status = 'active';
    campaign.updatedAt = new Date().toISOString();
  }
  return campaign;
}

export function getSmartPricingRecommendation(listing: {
  price: number;
  player: string;
  grade: string;
  platform: MarketplacePlatform;
  sellerId?: string;
}): SmartPricingRecommendation {
  const playbook = getSelectedPlaybook();
  const seller = listing.sellerId ? MOCK_SELLERS.find(s => s.id === listing.sellerId) : undefined;
  const baseDiscount = seller ? seller.avgDiscountPct : 14;
  const discountPct = Math.min(42, Math.max(8, baseDiscount + playbook.targetDiscountAdjustPts));
  const openingPct = Math.min(0.88, Math.max(0.65, playbook.openingPctOfAsk));
  const targetPrice = Math.round(listing.price * (1 - discountPct / 100));
  const openingOffer = Math.round(listing.price * openingPct);

  const sellerTone =
    seller && seller.avgNegotiationRounds <= 2.5
      ? 'Quick-deal seller — favor decisive offers.'
      : 'Plan for several rounds; use comps to anchor.';

  return {
    openingOffer,
    targetPrice,
    maxPrice: listing.price,
    confidence: seller ? Math.min(95, 60 + seller.acceptanceRate * 0.3) : 68,
    reasoning: seller
      ? `${seller.name} has a ${seller.acceptanceRate}% acceptance rate with avg ${seller.avgDiscountPct}% discount over ${seller.avgNegotiationRounds} rounds. Playbook “${playbook.label}” opens at ~${Math.round(openingPct * 100)}% of ask; target settlement ~${100 - discountPct}% of list.`
      : `No seller history available. Playbook “${playbook.label}” suggests opening ~${Math.round(openingPct * 100)}% of ask and targeting ~${100 - discountPct}% of list.`,
    sellerLikelihood: seller ? seller.acceptanceRate : 65,
    suggestedStrategy: `[${playbook.label}] ${playbook.agentDirective} ${sellerTone} Cap active negotiation planning around ~${playbook.maxRoundsHint} rounds for this playbook.`,
    comparables: [
      { card: `${listing.player} ${listing.grade} — Comp 1`, soldPrice: Math.round(listing.price * 0.88), date: '2026-03-08' },
      { card: `${listing.player} ${listing.grade} — Comp 2`, soldPrice: Math.round(listing.price * 0.92), date: '2026-03-02' },
      { card: `${listing.player} ${listing.grade} — Comp 3`, soldPrice: Math.round(listing.price * 0.85), date: '2026-02-25' },
    ],
    playbookId: playbook.id,
    playbookLabel: playbook.label,
  };
}

export function getAllAcquisitionResults(): AcquisitionResult[] {
  return [...MOCK_RESULTS].sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime());
}
