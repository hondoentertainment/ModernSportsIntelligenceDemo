import React, { useState, useMemo } from 'react';
import {
  X, {{ICON_NAME}}, Search, Filter, BarChart3,
  TrendingUp, TrendingDown, Clock, ChevronDown,
} from 'lucide-react';
import {
  get{{PASCAL_NAME}}Items, get{{PASCAL_NAME}}Details, get{{PASCAL_NAME}}Stats,
  {{PASCAL_NAME}}Item, {{PASCAL_NAME}}Detail,
} from '../lib/{{CAMEL_NAME}}Service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'overview' | 'details' | 'analytics' | 'settings';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'details', label: 'Details' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const {{PASCAL_NAME}}Modal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const items = useMemo(() => get{{PASCAL_NAME}}Items(), []);
  const details = useMemo(() => get{{PASCAL_NAME}}Details(), []);
  const stats = useMemo(() => get{{PASCAL_NAME}}Stats(), []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (statusFilter !== 'all') result = result.filter(i => i.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return result;
  }, [items, statusFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <{{ICON_NAME}} size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{{DISPLAY_NAME}}</h2>
              <p className="text-xs text-slate-400">{{DESCRIPTION}}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 px-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.totalItems}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.activeCount}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-blue-400">${stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.avgConfidence}%</p>
                </div>
              </div>

              {/* Search & filter bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/40"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Item list */}
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 hover:border-blue-500/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[item.status] || STATUS_COLORS.archived}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{item.category}</span>
                      <span className="flex items-center gap-1">
                        {item.trend >= 0 ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-red-400" />}
                        <span className={item.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </span>
                      </span>
                      <span>${item.value.toFixed(2)}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(item.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {details.map(detail => (
                <div key={detail.id} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-200">{detail.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                      Score: {detail.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{detail.description}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {detail.metrics.map(m => (
                      <div key={m.label} className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">{m.label}</p>
                        <p className="text-sm font-bold text-slate-200">{m.value}</p>
                        <p className={`text-[10px] ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.change > 0 ? '+' : ''}{m.change}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {detail.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-400" />
                  Performance Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Distribution by Status</p>
                    {['active', 'pending', 'completed', 'archived'].map(status => {
                      const count = items.filter(i => i.status === status).length;
                      const pct = items.length ? Math.round((count / items.length) * 100) : 0;
                      return (
                        <div key={status} className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] text-slate-400 w-20 capitalize">{status}</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Distribution by Category</p>
                    {Array.from(new Set(items.map(i => i.category))).slice(0, 5).map(cat => {
                      const count = items.filter(i => i.category === cat).length;
                      const pct = items.length ? Math.round((count / items.length) * 100) : 0;
                      return (
                        <div key={cat} className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] text-slate-400 w-20 truncate">{cat}</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">{{DISPLAY_NAME}} Settings</h3>
                <div className="space-y-3">
                  {['Enable notifications', 'Auto-refresh data', 'Show archived items'].map(setting => (
                    <label key={setting} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{setting}</span>
                      <div className="w-10 h-5 rounded-full bg-slate-700 relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-slate-400 transition-transform" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {{PASCAL_NAME}}Modal;
