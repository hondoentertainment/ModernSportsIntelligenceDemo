import React, { useState, useMemo } from 'react';
import { X, Network, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { getNodes, getEdges, getSpillovers, getIndex } from '../lib/crossHobbyContagionService';

interface Props { isOpen: boolean; onClose: () => void; }

const CrossHobbyContagionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('network');
  const nodes = useMemo(() => getNodes(), []);
  const edges = useMemo(() => getEdges(), []);
  const spillovers = useMemo(() => getSpillovers(), []);
  const indexData = useMemo(() => getIndex(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'network', label: 'Hobby Network', count: nodes.length },
    { id: 'edges', label: 'Contagion Edges', count: edges.length },
    { id: 'spillovers', label: 'Spillover Events', count: spillovers.length },
    { id: 'index', label: 'Index Tracker', count: indexData.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20"><Network size={20} className="text-purple-400" /></div>
            <div><h2 className="text-lg font-bold text-white">Cross-Hobby Contagion Network</h2><p className="text-xs text-slate-400">Track trend propagation across collectible hobbies</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-700/50 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${activeTab === t.id ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t.label} <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px]">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'network' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map(n => (
                <div key={n.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: n.color }} />
                      <h3 className="text-sm font-bold text-white">{n.name}</h3>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${n.growth30d >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {n.growth30d >= 0 ? '+' : ''}{n.growth30d}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div><p className="text-[9px] text-slate-500">Market Cap</p><p className="text-xs font-bold text-white">${(n.marketCap / 1e9).toFixed(1)}B</p></div>
                    <div><p className="text-[9px] text-slate-500">Sentiment</p><p className={`text-xs font-bold ${n.sentimentScore >= 70 ? 'text-emerald-400' : n.sentimentScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{n.sentimentScore}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {n.topAssets.map((a, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'edges' && edges.map(e => (
            <div key={e.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-white">{e.sourceHobby}</span>
                <ArrowRight size={14} className={e.direction === 'positive' ? 'text-emerald-400' : e.direction === 'negative' ? 'text-red-400' : 'text-amber-400'} />
                <span className="text-sm font-bold text-white">{e.targetHobby}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${e.direction === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : e.direction === 'negative' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{e.direction}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div><p className="text-[9px] text-slate-500">Correlation</p><p className="text-xs font-bold text-white">{(e.correlationStrength * 100).toFixed(0)}%</p></div>
                <div><p className="text-[9px] text-slate-500">Lag Time</p><p className="text-xs font-bold text-white">{e.lagDays} days</p></div>
              </div>
              <p className="text-[10px] text-slate-400 mb-1">{e.mechanism}</p>
              <p className="text-[10px] text-purple-300 italic">{e.recentExample}</p>
            </div>
          ))}

          {activeTab === 'spillovers' && spillovers.map(s => (
            <div key={s.id} className={`bg-slate-800/50 rounded-xl p-4 border ${s.type === 'bullish' ? 'border-emerald-500/30' : s.type === 'bearish' ? 'border-red-500/30' : 'border-amber-500/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{s.trigger}</h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.type === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : s.type === 'bearish' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{s.type}</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] text-slate-500">Origin:</span><span className="text-[9px] font-bold text-white">{s.originHobby}</span>
                <ArrowRight size={10} className="text-slate-600" />
                <span className="text-[9px] font-bold text-white">{s.affectedHobbies.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                {s.priceImpact.map((p, i) => (
                  <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full ${p.impact >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {p.hobby}: {p.impact >= 0 ? '+' : ''}{p.impact}%
                  </span>
                ))}
              </div>
            </div>
          ))}

          {activeTab === 'index' && (
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-3 mb-4">
                {nodes.slice(0, 5).map(n => {
                  const latest = indexData[0];
                  const key = n.category === 'sports-cards' ? 'sportsCards' : n.category === 'pokemon-tcg' ? 'pokemon' : n.category === 'memorabilia' ? 'memorabilia' : n.category === 'sneakers' ? 'sneakers' : 'comics';
                  const val = latest[key as keyof typeof latest] as number;
                  return (
                    <div key={n.id} className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: n.color }} />
                      <p className="text-[9px] text-slate-500">{n.name}</p>
                      <p className={`text-lg font-bold ${val >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{val}</p>
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-[10px] text-slate-500 mb-3">7-Week Index History (Base = 100)</p>
                {indexData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-700/30 last:border-0">
                    <span className="text-[9px] text-slate-500 w-20">{d.date}</span>
                    <span className={`text-[9px] font-bold w-12 ${d.sportsCards >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.sportsCards}</span>
                    <span className={`text-[9px] font-bold w-12 ${d.pokemon >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.pokemon}</span>
                    <span className={`text-[9px] font-bold w-12 ${d.comics >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.comics}</span>
                    <span className={`text-[9px] font-bold w-12 ${d.memorabilia >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.memorabilia}</span>
                    <span className={`text-[9px] font-bold w-12 ${d.sneakers >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{d.sneakers}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossHobbyContagionModal;
