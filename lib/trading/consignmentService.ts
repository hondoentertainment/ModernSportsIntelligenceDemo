import { CardInventory, Sport } from '../../types';
import { store } from '../dal/syncStore';

// ── Types ──────────────────────────────────────────────────────────────

export interface ConsignmentHouse {
  id: string;
  name: string;
  commissionRate: number; // percentage (e.g. 8 = 8%)
  fixedFee: number;
  minGuarantee: boolean;
  avgDaysToSell: number;
  specialties: Sport[];
  rating: number; // 1-5
}

export type ConsignmentStatus =
  | 'shipped'
  | 'received'
  | 'listed'
  | 'sold'
  | 'returned'
  | 'disputed';

export interface ConsignmentEntry {
  id: string;
  cardId: string;
  cardName: string;
  sport: Sport;
  houseName: string;
  houseId: string;
  dateShipped: string;
  dateReceived?: string;
  dateListedForSale?: string;
  dateSold?: string;
  status: ConsignmentStatus;
  askingPrice: number;
  soldPrice?: number;
  commissionPaid?: number;
  netProceeds?: number;
  shippingCost: number;
  insuranceCost: number;
  estimatedValue: number;
  notes?: string;
  trackingNumber?: string;
}

export interface ConsignmentSummary {
  totalConsigned: number;
  totalSold: number;
  totalPending: number;
  totalNetProceeds: number;
  totalCommissionPaid: number;
  avgDaysToSell: number;
  avgCommissionRate: number;
  bestHouse: string;
  worstHouse: string;
  returnRate: number;
}

export interface HouseComparison {
  houseId: string;
  houseName: string;
  commissionRate: number;
  commission: number;
  fixedFee: number;
  netProceeds: number;
  rating: number;
  avgDaysToSell: number;
  isSpecialist: boolean;
}

