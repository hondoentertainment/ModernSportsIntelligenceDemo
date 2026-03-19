// Phase 128: Carbon & Sustainability Score
// Environmental impact tracking, carbon offsets, and ESG reporting for sports card collectors

// ---- Types ----

export type EmissionCategory = 'shipping' | 'grading' | 'storage' | 'travel' | 'packaging';
export type BadgeTier = 'seedling' | 'sapling' | 'tree' | 'forest' | 'rainforest';
export type OffsetStatus = 'available' | 'purchased' | 'verified' | 'retired';
export type TrendDirection = 'improving' | 'stable' | 'declining';
export type ESGRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';

export interface ShippingEmission {
  id: string;
  date: string;
  origin: string;
  destination: string;
  carrier: string;
  distanceMiles: number;
  weightOz: number;
  method: 'ground' | 'air' | 'express';
  co2Grams: number;
  packagingWaste: number;
}

export interface GradingEmission {
  id: string;
  date: string;
  gradingCompany: string;
  cardsSubmitted: number;
  shippingCo2: number;
  facilityCo2: number;
  totalCo2Grams: number;
  turnaroundDays: number;
}

export interface StorageEmission {
  id: string;
  storageType: 'home' | 'vault' | 'climate_controlled' | 'safe_deposit';
  monthlyKwh: number;
  co2GramsPerMonth: number;
  itemCount: number;
  temperatureControlled: boolean;
}

export interface CarbonFootprint {
  totalCo2Kg: number;
  monthlyAvgKg: number;
  yearToDateKg: number;
  breakdown: {
    category: EmissionCategory;
    co2Kg: number;
    percentage: number;
    trend: TrendDirection;
    changePercent: number;
  }[];
  comparisonToAvg: number;
  treesNeeded: number;
  equivalentMilesDriven: number;
}

export interface SustainabilityScore {
  overallScore: number;
  maxScore: number;
  grade: string;
  percentile: number;
  factors: {
    name: string;
    score: number;
    maxScore: number;
    description: string;
    icon: string;
  }[];
  improvementPotential: number;
  lastUpdated: string;
}

export interface CarbonOffset {
  id: string;
  name: string;
  provider: string;
  type: 'reforestation' | 'solar' | 'wind' | 'methane_capture' | 'ocean_cleanup';
  co2OffsetKg: number;
  priceUsd: number;
  pricePerKg: number;
  location: string;
  description: string;
  certification: string;
  status: OffsetStatus;
  verificationDate?: string;
  impactDetails: string;
}

export interface GreenBadge {
  id: string;
  tier: BadgeTier;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  progress: number;
  target: number;
  isEarned: boolean;
  earnedDate?: string;
  rarity: number;
}

export interface ESGReport {
  reportDate: string;
  period: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallRating: ESGRating;
  carbonIntensity: number;
  renewablePercent: number;
  wasteReduction: number;
  communityEngagement: number;
  transparencyScore: number;
  highlights: string[];
  risks: string[];
  recommendations: string[];
}

export interface SustainabilityTrend {
  month: string;
  co2Kg: number;
  offsetKg: number;
  netCo2Kg: number;
  score: number;
  shippingEmissions: number;
  gradingEmissions: number;
  storageEmissions: number;
}

export interface CommunityMember {
  rank: number;
  username: string;
  score: number;
  badge: BadgeTier;
  offsetsKg: number;
  isCurrentUser: boolean;
}

export interface EcoTip {
  id: string;
  category: EmissionCategory;
  title: string;
  description: string;
  impactReduction: number;
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
}

// ---- Constants ----

export const BADGE_TIER_COLORS: Record<BadgeTier, string> = {
  seedling: '#86efac',
  sapling: '#4ade80',
  tree: '#22c55e',
  forest: '#16a34a',
  rainforest: '#15803d',
};

export const BADGE_TIER_LABELS: Record<BadgeTier, string> = {
  seedling: 'Seedling',
  sapling: 'Sapling',
  tree: 'Tree',
  forest: 'Forest',
  rainforest: 'Rainforest',
};

// ---- Mock Data ----

