// @ts-nocheck
import { store } from '../dal/syncStore';

// Phase 5: Custom Dashboard Builder Service
// Drag-and-drop widget dashboard system with layout persistence

// ---- Types ----

export type WidgetType =
  | 'portfolio_summary'
  | 'price_alerts'
  | 'market_ticker'
  | 'recent_sales'
  | 'grading_tracker'
  | 'watchlist'
  | 'league_standings'
  | 'player_spotlight'
  | 'arbitrage_scanner'
  | 'social_feed'
  | 'notification_feed'
  | 'hype_radar'
  | 'collection_stats'
  | 'tax_summary'
  | 'chart_custom'
  | 'notes';

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

export interface GridPosition {
  col: number; // 0-based column index
  row: number; // 0-based row index
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

export interface WidgetConfig {
  title?: string;
  refreshInterval?: number; // seconds
  colorAccent?: string;
  showHeader?: boolean;
  customData?: Record<string, unknown>;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  config: WidgetConfig;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  columns: number;
  rowHeight: number;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  previewWidgets: WidgetType[];
  category: string;
}

export interface WidgetCatalogItem {
  type: WidgetType;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'portfolio' | 'market' | 'social' | 'analytics' | 'tools';
  defaultSize: WidgetSize;
  availableSizes: WidgetSize[];
  color: string;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>;
}

// ---- Size Mappings ----

export const WIDGET_SIZE_MAP: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 1, h: 1 },
  medium: { w: 2, h: 1 },
  large: { w: 2, h: 2 },
  wide: { w: 3, h: 1 },
  tall: { w: 1, h: 2 },
};

// ---- Storage Keys ----

const STORAGE_KEY = 'msi_dashboard_layouts';
const ACTIVE_LAYOUT_KEY = 'msi_active_layout_id';

// ---- Helpers ----

function generateId(): string {
  return `wdg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateLayoutId(): string {
  return `lay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Widget Catalog ----

export function getWidgetCatalog(): WidgetCatalogItem[] {
  return [
    {
      type: 'portfolio_summary',
      name: 'Portfolio Summary',
      description: 'Total portfolio value, daily P&L, and allocation breakdown',
      icon: 'Briefcase',
      category: 'portfolio',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large', 'wide'],
      color: '#22c55e',
    },
    {
      type: 'price_alerts',
      name: 'Price Alerts',
      description: 'Active price alerts and recently triggered notifications',
      icon: 'Bell',
      category: 'market',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'tall'],
      color: '#f59e0b',
    },
    {
      type: 'market_ticker',
      name: 'Market Ticker',
      description: 'Live market prices with sparkline trends',
      icon: 'TrendingUp',
      category: 'market',
      defaultSize: 'wide',
      availableSizes: ['medium', 'wide', 'large'],
      color: '#3b82f6',
    },
    {
      type: 'recent_sales',
      name: 'Recent Sales',
      description: 'Latest completed sales across marketplaces',
      icon: 'ShoppingCart',
      category: 'market',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large', 'tall'],
      color: '#8b5cf6',
    },
    {
      type: 'grading_tracker',
      name: 'Grading Tracker',
      description: 'Submission status and grade distribution',
      icon: 'Award',
      category: 'tools',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large'],
      color: '#ec4899',
    },
    {
      type: 'watchlist',
      name: 'Watchlist',
      description: 'Tracked cards with price change indicators',
      icon: 'Eye',
      category: 'portfolio',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large', 'tall'],
      color: '#06b6d4',
    },
    {
      type: 'league_standings',
      name: 'League Standings',
      description: 'Current league and division standings',
      icon: 'Trophy',
      category: 'analytics',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large', 'tall'],
      color: '#f97316',
    },
    {
      type: 'player_spotlight',
      name: 'Player Spotlight',
      description: 'Featured player stats and card values',
      icon: 'Star',
      category: 'analytics',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large'],
      color: '#eab308',
    },
    {
      type: 'arbitrage_scanner',
      name: 'Arbitrage Scanner',
      description: 'Cross-platform price discrepancies and opportunities',
      icon: 'Zap',
      category: 'market',
      defaultSize: 'large',
      availableSizes: ['medium', 'large', 'wide'],
      color: '#ef4444',
    },
    {
      type: 'social_feed',
      name: 'Social Feed',
      description: 'Community posts, mentions, and discussions',
      icon: 'MessageCircle',
      category: 'social',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large', 'tall'],
      color: '#14b8a6',
    },
    {
      type: 'notification_feed',
      name: 'Notification Feed',
      description: 'System alerts, trade confirmations, and updates',
      icon: 'Inbox',
      category: 'tools',
      defaultSize: 'small',
      availableSizes: ['small', 'medium', 'tall'],
      color: '#a855f7',
    },
    {
      type: 'hype_radar',
      name: 'Hype Radar',
      description: 'Trending topics and viral card detection',
      icon: 'Radio',
      category: 'social',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large'],
      color: '#f43f5e',
    },
    {
      type: 'collection_stats',
      name: 'Collection Stats',
      description: 'Collection composition and completion metrics',
      icon: 'PieChart',
      category: 'portfolio',
      defaultSize: 'medium',
      availableSizes: ['small', 'medium', 'large'],
      color: '#6366f1',
    },
    {
      type: 'tax_summary',
      name: 'Tax Summary',
      description: 'YTD gains/losses and tax liability estimate',
      icon: 'FileText',
      category: 'tools',
      defaultSize: 'small',
      availableSizes: ['small', 'medium'],
      color: '#64748b',
    },
    {
      type: 'chart_custom',
      name: 'Custom Chart',
      description: 'Configurable chart widget for custom data views',
      icon: 'BarChart3',
      category: 'analytics',
      defaultSize: 'large',
      availableSizes: ['medium', 'large', 'wide'],
      color: '#0ea5e9',
    },
    {
      type: 'notes',
      name: 'Notes',
      description: 'Personal notes and research memos',
      icon: 'StickyNote',
      category: 'tools',
      defaultSize: 'small',
      availableSizes: ['small', 'medium', 'large', 'tall'],
      color: '#fbbf24',
    },
  ];
}

