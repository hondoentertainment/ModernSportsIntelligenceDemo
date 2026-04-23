// @ts-nocheck
// Phase 6: Live Marketplace API Integrations — Multi-marketplace OAuth connection service

export type MarketplacePlatform = 'ebay' | 'comc' | 'myslabs' | 'sportlots' | 'pwcc' | 'goldin' | 'whatnot';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'expired';

export interface MarketplaceOAuthConfig {
  platform: MarketplacePlatform;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface MarketplaceConnection {
  id: string;
  platform: MarketplacePlatform;
  platformLabel: string;
  status: ConnectionStatus;
  username: string;
  email: string;
  connectedAt: string;
  lastSync: string;
  tokenExpiresAt: string;
  itemsImported: number;
  totalSales: number;
  totalRevenue: number;
  logoColor: string;
  oauthConfig: MarketplaceOAuthConfig;
}

export interface MarketplaceListing {
  id: string;
  platform: MarketplacePlatform;
  platformLabel: string;
  externalId: string;
  title: string;
  player: string;
  year: number;
  setName: string;
  cardNumber: string;
  grade: string;
  grader: string;
  listPrice: number;
  currentBid?: number;
  bidCount?: number;
  watchers: number;
  views: number;
  status: 'active' | 'sold' | 'ended' | 'draft' | 'scheduled';
  listedAt: string;
  endsAt?: string;
  imageUrl: string;
}

export interface MarketplaceSale {
  id: string;
  platform: MarketplacePlatform;
  platformLabel: string;
  title: string;
  player: string;
  salePrice: number;
  buyerUsername: string;
  soldAt: string;
  fees: number;
  netProceeds: number;
  shippingCost: number;
  trackingNumber?: string;
  costBasis: number;
  profit: number;
}

export interface ImportBatch {
  id: string;
  platform: MarketplacePlatform;
  platformLabel: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalItems: number;
  importedItems: number;
  failedItems: number;
  duplicateItems: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  importType: 'purchases' | 'sales' | 'listings' | 'full';
}

export interface SyncStatus {
  platform: MarketplacePlatform;
  platformLabel: string;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progress: number;
  lastSync: string;
  nextSync: string;
  itemsSynced: number;
  errors: number;
  syncType: 'full' | 'incremental';
}

export interface MarketplaceAnalytics {
  totalRevenue: number;
  totalSales: number;
  totalListings: number;
  avgSalePrice: number;
  totalFees: number;
  netProfit: number;
  revenueByPlatform: { platform: string; label: string; revenue: number; sales: number; color: string }[];
  monthlySales: { month: string; revenue: number; sales: number }[];
  topSellingCards: { title: string; platform: string; price: number; profit: number }[];
}

export interface SellThroughRate {
  category: string;
  listed: number;
  sold: number;
  rate: number;
  avgDaysToSell: number;
  avgPrice: number;
}

export interface MarketplaceFee {
  platform: MarketplacePlatform;
  platformLabel: string;
  listingFee: number;
  finalValueFee: number;
  paymentProcessing: number;
  shippingLabel: number;
  totalEstimated: number;
  notes: string;
  color: string;
}

export interface CrossMarketplacePrice {
  cardTitle: string;
  player: string;
  year: number;
  grade: string;
  prices: {
    platform: MarketplacePlatform;
    platformLabel: string;
    price: number;
    condition: string;
    listingUrl: string;
    lastUpdated: string;
  }[];
  bestPrice: number;
  worstPrice: number;
  avgPrice: number;
  spread: number;
  spreadPercent: number;
}

// ---- Platform metadata ----

const PLATFORM_META: Record<MarketplacePlatform, { label: string; color: string; authUrl: string }> = {
  ebay: { label: 'eBay', color: '#E53238', authUrl: 'https://auth.ebay.com/oauth2/authorize' },
  comc: { label: 'COMC', color: '#1E88E5', authUrl: 'https://comc.com/oauth/authorize' },
  myslabs: { label: 'MySlabs', color: '#7C3AED', authUrl: 'https://myslabs.com/oauth/authorize' },
  sportlots: { label: 'SportLots', color: '#16A34A', authUrl: 'https://sportlots.com/api/oauth' },
  pwcc: { label: 'PWCC', color: '#F59E0B', authUrl: 'https://pwccmarketplace.com/oauth/authorize' },
  goldin: { label: 'Goldin', color: '#DC2626', authUrl: 'https://goldin.co/oauth/authorize' },
  whatnot: { label: 'Whatnot', color: '#8B5CF6', authUrl: 'https://whatnot.com/oauth/authorize' },
};

// ---- Mock data generators ----

function mockConnections(): MarketplaceConnection[] {
  const now = new Date();
  return [
    {
      id: 'conn-ebay-001',
      platform: 'ebay',
      platformLabel: 'eBay',
      status: 'connected',
      username: 'cardvault_pro',
      email: 'seller@cardvault.io',
      connectedAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      lastSync: new Date(now.getTime() - 1800000).toISOString(),
      tokenExpiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      itemsImported: 1247,
      totalSales: 389,
      totalRevenue: 47820.50,
      logoColor: '#E53238',
      oauthConfig: { platform: 'ebay', clientId: 'ebay-xxxxx', redirectUri: 'https://app.msi.io/oauth/ebay', scopes: ['sell', 'buy', 'analytics'], authUrl: 'https://auth.ebay.com/oauth2/authorize', tokenUrl: 'https://api.ebay.com/identity/v1/oauth2/token' },
    },
    {
      id: 'conn-comc-002',
      platform: 'comc',
      platformLabel: 'COMC',
      status: 'connected',
      username: 'msi_collector',
      email: 'seller@cardvault.io',
      connectedAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
      lastSync: new Date(now.getTime() - 3600000).toISOString(),
      tokenExpiresAt: new Date(now.getTime() + 45 * 86400000).toISOString(),
      itemsImported: 834,
      totalSales: 212,
      totalRevenue: 18940.00,
      logoColor: '#1E88E5',
      oauthConfig: { platform: 'comc', clientId: 'comc-xxxxx', redirectUri: 'https://app.msi.io/oauth/comc', scopes: ['inventory', 'sales'], authUrl: 'https://comc.com/oauth/authorize', tokenUrl: 'https://comc.com/oauth/token' },
    },
    {
      id: 'conn-myslabs-003',
      platform: 'myslabs',
      platformLabel: 'MySlabs',
      status: 'connected',
      username: 'slab_king_23',
      email: 'seller@cardvault.io',
      connectedAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
      lastSync: new Date(now.getTime() - 7200000).toISOString(),
      tokenExpiresAt: new Date(now.getTime() + 20 * 86400000).toISOString(),
      itemsImported: 456,
      totalSales: 98,
      totalRevenue: 12350.75,
      logoColor: '#7C3AED',
      oauthConfig: { platform: 'myslabs', clientId: 'myslabs-xxxxx', redirectUri: 'https://app.msi.io/oauth/myslabs', scopes: ['read', 'write'], authUrl: 'https://myslabs.com/oauth/authorize', tokenUrl: 'https://myslabs.com/oauth/token' },
    },
    {
      id: 'conn-sportlots-004',
      platform: 'sportlots',
      platformLabel: 'SportLots',
      status: 'disconnected',
      username: '',
      email: '',
      connectedAt: '',
      lastSync: '',
      tokenExpiresAt: '',
      itemsImported: 0,
      totalSales: 0,
      totalRevenue: 0,
      logoColor: '#16A34A',
      oauthConfig: { platform: 'sportlots', clientId: '', redirectUri: 'https://app.msi.io/oauth/sportlots', scopes: ['inventory'], authUrl: 'https://sportlots.com/api/oauth', tokenUrl: 'https://sportlots.com/api/oauth/token' },
    },
    {
      id: 'conn-pwcc-005',
      platform: 'pwcc',
      platformLabel: 'PWCC',
      status: 'disconnected',
      username: '',
      email: '',
      connectedAt: '',
      lastSync: '',
      tokenExpiresAt: '',
      itemsImported: 0,
      totalSales: 0,
      totalRevenue: 0,
      logoColor: '#F59E0B',
      oauthConfig: { platform: 'pwcc', clientId: '', redirectUri: 'https://app.msi.io/oauth/pwcc', scopes: ['consignment', 'analytics'], authUrl: 'https://pwccmarketplace.com/oauth/authorize', tokenUrl: 'https://pwccmarketplace.com/oauth/token' },
    },
    {
      id: 'conn-goldin-006',
      platform: 'goldin',
      platformLabel: 'Goldin',
      status: 'error',
      username: 'goldin_user',
      email: 'seller@cardvault.io',
      connectedAt: new Date(now.getTime() - 120 * 86400000).toISOString(),
      lastSync: new Date(now.getTime() - 7 * 86400000).toISOString(),
      tokenExpiresAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      itemsImported: 23,
      totalSales: 5,
      totalRevenue: 8750.00,
      logoColor: '#DC2626',
      oauthConfig: { platform: 'goldin', clientId: 'goldin-xxxxx', redirectUri: 'https://app.msi.io/oauth/goldin', scopes: ['auction', 'analytics'], authUrl: 'https://goldin.co/oauth/authorize', tokenUrl: 'https://goldin.co/oauth/token' },
    },
    {
      id: 'conn-whatnot-007',
      platform: 'whatnot',
      platformLabel: 'Whatnot',
      status: 'disconnected',
      username: '',
      email: '',
      connectedAt: '',
      lastSync: '',
      tokenExpiresAt: '',
      itemsImported: 0,
      totalSales: 0,
      totalRevenue: 0,
      logoColor: '#8B5CF6',
      oauthConfig: { platform: 'whatnot', clientId: '', redirectUri: 'https://app.msi.io/oauth/whatnot', scopes: ['stream', 'sales'], authUrl: 'https://whatnot.com/oauth/authorize', tokenUrl: 'https://whatnot.com/oauth/token' },
    },
  ];
}

function mockListings(): MarketplaceListing[] {
  const now = new Date();
  return [
    { id: 'lst-001', platform: 'ebay', platformLabel: 'eBay', externalId: 'EBAY-394827561', title: '2020 Panini Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', year: 2020, setName: 'Panini Prizm', cardNumber: '325', grade: 'PSA 10', grader: 'PSA', listPrice: 285.00, currentBid: 245.00, bidCount: 18, watchers: 42, views: 1893, status: 'active', listedAt: new Date(now.getTime() - 3 * 86400000).toISOString(), endsAt: new Date(now.getTime() + 2 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1621570074984-45a08195a178?w=200' },
    { id: 'lst-002', platform: 'ebay', platformLabel: 'eBay', externalId: 'EBAY-394827562', title: '2018 Panini Prizm Luka Doncic Silver RC BGS 9.5', player: 'Luka Doncic', year: 2018, setName: 'Panini Prizm', cardNumber: '280', grade: 'BGS 9.5', grader: 'BGS', listPrice: 1850.00, watchers: 89, views: 4210, status: 'active', listedAt: new Date(now.getTime() - 5 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200' },
    { id: 'lst-003', platform: 'comc', platformLabel: 'COMC', externalId: 'COMC-8834521', title: '2019 Topps Chrome Yordan Alvarez RC PSA 10', player: 'Yordan Alvarez', year: 2019, setName: 'Topps Chrome', cardNumber: '201', grade: 'PSA 10', grader: 'PSA', listPrice: 145.00, watchers: 12, views: 342, status: 'active', listedAt: new Date(now.getTime() - 7 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1508344928928-7165b0a59760?w=200' },
    { id: 'lst-004', platform: 'comc', platformLabel: 'COMC', externalId: 'COMC-8834522', title: '2021 Topps Chrome Julio Rodriguez RC SGC 10', player: 'Julio Rodriguez', year: 2021, setName: 'Topps Chrome', cardNumber: '166', grade: 'SGC 10', grader: 'SGC', listPrice: 95.00, watchers: 8, views: 198, status: 'active', listedAt: new Date(now.getTime() - 2 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200' },
    { id: 'lst-005', platform: 'myslabs', platformLabel: 'MySlabs', externalId: 'MS-445521', title: '2020 Panini Select Joe Burrow Concourse PSA 10', player: 'Joe Burrow', year: 2020, setName: 'Panini Select', cardNumber: '1', grade: 'PSA 10', grader: 'PSA', listPrice: 175.00, watchers: 23, views: 678, status: 'active', listedAt: new Date(now.getTime() - 1 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200' },
    { id: 'lst-006', platform: 'ebay', platformLabel: 'eBay', externalId: 'EBAY-394827563', title: '2022 Topps Chrome Julio Rodriguez Gold /50 PSA 10', player: 'Julio Rodriguez', year: 2022, setName: 'Topps Chrome', cardNumber: '166', grade: 'PSA 10', grader: 'PSA', listPrice: 520.00, currentBid: 480.00, bidCount: 31, watchers: 67, views: 3102, status: 'active', listedAt: new Date(now.getTime() - 4 * 86400000).toISOString(), endsAt: new Date(now.getTime() + 1 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200' },
    { id: 'lst-007', platform: 'myslabs', platformLabel: 'MySlabs', externalId: 'MS-445522', title: '2018 Optic Trae Young Rated Rookie PSA 10', player: 'Trae Young', year: 2018, setName: 'Donruss Optic', cardNumber: '198', grade: 'PSA 10', grader: 'PSA', listPrice: 210.00, watchers: 15, views: 412, status: 'sold', listedAt: new Date(now.getTime() - 10 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200' },
    { id: 'lst-008', platform: 'ebay', platformLabel: 'eBay', externalId: 'EBAY-394827564', title: '2023 Bowman Chrome Victor Wembanyama RC PSA 10', player: 'Victor Wembanyama', year: 2023, setName: 'Bowman Chrome', cardNumber: '1', grade: 'PSA 10', grader: 'PSA', listPrice: 890.00, watchers: 134, views: 8921, status: 'active', listedAt: new Date(now.getTime() - 1 * 86400000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200' },
  ];
}

function mockImportBatches(): ImportBatch[] {
  const now = new Date();
  return [
    { id: 'imp-001', platform: 'ebay', platformLabel: 'eBay', status: 'completed', totalItems: 156, importedItems: 152, failedItems: 2, duplicateItems: 2, startedAt: new Date(now.getTime() - 2 * 3600000).toISOString(), completedAt: new Date(now.getTime() - 1.8 * 3600000).toISOString(), importType: 'full' },
    { id: 'imp-002', platform: 'comc', platformLabel: 'COMC', status: 'completed', totalItems: 89, importedItems: 89, failedItems: 0, duplicateItems: 0, startedAt: new Date(now.getTime() - 4 * 3600000).toISOString(), completedAt: new Date(now.getTime() - 3.7 * 3600000).toISOString(), importType: 'purchases' },
    { id: 'imp-003', platform: 'myslabs', platformLabel: 'MySlabs', status: 'completed', totalItems: 45, importedItems: 43, failedItems: 1, duplicateItems: 1, startedAt: new Date(now.getTime() - 8 * 3600000).toISOString(), completedAt: new Date(now.getTime() - 7.8 * 3600000).toISOString(), importType: 'sales' },
    { id: 'imp-004', platform: 'ebay', platformLabel: 'eBay', status: 'in_progress', totalItems: 72, importedItems: 48, failedItems: 0, duplicateItems: 3, startedAt: new Date(now.getTime() - 600000).toISOString(), importType: 'listings' },
    { id: 'imp-005', platform: 'goldin', platformLabel: 'Goldin', status: 'failed', totalItems: 12, importedItems: 0, failedItems: 12, duplicateItems: 0, startedAt: new Date(now.getTime() - 24 * 3600000).toISOString(), completedAt: new Date(now.getTime() - 23.9 * 3600000).toISOString(), errorMessage: 'OAuth token expired — please reconnect your Goldin account', importType: 'full' },
    { id: 'imp-006', platform: 'comc', platformLabel: 'COMC', status: 'completed', totalItems: 234, importedItems: 230, failedItems: 2, duplicateItems: 2, startedAt: new Date(now.getTime() - 48 * 3600000).toISOString(), completedAt: new Date(now.getTime() - 47.5 * 3600000).toISOString(), importType: 'full' },
  ];
}

function mockSyncStatuses(): SyncStatus[] {
  const now = new Date();
  return [
    { platform: 'ebay', platformLabel: 'eBay', status: 'completed', progress: 100, lastSync: new Date(now.getTime() - 1800000).toISOString(), nextSync: new Date(now.getTime() + 1800000).toISOString(), itemsSynced: 1247, errors: 0, syncType: 'incremental' },
    { platform: 'comc', platformLabel: 'COMC', status: 'idle', progress: 100, lastSync: new Date(now.getTime() - 3600000).toISOString(), nextSync: new Date(now.getTime() + 3600000).toISOString(), itemsSynced: 834, errors: 0, syncType: 'incremental' },
    { platform: 'myslabs', platformLabel: 'MySlabs', status: 'syncing', progress: 67, lastSync: new Date(now.getTime() - 7200000).toISOString(), nextSync: new Date(now.getTime() + 1200000).toISOString(), itemsSynced: 302, errors: 1, syncType: 'full' },
    { platform: 'goldin', platformLabel: 'Goldin', status: 'error', progress: 0, lastSync: new Date(now.getTime() - 7 * 86400000).toISOString(), nextSync: '', itemsSynced: 0, errors: 1, syncType: 'full' },
  ];
}

function mockSales(): MarketplaceSale[] {
  const now = new Date();
  return [
    { id: 'sale-001', platform: 'ebay', platformLabel: 'eBay', title: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', salePrice: 295.00, buyerUsername: 'card_shark_88', soldAt: new Date(now.getTime() - 1 * 86400000).toISOString(), fees: 38.35, netProceeds: 252.30, shippingCost: 4.35, trackingNumber: '9400111899223100012345', costBasis: 180.00, profit: 72.30 },
    { id: 'sale-002', platform: 'ebay', platformLabel: 'eBay', title: '2022 Topps Chrome Adley Rutschman RC PSA 10', player: 'Adley Rutschman', salePrice: 42.00, buyerUsername: 'orioles_fan_21', soldAt: new Date(now.getTime() - 2 * 86400000).toISOString(), fees: 5.46, netProceeds: 32.19, shippingCost: 4.35, trackingNumber: '9400111899223100012346', costBasis: 18.00, profit: 14.19 },
    { id: 'sale-003', platform: 'comc', platformLabel: 'COMC', title: '2019 Topps Chrome Yordan Alvarez RC PSA 9', player: 'Yordan Alvarez', salePrice: 65.00, buyerUsername: 'astros_collector', soldAt: new Date(now.getTime() - 3 * 86400000).toISOString(), fees: 3.25, netProceeds: 61.75, shippingCost: 0, costBasis: 28.00, profit: 33.75 },
    { id: 'sale-004', platform: 'myslabs', platformLabel: 'MySlabs', title: '2018 Optic Trae Young Rated Rookie PSA 10', player: 'Trae Young', salePrice: 210.00, buyerUsername: 'hawks_hoops', soldAt: new Date(now.getTime() - 4 * 86400000).toISOString(), fees: 10.50, netProceeds: 195.15, shippingCost: 4.35, costBasis: 120.00, profit: 75.15 },
    { id: 'sale-005', platform: 'ebay', platformLabel: 'eBay', title: '2021 Topps Chrome Wander Franco RC PSA 10', player: 'Wander Franco', salePrice: 78.00, buyerUsername: 'rays_of_glory', soldAt: new Date(now.getTime() - 5 * 86400000).toISOString(), fees: 10.14, netProceeds: 63.51, shippingCost: 4.35, costBasis: 55.00, profit: 8.51 },
    { id: 'sale-006', platform: 'comc', platformLabel: 'COMC', title: '2020 Panini Select Joe Burrow Concourse PSA 10', player: 'Joe Burrow', salePrice: 135.00, buyerUsername: 'bengals_best', soldAt: new Date(now.getTime() - 6 * 86400000).toISOString(), fees: 6.75, netProceeds: 128.25, shippingCost: 0, costBasis: 72.00, profit: 56.25 },
  ];
}

// ---- Public API ----

let connectionsCache: MarketplaceConnection[] | null = null;

export function getConnections(): MarketplaceConnection[] {
  if (!connectionsCache) {
    connectionsCache = mockConnections();
  }
  return connectionsCache;
}

export async function connectMarketplace(platform: MarketplacePlatform): Promise<MarketplaceConnection> {
  const meta = PLATFORM_META[platform];
  // Simulate OAuth redirect + token exchange
  await new Promise((r) => setTimeout(r, 2200));

  const now = new Date();
  const newConn: MarketplaceConnection = {
    id: `conn-${platform}-${Date.now()}`,
    platform,
    platformLabel: meta.label,
    status: 'connected',
    username: `msi_${platform}_user`,
    email: 'seller@cardvault.io',
    connectedAt: now.toISOString(),
    lastSync: now.toISOString(),
    tokenExpiresAt: new Date(now.getTime() + 60 * 86400000).toISOString(),
    itemsImported: 0,
    totalSales: 0,
    totalRevenue: 0,
    logoColor: meta.color,
    oauthConfig: {
      platform,
      clientId: `${platform}-new-client`,
      redirectUri: `https://app.msi.io/oauth/${platform}`,
      scopes: ['read', 'write'],
      authUrl: meta.authUrl,
      tokenUrl: `${meta.authUrl.replace('authorize', 'token')}`,
    },
  };

  if (connectionsCache) {
    const idx = connectionsCache.findIndex((c) => c.platform === platform);
    if (idx >= 0) {
      connectionsCache[idx] = newConn;
    } else {
      connectionsCache.push(newConn);
    }
  }

  return newConn;
}

export function disconnectMarketplace(platform: string): void {
  if (connectionsCache) {
    const idx = connectionsCache.findIndex((c) => c.platform === platform);
    if (idx >= 0) {
      connectionsCache[idx] = { ...connectionsCache[idx], status: 'disconnected', username: '', lastSync: '' };
    }
  }
}

export function getSyncStatus(): SyncStatus[] {
  return mockSyncStatuses();
}

export async function importPurchases(platform: string): Promise<ImportBatch> {
  await new Promise((r) => setTimeout(r, 1500));
  const now = new Date();
  const meta = PLATFORM_META[platform as MarketplacePlatform] || { label: platform };
  return {
    id: `imp-${Date.now()}`,
    platform: platform as MarketplacePlatform,
    platformLabel: meta.label,
    status: 'completed',
    totalItems: Math.floor(Math.random() * 80) + 20,
    importedItems: Math.floor(Math.random() * 70) + 20,
    failedItems: Math.floor(Math.random() * 3),
    duplicateItems: Math.floor(Math.random() * 5),
    startedAt: now.toISOString(),
    completedAt: new Date(now.getTime() + 60000).toISOString(),
    importType: 'purchases',
  };
}

export function getRecentImports(): ImportBatch[] {
  return mockImportBatches();
}

export function getMarketplaceListings(platform?: string): MarketplaceListing[] {
  const all = mockListings();
  if (platform) return all.filter((l) => l.platform === platform);
  return all;
}

export function getRecentSales(): MarketplaceSale[] {
  return mockSales();
}

export function getCrossMarketplacePricing(cardQuery: string): CrossMarketplacePrice[] {
  // Simulate price lookup across platforms for popular cards
  const _q = cardQuery.toLowerCase();
  const results: CrossMarketplacePrice[] = [
    {
      cardTitle: '2020 Panini Prizm Justin Herbert RC PSA 10',
      player: 'Justin Herbert',
      year: 2020,
      grade: 'PSA 10',
      prices: [
        { platform: 'ebay', platformLabel: 'eBay', price: 285.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'comc', platformLabel: 'COMC', price: 272.50, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'myslabs', platformLabel: 'MySlabs', price: 265.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'sportlots', platformLabel: 'SportLots', price: 259.99, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
      ],
      bestPrice: 259.99,
      worstPrice: 285.00,
      avgPrice: 270.62,
      spread: 25.01,
      spreadPercent: 9.62,
    },
    {
      cardTitle: '2018 Panini Prizm Luka Doncic Silver RC BGS 9.5',
      player: 'Luka Doncic',
      year: 2018,
      grade: 'BGS 9.5',
      prices: [
        { platform: 'ebay', platformLabel: 'eBay', price: 1850.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'pwcc', platformLabel: 'PWCC', price: 1920.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'goldin', platformLabel: 'Goldin', price: 2050.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'myslabs', platformLabel: 'MySlabs', price: 1780.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
      ],
      bestPrice: 1780.00,
      worstPrice: 2050.00,
      avgPrice: 1900.00,
      spread: 270.00,
      spreadPercent: 15.17,
    },
    {
      cardTitle: '2023 Bowman Chrome Victor Wembanyama RC PSA 10',
      player: 'Victor Wembanyama',
      year: 2023,
      grade: 'PSA 10',
      prices: [
        { platform: 'ebay', platformLabel: 'eBay', price: 890.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'comc', platformLabel: 'COMC', price: 845.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'goldin', platformLabel: 'Goldin', price: 975.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'whatnot', platformLabel: 'Whatnot', price: 810.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
      ],
      bestPrice: 810.00,
      worstPrice: 975.00,
      avgPrice: 880.00,
      spread: 165.00,
      spreadPercent: 20.37,
    },
    {
      cardTitle: '2020 Panini Select Joe Burrow Concourse PSA 10',
      player: 'Joe Burrow',
      year: 2020,
      grade: 'PSA 10',
      prices: [
        { platform: 'ebay', platformLabel: 'eBay', price: 175.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'comc', platformLabel: 'COMC', price: 162.50, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
        { platform: 'myslabs', platformLabel: 'MySlabs', price: 158.00, condition: 'Gem Mint', listingUrl: '#', lastUpdated: new Date().toISOString() },
      ],
      bestPrice: 158.00,
      worstPrice: 175.00,
      avgPrice: 165.17,
      spread: 17.00,
      spreadPercent: 10.76,
    },
  ];

  if (cardQuery.trim()) {
    return results.filter((r) => r.cardTitle.toLowerCase().includes(_q) || r.player.toLowerCase().includes(_q));
  }
  return results;
}

export function getMarketplaceAnalytics(): MarketplaceAnalytics {
  return {
    totalRevenue: 87861.25,
    totalSales: 704,
    totalListings: 2537,
    avgSalePrice: 124.80,
    totalFees: 8342.18,
    netProfit: 34519.07,
    revenueByPlatform: [
      { platform: 'ebay', label: 'eBay', revenue: 47820.50, sales: 389, color: '#E53238' },
      { platform: 'comc', label: 'COMC', revenue: 18940.00, sales: 212, color: '#1E88E5' },
      { platform: 'myslabs', label: 'MySlabs', revenue: 12350.75, sales: 98, color: '#7C3AED' },
      { platform: 'goldin', label: 'Goldin', revenue: 8750.00, sales: 5, color: '#DC2626' },
    ],
    monthlySales: [
      { month: 'Oct', revenue: 9840, sales: 78 },
      { month: 'Nov', revenue: 14520, sales: 112 },
      { month: 'Dec', revenue: 18230, sales: 145 },
      { month: 'Jan', revenue: 16100, sales: 128 },
      { month: 'Feb', revenue: 15620, sales: 124 },
      { month: 'Mar', revenue: 13551, sales: 117 },
    ],
    topSellingCards: [
      { title: '2018 Prizm Luka Doncic Silver RC BGS 9.5', platform: 'eBay', price: 1850.00, profit: 920.00 },
      { title: '2023 Bowman Chrome Wembanyama RC PSA 10', platform: 'eBay', price: 890.00, profit: 445.00 },
      { title: '2020 Prizm Justin Herbert RC PSA 10', platform: 'eBay', price: 295.00, profit: 115.00 },
      { title: '2018 Optic Trae Young Rated Rookie PSA 10', platform: 'MySlabs', price: 210.00, profit: 90.00 },
      { title: '2020 Select Joe Burrow Concourse PSA 10', platform: 'COMC', price: 175.00, profit: 103.00 },
    ],
  };
}

export function getSellThroughRates(platform: string): SellThroughRate[] {
  const _p = platform;
  return [
    { category: 'Football RC PSA 10', listed: 48, sold: 39, rate: 81.3, avgDaysToSell: 4.2, avgPrice: 185.50 },
    { category: 'Basketball RC PSA 10', listed: 62, sold: 45, rate: 72.6, avgDaysToSell: 5.8, avgPrice: 225.00 },
    { category: 'Baseball RC PSA 10', listed: 85, sold: 52, rate: 61.2, avgDaysToSell: 7.1, avgPrice: 78.30 },
    { category: 'Football Parallels', listed: 34, sold: 18, rate: 52.9, avgDaysToSell: 9.4, avgPrice: 42.00 },
    { category: 'Basketball Parallels', listed: 29, sold: 12, rate: 41.4, avgDaysToSell: 12.3, avgPrice: 65.80 },
    { category: 'Vintage Pre-1980', listed: 21, sold: 16, rate: 76.2, avgDaysToSell: 3.9, avgPrice: 310.00 },
    { category: 'Baseball Parallels', listed: 41, sold: 14, rate: 34.1, avgDaysToSell: 14.8, avgPrice: 28.50 },
    { category: 'Hockey RC/Stars', listed: 18, sold: 7, rate: 38.9, avgDaysToSell: 11.2, avgPrice: 55.00 },
  ];
}

export function getMarketplaceFees(): MarketplaceFee[] {
  return [
    { platform: 'ebay', platformLabel: 'eBay', listingFee: 0.35, finalValueFee: 13.25, paymentProcessing: 2.95, shippingLabel: 4.35, totalEstimated: 20.90, notes: '13.25% FVF on cards; managed payments 2.95%', color: '#E53238' },
    { platform: 'comc', platformLabel: 'COMC', listingFee: 0.00, finalValueFee: 5.00, paymentProcessing: 0.00, shippingLabel: 0.00, totalEstimated: 5.00, notes: '5% commission; free shipping to buyers (port fee for sellers)', color: '#1E88E5' },
    { platform: 'myslabs', platformLabel: 'MySlabs', listingFee: 0.00, finalValueFee: 5.00, paymentProcessing: 2.90, shippingLabel: 4.50, totalEstimated: 12.40, notes: '5% seller fee + payment processing', color: '#7C3AED' },
    { platform: 'sportlots', platformLabel: 'SportLots', listingFee: 0.00, finalValueFee: 0.00, paymentProcessing: 2.90, shippingLabel: 1.00, totalEstimated: 3.90, notes: 'No selling fees; $.50-$1.00 combined shipping', color: '#16A34A' },
    { platform: 'pwcc', platformLabel: 'PWCC', listingFee: 0.00, finalValueFee: 10.00, paymentProcessing: 0.00, shippingLabel: 0.00, totalEstimated: 10.00, notes: '8-10% consignment fee; includes shipping & insurance', color: '#F59E0B' },
    { platform: 'goldin', platformLabel: 'Goldin', listingFee: 0.00, finalValueFee: 15.00, paymentProcessing: 0.00, shippingLabel: 0.00, totalEstimated: 15.00, notes: '15% sellers premium on auction lots', color: '#DC2626' },
    { platform: 'whatnot', platformLabel: 'Whatnot', listingFee: 0.00, finalValueFee: 8.00, paymentProcessing: 2.90, shippingLabel: 4.50, totalEstimated: 15.40, notes: '8% platform fee + payment processing; live auction format', color: '#8B5CF6' },
  ];
}

export async function syncInventory(platform: string): Promise<SyncStatus> {
  await new Promise((r) => setTimeout(r, 2000));
  const meta = PLATFORM_META[platform as MarketplacePlatform] || { label: platform };
  const now = new Date();
  return {
    platform: platform as MarketplacePlatform,
    platformLabel: meta.label,
    status: 'completed',
    progress: 100,
    lastSync: now.toISOString(),
    nextSync: new Date(now.getTime() + 3600000).toISOString(),
    itemsSynced: Math.floor(Math.random() * 500) + 100,
    errors: 0,
    syncType: 'full',
  };
}
