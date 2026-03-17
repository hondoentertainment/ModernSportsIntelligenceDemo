import React, { useState, useMemo } from 'react';
import {
  Ghost,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Eye,
  Target,
  Zap,
  BarChart3,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  getPhantomAcquisitions,
  getPhantomSummary,
  getBehavioralPatterns,
  getOpportunityCostStats,
  getReasonLabel,
  getReasonColor,
  getActionLabel,
} from '../lib/opportunityCostService';

const OpportunityCostPhantom: React.FC = () => {
  const acquisitions = useMemo(() => getPhantomAcquisitions(), []);
  const summary = useMemo(() => getPhantomSummary(), []);
  const patterns = useMemo(() => getBehavioralPatterns(), []);
  const stats = useMemo(() => getOpportunityCostStats(), []);
  const [viewFilter, setViewFilter] = useState<'all' | 'regrets' | 'dodges'>('all');
  const [activeTab, setActiveTab] = useState<'phantom' | 'patterns' | 'analysis'>('phantom');

  const filtered = viewFilter === 'all' ? acquisitions :
    viewFilter === 'regrets' ? acquisitions.filter(a => !a.isBulletDodged) :
    acquisitions.filter(a => a.isBulletDodged);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Ghost size={22} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Opportunity Cost Phantom Portfolio</h1>
              <p className="text-slate-400 text-sm">
                Track the road not taken — every card you viewed, bid on, or passed on
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Ghost size={16} className="text-purple-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Phantom Cards</span>
            </div>
            <p className="text-white font-bold text-3xl">{summary.totalPhantomCards}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Missed Gains</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">${summary.totalMissedGains.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Bullets Dodged</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{summary.totalBulletsDodged}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Instinct Accuracy</span>
            </div>
            <p className="text-white font-bold text-3xl">{summary.instinctAccuracy}%</p>
          </div>
        </div>

        {/* Real vs Phantom Comparison */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/50 rounded-xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-purple-400" />
            Real Portfolio vs Phantom Portfolio
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-slate-500 text-[10px] uppercase mb-1">Real Return</p>
              <p className={`text-3xl font-bold ${summary.realPortfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.realPortfolioReturn >= 0 ? '+' : ''}{summary.realPortfolioReturn}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-[10px] uppercase mb-1">Phantom Return</p>
              <p className={`text-3xl font-bold ${summary.phantomPortfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.phantomPortfolioReturn >= 0 ? '+' : ''}{summary.phantomPortfolioReturn}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-[10px] uppercase mb-1">Regret-Adjusted Alpha</p>
              <p className={`text-3xl font-bold ${summary.regretAdjustedAlpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.regretAdjustedAlpha >= 0 ? '+' : ''}{summary.regretAdjustedAlpha}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-[10px] uppercase mb-1">Dodged Losses</p>
              <p className="text-green-400 text-3xl font-bold">${summary.totalDodgedLosses.toLocaleString()}</p>
            </div>
          </div>

          {summary.biggestMiss && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-xs font-bold uppercase mb-1">Biggest Miss</p>
                <p className="text-white text-sm font-semibold">{summary.biggestMiss.card}</p>
                <p className="text-red-400 text-sm">+${summary.biggestMiss.gain.toLocaleString()} left on table</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 text-xs font-bold uppercase mb-1">Best Dodge</p>
                <p className="text-white text-sm font-semibold">{summary.biggestDodge.card}</p>
                <p className="text-green-400 text-sm">-${summary.biggestDodge.loss.toLocaleString()} avoided</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['phantom', 'patterns', 'analysis'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {tab === 'phantom' ? 'Phantom Cards' : tab === 'patterns' ? 'Behavioral Patterns' : 'Reason Analysis'}
            </button>
          ))}
        </div>

        {activeTab === 'phantom' && (
          <>
            {/* View Filter */}
            <div className="flex gap-2">
              {(['all', 'regrets', 'dodges'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setViewFilter(f)}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                    viewFilter === f ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  {f === 'all' ? `All (${acquisitions.length})` : f === 'regrets' ? `Missed (${acquisitions.filter(a => !a.isBulletDodged).length})` : `Dodged (${acquisitions.filter(a => a.isBulletDodged).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map(acq => (
                <div key={acq.id} className={`bg-slate-900 rounded-xl border p-5 ${
                  acq.isBulletDodged ? 'border-green-500/30' : acq.priceChange > 20 ? 'border-red-500/30' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        acq.isBulletDodged ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {acq.isBulletDodged ? <Shield size={20} className="text-green-400" /> : <Ghost size={20} className="text-red-400" />}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">{acq.cardName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getReasonColor(acq.reason)}`}>
                            {getReasonLabel(acq.reason)}
                          </span>
                          <span>{getActionLabel(acq.action)}</span>
                          <span>{acq.viewedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Then</p>
                          <p className="text-white font-bold">${acq.priceAtViewing.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Now</p>
                          <p className="text-white font-bold">${acq.currentPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Change</p>
                          <p className={`font-bold ${acq.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {acq.priceChange >= 0 ? '+' : ''}{acq.priceChange}%
                          </p>
                        </div>
                      </div>
                      <p className={`text-xs font-bold mt-1 ${
                        acq.isBulletDodged ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {acq.isBulletDodged
                          ? `Dodged $${Math.abs(acq.wouldHaveLost).toLocaleString()} loss`
                          : `Missed $${acq.wouldHaveGained.toLocaleString()} gain`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {patterns.map((p, i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-sm">{p.pattern}</h4>
                    <p className="text-slate-400 text-xs mt-1">{p.recommendation}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-red-400 font-bold text-lg">${p.avgCostPerInstance.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs">avg cost/instance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">Frequency: {p.frequency} occurrences</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-red-400 text-xs font-bold">Total cost: ${(p.avgCostPerInstance * p.frequency).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-400" />
              Missed Opportunity Reasons Breakdown
            </h3>
            <div className="space-y-3">
              {(() => {
                const reasons = acquisitions.reduce((acc, a) => {
                  acc[a.reason] = (acc[a.reason] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const total = acquisitions.length;
                return (Object.entries(reasons) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={reason}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${getReasonColor(reason as any)}`}>{getReasonLabel(reason as any)}</span>
                          <span className="text-slate-400 text-xs">{count} cards ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
            <div className="mt-4 bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <Zap size={14} className="text-purple-400" />
                Dominant miss reason: <span className="text-white font-semibold">{getReasonLabel(summary.dominantMissReason)}</span> — this is where your biggest behavioral gap lies
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityCostPhantom;
