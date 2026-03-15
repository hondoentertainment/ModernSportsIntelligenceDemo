import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Bell, BellOff, TrendingUp, TrendingDown, Trash2, Target, AlertTriangle, Filter, Plus, BarChart3, Activity } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  getWatchlistItems,
  removeFromWatchlist,
  updateAlert,
  getActiveAlerts,
  getTriggeredAlerts,
  getWatchlistStats,
  getPriceHistory,
  getTopMovers,
  formatCurrency,
  getAlertTypeLabel,
  getAlertColor,
  getSportIcon,
  type WatchlistItem,
  type PriceAlert,
  type WatchlistStats,
  type PricePoint,
} from '../lib/watchlistService.ts';

type TabKey = 'watchlist' | 'alerts' | 'movers' | 'trends';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'watchlist', label: 'My Watchlist' },
  { key: 'alerts', label: 'Price Alerts' },
  { key: 'movers', label: 'Top Movers' },
  { key: 'trends', label: 'Price Trends' },
];

const SPORTS = ['All', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#fb923c'];

// ---- Sparkline component ----

const Sparkline: React.FC<{ data: PricePoint[]; color?: string }> = ({ data, color = '#10b981' }) => {
  const last7 = data.slice(-7);
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={last7}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ---- Main Component ----

const Watchlist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('watchlist');
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
  const [stats, setStats] = useState<WatchlistStats | null>(null);
  const [topMovers, setTopMovers] = useState<WatchlistItem[]>([]);
  const [sportFilter, setSportFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    try {
      setItems(getWatchlistItems());
      setActiveAlerts(getActiveAlerts());
      setTriggeredAlerts(getTriggeredAlerts());
      setStats(getWatchlistStats());
      setTopMovers(getTopMovers());
      setLoading(false);
    } catch {
      setError('Failed to load watchlist data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    if (sportFilter === 'All') return items;
    return items.filter(i => i.sport === sportFilter);
  }, [items, sportFilter]);

  const portfolioValue = useMemo(() =>
    items.reduce((sum, i) => sum + i.currentPrice, 0), [items]);

  const handleRemove = (id: string) => {
    removeFromWatchlist(id);
    loadData();
  };

  const handleToggleAlert = (id: string, enabled: boolean) => {
    updateAlert(id, { alertEnabled: enabled });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Eye size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Watchlist &amp; Price Alerts</h1>
            <p className="text-sm text-slate-400">Track cards, set price alerts &amp; discover opportunities</p>
          </div>
        </div>
        {triggeredAlerts.length > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full animate-pulse">
            {triggeredAlerts.length} TRIGGERED
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Watched</p>
          <p className="text-3xl font-bold text-emerald-400">{stats?.totalItems ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Alerts</p>
          <p className="text-3xl font-bold text-blue-400">{stats?.activeAlerts ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Triggered Today</p>
          <p className="text-3xl font-bold text-red-400">{stats?.triggeredToday ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg 24h Change</p>
          <p className={`text-3xl font-bold ${(stats?.avgPriceChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {(stats?.avgPriceChange ?? 0) >= 0 ? '+' : ''}{stats?.avgPriceChange ?? 0}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</p>
          <p className="text-3xl font-bold text-amber-400">{formatCurrency(portfolioValue)}</p>
        </div>
      </div>

      {/* Tabs + Sport Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {SPORTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'watchlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const h = item.priceHistory;
            const prevPrice = h.length >= 2 ? h[h.length - 2].price : item.currentPrice;
            const pctChange = prevPrice > 0 ? ((item.currentPrice - prevPrice) / prevPrice) * 100 : 0;
            const sparkColor = pctChange >= 0 ? '#10b981' : '#f87171';
            return (
              <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSportIcon(item.sport)}</span>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[180px]">{item.player}</p>
                      <p className="text-[10px] text-slate-500">{item.cardName}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getAlertColor(item.alertType)} bg-slate-900/50 border-slate-700/30`}>
                    {getAlertTypeLabel(item.alertType)}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="mb-3">
                  <Sparkline data={item.priceHistory} color={sparkColor} />
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Current</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(item.currentPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Target</p>
                    <p className="text-sm font-medium text-slate-300">{formatCurrency(item.targetPrice)}</p>
                  </div>
                  <div className={`flex items-center gap-1 ${pctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pctChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-sm font-bold">{pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3">
                  <span>{item.year} {item.set}</span>
                  <span>|</span>
                  <span>{item.condition}</span>
                  <span>|</span>
                  <span>{item.estimatedGrade}</span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic mb-3 truncate">{item.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                  <button
                    onClick={() => handleToggleAlert(item.id, !item.alertEnabled)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      item.alertEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {item.alertEnabled ? <Bell size={12} /> : <BellOff size={12} />}
                    {item.alertEnabled ? 'Alert On' : 'Alert Off'}
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    <BarChart3 size={12} /> Details
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Eye size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No items match your filter</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Triggered Alerts */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              Triggered Alerts ({triggeredAlerts.length})
            </h2>
            {triggeredAlerts.length === 0 ? (
              <p className="text-sm text-slate-500">No triggered alerts</p>
            ) : (
              <div className="space-y-3">
                {triggeredAlerts.map(alert => (
                  <div key={alert.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-300">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {getAlertTypeLabel(alert.type)} | Threshold: {formatCurrency(alert.threshold)}
                        {alert.triggeredAt && ` | Triggered: ${new Date(alert.triggeredAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-[10px] rounded-full bg-red-500/20 text-red-400 font-bold">TRIGGERED</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Alerts */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              Active Alerts ({activeAlerts.length})
            </h2>
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-slate-500">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {getAlertTypeLabel(alert.type)} | Threshold: {formatCurrency(alert.threshold)}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-[10px] rounded-full bg-blue-500/20 text-blue-400 font-bold">WATCHING</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Configuration Panel */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Target size={18} className="text-amber-400" />
              Alert Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.filter(i => i.alertEnabled).map(item => (
                <div key={item.id} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span>{getSportIcon(item.sport)}</span>
                    <p className="text-sm font-bold text-white">{item.player}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Alert Type</p>
                      <p className={`text-xs font-medium ${getAlertColor(item.alertType)}`}>{getAlertTypeLabel(item.alertType)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Target Price</p>
                      <p className="text-xs font-medium text-slate-200">{formatCurrency(item.targetPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Current Price</p>
                      <p className="text-xs font-medium text-white">{formatCurrency(item.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Distance</p>
                      <p className="text-xs font-medium text-slate-300">
                        {formatCurrency(Math.abs(item.currentPrice - item.targetPrice))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'movers' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            Top Movers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMovers.map((item, idx) => {
              const h = item.priceHistory;
              const prevPrice = h.length >= 2 ? h[h.length - 2].price : item.currentPrice;
              const pctChange = prevPrice > 0 ? ((item.currentPrice - prevPrice) / prevPrice) * 100 : 0;
              return (
                <div key={item.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{getSportIcon(item.sport)}</span>
                      <p className="text-sm font-bold text-white truncate">{item.player}</p>
                    </div>
                    <p className="text-[10px] text-slate-500">{item.cardName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(item.currentPrice)}</p>
                    <p className={`text-xs font-medium ${pctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Overview chart with all items */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Price Trends (30 Day)
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={
                  (() => {
                    // Combine price histories into a unified timeline
                    const first = filteredItems[0];
                    if (!first) return [];
                    return first.priceHistory.map((p, idx) => {
                      const entry: Record<string, string | number> = { date: p.date };
                      filteredItems.slice(0, 6).forEach(item => {
                        if (item.priceHistory[idx]) {
                          entry[item.player] = item.priceHistory[idx].price;
                        }
                      });
                      return entry;
                    });
                  })()
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  {filteredItems.slice(0, 6).map((item, idx) => (
                    <Area
                      key={item.id}
                      type="monotone"
                      dataKey={item.player}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual item trend cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.slice(0, 6).map((item, idx) => (
              <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span>{getSportIcon(item.sport)}</span>
                  <p className="text-sm font-bold text-white">{item.player}</p>
                  <span className="text-xs text-slate-500 ml-auto">{item.set}</span>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={v => v.slice(8)} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} domain={['auto', 'auto']} tickFormatter={v => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Line type="monotone" dataKey="price" stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSportIcon(selectedItem.sport)}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedItem.player}</h3>
                  <p className="text-xs text-slate-400">{selectedItem.cardName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-500 hover:text-white text-xl">&times;</button>
            </div>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedItem.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Current Price</p>
                <p className="text-xl font-bold text-white">{formatCurrency(selectedItem.currentPrice)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Target Price</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(selectedItem.targetPrice)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Condition</p>
                <p className="text-sm text-slate-200">{selectedItem.condition}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Est. Grade</p>
                <p className="text-sm text-slate-200">{selectedItem.estimatedGrade}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Sport</p>
                <p className="text-sm text-slate-200">{selectedItem.sport}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Set / Year</p>
                <p className="text-sm text-slate-200">{selectedItem.year} {selectedItem.set}</p>
              </div>
            </div>
            {selectedItem.notes && (
              <div className="mb-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Notes</p>
                <p className="text-sm text-slate-300 italic">{selectedItem.notes}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getAlertColor(selectedItem.alertType)} bg-slate-800`}>
                {getAlertTypeLabel(selectedItem.alertType)}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${selectedItem.alertEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
                {selectedItem.alertEnabled ? 'Alert Enabled' : 'Alert Disabled'}
              </span>
              <span className="text-xs text-slate-500 ml-auto">Added {selectedItem.addedDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
