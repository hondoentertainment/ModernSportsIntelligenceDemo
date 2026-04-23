// @ts-nocheck
// Transaction Wire Modal — Full transaction list with filters and volume chart
import React, { useState, useMemo } from 'react';
import {
  X,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Zap,
  Filter,
  Activity,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getRecentTransactions,
  getTransactionStats,
  Sport,
  Platform,
} from '../lib/trading/transactionWireService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface TransactionWireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PriceRange = 'all' | 'under1k' | '1k-5k' | '5k-25k' | 'over25k';

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SPORT_BADGE: Record<Sport, { bg: string; text: string }> = {
  MLB: { bg: 'bg-red-500/20', text: 'text-red-400' },
  NBA: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  NFL: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

const PLATFORM_COLOR: Record<Platform, string> = {
  eBay: 'text-blue-400',
  PWCC: 'text-emerald-400',
  Goldin: 'text-amber-400',
  Heritage: 'text-purple-400',
  MySlabs: 'text-rose-400',
  Fanatics: 'text-cyan-400',
};

const PRICE_RANGES: { value: PriceRange; label: string }[] = [
  { value: 'all', label: 'All Prices' },
  { value: 'under1k', label: '< $1K' },
  { value: '1k-5k', label: '$1K–$5K' },
  { value: '5k-25k', label: '$5K–$25K' },
  { value: 'over25k', label: '$25K+' },
];

function matchesPriceRange(price: number, range: PriceRange): boolean {
  switch (range) {
    case 'under1k': return price < 1000;
    case '1k-5k': return price >= 1000 && price < 5000;
    case '5k-25k': return price >= 5000 && price < 25000;
    case 'over25k': return price >= 25000;
    default: return true;
  }
}

// ── Component ───────────────────────────────────────────────────────────────────

const TransactionWireModal: React.FC<TransactionWireModalProps> = ({ isOpen, onClose }) => {
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allTransactions = useMemo(() => getRecentTransactions(), []);
  const stats = useMemo(() => getTransactionStats(), []);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(txn => {
      if (sportFilter !== 'all' && txn.sport !== sportFilter) return false;
      if (platformFilter !== 'all' && txn.platform !== platformFilter) return false;
      if (!matchesPriceRange(txn.price, priceRange)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!txn.player.toLowerCase().includes(q) && !txn.cardDescription.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allTransactions, sportFilter, platformFilter, priceRange, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Newspaper size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Transaction Wire</h2>
              <p className="text-xs text-slate-400">Real-time market transaction feed across all platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Volume Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-lime-400" />
              <h3 className="text-sm font-semibold text-slate-300">Transaction Volume (Last 12 Hours)</h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.volumeByHour}>
                  <defs>
                    <linearGradient id="txnVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#84cc16"
                    fill="url(#txnVolumeGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">Filters:</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search player..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-lime-500/50 w-40"
              />
            </div>

            {/* Sport filter */}
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value as Sport | 'all')}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:border-lime-500/50"
            >
              <option value="all">All Sports</option>
              <option value="MLB">MLB</option>
              <option value="NBA">NBA</option>
              <option value="NFL">NFL</option>
            </select>

            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value as Platform | 'all')}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:border-lime-500/50"
            >
              <option value="all">All Platforms</option>
              <option value="eBay">eBay</option>
              <option value="PWCC">PWCC</option>
              <option value="Goldin">Goldin</option>
              <option value="Heritage">Heritage</option>
              <option value="MySlabs">MySlabs</option>
              <option value="Fanatics">Fanatics</option>
            </select>

            {/* Price range */}
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value as PriceRange)}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:border-lime-500/50"
            >
              {PRICE_RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <span className="text-[10px] text-slate-500 ml-auto">
              {filteredTransactions.length} of {allTransactions.length} transactions
            </span>
          </div>

          {/* Transaction list */}
          <div className="space-y-2">
            {filteredTransactions.map(txn => {
              const delta = ((txn.price - txn.previousPrice) / txn.previousPrice) * 100;
              const isUp = delta >= 0;
              const sportBadge = SPORT_BADGE[txn.sport];

              return (
                <div
                  key={txn.id}
                  className={`bg-slate-800/70 border rounded-xl p-3 transition-all hover:bg-slate-800 ${
                    txn.isNotable ? 'border-amber-500/30' : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {txn.isNotable && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Zap size={8} /> NOTABLE
                          </span>
                        )}
                        <span className="text-sm font-semibold text-white">{txn.player}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${sportBadge.bg} ${sportBadge.text}`}>
                          {txn.sport}
                        </span>
                        <span className={`text-[10px] font-bold ${PLATFORM_COLOR[txn.platform]}`}>
                          {txn.platform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{txn.cardDescription}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                        <span>{txn.buyerType} → {txn.sellerType}</span>
                        <span>{formatTimeAgo(txn.timestamp)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-white">{formatPrice(txn.price)}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {isUp ? (
                          <TrendingUp size={11} className="text-emerald-400" />
                        ) : (
                          <TrendingDown size={11} className="text-red-400" />
                        )}
                        <span className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isUp ? '+' : ''}{delta.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">prev {formatPrice(txn.previousPrice)}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No transactions match the current filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionWireModal;
