// Phase 120: Dealer Dashboard & Multi-Account Service

export type DealerRole = 'owner' | 'manager' | 'staff' | 'viewer';

export interface DealerProfile {
  id: string;
  name: string;
  storeName: string;
  storeId: string;
  role: DealerRole;
  email: string;
  phone: string;
  joinedDate: string;
  totalSales: number;
  totalRevenue: number;
  avatarUrl?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface DealerInventoryItem {
  id: string;
  cardName: string;
  player: string;
  year: number;
  brand: string;
  setName: string;
  grade: string;
  condition: string;
  costBasis: number;
  listPrice: number;
  marketValue: number;
  margin: number;
  marginPercent: number;
  quantity: number;
  storeId: string;
  category: 'raw' | 'graded' | 'sealed' | 'memorabilia';
  status: 'in-stock' | 'reserved' | 'sold' | 'consignment';
  daysInInventory: number;
  addedDate: string;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate: string;
  customerSince: string;
  tier: 'new' | 'regular' | 'vip' | 'whale';
  preferences: string[];
  notes: string;
  storeId: string;
}

export interface SaleRecord {
  id: string;
  customerId: string;
  customerName: string;
  itemName: string;
  salePrice: number;
  costBasis: number;
  margin: number;
  date: string;
  storeId: string;
  paymentMethod: 'cash' | 'card' | 'trade' | 'layaway';
}

export interface ConsignmentItem {
  id: string;
  consignorName: string;
  consignorEmail: string;
  itemName: string;
  player: string;
  grade: string;
  agreedPrice: number;
  listPrice: number;
  commissionPercent: number;
  status: 'active' | 'sold' | 'returned' | 'pending-payment';
  receivedDate: string;
  soldDate?: string;
  storeId: string;
  daysOnConsignment: number;
  invoiceGenerated: boolean;
}

export interface MarginAnalysis {
  category: string;
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  marginPercent: number;
  itemCount: number;
  avgDaysToSell: number;
}

export interface MultiStoreConfig {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  staffCount: number;
  monthlyRevenue: number;
  inventoryCount: number;
  permissions: Record<DealerRole, string[]>;
}

export interface CustomerCRM {
  customer: Customer;
  purchaseHistory: SaleRecord[];
  wishlist: string[];
  communicationLog: { date: string; type: string; note: string }[];
  predictedInterests: string[];
  lifetimeValue: number;
  churnRisk: 'low' | 'medium' | 'high';
}

export interface DailySalesData {
  date: string;
  revenue: number;
  cost: number;
  margin: number;
  transactions: number;
}

export interface TopSeller {
  itemName: string;
  player: string;
  unitsSold: number;
  totalRevenue: number;
  avgMargin: number;
}

// ─── Mock Data ───────────────────────────────────────────────

const STORES: MultiStoreConfig[] = [
  {
    id: 'store-1',
    name: 'Card Kingdom Downtown',
    location: 'Portland, OR',
    isActive: true,
    staffCount: 5,
    monthlyRevenue: 47800,
    inventoryCount: 342,
    permissions: {
      owner: ['all'],
      manager: ['inventory', 'sales', 'customers', 'consignments', 'reports'],
      staff: ['inventory', 'sales', 'customers'],
      viewer: ['reports'],
    },
  },
  {
    id: 'store-2',
    name: 'Card Kingdom Eastside',
    location: 'Gresham, OR',
    isActive: true,
    staffCount: 3,
    monthlyRevenue: 31200,
    inventoryCount: 218,
    permissions: {
      owner: ['all'],
      manager: ['inventory', 'sales', 'customers', 'consignments', 'reports'],
      staff: ['inventory', 'sales', 'customers'],
      viewer: ['reports'],
    },
  },
];

const INVENTORY: DealerInventoryItem[] = [
  { id: 'inv-1', cardName: '2023 Prizm Silver #280', player: 'Victor Wembanyama', year: 2023, brand: 'Panini', setName: 'Prizm', grade: 'PSA 10', condition: 'Gem Mint', costBasis: 320, listPrice: 485, marketValue: 460, margin: 165, marginPercent: 34.0, quantity: 2, storeId: 'store-1', category: 'graded', status: 'in-stock', daysInInventory: 12, addedDate: '2026-03-01' },
  { id: 'inv-2', cardName: '2022 Topps Chrome #27', player: 'Julio Rodriguez', year: 2022, brand: 'Topps', setName: 'Chrome', grade: 'BGS 9.5', condition: 'Gem Mint', costBasis: 180, listPrice: 265, marketValue: 250, margin: 85, marginPercent: 32.1, quantity: 1, storeId: 'store-1', category: 'graded', status: 'in-stock', daysInInventory: 23, addedDate: '2026-02-18' },
  { id: 'inv-3', cardName: '2024 Bowman Chrome 1st #BCP-1', player: 'Ethan Salas', year: 2024, brand: 'Topps', setName: 'Bowman Chrome', grade: 'Raw', condition: 'NM-MT', costBasis: 45, listPrice: 89, marketValue: 82, margin: 44, marginPercent: 49.4, quantity: 5, storeId: 'store-1', category: 'raw', status: 'in-stock', daysInInventory: 8, addedDate: '2026-03-05' },
  { id: 'inv-4', cardName: '2023 Optic Rated Rookie #201', player: 'Chet Holmgren', year: 2023, brand: 'Panini', setName: 'Optic', grade: 'PSA 9', condition: 'Mint', costBasis: 35, listPrice: 58, marketValue: 52, margin: 23, marginPercent: 39.7, quantity: 3, storeId: 'store-1', category: 'graded', status: 'in-stock', daysInInventory: 31, addedDate: '2026-02-10' },
  { id: 'inv-5', cardName: '2024 Topps Series 1 Hobby Box', player: 'N/A', year: 2024, brand: 'Topps', setName: 'Series 1', grade: 'Sealed', condition: 'Factory Sealed', costBasis: 85, listPrice: 135, marketValue: 128, margin: 50, marginPercent: 37.0, quantity: 8, storeId: 'store-1', category: 'sealed', status: 'in-stock', daysInInventory: 15, addedDate: '2026-02-26' },
  { id: 'inv-6', cardName: '2020 Prizm #258 RC', player: 'Justin Herbert', year: 2020, brand: 'Panini', setName: 'Prizm', grade: 'PSA 10', condition: 'Gem Mint', costBasis: 210, listPrice: 310, marketValue: 295, margin: 100, marginPercent: 32.3, quantity: 1, storeId: 'store-1', category: 'graded', status: 'in-stock', daysInInventory: 45, addedDate: '2026-01-27' },
  { id: 'inv-7', cardName: '2023 Select Concourse #76', player: 'Jahmyr Gibbs', year: 2023, brand: 'Panini', setName: 'Select', grade: 'Raw', condition: 'NM', costBasis: 12, listPrice: 25, marketValue: 22, margin: 13, marginPercent: 52.0, quantity: 10, storeId: 'store-1', category: 'raw', status: 'in-stock', daysInInventory: 19, addedDate: '2026-02-22' },
  { id: 'inv-8', cardName: '2021 Topps Chrome Update #USC162', player: 'Bobby Witt Jr.', year: 2021, brand: 'Topps', setName: 'Chrome Update', grade: 'SGC 10', condition: 'Pristine', costBasis: 140, listPrice: 225, marketValue: 210, margin: 85, marginPercent: 37.8, quantity: 1, storeId: 'store-1', category: 'graded', status: 'reserved', daysInInventory: 6, addedDate: '2026-03-07' },
  { id: 'inv-9', cardName: 'Signed Baseball - Official MLB', player: 'Mike Trout', year: 2023, brand: 'MLB', setName: 'Memorabilia', grade: 'JSA Certified', condition: 'Excellent', costBasis: 280, listPrice: 425, marketValue: 400, margin: 145, marginPercent: 34.1, quantity: 1, storeId: 'store-1', category: 'memorabilia', status: 'in-stock', daysInInventory: 52, addedDate: '2026-01-20' },
  { id: 'inv-10', cardName: '2024 Donruss Optic Mega Box', player: 'N/A', year: 2024, brand: 'Panini', setName: 'Donruss Optic', grade: 'Sealed', condition: 'Factory Sealed', costBasis: 55, listPrice: 85, marketValue: 78, margin: 30, marginPercent: 35.3, quantity: 12, storeId: 'store-1', category: 'sealed', status: 'in-stock', daysInInventory: 10, addedDate: '2026-03-03' },
  { id: 'inv-11', cardName: '2023 Mosaic #212 RC', player: 'Tyrese Maxey', year: 2023, brand: 'Panini', setName: 'Mosaic', grade: 'PSA 10', condition: 'Gem Mint', costBasis: 65, listPrice: 110, marketValue: 98, margin: 45, marginPercent: 40.9, quantity: 2, storeId: 'store-2', category: 'graded', status: 'in-stock', daysInInventory: 14, addedDate: '2026-02-27' },
  { id: 'inv-12', cardName: '2024 Topps Heritage #215', player: 'Gunnar Henderson', year: 2024, brand: 'Topps', setName: 'Heritage', grade: 'Raw', condition: 'NM-MT', costBasis: 28, listPrice: 48, marketValue: 44, margin: 20, marginPercent: 41.7, quantity: 4, storeId: 'store-2', category: 'raw', status: 'in-stock', daysInInventory: 9, addedDate: '2026-03-04' },
  { id: 'inv-13', cardName: '2022 Panini Flawless #102', player: 'Paolo Banchero', year: 2022, brand: 'Panini', setName: 'Flawless', grade: 'BGS 9', condition: 'Mint', costBasis: 420, listPrice: 625, marketValue: 580, margin: 205, marginPercent: 32.8, quantity: 1, storeId: 'store-2', category: 'graded', status: 'in-stock', daysInInventory: 38, addedDate: '2026-02-03' },
  { id: 'inv-14', cardName: '2023 Bowman 1st #BDC-150', player: 'Jackson Holliday', year: 2023, brand: 'Topps', setName: 'Bowman', grade: 'PSA 10', condition: 'Gem Mint', costBasis: 95, listPrice: 155, marketValue: 142, margin: 60, marginPercent: 38.7, quantity: 2, storeId: 'store-2', category: 'graded', status: 'in-stock', daysInInventory: 21, addedDate: '2026-02-20' },
  { id: 'inv-15', cardName: '2024 Prizm Basketball Blaster', player: 'N/A', year: 2024, brand: 'Panini', setName: 'Prizm', grade: 'Sealed', condition: 'Factory Sealed', costBasis: 38, listPrice: 55, marketValue: 50, margin: 17, marginPercent: 30.9, quantity: 20, storeId: 'store-2', category: 'sealed', status: 'in-stock', daysInInventory: 5, addedDate: '2026-03-08' },
  { id: 'inv-16', cardName: '2023 National Treasures #156', player: 'Anthony Richardson', year: 2023, brand: 'Panini', setName: 'National Treasures', grade: 'Raw', condition: 'NM', costBasis: 520, listPrice: 800, marketValue: 750, margin: 280, marginPercent: 35.0, quantity: 1, storeId: 'store-2', category: 'raw', status: 'in-stock', daysInInventory: 27, addedDate: '2026-02-14' },
  { id: 'inv-17', cardName: '2022 Topps Chrome #220', player: 'Adley Rutschman', year: 2022, brand: 'Topps', setName: 'Chrome', grade: 'PSA 9', condition: 'Mint', costBasis: 48, listPrice: 78, marketValue: 72, margin: 30, marginPercent: 38.5, quantity: 3, storeId: 'store-2', category: 'graded', status: 'in-stock', daysInInventory: 33, addedDate: '2026-02-08' },
  { id: 'inv-18', cardName: '2024 Panini Eminence #12', player: 'LeBron James', year: 2024, brand: 'Panini', setName: 'Eminence', grade: 'BGS 9.5', condition: 'Gem Mint', costBasis: 1250, listPrice: 1800, marketValue: 1720, margin: 550, marginPercent: 30.6, quantity: 1, storeId: 'store-1', category: 'graded', status: 'in-stock', daysInInventory: 17, addedDate: '2026-02-24' },
  { id: 'inv-19', cardName: 'Game-Worn Jersey Patch Card', player: 'Patrick Mahomes', year: 2023, brand: 'Panini', setName: 'Immaculate', grade: 'PSA 8', condition: 'NM-MT', costBasis: 380, listPrice: 550, marketValue: 510, margin: 170, marginPercent: 30.9, quantity: 1, storeId: 'store-1', category: 'memorabilia', status: 'in-stock', daysInInventory: 41, addedDate: '2026-01-31' },
  { id: 'inv-20', cardName: '2024 Topps Series 2 Jumbo Box', player: 'N/A', year: 2024, brand: 'Topps', setName: 'Series 2', grade: 'Sealed', condition: 'Factory Sealed', costBasis: 165, listPrice: 240, marketValue: 225, margin: 75, marginPercent: 31.3, quantity: 4, storeId: 'store-1', category: 'sealed', status: 'in-stock', daysInInventory: 7, addedDate: '2026-03-06' },
  { id: 'inv-21', cardName: '2023 Mosaic Stained Glass #22', player: 'Luka Doncic', year: 2023, brand: 'Panini', setName: 'Mosaic', grade: 'PSA 10', condition: 'Gem Mint', costBasis: 175, listPrice: 280, marketValue: 260, margin: 105, marginPercent: 37.5, quantity: 1, storeId: 'store-2', category: 'graded', status: 'reserved', daysInInventory: 3, addedDate: '2026-03-10' },
  { id: 'inv-22', cardName: '2024 Bowman Chrome Hobby Box', player: 'N/A', year: 2024, brand: 'Topps', setName: 'Bowman Chrome', grade: 'Sealed', condition: 'Factory Sealed', costBasis: 210, listPrice: 310, marketValue: 290, margin: 100, marginPercent: 32.3, quantity: 3, storeId: 'store-2', category: 'sealed', status: 'in-stock', daysInInventory: 11, addedDate: '2026-03-02' },
];

const CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Marcus Johnson', email: 'marcus.j@email.com', phone: '503-555-0101', totalPurchases: 34, totalSpent: 8420, lastPurchaseDate: '2026-03-11', customerSince: '2024-06-15', tier: 'whale', preferences: ['basketball', 'rookies', 'PSA 10'], notes: 'Prefers high-end rookies. Collects all Wembanyama.', storeId: 'store-1' },
  { id: 'cust-2', name: 'Sarah Chen', email: 'schen@email.com', phone: '503-555-0102', totalPurchases: 22, totalSpent: 4150, lastPurchaseDate: '2026-03-09', customerSince: '2024-09-22', tier: 'vip', preferences: ['baseball', 'vintage', 'sealed'], notes: 'Interested in vintage baseball. Budget ~$200/visit.', storeId: 'store-1' },
  { id: 'cust-3', name: 'Derek Williams', email: 'dwilliams@email.com', phone: '503-555-0103', totalPurchases: 15, totalSpent: 2800, lastPurchaseDate: '2026-03-05', customerSince: '2025-01-10', tier: 'regular', preferences: ['football', 'raw cards', 'Prizm'], notes: 'Buys raw and grades himself. Prizm collector.', storeId: 'store-1' },
  { id: 'cust-4', name: 'Emily Rodriguez', email: 'erodriguez@email.com', phone: '503-555-0104', totalPurchases: 8, totalSpent: 1250, lastPurchaseDate: '2026-02-28', customerSince: '2025-06-01', tier: 'regular', preferences: ['basketball', 'sealed boxes'], notes: 'Weekend buyer. Likes sealed product.', storeId: 'store-1' },
  { id: 'cust-5', name: 'James Kim', email: 'jkim@email.com', phone: '503-555-0105', totalPurchases: 42, totalSpent: 12600, lastPurchaseDate: '2026-03-12', customerSince: '2023-11-30', tier: 'whale', preferences: ['multi-sport', 'high-end', 'memorabilia'], notes: 'Top buyer. Interested in game-used and auto patches.', storeId: 'store-1' },
  { id: 'cust-6', name: 'Lisa Park', email: 'lpark@email.com', phone: '503-555-0201', totalPurchases: 18, totalSpent: 3400, lastPurchaseDate: '2026-03-10', customerSince: '2024-12-05', tier: 'vip', preferences: ['baseball', 'Bowman', 'prospects'], notes: 'Prospect collector. Follows minor leagues closely.', storeId: 'store-2' },
  { id: 'cust-7', name: 'Ryan Patel', email: 'rpatel@email.com', phone: '503-555-0202', totalPurchases: 5, totalSpent: 680, lastPurchaseDate: '2026-03-01', customerSince: '2025-11-15', tier: 'new', preferences: ['basketball', 'budget'], notes: 'New collector. Looking for affordable entry points.', storeId: 'store-2' },
  { id: 'cust-8', name: 'Amanda Foster', email: 'afoster@email.com', phone: '503-555-0203', totalPurchases: 28, totalSpent: 5900, lastPurchaseDate: '2026-03-08', customerSince: '2024-03-20', tier: 'vip', preferences: ['football', 'graded', 'Mahomes'], notes: 'Chiefs fan. Collects Mahomes extensively.', storeId: 'store-2' },
  { id: 'cust-9', name: 'Tyler Brooks', email: 'tbrooks@email.com', phone: '503-555-0204', totalPurchases: 11, totalSpent: 1800, lastPurchaseDate: '2026-02-22', customerSince: '2025-04-18', tier: 'regular', preferences: ['sealed', 'breaks', 'Topps'], notes: 'Prefers sealed product for breaks.', storeId: 'store-2' },
  { id: 'cust-10', name: 'Michelle Tran', email: 'mtran@email.com', phone: '503-555-0205', totalPurchases: 3, totalSpent: 420, lastPurchaseDate: '2026-03-06', customerSince: '2026-01-10', tier: 'new', preferences: ['basketball', 'rookies'], notes: 'Just starting. Interested in current rookies.', storeId: 'store-2' },
  { id: 'cust-11', name: 'Brian Nakamura', email: 'bnakamura@email.com', phone: '503-555-0106', totalPurchases: 19, totalSpent: 4800, lastPurchaseDate: '2026-03-07', customerSince: '2024-08-12', tier: 'vip', preferences: ['baseball', 'Japanese players', 'Ohtani'], notes: 'Collects Japanese MLB players. Big Ohtani collector.', storeId: 'store-1' },
];

