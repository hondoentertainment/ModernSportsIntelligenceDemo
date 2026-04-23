// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  X,
  Database,
  Search,
  Zap,
  Activity,
  ShieldCheck,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Repeat,
} from 'lucide-react';
import {
  Platform,
  ConsolidatedPrice,
  TransactionRecord,
  PLATFORM_COLORS,
  PLATFORM_FEES,
  CARD_SEEDS,
  getConsolidatedPrice,
  getArbitrageOpportunities,
  getTransactionFeed,
  getDataQualityReports,
  getConsolidationStats,
  getEnrichedConsolidatedView,
} from '../lib/utils/dataConsolidationService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface DataConsolidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'nbbo' | 'arbitrage' | 'feed' | 'quality';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'nbbo',      label: 'NBBO',             icon: <TrendingUp size={14} /> },
  { id: 'arbitrage',  label: 'Arbitrage',        icon: <Zap size={14} /> },
  { id: 'feed',       label: 'Transaction Feed', icon: <Activity size={14} /> },
  { id: 'quality',    label: 'Data Quality',     icon: <ShieldCheck size={14} /> },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

function platformColor(p: Platform): string {
  return PLATFORM_COLORS[p] ?? '#94A3B8';
}

function platformBadge(platform: Platform) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
      style={{
        color: platformColor(platform),
        borderColor: platformColor(platform) + '40',
        backgroundColor: platformColor(platform) + '15',
      }}
    >
      {platform}
    </span>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function qualityScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function confidenceBg(c: number): string {
  if (c >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (c >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

// ── NBBO Tab ────────────────────────────────────────────────────────────────────

const NBBOTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ConsolidatedPrice | null>(null);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return CARD_SEEDS.filter(c =>
      c.player.toLowerCase().includes(query.toLowerCase()) ||
      c.cardDescription.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  }, [query]);

  const handleSelect = useCallback((player: string, desc: string, grade: string) => {
    const result = getConsolidatedPrice(player, desc, grade);
    setSelected(result);
    setQuery('');
  }, []);

  // Default: load first card
  const defaultCard = useMemo(() => {
    return getConsolidatedPrice(CARD_SEEDS[0].player, CARD_SEEDS[0].cardDescription, CARD_SEEDS[0].grade);
  }, []);

  const card = selected ?? defaultCard;

  // Enriched view with market indices and consignment context (Phase 86/79 Cross-reference)
  const enrichedView = useMemo(() => {
    return getEnrichedConsolidatedView(card.player, card.cardDescription, card.grade);
  }, [card]);

  const chartData = useMemo(() => {
    return card.platformPrices.map(p => ({
      platform: p.platform,
      price: p.currentListing ?? p.lastSalePrice,
      fill: platformColor(p.platform),
    }));
  }, [card]);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search player or card…"
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime/50"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s.player, s.cardDescription, s.grade)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-700/60 transition-colors border-b border-slate-700/40 last:border-b-0"
              >
                <span className="text-sm font-semibold text-white">{s.player}</span>
                <span className="text-xs text-slate-400 ml-2">{s.cardDescription} — {s.grade}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{card.player}</h3>
            <p className="text-xs text-slate-400">{card.cardDescription} — {card.grade}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-brand-lime">${card.consensusPrice.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Consensus</p>
          </div>
        </div>

        {/* NBBO strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Best Bid</p>
            <p className="text-base font-bold text-emerald-400">${card.nbbo.bestBid.price.toLocaleString()}</p>
            {platformBadge(card.nbbo.bestBid.platform)}
          </div>
          <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Best Ask</p>
            <p className="text-base font-bold text-red-400">${card.nbbo.bestAsk.price.toLocaleString()}</p>
            {platformBadge(card.nbbo.bestAsk.platform)}
          </div>
          <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Spread</p>
            <p className="text-base font-bold text-white">${card.nbbo.spread.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">{card.nbbo.spreadPercent}%</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Confidence</p>
            <p className={`text-base font-bold ${card.priceConfidence >= 80 ? 'text-emerald-400' : card.priceConfidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {card.priceConfidence}%
            </p>
          </div>
        </div>
      </div>

      {/* Platform price comparison chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Platform Price Comparison</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="platform" tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Reference Insights (Phase 86 Market Indices / Phase 79 Consignment Router) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {enrichedView.marketIndicesContext && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Market Index</span>
            </div>
            <p className="text-xs text-slate-200 font-medium">{enrichedView.marketIndicesContext.relevantIndex}</p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-slate-400">Value: <span className="text-white font-semibold">{enrichedView.marketIndicesContext.indexValue.toLocaleString()}</span></span>
              <span className={`font-bold ${enrichedView.marketIndicesContext.indexChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {enrichedView.marketIndicesContext.indexChange >= 0 ? '+' : ''}{enrichedView.marketIndicesContext.indexChange.toFixed(2)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{enrichedView.marketIndicesContext.correlation}</p>
          </div>
        )}
        {enrichedView.consignmentContext && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Repeat size={12} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Consignment</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Best: <span className="text-emerald-400 font-bold">{enrichedView.consignmentContext.bestPlatform}</span></span>
              <span className="text-slate-400">Net: <span className="text-white font-semibold">${enrichedView.consignmentContext.bestNetProceeds.toLocaleString()}</span></span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              ${enrichedView.consignmentContext.pricingAdvantage.toLocaleString()} advantage over {enrichedView.consignmentContext.worstPlatform}
            </p>
          </div>
        )}
      </div>

      {/* Platform detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-2 px-2 text-slate-500 font-bold uppercase tracking-wider">Platform</th>
              <th className="text-right py-2 px-2 text-slate-500 font-bold uppercase tracking-wider">Last Sale</th>
              <th className="text-right py-2 px-2 text-slate-500 font-bold uppercase tracking-wider">Listing</th>
              <th className="text-right py-2 px-2 text-slate-500 font-bold uppercase tracking-wider">30d Avg</th>
              <th className="text-right py-2 px-2 text-slate-500 font-bold uppercase tracking-wider">Vol</th>
              <th className="text-right py-2 px-2 text-slate-500 font-bold uppercase tracking-wider">Quality</th>
            </tr>
          </thead>
          <tbody>
            {card.platformPrices.map(p => (
              <tr key={p.platform} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-2 px-2">{platformBadge(p.platform)}</td>
                <td className="py-2 px-2 text-right text-white font-semibold">${p.lastSalePrice.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-slate-300">{p.currentListing ? `$${p.currentListing.toLocaleString()}` : '—'}</td>
                <td className="py-2 px-2 text-right text-slate-300">${p.avgPrice30d.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-slate-400">{p.volume30d}</td>
                <td className="py-2 px-2 text-right">
                  <span className={`font-bold ${qualityScoreColor(p.dataQuality)}`}>{p.dataQuality}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Arbitrage Tab ───────────────────────────────────────────────────────────────

const ArbitrageTab: React.FC = () => {
  const arbs = useMemo(() => getArbitrageOpportunities(), []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={14} className="text-amber-400" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {arbs.length} Active Opportunities
        </span>
      </div>

      {arbs.map((arb, idx) => (
        <div
          key={arb.id}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-slate-500">#{idx + 1}</span>
                <h4 className="text-sm font-bold text-white truncate">{arb.player}</h4>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{arb.cardDescription}</p>
            </div>
            <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${confidenceBg(arb.confidence)}`}>
              {arb.confidence}% conf
            </div>
          </div>

          {/* Buy → Sell flow */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 bg-slate-900/60 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Buy</p>
              {platformBadge(arb.buyPlatform)}
              <p className="text-sm font-bold text-white mt-1">${arb.buyPrice.toLocaleString()}</p>
            </div>
            <TrendingUp size={16} className="text-emerald-400 flex-shrink-0" />
            <div className="flex-1 bg-slate-900/60 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Sell</p>
              {platformBadge(arb.sellPlatform)}
              <p className="text-sm font-bold text-white mt-1">${arb.sellPrice.toLocaleString()}</p>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Spread</p>
              <p className="text-xs font-bold text-white">${arb.spreadAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Spread %</p>
              <p className="text-xs font-bold text-amber-400">{arb.spreadPercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Net Profit</p>
              <p className="text-xs font-bold text-emerald-400">${arb.netProfit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Expires</p>
              <p className="text-xs font-bold text-slate-300">
                <Clock size={10} className="inline mr-0.5" />
                {timeUntil(arb.expiresAt)}
              </p>
            </div>
          </div>

          {/* Fee note */}
          <p className="text-[10px] text-slate-600 mt-2">
            Net after {PLATFORM_FEES[arb.sellPlatform].label} on {arb.sellPlatform}
          </p>
        </div>
      ))}
    </div>
  );
};

// ── Transaction Feed Tab ────────────────────────────────────────────────────────

const FeedTab: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('');
  const [playerFilter, setPlayerFilter] = useState('');

  const txns = useMemo(() => {
    const filters: { platform?: Platform; player?: string } = {};
    if (platformFilter) filters.platform = platformFilter;
    if (playerFilter.length >= 2) filters.player = playerFilter;
    return getTransactionFeed(filters);
  }, [platformFilter, playerFilter]);

  const typeBadge = (type: TransactionRecord['type']) => {
    const map: Record<string, string> = {
      sale: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      listing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      bid: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return (
      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${map[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={playerFilter}
            onChange={e => setPlayerFilter(e.target.value)}
            placeholder="Filter by player…"
            className="w-full pl-8 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime/50"
          />
        </div>
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value as Platform | '')}
          className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-brand-lime/50"
        >
          <option value="">All Platforms</option>
          <option value="eBay">eBay</option>
          <option value="PWCC">PWCC</option>
          <option value="Goldin">Goldin</option>
          <option value="Heritage">Heritage</option>
          <option value="MySlabs">MySlabs</option>
          <option value="COMC">COMC</option>
        </select>
      </div>

      {/* Feed list */}
      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        {txns.map(txn => (
          <div
            key={txn.id}
            className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2.5 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex-shrink-0 w-16">{platformBadge(txn.platform)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{txn.player}</p>
              <p className="text-[10px] text-slate-500 truncate">{txn.cardDescription} — {txn.grade}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {typeBadge(txn.type)}
              <span className="text-sm font-bold text-white w-20 text-right">${txn.price.toLocaleString()}</span>
              {txn.verified && <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />}
              <span className="text-[10px] text-slate-500 w-14 text-right">{timeAgo(txn.date)}</span>
            </div>
          </div>
        ))}
        {txns.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No transactions found</div>
        )}
      </div>
    </div>
  );
};

// ── Data Quality Tab ────────────────────────────────────────────────────────────

const QualityTab: React.FC = () => {
  const reports = useMemo(() => getDataQualityReports(), []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={14} className="text-emerald-400" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Platform Reliability Scorecard
        </span>
      </div>

      {reports
        .sort((a, b) => b.overallScore - a.overallScore)
        .map(report => (
        <div
          key={report.platform}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {platformBadge(report.platform)}
              <span className="text-xs text-slate-400">{report.totalRecords.toLocaleString()} records</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-2xl font-black ${qualityScoreColor(report.overallScore)}`}>
                {report.overallScore}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">/100</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full h-1.5 bg-slate-700/50 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${report.overallScore}%`,
                backgroundColor: report.overallScore >= 85 ? '#22C55E' : report.overallScore >= 70 ? '#EAB308' : '#EF4444',
              }}
            />
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Verified</p>
              <p className={`text-sm font-bold ${report.verifiedPercent >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {report.verifiedPercent}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Suspicious</p>
              <p className={`text-sm font-bold ${report.suspiciousTransactions < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {report.suspiciousTransactions}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Latency</p>
              <p className={`text-sm font-bold ${report.avgLatency < 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {report.avgLatency}s
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Freshness</p>
              <p className={`text-sm font-bold ${report.dataFreshness < 15 ? 'text-emerald-400' : report.dataFreshness < 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {report.dataFreshness}m
              </p>
            </div>
          </div>

          {report.suspiciousTransactions > 80 && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-400">
              <AlertTriangle size={10} />
              <span className="text-[10px] font-bold">Elevated suspicious activity detected</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────────

const DataConsolidationModal: React.FC<DataConsolidationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('nbbo');
  const stats = useMemo(() => getConsolidationStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center">
              <Database size={20} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Unified Market Data</h2>
              <p className="text-xs text-slate-500">Consolidated Tape — Every Sale, Every Platform, One View</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-4 px-6 py-2.5 bg-slate-800/40 border-b border-slate-800/60 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <Repeat size={10} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              {stats.totalPlatforms} Platforms
            </span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            {stats.totalTransactionsTracked.toLocaleString()} Transactions
          </span>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap">
            {stats.activeArbitrageOps} Arb Ops
          </span>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Avg Spread: {stats.avgSpread}%
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'nbbo' && <NBBOTab />}
          {activeTab === 'arbitrage' && <ArbitrageTab />}
          {activeTab === 'feed' && <FeedTab />}
          {activeTab === 'quality' && <QualityTab />}
        </div>
      </div>
    </div>
  );
};

export default DataConsolidationModal;
