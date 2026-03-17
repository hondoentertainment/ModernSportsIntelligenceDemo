/**
 * Shared Analytics Dashboards Service
 * Create collaborative dashboards with shared widgets, KPIs, and real-time group metrics.
 */

export type WidgetType = 'kpi' | 'chart' | 'leaderboard' | 'feed' | 'heatmap' | 'table';
export type DashboardAccess = 'private' | 'club-only' | 'link-shared' | 'public';
export type RefreshInterval = 'realtime' | '5min' | '15min' | '1hr' | 'daily';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  value: string | number;
  change: number | null;
  sparkline: number[] | null;
  color: string;
  span: 1 | 2 | 3; // grid column span
}

export interface DashboardComment {
  id: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  widgetId: string | null;
}

export interface SharedDashboard {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  access: DashboardAccess;
  refreshInterval: RefreshInterval;
  viewers: number;
  activeViewers: number;
  widgets: DashboardWidget[];
  comments: DashboardComment[];
  lastUpdated: string;
  starred: boolean;
  clubId: string | null;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgetCount: number;
  usageCount: number;
  category: string;
}

export interface SharedDashboardStats {
  totalDashboards: number;
  totalViewers: number;
  activeNow: number;
  avgWidgetsPerDashboard: number;
  mostViewedDashboard: string;
  commentsThisWeek: number;
}

function getSharedDashboards(): SharedDashboard[] {
  return [
    {
      id: 'sd-1',
      name: 'Guild Portfolio Command Center',
      description: 'Real-time aggregate metrics for Diamond Collectors Guild',
      createdBy: 'CardShark92',
      access: 'club-only',
      refreshInterval: '5min',
      viewers: 24,
      activeViewers: 8,
      widgets: [
        { id: 'w1', type: 'kpi', title: 'Combined NAV', value: '$887,000', change: 3.2, sparkline: [820, 835, 850, 862, 870, 880, 887], color: 'emerald', span: 1 },
        { id: 'w2', type: 'kpi', title: 'Group Alpha', value: '+22.5%', change: 1.8, sparkline: [18, 19, 20, 21, 20.5, 22, 22.5], color: 'green', span: 1 },
        { id: 'w3', type: 'kpi', title: 'Active Members', value: 18, change: 2, sparkline: [14, 15, 16, 17, 16, 18, 18], color: 'blue', span: 1 },
        { id: 'w4', type: 'leaderboard', title: 'Member ROI Rankings', value: 'VintageKing +34%', change: null, sparkline: null, color: 'amber', span: 2 },
        { id: 'w5', type: 'feed', title: 'Recent Activity', value: '5 actions today', change: null, sparkline: null, color: 'purple', span: 1 },
        { id: 'w6', type: 'chart', title: 'Portfolio Growth (90d)', value: '+$67,000', change: 8.2, sparkline: [810, 825, 830, 845, 855, 870, 887], color: 'emerald', span: 3 },
        { id: 'w7', type: 'heatmap', title: 'Category Allocation', value: '12 categories', change: null, sparkline: null, color: 'blue', span: 2 },
        { id: 'w8', type: 'table', title: 'Top Movers This Week', value: '15 cards', change: null, sparkline: null, color: 'rose', span: 1 },
      ],
      comments: [
        { id: 'c1', authorHandle: 'ProspectHunter', content: 'We should increase prospect exposure — 2025 draft class looks strong', timestamp: '1h ago', widgetId: 'w7' },
        { id: 'c2', authorHandle: 'VintageKing', content: 'Vintage allocation holding strong despite modern dip', timestamp: '3h ago', widgetId: 'w6' },
      ],
      lastUpdated: '2 min ago',
      starred: true,
      clubId: 'club-1',
    },
    {
      id: 'sd-2',
      name: 'Basketball Market Pulse',
      description: 'Live basketball card market metrics for Hoop Dreams Collective',
      createdBy: 'HoopsInvestor',
      access: 'club-only',
      refreshInterval: '15min',
      viewers: 16,
      activeViewers: 5,
      widgets: [
        { id: 'w9', type: 'kpi', title: 'NBA RC Index', value: '+8.4%', change: 2.1, sparkline: [4, 5, 6, 7, 7.5, 8, 8.4], color: 'green', span: 1 },
        { id: 'w10', type: 'kpi', title: 'Top Mover', value: 'Castle +78%', change: 12, sparkline: [180, 210, 250, 280, 300, 310, 320], color: 'emerald', span: 1 },
        { id: 'w11', type: 'kpi', title: 'Group Spend MTD', value: '$4,200', change: -5, sparkline: [5200, 4800, 4500, 4400, 4300, 4250, 4200], color: 'amber', span: 1 },
        { id: 'w12', type: 'chart', title: 'Prizm Silver Price Trends', value: 'Tracking 24 cards', change: null, sparkline: [90, 95, 100, 110, 105, 115, 120], color: 'purple', span: 3 },
      ],
      comments: [
        { id: 'c3', authorHandle: 'DunkTrader', content: 'Spurs rookies running hot — Castle and Wembanyama 2nd year both climbing', timestamp: '30m ago', widgetId: 'w10' },
      ],
      lastUpdated: '12 min ago',
      starred: false,
      clubId: 'club-2',
    },
    {
      id: 'sd-3',
      name: 'Prospect Watch Board',
      description: 'Public dashboard tracking top 2025 MLB prospect card prices',
      createdBy: 'ProspectHunter',
      access: 'public',
      refreshInterval: '1hr',
      viewers: 142,
      activeViewers: 23,
      widgets: [
        { id: 'w13', type: 'kpi', title: 'Prospects Tracked', value: 48, change: 5, sparkline: null, color: 'blue', span: 1 },
        { id: 'w14', type: 'kpi', title: 'Avg 1st Bowman Price', value: '$285', change: 12, sparkline: [220, 235, 250, 260, 270, 280, 285], color: 'green', span: 1 },
        { id: 'w15', type: 'kpi', title: 'Most Watched', value: 'Bazzana', change: null, sparkline: null, color: 'amber', span: 1 },
        { id: 'w16', type: 'table', title: 'Top 20 Prospect Cards', value: '20 entries', change: null, sparkline: null, color: 'emerald', span: 3 },
        { id: 'w17', type: 'heatmap', title: 'Farm System Rankings', value: '30 teams', change: null, sparkline: null, color: 'blue', span: 2 },
        { id: 'w18', type: 'feed', title: 'Prospect News Feed', value: '12 updates today', change: null, sparkline: null, color: 'rose', span: 1 },
      ],
      comments: [
        { id: 'c4', authorHandle: 'ProspectHunter', content: 'Added 5 new international prospects from J2 signings', timestamp: '2h ago', widgetId: 'w16' },
      ],
      lastUpdated: '45 min ago',
      starred: true,
      clubId: null,
    },
  ];
}

