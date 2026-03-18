// Phase 129: Vault Arbitrage & Cross-Platform Migration Engine
// Cross-platform vault intelligence with arbitrage detection, fee-adjusted net proceeds
// comparison, smart listing router, and migration planning.

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type VaultPlatform = 'psa_vault' | 'alt' | 'fanatics_collect' | 'comc' | 'ebay';

export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'failed' | 'cancelled';
export type CardCategory = 'vintage' | 'modern' | 'ultra_high_end' | 'mid_range' | 'budget';

export interface PlatformFees {
  platform: VaultPlatform;
  label: string;
  sellerFeePercent: number;       // percentage (0-1)
  sellerFeeFlat: number;          // flat per-transaction fee
  shippingCostOut: number;        // cost to ship card out of vault
  storageCostMonthly: number;     // monthly vault storage per card
  insurancePercent: number;       // insurance as % of value (0-1)
  paymentProcessing: number;      // payment processing % (0-1)
  listingFee: number;             // cost to list
  transferInFee: number;          // cost to receive a transfer
  transferOutFee: number;         // cost to send a transfer
  color: string;
}

export interface VaultCard {
  id: string;
  player: string;
  cardDescription: string;
  year: number;
  grade: string;
  currentPlatform: VaultPlatform;
  estimatedValue: number;
  category: CardCategory;
  vaultedDate: string;
  storageCostAccrued: number;
  lastSaleComp: number;
  imageUrl: string;
}

export interface ArbitrageOpportunity {
  card: VaultCard;
  currentPlatform: VaultPlatform;
  recommendedPlatform: VaultPlatform;
  currentNetProceeds: number;
  recommendedNetProceeds: number;
  estimatedGain: number;
  gainPercent: number;
  reasoning: string;
  confidence: number;           // 0-100
  transferCost: number;
  netGainAfterTransfer: number;
}

export interface TransferRequest {
  id: string;
  cardId: string;
  player: string;
  cardDescription: string;
  grade: string;
  fromPlatform: VaultPlatform;
  toPlatform: VaultPlatform;
  status: TransferStatus;
  initiatedAt: string;
  estimatedArrival: string;
  transferFee: number;
  trackingNumber: string | null;
}

export interface NetProceedsEstimate {
  platform: VaultPlatform;
  label: string;
  salePrice: number;
  sellerFee: number;
  shipping: number;
  insurance: number;
  processing: number;
  listingFee: number;
  netProceeds: number;
}

export interface MigrationPlan {
  id: string;
  cards: VaultCard[];
  targetPlatform: VaultPlatform;
  totalEstimatedGain: number;
  totalTransferCost: number;
  netBenefit: number;
  estimatedTimelineDays: number;
  steps: string[];
}

export interface PlatformHealthStatus {
  platform: VaultPlatform;
  label: string;
  status: 'online' | 'degraded' | 'offline';
  avgSaleDays: number;
  activeListings: number;
  recentSalesVolume: number;
  buyerDemandScore: number;      // 0-100
  color: string;
}

export interface VaultSummary {
  totalCards: number;
  totalValue: number;
  totalStorageCosts: number;
  totalArbitrageOpportunity: number;
  platformBreakdown: { platform: VaultPlatform; label: string; count: number; value: number }[];
  topOpportunity: ArbitrageOpportunity | null;
}

// ── Storage ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_vault_arbitrage_v1';

interface StoredData {
  cards: VaultCard[];
  transfers: TransferRequest[];
  platformHealth: PlatformHealthStatus[];
  generatedAt: number;
}

function loadData(): StoredData | null {
  try {
    const raw = store.get(STORAGE_KEY, null);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredData;
    if (Date.now() - data.generatedAt > 4 * 3600 * 1000) return null;
    return data;
  } catch { return null; }
}

function saveData(data: StoredData): void {
  store.set(STORAGE_KEY, data);
}

// ── Deterministic seeding ───────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Fee structures ──────────────────────────────────────────────────────────────

