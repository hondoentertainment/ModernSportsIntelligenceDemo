// Crowd-Sourced Price Discovery Service
// Community pricing for illiquid/ungraded cards where no marketplace comps exist.
// Members submit price estimates, system calculates consensus with confidence scoring.

// ---- Types ----

export type PriceRequestStatus = 'open' | 'voting' | 'consensus-reached' | 'expired' | 'disputed';

export type ConfidenceLevel = 'low' | 'moderate' | 'high' | 'very-high';

export type VoterExpertise = 'novice' | 'intermediate' | 'expert' | 'authority';

// ---- Interfaces ----

export interface PriceVote {
  id: string;
  voterHandle: string;
  expertise: VoterExpertise;
  estimatedPrice: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
  weight: number;
}

export interface PriceRequest {
  id: string;
  cardName: string;
  cardDescription: string;
  grade: string | null;
  photos: number;
  requestedBy: string;
  status: PriceRequestStatus;
  votes: PriceVote[];
  consensusPrice: number | null;
  confidenceLevel: ConfidenceLevel | null;
  priceRange: { low: number; high: number } | null;
  requestDate: string;
  closingDate: string;
  category: string;
  lastCompDate: string | null;
  lastCompPrice: number | null;
}

export interface TopPricer {
  handle: string;
  totalVotes: number;
  accuracyScore: number;
  avgDeviation: number;
  expertiseLevel: VoterExpertise;
  specialties: string[];
  reputation: number;
}

export interface CrowdPricingStats {
  totalRequests: number;
  activeRequests: number;
  consensusReached: number;
  avgVotesPerRequest: number;
  avgConfidence: number;
  topPricerAccuracy: number;
  requestsThisWeek: number;
  avgTimeToConsensus: string;
}

// ---- Data Functions ----