export interface ExitChannelComparison {
  channelId: string;
  channelName: string;
  channelType: 'consignment' | 'marketplace' | 'vault';
  estimatedSalePrice: number;
  feeRate: number;
  fixedFee: number;
  fees: number;
  shippingCost: number;
  insuranceCost: number;
  expectedNet: number;
  breakEvenSalePrice: number;
  daysToCash: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
  isSpecialist?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_consignments';

const DEFAULT_MARKETPLACE_CHANNELS = [
  {
    channelId: 'ebay',
    channelName: 'eBay Direct Listing',
    channelType: 'marketplace' as const,
    feeRate: 0.13,
    fixedFee: 0.3,
    daysToCash: 8,
    confidence: 'high' as const,
    notes: 'High reach with standard marketplace fees and seller-managed shipping.',
  },
  {
    channelId: 'myslabs-direct',
    channelName: 'MySlabs Direct',
    channelType: 'marketplace' as const,
    feeRate: 0.01,
    fixedFee: 0.0,
    daysToCash: 5,
    confidence: 'medium' as const,
    notes: 'Lower fees but narrower buyer pool for faster hobby-native sales.',
  },
  {
    channelId: 'comc',
    channelName: 'COMC Cash-Out',
    channelType: 'marketplace' as const,
    feeRate: 0.05,
    fixedFee: 1.0,
    daysToCash: 21,
    confidence: 'medium' as const,
    notes: 'Managed marketplace workflow with slower cash conversion.',
  },
];

const HOUSES: ConsignmentHouse[] = [
  {
    id: 'pwcc',
    name: 'PWCC Marketplace',
    commissionRate: 8,
    fixedFee: 5,
    minGuarantee: true,
    avgDaysToSell: 21,
    specialties: ['Baseball', 'Basketball', 'Football'],
    rating: 4.5,
  },
  {
    id: 'goldin',
    name: 'Goldin Auctions',
    commissionRate: 10,
    fixedFee: 0,
    minGuarantee: false,
    avgDaysToSell: 30,
    specialties: ['Basketball', 'Football', 'Baseball'],
    rating: 4.8,
  },
  {
    id: 'myslabs',
    name: 'MySlabs',
    commissionRate: 6,
    fixedFee: 3,
    minGuarantee: false,
    avgDaysToSell: 14,
    specialties: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    rating: 4.0,
  },
  {
    id: 'heritage',
    name: 'Heritage Auctions',
    commissionRate: 15,
    fixedFee: 0,
    minGuarantee: true,
    avgDaysToSell: 45,
    specialties: ['Baseball', 'Football'],
    rating: 4.7,
  },
  {
    id: 'probstein',
    name: 'Probstein123',
    commissionRate: 8.9,
    fixedFee: 2,
    minGuarantee: false,
    avgDaysToSell: 10,
    specialties: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    rating: 4.3,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function loadConsignments(): ConsignmentEntry[] {
  return store.get<ConsignmentEntry[]>(STORAGE_KEY, []);
}

function saveConsignments(entries: ConsignmentEntry[]): void {
  store.set(STORAGE_KEY, entries);
}

function calculateBreakEvenSalePrice(card: CardInventory, feeRate: number, fixedFee: number, shippingCost = 0, insuranceCost = 0): number {
  const costBasis =
    (card.taxBasis || card.purchasePrice || 0) +
    (card.gradingFees || 0) +
    (card.shippingFees || 0) +
    (card.insuranceFees || 0);
  const fixedCosts = fixedFee + shippingCost + insuranceCost;
  const netMultiplier = 1 - feeRate;
  if (netMultiplier <= 0) {
    return costBasis + fixedCosts;
  }
  return (costBasis + fixedCosts) / netMultiplier;
}

// ── Service ────────────────────────────────────────────────────────────

export const ConsignmentService = {
  // ── House queries ──

  getConsignmentHouses(): ConsignmentHouse[] {
    return HOUSES;
  },

  getHouseById(houseId: string): ConsignmentHouse | undefined {
    return HOUSES.find((h) => h.id === houseId);
  },

  // ── CRUD ──

  createConsignment(
    cardId: string,
    cardName: string,
    sport: Sport,
    houseId: string,
    askingPrice: number,
    shippingCost: number,
    insuranceCost: number,
    estimatedValue: number,
    notes?: string
  ): ConsignmentEntry {
    const house = HOUSES.find((h) => h.id === houseId);
    if (!house) throw new Error(`Unknown house: ${houseId}`);

    const entry: ConsignmentEntry = {
      id: `cons-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cardId,
      cardName,
      sport,
      houseName: house.name,
      houseId,
      dateShipped: new Date().toISOString(),
      status: 'shipped',
      askingPrice,
      shippingCost,
      insuranceCost,
      estimatedValue,
      notes,
      trackingNumber: `TRK${Date.now().toString(36).toUpperCase()}`,
    };

    const all = loadConsignments();
    all.push(entry);
    saveConsignments(all);
    return entry;
  },

  updateConsignmentStatus(
    entryId: string,
    newStatus: ConsignmentStatus,
    soldPrice?: number
  ): ConsignmentEntry | null {
    const all = loadConsignments();
    const idx = all.findIndex((e) => e.id === entryId);
    if (idx === -1) return null;

    const entry = all[idx];
    entry.status = newStatus;

    const now = new Date().toISOString();
    switch (newStatus) {
      case 'received':
        entry.dateReceived = now;
        break;
      case 'listed':
        entry.dateListedForSale = now;
        break;
      case 'sold':
        entry.dateSold = now;
        if (soldPrice !== undefined) {
          entry.soldPrice = soldPrice;
          const house = HOUSES.find((h) => h.id === entry.houseId);
          if (house) {
            entry.commissionPaid =
              soldPrice * (house.commissionRate / 100) + house.fixedFee;
            entry.netProceeds =
              soldPrice -
              entry.commissionPaid -
              entry.shippingCost -
              entry.insuranceCost;
          }
        }
        break;
      case 'returned':
      case 'disputed':
        break;
    }

    all[idx] = entry;
    saveConsignments(all);
    return entry;
  },

  deleteConsignment(entryId: string): boolean {
    const all = loadConsignments();
    const filtered = all.filter((e) => e.id !== entryId);
    if (filtered.length === all.length) return false;
    saveConsignments(filtered);
    return true;
  },

  // ── Queries ──

  getConsignments(): ConsignmentEntry[] {
    return loadConsignments();
  },

  getConsignmentsByCard(cardId: string): ConsignmentEntry[] {
    return loadConsignments().filter((e) => e.cardId === cardId);
  },

  getConsignmentsByHouse(houseId: string): ConsignmentEntry[] {
    return loadConsignments().filter((e) => e.houseId === houseId);
  },

  // ── Calculations ──

  calculateNetProceeds(entry: ConsignmentEntry): number {
    if (!entry.soldPrice) return 0;
    const house = HOUSES.find((h) => h.id === entry.houseId);
    if (!house) return 0;
    const commission =
      entry.soldPrice * (house.commissionRate / 100) + house.fixedFee;
    return entry.soldPrice - commission - entry.shippingCost - entry.insuranceCost;
  },

  compareHouses(
    estimatedValue: number,
    sport: Sport
  ): HouseComparison[] {
    return HOUSES.map((house) => {
      const commission = estimatedValue * (house.commissionRate / 100);
      const netProceeds = estimatedValue - commission - house.fixedFee;
      return {
        houseId: house.id,
        houseName: house.name,
        commissionRate: house.commissionRate,
        commission,
        fixedFee: house.fixedFee,
        netProceeds,
        rating: house.rating,
        avgDaysToSell: house.avgDaysToSell,
        isSpecialist: house.specialties.includes(sport),
      };
    }).sort((a, b) => b.netProceeds - a.netProceeds);
  },

  compareExitChannels(card: CardInventory): ExitChannelComparison[] {
    const estimatedSalePrice = card.currentValue ?? card.purchasePrice;
    const shippingCost = card.shippingFees ?? 15;
    const insuranceCost = card.insuranceFees ?? Math.max(5, Math.round(estimatedSalePrice * 0.01));

    const consignmentChannels: ExitChannelComparison[] = HOUSES.map((house) => {
      const fees = estimatedSalePrice * (house.commissionRate / 100) + house.fixedFee;
      return {
        channelId: house.id,
        channelName: house.name,
        channelType: 'consignment',
        estimatedSalePrice,
        feeRate: house.commissionRate / 100,
        fixedFee: house.fixedFee,
        fees,
        shippingCost,
        insuranceCost,
        expectedNet: estimatedSalePrice - fees - shippingCost - insuranceCost,
        breakEvenSalePrice: calculateBreakEvenSalePrice(
          card,
          house.commissionRate / 100,
          house.fixedFee,
          shippingCost,
          insuranceCost
        ),
        daysToCash: house.avgDaysToSell,
        confidence: house.rating >= 4.5 ? 'high' : 'medium',
        notes: house.specialties.includes(card.sport)
          ? 'Strong specialty match for this sport.'
          : 'Viable house, but not a primary specialist for this asset.',
        isSpecialist: house.specialties.includes(card.sport),
      };
    });

    const marketplaceChannels: ExitChannelComparison[] = DEFAULT_MARKETPLACE_CHANNELS.map((channel) => {
      const fees = estimatedSalePrice * channel.feeRate + channel.fixedFee;
      return {
        channelId: channel.channelId,
        channelName: channel.channelName,
        channelType: channel.channelType,
        estimatedSalePrice,
        feeRate: channel.feeRate,
        fixedFee: channel.fixedFee,
        fees,
        shippingCost,
        insuranceCost,
        expectedNet: estimatedSalePrice - fees - shippingCost - insuranceCost,
        breakEvenSalePrice: calculateBreakEvenSalePrice(
          card,
          channel.feeRate,
          channel.fixedFee,
          shippingCost,
          insuranceCost
        ),
        daysToCash: channel.daysToCash,
        confidence: channel.confidence,
        notes: channel.notes,
      };
    });

    const channels = [...consignmentChannels, ...marketplaceChannels];
    return channels.sort((a, b) => {
      if (b.expectedNet !== a.expectedNet) return b.expectedNet - a.expectedNet;
      return a.daysToCash - b.daysToCash;
    });
  },

  recommendExitChannel(card: CardInventory): ExitChannelComparison {
    const channels = this.compareExitChannels(card);
    return channels[0];
  },

  getOptimalHouse(card: CardInventory): ConsignmentHouse {
    const value = card.currentValue ?? card.purchasePrice;
    const sport = card.sport;

    // Score each house: net proceeds (40%), specialty match (30%), rating (20%), speed (10%)
    const comparisons = this.compareHouses(value, sport);
    const maxNet = Math.max(...comparisons.map((c) => c.netProceeds));
    const maxDays = Math.max(...comparisons.map((c) => c.avgDaysToSell));

    let bestScore = -Infinity;
    let bestHouseId = HOUSES[0].id;

    for (const comp of comparisons) {
      const netScore = maxNet > 0 ? (comp.netProceeds / maxNet) * 40 : 0;
      const specialtyScore = comp.isSpecialist ? 30 : 0;
      const ratingScore = (comp.rating / 5) * 20;
      const speedScore = maxDays > 0 ? ((maxDays - comp.avgDaysToSell) / maxDays) * 10 : 0;
      const total = netScore + specialtyScore + ratingScore + speedScore;
      if (total > bestScore) {
        bestScore = total;
        bestHouseId = comp.houseId;
      }
    }

    return HOUSES.find((h) => h.id === bestHouseId)!;
  },

  // ── Aggregate summary ──

  generateConsignmentSummary(): ConsignmentSummary {
    const all = loadConsignments();
    const sold = all.filter((e) => e.status === 'sold');
    const pending = all.filter((e) =>
      ['shipped', 'received', 'listed'].includes(e.status)
    );
    const returned = all.filter((e) => e.status === 'returned');

    const totalNetProceeds = sold.reduce(
      (s, e) => s + (e.netProceeds ?? 0),
      0
    );
    const totalCommissionPaid = sold.reduce(
      (s, e) => s + (e.commissionPaid ?? 0),
      0
    );

    // Average days to sell for sold entries
    const daysArr = sold
      .map((e) => {
        if (!e.dateSold || !e.dateShipped) return null;
        const diff =
          new Date(e.dateSold).getTime() - new Date(e.dateShipped).getTime();
        return diff / (1000 * 60 * 60 * 24);
      })
      .filter((d): d is number => d !== null);
    const avgDaysToSell =
      daysArr.length > 0
        ? daysArr.reduce((s, d) => s + d, 0) / daysArr.length
        : 0;

    // Average commission rate
    const commRates = sold
      .map((e) => {
        if (!e.soldPrice || e.soldPrice === 0) return null;
        return ((e.commissionPaid ?? 0) / e.soldPrice) * 100;
      })
      .filter((r): r is number => r !== null);
    const avgCommissionRate =
      commRates.length > 0
        ? commRates.reduce((s, r) => s + r, 0) / commRates.length
        : 0;

    // Best and worst house by net proceeds
    const houseStats: Record<string, { net: number; count: number; name: string }> = {};
    for (const e of sold) {
      if (!houseStats[e.houseId]) {
        houseStats[e.houseId] = { net: 0, count: 0, name: e.houseName };
      }
      houseStats[e.houseId].net += e.netProceeds ?? 0;
      houseStats[e.houseId].count += 1;
    }

    const houseEntries = Object.values(houseStats);
    const bestHouse =
      houseEntries.length > 0
        ? houseEntries.sort((a, b) => b.net - a.net)[0].name
        : 'N/A';
    const worstHouse =
      houseEntries.length > 0
        ? houseEntries.sort((a, b) => a.net - b.net)[0].name
        : 'N/A';

    const returnRate =
      all.length > 0 ? (returned.length / all.length) * 100 : 0;

    return {
      totalConsigned: all.length,
      totalSold: sold.length,
      totalPending: pending.length,
      totalNetProceeds,
      totalCommissionPaid,
      avgDaysToSell,
      avgCommissionRate,
      bestHouse,
      worstHouse,
      returnRate,
    };
  },
};
