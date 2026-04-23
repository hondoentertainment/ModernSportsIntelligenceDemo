// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  ShieldAlert,
  Zap,
  ArrowUpDown,
  Building2,
  Users,
  Store,
} from 'lucide-react';
import {
  getAllMarketDepths,
  getOrderFlowSignals,
  getMicrostructureStats,
  getTopSpreads,
  detectAnomalies,
  getInstitutionalFlow,
  type MarketDepth,
  type OrderFlowSignal,
  type Platform,
  type SignalType,
} from '../lib/analytics/marketMicrostructureService';

interface MarketMicrostructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'orderbook' | 'signals' | 'spreads' | 'anomalies';

const TABS: { id: TabId; label: string }[] = [
  { id: 'orderbook', label: 'Order Book' },
  { id: 'signals', label: 'Flow Signals' },
  { id: 'spreads', label: 'Spread Analysis' },
  { id: 'anomalies', label: 'Anomalies' },
];

const PLATFORM_COLORS: Record<Platform, { text: string; bg: string; border: string }> = {
  eBay: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  PWCC: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  Goldin: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Whatnot: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  COMC: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
};

const SIGNAL_COLORS: Record<SignalType, { text: string; bg: string; border: string; label: string }> = {
  accumulation: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Accumulation' },
  distribution: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Distribution' },
  spoofing: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Spoofing' },
  'wash-trading': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Wash Trading' },
  'momentum-shift': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Momentum Shift' },
};

