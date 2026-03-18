/**
 * Dealer Inventory Management at Scale Service
 * Enterprise-grade inventory for dealers with bulk operations, consignment tracking, and multi-venue listing.
 */

export type ListingStatus = 'unlisted' | 'listed' | 'pending-sale' | 'sold' | 'consigned' | 'returned';
export type Venue = 'ebay' | 'whatnot' | 'myslabs' | 'comc' | 'in-store' | 'show' | 'private';
export type InventoryCategory = 'raw' | 'graded' | 'sealed-wax' | 'lots' | 'memorabilia';

export interface InventoryItem {
  id: string;
  cardName: string;
  category: InventoryCategory;
  costBasis: number;
  currentValue: number;
  quantity: number;
  grade: string | null;
  certNumber: string | null;
  listingStatus: ListingStatus;
  listedVenues: Venue[];
  listedPrice: number | null;
  daysInInventory: number;
  location: string;
  tags: string[];
}

export interface VenuePerformance {
  venue: Venue;
  activeListings: number;
  soldThisMonth: number;
  revenue: number;
  avgDaysToSell: number;
  feePercent: number;
  netMargin: number;
}

export interface InventoryAlert {
  id: string;
  type: 'slow-mover' | 'price-drop' | 'restock' | 'trending' | 'consignment-due';
  cardName: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface BulkOperation {
  id: string;
  type: 'price-update' | 'relist' | 'delist' | 'venue-move' | 'tag-apply';
  itemCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  initiatedBy: string;
}

export interface DealerInventoryStats {
  totalItems: number;
  totalValue: number;
  totalCostBasis: number;
  unrealizedProfit: number;
  activeListings: number;
  soldThisMonth: number;
  revenueThisMonth: number;
  avgTurnoverDays: number;
  slowMovers: number;
  topVenue: string;
  inventoryTurnRate: number;
}

function getDealerInventory(): InventoryItem[] {
  return [
    { id: 'di-1', cardName: '2024 Topps Chrome Paul Skenes RC PSA 10', category: 'graded', costBasis: 85, currentValue: 145, quantity: 12, grade: 'PSA 10', certNumber: '82456789', listingStatus: 'listed', listedVenues: ['ebay', 'myslabs'], listedPrice: 149, daysInInventory: 14, location: 'Safe A-1', tags: ['rookie', 'baseball', 'hot'] },
    { id: 'di-2', cardName: '2024 Panini Prizm Caleb Williams Silver RC', category: 'raw', costBasis: 22, currentValue: 38, quantity: 45, grade: null, certNumber: null, listingStatus: 'listed', listedVenues: ['ebay', 'whatnot'], listedPrice: 42, daysInInventory: 30, location: 'Bin B-3', tags: ['rookie', 'football'] },
    { id: 'di-3', cardName: '2024 Topps Series 2 Hobby Box', category: 'sealed-wax', costBasis: 68, currentValue: 82, quantity: 24, grade: null, certNumber: null, listingStatus: 'listed', listedVenues: ['ebay', 'in-store', 'whatnot'], listedPrice: 89, daysInInventory: 45, location: 'Shelf C-2', tags: ['sealed', 'baseball'] },
    { id: 'di-4', cardName: '2024 Select Jayden Daniels Concourse PSA 9', category: 'graded', costBasis: 35, currentValue: 52, quantity: 8, grade: 'PSA 9', certNumber: '82567890', listingStatus: 'listed', listedVenues: ['ebay'], listedPrice: 55, daysInInventory: 21, location: 'Safe A-2', tags: ['rookie', 'football'] },
    { id: 'di-5', cardName: '1989 Upper Deck Ken Griffey Jr RC Lot (x25)', category: 'lots', costBasis: 125, currentValue: 200, quantity: 3, grade: null, certNumber: null, listingStatus: 'listed', listedVenues: ['ebay', 'whatnot', 'show'], listedPrice: 225, daysInInventory: 60, location: 'Bin D-1', tags: ['vintage', 'baseball', 'lot'] },
    { id: 'di-6', cardName: '2025 Bowman Chrome Travis Bazzana 1st Auto /150', category: 'graded', costBasis: 420, currentValue: 680, quantity: 2, grade: 'BGS 9.5', certNumber: 'B92345678', listingStatus: 'consigned', listedVenues: [], listedPrice: null, daysInInventory: 8, location: 'Consigned — Goldin', tags: ['prospect', 'auto', 'high-value'] },
    { id: 'di-7', cardName: '2024 Donruss Optic Caitlin Clark RC', category: 'raw', costBasis: 8, currentValue: 5, quantity: 150, grade: null, certNumber: null, listingStatus: 'unlisted', listedVenues: [], listedPrice: null, daysInInventory: 90, location: 'Bin E-4', tags: ['basketball', 'slow-mover'] },
    { id: 'di-8', cardName: '2023 Topps Chrome Elly De La Cruz Auto /75', category: 'graded', costBasis: 350, currentValue: 280, quantity: 1, grade: 'PSA 10', certNumber: '78901234', listingStatus: 'listed', listedVenues: ['ebay', 'myslabs', 'comc'], listedPrice: 299, daysInInventory: 120, location: 'Safe A-3', tags: ['auto', 'baseball', 'declining'] },
  ];
}

function getVenuePerformance(): VenuePerformance[] {
  return [
    { venue: 'ebay', activeListings: 342, soldThisMonth: 89, revenue: 12450, avgDaysToSell: 18, feePercent: 13.25, netMargin: 28 },
    { venue: 'whatnot', activeListings: 120, soldThisMonth: 45, revenue: 5800, avgDaysToSell: 7, feePercent: 9.5, netMargin: 35 },
    { venue: 'myslabs', activeListings: 85, soldThisMonth: 22, revenue: 4200, avgDaysToSell: 25, feePercent: 8.0, netMargin: 32 },
    { venue: 'comc', activeListings: 210, soldThisMonth: 34, revenue: 2800, avgDaysToSell: 42, feePercent: 15.0, netMargin: 18 },
    { venue: 'in-store', activeListings: 55, soldThisMonth: 28, revenue: 3400, avgDaysToSell: 12, feePercent: 0, netMargin: 45 },
    { venue: 'show', activeListings: 0, soldThisMonth: 65, revenue: 8900, avgDaysToSell: 2, feePercent: 5.0, netMargin: 42 },
  ];
}

function getInventoryAlerts(): InventoryAlert[] {
  return [
    { id: 'ia-1', type: 'slow-mover', cardName: 'Caitlin Clark RC (x150)', message: '150 units sitting 90+ days — consider lot listing or show clearance', severity: 'warning', timestamp: '1h ago' },
    { id: 'ia-2', type: 'price-drop', cardName: 'Elly De La Cruz Auto /75', message: 'Market price dropped 20% below cost basis — review hold strategy', severity: 'critical', timestamp: '3h ago' },
    { id: 'ia-3', type: 'trending', cardName: 'Paul Skenes RC PSA 10', message: 'Search volume up 340% — consider raising list price', severity: 'info', timestamp: '2h ago' },
    { id: 'ia-4', type: 'consignment-due', cardName: 'Bazzana 1st Auto /150', message: 'Goldin consignment window closes in 5 days', severity: 'warning', timestamp: '4h ago' },
    { id: 'ia-5', type: 'restock', cardName: 'Topps Series 2 Hobby Box', message: 'Down to 24 units — restock threshold is 20', severity: 'info', timestamp: '6h ago' },
  ];
}

function getRecentBulkOps(): BulkOperation[] {
  return [
    { id: 'bo-1', type: 'price-update', itemCount: 45, status: 'completed', startedAt: '2026-03-17 10:00', completedAt: '2026-03-17 10:02', initiatedBy: 'CardShark92' },
    { id: 'bo-2', type: 'relist', itemCount: 28, status: 'completed', startedAt: '2026-03-16 14:30', completedAt: '2026-03-16 14:31', initiatedBy: 'ProspectHunter' },
    { id: 'bo-3', type: 'tag-apply', itemCount: 150, status: 'processing', startedAt: '2026-03-17 13:45', completedAt: null, initiatedBy: 'CardShark92' },
  ];
}

function getDealerInventoryStats(): DealerInventoryStats {
  return {
    totalItems: 842,
    totalValue: 185400,
    totalCostBasis: 124800,
    unrealizedProfit: 60600,
    activeListings: 612,
    soldThisMonth: 283,
    revenueThisMonth: 37550,
    avgTurnoverDays: 22,
    slowMovers: 45,
    topVenue: 'eBay',
    inventoryTurnRate: 4.2,
  };
}

function getVenueColor(venue: Venue): string {
  const colors: Record<Venue, string> = {
    ebay: 'text-red-400 bg-red-500/10 border-red-500/30',
    whatnot: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    myslabs: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    comc: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    'in-store': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    show: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    private: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };
  return colors[venue];
}

function getCategoryLabel(cat: InventoryCategory): string {
  const labels: Record<InventoryCategory, string> = {
    raw: 'Raw', graded: 'Graded', 'sealed-wax': 'Sealed Wax', lots: 'Lots', memorabilia: 'Memorabilia',
  };
  return labels[cat];
}

export {
  getDealerInventory,
  getVenuePerformance,
  getInventoryAlerts,
  getRecentBulkOps,
  getDealerInventoryStats,
  getVenueColor,
  getCategoryLabel,
};
