export interface ManipulationAlert {
  id: string;
  type: "wash-trade" | "shill-bid" | "price-paint" | "pump-dump";
  player: string;
  card: string;
  evidence: string;
  severity: number;
  confidence: number;
  date: string;
}

const mockAlerts: ManipulationAlert[] = [
  { id: "ma-001", type: "wash-trade", player: "Victor Wembanyama", card: "2023 Prizm Silver PSA 10", evidence: "Same wallet sold and repurchased 4x in 48h across 3 platforms", severity: 9, confidence: 94, date: "2026-03-12" },
  { id: "ma-002", type: "shill-bid", player: "Luka Doncic", card: "2018 Prizm Base PSA 10", evidence: "Bidder account created same day, 6 consecutive bids in 2 min", severity: 7, confidence: 88, date: "2026-03-14" },
  { id: "ma-003", type: "price-paint", player: "Caleb Williams", card: "2024 Bowman Chrome Auto", evidence: "Series of escalating BIN sales between linked accounts", severity: 8, confidence: 91, date: "2026-03-10" },
  { id: "ma-004", type: "pump-dump", player: "Anthony Edwards", card: "2020 Prizm Silver BGS 9.5", evidence: "Coordinated social media campaign followed by mass listings 72h later", severity: 10, confidence: 82, date: "2026-03-15" },
  { id: "ma-005", type: "shill-bid", player: "Travis Hunter", card: "2025 Topps Chrome Rookie Auto", evidence: "Bid retraction pattern matching known shill ring", severity: 6, confidence: 76, date: "2026-03-16" },
];

export function getAlerts(): ManipulationAlert[] {
  return mockAlerts;
}

export function getActiveCount(): number {
  return mockAlerts.filter((a) => a.confidence >= 80).length;
}

const manipulationDetectorService = { getAlerts, getActiveCount };
export default manipulationDetectorService;
