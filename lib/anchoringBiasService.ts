// Anchoring Bias Detector Service
// Detects anchor prices distorting card valuations

export interface AnchorPriceEvent {
  id: string;
  cardName: string;
  sport: string;
  anchorPrice: number;
  currentMarketPrice: number;
  anchorSource: string;
  anchorDate: string;
  distortionPercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'corrected' | 'monitoring';
  description: string;
}

export interface AnchorBiasScore {
  category: string;
  biasScore: number;
  sampleSize: number;
  avgDistortion: number;
  trend: 'improving' | 'worsening' | 'stable';
  lastUpdated: string;
}

export interface AnchorCorrection {
  id: string;
  cardName: string;
  originalAnchor: number;
  correctedValue: number;
  marketConsensus: number;
  correctionDate: string;
  savingsRealized: number;
  method: string;
}

export interface AnchorHistory {
  month: string;
  activeAnchors: number;
  corrected: number;
  avgDistortion: number;
  portfolioImpact: number;
}

const anchorEvents: AnchorPriceEvent[] = [
  { id: 'ae-1', cardName: '2020 Prizm Justin Herbert RC PSA 10', sport: 'Football', anchorPrice: 1200, currentMarketPrice: 340, anchorSource: 'Peak COVID Sale', anchorDate: '2021-02-14', distortionPercent: 253, severity: 'critical', status: 'active', description: 'Pandemic-era sale anchoring perceived value far above current market' },
  { id: 'ae-2', cardName: '2018 Topps Update Juan Soto RC PSA 10', sport: 'Baseball', anchorPrice: 950, currentMarketPrice: 410, anchorSource: 'World Series Hype', anchorDate: '2019-10-28', distortionPercent: 132, severity: 'high', status: 'active', description: 'Post-season performance spike created lasting price anchor' },
  { id: 'ae-3', cardName: '2019 Prizm Zion Williamson RC PSA 10', sport: 'Basketball', anchorPrice: 3500, currentMarketPrice: 750, anchorSource: 'Draft Night FOMO', anchorDate: '2020-01-15', distortionPercent: 367, severity: 'critical', status: 'active', description: 'Rookie hype created extreme anchor well above sustained value' },
  { id: 'ae-4', cardName: '2021 Bowman Marcelo Mayer 1st Chrome', sport: 'Baseball', anchorPrice: 275, currentMarketPrice: 180, anchorSource: 'Prospect Ranking Bump', anchorDate: '2022-07-10', distortionPercent: 53, severity: 'medium', status: 'monitoring', description: 'Top prospect ranking created mild anchor effect' },
  { id: 'ae-5', cardName: '2020 Mosaic Joe Burrow RC PSA 10', sport: 'Football', anchorPrice: 800, currentMarketPrice: 295, anchorSource: 'Super Bowl Run', anchorDate: '2022-02-13', distortionPercent: 171, severity: 'high', status: 'active', description: 'Championship appearance created persistent high anchor' },
  { id: 'ae-6', cardName: '2018 Prizm Luka Doncic RC PSA 10', sport: 'Basketball', anchorPrice: 8500, currentMarketPrice: 4200, anchorSource: 'Hobby Boom Peak', anchorDate: '2021-03-01', distortionPercent: 102, severity: 'high', status: 'monitoring', description: 'Market peak sale still anchoring seller expectations' },
  { id: 'ae-7', cardName: '2021 Topps Chrome Wander Franco RC', sport: 'Baseball', anchorPrice: 450, currentMarketPrice: 85, anchorSource: 'Debut Streak Hype', anchorDate: '2021-08-15', distortionPercent: 429, severity: 'critical', status: 'active', description: 'Historic debut streak inflated expectations dramatically' },
  { id: 'ae-8', cardName: '2020 Donruss Optic Tua Tagovailoa RC', sport: 'Football', anchorPrice: 180, currentMarketPrice: 45, anchorSource: 'Alabama Legacy Premium', anchorDate: '2020-11-01', distortionPercent: 300, severity: 'critical', status: 'corrected', description: 'College prestige created unrealistic pro value anchor' },
  { id: 'ae-9', cardName: '2022 Topps Series 1 Julio Rodriguez RC', sport: 'Baseball', anchorPrice: 120, currentMarketPrice: 78, anchorSource: 'ROY Award Spike', anchorDate: '2022-11-14', distortionPercent: 54, severity: 'medium', status: 'active', description: 'Award announcement temporarily inflated prices' },
  { id: 'ae-10', cardName: '2019 Panini National Treasures Ja Morant', sport: 'Basketball', anchorPrice: 12000, currentMarketPrice: 5800, anchorSource: 'Playoff Explosion', anchorDate: '2022-05-01', distortionPercent: 107, severity: 'high', status: 'monitoring', description: 'Outstanding playoff run created premium anchor' },
  { id: 'ae-11', cardName: '2021 Select Trevor Lawrence RC', sport: 'Football', anchorPrice: 350, currentMarketPrice: 125, anchorSource: 'Generational QB Label', anchorDate: '2021-04-29', distortionPercent: 180, severity: 'high', status: 'active', description: 'Pre-draft hype as generational prospect set high anchor' },
  { id: 'ae-12', cardName: '2020 Prizm Anthony Edwards RC PSA 10', sport: 'Basketball', anchorPrice: 550, currentMarketPrice: 385, anchorSource: 'All-Star Selection', anchorDate: '2023-02-01', distortionPercent: 43, severity: 'low', status: 'monitoring', description: 'Recent performance justified partial anchor adjustment' },
];

