// Phase 137: Multi-Platform Inventory Sync & Universal Collection Manager

export type SyncPlatform = 'ebay' | 'psa_registry' | 'comc' | 'alt_vault' | 'fanatics_collect' | 'myslabs';

export type SyncConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export type ListingStatus = 'listed' | 'sold' | 'vaulted' | 'in_transit' | 'unlisted';

export interface SyncConnection {
  platform: SyncPlatform;
  platformLabel: string;
  status: SyncConnectionStatus;
  last_sync: string;
  items_count: number;
  api_key_masked: string;
  sync_frequency: string;
  error_message?: string;
}

export interface SyncedCard {
  card_id: string;
  card_name: string;
  player: string;
  year: number;
  grade: string;
  platform: SyncPlatform;
  platform_id: string;
  listing_status: ListingStatus;
  price: number;
  cost_basis: number;
  last_updated: string;
  image_url?: string;
}

export interface SyncConflict {
  id: string;
  card_id: string;
  card_name: string;
  field: string;
  local_value: string;
  remote_value: string;
  platform: SyncPlatform;
  detected_at: string;
  severity: 'low' | 'medium' | 'high';
}

export interface GhostListing {
  id: string;
  card_name: string;
  player: string;
  grade: string;
  found_platform: SyncPlatform;
  seller: string;
  seller_id: string;
  listing_url: string;
  listed_price: number;
  your_cost_basis: number;
  confidence: number;
  detected_at: string;
  status: 'new' | 'investigating' | 'confirmed_theft' | 'false_positive';
}

export interface SyncReport {
  total_synced: number;
  total_value: number;
  total_cost_basis: number;
  total_profit_loss: number;
  platforms_connected: number;
  platforms_syncing: number;
  conflicts_pending: number;
  ghost_listings_detected: number;
  last_full_sync: string;
  sync_health: 'healthy' | 'warning' | 'critical';
}

export interface BulkScanResult {
  code: string;
  matched: boolean;
  card_name?: string;
  player?: string;
  platform?: SyncPlatform;
  status?: ListingStatus;
  error?: string;
}

export interface SyncHistoryEntry {
  id: string;
  platform: SyncPlatform;
  action: 'sync' | 'connect' | 'disconnect' | 'conflict_resolved' | 'ghost_detected';
  description: string;
  timestamp: string;
  items_affected: number;
  success: boolean;
}

export interface PlatformCostBasis {
  platform: SyncPlatform;
  platformLabel: string;
  total_cost: number;
  total_value: number;
  total_items: number;
  profit_loss: number;
  roi_percent: number;
}

export interface CrossPlatformValue {
  platform: SyncPlatform;
  platformLabel: string;
  value: number;
  items: number;
  percentage: number;
}

// ─── Mock Data ───────────────────────────────────────────────

const CONNECTIONS: SyncConnection[] = [
  { platform: 'ebay', platformLabel: 'eBay', status: 'connected', last_sync: '2026-03-14T08:32:00Z', items_count: 127, api_key_masked: '****-****-7d3f', sync_frequency: 'Every 15 min' },
  { platform: 'psa_registry', platformLabel: 'PSA Registry', status: 'connected', last_sync: '2026-03-14T07:15:00Z', items_count: 84, api_key_masked: '****-****-a1b2', sync_frequency: 'Every 1 hour' },
  { platform: 'comc', platformLabel: 'COMC', status: 'connected', last_sync: '2026-03-14T06:45:00Z', items_count: 63, api_key_masked: '****-****-9e4c', sync_frequency: 'Every 30 min' },
  { platform: 'alt_vault', platformLabel: 'Alt Vault', status: 'syncing', last_sync: '2026-03-14T08:40:00Z', items_count: 41, api_key_masked: '****-****-f7e8', sync_frequency: 'Every 2 hours' },
  { platform: 'fanatics_collect', platformLabel: 'Fanatics Collect', status: 'error', last_sync: '2026-03-13T22:10:00Z', items_count: 38, api_key_masked: '****-****-3c5d', sync_frequency: 'Every 30 min', error_message: 'API rate limit exceeded. Retry after 2026-03-14T10:00:00Z' },
  { platform: 'myslabs', platformLabel: 'MySlabs', status: 'disconnected', last_sync: '2026-03-10T14:00:00Z', items_count: 0, api_key_masked: '', sync_frequency: 'N/A' },
];