export function getPriceRequests(): PriceRequest[] {
  return [
    {
      id: 'pr-001',
      cardName: '1954 Bowman #66 Ted Williams (Venezuelan Issue)',
      cardDescription: 'Extremely rare Venezuelan reprint of the 1954 Bowman Ted Williams. Paper stock differs from US issue, slightly smaller dimensions. Back text in Spanish. Surface shows moderate handling wear with soft corners. No comps found on any major platform in last 18 months.',
      grade: null,
      photos: 6,
      requestedBy: 'vintagevault_mike',
      status: 'voting',
      votes: [
        { id: 'v-001a', voterHandle: 'pre_war_pete', expertise: 'authority', estimatedPrice: 4200, confidence: 72, reasoning: 'Venezuelan Bowmans from this era are extremely scarce. Only 3-4 confirmed examples exist. US version in similar condition sells $800-1200, so the rarity premium is substantial. I handled one at a show in 2019 that sold for $3,800.', timestamp: '2026-03-15T08:22:00Z', weight: 3.2 },
        { id: 'v-001b', voterHandle: 'tropicards_luis', expertise: 'expert', estimatedPrice: 3600, confidence: 65, reasoning: 'I specialize in Latin American baseball issues. Venezuelan Bowmans rarely surface. Condition matters less for these — collectors want them at any grade. $3,200-$4,000 is the right range based on private sales I know of.', timestamp: '2026-03-15T10:45:00Z', weight: 2.4 },
        { id: 'v-001c', voterHandle: 'card_appraiser_9', expertise: 'expert', estimatedPrice: 3100, confidence: 55, reasoning: 'Hard to price without recent comps. The Venezuelan premium over US issues varies wildly — from 2x to 10x depending on the player. Williams is a top-tier name which pushes it higher. Conservative estimate.', timestamp: '2026-03-15T14:30:00Z', weight: 2.4 },
        { id: 'v-001d', voterHandle: 'hobby_newcomer', expertise: 'novice', estimatedPrice: 1500, confidence: 30, reasoning: 'Looks similar to the US version which I see selling around $1,000. Maybe 50% premium for the foreign issue?', timestamp: '2026-03-16T06:10:00Z', weight: 0.8 },
        { id: 'v-001e', voterHandle: 'auction_analytics', expertise: 'intermediate', estimatedPrice: 3800, confidence: 60, reasoning: 'Cross-referencing Heritage Auctions and REA past results for Venezuelan issues in general. The multiplier for star players tends to be 3-5x. Placing this at $3,800 based on statistical modeling.', timestamp: '2026-03-16T09:55:00Z', weight: 1.6 },
      ],
      consensusPrice: null,
      confidenceLevel: null,
      priceRange: { low: 1500, high: 4200 },
      requestDate: '2026-03-14T18:00:00Z',
      closingDate: '2026-03-21T18:00:00Z',
      category: 'Foreign Issues',
      lastCompDate: null,
      lastCompPrice: null,
    },
    {
      id: 'pr-002',
      cardName: '1989 Fleer #616 Bill Ripken FF Error (Black Scribble Variation)',
      cardDescription: 'The infamous "F**k Face" bat knob error card — but this is the ultra-rare black scribble correction variant where Fleer attempted to obscure the text with a black marker. Much scarcer than the white-out or black box versions. Card is in near-mint condition with sharp corners.',
      grade: null,
      photos: 4,
      requestedBy: 'error_card_king',
      status: 'consensus-reached',
      votes: [
        { id: 'v-002a', voterHandle: 'junk_wax_oracle', expertise: 'authority', estimatedPrice: 450, confidence: 85, reasoning: 'I literally wrote the book on Fleer error variations. The black scribble is the 3rd rarest of the 12+ known variations. In NM condition, $400-$500 is spot on. I sold one last year for $475.', timestamp: '2026-03-10T11:00:00Z', weight: 3.2 },
        { id: 'v-002b', voterHandle: 'error_specialist', expertise: 'expert', estimatedPrice: 425, confidence: 80, reasoning: 'Black scribble variants in this condition are hard to find. The common FF version sells $50-80, but the scribble correction is 8-10x scarcer. $425 is a fair market number.', timestamp: '2026-03-10T14:22:00Z', weight: 2.4 },
        { id: 'v-002c', voterHandle: 'card_appraiser_9', expertise: 'expert', estimatedPrice: 500, confidence: 75, reasoning: 'Error card market has been hot. This specific variation has cult following. Slightly aggressive at $500 but justified by current demand.', timestamp: '2026-03-11T08:15:00Z', weight: 2.4 },
        { id: 'v-002d', voterHandle: 'market_watcher_22', expertise: 'intermediate', estimatedPrice: 380, confidence: 70, reasoning: 'Seen a few sell in Facebook groups for $350-$400 range. Adding a small premium for the condition described. $380 feels right.', timestamp: '2026-03-11T16:40:00Z', weight: 1.6 },
        { id: 'v-002e', voterHandle: 'collector_jane', expertise: 'intermediate', estimatedPrice: 475, confidence: 65, reasoning: 'Error cards are having a moment. This variation has strong demand from set collectors trying to complete all 12+ versions. $475.', timestamp: '2026-03-12T07:30:00Z', weight: 1.6 },
        { id: 'v-002f', voterHandle: 'hobby_newcomer', expertise: 'novice', estimatedPrice: 200, confidence: 25, reasoning: 'It is a junk wax era card so can not be worth that much?', timestamp: '2026-03-12T20:00:00Z', weight: 0.8 },
      ],
      consensusPrice: 438,
      confidenceLevel: 'high',
      priceRange: { low: 380, high: 500 },
      requestDate: '2026-03-09T12:00:00Z',
      closingDate: '2026-03-16T12:00:00Z',
      category: 'Error Cards',
      lastCompDate: '2025-09-14',
      lastCompPrice: 410,
    },
    {
      id: 'pr-003',
      cardName: '1972 Topps Uncut Sheet (Series 4) with Carlton RC',
      cardDescription: 'Complete uncut sheet from Series 4 of 1972 Topps baseball containing 132 cards including Steve Carlton\'s card #751. Sheet has been stored flat with minor edge wear. Some toning visible along left border. Provenance from a former Topps printing plant employee.',
      grade: null,
      photos: 8,
      requestedBy: 'sheet_collector_al',
      status: 'open',
      votes: [
        { id: 'v-003a', voterHandle: 'pre_war_pete', expertise: 'authority', estimatedPrice: 6500, confidence: 60, reasoning: 'Uncut sheets are notoriously hard to price. 1972 Topps high numbers are already scarce. Having Carlton in the sheet adds significant value. Condition concerns with the toning knock it down a bit.', timestamp: '2026-03-16T10:00:00Z', weight: 3.2 },
        { id: 'v-003b', voterHandle: 'auction_analytics', expertise: 'intermediate', estimatedPrice: 5200, confidence: 45, reasoning: 'Heritage sold a 1972 Topps Series 3 sheet for $4,800 in 2024. Series 4 high numbers should command a premium, but the toning is a concern. Splitting the difference.', timestamp: '2026-03-16T15:30:00Z', weight: 1.6 },
        { id: 'v-003c', voterHandle: 'collector_jane', expertise: 'intermediate', estimatedPrice: 7000, confidence: 40, reasoning: 'Uncut sheets with Hall of Famers have been trending up. The provenance story is a nice bonus for collectors. I think $7K is achievable at the right auction.', timestamp: '2026-03-17T08:00:00Z', weight: 1.6 },
      ],
      consensusPrice: null,
      confidenceLevel: null,
      priceRange: { low: 5200, high: 7000 },
      requestDate: '2026-03-15T20:00:00Z',
      closingDate: '2026-03-22T20:00:00Z',
      category: 'Oddball / Non-Standard',
      lastCompDate: '2024-11-02',
      lastCompPrice: 4800,
    },
    {
      id: 'pr-004',
      cardName: 'Lot of 47 Ungraded 1986-87 Fleer Basketball Commons',
      cardDescription: 'Mixed lot of 47 commons from the iconic 1986-87 Fleer Basketball set. No stars or rookies — strictly commons (players like Rory Sparrow, Terry Teagle, etc.). Conditions range from EX to NM. Includes duplicates. Trying to determine fair lot price for a bulk sale.',
      grade: null,
      photos: 3,
      requestedBy: 'bulk_mover_dan',
      status: 'consensus-reached',
      votes: [
        { id: 'v-004a', voterHandle: 'junk_wax_oracle', expertise: 'authority', estimatedPrice: 285, confidence: 90, reasoning: '86-87 Fleer commons in EX-NM range sell $4-$8 each depending on the specific card. With duplicates diluting the lot value, figure $5.50 avg x 47 = ~$260. Add a small set-builder premium and $285 is fair.', timestamp: '2026-03-08T09:00:00Z', weight: 3.2 },
        { id: 'v-004b', voterHandle: 'market_watcher_22', expertise: 'intermediate', estimatedPrice: 310, confidence: 78, reasoning: 'eBay recently sold lots show $6-$7 per common for this set. 47 cards at $6.50 avg = $305. Rounding up slightly for lot convenience.', timestamp: '2026-03-08T12:30:00Z', weight: 1.6 },
        { id: 'v-004c', voterHandle: 'error_specialist', expertise: 'expert', estimatedPrice: 260, confidence: 82, reasoning: 'Duplicates are a drag on lot value. Unique commons in this set fetch $6-$8, but dupes bring the per-card average down to $5 or less. $260 is my number.', timestamp: '2026-03-09T07:45:00Z', weight: 2.4 },
        { id: 'v-004d', voterHandle: 'tropicards_luis', expertise: 'expert', estimatedPrice: 295, confidence: 75, reasoning: 'Have bought and sold many lots like this. The 86-87 Fleer name carries weight even for commons. $280-$310 range, splitting at $295.', timestamp: '2026-03-09T16:20:00Z', weight: 2.4 },
      ],
      consensusPrice: 282,
      confidenceLevel: 'very-high',
      priceRange: { low: 260, high: 310 },
      requestDate: '2026-03-07T14:00:00Z',
      closingDate: '2026-03-14T14:00:00Z',
      category: 'Bulk Lots',
      lastCompDate: '2026-02-28',
      lastCompPrice: 275,
    },
    {
      id: 'pr-005',
      cardName: '2003-04 Topps Chrome LeBron James RC #111 — Possible Refractor (Disputed)',
      cardDescription: 'Seller claims this is a refractor variant but it lacks the "Refractor" stamp on the back that most Chrome refractors have. The front surface shows rainbow refraction when tilted. Could be a missing-stamp error refractor or just a base chrome with unusual light reflection. Need community input on identification and pricing.',
      grade: null,
      photos: 12,
      requestedBy: 'lebron_hunter_23',
      status: 'disputed',
      votes: [
        { id: 'v-005a', voterHandle: 'pre_war_pete', expertise: 'authority', estimatedPrice: 28000, confidence: 35, reasoning: 'If this is genuinely a refractor with a missing stamp, it is an error on one of the most valuable modern cards. That could make it MORE valuable than a standard refractor. But authentication is critical — I would need to see it in hand.', timestamp: '2026-03-13T11:00:00Z', weight: 3.2 },
        { id: 'v-005b', voterHandle: 'card_appraiser_9', expertise: 'expert', estimatedPrice: 4500, confidence: 50, reasoning: 'I have seen base Chrome cards that mimic refractor rainbow effects under certain lighting. Without the back stamp, this is most likely a base card. Base RC in raw NM condition = $4,000-$5,000.', timestamp: '2026-03-13T14:45:00Z', weight: 2.4 },
        { id: 'v-005c', voterHandle: 'error_specialist', expertise: 'expert', estimatedPrice: 15000, confidence: 30, reasoning: 'Missing-stamp refractors do exist in the Topps Chrome line. If BGS or PSA can confirm refractor status, this could be $25K+. At current uncertainty, I price the expected value at $15K (50% chance refractor, 50% base).', timestamp: '2026-03-14T09:20:00Z', weight: 2.4 },
        { id: 'v-005d', voterHandle: 'auction_analytics', expertise: 'intermediate', estimatedPrice: 5000, confidence: 45, reasoning: 'Too much uncertainty. Until graded and authenticated as a refractor, price it as a base card with a small speculative premium. $5,000 accounts for the upside option.', timestamp: '2026-03-14T18:00:00Z', weight: 1.6 },
        { id: 'v-005e', voterHandle: 'market_watcher_22', expertise: 'intermediate', estimatedPrice: 8500, confidence: 40, reasoning: 'The photos are compelling — that rainbow effect looks genuine to me. But I am not an expert on Chrome printing. Splitting between base and refractor value.', timestamp: '2026-03-15T07:30:00Z', weight: 1.6 },
        { id: 'v-005f', voterHandle: 'hobby_newcomer', expertise: 'novice', estimatedPrice: 25000, confidence: 20, reasoning: 'LeBron refractors are worth a fortune. If it is real this is a goldmine.', timestamp: '2026-03-15T21:00:00Z', weight: 0.8 },
      ],
      consensusPrice: null,
      confidenceLevel: 'low',
      priceRange: { low: 4500, high: 28000 },
      requestDate: '2026-03-12T10:00:00Z',
      closingDate: '2026-03-19T10:00:00Z',
      category: 'Authentication Dispute',
      lastCompDate: '2026-03-01',
      lastCompPrice: 4200,
    },
  ];
}

