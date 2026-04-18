// Echo Chamber Detector Service
// Identifies dangerous information echo chambers in collecting communities

export interface EchoChamber {
  id: string;
  name: string;
  platform: string;
  memberCount: number;
  dominantNarrative: string;
  biasDirection: "extreme_bullish" | "extreme_bearish" | "cult_following" | "contrarian_extreme";
  insularity: number;
  riskScore: number;
  affectedCards: string[];
  detectedDate: string;
  status: "active" | "growing" | "declining" | "dissolved";
  leaderInfluence: number;
}

export interface ChamberRisk {
  id: string;
  chamberId: string;
  riskType: "price_manipulation" | "information_asymmetry" | "groupthink" | "pump_and_dump" | "confirmation_bias";
  severity: number;
  potentialLoss: number;
  affectedCollectors: number;
  mitigationStrategy: string;
  likelihood: number;
}

export interface InformationDiversity {
  id: string;
  community: string;
  platform: string;
  diversityScore: number;
  sourceCount: number;
  dissenterRatio: number;
  factCheckRate: number;
  avgResponseToBearishView: string;
  healthRating: "healthy" | "moderate" | "concerning" | "dangerous";
  improvementTrend: number;
}

export interface ChamberAlert {
  id: string;
  chamberName: string;
  alertType: "new_chamber" | "risk_escalation" | "narrative_shift" | "member_surge" | "dissolution";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  affectedCards: string[];
  recommendedAction: string;
}

const mockChambers: EchoChamber[] = [
  { id: "ec1", name: "Wemby Mafia", platform: "Discord", memberCount: 12500, dominantNarrative: "Wembanyama will be the greatest player ever - all cards will 10x", biasDirection: "extreme_bullish", insularity: 85, riskScore: 78, affectedCards: ["2023 Prizm Wembanyama Silver", "2023 Bowman Chrome Wembanyama 1st"], detectedDate: "2026-01-15", status: "active", leaderInfluence: 82 },
  { id: "ec2", name: "Vintage Only Elitists", platform: "Blowout Forums", memberCount: 4800, dominantNarrative: "Modern cards are worthless - only pre-1970 cards have real value", biasDirection: "contrarian_extreme", insularity: 92, riskScore: 55, affectedCards: ["All Modern Cards"], detectedDate: "2025-06-20", status: "active", leaderInfluence: 68 },
  { id: "ec3", name: "Zion Bagholders United", platform: "Reddit", memberCount: 8200, dominantNarrative: "Zion is just injured but will come back as an all-time great", biasDirection: "cult_following", insularity: 88, riskScore: 85, affectedCards: ["2019 Prizm Zion Silver PSA 10", "2019 National Treasures Zion RPA"], detectedDate: "2025-03-10", status: "declining", leaderInfluence: 45 },
  { id: "ec4", name: "Caleb Hype Train", platform: "Twitter/X", memberCount: 22400, dominantNarrative: "Caleb Williams is the next Mahomes - buy everything now", biasDirection: "extreme_bullish", insularity: 72, riskScore: 82, affectedCards: ["2024 Prizm Caleb Williams Silver", "2024 National Treasures Caleb Williams RPA"], detectedDate: "2026-03-01", status: "growing", leaderInfluence: 75 },
  { id: "ec5", name: "The Doomsday Collectors", platform: "Facebook Group", memberCount: 6100, dominantNarrative: "The card market is about to crash 80% - sell everything", biasDirection: "extreme_bearish", insularity: 78, riskScore: 68, affectedCards: ["Market-wide impact"], detectedDate: "2025-11-15", status: "active", leaderInfluence: 58 },
  { id: "ec6", name: "Soccer Card Revolution", platform: "Discord", memberCount: 15800, dominantNarrative: "Soccer cards will overtake all US sports within 2 years", biasDirection: "extreme_bullish", insularity: 65, riskScore: 62, affectedCards: ["2022 Topps Chrome UCL Various", "2023 Topps Finest UCL"], detectedDate: "2025-09-01", status: "growing", leaderInfluence: 71 },
  { id: "ec7", name: "PSA 10 or Nothing Club", platform: "Instagram", memberCount: 9500, dominantNarrative: "Only PSA 10 grades matter - everything else is worthless junk", biasDirection: "cult_following", insularity: 82, riskScore: 58, affectedCards: ["All Graded Cards"], detectedDate: "2025-04-20", status: "active", leaderInfluence: 62 },
  { id: "ec8", name: "Prospect Pump Squad", platform: "TikTok", memberCount: 34000, dominantNarrative: "This unknown prospect is guaranteed to be the next big thing", biasDirection: "extreme_bullish", insularity: 55, riskScore: 92, affectedCards: ["2025 Bowman Chrome 1st Autos Various", "Minor League Prospect Cards"], detectedDate: "2026-02-10", status: "growing", leaderInfluence: 88 }
];

