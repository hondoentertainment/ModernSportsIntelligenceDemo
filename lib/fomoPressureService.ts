// FOMO Pressure Gauge Service
// Real-time fear-of-missing-out intensity scoring for market trends

export interface FomoSignal {
  id: string;
  cardName: string;
  sport: string;
  intensity: number;
  triggerType: string;
  priceChange24h: number;
  volumeSpike: number;
  socialMentions: number;
  detectedAt: string;
  status: 'active' | 'fading' | 'resolved';
  recommendation: string;
}

export interface FomoPressureReading {
  timestamp: string;
  overallPressure: number;
  footballPressure: number;
  basketballPressure: number;
  baseballPressure: number;
  hockeyPressure: number;
}

export interface FomoTrigger {
  id: string;
  triggerName: string;
  category: string;
  frequency: number;
  avgIntensity: number;
  avgDuration: string;
  falsePositiveRate: number;
  description: string;
}

export interface FomoHistory {
  month: string;
  totalSignals: number;
  avgIntensity: number;
  actionsTaken: number;
  regretRate: number;
  savingsFromIgnoring: number;
}

const fomoSignals: FomoSignal[] = [
  { id: 'fs-1', cardName: '2024 Topps Chrome Skenes RC Auto', sport: 'Baseball', intensity: 92, triggerType: 'Viral Social Post', priceChange24h: 34, volumeSpike: 480, socialMentions: 12500, detectedAt: '2026-04-18T08:15:00Z', status: 'active', recommendation: 'WAIT - Classic FOMO spike. Historical reversion within 72 hours.' },
  { id: 'fs-2', cardName: '2024 Prizm Caleb Williams RC PSA 10', sport: 'Football', intensity: 87, triggerType: 'Performance Breakout', priceChange24h: 28, volumeSpike: 320, socialMentions: 8900, detectedAt: '2026-04-18T06:30:00Z', status: 'active', recommendation: 'CAUTION - Performance-driven but price already reflects hype.' },
  { id: 'fs-3', cardName: '2023 Bowman Chrome Holliday 1st Auto', sport: 'Baseball', intensity: 78, triggerType: 'Prospect Promotion', priceChange24h: 22, volumeSpike: 250, socialMentions: 6400, detectedAt: '2026-04-17T22:00:00Z', status: 'active', recommendation: 'MONITOR - Legitimate catalyst but premium priced in.' },
  { id: 'fs-4', cardName: '2024 Donruss Optic Jayden Daniels RC', sport: 'Football', intensity: 84, triggerType: 'Award Announcement', priceChange24h: 31, volumeSpike: 390, socialMentions: 7800, detectedAt: '2026-04-17T19:45:00Z', status: 'active', recommendation: 'WAIT - Award bump typically fades 40% within 2 weeks.' },
  { id: 'fs-5', cardName: '2019 Prizm Luka Doncic Silver PSA 10', sport: 'Basketball', intensity: 65, triggerType: 'Playoff Performance', priceChange24h: 15, volumeSpike: 180, socialMentions: 5200, detectedAt: '2026-04-17T15:00:00Z', status: 'active', recommendation: 'SELECTIVE - Established star; some premium justified.' },
  { id: 'fs-6', cardName: '2024 Topps Series 1 Paul Skenes RC', sport: 'Baseball', intensity: 71, triggerType: 'Media Feature', priceChange24h: 18, volumeSpike: 210, socialMentions: 4100, detectedAt: '2026-04-17T12:30:00Z', status: 'fading', recommendation: 'PASS - Media-driven spike with no fundamental change.' },
  { id: 'fs-7', cardName: '2023 Select CJ Stroud RC Tie-Dye /25', sport: 'Football', intensity: 95, triggerType: 'Scarcity Alert', priceChange24h: 42, volumeSpike: 560, socialMentions: 15000, detectedAt: '2026-04-18T09:00:00Z', status: 'active', recommendation: 'EXTREME FOMO - Low pop + performance = dangerous combo. Set strict limit.' },
  { id: 'fs-8', cardName: '2024 Panini Flawless Victor Wembanyama', sport: 'Basketball', intensity: 89, triggerType: 'Record Sale', priceChange24h: 25, volumeSpike: 340, socialMentions: 11000, detectedAt: '2026-04-18T07:00:00Z', status: 'active', recommendation: 'WAIT - Record sale creating artificial anchor. Let market settle.' },
  { id: 'fs-9', cardName: '2022 Topps Chrome Julio Rodriguez Auto', sport: 'Baseball', intensity: 55, triggerType: 'Contract Extension', priceChange24h: 12, volumeSpike: 150, socialMentions: 3200, detectedAt: '2026-04-16T14:00:00Z', status: 'fading', recommendation: 'CONSIDER - Contract news has lasting value impact.' },
  { id: 'fs-10', cardName: '2024 Prizm Caitlin Clark RC PSA 10', sport: 'Basketball', intensity: 96, triggerType: 'Cultural Phenomenon', priceChange24h: 55, volumeSpike: 720, socialMentions: 22000, detectedAt: '2026-04-18T10:00:00Z', status: 'active', recommendation: 'EXTREME FOMO - Unprecedented demand. High risk of correction.' },
  { id: 'fs-11', cardName: '2023 Bowman Draft Travis Bazzana 1st', sport: 'Baseball', intensity: 62, triggerType: 'Draft Position', priceChange24h: 14, volumeSpike: 170, socialMentions: 2800, detectedAt: '2026-04-16T08:00:00Z', status: 'fading', recommendation: 'PASS - Draft hype fades quickly for unproven prospects.' },
  { id: 'fs-12', cardName: '2020 Prizm Justin Jefferson RC PSA 10', sport: 'Football', intensity: 73, triggerType: 'Trade Rumor', priceChange24h: 19, volumeSpike: 230, socialMentions: 5800, detectedAt: '2026-04-17T16:30:00Z', status: 'active', recommendation: 'MONITOR - Trade rumors are unreliable. Wait for confirmation.' },
  { id: 'fs-13', cardName: '2024 Topps Heritage Shohei Ohtani', sport: 'Baseball', intensity: 68, triggerType: 'Milestone Chase', priceChange24h: 16, volumeSpike: 200, socialMentions: 4500, detectedAt: '2026-04-17T10:00:00Z', status: 'active', recommendation: 'SELECTIVE - Milestone is legitimate but already priced in.' },
  { id: 'fs-14', cardName: '2023 Prizm Connor Bedard RC PSA 10', sport: 'Hockey', intensity: 58, triggerType: 'Rookie Season Surge', priceChange24h: 11, volumeSpike: 140, socialMentions: 2100, detectedAt: '2026-04-15T20:00:00Z', status: 'fading', recommendation: 'CONSIDER - Hockey cards have lower FOMO ceiling; smaller risk.' },
  { id: 'fs-15', cardName: '2024 Topps Chrome Elly De La Cruz Auto', sport: 'Baseball', intensity: 81, triggerType: 'Highlight Reel', priceChange24h: 24, volumeSpike: 290, socialMentions: 7200, detectedAt: '2026-04-18T05:00:00Z', status: 'active', recommendation: 'CAUTION - Electric plays drive emotional buying. Wait for cooldown.' },
];