export function getTopPricers(): TopPricer[] {
  return [
    {
      handle: 'pre_war_pete',
      totalVotes: 1247,
      accuracyScore: 94.2,
      avgDeviation: 4.8,
      expertiseLevel: 'authority',
      specialties: ['Pre-War Cards', 'Vintage Baseball', 'Foreign Issues', 'Uncut Sheets'],
      reputation: 98,
    },
    {
      handle: 'junk_wax_oracle',
      totalVotes: 2083,
      accuracyScore: 91.7,
      avgDeviation: 6.1,
      expertiseLevel: 'authority',
      specialties: ['1980s-1990s Cards', 'Error Cards', 'Bulk Lots', 'Set Building'],
      reputation: 96,
    },
    {
      handle: 'tropicards_luis',
      totalVotes: 689,
      accuracyScore: 89.5,
      avgDeviation: 7.3,
      expertiseLevel: 'expert',
      specialties: ['Latin American Issues', 'International Cards', 'Venezuelan Baseball', 'Japanese Cards'],
      reputation: 93,
    },
    {
      handle: 'error_specialist',
      totalVotes: 912,
      accuracyScore: 88.1,
      avgDeviation: 8.0,
      expertiseLevel: 'expert',
      specialties: ['Error Cards', 'Print Variations', 'Missing Stamps', 'Double Prints'],
      reputation: 91,
    },
    {
      handle: 'card_appraiser_9',
      totalVotes: 1456,
      accuracyScore: 86.4,
      avgDeviation: 9.2,
      expertiseLevel: 'expert',
      specialties: ['Modern Cards', 'Chrome/Refractors', 'Basketball', 'Grading Consultation'],
      reputation: 89,
    },
  ];
}

export function getCrowdPricingStats(): CrowdPricingStats {
  return {
    totalRequests: 3842,
    activeRequests: 127,
    consensusReached: 3291,
    avgVotesPerRequest: 4.6,
    avgConfidence: 68.3,
    topPricerAccuracy: 94.2,
    requestsThisWeek: 34,
    avgTimeToConsensus: '3.2 days',
  };
}

export function getConfidenceColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'very-high': return '#10b981';
    case 'high': return '#3b82f6';
    case 'moderate': return '#f59e0b';
    case 'low': return '#ef4444';
  }
}

export function getRequestStatusColor(status: PriceRequestStatus): string {
  switch (status) {
    case 'open': return '#3b82f6';
    case 'voting': return '#a855f7';
    case 'consensus-reached': return '#10b981';
    case 'expired': return '#64748b';
    case 'disputed': return '#f59e0b';
  }
}

export function getExpertiseColor(level: VoterExpertise): string {
  switch (level) {
    case 'authority': return '#f59e0b';
    case 'expert': return '#a855f7';
    case 'intermediate': return '#3b82f6';
    case 'novice': return '#64748b';
  }
}
