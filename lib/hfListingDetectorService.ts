// High-Frequency Listing Detector Service — Phase 13
// Bot-driven listing pattern detection across marketplaces

export interface ListingPattern {
  id: string;
  patternName: string;
  venue: string;
  detectedAt: string;
  listingsPerMinute: number;
  avgDuration: number;
  category: string;
  suspicionScore: number;
  botProbability: number;
  status: 'active' | 'flagged' | 'confirmed-bot' | 'cleared';
}

export interface BotSignature {
  id: string;
  signatureName: string;
  description: string;
  frequency: string;
  timingPattern: string;
  identifiers: string[];
  detectionRate: number;
  falsePositiveRate: number;
  firstSeen: string;
  lastSeen: string;
}

export interface HFActivity {
  hour: string;
  normalListings: number;
  suspiciousListings: number;
  confirmedBots: number;
  totalVolume: number;
}

export interface DetectionAlert {
  id: string;
  alertType: 'new-pattern' | 'escalation' | 'confirmed' | 'volume-spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  venue: string;
  timestamp: string;
  patternId: string;
  acknowledged: boolean;
}

const MOCK_PATTERNS: ListingPattern[] = [
  { id: 'lp-1', patternName: 'Rapid-Fire Relister', venue: 'eBay', detectedAt: '2026-04-18T08:30:00Z', listingsPerMinute: 42, avgDuration: 1.2, category: 'Modern Basketball', suspicionScore: 95, botProbability: 92, status: 'confirmed-bot' },
  { id: 'lp-2', patternName: 'Price Oscillator', venue: 'eBay', detectedAt: '2026-04-18T07:15:00Z', listingsPerMinute: 18, avgDuration: 3.5, category: 'Football Prizm', suspicionScore: 88, botProbability: 85, status: 'flagged' },
  { id: 'lp-3', patternName: 'Snipe-and-Relist', venue: 'COMC', detectedAt: '2026-04-17T22:45:00Z', listingsPerMinute: 28, avgDuration: 0.8, category: 'Baseball Singles', suspicionScore: 91, botProbability: 88, status: 'confirmed-bot' },
  { id: 'lp-4', patternName: 'Spread Manipulator', venue: 'MySlabs', detectedAt: '2026-04-17T19:20:00Z', listingsPerMinute: 8, avgDuration: 5.2, category: 'Graded Basketball', suspicionScore: 72, botProbability: 65, status: 'flagged' },
  { id: 'lp-5', patternName: 'Volume Stuffer', venue: 'eBay', detectedAt: '2026-04-17T15:00:00Z', listingsPerMinute: 55, avgDuration: 0.5, category: 'Low-Value Singles', suspicionScore: 97, botProbability: 96, status: 'confirmed-bot' },
  { id: 'lp-6', patternName: 'Night Crawler', venue: 'eBay', detectedAt: '2026-04-17T03:30:00Z', listingsPerMinute: 35, avgDuration: 1.8, category: 'Mixed Categories', suspicionScore: 82, botProbability: 78, status: 'active' },
  { id: 'lp-7', patternName: 'Shill Bidder Pattern', venue: 'Goldin', detectedAt: '2026-04-16T20:00:00Z', listingsPerMinute: 5, avgDuration: 12.0, category: 'Premium Auctions', suspicionScore: 68, botProbability: 55, status: 'flagged' },
  { id: 'lp-8', patternName: 'Keyword Spammer', venue: 'eBay', detectedAt: '2026-04-16T14:15:00Z', listingsPerMinute: 62, avgDuration: 0.3, category: 'All Categories', suspicionScore: 99, botProbability: 98, status: 'confirmed-bot' },
  { id: 'lp-9', patternName: 'Micro-Arbitrageur', venue: 'PWCC', detectedAt: '2026-04-16T11:40:00Z', listingsPerMinute: 12, avgDuration: 2.1, category: 'Mid-Range Graded', suspicionScore: 78, botProbability: 72, status: 'active' },
  { id: 'lp-10', patternName: 'Template Duplicator', venue: 'eBay', detectedAt: '2026-04-15T09:00:00Z', listingsPerMinute: 48, avgDuration: 0.6, category: 'Modern Football', suspicionScore: 94, botProbability: 91, status: 'confirmed-bot' },
];

const MOCK_SIGNATURES: BotSignature[] = [
  { id: 'bs-1', signatureName: 'MetaBot v3.x', description: 'Mass relisting bot with predictable 1.2-second intervals between listings', frequency: 'Every 1.2s', timingPattern: 'Constant interval', identifiers: ['Exact timing intervals', 'Template descriptions', 'Sequential SKUs'], detectionRate: 94, falsePositiveRate: 3, firstSeen: '2025-08-15', lastSeen: '2026-04-18' },
  { id: 'bs-2', signatureName: 'PriceWatcher Pro', description: 'Automated price adjustment bot that monitors and undercuts competitor listings', frequency: 'Reactive (2-5s delay)', timingPattern: 'Event-driven', identifiers: ['Consistent undercut amounts', 'Price changes within seconds of competitor changes', 'Round number adjustments'], detectionRate: 87, falsePositiveRate: 8, firstSeen: '2025-11-02', lastSeen: '2026-04-17' },
  { id: 'bs-3', signatureName: 'BulkListr', description: 'High-volume listing tool creating 50+ listings per minute from templates', frequency: 'Burst (50+/min)', timingPattern: 'Burst then idle', identifiers: ['Identical description templates', 'Sequential photo timestamps', 'Bulk upload patterns'], detectionRate: 96, falsePositiveRate: 2, firstSeen: '2025-06-20', lastSeen: '2026-04-18' },
  { id: 'bs-4', signatureName: 'NightHawk', description: 'Off-hours automated listing bot operating between 2-5 AM local time', frequency: 'Every 1.8s', timingPattern: 'Overnight window', identifiers: ['2-5 AM activity', 'Zero human interaction patterns', 'Consistent geographic origin'], detectionRate: 82, falsePositiveRate: 12, firstSeen: '2026-01-10', lastSeen: '2026-04-17' },
  { id: 'bs-5', signatureName: 'ShillNet', description: 'Coordinated shill bidding network using multiple accounts', frequency: 'Variable', timingPattern: 'Auction-end clustering', identifiers: ['Linked IP addresses', 'Coordinated bid timing', 'Cross-account patterns'], detectionRate: 71, falsePositiveRate: 15, firstSeen: '2025-09-30', lastSeen: '2026-04-16' },
];