const mockShippingEmissions: ShippingEmission[] = [
  { id: 'sh-1', date: '2026-03-10', origin: 'Los Angeles, CA', destination: 'New York, NY', carrier: 'USPS', distanceMiles: 2451, weightOz: 6, method: 'ground', co2Grams: 320, packagingWaste: 45 },
  { id: 'sh-2', date: '2026-03-05', origin: 'Chicago, IL', destination: 'Miami, FL', carrier: 'FedEx', distanceMiles: 1377, weightOz: 4, method: 'air', co2Grams: 890, packagingWaste: 30 },
  { id: 'sh-3', date: '2026-02-28', origin: 'Dallas, TX', destination: 'Seattle, WA', carrier: 'UPS', distanceMiles: 2100, weightOz: 8, method: 'express', co2Grams: 1100, packagingWaste: 55 },
  { id: 'sh-4', date: '2026-02-20', origin: 'Boston, MA', destination: 'Phoenix, AZ', carrier: 'USPS', distanceMiles: 2300, weightOz: 3, method: 'ground', co2Grams: 280, packagingWaste: 25 },
  { id: 'sh-5', date: '2026-02-15', origin: 'Denver, CO', destination: 'Atlanta, GA', carrier: 'FedEx', distanceMiles: 1400, weightOz: 5, method: 'air', co2Grams: 740, packagingWaste: 35 },
];

const mockGradingEmissions: GradingEmission[] = [
  { id: 'gr-1', date: '2026-02-01', gradingCompany: 'PSA', cardsSubmitted: 12, shippingCo2: 640, facilityCo2: 180, totalCo2Grams: 820, turnaroundDays: 45 },
  { id: 'gr-2', date: '2026-01-10', gradingCompany: 'BGS', cardsSubmitted: 8, shippingCo2: 520, facilityCo2: 140, totalCo2Grams: 660, turnaroundDays: 30 },
  { id: 'gr-3', date: '2025-12-05', gradingCompany: 'SGC', cardsSubmitted: 5, shippingCo2: 380, facilityCo2: 90, totalCo2Grams: 470, turnaroundDays: 20 },
];

const mockStorageEmissions: StorageEmission[] = [
  { id: 'st-1', storageType: 'climate_controlled', monthlyKwh: 15, co2GramsPerMonth: 6800, itemCount: 450, temperatureControlled: true },
  { id: 'st-2', storageType: 'home', monthlyKwh: 2, co2GramsPerMonth: 910, itemCount: 120, temperatureControlled: false },
  { id: 'st-3', storageType: 'vault', monthlyKwh: 8, co2GramsPerMonth: 3640, itemCount: 85, temperatureControlled: true },
];

const mockOffsets: CarbonOffset[] = [
  { id: 'off-1', name: 'Amazon Reforestation Project', provider: 'EcoAct', type: 'reforestation', co2OffsetKg: 50, priceUsd: 12.50, pricePerKg: 0.25, location: 'Brazil', description: 'Plant native trees in degraded Amazon regions to restore biodiversity.', certification: 'Verra VCS', status: 'available', impactDetails: 'Each purchase plants approximately 5 trees absorbing 10kg CO2/year each.' },
  { id: 'off-2', name: 'Midwest Wind Farm Credits', provider: 'TerraPass', type: 'wind', co2OffsetKg: 100, priceUsd: 18.00, pricePerKg: 0.18, location: 'Kansas, USA', description: 'Support wind energy generation replacing coal-powered electricity.', certification: 'Gold Standard', status: 'available', impactDetails: 'Funds maintenance and expansion of 50MW wind farm capacity.' },
  { id: 'off-3', name: 'Community Solar Initiative', provider: 'Pachama', type: 'solar', co2OffsetKg: 75, priceUsd: 15.75, pricePerKg: 0.21, location: 'Nevada, USA', description: 'Fund rooftop solar installations for underserved communities.', certification: 'ACR', status: 'available', impactDetails: 'Each credit funds 0.5kW of new solar capacity for community buildings.' },
  { id: 'off-4', name: 'Landfill Methane Capture', provider: 'NativeEnergy', type: 'methane_capture', co2OffsetKg: 200, priceUsd: 30.00, pricePerKg: 0.15, location: 'Ohio, USA', description: 'Capture and convert landfill methane gas into renewable energy.', certification: 'CAR', status: 'available', impactDetails: 'Methane is 80x more potent than CO2; capturing it has outsized impact.' },
  { id: 'off-5', name: 'Ocean Plastic Cleanup', provider: 'OceanCarbon', type: 'ocean_cleanup', co2OffsetKg: 25, priceUsd: 8.75, pricePerKg: 0.35, location: 'Pacific Ocean', description: 'Remove plastic waste from ocean gyres and prevent further CO2 release from decomposition.', certification: 'Verra Plastic', status: 'purchased', verificationDate: '2026-02-20', impactDetails: 'Removes 2kg of ocean plastic per credit, preventing micro-plastic CO2 emissions.' },
  { id: 'off-6', name: 'Boreal Forest Conservation', provider: 'CarbonCure', type: 'reforestation', co2OffsetKg: 150, priceUsd: 33.00, pricePerKg: 0.22, location: 'Canada', description: 'Protect old-growth boreal forests from logging.', certification: 'Gold Standard', status: 'verified', verificationDate: '2026-01-15', impactDetails: 'Preserves carbon sinks that took centuries to develop.' },
];

