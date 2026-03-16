import React, { useState, useMemo } from 'react';
import {
  X,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Percent,
  Target,
  Star,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Hash,
  Info,
} from 'lucide-react';
import {
  getBreaks,
  getProducts,
  getRoiTrends,
  getBreakStats,
} from '../lib/waxBreakRoiTrackerService';
import type {
  WaxBreak,
  BreakProduct,
  RoiTrend,
  BreakStats,
  HitType,
} from '../lib/waxBreakRoiTrackerService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const hitTypeColors: Record<HitType, string> = {
  auto: 'text-purple-400 bg-purple-500/20',
  relic: 'text-amber-400 bg-amber-500/20',
  numbered: 'text-red-400 bg-red-500/20',
  parallel: 'text-blue-400 bg-blue-500/20',
  insert: 'text-cyan-400 bg-cyan-500/20',
  base: 'text-slate-400 bg-slate-500/20',
  sp: 'text-green-400 bg-green-500/20',
  ssp: 'text-emerald-400 bg-emerald-500/20',
  '1-of-1': 'text-yellow-400 bg-yellow-500/20',
};

type Tab = 'breaks' | 'products' | 'trends' | 'stats';

const WaxBreakRoiTrackerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('breaks');
  const [expandedBreak, setExpandedBreak] = useState<string | null>(null);

  const breaks = useMemo(() => getBreaks(), []);
  const products = useMemo(() => getProducts(), []);
  const trends = useMemo(() => getRoiTrends(), []);
  const stats = useMemo(() => getBreakStats(), []);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'breaks', label: 'Break Log', icon: <Package size={16} /> },
    { id: 'products', label: 'Products', icon: <Layers size={16} /> },
    { id: 'trends', label: 'ROI Trends', icon: <TrendingUp size={16} /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-charcoal border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20">
              <Package size={22} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Wax Break ROI Tracker</h2>
              <p className="text-xs text-slate-400">Track ROI from sealed wax breaks with hit logging and EV analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-3 p-4 border-b border-slate-700/50 bg-slate-800/30">
          {[
            { label: 'Total Breaks', value: stats.totalBreaks.toString(), icon: <Package size={14} />, color: 'text-violet-400' },
            { label: 'Total Spent', value: `$${stats.totalSpent.toLocaleString()}`, icon: <DollarSign size={14} />, color: 'text-slate-400' },
            { label: 'Overall ROI', value: `${stats.overallRoiPercent >= 0 ? '+' : ''}${stats.overallRoiPercent.toFixed(1)}%`, icon: <Percent size={14} />, color: stats.overallRoiPercent >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'Best Break', value: `+${stats.bestBreakRoi}%`, icon: <Star size={14} />, color: 'text-green-400' },
            { label: 'Profitable Rate', value: `${(stats.profitableBreakRate * 100).toFixed(0)}%`, icon: <Target size={14} />, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${stat.color}`}>
                {stat.icon} {stat.label}
              </div>
              <div className="text-base font-bold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-700/50 text-violet-400 border-b-2 border-violet-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'breaks' && (
            <div className="space-y-3">
              {breaks.map(brk => (
                <div key={brk.id} className={`border rounded-xl transition-all ${
                  brk.roi >= 0 ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                }`}>
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedBreak(expandedBreak === brk.id ? null : brk.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{brk.date}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-300 capitalize">{brk.breakType.replace('-', ' ')}</span>
                        <span className="text-xs text-slate-400">{brk.sport}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${brk.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {brk.roiPercent >= 0 ? '+' : ''}{brk.roiPercent.toFixed(1)}%
                        </span>
                        {expandedBreak === brk.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">{brk.product}</h3>
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div><span className="text-slate-500">Cost</span><div className="text-slate-300 font-medium">${brk.cost}</div></div>
                      <div><span className="text-slate-500">Hits Value</span><div className="text-slate-300 font-medium">${brk.totalHitsValue}</div></div>
                      <div><span className="text-slate-500">ROI</span><div className={`font-medium ${brk.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{brk.roi >= 0 ? '+' : ''}${brk.roi}</div></div>
                      <div><span className="text-slate-500">Hits</span><div className="text-slate-300 font-medium">{brk.hits.length}</div></div>
                    </div>
                    {brk.notes && <p className="mt-2 text-[11px] text-slate-500 italic">{brk.notes}</p>}
                  </div>

                  {expandedBreak === brk.id && (
                    <div className="border-t border-slate-700/30 p-4">
                      <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">Hits</h4>
                      <div className="space-y-2">
                        {brk.hits.map(hit => (
                          <div key={hit.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${hitTypeColors[hit.hitType]}`}>
                                {hit.hitType.toUpperCase()}
                              </span>
                              <span className="text-slate-200">{hit.cardName}</span>
                              {hit.numbered && <span className="text-xs text-red-400 font-medium">{hit.numbered}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              {hit.sold && <span className="text-[10px] text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">SOLD ${hit.soldPrice}</span>}
                              <span className="text-slate-200 font-medium">${hit.estimatedValue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">Product performance ranked by average ROI</span>
              </div>
              {[...products].sort((a, b) => b.avgRoiPercent - a.avgRoiPercent).map((p, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-200">{p.name}</h4>
                    <span className={`text-lg font-bold ${p.avgRoiPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.avgRoiPercent >= 0 ? '+' : ''}{p.avgRoiPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3 text-xs">
                    <div><span className="text-slate-500">Avg Cost</span><div className="text-slate-300 font-medium">${p.avgCost}</div></div>
                    <div><span className="text-slate-500">Avg ROI</span><div className={`font-medium ${p.avgRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>${p.avgRoi}</div></div>
                    <div><span className="text-slate-500">Breaks</span><div className="text-slate-300 font-medium">{p.breakCount}</div></div>
                    <div><span className="text-slate-500">Hit Rate</span><div className="text-slate-300 font-medium">{(p.hitRate * 100).toFixed(0)}%</div></div>
                    <div><span className="text-slate-500">Best Hit</span><div className="text-violet-400 font-medium truncate" title={p.bestHit}>${p.bestHitValue}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">Monthly ROI trends over the last 6 months</span>
              </div>
              {trends.map((t, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">{t.month}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{t.breakCount} breaks</span>
                      <span className={`text-base font-bold ${t.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.roi >= 0 ? '+' : ''}${t.roi}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spent</span>
                      <span className="text-red-400">${t.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Return</span>
                      <span className="text-green-400">${t.totalReturn.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.roi >= 0 ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                      style={{ width: `${Math.min(100, (t.totalReturn / Math.max(t.totalSpent, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Spent', value: `$${stats.totalSpent.toLocaleString()}`, icon: <DollarSign size={16} />, color: 'text-slate-400' },
                { label: 'Total Return', value: `$${stats.totalReturn.toLocaleString()}`, icon: <TrendingUp size={16} />, color: 'text-green-400' },
                { label: 'Net ROI', value: `$${stats.overallRoi.toLocaleString()}`, icon: <Percent size={16} />, color: stats.overallRoi >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'ROI %', value: `${stats.overallRoiPercent.toFixed(1)}%`, icon: <BarChart3 size={16} />, color: stats.overallRoiPercent >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Best Break ROI', value: `+${stats.bestBreakRoi}%`, icon: <Star size={16} />, color: 'text-green-400' },
                { label: 'Worst Break ROI', value: `${stats.worstBreakRoi}%`, icon: <AlertCircle size={16} />, color: 'text-red-400' },
                { label: 'Avg Hits/Break', value: stats.avgHitsPerBreak.toFixed(1), icon: <Zap size={16} />, color: 'text-violet-400' },
                { label: 'Profitable %', value: `${(stats.profitableBreakRate * 100).toFixed(0)}%`, icon: <Target size={16} />, color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                  <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
                    {stat.icon}
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/30">
          <span className="text-xs text-slate-500">Values are estimates based on current market comps</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm text-white font-semibold transition-colors">
              Log Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaxBreakRoiTrackerModal;
