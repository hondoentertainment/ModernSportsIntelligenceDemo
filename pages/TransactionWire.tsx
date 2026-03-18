// Transaction Wire — Full page: Bloomberg-style transaction ticker for sports cards
import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  BarChart3,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
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
  getTopMovers,
  Sport,
  Platform,
  TopMover,
} from '../lib/trading/transactionWireService';

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

function formatPriceCompact(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1000) return `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`;
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

type PriceRange = 'all' | 'under1k' | '1k-5k' | '5k-25k' | 'over25k';

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

// ── Top Mover Card ──────────────────────────────────────────────────────────────

const TopMoverCard: React.FC<{ mover: TopMover }> = ({ mover }) => {
  const isUp = mover.direction === 'up';
  const sportBadge = SPORT_BADGE[mover.sport];

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-bold text-slate-200">{mover.player}</p>
          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${sportBadge.bg} ${sportBadge.text}`}>
            {mover.sport}
          </span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isUp ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          {isUp ? (
            <ArrowUpRight size={14} className="text-emerald-400" />
          ) : (
            <ArrowDownRight size={14} className="text-red-400" />
          )}
          <span className={`text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{mover.priceChange.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Avg: {formatPriceCompact(mover.avgPrice)}</span>
        <span>{mover.transactionCount} txn{mover.transactionCount > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────────

const TransactionWire: React.FC = () => {
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allTransactions = useMemo(() => getRecentTransactions(), []);
  const stats = useMemo(() => getTransactionStats(), []);
  const topMovers = useMemo(() => getTopMovers(), []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-lime-500/20">
          <Newspaper size={24} className="text-lime-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Transaction Wire</h1>
          <p className="text-sm text-slate-400">Real-time feed of notable card transactions across the market</p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Volume</p>
          <p className="text-3xl font-bold text-lime-400">{formatPriceCompact(stats.totalVolume)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Price</p>
          <p className="text-3xl font-bold text-slate-200">{formatPriceCompact(stats.avgPrice)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notable Deals</p>
          <p className="text-3xl font-bold text-amber-400">{stats.notableDeals}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Platforms</p>
          <p className="text-3xl font-bold text-blue-400">{stats.platformCount}</p>
        </div>
      </div>

      {/* Transaction Volume Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-lime-400" />
          <h3 className="text-sm font-semibold text-slate-300">Transaction Volume Timeline (Last 12 Hours)</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.volumeByHour}>
              <defs>
                <linearGradient id="pageVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
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
                fill="url(#pageVolumeGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Transaction Feed */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-300">Live Transaction Feed</h3>
          </div>
          <span className="text-[10px] text-slate-500">
            {filteredTransactions.length} of {allTransactions.length} transactions
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-slate-500" />
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-lime-500/50 w-44"
            />
          </div>

          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value as Sport | 'all')}
            className="px-3 py-1.5 text-xs bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:border-lime-500/50"
          >
            <option value="all">All Sports</option>
            <option value="MLB">MLB</option>
            <option value="NBA">NBA</option>
            <option value="NFL">NFL</option>
          </select>

          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value as Platform | 'all')}
            className="px-3 py-1.5 text-xs bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:border-lime-500/50"
          >
            <option value="all">All Platforms</option>
            <option value="eBay">eBay</option>
            <option value="PWCC">PWCC</option>
            <option value="Goldin">Goldin</option>
            <option value="Heritage">Heritage</option>
            <option value="MySlabs">MySlabs</option>
            <option value="Fanatics">Fanatics</option>
          </select>

          <select
            value={priceRange}
            onChange={e => setPriceRange(e.target.value as PriceRange)}
            className="px-3 py-1.5 text-xs bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:border-lime-500/50"
          >
            {PRICE_RANGES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Transaction rows */}
        <div className="space-y-2">
          {filteredTransactions.map(txn => {
            const delta = ((txn.price - txn.previousPrice) / txn.previousPrice) * 100;
            const isUp = delta >= 0;
            const sportBadge = SPORT_BADGE[txn.sport];

            return (
              <div
                key={txn.id}
                className={`bg-slate-900/50 border rounded-xl p-3 transition-all hover:bg-slate-900/80 ${
                  txn.isNotable ? 'border-amber-500/30' : 'border-slate-700/30'
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
                      <span>{txn.buyerType} buyer</span>
                      <span className="text-slate-700">|</span>
                      <span>{txn.sellerType} seller</span>
                      <span className="text-slate-700">|</span>
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

      {/* Top Movers Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-lime-400" />
          <h3 className="text-sm font-semibold text-slate-300">Top Movers</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topMovers.slice(0, 6).map(mover => (
            <TopMoverCard key={mover.player} mover={mover} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionWire;
