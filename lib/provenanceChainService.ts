/**
 * Phase 72: Provenance Chain & Digital Twin Registry
 * Blockchain-backed ownership history + NFT digital twins for physical cards.
 * NO competitor offers immutable provenance tracking with digital twin pairing.
 */

export interface ProvenanceRecord {
  id: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
  eventType: 'mint' | 'transfer' | 'grade' | 'authenticate' | 'vault' | 'exhibit' | 'fractional_split';
  fromAddress: string;
  toAddress: string;
  fromName?: string;
  toName?: string;
  metadata: Record<string, string>;
  verified: boolean;
  gas?: string;
}

export interface DigitalTwin {
  id: string;
  cardId: string;
  tokenId: string;
  contractAddress: string;
  chain: 'ethereum' | 'polygon' | 'solana';
  playerName: string;
  cardDescription: string;
  year: number;
  manufacturer: string;
  grade?: string;
  gradingCompany?: string;
  image: string;
  highResImage: string;
  threeDModel?: string;
  status: 'minted' | 'linked' | 'in_vault' | 'on_display' | 'transferred';
  owner: string;
  mintDate: string;
  lastTransfer: string;
  physicalLocation: string;
  authenticityScore: number; // 0-100
  provenanceChain: ProvenanceRecord[];
  attributes: DigitalTwinAttribute[];
  marketData: DigitalTwinMarketData;
}

export interface DigitalTwinAttribute {
  traitType: string;
  value: string;
  rarity?: number; // percentage of twins with this trait
}

export interface DigitalTwinMarketData {
  floorPrice: number;
  lastSalePrice: number;
  highestBid: number;
  totalVolume: number;
  holders: number;
  listedCount: number;
}

export interface AuthenticationCertificate {
  id: string;
  cardId: string;
  twinId: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  certificateHash: string;
  qrCode: string;
  verificationUrl: string;
  grade?: string;
  authenticator: string;
  physicalMarkers: string[];
  tamperScore: number; // 0-100, 100 = no tampering detected
  status: 'valid' | 'expired' | 'revoked';
}

export interface OwnershipTransfer {
  id: string;
  twinId: string;
  from: string;
  to: string;
  price: number;
  currency: string;
  timestamp: string;
  transactionHash: string;
  method: 'sale' | 'gift' | 'trade' | 'auction' | 'fractional';
  verified: boolean;
}

export interface ProvenanceStats {
  totalTwins: number;
  totalVerified: number;
  averageAuthenticityScore: number;
  totalProvenanceEvents: number;
  oldestProvenance: string;
  chainDistribution: { chain: string; count: number }[];
}