const biasScores: AnchorBiasScore[] = [
  { category: 'Football Rookies', biasScore: 78, sampleSize: 145, avgDistortion: 186, trend: 'worsening', lastUpdated: '2026-04-15' },
  { category: 'Basketball Stars', biasScore: 65, sampleSize: 98, avgDistortion: 124, trend: 'stable', lastUpdated: '2026-04-15' },
  { category: 'Baseball Prospects', biasScore: 52, sampleSize: 210, avgDistortion: 87, trend: 'improving', lastUpdated: '2026-04-14' },
  { category: 'Vintage (Pre-1980)', biasScore: 34, sampleSize: 67, avgDistortion: 42, trend: 'stable', lastUpdated: '2026-04-13' },
  { category: 'Soccer/International', biasScore: 71, sampleSize: 55, avgDistortion: 155, trend: 'worsening', lastUpdated: '2026-04-15' },
  { category: 'Graded Premium (PSA 10)', biasScore: 82, sampleSize: 320, avgDistortion: 198, trend: 'worsening', lastUpdated: '2026-04-15' },
  { category: 'Non-Sport / Pokemon', biasScore: 88, sampleSize: 175, avgDistortion: 245, trend: 'worsening', lastUpdated: '2026-04-14' },
  { category: 'Hockey', biasScore: 41, sampleSize: 82, avgDistortion: 56, trend: 'improving', lastUpdated: '2026-04-12' },
];

const corrections: AnchorCorrection[] = [
  { id: 'ac-1', cardName: '2020 Donruss Optic Tua Tagovailoa RC', originalAnchor: 180, correctedValue: 48, marketConsensus: 45, correctionDate: '2026-03-22', savingsRealized: 132, method: 'Comp-based recalibration' },
  { id: 'ac-2', cardName: '2019 Topps Chrome Vladimir Guerrero Jr.', originalAnchor: 650, correctedValue: 285, marketConsensus: 270, correctionDate: '2026-03-10', savingsRealized: 365, method: 'Historical regression model' },
  { id: 'ac-3', cardName: '2021 Panini Prizm Mac Jones RC', originalAnchor: 320, correctedValue: 65, marketConsensus: 58, correctionDate: '2026-02-28', savingsRealized: 255, method: 'Performance-adjusted valuation' },
  { id: 'ac-4', cardName: '2020 Topps Chrome Luis Robert RC', originalAnchor: 380, correctedValue: 155, marketConsensus: 148, correctionDate: '2026-02-15', savingsRealized: 225, method: 'Volume-weighted average' },
  { id: 'ac-5', cardName: '2018 Optic Josh Allen RC PSA 10', originalAnchor: 5200, correctedValue: 3100, marketConsensus: 3050, correctionDate: '2026-01-20', savingsRealized: 2100, method: 'Multi-factor correction' },
];

const anchorHistory: AnchorHistory[] = [
  { month: 'Nov 2025', activeAnchors: 18, corrected: 2, avgDistortion: 165, portfolioImpact: -4200 },
  { month: 'Dec 2025', activeAnchors: 20, corrected: 3, avgDistortion: 172, portfolioImpact: -4800 },
  { month: 'Jan 2026', activeAnchors: 17, corrected: 4, avgDistortion: 158, portfolioImpact: -3900 },
  { month: 'Feb 2026', activeAnchors: 15, corrected: 5, avgDistortion: 145, portfolioImpact: -3200 },
  { month: 'Mar 2026', activeAnchors: 14, corrected: 6, avgDistortion: 138, portfolioImpact: -2800 },
  { month: 'Apr 2026', activeAnchors: 12, corrected: 7, avgDistortion: 132, portfolioImpact: -2400 },
];

export function getAnchorEvents(): AnchorPriceEvent[] {
  return anchorEvents;
}

export function getBiasScores(): AnchorBiasScore[] {
  return biasScores;
}

export function getCorrections(): AnchorCorrection[] {
  return corrections;
}

export function getAnchorHistory(): AnchorHistory[] {
  return anchorHistory;
}

export function getAnchorStats() {
  const active = anchorEvents.filter(e => e.status === 'active').length;
  const critical = anchorEvents.filter(e => e.severity === 'critical').length;
  const avgDist = Math.round(anchorEvents.reduce((s, e) => s + e.distortionPercent, 0) / anchorEvents.length);
  const totalSavings = corrections.reduce((s, c) => s + c.savingsRealized, 0);
  return { activeAnchors: active, criticalAnchors: critical, avgDistortion: avgDist, totalSavings };
}