// ---- Layout Persistence ----

function loadLayoutsFromStorage(): DashboardLayout[] {
  return store.get<DashboardLayout[]>(STORAGE_KEY, []);
}

function saveLayoutsToStorage(layouts: DashboardLayout[]): void {
  store.set(STORAGE_KEY, layouts);
}

export function getDashboardLayouts(): DashboardLayout[] {
  const stored = loadLayoutsFromStorage();
  if (stored.length > 0) return stored;
  // Return default layout if none saved
  const defaultLayout = getDefaultLayout();
  saveLayoutsToStorage([defaultLayout]);
  return [defaultLayout];
}

export function saveDashboardLayout(layout: DashboardLayout): void {
  const layouts = loadLayoutsFromStorage();
  const idx = layouts.findIndex(l => l.id === layout.id);
  const updated = { ...layout, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    layouts[idx] = updated;
  } else {
    layouts.push(updated);
  }
  saveLayoutsToStorage(layouts);
}

export function deleteDashboardLayout(id: string): void {
  const layouts = loadLayoutsFromStorage().filter(l => l.id !== id);
  saveLayoutsToStorage(layouts);
}

export function getActiveLayoutId(): string | null {
  return store.get<string | null>(ACTIVE_LAYOUT_KEY, null);
}

export function setActiveLayoutId(id: string): void {
  store.set(ACTIVE_LAYOUT_KEY, id);
}

// ---- Default Layout ----