const PLATFORM_FEES: Record<VaultPlatform, PlatformFees> = {
  psa_vault: {
    platform: 'psa_vault',
    label: 'PSA Vault',
    sellerFeePercent: 0.07,
    sellerFeeFlat: 0,
    shippingCostOut: 15.00,
    storageCostMonthly: 2.00,
    insurancePercent: 0.01,
    paymentProcessing: 0.029,
    listingFee: 0,
    transferInFee: 10.00,
    transferOutFee: 15.00,
    color: 'text-blue-400',
  },
  alt: {
    platform: 'alt',
    label: 'ALT',
    sellerFeePercent: 0.11,
    sellerFeeFlat: 0,
    shippingCostOut: 4.99,
    storageCostMonthly: 0,
    insurancePercent: 0.005,
    paymentProcessing: 0.03,
    listingFee: 0,
    transferInFee: 5.00,
    transferOutFee: 4.99,
    color: 'text-amber-400',
  },
  fanatics_collect: {
    platform: 'fanatics_collect',
    label: 'Fanatics Collect',
    sellerFeePercent: 0.07,
    sellerFeeFlat: 0.50,
    shippingCostOut: 8.99,
    storageCostMonthly: 1.50,
    insurancePercent: 0.008,
    paymentProcessing: 0.029,
    listingFee: 0,
    transferInFee: 8.00,
    transferOutFee: 8.99,
    color: 'text-rose-400',
  },
  comc: {
    platform: 'comc',
    label: 'COMC',
    sellerFeePercent: 0.15,
    sellerFeeFlat: 0,
    shippingCostOut: 3.00,
    storageCostMonthly: 0.05,
    insurancePercent: 0.005,
    paymentProcessing: 0.025,
    listingFee: 0.25,
    transferInFee: 2.00,
    transferOutFee: 3.00,
    color: 'text-emerald-400',
  },
  ebay: {
    platform: 'ebay',
    label: 'eBay',
    sellerFeePercent: 0.1325,
    sellerFeeFlat: 0.30,
    shippingCostOut: 5.99,
    storageCostMonthly: 0,
    insurancePercent: 0,
    paymentProcessing: 0,
    listingFee: 0,
    transferInFee: 0,
    transferOutFee: 5.99,
    color: 'text-purple-400',
  },
};

// ── Smart Listing Router ────────────────────────────────────────────────────────

const CATEGORY_PLATFORM_RANKING: Record<CardCategory, VaultPlatform[]> = {
  vintage: ['psa_vault', 'ebay', 'alt', 'fanatics_collect', 'comc'],
  modern: ['ebay', 'fanatics_collect', 'alt', 'comc', 'psa_vault'],
  ultra_high_end: ['alt', 'psa_vault', 'fanatics_collect', 'ebay', 'comc'],
  mid_range: ['fanatics_collect', 'ebay', 'comc', 'alt', 'psa_vault'],
  budget: ['comc', 'ebay', 'fanatics_collect', 'alt', 'psa_vault'],
};

function getSmartRecommendation(card: VaultCard): { platform: VaultPlatform; reasoning: string } {
  const ranking = CATEGORY_PLATFORM_RANKING[card.category];
  const bestPlatform = ranking[0];

  const reasoningMap: Record<CardCategory, string> = {
    vintage: 'Vintage cards achieve highest premiums on PSA Vault due to collector trust and authentication visibility',
    modern: 'Modern cards sell fastest on eBay due to highest buyer traffic and competitive bidding',
    ultra_high_end: 'Ultra high-end cards benefit from ALT\'s curated marketplace and lower total fees on premium items',
    mid_range: 'Mid-range cards perform best on Fanatics Collect with balanced fees and strong buyer base',
    budget: 'Budget cards move quickest on COMC with low shipping costs and high volume buyer traffic',
  };

  return { platform: bestPlatform, reasoning: reasoningMap[card.category] };
}

// ── Mock data pools ─────────────────────────────────────────────────────────────