const SYNCED_CARDS: SyncedCard[] = [
  // eBay listings
  { card_id: 'sc-001', card_name: '2023 Prizm Silver #280 Victor Wembanyama RC', player: 'Victor Wembanyama', year: 2023, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394821', listing_status: 'listed', price: 485, cost_basis: 310, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-002', card_name: '2024 Topps Chrome #1 Shohei Ohtani SP', player: 'Shohei Ohtani', year: 2024, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394822', listing_status: 'listed', price: 340, cost_basis: 220, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-003', card_name: '2023 Select Concourse #76 Jahmyr Gibbs RC', player: 'Jahmyr Gibbs', year: 2023, grade: 'Raw', platform: 'ebay', platform_id: 'eb-394823', listing_status: 'sold', price: 28, cost_basis: 12, last_updated: '2026-03-13T19:45:00Z' },
  { card_id: 'sc-004', card_name: '2022 Topps Chrome #27 Julio Rodriguez RC', player: 'Julio Rodriguez', year: 2022, grade: 'BGS 9.5', platform: 'ebay', platform_id: 'eb-394824', listing_status: 'listed', price: 265, cost_basis: 180, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-005', card_name: '2024 Bowman Chrome 1st #BCP-1 Ethan Salas', player: 'Ethan Salas', year: 2024, grade: 'Raw', platform: 'ebay', platform_id: 'eb-394825', listing_status: 'listed', price: 89, cost_basis: 45, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-006', card_name: '2020 Prizm #258 Justin Herbert RC', player: 'Justin Herbert', year: 2020, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394826', listing_status: 'listed', price: 310, cost_basis: 210, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-007', card_name: '2024 Panini Eminence #12 LeBron James', player: 'LeBron James', year: 2024, grade: 'BGS 9.5', platform: 'ebay', platform_id: 'eb-394827', listing_status: 'listed', price: 1800, cost_basis: 1250, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-008', card_name: '2023 Optic Rated Rookie #201 Chet Holmgren', player: 'Chet Holmgren', year: 2023, grade: 'PSA 9', platform: 'ebay', platform_id: 'eb-394828', listing_status: 'listed', price: 58, cost_basis: 35, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-009', card_name: '2023 Mosaic Stained Glass #22 Luka Doncic', player: 'Luka Doncic', year: 2023, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394829', listing_status: 'listed', price: 280, cost_basis: 175, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-010', card_name: '2021 Topps Chrome Update #USC162 Bobby Witt Jr.', player: 'Bobby Witt Jr.', year: 2021, grade: 'SGC 10', platform: 'ebay', platform_id: 'eb-394830', listing_status: 'sold', price: 225, cost_basis: 140, last_updated: '2026-03-12T14:20:00Z' },
  { card_id: 'sc-011', card_name: '2023 National Treasures #156 Anthony Richardson', player: 'Anthony Richardson', year: 2023, grade: 'Raw', platform: 'ebay', platform_id: 'eb-394831', listing_status: 'listed', price: 800, cost_basis: 520, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-012', card_name: '2024 Topps Heritage #215 Gunnar Henderson', player: 'Gunnar Henderson', year: 2024, grade: 'Raw', platform: 'ebay', platform_id: 'eb-394832', listing_status: 'listed', price: 48, cost_basis: 28, last_updated: '2026-03-14T08:32:00Z' },
  // PSA Registry
  { card_id: 'sc-013', card_name: '2023 Prizm Silver #280 Victor Wembanyama RC', player: 'Victor Wembanyama', year: 2023, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-78341201', listing_status: 'vaulted', price: 460, cost_basis: 310, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-014', card_name: '2018 Prizm Silver #280 Luka Doncic RC', player: 'Luka Doncic', year: 2018, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-65291003', listing_status: 'vaulted', price: 2800, cost_basis: 1600, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-015', card_name: '2003 Topps Chrome #111 LeBron James RC', player: 'LeBron James', year: 2003, grade: 'PSA 9', platform: 'psa_registry', platform_id: 'psa-12003445', listing_status: 'vaulted', price: 18500, cost_basis: 12000, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-016', card_name: '2020 Prizm #258 Justin Herbert RC', player: 'Justin Herbert', year: 2020, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-44291876', listing_status: 'vaulted', price: 295, cost_basis: 210, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-017', card_name: '2022 Topps Chrome #27 Julio Rodriguez RC', player: 'Julio Rodriguez', year: 2022, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-55382910', listing_status: 'vaulted', price: 320, cost_basis: 195, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-018', card_name: '2024 Topps Chrome #1 Shohei Ohtani SP', player: 'Shohei Ohtani', year: 2024, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-88201345', listing_status: 'vaulted', price: 355, cost_basis: 220, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-019', card_name: '2019 Prizm #248 Ja Morant RC', player: 'Ja Morant', year: 2019, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-33019284', listing_status: 'vaulted', price: 380, cost_basis: 240, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-020', card_name: '2020 Panini Contenders #104 Joe Burrow Auto', player: 'Joe Burrow', year: 2020, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-99127654', listing_status: 'vaulted', price: 1050, cost_basis: 680, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-021', card_name: '2023 Bowman Chrome 1st #BDC-150 Jackson Holliday', player: 'Jackson Holliday', year: 2023, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-77382910', listing_status: 'vaulted', price: 155, cost_basis: 95, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-022', card_name: '2021 Panini Prizm #282 Trevor Lawrence RC', player: 'Trevor Lawrence', year: 2021, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-44102938', listing_status: 'vaulted', price: 140, cost_basis: 95, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-023', card_name: '2022 Panini Flawless #102 Paolo Banchero RC', player: 'Paolo Banchero', year: 2022, grade: 'PSA 9', platform: 'psa_registry', platform_id: 'psa-55910283', listing_status: 'vaulted', price: 580, cost_basis: 420, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-024', card_name: '2017 Panini Prizm #269 Patrick Mahomes RC', player: 'Patrick Mahomes', year: 2017, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-11029384', listing_status: 'vaulted', price: 4200, cost_basis: 2800, last_updated: '2026-03-14T07:15:00Z' },
  // COMC
  { card_id: 'sc-025', card_name: '2023 Prizm #280 Victor Wembanyama RC Base', player: 'Victor Wembanyama', year: 2023, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881204', listing_status: 'listed', price: 85, cost_basis: 42, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-026', card_name: '2023 Select #76 Jahmyr Gibbs RC Concourse', player: 'Jahmyr Gibbs', year: 2023, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881205', listing_status: 'listed', price: 22, cost_basis: 11, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-027', card_name: '2024 Topps Series 1 #50 Shohei Ohtani', player: 'Shohei Ohtani', year: 2024, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881206', listing_status: 'listed', price: 18, cost_basis: 8, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-028', card_name: '2023 Mosaic #212 Tyrese Maxey', player: 'Tyrese Maxey', year: 2023, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881207', listing_status: 'sold', price: 35, cost_basis: 18, last_updated: '2026-03-13T11:20:00Z' },
  { card_id: 'sc-029', card_name: '2024 Bowman #BP-1 Ethan Salas 1st', player: 'Ethan Salas', year: 2024, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881208', listing_status: 'listed', price: 75, cost_basis: 38, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-030', card_name: '2023 Optic #201 Chet Holmgren RC', player: 'Chet Holmgren', year: 2023, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881209', listing_status: 'listed', price: 15, cost_basis: 7, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-031', card_name: '2022 Topps Chrome #220 Adley Rutschman RC', player: 'Adley Rutschman', year: 2022, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881210', listing_status: 'listed', price: 28, cost_basis: 14, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-032', card_name: '2023 Prizm Silver #1 Nikola Jokic', player: 'Nikola Jokic', year: 2023, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881211', listing_status: 'listed', price: 42, cost_basis: 22, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-033', card_name: '2024 Topps Heritage #100 Ronald Acuna Jr.', player: 'Ronald Acuna Jr.', year: 2024, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881212', listing_status: 'listed', price: 12, cost_basis: 5, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-034', card_name: '2023 Select Premier #10 Brock Purdy', player: 'Brock Purdy', year: 2023, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881213', listing_status: 'listed', price: 38, cost_basis: 19, last_updated: '2026-03-14T06:45:00Z' },
  // Alt Vault
  { card_id: 'sc-035', card_name: '2018 Prizm Silver #280 Luka Doncic RC', player: 'Luka Doncic', year: 2018, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20491', listing_status: 'vaulted', price: 2800, cost_basis: 1600, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-036', card_name: '2003 Topps Chrome #111 LeBron James RC', player: 'LeBron James', year: 2003, grade: 'PSA 9', platform: 'alt_vault', platform_id: 'av-20492', listing_status: 'vaulted', price: 18500, cost_basis: 12000, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-037', card_name: '2017 Panini Prizm #269 Patrick Mahomes RC', player: 'Patrick Mahomes', year: 2017, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20493', listing_status: 'vaulted', price: 4200, cost_basis: 2800, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-038', card_name: '2020 Panini Contenders #104 Joe Burrow Auto', player: 'Joe Burrow', year: 2020, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20494', listing_status: 'vaulted', price: 1050, cost_basis: 680, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-039', card_name: '2019 Prizm #248 Ja Morant RC', player: 'Ja Morant', year: 2019, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20495', listing_status: 'vaulted', price: 380, cost_basis: 240, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-040', card_name: '2023 Prizm Silver #280 Wembanyama RC', player: 'Victor Wembanyama', year: 2023, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20496', listing_status: 'listed', price: 475, cost_basis: 310, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-041', card_name: '2024 Panini Eminence #12 LeBron James', player: 'LeBron James', year: 2024, grade: 'BGS 9.5', platform: 'alt_vault', platform_id: 'av-20497', listing_status: 'vaulted', price: 1720, cost_basis: 1250, last_updated: '2026-03-14T08:40:00Z' },
  // Fanatics Collect
  { card_id: 'sc-042', card_name: '2024 Topps Chrome #1 Shohei Ohtani SP', player: 'Shohei Ohtani', year: 2024, grade: 'PSA 10', platform: 'fanatics_collect', platform_id: 'fc-10291', listing_status: 'listed', price: 350, cost_basis: 220, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-043', card_name: '2024 Bowman Chrome 1st #BCP-1 Ethan Salas', player: 'Ethan Salas', year: 2024, grade: 'Raw', platform: 'fanatics_collect', platform_id: 'fc-10292', listing_status: 'listed', price: 82, cost_basis: 45, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-044', card_name: '2023 Prizm Silver #280 Wembanyama RC', player: 'Victor Wembanyama', year: 2023, grade: 'PSA 10', platform: 'fanatics_collect', platform_id: 'fc-10293', listing_status: 'listed', price: 490, cost_basis: 310, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-045', card_name: '2024 Topps Heritage #215 Gunnar Henderson', player: 'Gunnar Henderson', year: 2024, grade: 'Raw', platform: 'fanatics_collect', platform_id: 'fc-10294', listing_status: 'sold', price: 45, cost_basis: 28, last_updated: '2026-03-13T15:30:00Z' },
  { card_id: 'sc-046', card_name: '2023 Bowman Chrome 1st #BDC-150 Jackson Holliday', player: 'Jackson Holliday', year: 2023, grade: 'PSA 10', platform: 'fanatics_collect', platform_id: 'fc-10295', listing_status: 'listed', price: 160, cost_basis: 95, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-047', card_name: '2022 Topps Chrome #27 Julio Rodriguez RC', player: 'Julio Rodriguez', year: 2022, grade: 'BGS 9.5', platform: 'fanatics_collect', platform_id: 'fc-10296', listing_status: 'listed', price: 260, cost_basis: 180, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-048', card_name: '2023 Optic Downtown #DT-5 Patrick Mahomes', player: 'Patrick Mahomes', year: 2023, grade: 'PSA 10', platform: 'fanatics_collect', platform_id: 'fc-10297', listing_status: 'listed', price: 890, cost_basis: 550, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-049', card_name: '2024 Panini Prizm #1 LeBron James', player: 'LeBron James', year: 2024, grade: 'Raw', platform: 'fanatics_collect', platform_id: 'fc-10298', listing_status: 'listed', price: 45, cost_basis: 22, last_updated: '2026-03-13T22:10:00Z' },
  // Additional eBay cards
  { card_id: 'sc-050', card_name: '2023 Prizm Green #280 Wembanyama RC', player: 'Victor Wembanyama', year: 2023, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394833', listing_status: 'listed', price: 950, cost_basis: 620, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-051', card_name: '2024 Donruss Optic #198 Caleb Williams RC', player: 'Caleb Williams', year: 2024, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394834', listing_status: 'listed', price: 185, cost_basis: 110, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-052', card_name: '2024 Bowman #BP-50 Roman Anthony 1st', player: 'Roman Anthony', year: 2024, grade: 'Raw', platform: 'ebay', platform_id: 'eb-394835', listing_status: 'listed', price: 120, cost_basis: 65, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-053', card_name: '2023 Topps Chrome Black #CB-1 Corbin Carroll RC', player: 'Corbin Carroll', year: 2023, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394836', listing_status: 'sold', price: 195, cost_basis: 120, last_updated: '2026-03-11T16:40:00Z' },
  { card_id: 'sc-054', card_name: '2024 Prizm #201 Caitlin Clark RC', player: 'Caitlin Clark', year: 2024, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394837', listing_status: 'listed', price: 420, cost_basis: 280, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-055', card_name: '2023 Select Tie-Dye #76 C.J. Stroud RC /25', player: 'C.J. Stroud', year: 2023, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394838', listing_status: 'listed', price: 1650, cost_basis: 1100, last_updated: '2026-03-14T08:32:00Z' },
  // Additional COMC
  { card_id: 'sc-056', card_name: '2024 Topps #330 Paul Skenes RC', player: 'Paul Skenes', year: 2024, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881214', listing_status: 'listed', price: 55, cost_basis: 28, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-057', card_name: '2023 Donruss #301 Jalin Hyatt RC', player: 'Jalin Hyatt', year: 2023, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881215', listing_status: 'listed', price: 8, cost_basis: 3, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-058', card_name: '2024 Topps Series 2 #450 Yoshinobu Yamamoto RC', player: 'Yoshinobu Yamamoto', year: 2024, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881216', listing_status: 'listed', price: 32, cost_basis: 15, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-059', card_name: '2023 Prizm Base #1 Nikola Jokic', player: 'Nikola Jokic', year: 2023, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881217', listing_status: 'sold', price: 12, cost_basis: 5, last_updated: '2026-03-12T09:15:00Z' },
  { card_id: 'sc-060', card_name: '2024 Heritage Minor League #25 Travis Bazzana', player: 'Travis Bazzana', year: 2024, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881218', listing_status: 'listed', price: 65, cost_basis: 30, last_updated: '2026-03-14T06:45:00Z' },
  // Additional PSA Registry
  { card_id: 'sc-061', card_name: '2024 Prizm #201 Caitlin Clark RC', player: 'Caitlin Clark', year: 2024, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-99281034', listing_status: 'vaulted', price: 420, cost_basis: 280, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-062', card_name: '2024 Donruss Optic #198 Caleb Williams RC', player: 'Caleb Williams', year: 2024, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-99281035', listing_status: 'vaulted', price: 185, cost_basis: 110, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-063', card_name: '2023 Topps Chrome Black #CB-1 Corbin Carroll RC', player: 'Corbin Carroll', year: 2023, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-99281036', listing_status: 'vaulted', price: 195, cost_basis: 120, last_updated: '2026-03-14T07:15:00Z' },
  // Additional Alt Vault
  { card_id: 'sc-064', card_name: '2023 Select Tie-Dye #76 C.J. Stroud RC /25', player: 'C.J. Stroud', year: 2023, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20498', listing_status: 'vaulted', price: 1650, cost_basis: 1100, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-065', card_name: '2024 Prizm #201 Caitlin Clark RC', player: 'Caitlin Clark', year: 2024, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20499', listing_status: 'vaulted', price: 420, cost_basis: 280, last_updated: '2026-03-14T08:40:00Z' },
  // Additional Fanatics
  { card_id: 'sc-066', card_name: '2024 Donruss Optic #198 Caleb Williams RC', player: 'Caleb Williams', year: 2024, grade: 'PSA 10', platform: 'fanatics_collect', platform_id: 'fc-10299', listing_status: 'listed', price: 180, cost_basis: 110, last_updated: '2026-03-13T22:10:00Z' },
  { card_id: 'sc-067', card_name: '2024 Topps #330 Paul Skenes RC', player: 'Paul Skenes', year: 2024, grade: 'Raw', platform: 'fanatics_collect', platform_id: 'fc-10300', listing_status: 'listed', price: 52, cost_basis: 28, last_updated: '2026-03-13T22:10:00Z' },
  // Additional eBay high-value
  { card_id: 'sc-068', card_name: '2018 National Treasures #127 Josh Allen RC Auto /99', player: 'Josh Allen', year: 2018, grade: 'PSA 9', platform: 'ebay', platform_id: 'eb-394839', listing_status: 'listed', price: 3800, cost_basis: 2500, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-069', card_name: '2019 Mosaic #209 Zion Williamson RC Prizm', player: 'Zion Williamson', year: 2019, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394840', listing_status: 'listed', price: 245, cost_basis: 180, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-070', card_name: '2023 Topps Chrome Sapphire #596 Elly De La Cruz RC', player: 'Elly De La Cruz', year: 2023, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394841', listing_status: 'sold', price: 310, cost_basis: 195, last_updated: '2026-03-10T20:30:00Z' },
  // More COMC budget cards
  { card_id: 'sc-071', card_name: '2023 Donruss #201 C.J. Stroud RC', player: 'C.J. Stroud', year: 2023, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881219', listing_status: 'listed', price: 18, cost_basis: 8, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-072', card_name: '2024 Topps #1 Shohei Ohtani Base', player: 'Shohei Ohtani', year: 2024, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881220', listing_status: 'listed', price: 8, cost_basis: 3, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-073', card_name: '2023 Prizm #280 Wembanyama Base', player: 'Victor Wembanyama', year: 2023, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881221', listing_status: 'listed', price: 28, cost_basis: 14, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-074', card_name: '2024 Bowman #1 Jackson Merrill RC', player: 'Jackson Merrill', year: 2024, grade: 'Raw NM-MT', platform: 'comc', platform_id: 'comc-881222', listing_status: 'listed', price: 22, cost_basis: 10, last_updated: '2026-03-14T06:45:00Z' },
  { card_id: 'sc-075', card_name: '2023 Mosaic #201 Caleb Williams RC', player: 'Caleb Williams', year: 2023, grade: 'Raw NM', platform: 'comc', platform_id: 'comc-881223', listing_status: 'sold', price: 15, cost_basis: 7, last_updated: '2026-03-13T14:05:00Z' },
  // More PSA Registry
  { card_id: 'sc-076', card_name: '2018 National Treasures #127 Josh Allen RC Auto /99', player: 'Josh Allen', year: 2018, grade: 'PSA 9', platform: 'psa_registry', platform_id: 'psa-11291038', listing_status: 'vaulted', price: 3800, cost_basis: 2500, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-077', card_name: '2024 Topps #330 Paul Skenes RC', player: 'Paul Skenes', year: 2024, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-11291039', listing_status: 'vaulted', price: 110, cost_basis: 55, last_updated: '2026-03-14T07:15:00Z' },
  { card_id: 'sc-078', card_name: '2023 Prizm Green #280 Wembanyama RC', player: 'Victor Wembanyama', year: 2023, grade: 'PSA 10', platform: 'psa_registry', platform_id: 'psa-11291040', listing_status: 'vaulted', price: 950, cost_basis: 620, last_updated: '2026-03-14T07:15:00Z' },
  // Additional Alt Vault fractional
  { card_id: 'sc-079', card_name: '2018 National Treasures #127 Josh Allen RC Auto /99', player: 'Josh Allen', year: 2018, grade: 'PSA 9', platform: 'alt_vault', platform_id: 'av-20500', listing_status: 'vaulted', price: 3800, cost_basis: 2500, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-080', card_name: '2024 Donruss Optic #198 Caleb Williams RC', player: 'Caleb Williams', year: 2024, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20501', listing_status: 'in_transit', price: 185, cost_basis: 110, last_updated: '2026-03-14T08:40:00Z' },
  { card_id: 'sc-081', card_name: '2024 Topps #330 Paul Skenes RC', player: 'Paul Skenes', year: 2024, grade: 'PSA 10', platform: 'alt_vault', platform_id: 'av-20502', listing_status: 'in_transit', price: 110, cost_basis: 55, last_updated: '2026-03-14T08:40:00Z' },
  // Extra eBay
  { card_id: 'sc-082', card_name: '2022 Bowman Chrome #BCP-1 Druw Jones 1st', player: 'Druw Jones', year: 2022, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394842', listing_status: 'listed', price: 320, cost_basis: 220, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-083', card_name: '2024 Prizm Green Shimmer #150 Jaylen Brown', player: 'Jaylen Brown', year: 2024, grade: 'Raw', platform: 'ebay', platform_id: 'eb-394843', listing_status: 'unlisted', price: 55, cost_basis: 30, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-084', card_name: '2023 Panini Immaculate #IM-PM Patrick Mahomes Auto', player: 'Patrick Mahomes', year: 2023, grade: 'PSA 8', platform: 'ebay', platform_id: 'eb-394844', listing_status: 'listed', price: 550, cost_basis: 380, last_updated: '2026-03-14T08:32:00Z' },
  { card_id: 'sc-085', card_name: '2024 Topps Chrome Update #CU-1 Jackson Chourio RC', player: 'Jackson Chourio', year: 2024, grade: 'PSA 10', platform: 'ebay', platform_id: 'eb-394845', listing_status: 'listed', price: 145, cost_basis: 85, last_updated: '2026-03-14T08:32:00Z' },
];

const SYNC_CONFLICTS: SyncConflict[] = [
  { id: 'conf-1', card_id: 'sc-001', card_name: '2023 Prizm Silver #280 Victor Wembanyama RC', field: 'price', local_value: '$485', remote_value: '$510', platform: 'ebay', detected_at: '2026-03-14T08:32:00Z', severity: 'medium' },
  { id: 'conf-2', card_id: 'sc-004', card_name: '2022 Topps Chrome #27 Julio Rodriguez RC', field: 'listing_status', local_value: 'listed', remote_value: 'ended', platform: 'ebay', detected_at: '2026-03-14T08:32:00Z', severity: 'high' },
  { id: 'conf-3', card_id: 'sc-025', card_name: '2023 Prizm #280 Victor Wembanyama RC Base', field: 'price', local_value: '$85', remote_value: '$78', platform: 'comc', detected_at: '2026-03-14T06:45:00Z', severity: 'low' },
  { id: 'conf-4', card_id: 'sc-042', card_name: '2024 Topps Chrome #1 Shohei Ohtani SP', field: 'grade', local_value: 'PSA 10', remote_value: 'PSA 9', platform: 'fanatics_collect', detected_at: '2026-03-13T22:10:00Z', severity: 'high' },
  { id: 'conf-5', card_id: 'sc-046', card_name: '2023 Bowman Chrome 1st Jackson Holliday', field: 'price', local_value: '$160', remote_value: '$148', platform: 'fanatics_collect', detected_at: '2026-03-13T22:10:00Z', severity: 'low' },
];

const GHOST_LISTINGS: GhostListing[] = [
  { id: 'ghost-1', card_name: '2023 Prizm Silver #280 Victor Wembanyama RC PSA 10', player: 'Victor Wembanyama', grade: 'PSA 10', found_platform: 'ebay', seller: 'cardflippers_99', seller_id: 'eb-seller-7721', listing_url: 'https://ebay.com/itm/3948210001', listed_price: 460, your_cost_basis: 310, confidence: 0.92, detected_at: '2026-03-13T14:22:00Z', status: 'investigating' },
  { id: 'ghost-2', card_name: '2018 Prizm Silver #280 Luka Doncic RC PSA 10', player: 'Luka Doncic', grade: 'PSA 10', found_platform: 'ebay', seller: 'sportscard_vault', seller_id: 'eb-seller-4418', listing_url: 'https://ebay.com/itm/3948210002', listed_price: 2650, your_cost_basis: 1600, confidence: 0.87, detected_at: '2026-03-12T09:15:00Z', status: 'new' },
  { id: 'ghost-3', card_name: '2017 Panini Prizm #269 Patrick Mahomes RC PSA 10', player: 'Patrick Mahomes', grade: 'PSA 10', found_platform: 'comc', seller: 'graded_kings', seller_id: 'comc-seller-2291', listing_url: 'https://comc.com/cards/pm-2017-prizm', listed_price: 3950, your_cost_basis: 2800, confidence: 0.78, detected_at: '2026-03-14T06:50:00Z', status: 'new' },
];

const SYNC_HISTORY: SyncHistoryEntry[] = [
  { id: 'sh-1', platform: 'ebay', action: 'sync', description: 'Full inventory sync completed. 127 items matched.', timestamp: '2026-03-14T08:32:00Z', items_affected: 127, success: true },
  { id: 'sh-2', platform: 'alt_vault', action: 'sync', description: 'Sync in progress. 35 of 41 items processed.', timestamp: '2026-03-14T08:40:00Z', items_affected: 35, success: true },
  { id: 'sh-3', platform: 'fanatics_collect', action: 'sync', description: 'Sync failed: API rate limit exceeded.', timestamp: '2026-03-13T22:10:00Z', items_affected: 0, success: false },
  { id: 'sh-4', platform: 'psa_registry', action: 'sync', description: 'Registry sync completed. 84 graded cards verified.', timestamp: '2026-03-14T07:15:00Z', items_affected: 84, success: true },
  { id: 'sh-5', platform: 'comc', action: 'sync', description: 'COMC inventory sync completed. 2 new sales detected.', timestamp: '2026-03-14T06:45:00Z', items_affected: 63, success: true },
  { id: 'sh-6', platform: 'ebay', action: 'ghost_detected', description: 'Potential ghost listing detected: Wembanyama PSA 10 by cardflippers_99.', timestamp: '2026-03-13T14:22:00Z', items_affected: 1, success: true },
  { id: 'sh-7', platform: 'ebay', action: 'ghost_detected', description: 'Potential ghost listing detected: Luka Doncic PSA 10 by sportscard_vault.', timestamp: '2026-03-12T09:15:00Z', items_affected: 1, success: true },
  { id: 'sh-8', platform: 'comc', action: 'ghost_detected', description: 'Potential ghost listing detected: Mahomes PSA 10 by graded_kings.', timestamp: '2026-03-14T06:50:00Z', items_affected: 1, success: true },
  { id: 'sh-9', platform: 'myslabs', action: 'disconnect', description: 'MySlabs disconnected by user.', timestamp: '2026-03-10T14:00:00Z', items_affected: 0, success: true },
  { id: 'sh-10', platform: 'ebay', action: 'conflict_resolved', description: 'Price conflict resolved for Corbin Carroll RC. Accepted remote value.', timestamp: '2026-03-11T10:30:00Z', items_affected: 1, success: true },
  { id: 'sh-11', platform: 'psa_registry', action: 'connect', description: 'PSA Registry connected via API. Initial sync of 84 items.', timestamp: '2026-03-01T09:00:00Z', items_affected: 84, success: true },
  { id: 'sh-12', platform: 'fanatics_collect', action: 'connect', description: 'Fanatics Collect connected. 38 listings imported.', timestamp: '2026-02-28T11:00:00Z', items_affected: 38, success: true },
  { id: 'sh-13', platform: 'ebay', action: 'sync', description: 'Routine sync completed. 3 new sales detected.', timestamp: '2026-03-13T19:45:00Z', items_affected: 127, success: true },
  { id: 'sh-14', platform: 'comc', action: 'sync', description: 'COMC sync completed. 1 item sold since last check.', timestamp: '2026-03-13T14:05:00Z', items_affected: 63, success: true },
  { id: 'sh-15', platform: 'alt_vault', action: 'sync', description: 'Alt Vault sync completed. 2 items in transit.', timestamp: '2026-03-13T16:00:00Z', items_affected: 41, success: true },
];

// ─── Service Functions ───────────────────────────────────────

export function getConnections(): SyncConnection[] {
  return CONNECTIONS;
}

export function connectPlatform(platform: SyncPlatform, _credentials: { api_key: string; username?: string }): SyncConnection {
  const conn = CONNECTIONS.find((c) => c.platform === platform);
  if (conn) {
    return { ...conn, status: 'connected', api_key_masked: '****-****-new1' };
  }
  return {
    platform,
    platformLabel: platform.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    status: 'connected',
    last_sync: new Date().toISOString(),
    items_count: 0,
    api_key_masked: '****-****-new1',
    sync_frequency: 'Every 30 min',
  };
}

export function disconnectPlatform(platform: SyncPlatform): { success: boolean; platform: SyncPlatform } {
  return { success: true, platform };
}

export function syncNow(platform: SyncPlatform): { status: 'syncing'; platform: SyncPlatform; estimated_time: string } {
  return { status: 'syncing', platform, estimated_time: '~30 seconds' };
}

export function getSyncedInventory(platform?: SyncPlatform): SyncedCard[] {
  if (platform) return SYNCED_CARDS.filter((c) => c.platform === platform);
  return SYNCED_CARDS;
}

export function getSyncConflicts(): SyncConflict[] {
  return SYNC_CONFLICTS;
}

export function resolveConflict(id: string, resolution: 'accept_local' | 'accept_remote'): { success: boolean; id: string; resolution: string } {
  return { success: true, id, resolution };
}

export function detectGhostListings(): { scanning: boolean; platforms_checked: number; estimated_time: string } {
  return { scanning: true, platforms_checked: 4, estimated_time: '~2 minutes' };
}

export function getGhostListings(): GhostListing[] {
  return GHOST_LISTINGS;
}

export function getSyncReport(): SyncReport {
  const cards = SYNCED_CARDS;
  const totalValue = cards.reduce((s, c) => s + c.price, 0);
  const totalCost = cards.reduce((s, c) => s + c.cost_basis, 0);
  const connectedCount = CONNECTIONS.filter((c) => c.status === 'connected' || c.status === 'syncing').length;
  const syncingCount = CONNECTIONS.filter((c) => c.status === 'syncing').length;
  return {
    total_synced: cards.length,
    total_value: totalValue,
    total_cost_basis: totalCost,
    total_profit_loss: totalValue - totalCost,
    platforms_connected: connectedCount,
    platforms_syncing: syncingCount,
    conflicts_pending: SYNC_CONFLICTS.length,
    ghost_listings_detected: GHOST_LISTINGS.length,
    last_full_sync: '2026-03-14T08:40:00Z',
    sync_health: CONNECTIONS.some((c) => c.status === 'error') ? 'warning' : 'healthy',
  };
}

export function getCostBasisByPlatform(): PlatformCostBasis[] {
  const platforms: SyncPlatform[] = ['ebay', 'psa_registry', 'comc', 'alt_vault', 'fanatics_collect'];
  return platforms.map((p) => {
    const cards = SYNCED_CARDS.filter((c) => c.platform === p);
    const totalCost = cards.reduce((s, c) => s + c.cost_basis, 0);
    const totalValue = cards.reduce((s, c) => s + c.price, 0);
    const conn = CONNECTIONS.find((c) => c.platform === p);
    return {
      platform: p,
      platformLabel: conn?.platformLabel || p,
      total_cost: totalCost,
      total_value: totalValue,
      total_items: cards.length,
      profit_loss: totalValue - totalCost,
      roi_percent: totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 1000) / 10 : 0,
    };
  });
}

export function bulkScanQR(codes: string[]): BulkScanResult[] {
  return codes.map((code, idx) => {
    if (idx < codes.length * 0.8) {
      const card = SYNCED_CARDS[idx % SYNCED_CARDS.length];
      return {
        code,
        matched: true,
        card_name: card.card_name,
        player: card.player,
        platform: card.platform,
        status: card.listing_status,
      };
    }
    return { code, matched: false, error: 'No matching card found in synced inventory' };
  });
}

export function getUnifiedInventory(): SyncedCard[] {
  return SYNCED_CARDS;
}

export function getCrossplatformValue(): CrossPlatformValue[] {
  const platforms: SyncPlatform[] = ['ebay', 'psa_registry', 'comc', 'alt_vault', 'fanatics_collect'];
  const totalAllValue = SYNCED_CARDS.reduce((s, c) => s + c.price, 0);
  return platforms.map((p) => {
    const cards = SYNCED_CARDS.filter((c) => c.platform === p);
    const value = cards.reduce((s, c) => s + c.price, 0);
    const conn = CONNECTIONS.find((c) => c.platform === p);
    return {
      platform: p,
      platformLabel: conn?.platformLabel || p,
      value,
      items: cards.length,
      percentage: totalAllValue > 0 ? Math.round((value / totalAllValue) * 1000) / 10 : 0,
    };
  });
}

export function getSyncHistory(): SyncHistoryEntry[] {
  return SYNC_HISTORY.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getListingStatus(cardId: string): SyncedCard | undefined {
  return SYNCED_CARDS.find((c) => c.card_id === cardId);
}
