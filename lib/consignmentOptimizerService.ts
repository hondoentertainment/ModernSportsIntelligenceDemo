// Consignment Optimizer Service — route optimization and platform comparison

export interface ConsignmentRoute {
  id: string;
  cardName: string;
  grade: string;
  estimatedValue: number;
  platform: string;
  commission: number;
  netProceeds: number;
  timeToSell: string;
  audienceSize: number;
  score: number;
  recommended: boolean;
}

export interface PlatformComparison {
  platform: string;
  avgCommission: number;
  avgTimeToSell: string;
  buyerPool: number;
  sellerRating: number;
  specialties: string[];
  tier: 'premium' | 'standard' | 'budget';
}

export function getRoutes(): ConsignmentRoute[] {
  return [
    { id: 'cr-1', cardName: '2020 Prizm Joe Burrow RC PSA 10', grade: 'PSA 10', estimatedValue: 280, platform: 'eBay', commission: 13.25, netProceeds: 242.90, timeToSell: '3-7 days', audienceSize: 2400000, score: 82, recommended: false },
    { id: 'cr-2', cardName: '2020 Prizm Joe Burrow RC PSA 10', grade: 'PSA 10', estimatedValue: 280, platform: 'PWCC', commission: 9.5, netProceeds: 253.40, timeToSell: '14-21 days', audienceSize: 180000, score: 88, recommended: true },
    { id: 'cr-3', cardName: '2018 Optic Luka Doncic PSA 10', grade: 'PSA 10', estimatedValue: 1350, platform: 'Goldin', commission: 10.0, netProceeds: 1215.00, timeToSell: '21-30 days', audienceSize: 250000, score: 91, recommended: true },
    { id: 'cr-4', cardName: '2018 Optic Luka Doncic PSA 10', grade: 'PSA 10', estimatedValue: 1350, platform: 'Heritage', commission: 15.0, netProceeds: 1147.50, timeToSell: '30-60 days', audienceSize: 320000, score: 78, recommended: false },
    { id: 'cr-5', cardName: '1986 Fleer Jordan RC PSA 8', grade: 'PSA 8', estimatedValue: 28000, platform: 'Heritage', commission: 15.0, netProceeds: 23800.00, timeToSell: '45-90 days', audienceSize: 320000, score: 94, recommended: true },
    { id: 'cr-6', cardName: '1986 Fleer Jordan RC PSA 8', grade: 'PSA 8', estimatedValue: 28000, platform: 'Goldin', commission: 10.0, netProceeds: 25200.00, timeToSell: '21-30 days', audienceSize: 250000, score: 90, recommended: false },
  ];
}

export function getComparisons(): PlatformComparison[] {
  return [
    { platform: 'eBay', avgCommission: 13.25, avgTimeToSell: '3-7 days', buyerPool: 2400000, sellerRating: 3.8, specialties: ['Volume', 'Speed', 'Modern'], tier: 'standard' },
    { platform: 'PWCC', avgCommission: 9.5, avgTimeToSell: '14-21 days', buyerPool: 180000, sellerRating: 4.5, specialties: ['Mid-range', 'Graded', 'Modern'], tier: 'premium' },
    { platform: 'Goldin', avgCommission: 10.0, avgTimeToSell: '21-30 days', buyerPool: 250000, sellerRating: 4.7, specialties: ['High-end', 'Vintage', 'Premium Modern'], tier: 'premium' },
    { platform: 'Heritage', avgCommission: 15.0, avgTimeToSell: '45-90 days', buyerPool: 320000, sellerRating: 4.9, specialties: ['Vintage', 'Ultra High-end', 'Rare'], tier: 'premium' },
    { platform: 'COMC', avgCommission: 5.0, avgTimeToSell: '30-90 days', buyerPool: 95000, sellerRating: 3.5, specialties: ['Budget', 'Volume', 'Commons'], tier: 'budget' },
    { platform: 'MySlabs', avgCommission: 8.0, avgTimeToSell: '7-14 days', buyerPool: 45000, sellerRating: 4.0, specialties: ['Graded', 'Modern', 'Social'], tier: 'standard' },
  ];
}