const CARD_CONFIGS = [
  { player: 'Mickey Mantle', desc: '1952 Topps #311', grade: 'PSA 6', value: 85000, category: 'vintage' as CardCategory },
  { player: 'Mike Trout', desc: '2011 Topps Update RC #US175', grade: 'PSA 10', value: 4200, category: 'modern' as CardCategory },
  { player: 'Patrick Mahomes', desc: '2017 Panini Prizm Silver RC', grade: 'PSA 10', value: 2800, category: 'modern' as CardCategory },
  { player: 'LeBron James', desc: '2003 Topps Chrome RC #111', grade: 'PSA 9', value: 12500, category: 'ultra_high_end' as CardCategory },
  { player: 'Shohei Ohtani', desc: '2018 Topps Chrome Update RC', grade: 'PSA 10', value: 1450, category: 'modern' as CardCategory },
  { player: 'Victor Wembanyama', desc: '2023 Panini Prizm Silver RC', grade: 'PSA 10', value: 3200, category: 'modern' as CardCategory },
  { player: 'Ken Griffey Jr.', desc: '1989 Upper Deck #1 RC', grade: 'PSA 10', value: 6800, category: 'vintage' as CardCategory },
  { player: 'Luka Doncic', desc: '2018 Panini Prizm Silver RC', grade: 'BGS 9.5', value: 4500, category: 'mid_range' as CardCategory },
  { player: 'Connor McDavid', desc: '2015 Upper Deck Young Guns RC', grade: 'PSA 10', value: 1800, category: 'mid_range' as CardCategory },
  { player: 'Juan Soto', desc: '2019 Topps Chrome RC Auto', grade: 'PSA 10', value: 950, category: 'mid_range' as CardCategory },
  { player: 'Derek Jeter', desc: '1993 SP Foil #279 RC', grade: 'PSA 8', value: 3800, category: 'vintage' as CardCategory },
  { player: 'Anthony Edwards', desc: '2020 Panini Prizm Silver RC', grade: 'PSA 10', value: 620, category: 'budget' as CardCategory },
  { player: 'Josh Allen', desc: '2018 Panini Prizm Silver RC', grade: 'PSA 10', value: 1200, category: 'mid_range' as CardCategory },
  { player: 'Caleb Williams', desc: '2024 Panini Prizm RC Auto', grade: 'BGS 9.5', value: 380, category: 'budget' as CardCategory },
  { player: 'Jayson Tatum', desc: '2017 Panini Prizm Silver RC', grade: 'PSA 10', value: 520, category: 'budget' as CardCategory },
  { player: 'Wayne Gretzky', desc: '1979 O-Pee-Chee #18 RC', grade: 'PSA 7', value: 45000, category: 'ultra_high_end' as CardCategory },
];

const PLATFORMS: VaultPlatform[] = ['psa_vault', 'alt', 'fanatics_collect', 'comc', 'ebay'];

// ── Data generation ─────────────────────────────────────────────────────────────

function generateCards(seed: number): VaultCard[] {
  const rand = seededRandom(seed);
  const now = Date.now();
  const cards: VaultCard[] = [];

  for (let i = 0; i < CARD_CONFIGS.length; i++) {
    const config = CARD_CONFIGS[i];
    const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
    const daysVaulted = 30 + Math.floor(rand() * 365);
    const storageFee = PLATFORM_FEES[platform].storageCostMonthly;
    const monthsVaulted = daysVaulted / 30;
    const valueVariance = 0.92 + rand() * 0.16;
    const lastSaleVariance = 0.88 + rand() * 0.24;

    cards.push({
      id: `vc-${seed}-${i}`,
      player: config.player,
      cardDescription: config.desc,
      year: parseInt(config.desc.match(/\d{4}/)?.[0] || '2023'),
      grade: config.grade,
      currentPlatform: platform,
      estimatedValue: Math.round(config.value * valueVariance),
      category: config.category,
      vaultedDate: new Date(now - daysVaulted * 86400000).toISOString(),
      storageCostAccrued: Math.round(storageFee * monthsVaulted * 100) / 100,
      lastSaleComp: Math.round(config.value * lastSaleVariance),
      imageUrl: '',
    });
  }

  return cards;
}

