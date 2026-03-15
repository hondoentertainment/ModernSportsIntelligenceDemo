// Phase 148: Blockchain Provenance & Digital Card Passport
// Verifiable ownership history and authenticity chains for physical and digital cards

// ── Types ────────────────────────────────────────────────────────────────────

export type BlockchainNetwork = 'ethereum' | 'polygon' | 'solana' | 'cardano' | 'immutable_x' | 'flow';
export type ProvenanceEventType = 'minted' | 'graded' | 'sold' | 'transferred' | 'authenticated' | 'exhibited' | 'insured' | 'damaged' | 'restored';

export interface CardPassport {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  currentOwner: string;
  authenticityScore: number;
  network: BlockchainNetwork;
  mintDate: string;
  lastVerified: string;
  totalTransfers: number;
  totalValue: number;
  imageColor: string;
  verified: boolean;
}

export interface ProvenanceEvent {
  id: string;
  passportId: string;
  eventType: ProvenanceEventType;
  description: string;
  timestamp: string;
  actor: string;
  location: string;
  txHash: string;
  value?: number;
  metadata?: string;
}

export interface OwnershipRecord {
  id: string;
  passportId: string;
  owner: string;
  acquiredDate: string;
  soldDate: string | null;
  purchasePrice: number;
  salePrice: number | null;
  verified: boolean;
  network: BlockchainNetwork;
  txHash: string;
}

export interface AuthenticityScore {
  passportId: string;
  score: number;
  gradingVerified: boolean;
  provenanceComplete: boolean;
  ownershipVerified: boolean;
  physicalMatch: boolean;
  digitalTwinLinked: boolean;
  lastAuditDate: string;
  auditor: string;
}

export interface DigitalTwin {
  id: string;
  passportId: string;
  tokenId: string;
  contractAddress: string;
  network: BlockchainNetwork;
  metadataUri: string;
  imageUri: string;
  mintedAt: string;
  currentOwner: string;
  floorPrice: number;
  lastSale: number;
}

export interface SmartContract {
  id: string;
  name: string;
  type: string;
  description: string;
  network: BlockchainNetwork;
  address: string;
  deployedAt: string;
  totalTransactions: number;
  tvl: number;
  status: 'active' | 'paused' | 'deprecated';
}

export interface NFTLink {
  passportId: string;
  tokenId: string;
  network: BlockchainNetwork;
  marketplace: string;
  url: string;
}

export interface VerificationResult {
  id: string;
  passportId: string;
  cardName: string;
  result: 'verified' | 'pending' | 'failed';
  authenticityScore: number;
  verifiedAt: string;
  verifier: string;
  blockNumber: number;
  txHash: string;
  notes: string;
}

export interface TransactionRecord {
  id: string;
  passportId: string;
  txHash: string;
  blockNumber: number;
  network: BlockchainNetwork;
  from: string;
  to: string;
  value: number;
  gasFee: number;
  timestamp: string;
  type: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface PassportTemplate {
  id: string;
  name: string;
  description: string;
  network: BlockchainNetwork;
  features: string[];
  costToMint: number;
  popularity: number;
}

export interface ChainOfCustody {
  passportId: string;
  cardName: string;
  totalOwners: number;
  totalEvents: number;
  firstEvent: string;
  lastEvent: string;
  integrityScore: number;
  chain: ProvenanceEvent[];
}

// ── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_blockchain_provenance';

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch { return null; }
}