const pressureReadings: FomoPressureReading[] = [
  { timestamp: '2026-04-18T00:00', overallPressure: 72, footballPressure: 78, basketballPressure: 82, baseballPressure: 65, hockeyPressure: 38 },
  { timestamp: '2026-04-18T04:00', overallPressure: 68, footballPressure: 74, basketballPressure: 76, baseballPressure: 62, hockeyPressure: 35 },
  { timestamp: '2026-04-18T08:00', overallPressure: 81, footballPressure: 85, basketballPressure: 88, baseballPressure: 74, hockeyPressure: 42 },
  { timestamp: '2026-04-18T12:00', overallPressure: 88, footballPressure: 90, basketballPressure: 92, baseballPressure: 80, hockeyPressure: 45 },
  { timestamp: '2026-04-18T16:00', overallPressure: 85, footballPressure: 87, basketballPressure: 89, baseballPressure: 78, hockeyPressure: 43 },
  { timestamp: '2026-04-18T20:00', overallPressure: 79, footballPressure: 82, basketballPressure: 84, baseballPressure: 70, hockeyPressure: 40 },
];

const fomoTriggers: FomoTrigger[] = [
  { id: 'ft-1', triggerName: 'Viral Social Post', category: 'Social Media', frequency: 34, avgIntensity: 82, avgDuration: '18 hours', falsePositiveRate: 72, description: 'Posts going viral on Twitter/X or TikTok drive rapid price spikes' },
  { id: 'ft-2', triggerName: 'Performance Breakout', category: 'On-Field', frequency: 22, avgIntensity: 75, avgDuration: '3 days', falsePositiveRate: 38, description: 'Outstanding game or streak performance triggers buying frenzies' },
  { id: 'ft-3', triggerName: 'Record Sale', category: 'Market', frequency: 15, avgIntensity: 88, avgDuration: '48 hours', falsePositiveRate: 65, description: 'A single high-profile auction result resets perceived value' },
  { id: 'ft-4', triggerName: 'Scarcity Alert', category: 'Supply', frequency: 18, avgIntensity: 91, avgDuration: '5 days', falsePositiveRate: 45, description: 'Low population or print run discoveries create urgency' },
  { id: 'ft-5', triggerName: 'Award Announcement', category: 'Achievement', frequency: 8, avgIntensity: 79, avgDuration: '2 weeks', falsePositiveRate: 30, description: 'MVP, ROY, or All-Star selections spike demand' },
  { id: 'ft-6', triggerName: 'Influencer Endorsement', category: 'Social Media', frequency: 28, avgIntensity: 70, avgDuration: '12 hours', falsePositiveRate: 80, description: 'Popular hobby influencers featuring a card drives brief spikes' },
  { id: 'ft-7', triggerName: 'Market-Wide Rally', category: 'Market', frequency: 6, avgIntensity: 85, avgDuration: '1 week', falsePositiveRate: 55, description: 'Broad market upswings create fear of being left behind' },
];

