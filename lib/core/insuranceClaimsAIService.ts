export interface InsuranceClaim {
  id: string;
  cardName: string;
  claimType: "damage" | "theft" | "loss" | "shipping";
  claimValue: number;
  damageAssessment: string;
  photos: number;
  status: string;
  aiRecommendation: string;
}

const mockClaims: InsuranceClaim[] = [
  { id: "ic-001", cardName: "2003 Topps Chrome LeBron James RC PSA 10", claimType: "shipping", claimValue: 42500, damageAssessment: "Corner dent through holder, grade invalidated", photos: 8, status: "pending", aiRecommendation: "Approve - shipping damage consistent with drop impact, pre-ship photos confirm PSA 10 condition" },
  { id: "ic-002", cardName: "1986 Fleer Michael Jordan RC BGS 8.5", claimType: "theft", claimValue: 18200, damageAssessment: "N/A - stolen from display at card show", photos: 3, status: "investigating", aiRecommendation: "Escalate - require police report and show vendor corroboration before approval" },
  { id: "ic-003", cardName: "2018 Panini National Treasures Luka Doncic RPA /99", claimType: "damage", claimValue: 8900, damageAssessment: "Water damage to top loader, card shows warping and staining", photos: 12, status: "pending", aiRecommendation: "Approve partial - damage appears pre-existing based on listing photo analysis, recommend 60% payout" },
  { id: "ic-004", cardName: "2020 Panini Prizm Joe Burrow Silver PSA 10", claimType: "loss", claimValue: 1250, damageAssessment: "N/A - lost in transit, USPS tracking shows delivered", photos: 0, status: "denied", aiRecommendation: "Deny - GPS data shows package delivered, no porch camera evidence provided" },
];

export function getClaims(): InsuranceClaim[] {
  return mockClaims;
}

export function getPendingCount(): number {
  return mockClaims.filter((c) => c.status === "pending").length;
}

const insuranceClaimsAIService = { getClaims, getPendingCount };
export default insuranceClaimsAIService;
