export interface WaxScan {
  id: string;
  product: string;
  weight: number;
  density: number;
  hotPackProb: number;
  expectedHits: number;
  verdict: string;
  flags: string[];
}

const mockScans: WaxScan[] = [
  { id: "wax-001", product: "2024 Panini Prizm Basketball Hobby", weight: 412.3, density: 1.18, hotPackProb: 0.73, expectedHits: 4, verdict: "Likely Hot", flags: ["above-avg-weight", "high-density-cluster"] },
  { id: "wax-002", product: "2024 Topps Chrome Baseball Jumbo", weight: 387.1, density: 1.04, hotPackProb: 0.22, expectedHits: 2, verdict: "Standard", flags: [] },
  { id: "wax-003", product: "2023 Panini National Treasures Football", weight: 298.6, density: 1.31, hotPackProb: 0.85, expectedHits: 3, verdict: "Likely Hot", flags: ["thick-card-detected", "auto-booklet-signature"] },
  { id: "wax-004", product: "2024 Bowman Chrome Hobby", weight: 365.9, density: 1.02, hotPackProb: 0.15, expectedHits: 1, verdict: "Below Average", flags: ["low-density-uniform"] },
  { id: "wax-005", product: "2024 Panini Flawless Basketball", weight: 445.2, density: 1.44, hotPackProb: 0.91, expectedHits: 5, verdict: "Premium Hit", flags: ["multi-layer-detected", "gem-insert-probable"] },
];

export function getScans(): WaxScan[] {
  return mockScans;
}

export function getHotPackCount(): number {
  return mockScans.filter((s) => s.hotPackProb >= 0.7).length;
}

const waxCTScannerService = { getScans, getHotPackCount };
export default waxCTScannerService;
