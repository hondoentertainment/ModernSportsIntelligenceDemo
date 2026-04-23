// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { X, Zap, TrendingUp, TrendingDown, Clock, Star, Hash, ArrowUpRight } from 'lucide-react';
import { getPicks } from '../lib/utils/draftNightTrackerService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DraftNightTrackerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('picks');

  const picks = useMemo(() => getPicks(), []);

  if (!isOpen) return null;

  const getPickTierColor = (pick: number) => {
    if (pick <= 5) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' };
    if (pick <= 14) return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
    return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const tabs = [
    { id: 'picks', label: 'Live Picks', icon: <Zap size={16} />, count: picks.length },
    { id: 'reactions', label: 'Price Reactions', icon: <TrendingUp size={16} />, count: picks.filter((p: any) => p.priceChange).length },
  ];

  const topPicks = picks.filter((p: any) => (p.pickNumber || 99) <= 5).length;
  const avgPriceChange = (picks.reduce((sum: number, p: any) => sum + (p.priceChange || 0), 0) / picks.length).toFixed(1);
  const totalVolume = picks.reduce((sum: number, p: any) => sum + (p.tradingVolume || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl">
              <Zap size={24} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Draft Night Tracker</h2>
              <p className="text-xs text-slate-500">Real-time draft pick tracking and card price reactions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-yellow-500/20">
            <p className="text-xs text-slate-500">Lottery Picks</p>
            <p className="text-lg font-bold text-yellow-400">{topPicks}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Price Reaction</p>
            <p className={`text-lg font-bold ${getPriceChangeColor(Number(avgPriceChange))}`}>{Number(avgPriceChange) > 0 ? '+' : ''}{avgPriceChange}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Trading Volume</p>
            <p className="text-lg font-bold text-white">${(totalVolume / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-yellow-400 bg-slate-800/50 border-b-2 border-yellow-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700/50">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'picks' && (
            <div className="grid gap-4">
              {picks.map((pick: any, idx: number) => {
                const tier = getPickTierColor(pick.pickNumber || idx + 1);
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Hash size={18} className="text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400 absolute">{pick.pickNumber || idx + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{pick.playerName || `Player ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{pick.team || 'TBD'} • {pick.position || 'G'} • {pick.school || 'University'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${tier.bg} ${tier.border} ${tier.text}`}>
                        Pick #{pick.pickNumber || idx + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Rookie Card</p>
                        <p className="text-sm font-bold text-yellow-400">${(pick.rookieCardPrice || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Price Change</p>
                        <p className={`text-sm font-bold ${getPriceChangeColor(pick.priceChange || 0)}`}>
                          {(pick.priceChange || 0) > 0 ? '+' : ''}{pick.priceChange || 0}%
                        </p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Volume</p>
                        <p className="text-sm font-bold text-white">{pick.tradingVolume || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Consensus</p>
                        <p className="text-sm font-bold text-blue-400">{pick.consensusRank || '—'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'reactions' && (
            <div className="grid gap-4">
              {picks.filter((p: any) => p.priceChange !== undefined).map((pick: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">#{pick.pickNumber || idx + 1} {pick.playerName || `Player ${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      {(pick.priceChange || 0) >= 0 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
                      <span className={`text-sm font-bold ${getPriceChangeColor(pick.priceChange || 0)}`}>
                        {(pick.priceChange || 0) > 0 ? '+' : ''}{pick.priceChange || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Market Reaction Intensity</span>
                      <span className="text-yellow-400">{pick.reactionIntensity || 65}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-yellow-500 rounded-full h-2 transition-all" style={{ width: `${pick.reactionIntensity || 65}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Pre-Draft</p>
                      <p className="text-sm font-bold text-slate-400">${pick.preDraftPrice || 0}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Post-Draft</p>
                      <p className="text-sm font-bold text-yellow-400">${pick.rookieCardPrice || 0}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Peak</p>
                      <p className="text-sm font-bold text-emerald-400">${pick.peakPrice || 0}</p>
                    </div>
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

export default DraftNightTrackerModal;