const SALES_HISTORY: SaleRecord[] = [
  { id: 'sale-1', customerId: 'cust-5', customerName: 'James Kim', itemName: '2023 Prizm Silver Wembanyama PSA 10', salePrice: 475, costBasis: 310, margin: 165, date: '2026-03-12', storeId: 'store-1', paymentMethod: 'card' },
  { id: 'sale-2', customerId: 'cust-1', customerName: 'Marcus Johnson', itemName: '2024 Topps Chrome Hobby Box', salePrice: 280, costBasis: 195, margin: 85, date: '2026-03-11', storeId: 'store-1', paymentMethod: 'cash' },
  { id: 'sale-3', customerId: 'cust-6', customerName: 'Lisa Park', itemName: '2024 Bowman 1st Salas Raw', salePrice: 85, costBasis: 42, margin: 43, date: '2026-03-10', storeId: 'store-2', paymentMethod: 'card' },
  { id: 'sale-4', customerId: 'cust-2', customerName: 'Sarah Chen', itemName: '2024 Topps Series 1 Hobby Box', salePrice: 130, costBasis: 82, margin: 48, date: '2026-03-09', storeId: 'store-1', paymentMethod: 'card' },
  { id: 'sale-5', customerId: 'cust-8', customerName: 'Amanda Foster', itemName: '2023 Select Mahomes Silver PSA 10', salePrice: 195, costBasis: 120, margin: 75, date: '2026-03-08', storeId: 'store-2', paymentMethod: 'cash' },
  { id: 'sale-6', customerId: 'cust-3', customerName: 'Derek Williams', itemName: '2023 Prizm Gibbs Raw lot (5)', salePrice: 110, costBasis: 55, margin: 55, date: '2026-03-07', storeId: 'store-1', paymentMethod: 'cash' },
  { id: 'sale-7', customerId: 'cust-11', customerName: 'Brian Nakamura', itemName: '2024 Topps Ohtani SP #1', salePrice: 340, costBasis: 220, margin: 120, date: '2026-03-07', storeId: 'store-1', paymentMethod: 'card' },
  { id: 'sale-8', customerId: 'cust-10', customerName: 'Michelle Tran', itemName: '2024 Prizm Basketball Blaster (3)', salePrice: 156, costBasis: 114, margin: 42, date: '2026-03-06', storeId: 'store-2', paymentMethod: 'card' },
  { id: 'sale-9', customerId: 'cust-4', customerName: 'Emily Rodriguez', itemName: '2024 Donruss Optic Mega Box (2)', salePrice: 165, costBasis: 108, margin: 57, date: '2026-03-05', storeId: 'store-1', paymentMethod: 'card' },
  { id: 'sale-10', customerId: 'cust-9', customerName: 'Tyler Brooks', itemName: '2024 Topps Series 2 Jumbo Box', salePrice: 235, costBasis: 162, margin: 73, date: '2026-03-04', storeId: 'store-2', paymentMethod: 'card' },
  { id: 'sale-11', customerId: 'cust-5', customerName: 'James Kim', itemName: 'Signed Jersey Card Mahomes Immaculate', salePrice: 560, costBasis: 380, margin: 180, date: '2026-03-03', storeId: 'store-1', paymentMethod: 'card' },
  { id: 'sale-12', customerId: 'cust-1', customerName: 'Marcus Johnson', itemName: '2023 Optic Holmgren PSA 9 (2)', salePrice: 108, costBasis: 68, margin: 40, date: '2026-03-02', storeId: 'store-1', paymentMethod: 'cash' },
  { id: 'sale-13', customerId: 'cust-7', customerName: 'Ryan Patel', itemName: '2023 Mosaic Maxey PSA 10', salePrice: 105, costBasis: 62, margin: 43, date: '2026-03-01', storeId: 'store-2', paymentMethod: 'cash' },
  { id: 'sale-14', customerId: 'cust-6', customerName: 'Lisa Park', itemName: '2023 Bowman 1st Holliday PSA 10', salePrice: 148, costBasis: 92, margin: 56, date: '2026-02-28', storeId: 'store-2', paymentMethod: 'card' },
  { id: 'sale-15', customerId: 'cust-2', customerName: 'Sarah Chen', itemName: '2022 Topps Chrome Rutschman PSA 9', salePrice: 75, costBasis: 46, margin: 29, date: '2026-02-27', storeId: 'store-1', paymentMethod: 'cash' },
];