const MOCK_ACTIVITY: HFActivity[] = [
  { hour: '12 AM', normalListings: 420, suspiciousListings: 85, confirmedBots: 45, totalVolume: 550 },
  { hour: '2 AM', normalListings: 180, suspiciousListings: 120, confirmedBots: 95, totalVolume: 395 },
  { hour: '4 AM', normalListings: 150, suspiciousListings: 145, confirmedBots: 110, totalVolume: 405 },
  { hour: '6 AM', normalListings: 380, suspiciousListings: 95, confirmedBots: 55, totalVolume: 530 },
  { hour: '8 AM', normalListings: 850, suspiciousListings: 120, confirmedBots: 65, totalVolume: 1035 },
  { hour: '10 AM', normalListings: 1200, suspiciousListings: 150, confirmedBots: 80, totalVolume: 1430 },
  { hour: '12 PM', normalListings: 1450, suspiciousListings: 180, confirmedBots: 95, totalVolume: 1725 },
  { hour: '2 PM', normalListings: 1380, suspiciousListings: 165, confirmedBots: 88, totalVolume: 1633 },
  { hour: '4 PM', normalListings: 1100, suspiciousListings: 140, confirmedBots: 72, totalVolume: 1312 },
  { hour: '6 PM', normalListings: 980, suspiciousListings: 125, confirmedBots: 68, totalVolume: 1173 },
  { hour: '8 PM', normalListings: 850, suspiciousListings: 110, confirmedBots: 58, totalVolume: 1018 },
  { hour: '10 PM', normalListings: 620, suspiciousListings: 95, confirmedBots: 52, totalVolume: 767 },
];

const MOCK_ALERTS: DetectionAlert[] = [
  { id: 'da-1', alertType: 'confirmed', severity: 'critical', message: 'Confirmed bot operation: MetaBot v3.x mass-relisting 42 cards/min on eBay', venue: 'eBay', timestamp: '2026-04-18T08:30:00Z', patternId: 'lp-1', acknowledged: false },
  { id: 'da-2', alertType: 'escalation', severity: 'high', message: 'Price Oscillator pattern escalating - now affecting 180+ Football Prizm listings', venue: 'eBay', timestamp: '2026-04-18T07:15:00Z', patternId: 'lp-2', acknowledged: false },
  { id: 'da-3', alertType: 'volume-spike', severity: 'high', message: 'Abnormal listing volume detected: 55 listings/min in low-value singles', venue: 'eBay', timestamp: '2026-04-17T15:00:00Z', patternId: 'lp-5', acknowledged: true },
  { id: 'da-4', alertType: 'new-pattern', severity: 'medium', message: 'New bot pattern detected: Night Crawler operating 2-5 AM with 35 listings/min', venue: 'eBay', timestamp: '2026-04-17T03:30:00Z', patternId: 'lp-6', acknowledged: true },
  { id: 'da-5', alertType: 'confirmed', severity: 'critical', message: 'Keyword Spammer confirmed: 62 spam listings/min polluting search results', venue: 'eBay', timestamp: '2026-04-16T14:15:00Z', patternId: 'lp-8', acknowledged: true },
  { id: 'da-6', alertType: 'escalation', severity: 'medium', message: 'Shill bidding pattern under investigation at Goldin - 3 linked accounts identified', venue: 'Goldin', timestamp: '2026-04-16T20:00:00Z', patternId: 'lp-7', acknowledged: true },
];

export function getListingPatterns(): ListingPattern[] { return [...MOCK_PATTERNS]; }
export function getBotSignatures(): BotSignature[] { return [...MOCK_SIGNATURES]; }
export function getHFActivity(): HFActivity[] { return [...MOCK_ACTIVITY]; }
export function getDetectionAlerts(): DetectionAlert[] { return [...MOCK_ALERTS]; }
export function getConfirmedBotCount(): number { return MOCK_PATTERNS.filter(p => p.status === 'confirmed-bot').length; }
export function getActivePatternCount(): number { return MOCK_PATTERNS.filter(p => p.status === 'active' || p.status === 'flagged').length; }
export function getAvgBotProbability(): number { return Math.round(MOCK_PATTERNS.reduce((sum, p) => sum + p.botProbability, 0) / MOCK_PATTERNS.length); }
export function getUnacknowledgedAlerts(): number { return MOCK_ALERTS.filter(a => !a.acknowledged).length; }