const mockBadges: GreenBadge[] = [
  { id: 'b-1', tier: 'seedling', name: 'First Steps', description: 'Track your first carbon footprint', icon: '🌱', requirement: 'Calculate your initial carbon footprint', progress: 1, target: 1, isEarned: true, earnedDate: '2025-11-15', rarity: 0.85 },
  { id: 'b-2', tier: 'seedling', name: 'Ground Shipper', description: 'Ship 5 packages via ground transportation', icon: '📦', requirement: 'Use ground shipping for 5 deliveries', progress: 5, target: 5, isEarned: true, earnedDate: '2025-12-01', rarity: 0.72 },
  { id: 'b-3', tier: 'sapling', name: 'Offset Pioneer', description: 'Purchase your first carbon offset', icon: '🌿', requirement: 'Buy at least one carbon offset credit', progress: 1, target: 1, isEarned: true, earnedDate: '2026-01-10', rarity: 0.45 },
  { id: 'b-4', tier: 'sapling', name: 'Eco Packager', description: 'Use recycled packaging 10 times', icon: '♻️', requirement: 'Ship with recycled/recyclable materials 10 times', progress: 8, target: 10, isEarned: false, rarity: 0.38 },
  { id: 'b-5', tier: 'tree', name: 'Carbon Neutral Month', description: 'Achieve net-zero emissions for a full month', icon: '🌳', requirement: 'Offset all emissions in a calendar month', progress: 0, target: 1, isEarned: false, rarity: 0.15 },
  { id: 'b-6', tier: 'tree', name: 'Batch Master', description: 'Batch 3 grading submissions to reduce shipping', icon: '📋', requirement: 'Combine cards into batch grading submissions 3 times', progress: 2, target: 3, isEarned: false, rarity: 0.22 },
  { id: 'b-7', tier: 'forest', name: 'Community Leader', description: 'Reach top 10% in sustainability ranking', icon: '🏅', requirement: 'Achieve a sustainability percentile of 90+', progress: 78, target: 90, isEarned: false, rarity: 0.08 },
  { id: 'b-8', tier: 'forest', name: 'Offset Champion', description: 'Offset 500kg of CO2', icon: '🌍', requirement: 'Purchase a total of 500kg in carbon offsets', progress: 175, target: 500, isEarned: false, rarity: 0.05 },
  { id: 'b-9', tier: 'rainforest', name: 'Net Positive', description: 'Offset more CO2 than you emit for an entire year', icon: '🌎', requirement: 'Maintain net-negative carbon for 12 consecutive months', progress: 3, target: 12, isEarned: false, rarity: 0.02 },
  { id: 'b-10', tier: 'rainforest', name: 'Sustainability Evangelist', description: 'Inspire 50 other collectors to join green tracking', icon: '💚', requirement: 'Refer 50 collectors who activate sustainability tracking', progress: 12, target: 50, isEarned: false, rarity: 0.01 },
];

const mockTrends: SustainabilityTrend[] = [
  { month: 'Oct 2025', co2Kg: 8.2, offsetKg: 0, netCo2Kg: 8.2, score: 42, shippingEmissions: 4.8, gradingEmissions: 2.1, storageEmissions: 1.3 },
  { month: 'Nov 2025', co2Kg: 7.5, offsetKg: 2.0, netCo2Kg: 5.5, score: 51, shippingEmissions: 4.0, gradingEmissions: 2.2, storageEmissions: 1.3 },
  { month: 'Dec 2025', co2Kg: 10.1, offsetKg: 5.0, netCo2Kg: 5.1, score: 55, shippingEmissions: 6.2, gradingEmissions: 2.6, storageEmissions: 1.3 },
  { month: 'Jan 2026', co2Kg: 6.8, offsetKg: 8.0, netCo2Kg: -1.2, score: 68, shippingEmissions: 3.5, gradingEmissions: 2.0, storageEmissions: 1.3 },
  { month: 'Feb 2026', co2Kg: 5.9, offsetKg: 6.0, netCo2Kg: -0.1, score: 72, shippingEmissions: 2.8, gradingEmissions: 1.8, storageEmissions: 1.3 },
  { month: 'Mar 2026', co2Kg: 4.3, offsetKg: 4.5, netCo2Kg: -0.2, score: 76, shippingEmissions: 1.9, gradingEmissions: 1.1, storageEmissions: 1.3 },
];