function generateTransfers(seed: number, cards: VaultCard[]): TransferRequest[] {
  const rand = seededRandom(seed + 8888);
  const now = Date.now();
  const statuses: TransferStatus[] = ['completed', 'completed', 'in_transit', 'pending', 'completed'];
  const transfers: TransferRequest[] = [];

  for (let i = 0; i < 7; i++) {
    const card = cards[Math.floor(rand() * cards.length)];
    const fromPlatform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
    let toPlatform: VaultPlatform;
    do {
      toPlatform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
    } while (toPlatform === fromPlatform);

    const status = statuses[Math.floor(rand() * statuses.length)];
    const daysAgo = 1 + Math.floor(rand() * 60);
    const transferFee = PLATFORM_FEES[fromPlatform].transferOutFee + PLATFORM_FEES[toPlatform].transferInFee;

    transfers.push({
      id: `xfer-${seed}-${i}`,
      cardId: card.id,
      player: card.player,
      cardDescription: card.cardDescription,
      grade: card.grade,
      fromPlatform,
      toPlatform,
      status,
      initiatedAt: new Date(now - daysAgo * 86400000).toISOString(),
      estimatedArrival: new Date(now - (daysAgo - 14) * 86400000).toISOString(),
      transferFee: Math.round(transferFee * 100) / 100,
      trackingNumber: status === 'in_transit' || status === 'completed' ? `VAULT${Math.floor(rand() * 99999999)}` : null,
    });
  }

  return transfers.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());
}

function generatePlatformHealth(seed: number): PlatformHealthStatus[] {
  const rand = seededRandom(seed + 4444);

  return PLATFORMS.map(platform => {
    const fees = PLATFORM_FEES[platform];
    const statusRoll = rand();
    const status: PlatformHealthStatus['status'] = statusRoll < 0.7 ? 'online' : statusRoll < 0.9 ? 'degraded' : 'offline';

    return {
      platform,
      label: fees.label,
      status,
      avgSaleDays: Math.round(3 + rand() * 25),
      activeListings: 500 + Math.floor(rand() * 30000),
      recentSalesVolume: Math.floor(rand() * 5000),
      buyerDemandScore: Math.round(40 + rand() * 60),
      color: fees.color,
    };
  });
}

// ── Fee calculation ─────────────────────────────────────────────────────────────

function calculateNetProceedsForPlatform(salePrice: number, platform: VaultPlatform): NetProceedsEstimate {
  const fees = PLATFORM_FEES[platform];
  const sellerFee = Math.round((salePrice * fees.sellerFeePercent + fees.sellerFeeFlat) * 100) / 100;
  const shipping = fees.shippingCostOut;
  const insurance = Math.round(salePrice * fees.insurancePercent * 100) / 100;
  const processing = Math.round(salePrice * fees.paymentProcessing * 100) / 100;
  const listingFee = fees.listingFee;
  const netProceeds = Math.round((salePrice - sellerFee - shipping - insurance - processing - listingFee) * 100) / 100;

  return {
    platform,
    label: fees.label,
    salePrice,
    sellerFee,
    shipping,
    insurance,
    processing,
    listingFee,
    netProceeds,
  };
}

