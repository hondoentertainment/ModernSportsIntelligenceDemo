// Venue Health Oracle — Phase 230
// Real-time reputation scoring for every marketplace and auction house

export interface VenueScore {
  id: string;
  name: string;
  type: 'marketplace' | 'auction-house' | 'breaker-platform' | 'dealer-site' | 'social-marketplace';
  overallScore: number;
  trend: 'improving' | 'declining' | 'stable';
  metrics: VenueMetrics;
  recentIssues: VenueIssue[];
  strengths: string[];
  weaknesses: string[];
  recommendation: 'strongly-recommended' | 'recommended' | 'use-with-caution' | 'avoid';
}

export interface VenueMetrics {
  disputeRate: number;
  avgShippingDays: number;
  shippingAccuracy: number;
  buyerProtection: number;
  sellerFees: number;
  gradingAccuracy: number;
  customerService: number;
  uptime: number;
  fraudDetection: number;
  payoutSpeed: number;
}

export interface VenueIssue {
  id: string;
  date: string;
  severity: 'critical' | 'major' | 'minor';
  type: 'outage' | 'fraud' | 'shipping' | 'payment' | 'policy-change' | 'data-breach';
  description: string;
  resolved: boolean;
  userImpact: number;
}

export interface VenueComparison {
  metric: string;
  venues: { name: string; value: number; rank: number }[];
}

const MOCK_VENUES: VenueScore[] = [
  { id: 'v-1', name: 'eBay', type: 'marketplace', overallScore: 78, trend: 'stable', metrics: { disputeRate: 2.1, avgShippingDays: 4.2, shippingAccuracy: 94, buyerProtection: 92, sellerFees: 13.25, gradingAccuracy: 85, customerService: 65, uptime: 99.8, fraudDetection: 82, payoutSpeed: 88 }, recentIssues: [{ id: 'vi-1', date: '2026-03-10', severity: 'minor', type: 'policy-change', description: 'New authentication requirement for cards over $250 — extended processing by 2 days', resolved: true, userImpact: 35 }], strengths: ['Largest buyer pool', 'Strong buyer protection', 'Authentication for high-value'], weaknesses: ['High seller fees', 'Inconsistent customer service', 'Slow dispute resolution'], recommendation: 'recommended' },
  { id: 'v-2', name: 'COMC', type: 'marketplace', overallScore: 82, trend: 'improving', metrics: { disputeRate: 0.8, avgShippingDays: 6.5, shippingAccuracy: 98, buyerProtection: 88, sellerFees: 5.0, gradingAccuracy: 91, customerService: 74, uptime: 99.2, fraudDetection: 90, payoutSpeed: 72 }, recentIssues: [], strengths: ['Low fees', 'Vault storage option', 'Excellent grading accuracy', 'Low dispute rate'], weaknesses: ['Slower shipping', 'Smaller buyer pool', 'Payout delays during peak'], recommendation: 'strongly-recommended' },
  { id: 'v-3', name: 'PWCC', type: 'auction-house', overallScore: 86, trend: 'improving', metrics: { disputeRate: 0.5, avgShippingDays: 5.8, shippingAccuracy: 97, buyerProtection: 90, sellerFees: 8.5, gradingAccuracy: 95, customerService: 82, uptime: 99.5, fraudDetection: 94, payoutSpeed: 85 }, recentIssues: [], strengths: ['Premium auction results', 'Vaulting service', 'High-end focus', 'Strong fraud detection'], weaknesses: ['Higher minimum consignment values', 'Auction cycle delays'], recommendation: 'strongly-recommended' },
  { id: 'v-4', name: 'Whatnot', type: 'breaker-platform', overallScore: 71, trend: 'stable', metrics: { disputeRate: 3.2, avgShippingDays: 5.1, shippingAccuracy: 89, buyerProtection: 78, sellerFees: 9.0, gradingAccuracy: 72, customerService: 68, uptime: 98.7, fraudDetection: 74, payoutSpeed: 91 }, recentIssues: [{ id: 'vi-2', date: '2026-03-08', severity: 'major', type: 'fraud', description: 'Multiple reports of resealed product sold as factory sealed on live breaks', resolved: false, userImpact: 58 }], strengths: ['Live interaction', 'Quick payouts', 'Growing audience'], weaknesses: ['Higher dispute rate', 'Inconsistent product verification', 'Limited buyer protection on breaks'], recommendation: 'use-with-caution' },
  { id: 'v-5', name: 'Goldin', type: 'auction-house', overallScore: 91, trend: 'improving', metrics: { disputeRate: 0.3, avgShippingDays: 7.2, shippingAccuracy: 99, buyerProtection: 95, sellerFees: 10.0, gradingAccuracy: 98, customerService: 88, uptime: 99.7, fraudDetection: 96, payoutSpeed: 80 }, recentIssues: [], strengths: ['Premium brand reputation', 'Record-setting auctions', 'Elite authentication', 'White-glove service'], weaknesses: ['High minimum values', 'Slower shipping on lower lots', 'Premium buyer fees'], recommendation: 'strongly-recommended' },
  { id: 'v-6', name: 'MySlabs', type: 'marketplace', overallScore: 75, trend: 'declining', metrics: { disputeRate: 1.8, avgShippingDays: 3.8, shippingAccuracy: 92, buyerProtection: 80, sellerFees: 6.0, gradingAccuracy: 88, customerService: 60, uptime: 97.8, fraudDetection: 78, payoutSpeed: 84 }, recentIssues: [{ id: 'vi-3', date: '2026-03-05', severity: 'major', type: 'outage', description: 'Platform outage during auction close window — bids lost for 45 minutes', resolved: true, userImpact: 72 }], strengths: ['Fast shipping', 'Low fees', 'Good mobile app'], weaknesses: ['Platform reliability', 'Customer service delays', 'Smaller buyer pool'], recommendation: 'use-with-caution' },
];

