export interface CustodyEvent {
  date: string;
  holder: string;
  event: string;
  verified: boolean;
}

export interface ProvenanceChain {
  id: string;
  cardName: string;
  year: number;
  chain: CustodyEvent[];
  completeness: number;
  valueImpact: number;
}

const mockChains: ProvenanceChain[] = [
  { id: "pv-001", cardName: "T206 Honus Wagner SGC 3", year: 1909, chain: [
    { date: "1909", holder: "American Tobacco Co.", event: "Original distribution", verified: true },
    { date: "1952", holder: "Estate of Harold Buckner", event: "Estate sale in Pittsburgh", verified: true },
    { date: "1985", holder: "Alan Rosen (Mr. Mint)", event: "Purchased at flea market", verified: true },
    { date: "2002", holder: "Private collector", event: "Auction at REA", verified: true },
    { date: "2024", holder: "Current owner", event: "Private sale via Heritage", verified: true },
  ], completeness: 78, valueImpact: 34.5 },
  { id: "pv-002", cardName: "1952 Topps Mickey Mantle #311 PSA 7", year: 1952, chain: [
    { date: "1952", holder: "Original pack pull", event: "Retail purchase in New York", verified: false },
    { date: "1981", holder: "George Klein Collection", event: "Discovered in attic shoebox", verified: true },
    { date: "1991", holder: "PSA", event: "Graded PSA 7", verified: true },
    { date: "2018", holder: "PWCC Marketplace", event: "Auction sale $224,000", verified: true },
  ], completeness: 65, valueImpact: 18.2 },
  { id: "pv-003", cardName: "1916 M101-5 Babe Ruth RC SGC 2", year: 1916, chain: [
    { date: "1916", holder: "Sporting News", event: "Original issue with publication", verified: true },
    { date: "1968", holder: "Unknown", event: "Gap in provenance", verified: false },
    { date: "1998", holder: "Mastro Auctions", event: "First public auction appearance", verified: true },
    { date: "2012", holder: "SGC", event: "Graded SGC 2", verified: true },
    { date: "2023", holder: "Current owner", event: "Heritage Auctions sale $1.2M", verified: true },
  ], completeness: 52, valueImpact: 12.8 },
  { id: "pv-004", cardName: "1933 Goudey Babe Ruth #53 PSA 5", year: 1933, chain: [
    { date: "1933", holder: "Goudey Gum Co.", event: "Pack distribution", verified: true },
    { date: "1971", holder: "Frank Barning Estate", event: "Estate liquidation, documented in hobby press", verified: true },
    { date: "1989", holder: "PSA", event: "Among first cards graded by PSA, cert #00812", verified: true },
    { date: "2005", holder: "Robert Edward Auctions", event: "Sold for $48,000", verified: true },
    { date: "2021", holder: "Current owner", event: "Private treaty sale", verified: true },
  ], completeness: 88, valueImpact: 41.3 },
];

export function getChains(): ProvenanceChain[] {
  return mockChains;
}

export function getHighValueChains(): ProvenanceChain[] {
  return mockChains.filter((c) => c.valueImpact >= 20);
}

const vintageProvenanceService = { getChains, getHighValueChains };
export default vintageProvenanceService;
