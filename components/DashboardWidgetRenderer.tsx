import React from 'react';
import {
  Briefcase,
  Bell,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Award,
  Eye,
  Trophy,
  Star,
  Zap,
  MessageCircle,
  Inbox,
  Radio,
  PieChart,
  FileText,
  BarChart3,
  StickyNote,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import type { WidgetType, DashboardWidget } from '../lib/utils/dashboardBuilderService';

// ---- Mini sparkline data generators ----

function generateSparklineData(length: number, min: number, max: number) {
  const data: { v: number }[] = [];
  let value = min + Math.random() * (max - min);
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.48) * (max - min) * 0.1;
    value = Math.max(min, Math.min(max, value));
    data.push({ v: Math.round(value * 100) / 100 });
  }
  return data;
}

const SPARKLINE_DATA = generateSparklineData(20, 80, 120);
const PIE_DATA = [
  { name: 'Baseball', value: 35, color: '#3b82f6' },
  { name: 'Basketball', value: 28, color: '#22c55e' },
  { name: 'Football', value: 22, color: '#f59e0b' },
  { name: 'Other', value: 15, color: '#8b5cf6' },
];
const BAR_DATA = [
  { name: 'Mon', v: 12 },
  { name: 'Tue', v: 18 },
  { name: 'Wed', v: 9 },
  { name: 'Thu', v: 24 },
  { name: 'Fri', v: 16 },
];

// ---- Widget Content Renderers ----

function PortfolioSummaryContent() {
  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      <div className="text-2xl font-bold text-white">$47,832</div>
      <div className="flex items-center gap-1 text-emerald-400 text-sm">
        <ArrowUpRight size={14} />
        <span>+$1,247 (2.68%)</span>
        <span className="text-slate-500 ml-1">today</span>
      </div>
      <div className="flex gap-3 mt-1">
        <div className="text-xs text-slate-400">
          <span className="text-slate-500">Cards:</span> 342
        </div>
        <div className="text-xs text-slate-400">
          <span className="text-slate-500">ROI:</span>{' '}
          <span className="text-emerald-400">+18.4%</span>
        </div>
      </div>
    </div>
  );
}

function PriceAlertsContent() {
  const alerts = [
    { card: '2023 Bowman Chrome', target: '$45', status: 'triggered', dir: 'up' },
    { card: 'Wemby Prizm Silver', target: '$320', status: 'watching', dir: 'down' },
    { card: 'Ohtani Topps RC', target: '$850', status: 'watching', dir: 'up' },
  ];
  return (
    <div className="flex flex-col gap-1.5 h-full overflow-hidden">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
          <span className="text-slate-300 truncate flex-1 mr-2">{a.card}</span>
          <span className="text-slate-500 mr-2">{a.target}</span>
          {a.status === 'triggered' ? (
            <span className="text-amber-400 flex items-center gap-0.5"><Bell size={10} /> Hit</span>
          ) : (
            <span className="text-slate-500"><Clock size={10} /></span>
          )}
        </div>
      ))}
    </div>
  );
}

function MarketTickerContent() {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">Market Index</span>
        <span className="text-emerald-400 text-xs flex items-center gap-0.5">
          <TrendingUp size={10} /> +1.4%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={SPARKLINE_DATA}>
          <defs>
            <linearGradient id="tickerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#tickerGrad)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-3 text-xs mt-1">
        <span className="text-slate-400">Vol: <span className="text-white">2.4K</span></span>
        <span className="text-slate-400">High: <span className="text-emerald-400">$124</span></span>
        <span className="text-slate-400">Low: <span className="text-red-400">$89</span></span>
      </div>
    </div>
  );
}

function RecentSalesContent() {
  const sales = [
    { card: 'Jeter SP /50', price: '$1,240', time: '2m ago' },
    { card: 'Mahomes Prizm', price: '$345', time: '8m ago' },
    { card: 'Judge HR Derby', price: '$89', time: '15m ago' },
  ];
  return (
    <div className="flex flex-col gap-1.5 h-full overflow-hidden">
      {sales.map((s, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
          <ShoppingCart size={10} className="text-purple-400 mr-1.5 shrink-0" />
          <span className="text-slate-300 truncate flex-1 mr-2">{s.card}</span>
          <span className="text-white font-medium mr-2">{s.price}</span>
          <span className="text-slate-500 text-[10px]">{s.time}</span>
        </div>
      ))}
    </div>
  );
}

function GradingTrackerContent() {
  const submissions = [
    { label: 'PSA', count: 12, status: 'In Transit' },
    { label: 'BGS', count: 5, status: 'Grading' },
    { label: 'SGC', count: 3, status: 'Complete' },
  ];
  return (
    <div className="flex flex-col gap-2 h-full">
      {submissions.map((s, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Award size={10} className="text-pink-400" />
            <span className="text-slate-300">{s.label}</span>
            <span className="text-slate-500">({s.count})</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            s.status === 'Complete' ? 'bg-emerald-500/20 text-emerald-400' :
            s.status === 'Grading' ? 'bg-amber-500/20 text-amber-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>{s.status}</span>
        </div>
      ))}
    </div>
  );
}

