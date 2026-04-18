// Confirmation Bias Scanner Service
// Detect selective information consumption patterns in research

export interface BiasPattern {
  id: string;
  patternName: string;
  cardOrCategory: string;
  biasType: 'cherry-picking' | 'echo-chamber' | 'selective-recall' | 'motivated-reasoning' | 'anchoring-search';
  severity: number;
  sourcesConsulted: number;
  sourcesAgreeing: number;
  diversityScore: number;
  detectedDate: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface SourceDiversity {
  sourceType: string;
  usage: number;
  reliability: number;
  biasDirection: 'bullish' | 'bearish' | 'neutral';
  avgConsultFreq: number;
  description: string;
}

export interface ConfirmationAlert {
  id: string;
  alertType: string;
  cardName: string;
  message: string;
  suggestedAction: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

export interface ResearchAudit {
  month: string;
  totalResearchSessions: number;
  biasedSessions: number;
  avgDiversityScore: number;
  bullishSourcePct: number;
  bearishSourcePct: number;
  neutralSourcePct: number;
  improvementPct: number;
}

const biasPatterns: BiasPattern[] = [
  { id: 'bp-1', patternName: 'Bullish Echo Chamber', cardOrCategory: '2024 Prizm Caleb Williams RC', biasType: 'echo-chamber', severity: 85, sourcesConsulted: 8, sourcesAgreeing: 7, diversityScore: 22, detectedDate: '2026-04-17', description: 'Only consulting sources that confirm bullish outlook on Williams rookies', status: 'active' },
  { id: 'bp-2', patternName: 'Selective Comp Picking', cardOrCategory: 'Vintage Baseball Holdings', biasType: 'cherry-picking', severity: 72, sourcesConsulted: 12, sourcesAgreeing: 9, diversityScore: 35, detectedDate: '2026-04-15', description: 'Choosing only favorable comparable sales while ignoring lower transactions', status: 'active' },
  { id: 'bp-3', patternName: 'Positive News Only', cardOrCategory: '2023 Bowman Chrome Prospects', biasType: 'selective-recall', severity: 68, sourcesConsulted: 6, sourcesAgreeing: 5, diversityScore: 28, detectedDate: '2026-04-14', description: 'Remembering positive prospect reports while forgetting injury concerns', status: 'acknowledged' },
  { id: 'bp-4', patternName: 'Motivated Valuation', cardOrCategory: '2019 Prizm Zion Williamson RC', biasType: 'motivated-reasoning', severity: 91, sourcesConsulted: 10, sourcesAgreeing: 8, diversityScore: 18, detectedDate: '2026-04-16', description: 'Constructing narrative to justify holding despite clear downtrend', status: 'active' },
  { id: 'bp-5', patternName: 'Search Term Bias', cardOrCategory: '2024 Topps Chrome Paul Skenes', biasType: 'anchoring-search', severity: 58, sourcesConsulted: 5, sourcesAgreeing: 4, diversityScore: 42, detectedDate: '2026-04-13', description: 'Search queries structured to find confirming information only', status: 'acknowledged' },
  { id: 'bp-6', patternName: 'Community Groupthink', cardOrCategory: 'Football QB Rookies 2024', biasType: 'echo-chamber', severity: 78, sourcesConsulted: 15, sourcesAgreeing: 13, diversityScore: 25, detectedDate: '2026-04-17', description: 'Hobby forum consensus overriding independent market analysis', status: 'active' },
  { id: 'bp-7', patternName: 'Ignoring Bear Case', cardOrCategory: '2018 Prizm Luka Doncic RC', biasType: 'cherry-picking', severity: 65, sourcesConsulted: 9, sourcesAgreeing: 6, diversityScore: 38, detectedDate: '2026-04-12', description: 'Dismissing trade volume decline data that contradicts bullish thesis', status: 'active' },
  { id: 'bp-8', patternName: 'Influencer Dependency', cardOrCategory: 'Modern Basketball Autos', biasType: 'echo-chamber', severity: 82, sourcesConsulted: 4, sourcesAgreeing: 4, diversityScore: 15, detectedDate: '2026-04-16', description: 'Relying exclusively on hobby influencers who share bullish views', status: 'active' },
  { id: 'bp-9', patternName: 'Success Story Filter', cardOrCategory: 'Prospect Investing Strategy', biasType: 'selective-recall', severity: 75, sourcesConsulted: 7, sourcesAgreeing: 6, diversityScore: 30, detectedDate: '2026-04-15', description: 'Only remembering successful prospect investments, ignoring failures', status: 'acknowledged' },
  { id: 'bp-10', patternName: 'Pre-Decided Research', cardOrCategory: '2024 Bowman Draft Travis Bazzana', biasType: 'motivated-reasoning', severity: 70, sourcesConsulted: 6, sourcesAgreeing: 5, diversityScore: 32, detectedDate: '2026-04-14', description: 'Researching to confirm a purchase decision already mentally made', status: 'active' },
];

const sourceDiversity: SourceDiversity[] = [
  { sourceType: 'Hobby Forums', usage: 35, reliability: 45, biasDirection: 'bullish', avgConsultFreq: 12, description: 'Community discussion boards tend toward optimistic groupthink' },
  { sourceType: 'YouTube/Influencers', usage: 25, reliability: 40, biasDirection: 'bullish', avgConsultFreq: 8, description: 'Content creators incentivized to drive excitement' },
  { sourceType: 'eBay Sold Data', usage: 18, reliability: 85, biasDirection: 'neutral', avgConsultFreq: 6, description: 'Actual transaction data is the most reliable source' },
  { sourceType: 'Price Guides', usage: 8, reliability: 60, biasDirection: 'bullish', avgConsultFreq: 2, description: 'Published guides often lag behind market reality' },
  { sourceType: 'Statistical Analysis', usage: 5, reliability: 90, biasDirection: 'neutral', avgConsultFreq: 1, description: 'Data-driven analysis provides unbiased perspective' },
  { sourceType: 'Auction House Reports', usage: 6, reliability: 75, biasDirection: 'bullish', avgConsultFreq: 2, description: 'Auction houses highlight record sales more than declines' },
  { sourceType: 'Contrarian Analysis', usage: 3, reliability: 70, biasDirection: 'bearish', avgConsultFreq: 0.5, description: 'Bear-case research is underutilized but valuable' },
];

const confirmationAlerts: ConfirmationAlert[] = [
  { id: 'ca-1', alertType: 'Echo Chamber', cardName: '2024 Prizm Caleb Williams RC', message: 'You have consulted 7 bullish sources and 0 bearish sources for this card', suggestedAction: 'Read at least 2 contrarian analyses before making a decision', timestamp: '2026-04-17T14:30:00Z', severity: 'high', acknowledged: false },
  { id: 'ca-2', alertType: 'Cherry Picking', cardName: '1986 Fleer Jordan RC', message: 'Your comp selection excludes 4 recent lower sales', suggestedAction: 'Include all sales from the past 90 days in your analysis', timestamp: '2026-04-16T10:15:00Z', severity: 'medium', acknowledged: false },
  { id: 'ca-3', alertType: 'Motivated Reasoning', cardName: '2019 Prizm Zion Williamson RC', message: 'Your hold thesis contradicts 3 independent valuation models', suggestedAction: 'Review rational sell/hold analysis in Sunk Cost Liberation Engine', timestamp: '2026-04-16T08:00:00Z', severity: 'critical', acknowledged: false },
  { id: 'ca-4', alertType: 'Selective Memory', cardName: '2023 Bowman Chrome Prospects', message: 'You recall 8 successful prospect picks but ignore 14 losses', suggestedAction: 'Review complete prospect investment history for accuracy', timestamp: '2026-04-15T16:45:00Z', severity: 'high', acknowledged: true },
  { id: 'ca-5', alertType: 'Source Concentration', cardName: 'Portfolio Overall', message: 'Over 60% of your research comes from just 2 sources', suggestedAction: 'Diversify information sources to include data-driven platforms', timestamp: '2026-04-15T09:00:00Z', severity: 'medium', acknowledged: false },
];

const researchAudits: ResearchAudit[] = [
  { month: 'Nov 2025', totalResearchSessions: 45, biasedSessions: 32, avgDiversityScore: 28, bullishSourcePct: 68, bearishSourcePct: 8, neutralSourcePct: 24, improvementPct: 0 },
  { month: 'Dec 2025', totalResearchSessions: 52, biasedSessions: 35, avgDiversityScore: 30, bullishSourcePct: 65, bearishSourcePct: 10, neutralSourcePct: 25, improvementPct: 7 },
  { month: 'Jan 2026', totalResearchSessions: 48, biasedSessions: 30, avgDiversityScore: 33, bullishSourcePct: 62, bearishSourcePct: 12, neutralSourcePct: 26, improvementPct: 10 },
  { month: 'Feb 2026', totalResearchSessions: 40, biasedSessions: 23, avgDiversityScore: 36, bullishSourcePct: 58, bearishSourcePct: 14, neutralSourcePct: 28, improvementPct: 9 },
  { month: 'Mar 2026', totalResearchSessions: 50, biasedSessions: 27, avgDiversityScore: 38, bullishSourcePct: 55, bearishSourcePct: 15, neutralSourcePct: 30, improvementPct: 5.6 },
  { month: 'Apr 2026', totalResearchSessions: 38, biasedSessions: 18, avgDiversityScore: 41, bullishSourcePct: 52, bearishSourcePct: 17, neutralSourcePct: 31, improvementPct: 7.9 },
];

export function getBiasPatterns(): BiasPattern[] {
  return biasPatterns;
}

export function getSourceDiversity(): SourceDiversity[] {
  return sourceDiversity;
}

export function getConfirmationAlerts(): ConfirmationAlert[] {
  return confirmationAlerts;
}

export function getResearchAudits(): ResearchAudit[] {
  return researchAudits;
}

export function getConfirmationBiasStats() {
  const activePatterns = biasPatterns.filter(p => p.status === 'active').length;
  const avgDiversity = Math.round(biasPatterns.reduce((s, p) => s + p.diversityScore, 0) / biasPatterns.length);
  const criticalAlerts = confirmationAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  const latestAudit = researchAudits[researchAudits.length - 1];
  return { activePatterns, avgDiversityScore: avgDiversity, criticalAlerts, biasedSessionRate: Math.round((latestAudit.biasedSessions / latestAudit.totalResearchSessions) * 100) };
}