const mockCommunity: CommunityMember[] = [
  { rank: 1, username: 'EcoCollector99', score: 96, badge: 'rainforest', offsetsKg: 1240, isCurrentUser: false },
  { rank: 2, username: 'GreenGrader', score: 93, badge: 'rainforest', offsetsKg: 980, isCurrentUser: false },
  { rank: 3, username: 'CardTreeHugger', score: 91, badge: 'forest', offsetsKg: 870, isCurrentUser: false },
  { rank: 4, username: 'SustainaSport', score: 88, badge: 'forest', offsetsKg: 720, isCurrentUser: false },
  { rank: 5, username: 'ZeroCarbonCards', score: 85, badge: 'forest', offsetsKg: 650, isCurrentUser: false },
  { rank: 12, username: 'You', score: 76, badge: 'sapling', offsetsKg: 175, isCurrentUser: true },
  { rank: 13, username: 'EcoHobbyist', score: 74, badge: 'sapling', offsetsKg: 160, isCurrentUser: false },
  { rank: 14, username: 'GreenSlabs', score: 71, badge: 'sapling', offsetsKg: 140, isCurrentUser: false },
  { rank: 15, username: 'LeafCollector', score: 68, badge: 'seedling', offsetsKg: 95, isCurrentUser: false },
];

const mockEcoTips: EcoTip[] = [
  { id: 'tip-1', category: 'shipping', title: 'Choose ground over air shipping', description: 'Ground shipping produces up to 75% less CO2 than air shipping. Consolidate purchases to reduce total shipments.', impactReduction: 35, difficulty: 'easy', implemented: true },
  { id: 'tip-2', category: 'shipping', title: 'Use recycled packaging materials', description: 'Switch to recycled cardboard and biodegradable bubble wrap to reduce packaging waste by up to 60%.', impactReduction: 15, difficulty: 'easy', implemented: false },
  { id: 'tip-3', category: 'grading', title: 'Batch grading submissions', description: 'Combine multiple cards into single grading submissions to reduce round-trip shipping emissions per card.', impactReduction: 25, difficulty: 'medium', implemented: true },
  { id: 'tip-4', category: 'grading', title: 'Choose nearby grading services', description: 'Select grading companies with facilities closest to your location to minimize shipping distance.', impactReduction: 20, difficulty: 'medium', implemented: false },
  { id: 'tip-5', category: 'storage', title: 'Optimize climate control settings', description: 'Cards are safe at 65-72F and 40-50% humidity. Avoid over-cooling which wastes energy unnecessarily.', impactReduction: 18, difficulty: 'easy', implemented: false },
  { id: 'tip-6', category: 'storage', title: 'Use LED lighting in display areas', description: 'Replace halogen display lights with LEDs to cut lighting energy use by 80% and reduce UV damage to cards.', impactReduction: 10, difficulty: 'easy', implemented: true },
  { id: 'tip-7', category: 'packaging', title: 'Reuse penny sleeves and toploaders', description: 'Clean and reuse protective sleeves instead of buying new ones. Most last for many reuses.', impactReduction: 8, difficulty: 'easy', implemented: false },
  { id: 'tip-8', category: 'travel', title: 'Attend virtual card shows when possible', description: 'Virtual shows have near-zero carbon footprint compared to driving or flying to conventions.', impactReduction: 40, difficulty: 'hard', implemented: false },
];

// ---- Service Functions ----