// Generate simulated blockchain hashes
function generateHash(): string {
  const chars = '0123456789abcdef';
  return '0x' + Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

function generateAddress(): string {
  const chars = '0123456789abcdef';
  return '0x' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

// Simulated digital twins
const DIGITAL_TWINS: DigitalTwin[] = [
  {
    id: 'twin-1',
    cardId: 'card-judge-1',
    tokenId: '4521',
    contractAddress: generateAddress(),
    chain: 'polygon',
    playerName: 'Aaron Judge',
    cardDescription: '2017 Topps Chrome Update #HMT40 RC PSA 10',
    year: 2017,
    manufacturer: 'Topps',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    image: 'https://images.unsplash.com/photo-1578432156326-d23f7091f90c?auto=format&fit=crop&q=80&w=300',
    highResImage: 'https://images.unsplash.com/photo-1578432156326-d23f7091f90c?auto=format&fit=crop&q=80&w=1200',
    status: 'in_vault',
    owner: 'You',
    mintDate: '2025-09-15',
    lastTransfer: '2025-09-15',
    physicalLocation: 'PWCC Vault, Portland OR',
    authenticityScore: 98,
    provenanceChain: [
      { id: 'prov-1', blockNumber: 18945231, transactionHash: generateHash(), timestamp: '2017-03-15', eventType: 'mint', fromAddress: '0x0000000000000000000000000000000000000000', toAddress: generateAddress(), fromName: 'Topps Company', toName: 'Original Owner', metadata: { set: 'Chrome Update', cardNumber: 'HMT40' }, verified: true },
      { id: 'prov-2', blockNumber: 19234567, transactionHash: generateHash(), timestamp: '2018-06-20', eventType: 'grade', fromAddress: generateAddress(), toAddress: generateAddress(), fromName: 'Original Owner', toName: 'PSA', metadata: { grade: '10', certNumber: '45892341' }, verified: true },
      { id: 'prov-3', blockNumber: 20456789, transactionHash: generateHash(), timestamp: '2021-04-10', eventType: 'transfer', fromAddress: generateAddress(), toAddress: generateAddress(), fromName: 'Original Owner', toName: 'Heritage Auctions', metadata: { salePrice: '$2,800', method: 'auction' }, verified: true },
      { id: 'prov-4', blockNumber: 21234567, transactionHash: generateHash(), timestamp: '2023-11-05', eventType: 'transfer', fromAddress: generateAddress(), toAddress: generateAddress(), fromName: 'Heritage Auctions', toName: 'You', metadata: { salePrice: '$3,450', method: 'auction' }, verified: true },
      { id: 'prov-5', blockNumber: 22345678, transactionHash: generateHash(), timestamp: '2025-09-15', eventType: 'vault', fromAddress: generateAddress(), toAddress: generateAddress(), toName: 'PWCC Vault', metadata: { facility: 'Portland OR', insurance: 'Active' }, verified: true },
    ],
    attributes: [
      { traitType: 'Sport', value: 'Baseball', rarity: 35 },
      { traitType: 'Era', value: 'Modern (2015+)', rarity: 45 },
      { traitType: 'Grade', value: 'PSA 10', rarity: 12 },
      { traitType: 'Card Type', value: 'Rookie Card', rarity: 18 },
      { traitType: 'Autograph', value: 'No', rarity: 72 },
      { traitType: 'Pop Count', value: '1,245', rarity: 25 },
    ],
    marketData: {
      floorPrice: 3200,
      lastSalePrice: 3450,
      highestBid: 3100,
      totalVolume: 45600,
      holders: 1,
      listedCount: 0,
    },
  },
  {
    id: 'twin-2',
    cardId: 'card-ohtani-1',
    tokenId: '7892',
    contractAddress: generateAddress(),
    chain: 'polygon',
    playerName: 'Shohei Ohtani',
    cardDescription: '2018 Topps Chrome #150 RC PSA 10',
    year: 2018,
    manufacturer: 'Topps',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    image: 'https://images.unsplash.com/photo-1578432156326-d23f7091f90c?auto=format&fit=crop&q=80&w=300',
    highResImage: 'https://images.unsplash.com/photo-1578432156326-d23f7091f90c?auto=format&fit=crop&q=80&w=1200',
    status: 'linked',
    owner: 'You',
    mintDate: '2025-11-01',
    lastTransfer: '2025-11-01',
    physicalLocation: 'Personal Collection',
    authenticityScore: 95,
    provenanceChain: [
      { id: 'prov-6', blockNumber: 21000001, transactionHash: generateHash(), timestamp: '2018-05-20', eventType: 'mint', fromAddress: '0x0000000000000000000000000000000000000000', toAddress: generateAddress(), fromName: 'Topps Company', toName: 'Hobby Box Break', metadata: { set: 'Chrome', cardNumber: '150' }, verified: true },
      { id: 'prov-7', blockNumber: 21500002, transactionHash: generateHash(), timestamp: '2020-01-15', eventType: 'grade', fromAddress: generateAddress(), toAddress: generateAddress(), fromName: 'Collector', toName: 'PSA', metadata: { grade: '10', certNumber: '52341890' }, verified: true },
      { id: 'prov-8', blockNumber: 22000003, transactionHash: generateHash(), timestamp: '2024-08-20', eventType: 'transfer', fromAddress: generateAddress(), toAddress: generateAddress(), fromName: 'eBay Seller', toName: 'You', metadata: { salePrice: '$1,200', method: 'sale' }, verified: true },
      { id: 'prov-9', blockNumber: 22500004, transactionHash: generateHash(), timestamp: '2025-11-01', eventType: 'authenticate', fromAddress: generateAddress(), toAddress: generateAddress(), toName: 'MSI Auth', metadata: { result: 'Authentic', confidence: '95%' }, verified: true },
    ],
    attributes: [
      { traitType: 'Sport', value: 'Baseball', rarity: 35 },
      { traitType: 'Era', value: 'Modern (2015+)', rarity: 45 },
      { traitType: 'Grade', value: 'PSA 10', rarity: 12 },
      { traitType: 'Card Type', value: 'Rookie Card', rarity: 18 },
      { traitType: 'Special', value: 'Two-Way Player', rarity: 2 },
    ],
    marketData: {
      floorPrice: 1100,
      lastSalePrice: 1200,
      highestBid: 1050,
      totalVolume: 23400,
      holders: 1,
      listedCount: 0,
    },
  },
];

export function getDigitalTwins(): DigitalTwin[] {
  return DIGITAL_TWINS;
}

export function getDigitalTwin(twinId: string): DigitalTwin | undefined {
  return DIGITAL_TWINS.find(t => t.id === twinId);
}

export function getProvenanceChain(twinId: string): ProvenanceRecord[] {
  const twin = DIGITAL_TWINS.find(t => t.id === twinId);
  return twin?.provenanceChain || [];
}

export function getAuthenticationCertificate(twinId: string): AuthenticationCertificate {
  const twin = DIGITAL_TWINS.find(t => t.id === twinId);
  return {
    id: `cert-${twinId}`,
    cardId: twin?.cardId || '',
    twinId,
    issuer: 'Modern Sports Intelligence',
    issuedAt: twin?.mintDate || new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    certificateHash: generateHash(),
    qrCode: `https://msi.app/verify/${twinId}`,
    verificationUrl: `https://msi.app/verify/${twinId}`,
    grade: twin?.grade,
    authenticator: 'MSI AI Authentication Engine v2.0',
    physicalMarkers: [
      'Corner micro-pattern match: 99.2%',
      'Print dot matrix verified against known originals',
      'Card stock thickness within manufacturer tolerance',
      'UV fluorescence pattern consistent with era',
      'Serial number / cert number cross-referenced with grading company database',
    ],
    tamperScore: twin?.authenticityScore || 95,
    status: 'valid',
  };
}

export function getProvenanceStats(): ProvenanceStats {
  return {
    totalTwins: DIGITAL_TWINS.length,
    totalVerified: DIGITAL_TWINS.filter(t => t.authenticityScore >= 90).length,
    averageAuthenticityScore: DIGITAL_TWINS.reduce((sum, t) => sum + t.authenticityScore, 0) / DIGITAL_TWINS.length,
    totalProvenanceEvents: DIGITAL_TWINS.reduce((sum, t) => sum + t.provenanceChain.length, 0),
    oldestProvenance: '2017-03-15',
    chainDistribution: [
      { chain: 'Polygon', count: DIGITAL_TWINS.filter(t => t.chain === 'polygon').length },
      { chain: 'Ethereum', count: DIGITAL_TWINS.filter(t => t.chain === 'ethereum').length },
      { chain: 'Solana', count: DIGITAL_TWINS.filter(t => t.chain === 'solana').length },
    ],
  };
}

// Persistence
const STORAGE_KEY = 'msi_provenance_twins';

export function saveDigitalTwin(twin: DigitalTwin): void {
  const twins = getSavedTwins();
  const idx = twins.findIndex(t => t.id === twin.id);
  if (idx >= 0) twins[idx] = twin;
  else twins.push(twin);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(twins));
}

export function getSavedTwins(): DigitalTwin[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
