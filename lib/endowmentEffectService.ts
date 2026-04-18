// Endowment Effect Calculator Service
// Quantify how ownership bias inflates perceived value vs market price

export interface EndowmentBias {
  id: string;
  cardName: string;
  sport: string;
  ownerPerceivedValue: number;
  marketValue: number;
  endowmentMarkup: number;
  ownershipDuration: string;
  emotionalAttachment: number;
  grade: string;
  category: string;
  status: 'overvalued' | 'fair' | 'undervalued';
}

export interface OwnershipPremium {
  category: string;
  avgMarkup: number;
  medianMarkup: number;
  sampleSize: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface EndowmentHistory {
  month: string;
  avgMarkup: number;
  portfolioPerceivedValue: number;
  portfolioMarketValue: number;
  correctionsMade: number;
  biasReduction: number;
}

export interface EndowmentScore {
  metric: string;
  score: number;
  benchmark: number;
  status: 'good' | 'warning' | 'danger';
  description: string;
}

const endowmentBiases: EndowmentBias[] = [
  { id: 'eb-1', cardName: '1986 Fleer Michael Jordan RC PSA 8', sport: 'Basketball', ownerPerceivedValue: 42000, marketValue: 28500, endowmentMarkup: 47.4, ownershipDuration: '8 years', emotionalAttachment: 95, grade: 'PSA 8', category: 'Vintage Basketball', status: 'overvalued' },
  { id: 'eb-2', cardName: '2020 Prizm Justin Herbert RC PSA 10', sport: 'Football', ownerPerceivedValue: 580, marketValue: 340, endowmentMarkup: 70.6, ownershipDuration: '5 years', emotionalAttachment: 72, grade: 'PSA 10', category: 'Modern Football', status: 'overvalued' },
  { id: 'eb-3', cardName: '2018 Topps Update Shohei Ohtani RC PSA 10', sport: 'Baseball', ownerPerceivedValue: 950, marketValue: 680, endowmentMarkup: 39.7, ownershipDuration: '7 years', emotionalAttachment: 85, grade: 'PSA 10', category: 'Modern Baseball', status: 'overvalued' },
  { id: 'eb-4', cardName: '2003 Topps Chrome LeBron James RC PSA 9', sport: 'Basketball', ownerPerceivedValue: 18000, marketValue: 14200, endowmentMarkup: 26.8, ownershipDuration: '12 years', emotionalAttachment: 92, grade: 'PSA 9', category: 'Modern Basketball', status: 'overvalued' },
  { id: 'eb-5', cardName: '2019 Bowman Chrome Wander Franco 1st Auto', sport: 'Baseball', ownerPerceivedValue: 180, marketValue: 65, endowmentMarkup: 176.9, ownershipDuration: '6 years', emotionalAttachment: 45, grade: 'BGS 9.5', category: 'Prospects', status: 'overvalued' },
  { id: 'eb-6', cardName: '2024 Topps Chrome Paul Skenes RC Auto', sport: 'Baseball', ownerPerceivedValue: 420, marketValue: 380, endowmentMarkup: 10.5, ownershipDuration: '6 months', emotionalAttachment: 55, grade: 'PSA 10', category: 'Modern Baseball', status: 'fair' },
  { id: 'eb-7', cardName: '1993 SP Derek Jeter RC PSA 9', sport: 'Baseball', ownerPerceivedValue: 35000, marketValue: 22000, endowmentMarkup: 59.1, ownershipDuration: '15 years', emotionalAttachment: 98, grade: 'PSA 9', category: 'Vintage Baseball', status: 'overvalued' },
  { id: 'eb-8', cardName: '2020 Panini Prizm Ja Morant RC PSA 10', sport: 'Basketball', ownerPerceivedValue: 420, marketValue: 310, endowmentMarkup: 35.5, ownershipDuration: '5.5 years', emotionalAttachment: 68, grade: 'PSA 10', category: 'Modern Basketball', status: 'overvalued' },
  { id: 'eb-9', cardName: '2024 Prizm Caleb Williams RC PSA 10', sport: 'Football', ownerPerceivedValue: 195, marketValue: 175, endowmentMarkup: 11.4, ownershipDuration: '4 months', emotionalAttachment: 42, grade: 'PSA 10', category: 'Modern Football', status: 'fair' },
  { id: 'eb-10', cardName: '2011 Topps Update Mike Trout RC PSA 10', sport: 'Baseball', ownerPerceivedValue: 65000, marketValue: 42000, endowmentMarkup: 54.8, ownershipDuration: '10 years', emotionalAttachment: 96, grade: 'PSA 10', category: 'Modern Baseball', status: 'overvalued' },
  { id: 'eb-11', cardName: '2018 Prizm Luka Doncic RC PSA 10', sport: 'Basketball', ownerPerceivedValue: 6200, marketValue: 4200, endowmentMarkup: 47.6, ownershipDuration: '7 years', emotionalAttachment: 88, grade: 'PSA 10', category: 'Modern Basketball', status: 'overvalued' },
  { id: 'eb-12', cardName: '2022 Topps Series 1 Julio Rodriguez RC', sport: 'Baseball', ownerPerceivedValue: 115, marketValue: 78, endowmentMarkup: 47.4, ownershipDuration: '3.5 years', emotionalAttachment: 62, grade: 'PSA 10', category: 'Modern Baseball', status: 'overvalued' },
  { id: 'eb-13', cardName: '2023 Prizm Victor Wembanyama RC PSA 10', sport: 'Basketball', ownerPerceivedValue: 580, marketValue: 520, endowmentMarkup: 11.5, ownershipDuration: '8 months', emotionalAttachment: 65, grade: 'PSA 10', category: 'Modern Basketball', status: 'fair' },
  { id: 'eb-14', cardName: '1952 Topps Mickey Mantle PSA 4', sport: 'Baseball', ownerPerceivedValue: 185000, marketValue: 125000, endowmentMarkup: 48.0, ownershipDuration: '20 years', emotionalAttachment: 99, grade: 'PSA 4', category: 'Vintage Baseball', status: 'overvalued' },
  { id: 'eb-15', cardName: '2015 Topps Chrome Kris Bryant RC Auto', sport: 'Baseball', ownerPerceivedValue: 280, marketValue: 145, endowmentMarkup: 93.1, ownershipDuration: '10 years', emotionalAttachment: 78, grade: 'PSA 10', category: 'Modern Baseball', status: 'overvalued' },
  { id: 'eb-16', cardName: '2023 Select CJ Stroud RC Tie-Dye /25', sport: 'Football', ownerPerceivedValue: 2800, marketValue: 2100, endowmentMarkup: 33.3, ownershipDuration: '2 years', emotionalAttachment: 75, grade: 'Raw', category: 'Modern Football', status: 'overvalued' },
];

const ownershipPremiums: OwnershipPremium[] = [
  { category: 'Vintage Baseball', avgMarkup: 52.3, medianMarkup: 48.0, sampleSize: 85, trend: 'stable' },
  { category: 'Modern Baseball', avgMarkup: 45.1, medianMarkup: 42.5, sampleSize: 210, trend: 'decreasing' },
  { category: 'Modern Basketball', avgMarkup: 38.8, medianMarkup: 35.5, sampleSize: 175, trend: 'decreasing' },
  { category: 'Modern Football', avgMarkup: 41.2, medianMarkup: 38.4, sampleSize: 190, trend: 'increasing' },
  { category: 'Prospects', avgMarkup: 68.5, medianMarkup: 55.0, sampleSize: 120, trend: 'increasing' },
  { category: 'Vintage Basketball', avgMarkup: 55.2, medianMarkup: 50.1, sampleSize: 45, trend: 'stable' },
  { category: 'Hockey', avgMarkup: 28.4, medianMarkup: 24.0, sampleSize: 60, trend: 'stable' },
];

const endowmentHistoryData: EndowmentHistory[] = [
  { month: 'Nov 2025', avgMarkup: 52.1, portfolioPerceivedValue: 142000, portfolioMarketValue: 95000, correctionsMade: 3, biasReduction: 0 },
  { month: 'Dec 2025', avgMarkup: 49.8, portfolioPerceivedValue: 138000, portfolioMarketValue: 94000, correctionsMade: 5, biasReduction: 4.4 },
  { month: 'Jan 2026', avgMarkup: 47.2, portfolioPerceivedValue: 135000, portfolioMarketValue: 93500, correctionsMade: 4, biasReduction: 5.2 },
  { month: 'Feb 2026', avgMarkup: 44.5, portfolioPerceivedValue: 131000, portfolioMarketValue: 92800, correctionsMade: 6, biasReduction: 5.7 },
  { month: 'Mar 2026', avgMarkup: 42.8, portfolioPerceivedValue: 128000, portfolioMarketValue: 92000, correctionsMade: 5, biasReduction: 3.8 },
  { month: 'Apr 2026', avgMarkup: 41.1, portfolioPerceivedValue: 125000, portfolioMarketValue: 91500, correctionsMade: 7, biasReduction: 4.0 },
];

const endowmentScores: EndowmentScore[] = [
  { metric: 'Overall Bias Level', score: 41.1, benchmark: 20, status: 'danger', description: 'Your ownership premium is 2x the healthy benchmark' },
  { metric: 'Emotional Attachment', score: 73, benchmark: 45, status: 'danger', description: 'High emotional attachment inflating value perceptions' },
  { metric: 'Price Accuracy', score: 58, benchmark: 85, status: 'warning', description: 'Self-assessed values significantly deviate from market' },
  { metric: 'Correction Willingness', score: 65, benchmark: 75, status: 'warning', description: 'Moderate willingness to adjust perceived values' },
  { metric: 'Market Awareness', score: 72, benchmark: 80, status: 'warning', description: 'Generally aware of market prices but slow to update' },
];

export function getEndowmentBiases(): EndowmentBias[] {
  return endowmentBiases;
}

export function getOwnershipPremiums(): OwnershipPremium[] {
  return ownershipPremiums;
}

export function getEndowmentHistory(): EndowmentHistory[] {
  return endowmentHistoryData;
}

export function getEndowmentScores(): EndowmentScore[] {
  return endowmentScores;
}

export function getEndowmentStats() {
  const overvalued = endowmentBiases.filter(b => b.status === 'overvalued').length;
  const avgMarkup = Math.round(endowmentBiases.reduce((s, b) => s + b.endowmentMarkup, 0) / endowmentBiases.length * 10) / 10;
  const totalPerceived = endowmentBiases.reduce((s, b) => s + b.ownerPerceivedValue, 0);
  const totalMarket = endowmentBiases.reduce((s, b) => s + b.marketValue, 0);
  return { overvaluedCards: overvalued, avgMarkup, totalPerceived, totalMarket, phantomValue: totalPerceived - totalMarket };
}