function getDashboardTemplates(): DashboardTemplate[] {
  return [
    { id: 'dt-1', name: 'Club Portfolio Overview', description: 'Aggregate NAV, ROI rankings, and allocation breakdown', widgetCount: 8, usageCount: 34, category: 'Club' },
    { id: 'dt-2', name: 'Market Monitoring', description: 'Price trends, volume, and sentiment for a specific market', widgetCount: 6, usageCount: 52, category: 'Market' },
    { id: 'dt-3', name: 'Break Night Tracker', description: 'Live break stats, hit tracking, and ROI calculations', widgetCount: 5, usageCount: 28, category: 'Breaks' },
    { id: 'dt-4', name: 'Prospect Scouting Board', description: 'Prospect rankings, prices, and news aggregation', widgetCount: 7, usageCount: 41, category: 'Prospects' },
  ];
}

function getSharedDashboardStats(): SharedDashboardStats {
  return {
    totalDashboards: 8,
    totalViewers: 182,
    activeNow: 36,
    avgWidgetsPerDashboard: 6.5,
    mostViewedDashboard: 'Prospect Watch Board',
    commentsThisWeek: 47,
  };
}

function getWidgetTypeLabel(type: WidgetType): string {
  const labels: Record<WidgetType, string> = { kpi: 'KPI', chart: 'Chart', leaderboard: 'Leaderboard', feed: 'Feed', heatmap: 'Heatmap', table: 'Table' };
  return labels[type];
}

function getAccessColor(access: DashboardAccess): string {
  const colors: Record<DashboardAccess, string> = {
    private: 'text-slate-400 bg-slate-500/10',
    'club-only': 'text-blue-400 bg-blue-500/10',
    'link-shared': 'text-amber-400 bg-amber-500/10',
    public: 'text-green-400 bg-green-500/10',
  };
  return colors[access];
}

export {
  getSharedDashboards,
  getDashboardTemplates,
  getSharedDashboardStats,
  getWidgetTypeLabel,
  getAccessColor,
};
