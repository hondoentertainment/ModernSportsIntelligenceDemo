import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Eye,
  Bell,
  BellOff,
  Search,
  BarChart3,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  ListPlus,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Zap,
} from 'lucide-react';
import { CardInventory, Sport } from '../types';
import {
  Watchlist,
  WatchlistItem,
  TriggeredAlert,
  MarketScanResult,
  PriceAlertRule,
  getWatchlists,
  createWatchlist,
  deleteWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  createAlertRule,
  deleteAlertRule,
  evaluateAlerts,
  scanMarket,
  getWatchlistAnalytics,
  acknowledgeAlert,
  snoozeAlert,
  exportWatchlistCSV,
} from '../lib/watchlistService';

type TabKey = 'watchlists' | 'alerts' | 'scanner' | 'analytics';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const severityColors: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500' },
  high: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  medium: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-500' },
  low: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-400' },
};

const ruleTypeLabels: Record<PriceAlertRule['type'], string> = {
  below: 'Price Below',
  above: 'Price Above',
  change_pct: 'Change %',
  all_time_low: 'All-Time Low',
};

// Mini sparkline renderer
const MiniSparkline: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 56;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#4ade80' : '#f87171'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const WatchlistModal: React.FC<WatchlistModalProps> = ({ isOpen, onClose, inventory }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('watchlists');
  const [refreshKey, setRefreshKey] = useState(0);

  // Watchlists tab state
  const [expandedWatchlist, setExpandedWatchlist] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWlName, setNewWlName] = useState('');
  const [newWlCategory, setNewWlCategory] = useState('General');
  const [showAddItemForm, setShowAddItemForm] = useState<string | null>(null);
  const [newItemPlayer, setNewItemPlayer] = useState('');
  const [newItemSport, setNewItemSport] = useState<Sport>('Baseball');
  const [newItemYear, setNewItemYear] = useState('2024');
  const [newItemSet, setNewItemSet] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemGrade, setNewItemGrade] = useState('');

  // Alerts tab state
  const [showAlertRuleForm, setShowAlertRuleForm] = useState<string | null>(null); // watchlistItemId
  const [newRuleType, setNewRuleType] = useState<PriceAlertRule['type']>('below');
  const [newRuleThreshold, setNewRuleThreshold] = useState('');

  // Scanner tab state
  const [scanSport, setScanSport] = useState<Sport | ''>('');
  const [scanMinPrice, setScanMinPrice] = useState('');
  const [scanMaxPrice, setScanMaxPrice] = useState('');
  const [scanGrade, setScanGrade] = useState('');
  const [scanMinYear, setScanMinYear] = useState('');
  const [scanMaxYear, setScanMaxYear] = useState('');
  const [scanResults, setScanResults] = useState<MarketScanResult[] | null>(null);
  const [addToWlTarget, setAddToWlTarget] = useState<string | null>(null); // scan result id being added

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const watchlists = useMemo(() => getWatchlists(), [refreshKey, inventory]);
  const alerts = useMemo(() => evaluateAlerts(watchlists), [watchlists]);
  const analytics = useMemo(() => getWatchlistAnalytics(watchlists), [watchlists]);

  if (!isOpen) return null;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'watchlists', label: 'Watchlists', icon: <Eye size={16} /> },
    { key: 'alerts', label: 'Alerts', icon: <Bell size={16} />, badge: alerts.length > 0 ? alerts.length : undefined },
    { key: 'scanner', label: 'Scanner', icon: <Search size={16} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
  ];

  // ---- Handlers ----

  const handleCreateWatchlist = () => {
    if (!newWlName.trim()) return;
    createWatchlist(newWlName.trim(), newWlCategory);
    setNewWlName('');
    setNewWlCategory('General');
    setShowCreateForm(false);
    refresh();
  };

  const handleDeleteWatchlist = (id: string) => {
    deleteWatchlist(id);
    if (expandedWatchlist === id) setExpandedWatchlist(null);
    refresh();
  };

  const handleAddItem = (watchlistId: string) => {
    if (!newItemPlayer.trim() || !newItemSet.trim() || !newItemValue) return;
    addToWatchlist(watchlistId, {
      player: newItemPlayer.trim(),
      sport: newItemSport,
      year: parseInt(newItemYear) || 2024,
      set: newItemSet.trim(),
      estimatedValue: parseFloat(newItemValue) || 100,
      grade: newItemGrade || undefined,
    });
    setNewItemPlayer('');
    setNewItemSet('');
    setNewItemValue('');
    setNewItemGrade('');
    setShowAddItemForm(null);
    refresh();
  };

  const handleRemoveItem = (watchlistId: string, itemId: string) => {
    removeFromWatchlist(watchlistId, itemId);
    refresh();
  };

  const handleCreateAlertRule = (itemId: string) => {
    const threshold = parseFloat(newRuleThreshold);
    if (isNaN(threshold) && newRuleType !== 'all_time_low') return;
    createAlertRule(itemId, {
      watchlistItemId: itemId,
      type: newRuleType,
      threshold: newRuleType === 'all_time_low' ? 0 : threshold,
    });
    setNewRuleThreshold('');
    setShowAlertRuleForm(null);
    refresh();
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId);
    refresh();
  };

  const handleSnoozeAlert = (alertId: string, hours: number) => {
    snoozeAlert(alertId, hours);
    refresh();
  };

  const handleBulkAcknowledge = () => {
    for (const alert of alerts) {
      acknowledgeAlert(alert.id);
    }
    refresh();
  };

  const handleScanMarket = () => {
    const criteria: Parameters<typeof scanMarket>[0] = {};
    if (scanSport) criteria.sport = scanSport;
    if (scanMinPrice) criteria.minPrice = parseFloat(scanMinPrice);
    if (scanMaxPrice) criteria.maxPrice = parseFloat(scanMaxPrice);
    if (scanGrade) criteria.grade = scanGrade;
    if (scanMinYear && scanMaxYear) {
      criteria.yearRange = [parseInt(scanMinYear), parseInt(scanMaxYear)];
    }
    setScanResults(scanMarket(criteria));
  };

  const handleAddScanResultToWatchlist = (result: MarketScanResult, watchlistId: string) => {
    addToWatchlist(watchlistId, {
      player: result.player,
      sport: result.sport,
      year: result.year,
      set: result.set,
      estimatedValue: result.price,
      grade: result.grade,
    });
    setAddToWlTarget(null);
    refresh();
  };

  const handleExportCSV = (wl: Watchlist) => {
    const csv = exportWatchlistCSV(wl);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wl.name.replace(/\s+/g, '_')}_watchlist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Render helpers ----

  const renderWatchlistsTab = () => (
    <div className="space-y-4">
      {/* Create new button */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {watchlists.length} Watchlist{watchlists.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all"
        >
          <Plus size={14} />
          New Watchlist
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-white">Create Watchlist</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Watchlist name..."
              value={newWlName}
              onChange={e => setNewWlName(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <select
              value={newWlCategory}
              onChange={e => setNewWlCategory(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="General">General</option>
              <option value="Rookies">Rookies</option>
              <option value="Graded">Graded</option>
              <option value="Vintage">Vintage</option>
              <option value="Investment">Investment</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateWatchlist}
              className="px-4 py-2 text-xs font-bold text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Watchlist list */}
      {watchlists.map(wl => {
        const isExpanded = expandedWatchlist === wl.id;
        const totalValue = wl.items.reduce((s, i) => s + i.currentPrice, 0);

        return (
          <div key={wl.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Watchlist header */}
            <button
              onClick={() => setExpandedWatchlist(isExpanded ? null : wl.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-all text-left"
            >
              {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate">{wl.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-slate-800 rounded">
                    {wl.category}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{wl.items.length} card{wl.items.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="font-mono text-sm text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); handleExportCSV(wl); }}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all"
                  title="Export CSV"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteWatchlist(wl.id); }}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                  title="Delete watchlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>

            {/* Expanded items */}
            {isExpanded && (
              <div className="border-t border-slate-700/50 p-4 space-y-2">
                {wl.items.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No items in this watchlist</p>
                )}
                {wl.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium truncate">{item.player}</span>
                        <span className="text-[10px] text-slate-500">{item.year} {item.set}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 uppercase">{item.sport}</span>
                        {item.grade && <span className="text-[10px] text-cyan-400/70 font-mono">{item.grade}</span>}
                      </div>
                    </div>
                    <MiniSparkline data={item.priceHistory} positive={item.priceChangePercent >= 0} />
                    <div className="text-right">
                      <span className="font-mono text-sm text-white block">${item.currentPrice.toFixed(2)}</span>
                      <span className={`font-mono text-[10px] ${item.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowAlertRuleForm(showAlertRuleForm === item.id ? null : item.id)}
                        className="p-1.5 hover:bg-amber-500/10 rounded-lg text-slate-500 hover:text-amber-400 transition-all"
                        title="Create alert"
                      >
                        <Bell size={13} />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(wl.id, item.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Inline alert rule form */}
                    {showAlertRuleForm === item.id && (
                      <div
                        className="absolute right-0 mt-1 z-10 p-3 bg-slate-800 border border-slate-600 rounded-xl shadow-xl space-y-2"
                        style={{ position: 'relative', width: '100%', marginTop: '8px' }}
                      >
                        {/* Render inline below */}
                      </div>
                    )}
                  </div>
                ))}

                {/* Alert rule form for expanded item */}
                {showAlertRuleForm && wl.items.some(i => i.id === showAlertRuleForm) && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-amber-400">Create Price Alert</p>
                    <div className="flex gap-2">
                      <select
                        value={newRuleType}
                        onChange={e => setNewRuleType(e.target.value as PriceAlertRule['type'])}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option value="below">Price Below</option>
                        <option value="above">Price Above</option>
                        <option value="change_pct">Change %</option>
                        <option value="all_time_low">All-Time Low</option>
                      </select>
                      {newRuleType !== 'all_time_low' && (
                        <input
                          type="number"
                          placeholder={newRuleType === 'change_pct' ? 'e.g. 10' : 'e.g. 150.00'}
                          value={newRuleThreshold}
                          onChange={e => setNewRuleThreshold(e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      )}
                      <button
                        onClick={() => handleCreateAlertRule(showAlertRuleForm)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}

                {/* Add item form */}
                {showAddItemForm === wl.id ? (
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-cyan-400">Add Card to Watch</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Player name"
                        value={newItemPlayer}
                        onChange={e => setNewItemPlayer(e.target.value)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                      />
                      <select
                        value={newItemSport}
                        onChange={e => setNewItemSport(e.target.value as Sport)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                      >
                        {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Set name"
                        value={newItemSet}
                        onChange={e => setNewItemSet(e.target.value)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        value={newItemYear}
                        onChange={e => setNewItemYear(e.target.value)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Est. value ($)"
                        value={newItemValue}
                        onChange={e => setNewItemValue(e.target.value)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                      />
                      <input
                        type="text"
                        placeholder="Grade (optional)"
                        value={newItemGrade}
                        onChange={e => setNewItemGrade(e.target.value)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddItem(wl.id)}
                        className="px-3 py-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddItemForm(null)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddItemForm(wl.id)}
                    className="w-full flex items-center justify-center gap-1.5 p-3 text-xs font-bold text-slate-500 hover:text-cyan-400 bg-slate-800/30 hover:bg-cyan-500/5 border border-dashed border-slate-700 hover:border-cyan-500/30 rounded-xl transition-all"
                  >
                    <Plus size={14} />
                    Add Card
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {watchlists.length === 0 && !showCreateForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Eye size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No watchlists yet</p>
          <p className="text-xs text-slate-600 mt-1">Create one to start tracking card prices</p>
        </div>
      )}
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}
        </p>
        {alerts.length > 1 && (
          <button
            onClick={handleBulkAcknowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            <CheckCircle2 size={14} />
            Acknowledge All
          </button>
        )}
      </div>

      {/* Alert list */}
      {alerts.map(alert => {
        const sev = severityColors[alert.severity] || severityColors.medium;
        return (
          <div key={alert.id} className={`p-4 ${sev.bg} border ${sev.border} rounded-2xl space-y-3`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${sev.bg} ${sev.text}`}>
                {alert.ruleType === 'below' ? <ArrowDownCircle size={18} /> :
                 alert.ruleType === 'above' ? <ArrowUpCircle size={18} /> :
                 alert.ruleType === 'change_pct' ? <Activity size={18} /> :
                 <Target size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sev.bg} ${sev.text} border ${sev.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {ruleTypeLabels[alert.ruleType]}
                  </span>
                </div>
                <p className="text-sm text-white font-medium">{alert.player}</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                  <span className="font-mono">Current: ${alert.currentPrice.toFixed(2)}</span>
                  <span>Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleAcknowledgeAlert(alert.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all"
              >
                <CheckCircle2 size={13} />
                Acknowledge
              </button>
              <button
                onClick={() => handleSnoozeAlert(alert.id, 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                <Clock size={13} />
                1h
              </button>
              <button
                onClick={() => handleSnoozeAlert(alert.id, 24)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                <BellOff size={13} />
                24h
              </button>
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Bell size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No active alerts</p>
          <p className="text-xs text-slate-600 mt-1">Create alert rules on your watchlist items to get notified</p>
        </div>
      )}
    </div>
  );

  const renderScannerTab = () => (
    <div className="space-y-4">
      {/* Filter form */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={14} className="text-cyan-400" />
          <p className="text-xs font-bold text-white">Market Scanner Filters</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={scanSport}
            onChange={e => setScanSport(e.target.value as Sport | '')}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="">All Sports</option>
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="number"
            placeholder="Min price"
            value={scanMinPrice}
            onChange={e => setScanMinPrice(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max price"
            value={scanMaxPrice}
            onChange={e => setScanMaxPrice(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Grade (e.g. PSA 10)"
            value={scanGrade}
            onChange={e => setScanGrade(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Min year"
            value={scanMinYear}
            onChange={e => setScanMinYear(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max year"
            value={scanMaxYear}
            onChange={e => setScanMaxYear(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleScanMarket}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl transition-all"
        >
          <Search size={16} />
          Scan Market
        </button>
      </div>

      {/* Results */}
      {scanResults && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            {scanResults.length} Results Found
          </p>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar">
            {scanResults.map(result => (
              <div key={result.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">{result.player}</span>
                    <span className="text-[10px] text-slate-500">{result.year}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">{result.sport}</span>
                    <span className="text-[10px] text-slate-600">{result.set}</span>
                    {result.grade && <span className="text-[10px] text-cyan-400/70 font-mono">{result.grade}</span>}
                    <span className="text-[10px] text-slate-600">{result.source}</span>
                  </div>
                </div>
                <div className="text-right mr-2">
                  <span className="font-mono text-sm text-white block">${result.price.toFixed(2)}</span>
                  <span className={`font-mono text-[10px] ${result.changePct <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.changePct > 0 ? '+' : ''}{result.changePct.toFixed(1)}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{result.confidence}%</span>
                <div className="relative">
                  <button
                    onClick={() => setAddToWlTarget(addToWlTarget === result.id ? null : result.id)}
                    className="p-1.5 hover:bg-cyan-500/10 rounded-lg text-slate-500 hover:text-cyan-400 transition-all"
                    title="Add to watchlist"
                  >
                    <ListPlus size={16} />
                  </button>
                  {addToWlTarget === result.id && watchlists.length > 0 && (
                    <div className="absolute right-0 top-full mt-1 z-20 p-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl min-w-[160px]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Add to:</p>
                      {watchlists.map(wl => (
                        <button
                          key={wl.id}
                          onClick={() => handleAddScanResultToWatchlist(result, wl.id)}
                          className="w-full text-left px-2 py-1.5 text-xs text-white hover:bg-slate-700 rounded-lg transition-all"
                        >
                          {wl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Initial state */}
      {!scanResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Search size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">Configure filters and scan the market</p>
          <p className="text-xs text-slate-600 mt-1">Find deals, track trends, and add cards to your watchlists</p>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => {
    // Compute additional analytics data
    const allItems: WatchlistItem[] = [];
    for (const wl of watchlists) {
      allItems.push(...wl.items);
    }

    // Top movers (sorted by absolute change)
    const topMovers = [...allItems]
      .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
      .slice(0, 5);

    // Best entry points (largest price drops from estimated value)
    const bestEntries = [...allItems]
      .filter(i => i.currentPrice < i.estimatedValue)
      .sort((a, b) => (b.estimatedValue - b.currentPrice) - (a.estimatedValue - a.currentPrice))
      .slice(0, 5);

    // Missed opportunities (items that went up the most)
    const missedOps = [...allItems]
      .filter(i => i.priceChangePercent > 0)
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 5);

    // Sport distribution
    const sportCounts: Record<string, number> = {};
    for (const item of allItems) {
      sportCounts[item.sport] = (sportCounts[item.sport] || 0) + 1;
    }

    return (
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Watched</p>
            <span className="text-2xl font-bebas tracking-wider text-white">{analytics.totalWatched}</span>
          </div>
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Active Alerts</p>
            <span className={`text-2xl font-bebas tracking-wider ${analytics.triggeredAlerts > 0 ? 'text-red-400' : 'text-white'}`}>
              {analytics.triggeredAlerts}
            </span>
          </div>
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Top Mover</p>
            {analytics.topMover ? (
              <div>
                <span className="text-sm text-white font-medium block truncate">{analytics.topMover.player}</span>
                <span className={`font-mono text-xs ${analytics.topMover.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analytics.topMover.changePct >= 0 ? '+' : ''}{analytics.topMover.changePct.toFixed(1)}%
                </span>
              </div>
            ) : (
              <span className="text-sm text-slate-500">N/A</span>
            )}
          </div>
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Best Entry</p>
            {analytics.bestEntry ? (
              <div>
                <span className="text-sm text-white font-medium block truncate">{analytics.bestEntry.player}</span>
                <span className="font-mono text-xs text-cyan-400">-${analytics.bestEntry.priceDrop.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-sm text-slate-500">N/A</span>
            )}
          </div>
        </div>

        {/* Sport distribution */}
        {Object.keys(sportCounts).length > 0 && (
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sport Distribution</p>
            <div className="space-y-2">
              {Object.entries(sportCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([sport, count]) => {
                  const pct = allItems.length > 0 ? (count / allItems.length) * 100 : 0;
                  return (
                    <div key={sport}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{sport}</span>
                        <span className="font-mono text-white">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500/60 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Top Movers */}
        {topMovers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Top Movers</p>
            </div>
            <div className="space-y-1.5">
              {topMovers.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
                  <div className={`p-1.5 rounded-lg ${item.priceChangePercent >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.priceChangePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <span className="text-white font-medium flex-1 truncate">{item.player}</span>
                  <span className="text-slate-500">{item.sport}</span>
                  <MiniSparkline data={item.priceHistory} positive={item.priceChangePercent >= 0} />
                  <span className={`font-mono font-bold w-16 text-right ${item.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Entry Points */}
        {bestEntries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-cyan-400" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Best Entry Points</p>
            </div>
            <div className="space-y-1.5">
              {bestEntries.map(item => {
                const drop = item.estimatedValue - item.currentPrice;
                const dropPct = (drop / item.estimatedValue) * 100;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl text-xs">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <ArrowDownCircle size={14} />
                    </div>
                    <span className="text-white font-medium flex-1 truncate">{item.player}</span>
                    <span className="text-slate-500">{item.sport}</span>
                    <span className="font-mono text-slate-400">${item.currentPrice.toFixed(2)}</span>
                    <span className="font-mono font-bold text-cyan-400 w-20 text-right">
                      -{dropPct.toFixed(1)}% (-${drop.toFixed(2)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missed Opportunities (going up) */}
        {missedOps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Rising Fast (Don&apos;t Miss)</p>
            </div>
            <div className="space-y-1.5">
              {missedOps.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-white font-medium flex-1 truncate">{item.player}</span>
                  <span className="text-slate-500">{item.sport}</span>
                  <span className="font-mono text-white">${item.currentPrice.toFixed(2)}</span>
                  <span className="font-mono font-bold text-green-400 w-16 text-right">
                    +{item.priceChangePercent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {allItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
              <BarChart3 size={32} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">No analytics data yet</p>
            <p className="text-xs text-slate-600 mt-1">Add cards to your watchlists to see analytics</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-cyan-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <Eye size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Market <span className="text-cyan-400">Watchlists</span> & Alerts
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Track prices, set alerts, scan the market
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.key
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'watchlists' && renderWatchlistsTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'scanner' && renderScannerTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );
};

export default WatchlistModal;
