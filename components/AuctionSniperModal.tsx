// Phase 95: Auction Sniper Pro Modal — 4-tab layout
import React, { useState, useMemo } from 'react';
import {
  X,
  Gavel,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  Award,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  getActiveAuctions,
  analyzeBidHistory,
  generateBidStrategy,
  getSniperStats,
  getAuctionHistory,
  AuctionListing,
  BidHistoryAnalysis,
  BidStrategy,
  BidPattern,
  AuctionPlatform,
} from '../lib/trading/auctionSniperService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface AuctionSniperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'live' | 'forensics' | 'strategy' | 'history';

const TABS: { id: TabId; label: string }[] = [
  { id: 'live', label: 'Live Auctions' },
  { id: 'forensics', label: 'Bid Forensics' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'history', label: 'History' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function urgencyColor(seconds: number): string {
  if (seconds < 1800) return 'text-red-400';
  if (seconds < 3600) return 'text-amber-400';
  return 'text-slate-300';
}

const PATTERN_CONFIG: Record<BidPattern, { label: string; color: string; bg: string; border: string }> = {
  organic:        { label: 'Organic',       color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  shill_suspect:  { label: 'Shill Risk',    color: 'text-red-400',     bg: 'bg-red-500/20',     border: 'border-red-500/30' },
  proxy_war:      { label: 'Proxy War',     color: 'text-amber-400',   bg: 'bg-amber-500/20',   border: 'border-amber-500/30' },
  sniper_active:  { label: 'Sniper Active', color: 'text-blue-400',    bg: 'bg-blue-500/20',    border: 'border-blue-500/30' },
};

const PLATFORM_COLOR: Partial<Record<AuctionPlatform, string>> = {
  eBay: 'text-blue-400',
  Goldin: 'text-amber-400',
  Heritage: 'text-purple-400',
  PWCC: 'text-emerald-400',
  MySlabs: 'text-rose-400',
};

const STRATEGY_LABELS: Record<string, { label: string; color: string }> = {
  early_bid: { label: 'Early Bid', color: 'text-blue-400' },
  mid_game:  { label: 'Mid Game',  color: 'text-amber-400' },
  snipe:     { label: 'Snipe',     color: 'text-emerald-400' },
  proxy:     { label: 'Proxy',     color: 'text-purple-400' },
};

// ── Deal score bar ──────────────────────────────────────────────────────────────

const DealScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  );
};

// ── Shill risk badge ────────────────────────────────────────────────────────────

const ShillBadge: React.FC<{ risk: number }> = ({ risk }) => {
  if (risk < 30) return null;
  const cls = risk >= 60
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded border ${cls}`}>
      <AlertTriangle size={9} />
      {risk}%
    </span>
  );
};

// ── Tab: Live Auctions ──────────────────────────────────────────────────────────

const LiveAuctionsTab: React.FC<{ auctions: AuctionListing[]; onSelect: (_a: AuctionListing) => void }> = ({ auctions, onSelect }) => {
  const sorted = useMemo(() => [...auctions].sort((a, b) => a.timeRemaining - b.timeRemaining), [auctions]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{auctions.length} auctions tracked across {new Set(auctions.map(a => a.platform)).size} platforms</p>
      </div>
      {sorted.map(auction => {
        const patt = PATTERN_CONFIG[auction.bidPattern];
        return (
          <button
            key={auction.id}
            onClick={() => onSelect(auction)}
            className="w-full text-left bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-3 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-white truncate">{auction.player}</span>
                  <span className={`text-[10px] font-bold ${PLATFORM_COLOR[auction.platform] ?? 'text-slate-400'}`}>{auction.platform}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${patt.bg} ${patt.color} ${patt.border}`}>
                    {patt.label.toUpperCase()}
                  </span>
                  <ShillBadge risk={auction.shillRisk} />
                </div>
                <p className="text-xs text-slate-400 truncate">{auction.cardDescription} &middot; {auction.grade}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-300 font-semibold">${auction.currentBid.toFixed(0)}</span>
                  <span className="text-[10px] text-slate-500">FMV ${auction.estimatedFMV.toFixed(0)}</span>
                  <span className="text-[10px] text-slate-500">{auction.bidCount} bids</span>
                  <span className="text-[10px] text-slate-500">{auction.watchers} watching</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`text-xs font-mono font-semibold flex items-center gap-1 ${urgencyColor(auction.timeRemaining)}`}>
                  <Clock size={10} />
                  {formatTime(auction.timeRemaining)}
                </span>
                <DealScoreBar score={auction.dealScore} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ── Tab: Bid Forensics ──────────────────────────────────────────────────────────