const CONSIGNMENTS: ConsignmentItem[] = [
  { id: 'con-1', consignorName: 'Dave Murphy', consignorEmail: 'dmurphy@email.com', itemName: '2020 Panini Contenders Burrow Auto', player: 'Joe Burrow', grade: 'PSA 10', agreedPrice: 800, listPrice: 1050, commissionPercent: 15, status: 'active', receivedDate: '2026-02-15', storeId: 'store-1', daysOnConsignment: 26, invoiceGenerated: false },
  { id: 'con-2', consignorName: 'Kelly Simmons', consignorEmail: 'ksimmons@email.com', itemName: '2018 Prizm Silver Luka Doncic RC', player: 'Luka Doncic', grade: 'BGS 9.5', agreedPrice: 1400, listPrice: 1850, commissionPercent: 12, status: 'active', receivedDate: '2026-02-20', storeId: 'store-1', daysOnConsignment: 21, invoiceGenerated: false },
  { id: 'con-3', consignorName: 'Tom Baker', consignorEmail: 'tbaker@email.com', itemName: '2021 Topps Chrome Gold Refractor Wander Franco', player: 'Wander Franco', grade: 'PSA 9', agreedPrice: 350, listPrice: 480, commissionPercent: 15, status: 'sold', receivedDate: '2026-01-10', soldDate: '2026-03-05', storeId: 'store-1', daysOnConsignment: 54, invoiceGenerated: true },
  { id: 'con-4', consignorName: 'Nancy Liu', consignorEmail: 'nliu@email.com', itemName: '2023 National Treasures Stroud Auto Patch /25', player: 'C.J. Stroud', grade: 'Raw', agreedPrice: 1200, listPrice: 1650, commissionPercent: 12, status: 'active', receivedDate: '2026-03-01', storeId: 'store-2', daysOnConsignment: 12, invoiceGenerated: false },
  { id: 'con-5', consignorName: 'Mike Alvarez', consignorEmail: 'malvarez@email.com', itemName: '2022 Bowman Chrome Sapphire Druw Jones', player: 'Druw Jones', grade: 'PSA 10', agreedPrice: 220, listPrice: 320, commissionPercent: 15, status: 'pending-payment', receivedDate: '2026-01-20', soldDate: '2026-02-28', storeId: 'store-2', daysOnConsignment: 39, invoiceGenerated: true },
  { id: 'con-6', consignorName: 'Dave Murphy', consignorEmail: 'dmurphy@email.com', itemName: '2023 Optic Downtown Mahomes', player: 'Patrick Mahomes', grade: 'PSA 10', agreedPrice: 650, listPrice: 890, commissionPercent: 12, status: 'active', receivedDate: '2026-03-05', storeId: 'store-1', daysOnConsignment: 8, invoiceGenerated: false },
  { id: 'con-7', consignorName: 'Rachel Kim', consignorEmail: 'rkim@email.com', itemName: '2019 Prizm Zion Williamson RC', player: 'Zion Williamson', grade: 'SGC 9.5', agreedPrice: 180, listPrice: 260, commissionPercent: 15, status: 'returned', receivedDate: '2025-12-01', storeId: 'store-2', daysOnConsignment: 90, invoiceGenerated: false },
];