const mockRisks: ChamberRisk[] = [
  { id: "cr1", chamberId: "ec1", riskType: "groupthink", severity: 75, potentialLoss: 2500000, affectedCollectors: 8500, mitigationStrategy: "Diversify beyond Wembanyama - consider position sizing limits", likelihood: 62 },
  { id: "cr2", chamberId: "ec3", riskType: "confirmation_bias", severity: 85, potentialLoss: 4200000, affectedCollectors: 6800, mitigationStrategy: "Set stop-losses on Zion positions - accept potential sunk costs", likelihood: 78 },
  { id: "cr3", chamberId: "ec4", riskType: "pump_and_dump", severity: 80, potentialLoss: 1800000, affectedCollectors: 15200, mitigationStrategy: "Wait for on-field performance before heavy investment", likelihood: 55 },
  { id: "cr4", chamberId: "ec8", riskType: "pump_and_dump", severity: 92, potentialLoss: 5500000, affectedCollectors: 28000, mitigationStrategy: "Verify prospect rankings from multiple independent sources", likelihood: 82 },
  { id: "cr5", chamberId: "ec5", riskType: "information_asymmetry", severity: 65, potentialLoss: 800000, affectedCollectors: 4200, mitigationStrategy: "Review actual market data rather than relying on doom narratives", likelihood: 35 },
  { id: "cr6", chamberId: "ec7", riskType: "groupthink", severity: 58, potentialLoss: 1200000, affectedCollectors: 7200, mitigationStrategy: "Consider value in PSA 9 and other grades - premium for 10 may be excessive", likelihood: 48 },
  { id: "cr7", chamberId: "ec6", riskType: "price_manipulation", severity: 68, potentialLoss: 2100000, affectedCollectors: 11500, mitigationStrategy: "Validate soccer card growth claims with independent market data", likelihood: 42 },
  { id: "cr8", chamberId: "ec2", riskType: "information_asymmetry", severity: 52, potentialLoss: 350000, affectedCollectors: 3200, mitigationStrategy: "Modern cards have established track records - evaluate on merit", likelihood: 28 }
];

const mockDiversity: InformationDiversity[] = [
  { id: "id1", community: "Reddit r/sportscards", platform: "Reddit", diversityScore: 72, sourceCount: 145, dissenterRatio: 35, factCheckRate: 28, avgResponseToBearishView: "Mostly respectful debate", healthRating: "moderate", improvementTrend: 5.2 },
  { id: "id2", community: "Blowout Forums", platform: "Forum", diversityScore: 65, sourceCount: 82, dissenterRatio: 22, factCheckRate: 42, avgResponseToBearishView: "Mixed - some hostility to contrarians", healthRating: "moderate", improvementTrend: -2.1 },
  { id: "id3", community: "Sports Card Twitter", platform: "Twitter/X", diversityScore: 45, sourceCount: 320, dissenterRatio: 18, factCheckRate: 12, avgResponseToBearishView: "Often hostile with quote-tweet dunking", healthRating: "concerning", improvementTrend: -8.5 },
  { id: "id4", community: "Card Collecting Discord Hub", platform: "Discord", diversityScore: 58, sourceCount: 65, dissenterRatio: 25, factCheckRate: 35, avgResponseToBearishView: "Depends on specific channel and moderation", healthRating: "moderate", improvementTrend: 3.8 },
  { id: "id5", community: "TikTok Card Community", platform: "TikTok", diversityScore: 32, sourceCount: 180, dissenterRatio: 8, factCheckRate: 5, avgResponseToBearishView: "Almost entirely ignored or mocked", healthRating: "dangerous", improvementTrend: -12.2 },
  { id: "id6", community: "Sports Card Investor Forum", platform: "Website", diversityScore: 78, sourceCount: 55, dissenterRatio: 42, factCheckRate: 58, avgResponseToBearishView: "Encouraged as part of investment analysis", healthRating: "healthy", improvementTrend: 8.1 },
  { id: "id7", community: "Facebook Card Groups", platform: "Facebook", diversityScore: 52, sourceCount: 95, dissenterRatio: 15, factCheckRate: 18, avgResponseToBearishView: "Often leads to admin bans for negativity", healthRating: "concerning", improvementTrend: -5.5 },
  { id: "id8", community: "YouTube Card Community", platform: "YouTube", diversityScore: 48, sourceCount: 210, dissenterRatio: 12, factCheckRate: 15, avgResponseToBearishView: "Comment sections highly biased toward bullish views", healthRating: "concerning", improvementTrend: -3.2 }
];