export function getDefaultLayout(): DashboardLayout {
  const now = new Date().toISOString();
  return {
    id: 'default_layout',
    name: 'My Dashboard',
    description: 'Default dashboard layout',
    columns: 4,
    rowHeight: 180,
    createdAt: now,
    updatedAt: now,
    isDefault: true,
    widgets: [
      {
        id: generateId(),
        type: 'portfolio_summary',
        size: 'medium',
        position: { x: 0, y: 0, w: 2, h: 1 },
        config: { title: 'Portfolio Summary', showHeader: true },
        visible: true,
      },
      {
        id: generateId(),
        type: 'market_ticker',
        size: 'medium',
        position: { x: 2, y: 0, w: 2, h: 1 },
        config: { title: 'Market Ticker', showHeader: true },
        visible: true,
      },
      {
        id: generateId(),
        type: 'watchlist',
        size: 'medium',
        position: { x: 0, y: 1, w: 2, h: 1 },
        config: { title: 'Watchlist', showHeader: true },
        visible: true,
      },
      {
        id: generateId(),
        type: 'hype_radar',
        size: 'medium',
        position: { x: 2, y: 1, w: 2, h: 1 },
        config: { title: 'Hype Radar', showHeader: true },
        visible: true,
      },
      {
        id: generateId(),
        type: 'collection_stats',
        size: 'medium',
        position: { x: 0, y: 2, w: 2, h: 1 },
        config: { title: 'Collection Stats', showHeader: true },
        visible: true,
      },
      {
        id: generateId(),
        type: 'notification_feed',
        size: 'medium',
        position: { x: 2, y: 2, w: 2, h: 1 },
        config: { title: 'Notifications', showHeader: true },
        visible: true,
      },
    ],
  };
}

// ---- Dashboard Presets ----

export function getDashboardPresets(): DashboardPreset[] {
  return [
    {
      id: 'preset_trader',
      name: 'Trader View',
      description: 'Optimized for active trading with market data, alerts, and arbitrage tools',
      icon: 'TrendingUp',
      layout: {
        name: 'Trader View',
        description: 'Active trading dashboard',
        columns: 4,
        rowHeight: 180,
        widgets: [
          { id: generateId(), type: 'market_ticker', size: 'wide', position: { x: 0, y: 0, w: 3, h: 1 }, config: { title: 'Market Ticker', showHeader: true }, visible: true },
          { id: generateId(), type: 'price_alerts', size: 'small', position: { x: 3, y: 0, w: 1, h: 1 }, config: { title: 'Alerts', showHeader: true }, visible: true },
          { id: generateId(), type: 'arbitrage_scanner', size: 'large', position: { x: 0, y: 1, w: 2, h: 2 }, config: { title: 'Arbitrage Scanner', showHeader: true }, visible: true },
          { id: generateId(), type: 'recent_sales', size: 'medium', position: { x: 2, y: 1, w: 2, h: 1 }, config: { title: 'Recent Sales', showHeader: true }, visible: true },
          { id: generateId(), type: 'portfolio_summary', size: 'medium', position: { x: 2, y: 2, w: 2, h: 1 }, config: { title: 'Portfolio', showHeader: true }, visible: true },
        ],
      },
    },
    {
      id: 'preset_collector',
      name: 'Collector View',
      description: 'Focus on collection management, grading, and watchlists',
      icon: 'Layers',
      layout: {
        name: 'Collector View',
        description: 'Collection-focused dashboard',
        columns: 4,
        rowHeight: 180,
        widgets: [
          { id: generateId(), type: 'collection_stats', size: 'large', position: { x: 0, y: 0, w: 2, h: 2 }, config: { title: 'Collection Stats', showHeader: true }, visible: true },
          { id: generateId(), type: 'grading_tracker', size: 'medium', position: { x: 2, y: 0, w: 2, h: 1 }, config: { title: 'Grading Tracker', showHeader: true }, visible: true },
          { id: generateId(), type: 'watchlist', size: 'medium', position: { x: 2, y: 1, w: 2, h: 1 }, config: { title: 'Watchlist', showHeader: true }, visible: true },
          { id: generateId(), type: 'player_spotlight', size: 'medium', position: { x: 0, y: 2, w: 2, h: 1 }, config: { title: 'Player Spotlight', showHeader: true }, visible: true },
          { id: generateId(), type: 'social_feed', size: 'medium', position: { x: 2, y: 2, w: 2, h: 1 }, config: { title: 'Social Feed', showHeader: true }, visible: true },
        ],
      },
    },
    {
      id: 'preset_analyst',
      name: 'Analyst Terminal',
      description: 'Data-driven view with charts, stats, and deep analytics',
      icon: 'BarChart3',
      layout: {
        name: 'Analyst Terminal',
        description: 'Analytics-focused dashboard',
        columns: 4,
        rowHeight: 180,
        widgets: [
          { id: generateId(), type: 'chart_custom', size: 'large', position: { x: 0, y: 0, w: 2, h: 2 }, config: { title: 'Custom Chart', showHeader: true }, visible: true },
          { id: generateId(), type: 'league_standings', size: 'medium', position: { x: 2, y: 0, w: 2, h: 1 }, config: { title: 'League Standings', showHeader: true }, visible: true },
          { id: generateId(), type: 'hype_radar', size: 'medium', position: { x: 2, y: 1, w: 2, h: 1 }, config: { title: 'Hype Radar', showHeader: true }, visible: true },
          { id: generateId(), type: 'portfolio_summary', size: 'medium', position: { x: 0, y: 2, w: 2, h: 1 }, config: { title: 'Portfolio Summary', showHeader: true }, visible: true },
          { id: generateId(), type: 'tax_summary', size: 'small', position: { x: 2, y: 2, w: 1, h: 1 }, config: { title: 'Tax Summary', showHeader: true }, visible: true },
          { id: generateId(), type: 'notes', size: 'small', position: { x: 3, y: 2, w: 1, h: 1 }, config: { title: 'Notes', showHeader: true }, visible: true },
        ],
      },
    },
    {
      id: 'preset_minimal',
      name: 'Minimal',
      description: 'Clean and simple view with just the essentials',
      icon: 'Minimize2',
      layout: {
        name: 'Minimal',
        description: 'Minimal dashboard',
        columns: 4,
        rowHeight: 180,
        widgets: [
          { id: generateId(), type: 'portfolio_summary', size: 'medium', position: { x: 0, y: 0, w: 2, h: 1 }, config: { title: 'Portfolio', showHeader: true }, visible: true },
          { id: generateId(), type: 'watchlist', size: 'medium', position: { x: 2, y: 0, w: 2, h: 1 }, config: { title: 'Watchlist', showHeader: true }, visible: true },
          { id: generateId(), type: 'notification_feed', size: 'medium', position: { x: 0, y: 1, w: 2, h: 1 }, config: { title: 'Notifications', showHeader: true }, visible: true },
        ],
      },
    },
  ];
}

