// Provenance Chain Verifier Service
// Full chain-of-custody verification, provenance scoring, and premium analysis for sports cards

// ── Types ────────────────────────────────────────────────────────────────────

export type ChainEventType = 'mint' | 'sale' | 'grade' | 'transfer' | 'auction' | 'insurance-appraisal' | 'exhibition';

export type VerificationStatus = 'verified' | 'pending' | 'disputed' | 'unverified';

export type ProvenanceFlagType = 'gap' | 'suspicious-transfer' | 'rapid-flip' | 'grade-change';

export interface CryptographicHash {
  algorithm: 'SHA-256' | 'SHA-3' | 'BLAKE3';
  value: string;
  timestamp: string;
  signedBy: string;
}

export interface PhotoEvidence {
  id: string;
  eventId: string;
  cardId: string;
  url: string;
  thumbnailUrl: string;
  capturedAt: string;
  capturedBy: string;
  resolution: string;
  hash: CryptographicHash;
  tags: string[];
}

export interface ChainEvent {
  id: string;
  cardId: string;
  type: ChainEventType;
  timestamp: string;
  actor: string;
  location: string;
  description: string;
  value?: number;
  fromOwner?: string;
  toOwner?: string;
  grade?: string;
  gradingService?: string;
  auctionHouse?: string;
  insuranceProvider?: string;
  exhibitionName?: string;
  verificationStatus: VerificationStatus;
  hash: CryptographicHash;
  photoEvidenceIds: string[];
  notes?: string;
}

export interface OwnershipLink {
  id: string;
  cardId: string;
  owner: string;
  acquiredDate: string;
  relinquishedDate: string | null;
  acquisitionMethod: ChainEventType;
  acquisitionPrice: number | null;
  salePrice: number | null;
  verificationStatus: VerificationStatus;
  durationDays: number;
}

export interface ProvenanceScore {
  cardId: string;
  overall: number;
  chainCompleteness: number;
  verificationDepth: number;
  ownershipContinuity: number;
  documentationQuality: number;
  photoEvidenceScore: number;
  historicalSignificance: number;
  flags: ProvenanceFlag[];
  calculatedAt: string;
}

export interface ProvenanceFlag {
  id: string;
  cardId: string;
  type: ProvenanceFlagType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  affectedEventIds: string[];
  resolved: boolean;
}

export interface ChainOfCustody {
  cardId: string;
  cardName: string;
  totalOwners: number;
  totalEvents: number;
  firstRecordedDate: string;
  lastVerifiedDate: string;
  currentOwner: string;
  currentLocation: string;
  integrityScore: number;
  links: OwnershipLink[];
  events: ChainEvent[];
}

export interface ProvenanceReport {
  cardId: string;
  cardName: string;
  generatedAt: string;
  score: ProvenanceScore;
  custody: ChainOfCustody;
  flags: ProvenanceFlag[];
  photoCount: number;
  verifiedEventCount: number;
  totalEventCount: number;
  estimatedPremium: number;
  marketValueBase: number;
  marketValueWithProvenance: number;
  recommendation: string;
}

export interface ProvenanceComparison {
  cards: {
    cardId: string;
    cardName: string;
    score: number;
    eventCount: number;
    ownerCount: number;
    flagCount: number;
    premium: number;
    currentValue: number;
  }[];
  bestProvenanceCardId: string;
  averageScore: number;
}

export interface ProvenanceCard {
  id: string;
  name: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  gradingService: string;
  currentOwner: string;
  currentValue: number;
  imageColor: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateHash(seed: string, algo: 'SHA-256' | 'SHA-3' | 'BLAKE3' = 'SHA-256'): CryptographicHash {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[(seed.charCodeAt(i % seed.length) + i * 7 + 3) % 16];
  }
  return { algorithm: algo, value: hash, timestamp: new Date().toISOString(), signedBy: 'ProvenanceChainVerifier v3.0' };
}