const mockAlerts: ChamberAlert[] = [
  { id: "ca1", chamberName: "Prospect Pump Squad", alertType: "risk_escalation", severity: "critical", message: "Risk score escalated to 92 - coordinated buying detected on multiple prospect cards", timestamp: "2026-04-16T10:30:00Z", affectedCards: ["2025 Bowman Chrome 1st Autos"], recommendedAction: "Avoid following crowd on unproven prospects - verify with independent scouting" },
  { id: "ca2", chamberName: "Caleb Hype Train", alertType: "member_surge", severity: "high", message: "Membership grew 45% in past 2 weeks - approaching critical mass for market impact", timestamp: "2026-04-15T14:15:00Z", affectedCards: ["2024 Prizm Caleb Williams Silver"], recommendedAction: "Be cautious of FOMO-driven purchases at inflated prices" },
  { id: "ca3", chamberName: "Zion Bagholders United", alertType: "narrative_shift", severity: "medium", message: "Narrative shifting from denial to acceptance - some members beginning to sell", timestamp: "2026-04-14T09:45:00Z", affectedCards: ["2019 Prizm Zion Silver PSA 10"], recommendedAction: "Monitor for capitulation selling which may create buying opportunity" },
  { id: "ca4", chamberName: "Soccer Card Revolution", alertType: "new_chamber", severity: "medium", message: "New sub-chamber forming around 2026 World Cup speculation", timestamp: "2026-04-13T16:00:00Z", affectedCards: ["2022 Topps Chrome UCL Various"], recommendedAction: "World Cup hype historically inflates soccer cards temporarily" },
  { id: "ca5", chamberName: "Wemby Mafia", alertType: "risk_escalation", severity: "high", message: "Members actively discouraging any price analysis - insularity score rising", timestamp: "2026-04-12T11:20:00Z", affectedCards: ["2023 Prizm Wembanyama Silver"], recommendedAction: "Maintain position discipline regardless of community pressure" }
];

export function getEchoChambers(): EchoChamber[] {
  return mockChambers;
}

export function getChamberRisks(): ChamberRisk[] {
  return mockRisks;
}

export function getInformationDiversity(): InformationDiversity[] {
  return mockDiversity;
}

export function getChamberAlerts(): ChamberAlert[] {
  return mockAlerts;
}

export function getEchoChamberStats() {
  const totalChambers = mockChambers.length;
  const activeChambers = mockChambers.filter(c => c.status === "active" || c.status === "growing").length;
  const avgRisk = Math.round(mockChambers.reduce((s, c) => s + c.riskScore, 0) / totalChambers);
  const totalAffected = mockChambers.reduce((s, c) => s + c.memberCount, 0);
  const criticalAlerts = mockAlerts.filter(a => a.severity === "critical" || a.severity === "high").length;
  const avgDiversity = Math.round(mockDiversity.reduce((s, d) => s + d.diversityScore, 0) / mockDiversity.length);
  return { totalChambers, activeChambers, avgRisk, totalAffected, criticalAlerts, avgDiversity };
}