const DEALER_PROFILE: DealerProfile = {
  id: 'dealer-1',
  name: 'Alex Morgan',
  storeName: 'Card Kingdom',
  storeId: 'store-1',
  role: 'owner',
  email: 'alex@cardkingdom.com',
  phone: '503-555-1000',
  joinedDate: '2023-06-15',
  totalSales: 1247,
  totalRevenue: 312400,
  tier: 'platinum',
};

// ─── Service Functions ───────────────────────────────────────

export function getDealerProfile(): DealerProfile {
  return DEALER_PROFILE;
}

export function getInventory(storeId?: string): DealerInventoryItem[] {
  if (storeId) return INVENTORY.filter((i) => i.storeId === storeId);
  return INVENTORY;
}

export function getCustomers(storeId?: string): Customer[] {
  if (storeId) return CUSTOMERS.filter((c) => c.storeId === storeId);
  return CUSTOMERS;
}

export function getCustomerHistory(customerId: string): CustomerCRM {
  const customer = CUSTOMERS.find((c) => c.id === customerId) || CUSTOMERS[0];
  const purchases = SALES_HISTORY.filter((s) => s.customerId === customerId);
  return {
    customer,
    purchaseHistory: purchases,
    wishlist: customer.preferences.map((p) => `${p} cards`),
    communicationLog: [
      { date: '2026-03-10', type: 'in-store', note: 'Discussed upcoming releases.' },
      { date: '2026-02-25', type: 'email', note: 'Sent inventory update newsletter.' },
      { date: '2026-02-14', type: 'phone', note: 'Called about consignment opportunity.' },
    ],
    predictedInterests: ['2025 Bowman Chrome', '2025 Prizm Basketball', 'Sealed hobby boxes'],
    lifetimeValue: customer.totalSpent * 1.4,
    churnRisk: customer.totalPurchases > 20 ? 'low' : customer.totalPurchases > 8 ? 'medium' : 'high',
  };
}