// ---- Widget Factory ----

export function createWidget(type: WidgetType, position: WidgetPosition, size?: WidgetSize): DashboardWidget {
  const catalog = getWidgetCatalog();
  const item = catalog.find(c => c.type === type);
  const resolvedSize = size ?? item?.defaultSize ?? 'medium';
  const dims = WIDGET_SIZE_MAP[resolvedSize];

  return {
    id: generateId(),
    type,
    size: resolvedSize,
    position: { ...position, w: dims.w, h: dims.h },
    config: {
      title: item?.name ?? type,
      showHeader: true,
    },
    visible: true,
  };
}

export function createLayoutFromPreset(preset: DashboardPreset): DashboardLayout {
  const now = new Date().toISOString();
  return {
    id: generateLayoutId(),
    ...preset.layout,
    // regenerate widget IDs to ensure uniqueness
    widgets: preset.layout.widgets.map(w => ({ ...w, id: generateId() })),
    createdAt: now,
    updatedAt: now,
    isDefault: false,
  };
}

// ---- Category helpers ----

export function getWidgetCategories(): { key: string; label: string }[] {
  return [
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'market', label: 'Market' },
    { key: 'social', label: 'Social' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'tools', label: 'Tools' },
  ];
}

export function getCatalogByCategory(): Record<string, WidgetCatalogItem[]> {
  const catalog = getWidgetCatalog();
  const grouped: Record<string, WidgetCatalogItem[]> = {};
  for (const item of catalog) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  return grouped;
}