export function getCarbonFootprint(): CarbonFootprint {
  const totalShipping = mockShippingEmissions.reduce((sum, e) => sum + e.co2Grams, 0) / 1000;
  const totalGrading = mockGradingEmissions.reduce((sum, e) => sum + e.totalCo2Grams, 0) / 1000;
  const totalStorage = mockStorageEmissions.reduce((sum, e) => sum + e.co2GramsPerMonth * 3, 0) / 1000;
  const totalTravel = 2.4;
  const totalPackaging = 0.8;

  const total = totalShipping + totalGrading + totalStorage + totalTravel + totalPackaging;

  return {
    totalCo2Kg: Math.round(total * 100) / 100,
    monthlyAvgKg: Math.round((total / 6) * 100) / 100,
    yearToDateKg: Math.round(total * 0.7 * 100) / 100,
    breakdown: [
      { category: 'shipping', co2Kg: Math.round(totalShipping * 100) / 100, percentage: Math.round((totalShipping / total) * 100), trend: 'improving', changePercent: -18 },
      { category: 'grading', co2Kg: Math.round(totalGrading * 100) / 100, percentage: Math.round((totalGrading / total) * 100), trend: 'improving', changePercent: -12 },
      { category: 'storage', co2Kg: Math.round(totalStorage * 100) / 100, percentage: Math.round((totalStorage / total) * 100), trend: 'stable', changePercent: 0 },
      { category: 'travel', co2Kg: totalTravel, percentage: Math.round((totalTravel / total) * 100), trend: 'declining', changePercent: 8 },
      { category: 'packaging', co2Kg: totalPackaging, percentage: Math.round((totalPackaging / total) * 100), trend: 'improving', changePercent: -22 },
    ],
    comparisonToAvg: -14,
    treesNeeded: Math.ceil(total / 22),
    equivalentMilesDriven: Math.round(total * 2.5),
  };
}

export function getSustainabilityScore(): SustainabilityScore {
  return {
    overallScore: 76,
    maxScore: 100,
    grade: 'B+',
    percentile: 78,
    factors: [
      { name: 'Shipping Efficiency', score: 82, maxScore: 100, description: 'Preference for ground shipping and consolidated orders', icon: 'truck' },
      { name: 'Carbon Offsets', score: 71, maxScore: 100, description: 'Active participation in offset programs', icon: 'leaf' },
      { name: 'Storage Optimization', score: 68, maxScore: 100, description: 'Energy efficiency of card storage solutions', icon: 'warehouse' },
      { name: 'Packaging Waste', score: 85, maxScore: 100, description: 'Use of recycled and minimal packaging', icon: 'package' },
      { name: 'Community Impact', score: 74, maxScore: 100, description: 'Engagement in sustainability community initiatives', icon: 'users' },
    ],
    improvementPotential: 24,
    lastUpdated: '2026-03-13',
  };
}

export function getShippingEmissions(): ShippingEmission[] {
  return mockShippingEmissions;
}

export function getGradingEmissions(): GradingEmission[] {
  return mockGradingEmissions;
}

export function getStorageEmissions(): StorageEmission[] {
  return mockStorageEmissions;
}

export function getOffsetOptions(): CarbonOffset[] {
  return mockOffsets;
}

export function purchaseOffset(offsetId: string): CarbonOffset | null {
  const offset = mockOffsets.find(o => o.id === offsetId);
  if (!offset || offset.status !== 'available') return null;
  return { ...offset, status: 'purchased', verificationDate: new Date().toISOString().split('T')[0] };
}

export function getGreenBadges(): GreenBadge[] {
  return mockBadges;
}

export function getESGReport(): ESGReport {
  return {
    reportDate: '2026-03-13',
    period: 'Q1 2026',
    environmentalScore: 72,
    socialScore: 81,
    governanceScore: 78,
    overallRating: 'A',
    carbonIntensity: 0.034,
    renewablePercent: 38,
    wasteReduction: 22,
    communityEngagement: 67,
    transparencyScore: 88,
    highlights: [
      'Reduced shipping emissions by 18% quarter-over-quarter',
      'Purchased 175kg in verified carbon offsets',
      'Adopted recycled packaging for 80% of shipments',
      'Batch grading reduced per-card grading emissions by 25%',
    ],
    risks: [
      'Climate-controlled storage remains largest fixed emission source',
      'Holiday season shipping spikes increase Q4 carbon intensity',
      'Limited availability of local grading options',
    ],
    recommendations: [
      'Transition vault storage to renewable-powered facility',
      'Set quarterly carbon reduction targets of 5%',
      'Explore peer-to-peer local trading to minimize shipping',
      'Investigate biodegradable slab cases as they become available',
    ],
  };
}

export function getSustainabilityTrends(): SustainabilityTrend[] {
  return mockTrends;
}

export function getEcoTips(): EcoTip[] {
  return mockEcoTips;
}

export function getCommunityRanking(): CommunityMember[] {
  return mockCommunity;
}