export function getSalesAnalytics(storeId?: string): DailySalesData[] {
  const days: DailySalesData[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(2026, 2, 13 - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySales = SALES_HISTORY.filter(
      (s) => s.date === dateStr && (!storeId || s.storeId === storeId)
    );
    const revenue = daySales.reduce((sum, s) => sum + s.salePrice, 0);
    const cost = daySales.reduce((sum, s) => sum + s.costBasis, 0);
    days.push({
      date: dateStr,
      revenue,
      cost,
      margin: revenue - cost,
      transactions: daySales.length,
    });
  }
  return days;
}

export function getConsignments(storeId?: string): ConsignmentItem[] {
  if (storeId) return CONSIGNMENTS.filter((c) => c.storeId === storeId);
  return CONSIGNMENTS;
}

export function getMarginAnalysis(storeId?: string): MarginAnalysis[] {
  const items = storeId ? INVENTORY.filter((i) => i.storeId === storeId) : INVENTORY;
  const categories = ['graded', 'raw', 'sealed', 'memorabilia'] as const;
  return categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    const totalRevenue = catItems.reduce((s, i) => s + i.listPrice * i.quantity, 0);
    const totalCost = catItems.reduce((s, i) => s + i.costBasis * i.quantity, 0);
    const totalMargin = totalRevenue - totalCost;
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      totalRevenue,
      totalCost,
      totalMargin,
      marginPercent: totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 1000) / 10 : 0,
      itemCount: catItems.reduce((s, i) => s + i.quantity, 0),
      avgDaysToSell: Math.round(catItems.reduce((s, i) => s + i.daysInInventory, 0) / (catItems.length || 1)),
    };
  });
}