const MOCK_COMPARISONS: VenueComparison[] = [
  { metric: 'Overall Score', venues: [{ name: 'Goldin', value: 91, rank: 1 }, { name: 'PWCC', value: 86, rank: 2 }, { name: 'COMC', value: 82, rank: 3 }, { name: 'eBay', value: 78, rank: 4 }, { name: 'MySlabs', value: 75, rank: 5 }, { name: 'Whatnot', value: 71, rank: 6 }] },
  { metric: 'Seller Fees (%)', venues: [{ name: 'COMC', value: 5.0, rank: 1 }, { name: 'MySlabs', value: 6.0, rank: 2 }, { name: 'PWCC', value: 8.5, rank: 3 }, { name: 'Whatnot', value: 9.0, rank: 4 }, { name: 'Goldin', value: 10.0, rank: 5 }, { name: 'eBay', value: 13.25, rank: 6 }] },
  { metric: 'Dispute Rate (%)', venues: [{ name: 'Goldin', value: 0.3, rank: 1 }, { name: 'PWCC', value: 0.5, rank: 2 }, { name: 'COMC', value: 0.8, rank: 3 }, { name: 'MySlabs', value: 1.8, rank: 4 }, { name: 'eBay', value: 2.1, rank: 5 }, { name: 'Whatnot', value: 3.2, rank: 6 }] },
];

export function getVenues(): VenueScore[] { return [...MOCK_VENUES]; }
export function getComparisons(): VenueComparison[] { return [...MOCK_COMPARISONS]; }
export function getTopVenue(): VenueScore { return MOCK_VENUES.reduce((a, b) => a.overallScore > b.overallScore ? a : b); }
export function getVenueAlertCount(): number { return MOCK_VENUES.reduce((sum, v) => sum + v.recentIssues.filter(i => !i.resolved).length, 0); }

export default { getVenues, getComparisons, getTopVenue, getVenueAlertCount };