function saveData<T>(key: string, data: T): void {
  try { localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data)); } catch { /* quota */ }
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const PASSPORTS: CardPassport[] = [
  { id: 'bp_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', player: 'LeBron James', year: 2003, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0x7a3f...8b2c', authenticityScore: 99, network: 'ethereum', mintDate: '2023-01-15', lastVerified: '2026-03-10', totalTransfers: 8, totalValue: 450000, imageColor: '#f59e0b', verified: true },
  { id: 'bp_002', cardName: '2018 National Treasures Luka Doncic RPA /99', player: 'Luka Doncic', year: 2018, set: 'National Treasures', grade: 'BGS 9.5', currentOwner: '0x2b1c...4d9e', authenticityScore: 97, network: 'polygon', mintDate: '2023-03-20', lastVerified: '2026-03-08', totalTransfers: 5, totalValue: 125000, imageColor: '#3b82f6', verified: true },
  { id: 'bp_003', cardName: '2023 Topps Chrome Victor Wembanyama RC PSA 10', player: 'Victor Wembanyama', year: 2023, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0x9e4d...1a7f', authenticityScore: 98, network: 'ethereum', mintDate: '2024-06-10', lastVerified: '2026-03-12', totalTransfers: 3, totalValue: 2850, imageColor: '#8b5cf6', verified: true },
  { id: 'bp_004', cardName: '1986 Fleer Michael Jordan RC #57 PSA 9', player: 'Michael Jordan', year: 1986, set: 'Fleer', grade: 'PSA 9', currentOwner: '0x5c2a...3e8b', authenticityScore: 100, network: 'ethereum', mintDate: '2022-11-01', lastVerified: '2026-02-28', totalTransfers: 12, totalValue: 35000, imageColor: '#ef4444', verified: true },
  { id: 'bp_005', cardName: '2018 Topps Chrome Shohei Ohtani RC PSA 10', player: 'Shohei Ohtani', year: 2018, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0x1f8e...6c3d', authenticityScore: 96, network: 'polygon', mintDate: '2023-05-15', lastVerified: '2026-03-05', totalTransfers: 4, totalValue: 1200, imageColor: '#ec4899', verified: true },
  { id: 'bp_006', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', year: 2020, set: 'Prizm', grade: 'PSA 10', currentOwner: '0x8d4b...2f1a', authenticityScore: 95, network: 'solana', mintDate: '2023-08-22', lastVerified: '2026-03-01', totalTransfers: 6, totalValue: 450, imageColor: '#06b6d4', verified: true },
  { id: 'bp_007', cardName: '2001 Topps Chrome Albert Pujols RC PSA 10', player: 'Albert Pujols', year: 2001, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0x3a7e...9d4c', authenticityScore: 98, network: 'ethereum', mintDate: '2023-02-10', lastVerified: '2026-02-15', totalTransfers: 7, totalValue: 8500, imageColor: '#f97316', verified: true },
  { id: 'bp_008', cardName: '2019 Prizm Zion Williamson RC PSA 10', player: 'Zion Williamson', year: 2019, set: 'Prizm', grade: 'PSA 10', currentOwner: '0x6b2f...5e8a', authenticityScore: 93, network: 'polygon', mintDate: '2023-07-18', lastVerified: '2026-02-20', totalTransfers: 9, totalValue: 280, imageColor: '#22c55e', verified: true },
  { id: 'bp_009', cardName: '2017 National Treasures Patrick Mahomes RPA /99', player: 'Patrick Mahomes', year: 2017, set: 'National Treasures', grade: 'BGS 9', currentOwner: '0x4e1d...7a3b', authenticityScore: 97, network: 'ethereum', mintDate: '2023-04-05', lastVerified: '2026-03-11', totalTransfers: 4, totalValue: 95000, imageColor: '#dc2626', verified: true },
  { id: 'bp_010', cardName: '2011 Topps Update Mike Trout RC PSA 10', player: 'Mike Trout', year: 2011, set: 'Topps Update', grade: 'PSA 10', currentOwner: '0xa2c5...8e1f', authenticityScore: 99, network: 'ethereum', mintDate: '2022-12-20', lastVerified: '2026-03-09', totalTransfers: 6, totalValue: 65000, imageColor: '#ef4444', verified: true },
  { id: 'bp_011', cardName: '1993 SP Derek Jeter Foil #279 PSA 10', player: 'Derek Jeter', year: 1993, set: 'SP', grade: 'PSA 10', currentOwner: '0xc8f3...4b2d', authenticityScore: 100, network: 'ethereum', mintDate: '2023-01-28', lastVerified: '2026-02-25', totalTransfers: 10, totalValue: 42000, imageColor: '#1e40af', verified: true },
  { id: 'bp_012', cardName: '1989 Upper Deck Ken Griffey Jr RC PSA 10', player: 'Ken Griffey Jr', year: 1989, set: 'Upper Deck', grade: 'PSA 10', currentOwner: '0xd5a9...3c7e', authenticityScore: 98, network: 'polygon', mintDate: '2023-06-12', lastVerified: '2026-03-02', totalTransfers: 11, totalValue: 5500, imageColor: '#059669', verified: true },
  { id: 'bp_013', cardName: '2023 Bowman Chrome 1st Ethan Salas PSA 10', player: 'Ethan Salas', year: 2023, set: 'Bowman Chrome', grade: 'PSA 10', currentOwner: '0xf1b4...6d8a', authenticityScore: 91, network: 'solana', mintDate: '2024-09-15', lastVerified: '2026-03-07', totalTransfers: 2, totalValue: 180, imageColor: '#a855f7', verified: true },
  { id: 'bp_014', cardName: '2018 Prizm Trae Young RC Silver PSA 10', player: 'Trae Young', year: 2018, set: 'Prizm', grade: 'PSA 10', currentOwner: '0xe7c2...1f5b', authenticityScore: 94, network: 'polygon', mintDate: '2023-09-01', lastVerified: '2026-02-18', totalTransfers: 5, totalValue: 650, imageColor: '#dc2626', verified: true },
  { id: 'bp_015', cardName: '2020 Topps Chrome Luis Robert RC PSA 10', player: 'Luis Robert', year: 2020, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0xb3d8...9e2c', authenticityScore: 92, network: 'solana', mintDate: '2024-01-10', lastVerified: '2026-02-22', totalTransfers: 3, totalValue: 120, imageColor: '#0ea5e9', verified: false },
  { id: 'bp_016', cardName: '2023 Prizm CJ Stroud RC PSA 10', player: 'CJ Stroud', year: 2023, set: 'Prizm', grade: 'PSA 10', currentOwner: '0x2a9f...4d7e', authenticityScore: 95, network: 'polygon', mintDate: '2024-07-20', lastVerified: '2026-03-06', totalTransfers: 2, totalValue: 320, imageColor: '#b91c1c', verified: true },
  { id: 'bp_017', cardName: '2024 Topps Chrome Paul Skenes RC PSA 10', player: 'Paul Skenes', year: 2024, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0x8f5c...2b3a', authenticityScore: 90, network: 'solana', mintDate: '2025-02-14', lastVerified: '2026-03-13', totalTransfers: 1, totalValue: 95, imageColor: '#fbbf24', verified: true },
  { id: 'bp_018', cardName: '2022 Prizm Paolo Banchero RC PSA 10', player: 'Paolo Banchero', year: 2022, set: 'Prizm', grade: 'PSA 10', currentOwner: '0x6e1a...8c4d', authenticityScore: 93, network: 'polygon', mintDate: '2024-03-08', lastVerified: '2026-02-28', totalTransfers: 4, totalValue: 210, imageColor: '#2563eb', verified: true },
  { id: 'bp_019', cardName: '2021 Topps Chrome Julio Rodriguez RC PSA 10', player: 'Julio Rodriguez', year: 2021, set: 'Topps Chrome', grade: 'PSA 10', currentOwner: '0x4b7d...1e9f', authenticityScore: 96, network: 'ethereum', mintDate: '2024-04-22', lastVerified: '2026-03-04', totalTransfers: 3, totalValue: 380, imageColor: '#0d9488', verified: true },
  { id: 'bp_020', cardName: '2023 Select Caleb Williams RC PSA 10', player: 'Caleb Williams', year: 2023, set: 'Select', grade: 'PSA 10', currentOwner: '0xc1e4...5f2b', authenticityScore: 88, network: 'solana', mintDate: '2025-01-05', lastVerified: '2026-03-14', totalTransfers: 2, totalValue: 150, imageColor: '#c2410c', verified: false },
];

const PROVENANCE_EVENTS: ProvenanceEvent[] = [
  { id: 'pe_001', passportId: 'bp_001', eventType: 'minted', description: 'Card pulled from sealed 2003 Topps Chrome Hobby Box', timestamp: '2003-11-15T14:30:00Z', actor: 'Original Collector', location: 'Chicago, IL', txHash: '0xabc123...def456', value: 50 },
  { id: 'pe_002', passportId: 'bp_001', eventType: 'graded', description: 'Submitted to PSA, received Gem Mint 10 grade', timestamp: '2004-03-22T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xbcd234...efg567' },
  { id: 'pe_003', passportId: 'bp_001', eventType: 'sold', description: 'Sold via Heritage Auctions', timestamp: '2010-06-15T20:00:00Z', actor: 'Heritage Auctions', location: 'Dallas, TX', txHash: '0xcde345...fgh678', value: 2500 },
  { id: 'pe_004', passportId: 'bp_001', eventType: 'transferred', description: 'Private sale to investor group', timestamp: '2016-01-10T12:00:00Z', actor: 'Private', location: 'New York, NY', txHash: '0xdef456...ghi789', value: 28000 },
  { id: 'pe_005', passportId: 'bp_001', eventType: 'authenticated', description: 'Re-authenticated by PSA with hologram verification', timestamp: '2020-08-05T09:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xefg567...hij890' },
  { id: 'pe_006', passportId: 'bp_001', eventType: 'exhibited', description: 'Displayed at National Sports Collectors Convention', timestamp: '2021-07-28T08:00:00Z', actor: 'NSCC', location: 'Atlantic City, NJ', txHash: '0xfgh678...ijk901' },
  { id: 'pe_007', passportId: 'bp_001', eventType: 'insured', description: 'Insured with Collectibles Insurance Services for $500K', timestamp: '2022-02-14T16:00:00Z', actor: 'CIS', location: 'Hunt Valley, MD', txHash: '0xghi789...jkl012', value: 500000 },
  { id: 'pe_008', passportId: 'bp_001', eventType: 'sold', description: 'Sold via PWCC Marketplace', timestamp: '2023-01-15T18:00:00Z', actor: 'PWCC', location: 'Portland, OR', txHash: '0xhij890...klm123', value: 450000 },
  { id: 'pe_009', passportId: 'bp_002', eventType: 'minted', description: 'Card pulled from 2018 National Treasures case break', timestamp: '2018-12-10T19:00:00Z', actor: 'Breaker', location: 'Las Vegas, NV', txHash: '0xijk901...lmn234', value: 800 },
  { id: 'pe_010', passportId: 'bp_002', eventType: 'graded', description: 'Submitted to BGS, received 9.5 Gem Mint', timestamp: '2019-04-18T11:00:00Z', actor: 'BGS', location: 'Parsippany, NJ', txHash: '0xjkl012...mno345' },
  { id: 'pe_011', passportId: 'bp_002', eventType: 'sold', description: 'Listed and sold on eBay', timestamp: '2020-09-22T15:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xklm123...nop456', value: 15000 },
  { id: 'pe_012', passportId: 'bp_002', eventType: 'authenticated', description: 'Third-party authentication by COMC', timestamp: '2021-05-10T13:00:00Z', actor: 'COMC', location: 'Redmond, WA', txHash: '0xlmn234...opq567' },
  { id: 'pe_013', passportId: 'bp_002', eventType: 'sold', description: 'Sold via Goldin Auctions', timestamp: '2023-03-20T20:00:00Z', actor: 'Goldin', location: 'Runnemede, NJ', txHash: '0xmno345...pqr678', value: 125000 },
  { id: 'pe_014', passportId: 'bp_003', eventType: 'minted', description: 'Pulled from 2023 Topps Chrome Hobby Box', timestamp: '2024-01-20T16:00:00Z', actor: 'Collector', location: 'Houston, TX', txHash: '0xnop456...qrs789', value: 200 },
  { id: 'pe_015', passportId: 'bp_003', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2024-04-15T09:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xopq567...rst890' },
  { id: 'pe_016', passportId: 'bp_003', eventType: 'sold', description: 'Sold on eBay auction', timestamp: '2024-06-10T21:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xpqr678...stu901', value: 2850 },
  { id: 'pe_017', passportId: 'bp_004', eventType: 'minted', description: 'Purchased from original owner, 1986 Fleer wax pack', timestamp: '1986-10-01T12:00:00Z', actor: 'Original Collector', location: 'Charlotte, NC', txHash: '0xqrs789...tuv012', value: 1 },
  { id: 'pe_018', passportId: 'bp_004', eventType: 'graded', description: 'PSA Mint 9', timestamp: '2000-06-15T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xrst890...uvw123' },
  { id: 'pe_019', passportId: 'bp_004', eventType: 'sold', description: 'Sold at Huggins & Scott auction', timestamp: '2005-04-20T19:00:00Z', actor: 'Huggins & Scott', location: 'Dallas, TX', txHash: '0xstu901...vwx234', value: 4500 },
  { id: 'pe_020', passportId: 'bp_004', eventType: 'authenticated', description: 'Full authentication review by PSA', timestamp: '2010-09-10T14:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xtuv012...wxy345' },
  { id: 'pe_021', passportId: 'bp_004', eventType: 'exhibited', description: 'National Sports Collectors Convention display', timestamp: '2015-07-30T08:00:00Z', actor: 'NSCC', location: 'Chicago, IL', txHash: '0xuvw123...xyz456' },
  { id: 'pe_022', passportId: 'bp_004', eventType: 'insured', description: 'Lloyds of London specialty coverage', timestamp: '2020-01-05T11:00:00Z', actor: 'Lloyds', location: 'London, UK', txHash: '0xvwx234...yza567', value: 50000 },
  { id: 'pe_023', passportId: 'bp_004', eventType: 'sold', description: 'Sold via Heritage Auctions', timestamp: '2022-11-01T20:00:00Z', actor: 'Heritage', location: 'Dallas, TX', txHash: '0xwxy345...zab678', value: 35000 },
  { id: 'pe_024', passportId: 'bp_005', eventType: 'minted', description: 'Pulled from 2018 Topps Chrome Hobby', timestamp: '2018-09-15T15:00:00Z', actor: 'Collector', location: 'Los Angeles, CA', txHash: '0xxyz456...abc789', value: 5 },
  { id: 'pe_025', passportId: 'bp_005', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2019-01-22T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xyza567...bcd890' },
  { id: 'pe_026', passportId: 'bp_005', eventType: 'sold', description: 'Sold on eBay', timestamp: '2021-07-10T18:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xzab678...cde901', value: 850 },
  { id: 'pe_027', passportId: 'bp_005', eventType: 'sold', description: 'Sold via MySlabs marketplace', timestamp: '2023-05-15T16:00:00Z', actor: 'MySlabs', location: 'Online', txHash: '0xabc789...def012', value: 1200 },
  { id: 'pe_028', passportId: 'bp_006', eventType: 'minted', description: 'Pulled from 2020 Prizm Hobby Box', timestamp: '2020-11-20T14:00:00Z', actor: 'Collector', location: 'Portland, OR', txHash: '0xbcd890...efg123', value: 20 },
  { id: 'pe_029', passportId: 'bp_006', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2021-03-15T09:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xcde901...fgh234' },
  { id: 'pe_030', passportId: 'bp_006', eventType: 'sold', description: 'Private sale', timestamp: '2022-01-08T12:00:00Z', actor: 'Private', location: 'San Diego, CA', txHash: '0xdef012...ghi345', value: 600 },
  { id: 'pe_031', passportId: 'bp_006', eventType: 'transferred', description: 'Transferred to new owner', timestamp: '2023-08-22T10:00:00Z', actor: 'Owner', location: 'Denver, CO', txHash: '0xefg123...hij456', value: 450 },
  { id: 'pe_032', passportId: 'bp_007', eventType: 'minted', description: 'Purchased from card shop', timestamp: '2001-08-10T10:00:00Z', actor: 'Card Shop', location: 'St. Louis, MO', txHash: '0xfgh234...ijk567', value: 3 },
  { id: 'pe_033', passportId: 'bp_007', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2005-02-20T11:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xghi345...jkl678' },
  { id: 'pe_034', passportId: 'bp_007', eventType: 'sold', description: 'Heritage Auctions', timestamp: '2015-05-18T20:00:00Z', actor: 'Heritage', location: 'Dallas, TX', txHash: '0xhij456...klm789', value: 3200 },
  { id: 'pe_035', passportId: 'bp_007', eventType: 'sold', description: 'PWCC Marketplace', timestamp: '2023-02-10T18:00:00Z', actor: 'PWCC', location: 'Portland, OR', txHash: '0xijk567...lmn890', value: 8500 },
  { id: 'pe_036', passportId: 'bp_008', eventType: 'minted', description: 'Pulled from 2019 Prizm Hobby', timestamp: '2019-12-15T16:00:00Z', actor: 'Collector', location: 'New Orleans, LA', txHash: '0xjkl678...mno901', value: 40 },
  { id: 'pe_037', passportId: 'bp_008', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2020-06-10T09:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xklm789...nop012' },
  { id: 'pe_038', passportId: 'bp_008', eventType: 'sold', description: 'Sold on eBay at peak', timestamp: '2021-02-15T21:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xlmn890...opq123', value: 1800 },
  { id: 'pe_039', passportId: 'bp_008', eventType: 'sold', description: 'Sold via Whatnot live break', timestamp: '2023-07-18T20:00:00Z', actor: 'Whatnot', location: 'Marina del Rey, CA', txHash: '0xmno901...pqr234', value: 280 },
  { id: 'pe_040', passportId: 'bp_009', eventType: 'minted', description: 'Case break hit', timestamp: '2017-12-20T19:00:00Z', actor: 'Breaker', location: 'Kansas City, MO', txHash: '0xnop012...qrs345', value: 500 },
  { id: 'pe_041', passportId: 'bp_009', eventType: 'graded', description: 'BGS Mint 9', timestamp: '2018-05-22T10:00:00Z', actor: 'BGS', location: 'Parsippany, NJ', txHash: '0xopq123...rst456' },
  { id: 'pe_042', passportId: 'bp_009', eventType: 'authenticated', description: 'Beckett Authentication review', timestamp: '2020-03-15T14:00:00Z', actor: 'Beckett', location: 'Parsippany, NJ', txHash: '0xpqr234...stu567' },
  { id: 'pe_043', passportId: 'bp_009', eventType: 'sold', description: 'Goldin Auctions', timestamp: '2023-04-05T20:00:00Z', actor: 'Goldin', location: 'Runnemede, NJ', txHash: '0xqrs345...tuv678', value: 95000 },
  { id: 'pe_044', passportId: 'bp_010', eventType: 'minted', description: 'Pulled from 2011 Topps Update pack', timestamp: '2011-10-05T14:00:00Z', actor: 'Collector', location: 'Anaheim, CA', txHash: '0xrst456...uvw789', value: 2 },
  { id: 'pe_045', passportId: 'bp_010', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2013-01-15T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xstu567...vwx890' },
  { id: 'pe_046', passportId: 'bp_010', eventType: 'sold', description: 'eBay auction', timestamp: '2019-06-20T21:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xtuv678...wxy901', value: 12000 },
  { id: 'pe_047', passportId: 'bp_010', eventType: 'insured', description: 'Specialty insurance coverage', timestamp: '2021-04-10T11:00:00Z', actor: 'CIS', location: 'Hunt Valley, MD', txHash: '0xuvw789...xyz012', value: 75000 },
  { id: 'pe_048', passportId: 'bp_010', eventType: 'sold', description: 'Heritage Auctions', timestamp: '2022-12-20T20:00:00Z', actor: 'Heritage', location: 'Dallas, TX', txHash: '0xvwx890...yza123', value: 65000 },
  { id: 'pe_049', passportId: 'bp_011', eventType: 'minted', description: 'Purchased from hobby shop', timestamp: '1993-06-01T12:00:00Z', actor: 'Hobby Shop', location: 'Kalamazoo, MI', txHash: '0xwxy901...zab234', value: 10 },
  { id: 'pe_050', passportId: 'bp_011', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2002-09-20T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xxyz012...abc345' },
  { id: 'pe_051', passportId: 'bp_011', eventType: 'sold', description: 'Robert Edward Auctions', timestamp: '2015-04-15T19:00:00Z', actor: 'REA', location: 'Chester, NJ', txHash: '0xyza123...bcd456', value: 18000 },
  { id: 'pe_052', passportId: 'bp_011', eventType: 'sold', description: 'Goldin Auctions', timestamp: '2023-01-28T20:00:00Z', actor: 'Goldin', location: 'Runnemede, NJ', txHash: '0xzab234...cde567', value: 42000 },
  { id: 'pe_053', passportId: 'bp_012', eventType: 'minted', description: 'Purchased from card shop', timestamp: '1989-04-10T10:00:00Z', actor: 'Card Shop', location: 'Seattle, WA', txHash: '0xabc345...def678', value: 1 },
  { id: 'pe_054', passportId: 'bp_012', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2005-07-22T11:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xbcd456...efg789' },
  { id: 'pe_055', passportId: 'bp_012', eventType: 'sold', description: 'eBay auction', timestamp: '2020-12-18T20:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xcde567...fgh890', value: 4200 },
  { id: 'pe_056', passportId: 'bp_012', eventType: 'sold', description: 'PWCC Marketplace', timestamp: '2023-06-12T18:00:00Z', actor: 'PWCC', location: 'Portland, OR', txHash: '0xdef678...ghi901', value: 5500 },
  { id: 'pe_057', passportId: 'bp_013', eventType: 'minted', description: 'Pulled from 2023 Bowman Chrome Hobby', timestamp: '2024-02-10T15:00:00Z', actor: 'Collector', location: 'San Diego, CA', txHash: '0xefg789...hij012', value: 30 },
  { id: 'pe_058', passportId: 'bp_013', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2024-06-20T09:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xfgh890...ijk123' },
  { id: 'pe_059', passportId: 'bp_014', eventType: 'minted', description: 'Pulled from 2018 Prizm Hobby Box', timestamp: '2018-10-22T16:00:00Z', actor: 'Collector', location: 'Atlanta, GA', txHash: '0xghi901...jkl234', value: 15 },
  { id: 'pe_060', passportId: 'bp_014', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2019-03-10T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xhij012...klm345' },
  { id: 'pe_061', passportId: 'bp_014', eventType: 'sold', description: 'eBay Buy It Now', timestamp: '2023-09-01T14:00:00Z', actor: 'eBay', location: 'San Jose, CA', txHash: '0xijk123...lmn456', value: 650 },
  { id: 'pe_062', passportId: 'bp_016', eventType: 'minted', description: 'Pulled from 2023 Prizm Hobby Box', timestamp: '2024-03-10T14:00:00Z', actor: 'Collector', location: 'Houston, TX', txHash: '0xjkl234...mno567', value: 25 },
  { id: 'pe_063', passportId: 'bp_016', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2024-07-20T10:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xklm345...nop678' },
  { id: 'pe_064', passportId: 'bp_019', eventType: 'minted', description: 'Pulled from 2021 Topps Chrome Hobby', timestamp: '2022-05-15T15:00:00Z', actor: 'Collector', location: 'Seattle, WA', txHash: '0xlmn456...opq789', value: 10 },
  { id: 'pe_065', passportId: 'bp_019', eventType: 'graded', description: 'PSA Gem Mint 10', timestamp: '2022-10-20T09:00:00Z', actor: 'PSA', location: 'Santa Ana, CA', txHash: '0xmno567...pqr890' },
];

const OWNERSHIP_RECORDS: OwnershipRecord[] = [
  { id: 'or_001', passportId: 'bp_001', owner: '0x7a3f...8b2c', acquiredDate: '2023-01-15', soldDate: null, purchasePrice: 450000, salePrice: null, verified: true, network: 'ethereum', txHash: '0xhij890...klm123' },
  { id: 'or_002', passportId: 'bp_001', owner: '0xb4e2...1c7d', acquiredDate: '2016-01-10', soldDate: '2023-01-15', purchasePrice: 28000, salePrice: 450000, verified: true, network: 'ethereum', txHash: '0xdef456...ghi789' },
  { id: 'or_003', passportId: 'bp_001', owner: '0xc9f1...3a5e', acquiredDate: '2010-06-15', soldDate: '2016-01-10', purchasePrice: 2500, salePrice: 28000, verified: true, network: 'ethereum', txHash: '0xcde345...fgh678' },
  { id: 'or_004', passportId: 'bp_002', owner: '0x2b1c...4d9e', acquiredDate: '2023-03-20', soldDate: null, purchasePrice: 125000, salePrice: null, verified: true, network: 'polygon', txHash: '0xmno345...pqr678' },
  { id: 'or_005', passportId: 'bp_002', owner: '0xd8a3...6e2f', acquiredDate: '2020-09-22', soldDate: '2023-03-20', purchasePrice: 15000, salePrice: 125000, verified: true, network: 'polygon', txHash: '0xklm123...nop456' },
  { id: 'or_006', passportId: 'bp_003', owner: '0x9e4d...1a7f', acquiredDate: '2024-06-10', soldDate: null, purchasePrice: 2850, salePrice: null, verified: true, network: 'ethereum', txHash: '0xpqr678...stu901' },
  { id: 'or_007', passportId: 'bp_004', owner: '0x5c2a...3e8b', acquiredDate: '2022-11-01', soldDate: null, purchasePrice: 35000, salePrice: null, verified: true, network: 'ethereum', txHash: '0xwxy345...zab678' },
  { id: 'or_008', passportId: 'bp_004', owner: '0xe7b4...8f1c', acquiredDate: '2005-04-20', soldDate: '2022-11-01', purchasePrice: 4500, salePrice: 35000, verified: true, network: 'ethereum', txHash: '0xstu901...vwx234' },
  { id: 'or_009', passportId: 'bp_005', owner: '0x1f8e...6c3d', acquiredDate: '2023-05-15', soldDate: null, purchasePrice: 1200, salePrice: null, verified: true, network: 'polygon', txHash: '0xabc789...def012' },
  { id: 'or_010', passportId: 'bp_006', owner: '0x8d4b...2f1a', acquiredDate: '2023-08-22', soldDate: null, purchasePrice: 450, salePrice: null, verified: true, network: 'solana', txHash: '0xefg123...hij456' },
  { id: 'or_011', passportId: 'bp_007', owner: '0x3a7e...9d4c', acquiredDate: '2023-02-10', soldDate: null, purchasePrice: 8500, salePrice: null, verified: true, network: 'ethereum', txHash: '0xijk567...lmn890' },
  { id: 'or_012', passportId: 'bp_008', owner: '0x6b2f...5e8a', acquiredDate: '2023-07-18', soldDate: null, purchasePrice: 280, salePrice: null, verified: true, network: 'polygon', txHash: '0xmno901...pqr234' },
  { id: 'or_013', passportId: 'bp_009', owner: '0x4e1d...7a3b', acquiredDate: '2023-04-05', soldDate: null, purchasePrice: 95000, salePrice: null, verified: true, network: 'ethereum', txHash: '0xqrs345...tuv678' },
  { id: 'or_014', passportId: 'bp_010', owner: '0xa2c5...8e1f', acquiredDate: '2022-12-20', soldDate: null, purchasePrice: 65000, salePrice: null, verified: true, network: 'ethereum', txHash: '0xvwx890...yza123' },
  { id: 'or_015', passportId: 'bp_011', owner: '0xc8f3...4b2d', acquiredDate: '2023-01-28', soldDate: null, purchasePrice: 42000, salePrice: null, verified: true, network: 'ethereum', txHash: '0xzab234...cde567' },
  { id: 'or_016', passportId: 'bp_012', owner: '0xd5a9...3c7e', acquiredDate: '2023-06-12', soldDate: null, purchasePrice: 5500, salePrice: null, verified: true, network: 'polygon', txHash: '0xdef678...ghi901' },
  { id: 'or_017', passportId: 'bp_013', owner: '0xf1b4...6d8a', acquiredDate: '2024-09-15', soldDate: null, purchasePrice: 180, salePrice: null, verified: true, network: 'solana', txHash: '0xfgh890...ijk123' },
  { id: 'or_018', passportId: 'bp_014', owner: '0xe7c2...1f5b', acquiredDate: '2023-09-01', soldDate: null, purchasePrice: 650, salePrice: null, verified: true, network: 'polygon', txHash: '0xijk123...lmn456' },
  { id: 'or_019', passportId: 'bp_015', owner: '0xb3d8...9e2c', acquiredDate: '2024-01-10', soldDate: null, purchasePrice: 120, salePrice: null, verified: false, network: 'solana', txHash: '0xklm345...nop678' },
  { id: 'or_020', passportId: 'bp_016', owner: '0x2a9f...4d7e', acquiredDate: '2024-07-20', soldDate: null, purchasePrice: 320, salePrice: null, verified: true, network: 'polygon', txHash: '0xlmn456...opq789' },
];

const DIGITAL_TWINS: DigitalTwin[] = [
  { id: 'dt_001', passportId: 'bp_001', tokenId: '42001', contractAddress: '0x1234...abcd', network: 'ethereum', metadataUri: 'ipfs://Qm...abc123', imageUri: 'ipfs://Qm...img001', mintedAt: '2023-01-15', currentOwner: '0x7a3f...8b2c', floorPrice: 12500, lastSale: 15000 },
  { id: 'dt_002', passportId: 'bp_002', tokenId: '38002', contractAddress: '0x2345...bcde', network: 'polygon', metadataUri: 'ipfs://Qm...abc234', imageUri: 'ipfs://Qm...img002', mintedAt: '2023-03-20', currentOwner: '0x2b1c...4d9e', floorPrice: 3200, lastSale: 3800 },
  { id: 'dt_003', passportId: 'bp_004', tokenId: '10003', contractAddress: '0x3456...cdef', network: 'ethereum', metadataUri: 'ipfs://Qm...abc345', imageUri: 'ipfs://Qm...img003', mintedAt: '2022-11-01', currentOwner: '0x5c2a...3e8b', floorPrice: 8500, lastSale: 9200 },
  { id: 'dt_004', passportId: 'bp_009', tokenId: '55004', contractAddress: '0x4567...defg', network: 'ethereum', metadataUri: 'ipfs://Qm...abc456', imageUri: 'ipfs://Qm...img004', mintedAt: '2023-04-05', currentOwner: '0x4e1d...7a3b', floorPrice: 22000, lastSale: 25000 },
  { id: 'dt_005', passportId: 'bp_010', tokenId: '71005', contractAddress: '0x5678...efgh', network: 'ethereum', metadataUri: 'ipfs://Qm...abc567', imageUri: 'ipfs://Qm...img005', mintedAt: '2022-12-20', currentOwner: '0xa2c5...8e1f', floorPrice: 15000, lastSale: 18000 },
  { id: 'dt_006', passportId: 'bp_011', tokenId: '93006', contractAddress: '0x6789...fghi', network: 'ethereum', metadataUri: 'ipfs://Qm...abc678', imageUri: 'ipfs://Qm...img006', mintedAt: '2023-01-28', currentOwner: '0xc8f3...4b2d', floorPrice: 9500, lastSale: 11000 },
  { id: 'dt_007', passportId: 'bp_003', tokenId: '12007', contractAddress: '0x789a...ghij', network: 'ethereum', metadataUri: 'ipfs://Qm...abc789', imageUri: 'ipfs://Qm...img007', mintedAt: '2024-06-10', currentOwner: '0x9e4d...1a7f', floorPrice: 500, lastSale: 650 },
  { id: 'dt_008', passportId: 'bp_005', tokenId: '28008', contractAddress: '0x89ab...hijk', network: 'polygon', metadataUri: 'ipfs://Qm...abc890', imageUri: 'ipfs://Qm...img008', mintedAt: '2023-05-15', currentOwner: '0x1f8e...6c3d', floorPrice: 280, lastSale: 320 },
  { id: 'dt_009', passportId: 'bp_007', tokenId: '44009', contractAddress: '0x9abc...ijkl', network: 'ethereum', metadataUri: 'ipfs://Qm...abc901', imageUri: 'ipfs://Qm...img009', mintedAt: '2023-02-10', currentOwner: '0x3a7e...9d4c', floorPrice: 1800, lastSale: 2200 },
  { id: 'dt_010', passportId: 'bp_012', tokenId: '67010', contractAddress: '0xabcd...jklm', network: 'polygon', metadataUri: 'ipfs://Qm...abc012', imageUri: 'ipfs://Qm...img010', mintedAt: '2023-06-12', currentOwner: '0xd5a9...3c7e', floorPrice: 1100, lastSale: 1400 },
];

const SMART_CONTRACTS: SmartContract[] = [
  { id: 'sc_001', name: 'Escrow Sale', type: 'escrow', description: 'Holds funds in escrow until buyer confirms receipt and authenticity of physical card', network: 'ethereum', address: '0xESCR...OW01', deployedAt: '2023-01-01', totalTransactions: 2847, tvl: 4200000, status: 'active' },
  { id: 'sc_002', name: 'Grading Verification', type: 'verification', description: 'Automatically verifies and records grading company results on-chain', network: 'polygon', address: '0xGRAD...VR02', deployedAt: '2023-02-15', totalTransactions: 15230, tvl: 0, status: 'active' },
  { id: 'sc_003', name: 'Fractional Ownership', type: 'fractional', description: 'Enables fractional ownership of high-value cards through ERC-1155 tokens', network: 'ethereum', address: '0xFRAC...OW03', deployedAt: '2023-04-10', totalTransactions: 892, tvl: 18500000, status: 'active' },
  { id: 'sc_004', name: 'Auction Contract', type: 'auction', description: 'Decentralized auction with automatic settlement and provenance update', network: 'ethereum', address: '0xAUCT...ON04', deployedAt: '2023-03-20', totalTransactions: 1456, tvl: 2800000, status: 'active' },
  { id: 'sc_005', name: 'Insurance Pool', type: 'insurance', description: 'Pooled insurance coverage for registered card passports with automatic claims', network: 'polygon', address: '0xINSR...PL05', deployedAt: '2023-06-01', totalTransactions: 634, tvl: 8900000, status: 'active' },
  { id: 'sc_006', name: 'Provenance Registry', type: 'registry', description: 'Core registry contract that stores all provenance events immutably', network: 'ethereum', address: '0xPROV...RG06', deployedAt: '2022-11-15', totalTransactions: 45890, tvl: 0, status: 'active' },
  { id: 'sc_007', name: 'Royalty Distribution', type: 'royalty', description: 'Distributes royalties to original creators/graders on secondary sales', network: 'polygon', address: '0xROYL...DT07', deployedAt: '2023-07-22', totalTransactions: 3210, tvl: 450000, status: 'active' },
  { id: 'sc_008', name: 'Authentication Oracle', type: 'oracle', description: 'Oracle contract linking physical authentication results to on-chain records', network: 'ethereum', address: '0xAUTH...OR08', deployedAt: '2023-05-10', totalTransactions: 8920, tvl: 0, status: 'active' },
];

const TRANSACTION_RECORDS: TransactionRecord[] = [
  { id: 'tx_001', passportId: 'bp_001', txHash: '0xhij890...klm123', blockNumber: 18542301, network: 'ethereum', from: '0xb4e2...1c7d', to: '0x7a3f...8b2c', value: 450000, gasFee: 45.20, timestamp: '2023-01-15T18:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_002', passportId: 'bp_002', txHash: '0xmno345...pqr678', blockNumber: 19234567, network: 'polygon', from: '0xd8a3...6e2f', to: '0x2b1c...4d9e', value: 125000, gasFee: 0.15, timestamp: '2023-03-20T20:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_003', passportId: 'bp_003', txHash: '0xpqr678...stu901', blockNumber: 20456789, network: 'ethereum', from: '0xa1b2...c3d4', to: '0x9e4d...1a7f', value: 2850, gasFee: 18.50, timestamp: '2024-06-10T21:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_004', passportId: 'bp_004', txHash: '0xwxy345...zab678', blockNumber: 17890123, network: 'ethereum', from: '0xe7b4...8f1c', to: '0x5c2a...3e8b', value: 35000, gasFee: 32.80, timestamp: '2022-11-01T20:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_005', passportId: 'bp_005', txHash: '0xabc789...def012', blockNumber: 19876543, network: 'polygon', from: '0xf2c3...d4e5', to: '0x1f8e...6c3d', value: 1200, gasFee: 0.08, timestamp: '2023-05-15T16:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_006', passportId: 'bp_006', txHash: '0xefg123...hij456', blockNumber: 20123456, network: 'solana', from: '8Kx4...9Lr2', to: '0x8d4b...2f1a', value: 450, gasFee: 0.002, timestamp: '2023-08-22T10:00:00Z', type: 'transfer', status: 'confirmed' },
  { id: 'tx_007', passportId: 'bp_007', txHash: '0xijk567...lmn890', blockNumber: 18234567, network: 'ethereum', from: '0xg3h4...i5j6', to: '0x3a7e...9d4c', value: 8500, gasFee: 22.40, timestamp: '2023-02-10T18:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_008', passportId: 'bp_008', txHash: '0xmno901...pqr234', blockNumber: 19567890, network: 'polygon', from: '0xk7l8...m9n0', to: '0x6b2f...5e8a', value: 280, gasFee: 0.05, timestamp: '2023-07-18T20:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_009', passportId: 'bp_009', txHash: '0xqrs345...tuv678', blockNumber: 18987654, network: 'ethereum', from: '0xo1p2...q3r4', to: '0x4e1d...7a3b', value: 95000, gasFee: 38.90, timestamp: '2023-04-05T20:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_010', passportId: 'bp_010', txHash: '0xvwx890...yza123', blockNumber: 17654321, network: 'ethereum', from: '0xs5t6...u7v8', to: '0xa2c5...8e1f', value: 65000, gasFee: 28.30, timestamp: '2022-12-20T20:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_011', passportId: 'bp_011', txHash: '0xzab234...cde567', blockNumber: 18345678, network: 'ethereum', from: '0xw9x0...y1z2', to: '0xc8f3...4b2d', value: 42000, gasFee: 25.60, timestamp: '2023-01-28T20:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_012', passportId: 'bp_012', txHash: '0xdef678...ghi901', blockNumber: 19678901, network: 'polygon', from: '0xa3b4...c5d6', to: '0xd5a9...3c7e', value: 5500, gasFee: 0.12, timestamp: '2023-06-12T18:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_013', passportId: 'bp_013', txHash: '0xfgh890...ijk123', blockNumber: 21345678, network: 'solana', from: '5Mn3...4Kp8', to: '0xf1b4...6d8a', value: 180, gasFee: 0.001, timestamp: '2024-09-15T15:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_014', passportId: 'bp_014', txHash: '0xijk123...lmn456', blockNumber: 20012345, network: 'polygon', from: '0xe7f8...g9h0', to: '0xe7c2...1f5b', value: 650, gasFee: 0.06, timestamp: '2023-09-01T14:00:00Z', type: 'sale', status: 'confirmed' },
  { id: 'tx_015', passportId: 'bp_016', txHash: '0xlmn456...opq789', blockNumber: 20789012, network: 'polygon', from: '0xi1j2...k3l4', to: '0x2a9f...4d7e', value: 320, gasFee: 0.04, timestamp: '2024-07-20T10:00:00Z', type: 'sale', status: 'confirmed' },
];

const VERIFICATION_RESULTS: VerificationResult[] = [
  { id: 'vr_001', passportId: 'bp_001', cardName: '2003 Topps Chrome LeBron James RC PSA 10', result: 'verified', authenticityScore: 99, verifiedAt: '2026-03-10T14:00:00Z', verifier: 'PSA Authentication Oracle', blockNumber: 22345678, txHash: '0xver001...abc', notes: 'All checks passed. Hologram verified. Grade confirmed.' },
  { id: 'vr_002', passportId: 'bp_002', cardName: '2018 National Treasures Luka Doncic RPA /99', result: 'verified', authenticityScore: 97, verifiedAt: '2026-03-08T10:00:00Z', verifier: 'BGS Verification Oracle', blockNumber: 22234567, txHash: '0xver002...def', notes: 'Slab integrity confirmed. Serial number matches registry.' },
  { id: 'vr_003', passportId: 'bp_003', cardName: '2023 Topps Chrome Wembanyama RC PSA 10', result: 'verified', authenticityScore: 98, verifiedAt: '2026-03-12T09:00:00Z', verifier: 'PSA Authentication Oracle', blockNumber: 22456789, txHash: '0xver003...ghi', notes: 'Gem Mint 10 confirmed. Digital twin linked.' },
  { id: 'vr_004', passportId: 'bp_015', cardName: '2020 Topps Chrome Luis Robert RC PSA 10', result: 'pending', authenticityScore: 85, verifiedAt: '2026-03-14T11:00:00Z', verifier: 'Manual Review', blockNumber: 0, txHash: '', notes: 'Awaiting physical inspection. Preliminary scan shows minor concern with slab seal.' },
  { id: 'vr_005', passportId: 'bp_020', cardName: '2023 Select Caleb Williams RC PSA 10', result: 'pending', authenticityScore: 88, verifiedAt: '2026-03-14T16:00:00Z', verifier: 'PSA Authentication Oracle', blockNumber: 0, txHash: '', notes: 'Grade verification in progress. Certificate number being cross-referenced.' },
];

const PASSPORT_TEMPLATES: PassportTemplate[] = [
  { id: 'pt_001', name: 'Standard Passport', description: 'Basic provenance tracking with ownership history and grading records', network: 'polygon', features: ['Ownership tracking', 'Grade recording', 'Transfer history', 'Basic verification'], costToMint: 5, popularity: 85 },
  { id: 'pt_002', name: 'Premium Passport', description: 'Enhanced tracking with digital twin NFT and insurance integration', network: 'ethereum', features: ['All Standard features', 'Digital twin NFT', 'Insurance integration', 'Exhibition tracking', 'Detailed provenance'], costToMint: 25, popularity: 62 },
  { id: 'pt_003', name: 'Vault Passport', description: 'Maximum security with multi-sig ownership and fractional capabilities', network: 'ethereum', features: ['All Premium features', 'Multi-sig ownership', 'Fractional support', 'Priority verification', 'Legal documentation'], costToMint: 75, popularity: 28 },
  { id: 'pt_004', name: 'Quick Passport', description: 'Fast and affordable passport on Solana for mid-range cards', network: 'solana', features: ['Ownership tracking', 'Grade recording', 'Fast minting', 'Low cost'], costToMint: 1, popularity: 71 },
];

// ── Public API ───────────────────────────────────────────────────────────────

export function getCardPassports(limit?: number): CardPassport[] {
  const cached = loadData<CardPassport[]>('passports');
  if (cached && cached.length > 0) return limit ? cached.slice(0, limit) : cached;
  saveData('passports', PASSPORTS);
  return limit ? PASSPORTS.slice(0, limit) : PASSPORTS;
}

export function getPassportDetails(passportId: string): CardPassport | null {
  const passports = getCardPassports();
  return passports.find(p => p.id === passportId) ?? null;
}

export function getProvenanceChain(passportId?: string): ProvenanceEvent[] {
  const cached = loadData<ProvenanceEvent[]>('provenance');
  const events = cached && cached.length > 0 ? cached : PROVENANCE_EVENTS;
  if (!cached || cached.length === 0) saveData('provenance', PROVENANCE_EVENTS);
  return passportId ? events.filter(e => e.passportId === passportId) : events;
}

export function getOwnershipHistory(passportId?: string): OwnershipRecord[] {
  const cached = loadData<OwnershipRecord[]>('ownership');
  const records = cached && cached.length > 0 ? cached : OWNERSHIP_RECORDS;
  if (!cached || cached.length === 0) saveData('ownership', OWNERSHIP_RECORDS);
  return passportId ? records.filter(r => r.passportId === passportId) : records;
}

export function getAuthenticityScore(passportId: string): number {
  const passport = getPassportDetails(passportId);
  return passport?.authenticityScore ?? 0;
}

export function getDigitalTwins(): DigitalTwin[] {
  const cached = loadData<DigitalTwin[]>('digital_twins');
  if (cached && cached.length > 0) return cached;
  saveData('digital_twins', DIGITAL_TWINS);
  return DIGITAL_TWINS;
}

export function getSmartContracts(): SmartContract[] {
  const cached = loadData<SmartContract[]>('smart_contracts');
  if (cached && cached.length > 0) return cached;
  saveData('smart_contracts', SMART_CONTRACTS);
  return SMART_CONTRACTS;
}

export function verifyCard(passportId: string): VerificationResult | null {
  const results = getRecentVerifications();
  return results.find(r => r.passportId === passportId) ?? null;
}

export function getTransactionHistory(passportId?: string): TransactionRecord[] {
  const cached = loadData<TransactionRecord[]>('transactions');
  const records = cached && cached.length > 0 ? cached : TRANSACTION_RECORDS;
  if (!cached || cached.length === 0) saveData('transactions', TRANSACTION_RECORDS);
  return passportId ? records.filter(r => r.passportId === passportId) : records;
}

export function getPassportTemplates(): PassportTemplate[] {
  const cached = loadData<PassportTemplate[]>('templates');
  if (cached && cached.length > 0) return cached;
  saveData('templates', PASSPORT_TEMPLATES);
  return PASSPORT_TEMPLATES;
}

export function getChainOfCustody(passportId: string): ChainOfCustody | null {
  const passport = getPassportDetails(passportId);
  if (!passport) return null;
  const events = getProvenanceChain(passportId);
  return {
    passportId,
    cardName: passport.cardName,
    totalOwners: passport.totalTransfers + 1,
    totalEvents: events.length,
    firstEvent: events.length > 0 ? events[0].timestamp : '',
    lastEvent: events.length > 0 ? events[events.length - 1].timestamp : '',
    integrityScore: passport.authenticityScore,
    chain: events,
  };
}

export function getNFTLinks(passportId?: string): NFTLink[] {
  const twins = getDigitalTwins();
  const links: NFTLink[] = twins.map(t => ({
    passportId: t.passportId,
    tokenId: t.tokenId,
    network: t.network,
    marketplace: t.network === 'ethereum' ? 'OpenSea' : t.network === 'polygon' ? 'OpenSea (Polygon)' : 'Magic Eden',
    url: `https://marketplace.example/${t.network}/${t.contractAddress}/${t.tokenId}`,
  }));
  return passportId ? links.filter(l => l.passportId === passportId) : links;
}

export function getNetworkStats(): { network: BlockchainNetwork; transactions: number; avgSpeed: string; avgCost: number; passports: number }[] {
  const passports = getCardPassports();
  const txs = getTransactionHistory();
  const networks: BlockchainNetwork[] = ['ethereum', 'polygon', 'solana', 'cardano', 'immutable_x', 'flow'];
  return networks.map(n => ({
    network: n,
    transactions: txs.filter(t => t.network === n).length,
    avgSpeed: n === 'ethereum' ? '12s' : n === 'polygon' ? '2s' : n === 'solana' ? '0.4s' : n === 'cardano' ? '20s' : n === 'immutable_x' ? '1s' : '2.5s',
    avgCost: n === 'ethereum' ? 25.50 : n === 'polygon' ? 0.08 : n === 'solana' ? 0.002 : n === 'cardano' ? 0.20 : n === 'immutable_x' ? 0 : 0.01,
    passports: passports.filter(p => p.network === n).length,
  }));
}

export function getRecentVerifications(limit?: number): VerificationResult[] {
  const cached = loadData<VerificationResult[]>('verifications');
  if (cached && cached.length > 0) return limit ? cached.slice(0, limit) : cached;
  saveData('verifications', VERIFICATION_RESULTS);
  return limit ? VERIFICATION_RESULTS.slice(0, limit) : VERIFICATION_RESULTS;
}

export function getNetworkConfig(network: BlockchainNetwork): { label: string; text: string; bg: string; border: string } {
  const map: Record<BlockchainNetwork, { label: string; text: string; bg: string; border: string }> = {
    ethereum: { label: 'Ethereum', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    polygon: { label: 'Polygon', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    solana: { label: 'Solana', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    cardano: { label: 'Cardano', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    immutable_x: { label: 'Immutable X', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    flow: { label: 'Flow', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  };
  return map[network];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}