function formatCurrency(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}k`;
  return `$${n.toFixed(0)}`;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getBuyerIcon(buyerType: string) {
  if (buyerType === 'institutional') return <Building2 size={10} className="text-purple-400" />;
  if (buyerType === 'dealer') return <Store size={10} className="text-amber-400" />;
  return <Users size={10} className="text-slate-500" />;
}

const MarketMicrostructureModal: React.FC<MarketMicrostructureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('orderbook');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const depths = useMemo(() => getAllMarketDepths(), []);
  const signals = useMemo(() => getOrderFlowSignals(), []);
  const stats = useMemo(() => getMicrostructureStats(), []);
  const topSpreads = useMemo(() => getTopSpreads(10), []);
  const anomalies = useMemo(() => detectAnomalies(), []);
  const instFlow = useMemo(() => getInstitutionalFlow(), []);

  const currentDepth: MarketDepth | undefined = useMemo(() => {
    if (selectedCard) return depths.find((d) => d.cardId === selectedCard);
    return depths[0];
  }, [selectedCard, depths]);

  if (!isOpen) return null;

  // Max quantity across current order book for scaling bars
  const maxQty = currentDepth
    ? Math.max(
        ...currentDepth.bids.map((o) => o.quantity),
        ...currentDepth.asks.map((o) => o.quantity),
        1,
      )
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-slate-900 px-6 py-5 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20">
              <BarChart3 size={22} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Market Microstructure</h2>
              <p className="text-xs text-slate-400">Level 2 order flow analytics and market depth visualization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 border-b border-slate-800 flex-shrink-0">
          {[
            { label: 'Cards Monitored', value: stats.totalCardsMonitored.toString(), color: 'text-cyan-400' },
            { label: 'Avg Spread', value: `${stats.avgSpread.toFixed(1)}%`, color: 'text-white' },
            { label: 'Active Signals', value: stats.activeSignals.toString(), color: 'text-amber-400' },
            { label: 'Institutional Flow', value: `${stats.institutionalFlowPercent.toFixed(0)}%`, color: 'text-purple-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2 flex-shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'anomalies' && anomalies.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[8px]">
                  {anomalies.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {/* -------------------------------------------------------- */}
          {/* TAB 1: Order Book                                         */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'orderbook' && (
            <div className="space-y-4">
              {/* Card selector */}
              <div className="flex flex-wrap gap-2">
                {depths.map((d) => (
                  <button
                    key={d.cardId}
                    onClick={() => setSelectedCard(d.cardId)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all truncate max-w-[200px] ${
                      (selectedCard ?? depths[0]?.cardId) === d.cardId
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : 'text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {d.cardName.length > 28 ? d.cardName.slice(0, 28) + '...' : d.cardName}
                  </button>
                ))}
              </div>

              {currentDepth && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Bid side */}
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp size={12} /> Bids ({currentDepth.bids.length})
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Vol: {currentDepth.bids.reduce((s, o) => s + o.quantity, 0)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {currentDepth.bids.map((bid) => {
                        const pc = PLATFORM_COLORS[bid.platform];
                        return (
                          <div key={bid.id} className="flex items-center gap-2">
                            <span className="text-xs text-green-400 font-mono w-20 text-right font-bold">
                              {formatCurrency(bid.price)}
                            </span>
                            <div className="flex-1 h-5 bg-slate-700/30 rounded overflow-hidden relative flex items-center">
                              <div
                                className="absolute inset-y-0 left-0 bg-green-500/20 rounded"
                                style={{ width: `${(bid.quantity / maxQty) * 100}%` }}
                              />
                              <div className="relative flex items-center gap-1.5 px-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pc.text} ${pc.bg} border ${pc.border}`}>
                                  {bid.platform}
                                </span>
                                {getBuyerIcon(bid.buyerType)}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 font-mono w-6 text-right">
                              {bid.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ask side */}
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingDown size={12} /> Asks ({currentDepth.asks.length})
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Vol: {currentDepth.asks.reduce((s, o) => s + o.quantity, 0)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {currentDepth.asks.map((ask) => {
                        const pc = PLATFORM_COLORS[ask.platform];
                        return (
                          <div key={ask.id} className="flex items-center gap-2">
                            <span className="text-xs text-red-400 font-mono w-20 text-right font-bold">
                              {formatCurrency(ask.price)}
                            </span>
                            <div className="flex-1 h-5 bg-slate-700/30 rounded overflow-hidden relative flex items-center">
                              <div
                                className="absolute inset-y-0 left-0 bg-red-500/20 rounded"
                                style={{ width: `${(ask.quantity / maxQty) * 100}%` }}
                              />
                              <div className="relative flex items-center gap-1.5 px-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pc.text} ${pc.bg} border ${pc.border}`}>
                                  {ask.platform}
                                </span>
                                {getBuyerIcon(ask.buyerType)}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 font-mono w-6 text-right">
                              {ask.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Spread highlight */}
              {currentDepth && (
                <div className="flex items-center justify-center gap-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spread</p>
                    <p className="text-lg font-mono font-bold text-cyan-400">{formatCurrency(currentDepth.spread)}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spread %</p>
                    <p className="text-lg font-mono font-bold text-cyan-400">{currentDepth.spreadPercent.toFixed(2)}%</p>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mid Price</p>
                    <p className="text-lg font-mono font-bold text-white">{formatCurrency(currentDepth.midPrice)}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Imbalance</p>
                    <p className={`text-lg font-mono font-bold ${currentDepth.imbalanceRatio > 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentDepth.imbalanceRatio.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 2: Flow Signals                                       */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'signals' && (
            <div className="space-y-3">
              {signals.map((sig) => {
                const sc = SIGNAL_COLORS[sig.signalType];
                return (
                  <div
                    key={sig.id}
                    className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${sc.text} ${sc.bg} border ${sc.border}`}>
                          {sc.label}
                        </span>
                        <span className="text-xs text-white font-bold truncate max-w-[250px]">
                          {sig.cardName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{formatTime(sig.detectedAt)}</span>
                        <div className="flex items-center gap-1">
                          <Eye size={10} className="text-slate-500" />
                          <span className={`text-[10px] font-bold ${sig.confidence >= 80 ? 'text-green-400' : sig.confidence >= 60 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {sig.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">{sig.description}</p>
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} className="text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-bold">{sig.impactEstimate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 3: Spread Analysis                                    */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'spreads' && (
            <div className="space-y-6">
              {/* Narrowest / Widest */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ArrowUpDown size={12} /> Narrowest Spread
                  </h4>
                  <p className="text-2xl font-mono font-bold text-green-400">{stats.narrowestSpread.toFixed(2)}%</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {topSpreads[0]?.cardName ?? '—'}
                  </p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ArrowUpDown size={12} /> Widest Spread
                  </h4>
                  <p className="text-2xl font-mono font-bold text-red-400">{stats.widestSpread.toFixed(2)}%</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {[...topSpreads].sort((a, b) => b.spreadPercent - a.spreadPercent)[0]?.cardName ?? '—'}
                  </p>
                </div>
              </div>

              {/* Spread comparison table */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-700 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="col-span-4">Card</div>
                  <div className="col-span-2 text-right">Mid Price</div>
                  <div className="col-span-2 text-right">Spread</div>
                  <div className="col-span-2 text-right">Spread %</div>
                  <div className="col-span-2 text-right">Imbalance</div>
                </div>
                {topSpreads.map((d, i) => (
                  <div
                    key={d.cardId}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center ${i % 2 === 0 ? 'bg-slate-800/20' : ''} hover:bg-slate-700/20 transition-colors`}
                  >
                    <div className="col-span-4 text-xs text-white font-medium truncate">{d.cardName}</div>
                    <div className="col-span-2 text-xs text-slate-300 font-mono text-right">{formatCurrency(d.midPrice)}</div>
                    <div className="col-span-2 text-xs text-cyan-400 font-mono text-right">{formatCurrency(d.spread)}</div>
                    <div className="col-span-2 text-right">
                      <span className={`text-xs font-mono font-bold ${d.spreadPercent < 3 ? 'text-green-400' : d.spreadPercent < 6 ? 'text-amber-400' : 'text-red-400'}`}>
                        {d.spreadPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`text-xs font-mono font-bold ${d.imbalanceRatio > 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {d.imbalanceRatio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Historical spread chart placeholder */}
              <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-8 text-center">
                <Activity size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 font-medium">Historical Spread Chart</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Real-time spread time-series will render here when connected to live data feeds
                </p>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 4: Anomalies                                          */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'anomalies' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                  <ShieldAlert size={24} className="mx-auto text-red-400 mb-2" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Spoofing Alerts</p>
                  <p className="text-2xl font-mono font-bold text-red-400">
                    {anomalies.filter((a) => a.signalType === 'spoofing').length}
                  </p>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-center">
                  <AlertTriangle size={24} className="mx-auto text-orange-400 mb-2" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Wash Trading</p>
                  <p className="text-2xl font-mono font-bold text-orange-400">
                    {anomalies.filter((a) => a.signalType === 'wash-trading').length}
                  </p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center">
                  <Building2 size={24} className="mx-auto text-purple-400 mb-2" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Institutional Dark Pool</p>
                  <p className="text-2xl font-mono font-bold text-purple-400">
                    {instFlow.topCards.length}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{instFlow.percent}% of all flow</p>
                </div>
              </div>

              {/* Anomaly feed */}
              {anomalies.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={12} /> Detected Anomalies
                  </h4>
                  {anomalies.map((a) => {
                    const sc = SIGNAL_COLORS[a.signalType];
                    return (
                      <div
                        key={a.id}
                        className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${sc.text} ${sc.bg} border ${sc.border}`}>
                              {sc.label}
                            </span>
                            <span className="text-xs text-white font-bold">{a.cardName}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${a.confidence >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                            {a.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-2">{a.description}</p>
                        <p className="text-[10px] text-amber-400 font-bold">{a.impactEstimate}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldAlert size={40} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">No anomalies detected</p>
                  <p className="text-[10px] text-slate-600 mt-1">All order flow patterns appear normal</p>
                </div>
              )}

              {/* Institutional flow breakdown */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 size={12} /> Institutional Flow Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total Orders</p>
                    <p className="text-lg font-mono font-bold text-white">{instFlow.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Institutional</p>
                    <p className="text-lg font-mono font-bold text-purple-400">{instFlow.institutionalOrders}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {instFlow.topCards.map((card, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                      <span className="text-xs text-slate-300 truncate max-w-[300px]">{card.cardName}</span>
                      <span className="text-xs font-mono font-bold text-purple-400">{card.count} orders</span>
                    </div>
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

export default MarketMicrostructureModal;
