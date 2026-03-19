export interface LendingListing {
  id: string;
  cardName: string;
  owner: string;
  borrowRate: number;
  insuranceCoverage: number;
  duration: string;
  status: string;
  collateralRequired: number;
}

const mockListings: LendingListing[] = [
  { id: "ll-001", cardName: "2018 Panini Prizm Luka Doncic Silver PSA 10", owner: "VaultKing88", borrowRate: 2.5, insuranceCoverage: 5200, duration: "30 days", status: "active", collateralRequired: 6500 },
  { id: "ll-002", cardName: "1952 Topps Mickey Mantle PSA 4", owner: "VintageHoarder", borrowRate: 4.1, insuranceCoverage: 125000, duration: "14 days", status: "active", collateralRequired: 150000 },
  { id: "ll-003", cardName: "2023 Topps Chrome Victor Wembanyama RC PSA 10", owner: "ModernMint", borrowRate: 1.8, insuranceCoverage: 890, duration: "7 days", status: "on-loan", collateralRequired: 1100 },
  { id: "ll-004", cardName: "2001 SP Authentic Tiger Woods RC Auto /900", owner: "CrossoverCollector", borrowRate: 3.2, insuranceCoverage: 42000, duration: "21 days", status: "active", collateralRequired: 52000 },
  { id: "ll-005", cardName: "1986 Fleer Michael Jordan RC BGS 9", owner: "ChicagoBulls23", borrowRate: 3.8, insuranceCoverage: 28000, duration: "30 days", status: "expired", collateralRequired: 35000 },
];

export function getListings(): LendingListing[] {
  return mockListings;
}

export function getActiveLoans(): number {
  return mockListings.filter((l) => l.status === "on-loan").length;
}

const peerLendingService = { getListings, getActiveLoans };
export default peerLendingService;