function daysBetween(a: string, b: string): number {
  return Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function formatCurrency(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k`;
  return `$${val.toLocaleString()}`;
}

// ── Mock Card Data (22 cards) ────────────────────────────────────────────────

const cards: ProvenanceCard[] = [
  { id: 'pv-001', name: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, set: 'Topps', grade: 'PSA 8', gradingService: 'PSA', currentOwner: 'Heritage Auctions Vault', currentValue: 2850000, imageColor: '#8b5cf6' },
  { id: 'pv-002', name: '1986 Fleer Michael Jordan #57', player: 'Michael Jordan', year: 1986, set: 'Fleer', grade: 'BGS 9.5', gradingService: 'BGS', currentOwner: 'Private Collector A', currentValue: 738000, imageColor: '#ef4444' },
  { id: 'pv-003', name: '2003 Topps Chrome LeBron James #111', player: 'LeBron James', year: 2003, set: 'Topps Chrome', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'PWCC Vault', currentValue: 520000, imageColor: '#f59e0b' },
  { id: 'pv-004', name: '1916 Sporting News Babe Ruth #151', player: 'Babe Ruth', year: 1916, set: 'Sporting News', grade: 'SGC 3', gradingService: 'SGC', currentOwner: 'Museum of Baseball', currentValue: 4200000, imageColor: '#10b981' },
  { id: 'pv-005', name: '2018 Panini Prizm Luka Doncic #280 Silver', player: 'Luka Doncic', year: 2018, set: 'Panini Prizm Silver', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'CardVault Capital', currentValue: 32000, imageColor: '#3b82f6' },
  { id: 'pv-006', name: '1979 O-Pee-Chee Wayne Gretzky #18', player: 'Wayne Gretzky', year: 1979, set: 'O-Pee-Chee', grade: 'PSA 9', gradingService: 'PSA', currentOwner: 'Canadian Sports Heritage', currentValue: 1650000, imageColor: '#06b6d4' },
  { id: 'pv-007', name: '2000 Playoff Contenders Tom Brady #144', player: 'Tom Brady', year: 2000, set: 'Playoff Contenders', grade: 'BGS 8.5', gradingService: 'BGS', currentOwner: 'Goldin Auctions Consignor', currentValue: 920000, imageColor: '#6366f1' },
  { id: 'pv-008', name: '1933 Goudey Babe Ruth #53', player: 'Babe Ruth', year: 1933, set: 'Goudey', grade: 'PSA 5', gradingService: 'PSA', currentOwner: 'Estate of J. Richardson', currentValue: 380000, imageColor: '#f43f5e' },
  { id: 'pv-009', name: '2009 Bowman Chrome Mike Trout #BDPP61', player: 'Mike Trout', year: 2009, set: 'Bowman Chrome Draft', grade: 'BGS 9.5', gradingService: 'BGS', currentOwner: 'Private Collector B', currentValue: 285000, imageColor: '#ec4899' },
  { id: 'pv-010', name: '1996 Topps Chrome Kobe Bryant #138 Refractor', player: 'Kobe Bryant', year: 1996, set: 'Topps Chrome Refractor', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'Mamba Foundation Trust', currentValue: 1750000, imageColor: '#a855f7' },
  { id: 'pv-011', name: '2017 National Treasures Patrick Mahomes RPA', player: 'Patrick Mahomes', year: 2017, set: 'National Treasures', grade: 'BGS 9', gradingService: 'BGS', currentOwner: 'PWCC Vault', currentValue: 450000, imageColor: '#ef4444' },
  { id: 'pv-012', name: '1951 Bowman Willie Mays #305', player: 'Willie Mays', year: 1951, set: 'Bowman', grade: 'PSA 6', gradingService: 'PSA', currentOwner: 'Heritage Auctions Vault', currentValue: 195000, imageColor: '#f97316' },
  { id: 'pv-013', name: '2018 Panini Prizm Trae Young #78 Silver', player: 'Trae Young', year: 2018, set: 'Panini Prizm Silver', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'Flip City Cards LLC', currentValue: 4200, imageColor: '#dc2626' },
  { id: 'pv-014', name: '1993 SP Derek Jeter #279 Foil', player: 'Derek Jeter', year: 1993, set: 'SP Foil', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'Private Collector C', currentValue: 285000, imageColor: '#1d4ed8' },
  { id: 'pv-015', name: '2019 Panini Prizm Zion Williamson #248', player: 'Zion Williamson', year: 2019, set: 'Panini Prizm', grade: 'BGS 9.5', gradingService: 'BGS', currentOwner: 'Sports Card Capital Fund', currentValue: 8500, imageColor: '#0ea5e9' },
  { id: 'pv-016', name: '1955 Topps Roberto Clemente #164', player: 'Roberto Clemente', year: 1955, set: 'Topps', grade: 'PSA 7', gradingService: 'PSA', currentOwner: 'Roberto Clemente Museum', currentValue: 275000, imageColor: '#eab308' },
  { id: 'pv-017', name: '2020 Panini Prizm Justin Herbert #325 Silver', player: 'Justin Herbert', year: 2020, set: 'Panini Prizm Silver', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'Private Collector D', currentValue: 3800, imageColor: '#0284c7' },
  { id: 'pv-018', name: '1948 Leaf Jackie Robinson #79', player: 'Jackie Robinson', year: 1948, set: 'Leaf', grade: 'PSA 4', gradingService: 'PSA', currentOwner: 'National Baseball Hall of Fame', currentValue: 310000, imageColor: '#16a34a' },
  { id: 'pv-019', name: '2003 Exquisite Collection LeBron James RPA', player: 'LeBron James', year: 2003, set: 'Exquisite Collection', grade: 'BGS 8.5', gradingService: 'BGS', currentOwner: 'Leore Avidar Collection', currentValue: 1920000, imageColor: '#7c3aed' },
  { id: 'pv-020', name: '1969 Topps Lew Alcindor #25', player: 'Kareem Abdul-Jabbar', year: 1969, set: 'Topps', grade: 'PSA 8', gradingService: 'PSA', currentOwner: 'Private Collector E', currentValue: 125000, imageColor: '#0d9488' },
  { id: 'pv-021', name: '2018 Donruss Optic Shohei Ohtani #56', player: 'Shohei Ohtani', year: 2018, set: 'Donruss Optic', grade: 'PSA 10', gradingService: 'PSA', currentOwner: 'Pacific Rim Sports Investments', currentValue: 16500, imageColor: '#e11d48' },
  { id: 'pv-022', name: '1986 Fleer Patrick Ewing #32', player: 'Patrick Ewing', year: 1986, set: 'Fleer', grade: 'PSA 9', gradingService: 'PSA', currentOwner: 'Flip City Cards LLC', currentValue: 850, imageColor: '#2563eb' },
];

// ── Owner Names Per Card ─────────────────────────────────────────────────────

const ownerSequences: string[][] = [
  ['Robert Lifson', 'Bill Mastro', 'Anonymous Buyer #112', 'Heritage Auctions Vault'],
  ['Original Pack Puller', 'Jim Smith Collection', 'Pristine Auction Winner', 'Private Collector A'],
  ['Card Shop Owner', 'Regional Collector', 'PWCC Consignor', 'Investment Group Alpha', 'PWCC Vault'],
  ['Estate of W. Franklin', 'Auction House Lot 1247', 'Museum Acquisition Dept.', 'Museum of Baseball'],
  ['Hobby Box Breaker', 'eBay Seller xCardKing', 'Discord Trade Group', 'CardVault Capital'],
  ['Pack Opener', 'Local Dealer', 'Wayne Gretzky Fan Club', 'Canadian Sports Heritage'],
  ['First Owner', 'Trade Night Acquirer', 'Investment Syndicate B', 'Goldin Auctions Consignor'],
  ['Estate Sale Buyer', 'Antique Dealer', 'Specialist Auction Winner', 'Estate of J. Richardson'],
  ['Original Collector', 'eBay Purchase 2015', 'Private Collector B'],
  ['Pack Pull 1996', 'Local Card Show Vendor', 'eBay Sale 2018', 'Mamba Foundation Trust'],
  ['Draft Night Breaker', 'Kansas City Collector', 'Online Auction Winner', 'PWCC Vault'],
  ['Original Owner 1951', 'Estate of H. Thompson', 'Auction Lot 887', 'Heritage Auctions Vault'],
  ['Pack Opener 2018', 'Quick Flip Trader', 'eBay Buyer 2019', 'Flip City Cards LLC'],
  ['Hobby Shop Purchase', 'Long-term Holder', 'Private Sale 2020', 'Private Collector C'],
  ['Box Breaker Stream', 'Discord Trade 2020', 'COMC Consignment', 'Sports Card Capital Fund'],
  ['Original Purchase 1955', 'Family Inheritance', 'Estate Executor', 'Roberto Clemente Museum'],
  ['Hobby Box Break 2020', 'eBay Flip', 'Card Show Purchase', 'Private Collector D'],
  ['Brooklyn Dealer 1948', 'Private Collection 1952-2010', 'Sothebys Lot 442', 'National Baseball Hall of Fame'],
  ['Draft Lottery Break', 'High-Roller Collector', 'PWCC Marketplace', 'Leore Avidar Collection'],
  ['Original Pack 1969', 'Flea Market Find 1985', 'Auction Win 2012', 'Private Collector E'],
  ['Hobby Box 2018', 'Japanese Import Collector', 'Goldin Consignment', 'Pacific Rim Sports Investments'],
  ['Pack Pull 1986', 'Shoebox Discovery 2019', 'eBay Sale 2021', 'Flip City Cards LLC'],
];

// ── Build Functions ──────────────────────────────────────────────────────────

function buildOwnersForCard(card: ProvenanceCard, idx: number): OwnershipLink[] {
  const names = ownerSequences[idx] || ownerSequences[0];
  const baseYear = card.year;
  const span = 2025 - baseYear;

  return names.map((owner, i) => {
    const acqYear = Math.min(baseYear + Math.floor(span * (i / names.length)), 2025);
    const relYear = i < names.length - 1 ? Math.min(baseYear + Math.floor(span * ((i + 1) / names.length)), 2025) : null;
    const acqPrice = i === 0 ? Math.round(card.currentValue * 0.0005 + 1) : Math.round(card.currentValue * (0.05 + i * 0.18));
    const salePrice = relYear ? Math.round(card.currentValue * (0.05 + (i + 1) * 0.18)) : null;
    const acqDate = `${acqYear}-${String((i * 3 + 1) % 12 + 1).padStart(2, '0')}-${String((i * 5 + 10) % 28 + 1).padStart(2, '0')}`;
    const relDate = relYear ? `${relYear}-${String((i * 4 + 3) % 12 + 1).padStart(2, '0')}-${String((i * 7 + 5) % 28 + 1).padStart(2, '0')}` : null;

    return {
      id: `${card.id}-owner-${i}`,
      cardId: card.id,
      owner,
      acquiredDate: acqDate,
      relinquishedDate: relDate,
      acquisitionMethod: (i === 0 ? 'mint' : i % 3 === 0 ? 'auction' : i % 2 === 0 ? 'sale' : 'transfer') as ChainEventType,
      acquisitionPrice: acqPrice,
      salePrice,
      verificationStatus: (i >= names.length - 2 ? 'verified' : i >= names.length - 3 ? 'pending' : 'unverified') as VerificationStatus,
      durationDays: relDate ? daysBetween(acqDate, relDate) : daysBetween(acqDate, '2026-03-16'),
    };
  });
}

function buildEventsForCard(card: ProvenanceCard, idx: number): ChainEvent[] {
  const events: ChainEvent[] = [];
  const id = card.id;
  const owners = buildOwnersForCard(card, idx);
  const baseYear = card.year;

  // 1. Mint
  events.push({
    id: `${id}-evt-001`, cardId: id, type: 'mint',
    timestamp: `${baseYear}-03-15T10:00:00Z`,
    actor: `${card.set} Production`, location: 'Manufacturing Facility, USA',
    description: `Card produced as part of ${card.year} ${card.set} set`,
    verificationStatus: baseYear < 1970 ? 'unverified' : 'verified',
    hash: generateHash(`${id}-mint`), photoEvidenceIds: [`${id}-photo-001`],
  });

  // 2. First sale
  const firstSaleYear = Math.min(baseYear + (baseYear < 1960 ? 8 : 1), 2024);
  events.push({
    id: `${id}-evt-002`, cardId: id, type: 'sale',
    timestamp: `${firstSaleYear}-06-20T14:30:00Z`,
    actor: owners[0]?.owner || 'Original Dealer', location: 'Card Shop, New York, NY',
    description: 'Initial sale from pack/dealer to first recorded owner',
    value: Math.round(card.currentValue * 0.001 + 1),
    fromOwner: 'Dealer', toOwner: owners[0]?.owner || 'Unknown',
    verificationStatus: baseYear < 1960 ? 'unverified' : 'verified',
    hash: generateHash(`${id}-sale1`), photoEvidenceIds: [],
  });

  // 3. Grading
  const gradeYear = Math.min(firstSaleYear + (baseYear < 1970 ? 30 : 5), 2024);
  events.push({
    id: `${id}-evt-003`, cardId: id, type: 'grade',
    timestamp: `${gradeYear}-09-10T09:15:00Z`,
    actor: card.gradingService, location: `${card.gradingService} Headquarters`,
    description: `Graded ${card.grade} by ${card.gradingService}`,
    grade: card.grade, gradingService: card.gradingService,
    verificationStatus: 'verified',
    hash: generateHash(`${id}-grade`, 'SHA-3'),
    photoEvidenceIds: [`${id}-photo-002`, `${id}-photo-003`],
  });

  // 4. Exhibition (high-value)
  if (card.currentValue > 100000) {
    const exhYear = Math.min(gradeYear + 2, 2024);
    events.push({
      id: `${id}-evt-004`, cardId: id, type: 'exhibition',
      timestamp: `${exhYear}-04-18T11:00:00Z`,
      actor: 'National Sports Collectors Convention', location: 'Atlantic City Convention Center, NJ',
      description: 'Exhibited at NSCC Annual Show',
      exhibitionName: 'National Sports Collectors Convention',
      verificationStatus: 'verified',
      hash: generateHash(`${id}-exhibition`), photoEvidenceIds: [`${id}-photo-004`],
    });
  }

  // 5. Insurance appraisal (mid+ value)
  if (card.currentValue > 50000) {
    const insYear = Math.min(gradeYear + 4, 2025);
    events.push({
      id: `${id}-evt-005`, cardId: id, type: 'insurance-appraisal',
      timestamp: `${insYear}-01-22T16:00:00Z`,
      actor: 'Collectibles Insurance Services', location: 'Remote Appraisal',
      description: `Appraised at $${Math.round(card.currentValue * 0.85).toLocaleString()} for insurance coverage`,
      value: Math.round(card.currentValue * 0.85),
      insuranceProvider: 'Collectibles Insurance Services',
      verificationStatus: 'verified',
      hash: generateHash(`${id}-insurance`), photoEvidenceIds: [`${id}-photo-005`],
    });
  }

  // 6. Transfers/sales through ownership chain
  const transferCount = Math.min(owners.length - 1, 6);
  for (let i = 0; i < transferCount; i++) {
    const tYear = Math.min(gradeYear + (i + 1) * 2, 2025);
    const isSale = i % 2 === 0;
    events.push({
      id: `${id}-evt-${String(6 + i).padStart(3, '0')}`, cardId: id,
      type: isSale ? 'sale' : 'transfer',
      timestamp: `${tYear}-${String((i * 3 + 2) % 12 + 1).padStart(2, '0')}-${String((i * 7 + 5) % 28 + 1).padStart(2, '0')}T${String(10 + i).padStart(2, '0')}:00:00Z`,
      actor: isSale ? (i % 4 === 0 ? 'Goldin Auctions' : 'Heritage Auctions') : (owners[i]?.owner || 'Unknown'),
      location: isSale ? 'Online Auction' : 'Private Transfer',
      description: isSale
        ? `Sold at auction for $${Math.round(card.currentValue * (0.3 + i * 0.12)).toLocaleString()}`
        : `Transferred from ${owners[i]?.owner || 'Unknown'} to ${owners[i + 1]?.owner || card.currentOwner}`,
      value: isSale ? Math.round(card.currentValue * (0.3 + i * 0.12)) : undefined,
      fromOwner: owners[i]?.owner || 'Unknown', toOwner: owners[i + 1]?.owner || card.currentOwner,
      verificationStatus: tYear > 2015 ? 'verified' : tYear > 2000 ? 'pending' : 'unverified',
      hash: generateHash(`${id}-transfer-${i}`),
      photoEvidenceIds: isSale ? [`${id}-photo-${String(6 + i).padStart(3, '0')}`] : [],
      notes: isSale && i > 1 ? 'Lot included certificate of authenticity' : undefined,
    });
  }

  // 7. Auction event for premium cards
  if (card.currentValue > 200000) {
    events.push({
      id: `${id}-evt-auction`, cardId: id, type: 'auction',
      timestamp: '2024-08-15T19:00:00Z',
      actor: 'Heritage Auctions', location: 'Dallas, TX',
      description: 'Featured in Heritage Auctions Summer Platinum Night session',
      value: Math.round(card.currentValue * 0.92),
      auctionHouse: 'Heritage Auctions',
      fromOwner: owners[owners.length - 2]?.owner || 'Consignor', toOwner: card.currentOwner,
      verificationStatus: 'verified',
      hash: generateHash(`${id}-auction`, 'BLAKE3'),
      photoEvidenceIds: [`${id}-photo-auction-1`, `${id}-photo-auction-2`],
    });
  }

  // 8. Second exhibition for museum-held cards
  if (card.currentOwner.includes('Museum') || card.currentOwner.includes('Hall of Fame') || card.currentOwner.includes('Foundation')) {
    events.push({
      id: `${id}-evt-exh2`, cardId: id, type: 'exhibition',
      timestamp: '2025-06-01T10:00:00Z',
      actor: card.currentOwner, location: card.currentOwner,
      description: `Permanent exhibition at ${card.currentOwner}`,
      exhibitionName: `${card.player} Legacy Collection`,
      verificationStatus: 'verified',
      hash: generateHash(`${id}-exh2`), photoEvidenceIds: [`${id}-photo-exh2`],
    });
  }

  // 9. Final transfer/custody
  events.push({
    id: `${id}-evt-final`, cardId: id, type: 'transfer',
    timestamp: '2025-11-01T12:00:00Z',
    actor: card.currentOwner, location: 'Secure Vault Transfer',
    description: `Current custodian: ${card.currentOwner}`,
    toOwner: card.currentOwner,
    verificationStatus: 'verified',
    hash: generateHash(`${id}-final`, 'BLAKE3'),
    photoEvidenceIds: [`${id}-photo-final`],
  });

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function buildPhotoEvidence(card: ProvenanceCard, events: ChainEvent[]): PhotoEvidence[] {
  const photos: PhotoEvidence[] = [];
  events.forEach((evt, idx) => {
    evt.photoEvidenceIds.forEach(photoId => {
      const tags: string[] = [evt.type];
      if (evt.type === 'grade') tags.push('front', 'back', 'slab');
      if (evt.type === 'auction') tags.push('lot-photo', 'catalog');
      if (evt.type === 'exhibition') tags.push('display-case', 'event');
      if (evt.type === 'insurance-appraisal') tags.push('condition-report');
      photos.push({
        id: photoId, eventId: evt.id, cardId: card.id,
        url: `/evidence/${card.id}/${photoId}.jpg`,
        thumbnailUrl: `/evidence/${card.id}/${photoId}_thumb.jpg`,
        capturedAt: evt.timestamp, capturedBy: evt.actor,
        resolution: idx % 2 === 0 ? '4032x3024' : '3024x4032',
        hash: generateHash(`${photoId}-img`, 'BLAKE3'), tags,
      });
    });
  });
  return photos;
}

// ── Precomputed Data Cache ───────────────────────────────────────────────────

const cardEventsMap: Record<string, ChainEvent[]> = {};
const cardOwnersMap: Record<string, OwnershipLink[]> = {};
const cardPhotosMap: Record<string, PhotoEvidence[]> = {};

cards.forEach((card, idx) => {
  cardEventsMap[card.id] = buildEventsForCard(card, idx);
  cardOwnersMap[card.id] = buildOwnersForCard(card, idx);
  cardPhotosMap[card.id] = buildPhotoEvidence(card, cardEventsMap[card.id]);
});

// ── Flag Detection ───────────────────────────────────────────────────────────

function detectFlags(cardId: string): ProvenanceFlag[] {
  const events = cardEventsMap[cardId] || [];
  const owners = cardOwnersMap[cardId] || [];
  const flags: ProvenanceFlag[] = [];

  // Gaps (>10 years between events)
  for (let i = 1; i < events.length; i++) {
    const gap = daysBetween(events[i - 1].timestamp, events[i].timestamp);
    if (gap > 3650) {
      flags.push({
        id: `${cardId}-flag-gap-${i}`, cardId, type: 'gap',
        severity: gap > 7300 ? 'high' : 'medium',
        description: `${Math.round(gap / 365)}-year gap between events (${events[i - 1].timestamp.slice(0, 10)} to ${events[i].timestamp.slice(0, 10)})`,
        detectedAt: new Date().toISOString(), affectedEventIds: [events[i - 1].id, events[i].id], resolved: false,
      });
    }
  }

  // Rapid flips (<30 days hold)
  for (const owner of owners) {
    if (owner.durationDays < 30 && owner.salePrice && owner.acquisitionPrice) {
      flags.push({
        id: `${cardId}-flag-flip-${owner.id}`, cardId, type: 'rapid-flip',
        severity: owner.durationDays < 7 ? 'high' : 'medium',
        description: `${owner.owner} held card for only ${owner.durationDays} days before selling`,
        detectedAt: new Date().toISOString(), affectedEventIds: [], resolved: false,
      });
    }
  }

  // Suspicious unverified high-value transactions
  const card = cards.find(c => c.id === cardId);
  events.forEach(evt => {
    if (evt.verificationStatus === 'unverified' && evt.value && card && evt.value > card.currentValue * 0.25) {
      flags.push({
        id: `${cardId}-flag-sus-${evt.id}`, cardId, type: 'suspicious-transfer',
        severity: 'high',
        description: `Unverified high-value transaction ($${evt.value.toLocaleString()}) by ${evt.actor}`,
        detectedAt: new Date().toISOString(), affectedEventIds: [evt.id], resolved: false,
      });
    }
  });

  // Grade changes (specific cards)
  if (cardId === 'pv-013' || cardId === 'pv-022') {
    flags.push({
      id: `${cardId}-flag-grade`, cardId, type: 'grade-change',
      severity: 'low',
      description: 'Card was regraded; previous grade differed from current grade',
      detectedAt: new Date().toISOString(), affectedEventIds: [], resolved: true,
    });
  }

  return flags;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getCards(): ProvenanceCard[] {
  return [...cards];
}

export function getProvenanceChain(cardId: string): ChainEvent[] {
  return cardEventsMap[cardId] || [];
}

export function getProvenanceScore(cardId: string): ProvenanceScore {
  const events = cardEventsMap[cardId] || [];
  const photos = cardPhotosMap[cardId] || [];
  const card = cards.find(c => c.id === cardId);
  const flags = detectFlags(cardId);

  const verifiedCount = events.filter(e => e.verificationStatus === 'verified').length;
  const chainCompleteness = Math.min(100, Math.round((events.length / 12) * 100));
  const verificationDepth = events.length > 0 ? Math.round((verifiedCount / events.length) * 100) : 0;
  const ownershipContinuity = Math.max(0, Math.round(100 - flags.filter(f => f.type === 'gap').length * 15));
  const documentationQuality = Math.min(100, Math.round((photos.length / Math.max(events.length, 1)) * 80 + 20));
  const photoEvidenceScore = Math.min(100, photos.length * 12);
  const historicalSignificance = card ? Math.min(100, Math.round(Math.log10(Math.max(card.currentValue, 1)) * 18)) : 30;

  const overall = Math.round(
    chainCompleteness * 0.20 + verificationDepth * 0.25 + ownershipContinuity * 0.20 +
    documentationQuality * 0.15 + photoEvidenceScore * 0.10 + historicalSignificance * 0.10
  );

  return {
    cardId, overall: Math.max(0, Math.min(100, overall)),
    chainCompleteness, verificationDepth, ownershipContinuity,
    documentationQuality, photoEvidenceScore, historicalSignificance,
    flags, calculatedAt: new Date().toISOString(),
  };
}

export function verifyChainIntegrity(cardId: string): {
  valid: boolean; integrityScore: number; issues: string[];
  verifiedEvents: number; totalEvents: number;
} {
  const events = cardEventsMap[cardId] || [];
  const issues: string[] = [];
  const verifiedEvents = events.filter(e => e.verificationStatus === 'verified').length;

  for (let i = 1; i < events.length; i++) {
    if (new Date(events[i].timestamp) < new Date(events[i - 1].timestamp)) {
      issues.push(`Event ${events[i].id} timestamp precedes previous event`);
    }
  }
  const unverified = events.filter(e => e.verificationStatus === 'unverified').length;
  if (unverified > 0) issues.push(`${unverified} event(s) remain unverified`);
  const disputed = events.filter(e => e.verificationStatus === 'disputed').length;
  if (disputed > 0) issues.push(`${disputed} event(s) are disputed`);
  const flags = detectFlags(cardId);
  if (flags.length > 0) issues.push(`${flags.length} provenance flag(s) detected`);

  const integrityScore = events.length > 0
    ? Math.max(0, Math.round((verifiedEvents / events.length) * 100 - issues.length * 5))
    : 0;

  return { valid: issues.length === 0 && integrityScore >= 80, integrityScore, issues, verifiedEvents, totalEvents: events.length };
}

export function getChainOfCustody(cardId: string): ChainOfCustody | null {
  const card = cards.find(c => c.id === cardId);
  if (!card) return null;
  const events = cardEventsMap[cardId] || [];
  const owners = cardOwnersMap[cardId] || [];
  const integrity = verifyChainIntegrity(cardId);

  return {
    cardId, cardName: card.name, totalOwners: owners.length, totalEvents: events.length,
    firstRecordedDate: events[0]?.timestamp || 'Unknown',
    lastVerifiedDate: events[events.length - 1]?.timestamp || 'Unknown',
    currentOwner: card.currentOwner, currentLocation: 'Secure Vault',
    integrityScore: integrity.integrityScore, links: owners, events,
  };
}

export function getProvenanceReport(cardId: string): ProvenanceReport | null {
  const card = cards.find(c => c.id === cardId);
  if (!card) return null;
  const score = getProvenanceScore(cardId);
  const custody = getChainOfCustody(cardId)!;
  const flags = detectFlags(cardId);
  const photos = cardPhotosMap[cardId] || [];
  const events = cardEventsMap[cardId] || [];
  const premium = calculateProvenancePremium(cardId);
  const verifiedEventCount = events.filter(e => e.verificationStatus === 'verified').length;

  let recommendation = 'Standard provenance — no action required.';
  if (score.overall >= 85) recommendation = 'Excellent provenance chain. Premium pricing justified.';
  else if (score.overall >= 70) recommendation = 'Good provenance. Minor gaps may be resolvable with additional documentation.';
  else if (score.overall < 50) recommendation = 'Weak provenance chain. Recommend additional verification before acquisition.';
  if (flags.some(f => f.severity === 'critical' || f.severity === 'high')) {
    recommendation += ' WARNING: High-severity flags require immediate review.';
  }

  return {
    cardId, cardName: card.name, generatedAt: new Date().toISOString(),
    score, custody, flags, photoCount: photos.length, verifiedEventCount, totalEventCount: events.length,
    estimatedPremium: premium.premiumPercent, marketValueBase: card.currentValue,
    marketValueWithProvenance: Math.round(card.currentValue * (1 + premium.premiumPercent / 100)),
    recommendation,
  };
}

export function getPhotoEvidence(cardId: string, eventId?: string): PhotoEvidence[] {
  const photos = cardPhotosMap[cardId] || [];
  return eventId ? photos.filter(p => p.eventId === eventId) : photos;
}

export function flagSuspiciousTransfers(): ProvenanceFlag[] {
  const allFlags: ProvenanceFlag[] = [];
  cards.forEach(card => {
    allFlags.push(...detectFlags(card.id).filter(f => f.type === 'suspicious-transfer' || f.type === 'rapid-flip'));
  });
  return allFlags;
}

export function getProvenanceComparison(cardIds: string[]): ProvenanceComparison {
  const compCards = cardIds.map(cid => {
    const card = cards.find(c => c.id === cid);
    const score = getProvenanceScore(cid);
    const events = cardEventsMap[cid] || [];
    const owners = cardOwnersMap[cid] || [];
    const flags = detectFlags(cid);
    const premium = calculateProvenancePremium(cid);
    return {
      cardId: cid, cardName: card?.name || 'Unknown', score: score.overall,
      eventCount: events.length, ownerCount: owners.length, flagCount: flags.length,
      premium: premium.premiumPercent, currentValue: card?.currentValue || 0,
    };
  });
  const bestCard = compCards.reduce((best, c) => c.score > best.score ? c : best, compCards[0]);
  const avgScore = Math.round(compCards.reduce((s, c) => s + c.score, 0) / compCards.length);
  return { cards: compCards, bestProvenanceCardId: bestCard.cardId, averageScore: avgScore };
}

export function getHighProvenanceCards(): ProvenanceCard[] {
  return cards
    .filter(card => getProvenanceScore(card.id).overall >= 70)
    .sort((a, b) => getProvenanceScore(b.id).overall - getProvenanceScore(a.id).overall);
}

export function calculateProvenancePremium(cardId: string): {
  cardId: string; premiumPercent: number; baseValue: number; adjustedValue: number;
  factors: { factor: string; impact: number }[];
} {
  const card = cards.find(c => c.id === cardId);
  if (!card) return { cardId, premiumPercent: 0, baseValue: 0, adjustedValue: 0, factors: [] };

  const score = getProvenanceScore(cardId);
  const flags = detectFlags(cardId);
  const factors: { factor: string; impact: number }[] = [];

  if (score.chainCompleteness >= 80) factors.push({ factor: 'Complete chain documentation', impact: 8 });
  else if (score.chainCompleteness >= 50) factors.push({ factor: 'Partial chain documentation', impact: 3 });

  if (score.verificationDepth >= 80) factors.push({ factor: 'High verification rate', impact: 12 });
  else if (score.verificationDepth >= 50) factors.push({ factor: 'Moderate verification rate', impact: 5 });

  if (score.photoEvidenceScore >= 80) factors.push({ factor: 'Comprehensive photo evidence', impact: 6 });
  if (score.historicalSignificance >= 90) factors.push({ factor: 'Exceptional historical significance', impact: 15 });
  else if (score.historicalSignificance >= 70) factors.push({ factor: 'Notable historical significance', impact: 8 });
  if (score.ownershipContinuity >= 85) factors.push({ factor: 'Unbroken ownership chain', impact: 10 });

  const highFlags = flags.filter(f => f.severity === 'high' || f.severity === 'critical').length;
  if (highFlags > 0) factors.push({ factor: `${highFlags} high-severity flag(s)`, impact: -highFlags * 8 });
  const medFlags = flags.filter(f => f.severity === 'medium').length;
  if (medFlags > 0) factors.push({ factor: `${medFlags} medium-severity flag(s)`, impact: -medFlags * 3 });

  if (cardId === 'pv-010' || cardId === 'pv-018') {
    factors.push({ factor: 'Celebrity/institutional provenance', impact: 20 });
  }

  const premiumPercent = Math.max(-20, factors.reduce((sum, f) => sum + f.impact, 0));
  return {
    cardId, premiumPercent, baseValue: card.currentValue,
    adjustedValue: Math.round(card.currentValue * (1 + premiumPercent / 100)), factors,
  };
}