const fomoHistory: FomoHistory[] = [
  { month: 'Nov 2025', totalSignals: 42, avgIntensity: 68, actionsTaken: 18, regretRate: 62, savingsFromIgnoring: 3400 },
  { month: 'Dec 2025', totalSignals: 55, avgIntensity: 74, actionsTaken: 22, regretRate: 68, savingsFromIgnoring: 4800 },
  { month: 'Jan 2026', totalSignals: 48, avgIntensity: 71, actionsTaken: 15, regretRate: 58, savingsFromIgnoring: 3900 },
  { month: 'Feb 2026', totalSignals: 38, avgIntensity: 65, actionsTaken: 12, regretRate: 52, savingsFromIgnoring: 2800 },
  { month: 'Mar 2026', totalSignals: 51, avgIntensity: 72, actionsTaken: 14, regretRate: 55, savingsFromIgnoring: 4200 },
  { month: 'Apr 2026', totalSignals: 45, avgIntensity: 78, actionsTaken: 10, regretRate: 48, savingsFromIgnoring: 5100 },
];

export function getFomoSignals(): FomoSignal[] {
  return fomoSignals;
}

export function getPressureReadings(): FomoPressureReading[] {
  return pressureReadings;
}

export function getFomoTriggers(): FomoTrigger[] {
  return fomoTriggers;
}

export function getFomoHistory(): FomoHistory[] {
  return fomoHistory;
}

export function getFomoStats() {
  const active = fomoSignals.filter(s => s.status === 'active').length;
  const extreme = fomoSignals.filter(s => s.intensity >= 90).length;
  const avgIntensity = Math.round(fomoSignals.reduce((s, f) => s + f.intensity, 0) / fomoSignals.length);
  const totalSaved = fomoHistory.reduce((s, h) => s + h.savingsFromIgnoring, 0);
  return { activeSignals: active, extremeSignals: extreme, avgIntensity, totalSaved };
}
