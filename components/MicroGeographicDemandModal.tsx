import React, { useState, useMemo } from 'react';
import { X, MapPin, Flame, TrendingUp, ArrowRightLeft, Calendar, Globe, BarChart3 } from 'lucide-react';
import { getHotspots, getRegionalTrends, getArbitrageLanes, getLocalEvents } from '../lib/analytics/microGeographicDemandService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MicroGeographicDemandModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('hotspots');

  const hotspots = useMemo(() => getHotspots(), []);
  const regionalTrends = useMemo(() => getRegionalTrends(), []);
  const arbitrageLanes = useMemo(() => getArbitrageLanes(), []);
  const localEvents = useMemo(() => getLocalEvents(), []);

  if (!isOpen) return null;

  const getHeatColor = (level: string) => {
    switch (level) {
      case 'extreme': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-400' };
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', bar: 'bg-orange-400' };
      case 'moderate': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', bar: 'bg-slate-500' };
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'card-show': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' };
      case 'draft': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' };
      case 'hall-of-fame': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' };
      case 'game': return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' };
      case 'convention': return { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' };
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 85) return 'text-emerald-400';
    if (conf >= 70) return 'text-amber-400';
    return 'text-slate-400';
  };

  const extremeCount = hotspots.filter(h => h.heatLevel === 'extreme').length;
  const totalArbitrageValue = arbitrageLanes.reduce((sum, a) => sum + a.priceDiff, 0);
  const avgDensity = Math.round(hotspots.reduce((s, h) => s + h.buyerDensity, 0) / hotspots.length);
  const avgSpend = Math.round(hotspots.reduce((s, h) => s + h.avgSpend, 0) / hotspots.length);

  const tabs = [
    { id: 'hotspots', label: 'Hotspot Map', icon: <Flame size={16} /> },
    { id: 'trends', label: 'Regional Trends', icon: <Globe size={16} /> },
    { id: 'arbitrage', label: 'Arbitrage Lanes', icon: <ArrowRightLeft size={16} /> },
    { id: 'events', label: 'Local Events', icon: <Calendar size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <MapPin size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Micro-Geographic Demand Heatmap</h2>
              <p className="text-xs text-slate-500">Zip-code level buyer concentration mapping with regional trend analysis</p>
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
                  ? 'bg-slate-800/60 text-emerald-400 border-b-2 border-emerald-400'
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
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hotspots</p>
              <p className="text-2xl font-bold text-emerald-400">{hotspots.length}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Extreme Heat</p>
              <p className="text-2xl font-bold text-red-400">{extremeCount}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Density</p>
              <p className="text-2xl font-bold text-emerald-400">{avgDensity}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Spend</p>
              <p className="text-2xl font-bold text-emerald-400">${avgSpend}</p>
            </div>
          </div>

          {/* Hotspot Map Tab */}
          {activeTab === 'hotspots' && (
            <div className="space-y-4">
              {hotspots.map(spot => {
                const hc = getHeatColor(spot.heatLevel);
                return (
                  <div key={spot.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${hc.bg} rounded-lg`}>
                          <MapPin size={18} className={hc.text} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{spot.city}, {spot.state}</h3>
                          <p className="text-xs text-slate-500">ZIP: {spot.zipCode} | {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 ${hc.bg} border ${hc.border} rounded-full text-[10px] font-black ${hc.text} uppercase tracking-widest`}>
                        {spot.heatLevel}
                      </span>
                    </div>

                    {/* Density Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-black uppercase tracking-widest">Buyer Density</span>
                        <span className={`font-bold ${hc.text}`}>{spot.buyerDensity}/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${hc.bar}`} style={{ width: `${spot.buyerDensity}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Spend</p>
                        <p className="text-lg font-bold text-emerald-400">${spot.avgSpend}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Growth</p>
                        <p className={`text-lg font-bold ${spot.growthRate >= 20 ? 'text-emerald-400' : spot.growthRate >= 10 ? 'text-cyan-400' : 'text-amber-400'}`}>
                          +{spot.growthRate}%
                        </p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Density</p>
                        <p className={`text-lg font-bold ${hc.text}`}>{spot.buyerDensity}</p>
                      </div>
                    </div>

                    {/* Top Players */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top Players</p>
                      <div className="flex flex-wrap gap-1.5">
                        {spot.topPlayers.map((player, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-semibold">
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1.5">
                      {spot.topCategories.map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800/60 border border-slate-700/30 rounded-full text-[10px] text-slate-400">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Regional Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              {regionalTrends.map(trend => (
                <div key={trend.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{trend.region}</h3>
                      <p className="text-xs text-slate-500">{trend.states.join(', ')} | Dominant: {trend.dominantSport}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${trend.yoyGrowth >= 15 ? 'text-emerald-400' : trend.yoyGrowth >= 8 ? 'text-cyan-400' : 'text-amber-400'}`}>
                        +{trend.yoyGrowth}%
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">YoY Growth</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Size</p>
                      <p className="text-lg font-bold text-emerald-400">${(trend.marketSize / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dominant Sport</p>
                      <p className="text-lg font-bold text-white">{trend.dominantSport}</p>
                    </div>
                  </div>

                  {/* Trending Players */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp size={10} /> Trending Players
                    </p>
                    {trend.trendingPlayers.map((tp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                        <span className="text-xs font-bold text-white">{tp.player}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500">Demand</p>
                            <p className="text-xs font-bold text-emerald-400">{tp.demandIndex}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500">Local Premium</p>
                            <p className="text-xs font-bold text-amber-400">+{tp.localPremium}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insight */}
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <BarChart3 size={10} /> Unique Insight
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{trend.uniqueInsight}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Arbitrage Lanes Tab */}
          {activeTab === 'arbitrage' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                  <ArrowRightLeft size={14} />
                  {arbitrageLanes.length} active geographic arbitrage lanes with a combined ${totalArbitrageValue} price differential.
                </p>
              </div>
              {arbitrageLanes.map(lane => (
                <div key={lane.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{lane.player}</h3>
                      <p className="text-xs text-slate-500">{lane.card}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">+${lane.priceDiff}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Spread</p>
                    </div>
                  </div>

                  {/* Lane Visual */}
                  <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/30 rounded-xl">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Buy From</p>
                      <p className="text-sm font-bold text-cyan-400">{lane.fromRegion}</p>
                    </div>
                    <ArrowRightLeft size={16} className="text-emerald-400" />
                    <div className="flex-1 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sell To</p>
                      <p className="text-sm font-bold text-amber-400">{lane.toRegion}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Price Diff</p>
                      <p className="text-sm font-bold text-emerald-400">${lane.priceDiff}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Diff %</p>
                      <p className="text-sm font-bold text-emerald-400">+{lane.priceDiffPct}%</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Days</p>
                      <p className="text-sm font-bold text-white">{lane.avgDaysToSell}d</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                      <p className={`text-sm font-bold ${getConfidenceColor(lane.confidence)}`}>{lane.confidence}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Local Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                  <Calendar size={14} />
                  Upcoming local events that will impact regional demand patterns.
                </p>
              </div>
              {localEvents.map(event => {
                const ec = getEventTypeColor(event.type);
                return (
                  <div key={event.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{event.event}</h3>
                        <p className="text-xs text-slate-500">{event.city} | {event.date}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 ${ec.bg} border ${ec.border} rounded-full text-[10px] font-black ${ec.text} uppercase tracking-widest`}>
                        {event.type.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Demand Spike</p>
                        <p className="text-xl font-bold text-red-400">+{event.expectedDemandSpike}%</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact Radius</p>
                        <p className="text-sm font-bold text-emerald-400">{event.radius}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-sm font-bold text-white">{event.date}</p>
                      </div>
                    </div>

                    {/* Affected Players */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Affected Players</p>
                      <div className="flex flex-wrap gap-1.5">
                        {event.affectedPlayers.map((player, i) => (
                          <span key={i} className={`px-2.5 py-1 ${ec.bg} border ${ec.border} rounded-full text-xs ${ec.text} font-semibold`}>
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicroGeographicDemandModal;