const BidForensicsTab: React.FC<{ auctions: AuctionListing[] }> = ({ auctions }) => {
  const [selectedId, setSelectedId] = useState<string>(auctions[0]?.id || '');
  const selected = auctions.find(a => a.id === selectedId);
  const analysis = useMemo<BidHistoryAnalysis | null>(() => {
    if (!selectedId) return null;
    return analyzeBidHistory(selectedId);
  }, [selectedId]);

  const chartData = useMemo(() => {
    if (!analysis) return [];
    return analysis.bids.map((b, i) => ({
      bid: i + 1,
      amount: b.amount,
      bidder: b.bidder,
      isNew: b.isNewBidder,
    }));
  }, [analysis]);

  // Velocity chart: bid increments over time
  const velocityData = useMemo(() => {
    if (!analysis || analysis.bids.length < 2) return [];
    return analysis.bids.slice(1).map((b, i) => ({
      bid: i + 2,
      increment: Math.round((b.amount - analysis.bids[i].amount) * 100) / 100,
    }));
  }, [analysis]);

  return (
    <div className="space-y-4">
      {/* Auction selector */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Select auction to analyze</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
        >
          {auctions.map(a => (
            <option key={a.id} value={a.id}>
              {a.player} — {a.platform} — ${a.currentBid.toFixed(0)} ({a.bidCount} bids)
            </option>
          ))}
        </select>
      </div>

      {analysis && selected && (
        <>
          {/* Pattern & risk summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase">Pattern</p>
              <p className={`text-sm font-bold ${PATTERN_CONFIG[analysis.pattern].color}`}>
                {PATTERN_CONFIG[analysis.pattern].label}
              </p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase">Shill Risk</p>
              <p className={`text-sm font-bold ${selected.shillRisk >= 60 ? 'text-red-400' : selected.shillRisk >= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {selected.shillRisk}%
              </p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase">Avg Increment</p>
              <p className="text-sm font-bold text-slate-200">${analysis.avgBidIncrement.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/70 rounded-lg p-3 text-center border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase">Velocity Chg</p>
              <p className={`text-sm font-bold ${analysis.velocityChange > 50 ? 'text-red-400' : analysis.velocityChange > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {analysis.velocityChange > 0 ? '+' : ''}{analysis.velocityChange}%
              </p>
            </div>
          </div>

          {/* Bid timeline chart */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Activity size={12} className="text-lime-400" /> Bid Timeline
            </h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="bid" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Bid #', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number, _name: string, props: any) => [
                      `$${value.toFixed(2)} — ${props.payload.bidder}${props.payload.isNew ? ' (new)' : ''}`,
                      'Bid',
                    ]}
                  />
                  <Line type="stepAfter" dataKey="amount" stroke="#84cc16" strokeWidth={2} dot={{ fill: '#84cc16', r: 3 }} activeDot={{ r: 5 }} />
                  {selected.estimatedFMV > 0 && (
                    <ReferenceLine y={selected.estimatedFMV} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'FMV', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No bid history available</p>
            )}
          </div>

          {/* Velocity chart */}
          {velocityData.length > 0 && (
            <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <BarChart3 size={12} className="text-amber-400" /> Bid Velocity (Increment per Bid)
              </h4>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={velocityData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="bid" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Increment']}
                  />
                  <Bar dataKey="increment" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Shill indicators */}
          {analysis.shillIndicators.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-red-400 uppercase mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Shill Risk Indicators
              </h4>
              <ul className="space-y-1.5">
                {analysis.shillIndicators.map((ind, i) => (
                  <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">&#x2022;</span>
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Tab: Strategy ───────────────────────────────────────────────────────────────

const StrategyTab: React.FC<{ auctions: AuctionListing[] }> = ({ auctions }) => {
  const [selectedId, setSelectedId] = useState<string>(auctions[0]?.id || '');
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const selected = auctions.find(a => a.id === selectedId);

  // Auto-set budget to 90% of FMV when selection changes
  React.useEffect(() => {
    if (selected) {
      setMaxBudget(Math.round(selected.estimatedFMV * 0.9));
    }
  }, [selected]);

  const strategy = useMemo<BidStrategy | null>(() => {
    if (!selectedId || maxBudget <= 0) return null;
    return generateBidStrategy(selectedId, maxBudget);
  }, [selectedId, maxBudget]);

  const stratLabel = strategy ? STRATEGY_LABELS[strategy.strategy] || { label: strategy.strategy, color: 'text-slate-300' } : null;

  return (
    <div className="space-y-4">
      {/* Auction selector */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Select auction</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
        >
          {auctions.map(a => (
            <option key={a.id} value={a.id}>
              {a.player} — {a.platform} — ${a.currentBid.toFixed(0)} (FMV ${a.estimatedFMV.toFixed(0)})
            </option>
          ))}
        </select>
      </div>

      {/* Budget input */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Maximum budget ($)</label>
        <input
          type="number"
          value={maxBudget}
          onChange={e => setMaxBudget(Number(e.target.value))}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
          min={0}
        />
      </div>

      {strategy && selected && (
        <>
          {/* Strategy card */}
          <div className="bg-slate-800/70 rounded-xl p-5 border border-slate-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-lime-400" />
                <h4 className="text-sm font-bold text-white">AI Bid Strategy</h4>
              </div>
              {stratLabel && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${stratLabel.color} bg-slate-700`}>
                  {stratLabel.label.toUpperCase()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Max Bid</p>
                <p className="text-lg font-bold text-lime-400">${strategy.maxBid.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Snipe Time</p>
                <p className="text-lg font-bold text-blue-400">{strategy.snipeTime}s</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                <p className={`text-lg font-bold ${strategy.confidence >= 65 ? 'text-emerald-400' : strategy.confidence >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  {strategy.confidence}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Est. Savings</p>
                <p className="text-lg font-bold text-emerald-400">
                  ${Math.max(0, selected.estimatedFMV - strategy.maxBid).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
                <span className="text-xs font-semibold text-slate-300">{strategy.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    strategy.confidence >= 65 ? 'bg-emerald-500' : strategy.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${strategy.confidence}%` }}
                />
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
              <p className="text-xs text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <Zap size={10} className="text-lime-400" /> AI Analysis
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{strategy.reasoning}</p>
            </div>
          </div>

          {/* Auction context */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Auction Context</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Bid</span>
                <span className="text-white font-semibold">${selected.currentBid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FMV</span>
                <span className="text-emerald-400 font-semibold">${selected.estimatedFMV.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bid Count</span>
                <span className="text-white">{selected.bidCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Watchers</span>
                <span className="text-white">{selected.watchers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shill Risk</span>
                <span className={selected.shillRisk >= 50 ? 'text-red-400' : 'text-emerald-400'}>{selected.shillRisk}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Left</span>
                <span className={urgencyColor(selected.timeRemaining)}>{formatTime(selected.timeRemaining)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Tab: History ────────────────────────────────────────────────────────────────

const HistoryTab: React.FC = () => {
  const stats = useMemo(() => getSniperStats(), []);
  const history = useMemo(() => getAuctionHistory(), []);

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Total Tracked</p>
          <p className="text-xl font-bold text-slate-200">{stats.totalTracked}</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Won</p>
          <p className="text-xl font-bold text-emerald-400">{stats.totalWon}</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Win Rate</p>
          <p className="text-xl font-bold text-lime-400">{stats.winRate}%</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Avg Savings vs FMV</p>
          <p className="text-xl font-bold text-emerald-400">{stats.avgSavingsVsFMV}%</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Total Saved</p>
          <p className="text-xl font-bold text-lime-400">${stats.totalSaved.toLocaleString()}</p>
        </div>
        <div className="bg-lime-500/10 border border-lime-500/20 rounded-xl p-3 text-center">
          <p className="text-[10px] text-lime-400/70 uppercase">Best Deal</p>
          <p className="text-sm font-bold text-lime-400">{stats.bestDeal.player}</p>
          <p className="text-xs text-lime-400/70">${stats.bestDeal.savings.toLocaleString()} saved on {stats.bestDeal.platform}</p>
        </div>
      </div>

      {/* History list */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Auction History</h4>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {history.map(record => (
            <div
              key={record.id}
              className={`bg-slate-800/70 rounded-xl p-3 border ${
                record.won ? 'border-emerald-500/20' : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {record.won ? (
                      <Award size={12} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X size={12} className="text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-white truncate">{record.player}</span>
                    <span className={`text-[10px] font-bold ${PLATFORM_COLOR[record.platform] ?? 'text-slate-400'}`}>{record.platform}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate ml-5">{record.cardDescription} &middot; {record.grade}</p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-bold text-white">${record.finalPrice.toFixed(0)}</span>
                  {record.won && record.savings > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-400">
                      Saved ${record.savings.toFixed(0)}
                    </span>
                  )}
                  {!record.won && (
                    <span className="text-[10px] text-red-400">Outbid</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 ml-5 text-[10px] text-slate-500">
                <span>FMV ${record.estimatedFMV.toFixed(0)}</span>
                <span>Max bid ${record.maxBidPlaced.toFixed(0)}</span>
                <span>{new Date(record.endedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────────

const AuctionSniperModal: React.FC<AuctionSniperModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('live');
  const auctions = useMemo(() => getActiveAuctions(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-lime-500/20">
                <Gavel size={20} className="text-lime-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Auction Sniper Pro</h2>
                <p className="text-xs text-slate-400">AI-Powered Bid Intelligence & Shill Detection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'live' && (
            <LiveAuctionsTab
              auctions={auctions}
              onSelect={() => setActiveTab('forensics')}
            />
          )}
          {activeTab === 'forensics' && <BidForensicsTab auctions={auctions} />}
          {activeTab === 'strategy' && <StrategyTab auctions={auctions} />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </div>
    </div>
  );
};

export default AuctionSniperModal;
