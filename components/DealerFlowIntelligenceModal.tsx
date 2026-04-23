// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { X, Briefcase, TrendingUp, TrendingDown, ArrowRightLeft, BarChart3, AlertCircle, Package } from 'lucide-react';
import { getDealers, getFlowEvents, getAccumulationSignals } from '../lib/analytics/dealerFlowIntelligenceService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DealerFlowIntelligenceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('dealers');

  const dealers = useMemo(() => getDealers(), []);
  const flowEvents = useMemo(() => getFlowEvents(), []);
  const signals = useMemo(() => getAccumulationSignals(), []);

  if (!isOpen) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mega-dealer': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
      case 'auction-house': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
      case 'online-only': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
      case 'breaker': return { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'bearish': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
    }
  };

  const getFlowTypeColor = (type: string) => {
    switch (type) {
      case 'accumulation': return 'text-emerald-400';
      case 'distribution': return 'text-red-400';
      case 'consignment-in': return 'text-blue-400';
      case 'consignment-out': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 95) return 'text-emerald-400';
    if (score >= 90) return 'text-cyan-400';
    if (score >= 85) return 'text-amber-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'dealers', label: 'Dealer Profiles', icon: <Briefcase size={16} /> },
    { id: 'flows', label: 'Flow Events', icon: <ArrowRightLeft size={16} /> },
    { id: 'signals', label: 'Accumulation Signals', icon: <BarChart3 size={16} /> },
  ];

  const totalInventory = dealers.reduce((sum, d) => sum + d.inventorySize, 0);
  const bullishFlows = flowEvents.filter(f => f.signal === 'bullish').length;
  const avgTrust = Math.round(dealers.reduce((sum, d) => sum + d.trustScore, 0) / dealers.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Briefcase size={24} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Dealer Flow Intelligence</h2>
              <p className="text-xs text-slate-500">Wholesale dealer inventory movement and institutional accumulation tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800/60 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stat Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tracked Dealers</p>
              <p className="text-2xl font-bold text-amber-400">{dealers.length}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Inventory</p>
              <p className="text-2xl font-bold text-amber-400">{(totalInventory / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bullish Flows</p>
              <p className="text-2xl font-bold text-emerald-400">{bullishFlows}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Trust</p>
              <p className={`text-2xl font-bold ${getTrustColor(avgTrust)}`}>{avgTrust}</p>
            </div>
          </div>

          {/* Dealer Profiles Tab */}
          {activeTab === 'dealers' && (
            <div className="space-y-4">
              {dealers.map(dealer => {
                const tc = getTypeColor(dealer.type);
                return (
                  <div key={dealer.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{dealer.name}</h3>
                          <span className={`px-2.5 py-0.5 ${tc.bg} border ${tc.border} rounded-full text-[10px] font-black ${tc.text} uppercase tracking-widest`}>
                            {dealer.type}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {dealer.specialties.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-800/60 border border-slate-700/30 rounded-md text-[10px] text-slate-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getTrustColor(dealer.trustScore)}`}>{dealer.trustScore}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Trust</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inventory</p>
                        <p className="text-sm font-bold text-amber-400">{dealer.inventorySize.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Turnover</p>
                        <p className="text-sm font-bold text-amber-400">{dealer.avgTurnover} days</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Flow 30d</p>
                        <p className={`text-sm font-bold ${dealer.netFlow30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {dealer.netFlow30d >= 0 ? '+' : ''}{dealer.netFlow30d.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <TrendingUp size={12} /> Accumulating
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {dealer.accumulating.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-semibold text-emerald-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <TrendingDown size={12} /> Distributing
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {dealer.distributing.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-semibold text-red-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Flow Events Tab */}
          {activeTab === 'flows' && (
            <div className="space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-2">
                  <AlertCircle size={14} />
                  Tracking {flowEvents.length} recent dealer flow events. Bullish accumulation patterns dominate.
                </p>
              </div>
              {flowEvents.map(event => {
                const sc = getSignalColor(event.signal);
                return (
                  <div key={event.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{event.player}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text} border ${sc.border}`}>
                            {event.signal}
                          </span>
                          <span className={`text-xs font-semibold ${getFlowTypeColor(event.type)}`}>
                            {event.type.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{event.cardDescription}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-amber-400">${event.estimatedValue.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">Est. Value</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dealer</p>
                        <p className="text-xs font-semibold text-slate-300">{event.dealerName}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Quantity</p>
                        <p className="text-xs font-bold text-amber-400">{event.quantity}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                        <p className="text-xs font-bold text-cyan-400">{event.confidence}%</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-xs font-semibold text-slate-300">{event.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Accumulation Signals Tab */}
          {activeTab === 'signals' && (
            <div className="space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-2">
                  <Package size={14} />
                  Multi-dealer accumulation signals indicate institutional conviction.
                </p>
              </div>
              {signals.map((signal, idx) => (
                <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{signal.player}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{signal.topDealers.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">{signal.signalStrength}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Signal</p>
                    </div>
                  </div>

                  {/* Signal Strength Bar */}
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${signal.signalStrength >= 85 ? 'bg-amber-400' : signal.signalStrength >= 70 ? 'bg-amber-500' : 'bg-slate-400'}`}
                      style={{ width: `${signal.signalStrength}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dealers</p>
                      <p className="text-sm font-bold text-amber-400">{signal.dealerCount}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Qty</p>
                      <p className="text-sm font-bold text-amber-400">{signal.totalQuantity}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Price</p>
                      <p className="text-sm font-bold text-amber-400">${signal.avgPrice}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">7d Change</p>
                      <p className={`text-sm font-bold ${signal.priceChange7d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {signal.priceChange7d >= 0 ? '+' : ''}{signal.priceChange7d}%
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Interpretation</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{signal.interpretation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerFlowIntelligenceModal;