function WatchlistContent() {
  const items = [
    { name: 'Wemby Prizm Silver', price: '$312', change: +5.2 },
    { name: 'Ohtani Chrome RC', price: '$845', change: -2.1 },
    { name: 'Stroud Mosaic', price: '$67', change: +12.4 },
  ];
  return (
    <div className="flex flex-col gap-1.5 h-full overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
          <Eye size={10} className="text-cyan-400 mr-1.5 shrink-0" />
          <span className="text-slate-300 truncate flex-1 mr-2">{item.name}</span>
          <span className="text-white mr-2">{item.price}</span>
          <span className={`flex items-center gap-0.5 ${item.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {item.change > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(item.change)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function LeagueStandingsContent() {
  const teams = [
    { name: 'Yankees', w: 52, l: 28 },
    { name: 'Dodgers', w: 50, l: 30 },
    { name: 'Braves', w: 48, l: 32 },
    { name: 'Astros', w: 45, l: 35 },
  ];
  return (
    <div className="flex flex-col gap-1 h-full overflow-hidden">
      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
        <span>Team</span><span>W-L</span>
      </div>
      {teams.map((t, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-mono text-[10px] w-3">{i + 1}</span>
            <Trophy size={10} className="text-orange-400" />
            <span className="text-slate-300">{t.name}</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">{t.w}-{t.l}</span>
        </div>
      ))}
    </div>
  );
}

function PlayerSpotlightContent() {
  return (
    <div className="flex flex-col gap-2 h-full justify-center items-center text-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border border-amber-500/40 flex items-center justify-center">
        <Star size={18} className="text-amber-400" />
      </div>
      <div className="text-sm font-semibold text-white">Victor Wembanyama</div>
      <div className="text-[10px] text-slate-400">SA Spurs &bull; C &bull; Rookie</div>
      <div className="flex gap-3 text-xs">
        <span className="text-slate-400">Avg: <span className="text-white">21.4</span></span>
        <span className="text-slate-400">Cards: <span className="text-emerald-400">+34%</span></span>
      </div>
    </div>
  );
}

function ArbitrageScannerContent() {
  const opps = [
    { card: 'Jeter Refractor', buy: '$120', sell: '$158', spread: '+31.7%' },
    { card: 'Brady Prizm', buy: '$89', sell: '$112', spread: '+25.8%' },
  ];
  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <div className="flex items-center gap-1 text-emerald-400 text-xs">
        <Zap size={12} />
        <span className="font-medium">2 Active Opportunities</span>
      </div>
      {opps.map((o, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-1.5 bg-slate-800/50 rounded px-2">
          <span className="text-slate-300 truncate flex-1 mr-2">{o.card}</span>
          <span className="text-red-400 mr-1">{o.buy}</span>
          <span className="text-slate-600 mr-1">&rarr;</span>
          <span className="text-emerald-400 mr-2">{o.sell}</span>
          <span className="text-amber-400 font-medium text-[10px]">{o.spread}</span>
        </div>
      ))}
    </div>
  );
}

function SocialFeedContent() {
  const posts = [
    { user: '@CardBreaker', text: 'Huge Wemby pull from Prizm Blaster!', time: '3m' },
    { user: '@HobbyNews', text: 'Topps Chrome release date confirmed', time: '12m' },
    { user: '@SlabKing', text: 'PSA 10 pop report update incoming', time: '28m' },
  ];
  return (
    <div className="flex flex-col gap-1.5 h-full overflow-hidden">
      {posts.map((p, i) => (
        <div key={i} className="text-xs py-1 border-b border-slate-700/50 last:border-0">
          <div className="flex items-center gap-1 mb-0.5">
            <MessageCircle size={10} className="text-teal-400" />
            <span className="text-teal-400 font-medium">{p.user}</span>
            <span className="text-slate-600 text-[10px] ml-auto">{p.time}</span>
          </div>
          <p className="text-slate-400 truncate">{p.text}</p>
        </div>
      ))}
    </div>
  );
}

function NotificationFeedContent() {
  const notifs = [
    { text: 'Price alert triggered for Ohtani RC', type: 'alert', time: '1m' },
    { text: 'Trade completed: Sold Mahomes Prizm', type: 'success', time: '5m' },
    { text: 'New bid on your Jeter SP listing', type: 'info', time: '10m' },
  ];
  return (
    <div className="flex flex-col gap-1.5 h-full overflow-hidden">
      {notifs.map((n, i) => (
        <div key={i} className="flex items-start gap-1.5 text-xs py-1 border-b border-slate-700/50 last:border-0">
          {n.type === 'alert' ? <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" /> :
           n.type === 'success' ? <CheckCircle2 size={10} className="text-emerald-400 shrink-0 mt-0.5" /> :
           <Inbox size={10} className="text-blue-400 shrink-0 mt-0.5" />}
          <span className="text-slate-300 flex-1 truncate">{n.text}</span>
          <span className="text-slate-600 text-[10px]">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

function HypeRadarContent() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-1.5 text-xs">
        <Radio size={12} className="text-rose-400" />
        <span className="text-rose-400 font-medium">Trending Now</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {['Wemby', 'Topps Chrome', 'PSA 10', 'Ohtani', 'Draft Picks'].map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded-full border border-rose-500/20">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto">
        <TrendingUp size={10} className="text-emerald-400" />
        <span>Sentiment: <span className="text-emerald-400">Bullish</span></span>
      </div>
    </div>
  );
}

function CollectionStatsContent() {
  return (
    <div className="flex items-center gap-3 h-full">
      <div className="w-16 h-16 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" stroke="none">
              {PIE_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </RechartsPie>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1 text-xs">
        <div className="text-slate-300">342 <span className="text-slate-500">cards</span></div>
        <div className="text-slate-300">12 <span className="text-slate-500">sets</span></div>
        <div className="text-slate-300">68% <span className="text-slate-500">complete</span></div>
      </div>
    </div>
  );
}

function TaxSummaryContent() {
  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <FileText size={12} />
        <span>YTD Tax Summary</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Gains:</span>
        <span className="text-emerald-400">+$4,821</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Losses:</span>
        <span className="text-red-400">-$1,230</span>
      </div>
      <div className="flex justify-between text-xs border-t border-slate-700 pt-1">
        <span className="text-slate-400 font-medium">Net:</span>
        <span className="text-emerald-400 font-medium">+$3,591</span>
      </div>
    </div>
  );
}

function ChartCustomContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
        <BarChart3 size={12} />
        <span>Weekly Sales Volume</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={BAR_DATA}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Bar dataKey="v" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NotesContent() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <StickyNote size={12} />
        <span>Quick Notes</span>
      </div>
      <div className="text-xs text-slate-300 leading-relaxed">
        Watch Topps Chrome release for Wemby parallels. PSA turnaround improving - consider submitting backlog.
      </div>
      <div className="text-[10px] text-slate-600 mt-auto">Last edited: 2h ago</div>
    </div>
  );
}

// ---- Renderer Map ----

const WIDGET_RENDERERS: Record<WidgetType, React.FC> = {
  portfolio_summary: PortfolioSummaryContent,
  price_alerts: PriceAlertsContent,
  market_ticker: MarketTickerContent,
  recent_sales: RecentSalesContent,
  grading_tracker: GradingTrackerContent,
  watchlist: WatchlistContent,
  league_standings: LeagueStandingsContent,
  player_spotlight: PlayerSpotlightContent,
  arbitrage_scanner: ArbitrageScannerContent,
  social_feed: SocialFeedContent,
  notification_feed: NotificationFeedContent,
  hype_radar: HypeRadarContent,
  collection_stats: CollectionStatsContent,
  tax_summary: TaxSummaryContent,
  chart_custom: ChartCustomContent,
  notes: NotesContent,
};

// ---- Icon Resolver ----

export function getWidgetIcon(type: WidgetType, size = 16): React.ReactNode {
  const props = { size };
  switch (type) {
    case 'portfolio_summary': return <Briefcase {...props} />;
    case 'price_alerts': return <Bell {...props} />;
    case 'market_ticker': return <TrendingUp {...props} />;
    case 'recent_sales': return <ShoppingCart {...props} />;
    case 'grading_tracker': return <Award {...props} />;
    case 'watchlist': return <Eye {...props} />;
    case 'league_standings': return <Trophy {...props} />;
    case 'player_spotlight': return <Star {...props} />;
    case 'arbitrage_scanner': return <Zap {...props} />;
    case 'social_feed': return <MessageCircle {...props} />;
    case 'notification_feed': return <Inbox {...props} />;
    case 'hype_radar': return <Radio {...props} />;
    case 'collection_stats': return <PieChart {...props} />;
    case 'tax_summary': return <FileText {...props} />;
    case 'chart_custom': return <BarChart3 {...props} />;
    case 'notes': return <StickyNote {...props} />;
    default: return <BarChart3 {...props} />;
  }
}

// ---- Main Renderer Component ----

interface DashboardWidgetRendererProps {
  widget: DashboardWidget;
  isPreview?: boolean;
}

const DashboardWidgetRenderer: React.FC<DashboardWidgetRendererProps> = ({ widget, isPreview }) => {
  const Renderer = WIDGET_RENDERERS[widget.type];

  if (!Renderer) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-xs">
        Unknown widget type
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isPreview ? 'pointer-events-none' : ''}`}>
      <Renderer />
    </div>
  );
};

export default DashboardWidgetRenderer;