function ensureData(): StoredData {
  const existing = loadData();
  if (existing) return existing;

  const now = new Date();
  const seed = hashStr(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-vaultarb`);
  const cards = generateCards(seed);
  const transfers = generateTransfers(seed, cards);
  const platformHealth = generatePlatformHealth(seed);
  const data: StoredData = { cards, transfers, platformHealth, generatedAt: Date.now() };
  saveData(data);
  return data;
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function getVaultedCards(): VaultCard[] {
  return ensureData().cards;
}

export function getArbitrageOpportunities(): ArbitrageOpportunity[] {
  const data = ensureData();
  const opportunities: ArbitrageOpportunity[] = [];

  for (const card of data.cards) {
    const currentProceeds = calculateNetProceedsForPlatform(card.estimatedValue, card.currentPlatform);
    const smart = getSmartRecommendation(card);

    // Find best platform by net proceeds
    let bestPlatform = card.currentPlatform;
    let bestProceeds = currentProceeds.netProceeds;

    for (const platform of PLATFORMS) {
      if (platform === card.currentPlatform) continue;
      const proceeds = calculateNetProceedsForPlatform(card.estimatedValue, platform);
      if (proceeds.netProceeds > bestProceeds) {
        bestProceeds = proceeds.netProceeds;
        bestPlatform = platform;
      }
    }

    if (bestPlatform !== card.currentPlatform) {
      const transferCost = PLATFORM_FEES[card.currentPlatform].transferOutFee + PLATFORM_FEES[bestPlatform].transferInFee;
      const estimatedGain = Math.round((bestProceeds - currentProceeds.netProceeds) * 100) / 100;
      const netGainAfterTransfer = Math.round((estimatedGain - transferCost) * 100) / 100;

      if (netGainAfterTransfer > 0) {
        opportunities.push({
          card,
          currentPlatform: card.currentPlatform,
          recommendedPlatform: bestPlatform,
          currentNetProceeds: currentProceeds.netProceeds,
          recommendedNetProceeds: bestProceeds,
          estimatedGain,
          gainPercent: Math.round((estimatedGain / currentProceeds.netProceeds) * 10000) / 100,
          reasoning: smart.platform === bestPlatform ? smart.reasoning : `Higher net proceeds on ${PLATFORM_FEES[bestPlatform].label} after all fees`,
          confidence: Math.round(60 + (netGainAfterTransfer / card.estimatedValue) * 200),
          transferCost,
          netGainAfterTransfer,
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.netGainAfterTransfer - a.netGainAfterTransfer);
}

export function calculateNetProceeds(card: VaultCard, platform: VaultPlatform): NetProceedsEstimate {
  return calculateNetProceedsForPlatform(card.estimatedValue, platform);
}

export function getBestPlatformForCard(card: VaultCard): { platform: VaultPlatform; proceeds: NetProceedsEstimate; reasoning: string } {
  let bestPlatform = PLATFORMS[0];
  let bestProceeds = calculateNetProceedsForPlatform(card.estimatedValue, PLATFORMS[0]);

  for (const platform of PLATFORMS.slice(1)) {
    const proceeds = calculateNetProceedsForPlatform(card.estimatedValue, platform);
    if (proceeds.netProceeds > bestProceeds.netProceeds) {
      bestProceeds = proceeds;
      bestPlatform = platform;
    }
  }

  const smart = getSmartRecommendation(card);
  return {
    platform: bestPlatform,
    proceeds: bestProceeds,
    reasoning: smart.platform === bestPlatform ? smart.reasoning : `Highest net proceeds of $${bestProceeds.netProceeds.toLocaleString()} after all fees`,
  };
}

export function getTransferHistory(): TransferRequest[] {
  return ensureData().transfers;
}

export function initiateTransfer(cardId: string, toPlatform: VaultPlatform): TransferRequest {
  const data = ensureData();
  const card = data.cards.find(c => c.id === cardId);
  if (!card) throw new Error('Card not found');

  const transferFee = PLATFORM_FEES[card.currentPlatform].transferOutFee + PLATFORM_FEES[toPlatform].transferInFee;
  const now = new Date();

  const transfer: TransferRequest = {
    id: `xfer-${Date.now()}`,
    cardId,
    player: card.player,
    cardDescription: card.cardDescription,
    grade: card.grade,
    fromPlatform: card.currentPlatform,
    toPlatform,
    status: 'pending',
    initiatedAt: now.toISOString(),
    estimatedArrival: new Date(now.getTime() + 14 * 86400000).toISOString(),
    transferFee: Math.round(transferFee * 100) / 100,
    trackingNumber: null,
  };

  data.transfers.unshift(transfer);
  saveData(data);
  return transfer;
}

export function getPlatformFees(): PlatformFees[] {
  return PLATFORMS.map(p => PLATFORM_FEES[p]);
}

export function getPlatformFee(platform: VaultPlatform): PlatformFees {
  return PLATFORM_FEES[platform];
}

export function getPlatformHealthStatus(): PlatformHealthStatus[] {
  return ensureData().platformHealth;
}

export function getMigrationPlan(cardIds: string[], targetPlatform: VaultPlatform): MigrationPlan {
  const data = ensureData();
  const cards = data.cards.filter(c => cardIds.includes(c.id));

  let totalEstimatedGain = 0;
  let totalTransferCost = 0;

  for (const card of cards) {
    const currentProceeds = calculateNetProceedsForPlatform(card.estimatedValue, card.currentPlatform);
    const targetProceeds = calculateNetProceedsForPlatform(card.estimatedValue, targetPlatform);
    const gain = targetProceeds.netProceeds - currentProceeds.netProceeds;
    const transferFee = card.currentPlatform !== targetPlatform
      ? PLATFORM_FEES[card.currentPlatform].transferOutFee + PLATFORM_FEES[targetPlatform].transferInFee
      : 0;

    totalEstimatedGain += gain;
    totalTransferCost += transferFee;
  }

  totalEstimatedGain = Math.round(totalEstimatedGain * 100) / 100;
  totalTransferCost = Math.round(totalTransferCost * 100) / 100;

  const targetLabel = PLATFORM_FEES[targetPlatform].label;

  return {
    id: `mig-${Date.now()}`,
    cards,
    targetPlatform,
    totalEstimatedGain,
    totalTransferCost,
    netBenefit: Math.round((totalEstimatedGain - totalTransferCost) * 100) / 100,
    estimatedTimelineDays: 7 + cards.length * 3,
    steps: [
      `Request transfer-out for ${cards.length} cards from current vaults`,
      `Pay transfer fees totaling $${totalTransferCost.toFixed(2)}`,
      `Cards shipped via insured registered mail (7-14 business days)`,
      `${targetLabel} receives and verifies ${cards.length} cards`,
      `Cards listed on ${targetLabel} marketplace`,
      `Expected net gain of $${(totalEstimatedGain - totalTransferCost).toFixed(2)} after all fees`,
    ],
  };
}

export function getVaultSummary(): VaultSummary {
  const data = ensureData();
  const opportunities = getArbitrageOpportunities();

  const platformBreakdown = PLATFORMS.map(platform => {
    const platformCards = data.cards.filter(c => c.currentPlatform === platform);
    return {
      platform,
      label: PLATFORM_FEES[platform].label,
      count: platformCards.length,
      value: platformCards.reduce((sum, c) => sum + c.estimatedValue, 0),
    };
  }).filter(p => p.count > 0);

  return {
    totalCards: data.cards.length,
    totalValue: data.cards.reduce((sum, c) => sum + c.estimatedValue, 0),
    totalStorageCosts: Math.round(data.cards.reduce((sum, c) => sum + c.storageCostAccrued, 0) * 100) / 100,
    totalArbitrageOpportunity: opportunities.reduce((sum, o) => sum + o.netGainAfterTransfer, 0),
    platformBreakdown,
    topOpportunity: opportunities.length > 0 ? opportunities[0] : null,
  };
}

export function getPlatformLabel(platform: VaultPlatform): string {
  return PLATFORM_FEES[platform].label;
}

import { store } from '../dal/syncStore';
export function getAllPlatformNetProceeds(card: VaultCard): NetProceedsEstimate[] {
  return PLATFORMS.map(p => calculateNetProceedsForPlatform(card.estimatedValue, p))
    .sort((a, b) => b.netProceeds - a.netProceeds);
}
