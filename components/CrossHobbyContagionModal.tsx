// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { X, Network, TrendingUp, TrendingDown, ArrowRight, Zap, BarChart3, GitBranch, Activity } from 'lucide-react';
import { getNodes, getEdges, getSpillovers, getIndex } from '../lib/utils/crossHobbyContagionService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CrossHobbyContagionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('network');

  const nodes = useMemo(() => getNodes(), []);
  const edges = useMemo(() => getEdges(), []);
  const spillovers = useMemo(() => getSpillovers(), []);
  const indexData = useMemo(() => getIndex(), []);

  if (!isOpen) return null;

  const getDirectionColor = (dir: string) => {
    switch (dir) {
      case 'positive': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'negative': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      default: return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    }
  };

  const getSpilloverTypeColor = (type: string) => {
    switch (type) {
      case 'bullish': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'bearish': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      case 'rotation': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 45) return 'text-amber-400';
    return 'text-red-400';
  };

  const getCorrelationBarColor = (strength: number) => {
    if (strength >= 0.65) return 'bg-purple-400';
    if (strength >= 0.45) return 'bg-purple-500';
    return 'bg-slate-500';
  };

  const totalMarketCap = nodes.reduce((sum, n) => sum + n.marketCap, 0);
  const avgSentiment = Math.round(nodes.reduce((sum, n) => sum + n.sentimentScore, 0) / nodes.length);
  const growingHobbies = nodes.filter(n => n.growth30d > 0).length;

  const tabs = [
    { id: 'network', label: 'Hobby Network', icon: <Network size={16} /> },
    { id: 'edges', label: 'Contagion Edges', icon: <GitBranch size={16} /> },
    { id: 'spillovers', label: 'Spillover Events', icon: <Zap size={16} /> },
    { id: 'index', label: 'Index Tracker', icon: <Activity size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Network size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cross-Hobby Contagion Network</h2>
              <p className="text-xs text-slate-500">Track trend propagation between collectible hobbies and markets</p>
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
                  ? 'bg-slate-800/60 text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stat Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Market Cap</p>
              <p className="text-2xl font-bold text-purple-400">${(totalMarketCap / 1e9).toFixed(1)}B</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tracked Hobbies</p>
              <p className="text-2xl font-bold text-purple-400">{nodes.length}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Growing</p>
              <p className="text-2xl font-bold text-emerald-400">{growingHobbies}/{nodes.length}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Sentiment</p>
              <p className={`text-2xl font-bold ${getSentimentColor(avgSentiment)}`}>{avgSentiment}</p>
            </div>
          </div>

          {/* Hobby Network Tab */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nodes.map(node => (
                  <div key={node.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: node.color }} />
                        <div>
                          <h3 className="text-sm font-bold text-white">{node.name}</h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{node.category}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${node.growth30d >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {node.growth30d >= 0 ? '+' : ''}{node.growth30d}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Cap</p>
                        <p className="text-sm font-bold text-purple-400">${(node.marketCap / 1e9).toFixed(1)}B</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">30d Growth</p>
                        <p className={`text-sm font-bold ${node.growth30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {node.growth30d >= 0 ? '+' : ''}{node.growth30d}%
                        </p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sentiment</p>
                        <p className={`text-sm font-bold ${getSentimentColor(node.sentimentScore)}`}>{node.sentimentScore}</p>
                      </div>
                    </div>

                    {/* Sentiment Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-black uppercase tracking-widest">Sentiment Score</span>
                        <span className={`font-bold ${getSentimentColor(node.sentimentScore)}`}>{node.sentimentScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.sentimentScore >= 70 ? 'bg-emerald-400' : node.sentimentScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${node.sentimentScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Top Assets */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top Assets</p>
                      <div className="flex flex-wrap gap-1.5">
                        {node.topAssets.map((asset, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md text-[10px] font-semibold text-purple-400">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contagion Edges Tab */}
          {activeTab === 'edges' && (
            <div className="space-y-4">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                <p className="text-xs text-purple-400 font-semibold flex items-center gap-2">
                  <GitBranch size={14} />
                  {edges.length} cross-hobby contagion pathways mapped. Lag times indicate prediction windows.
                </p>
              </div>
              {edges.map(edge => {
                const dc = getDirectionColor(edge.direction);
                return (
                  <div key={edge.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-white">{edge.sourceHobby}</span>
                        <ArrowRight size={16} className={dc.text} />
                        <span className="text-sm font-bold text-white">{edge.targetHobby}</span>
                        <span className={`px-2.5 py-0.5 ${dc.bg} border ${dc.border} rounded-full text-[10px] font-black ${dc.text} uppercase tracking-widest`}>
                          {edge.direction}
                        </span>
                      </div>
                    </div>

                    {/* Correlation Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-black uppercase tracking-widest">Correlation Strength</span>
                        <span className="font-bold text-purple-400">{(edge.correlationStrength * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getCorrelationBarColor(edge.correlationStrength)}`} style={{ width: `${edge.correlationStrength * 100}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Correlation</p>
                        <p className="text-lg font-bold text-purple-400">{(edge.correlationStrength * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lag Time</p>
                        <p className="text-lg font-bold text-purple-400">{edge.lagDays} days</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mechanism</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{edge.mechanism}</p>
                    </div>

                    <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Recent Example</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{edge.recentExample}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spillover Events Tab */}
          {activeTab === 'spillovers' && (
            <div className="space-y-4">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                <p className="text-xs text-purple-400 font-semibold flex items-center gap-2">
                  <Zap size={14} />
                  Recent cross-hobby spillover events with measured price impacts.
                </p>
              </div>
              {spillovers.map(sp => {
                const sc = getSpilloverTypeColor(sp.type);
                return (
                  <div key={sp.id} className={`bg-slate-800/30 border ${sc.border} rounded-2xl p-5 space-y-4`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{sp.trigger}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{sp.date} | Origin: {sp.originHobby}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 ${sc.bg} border ${sc.border} rounded-full text-[10px] font-black ${sc.text} uppercase tracking-widest`}>
                          {sp.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{sp.description}</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Magnitude</p>
                        <p className="text-lg font-bold text-purple-400">{sp.magnitude}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Affected</p>
                        <p className="text-lg font-bold text-purple-400">{sp.affectedHobbies.length} hobbies</p>
                      </div>
                    </div>

                    {/* Flow Visual */}
                    <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/30 rounded-xl">
                      <div className="text-center flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin</p>
                        <p className="text-xs font-bold text-white">{sp.originHobby}</p>
                      </div>
                      <ArrowRight size={16} className={sc.text} />
                      <div className="text-center flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Affected</p>
                        <p className="text-xs font-bold text-white">{sp.affectedHobbies.join(', ')}</p>
                      </div>
                    </div>

                    {/* Price Impact */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price Impact</p>
                      <div className="flex gap-2 flex-wrap">
                        {sp.priceImpact.map((p, i) => (
                          <div key={i} className={`px-3 py-2 rounded-lg ${p.impact >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            <p className="text-[10px] text-slate-500">{p.hobby}</p>
                            <p className={`text-sm font-bold ${p.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {p.impact >= 0 ? '+' : ''}{p.impact}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Index Tracker Tab */}
          {activeTab === 'index' && (
            <div className="space-y-4">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                <p className="text-xs text-purple-400 font-semibold flex items-center gap-2">
                  <BarChart3 size={14} />
                  Cross-hobby index tracking. Base = 100 (Feb 1, 2026).
                </p>
              </div>

              {/* Current Values */}
              <div className="grid grid-cols-5 gap-3">
                {nodes.slice(0, 5).map(n => {
                  const latest = indexData[0];
                  const keyMap: Record<string, string> = {
                    'sports-cards': 'sportsCards',
                    'pokemon-tcg': 'pokemon',
                    'comics': 'comics',
                    'memorabilia': 'memorabilia',
                    'sneakers': 'sneakers',
                  };
                  const key = keyMap[n.category] || 'sportsCards';
                  const val = latest[key as keyof typeof latest] as number;
                  return (
                    <div key={n.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
                      <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: n.color }} />
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{n.name}</p>
                      <p className={`text-2xl font-bold ${val >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{val}</p>
                      <p className={`text-[10px] font-bold ${val >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {val >= 100 ? '+' : ''}{val - 100}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Index History Table */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-purple-400" />
                  7-Week Index History
                </p>
                <div className="overflow-x-auto">
                  {/* Header */}
                  <div className="flex items-center gap-3 py-2 border-b border-slate-700/50 mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">Date</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-20 text-center">Sports</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-20 text-center">Pokemon</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-20 text-center">Comics</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-20 text-center">Memo</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-20 text-center">Sneakers</span>
                  </div>
                  {indexData.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700/20 last:border-0">
                      <span className="text-xs text-slate-400 w-24">{d.date}</span>
                      <span className={`text-xs font-bold w-20 text-center ${d.sportsCards >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.sportsCards}</span>
                      <span className={`text-xs font-bold w-20 text-center ${d.pokemon >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.pokemon}</span>
                      <span className={`text-xs font-bold w-20 text-center ${d.comics >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.comics}</span>
                      <span className={`text-xs font-bold w-20 text-center ${d.memorabilia >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.memorabilia}</span>
                      <span className={`text-xs font-bold w-20 text-center ${d.sneakers >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.sneakers}</span>
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

export default CrossHobbyContagionModal;
