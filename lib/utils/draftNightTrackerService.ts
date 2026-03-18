export interface DraftPick {
  id: string;
  pick: number;
  player: string;
  team: string;
  priceBeforeDraft: number;
  priceAfterDraft: number;
  priceChange: number;
  volume: number;
  sentiment: string;
}

const mockPicks: DraftPick[] = [
  { id: "dp-001", pick: 1, player: "Cam Ward", team: "Panthers", priceBeforeDraft: 45, priceAfterDraft: 128, priceChange: 184.4, volume: 3420, sentiment: "Euphoric" },
  { id: "dp-002", pick: 2, player: "Shedeur Sanders", team: "Browns", priceBeforeDraft: 62, priceAfterDraft: 95, priceChange: 53.2, volume: 5100, sentiment: "Bullish" },
  { id: "dp-003", pick: 3, player: "Travis Hunter", team: "Giants", priceBeforeDraft: 89, priceAfterDraft: 210, priceChange: 136.0, volume: 8900, sentiment: "Euphoric" },
  { id: "dp-004", pick: 4, player: "Abdul Carter", team: "Patriots", priceBeforeDraft: 28, priceAfterDraft: 52, priceChange: 85.7, volume: 1800, sentiment: "Bullish" },
  { id: "dp-005", pick: 5, player: "Tetairoa McMillan", team: "Jaguars", priceBeforeDraft: 35, priceAfterDraft: 61, priceChange: 74.3, volume: 2200, sentiment: "Optimistic" },
  { id: "dp-006", pick: 8, player: "Mason Graham", team: "Bengals", priceBeforeDraft: 18, priceAfterDraft: 29, priceChange: 61.1, volume: 890, sentiment: "Neutral" },
  { id: "dp-007", pick: 12, player: "Ashton Jeanty", team: "Cowboys", priceBeforeDraft: 72, priceAfterDraft: 58, priceChange: -19.4, volume: 4300, sentiment: "Disappointed" },
  { id: "dp-008", pick: 15, player: "Luther Burden III", team: "Dolphins", priceBeforeDraft: 31, priceAfterDraft: 44, priceChange: 41.9, volume: 1500, sentiment: "Optimistic" },
];

export function getPicks(): DraftPick[] {
  return mockPicks;
}

export function getBiggestMover(): DraftPick {
  return mockPicks.reduce((max, p) => Math.abs(p.priceChange) > Math.abs(max.priceChange) ? p : max);
}

const draftNightTrackerService = { getPicks, getBiggestMover };
export default draftNightTrackerService;