export function getStoreConfig(): MultiStoreConfig[] {
  return STORES;
}

export function getTopSellers(storeId?: string): TopSeller[] {
  const sales = storeId ? SALES_HISTORY.filter((s) => s.storeId === storeId) : SALES_HISTORY;
  const grouped = new Map<string, { revenue: number; margin: number; count: number; player: string }>();
  for (const s of sales) {
    const key = s.itemName;
    const existing = grouped.get(key) || { revenue: 0, margin: 0, count: 0, player: s.customerName };
    existing.revenue += s.salePrice;
    existing.margin += s.margin;
    existing.count += 1;
    existing.player = s.customerName;
    grouped.set(key, existing);
  }
  return Array.from(grouped.entries())
    .map(([name, data]) => ({
      itemName: name,
      player: data.player,
      unitsSold: data.count,
      totalRevenue: data.revenue,
      avgMargin: Math.round((data.margin / data.revenue) * 1000) / 10,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);
}

export function getTodaysSales(storeId?: string): { revenue: number; transactions: number; margin: number; marginPercent: number } {
  const today = '2026-03-12';
  const sales = SALES_HISTORY.filter((s) => s.date >= today && (!storeId || s.storeId === storeId));
  const revenue = sales.reduce((s, r) => s + r.salePrice, 0);
  const cost = sales.reduce((s, r) => s + r.costBasis, 0);
  const margin = revenue - cost;
  return {
    revenue,
    transactions: sales.length,
    margin,
    marginPercent: revenue > 0 ? Math.round((margin / revenue) * 1000) / 10 : 0,
  };
}

export function getActiveConsignmentCount(storeId?: string): number {
  return CONSIGNMENTS.filter(
    (c) => c.status === 'active' && (!storeId || c.storeId === storeId)
  ).length;
}
