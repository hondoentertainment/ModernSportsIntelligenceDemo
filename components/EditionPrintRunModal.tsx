import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  TrendingUp,
  BarChart3,
  Layers,
  Hash,
  Diamond,
  ArrowUpRight,
  Target,
  Activity,
  DollarSign,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import {
  getPrintRunEstimates,
  getPrintRunTrends,
  getPrintRunStats,
} from '../lib/editionPrintRunService';

interface EditionPrintRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'estimates' | 'trends' | 'scarcity';

const tabs = [
  { id: 'estimates' as TabId, label: 'Estimates', icon: <Hash size={16} /> },
  { id: 'trends' as TabId, label: 'Trends', icon: <TrendingUp size={16} /> },
  { id: 'scarcity' as TabId, label: 'Scarcity', icon: <Diamond size={16} /> },
];

const scarcityTiers: Record<string, { bg: string; text: string; border: string }> = {
  'ultra_rare': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'rare': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'scarce': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'limited': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  'common': { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  'mass_produced': { bg: 'bg-slate-600/20', text: 'text-slate-500', border: 'border-slate-600/30' },
};

function getScarcityStyle(tier: string) {
  const key = tier?.toLowerCase().replace(/[\s-]+/g, '_');
  return scarcityTiers[key] ?? scarcityTiers['common'];
}

const EditionPrintRunModal: React.FC<EditionPrintRunModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('estimates');

  const estimates = useMemo(() => getPrintRunEstimates(), []);
  const trends = useMemo(() => getPrintRunTrends(), []);
  const stats = useMemo(() => getPrintRunStats(), []);

  if (!isOpen) return null;

  const renderEstimates = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Printer size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Sets Tracked</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.totalSetsTracked ?? estimates.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Diamond size={14} className="text-purple-400" />
            <span className="text-xs text-slate-400">Ultra Rare</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.ultraRareCount ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Avg Print Run</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{(stats.avgPrintRun ?? 0).toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Avg Scarcity Premium</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.avgScarcityPremium ?? 0}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Print Run Estimates
        </h3>
        {estimates.map((est: any) => {
          const tierStyle = getScarcityStyle(est.scarcityTier ?? est.tier ?? 'common');
          return (
            <div key={est.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{est.setName ?? est.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{est.year ?? ''} {est.brand ?? ''}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierStyle.bg} ${tierStyle.text}`}>
                      {(est.scarcityTier ?? est.tier ?? 'common').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-100">{(est.estimatedPrintRun ?? est.printRun ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">est. copies</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">PSA Pop</p>
                  <p className="text-sm font-semibold text-slate-200">{(est.psaPop ?? est.popCount ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Survival Rate</p>
                  <p className="text-sm font-semibold text-slate-200">{est.survivalRate ?? est.survivalEstimate ?? 'N/A'}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Scarcity Premium</p>
                  <p className="text-sm font-semibold text-green-400">+{est.scarcityPremium ?? 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="text-sm font-semibold text-slate-200">{est.confidence ?? 0}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Print Run Trends
      </h3>
      {trends.map((trend: any, idx: number) => (
        <div key={trend.id ?? idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{trend.name ?? trend.setName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{trend.description ?? trend.period ?? ''}</p>
            </div>
            <div className="flex items-center gap-2">
              {(trend.change ?? trend.trendDirection ?? 0) >= 0
                ? <TrendingUp size={14} className="text-green-400" />
                : <ArrowUpRight size={14} className="text-red-400 rotate-90" />}
              <span className={`text-sm font-bold ${
                (trend.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(trend.change ?? 0) >= 0 ? '+' : ''}{trend.change ?? 0}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-lime-500"
              style={{ width: `${Math.min(Math.abs(trend.change ?? 50), 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderScarcity = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Scarcity Tier Guide
      </h3>
      {Object.entries(scarcityTiers).map(([tier, style]) => (
        <div key={tier} className={`${style.bg} rounded-xl p-5 border ${style.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Diamond size={16} className={style.text} />
              <div>
                <h4 className={`text-sm font-semibold ${style.text} capitalize`}>{tier.replace(/_/g, ' ')}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tier === 'ultra_rare' ? 'Under 100 copies' :
                   tier === 'rare' ? '100-500 copies' :
                   tier === 'scarce' ? '500-2,000 copies' :
                   tier === 'limited' ? '2,000-10,000 copies' :
                   tier === 'common' ? '10,000-100,000 copies' : '100,000+ copies'}
                </p>
              </div>
            </div>
            <span className={`text-sm font-bold ${style.text}`}>
              {tier === 'ultra_rare' ? '+200-500%' :
               tier === 'rare' ? '+100-200%' :
               tier === 'scarce' ? '+50-100%' :
               tier === 'limited' ? '+20-50%' :
               tier === 'common' ? '+0-20%' : 'Baseline'}
            </span>
          </div>
        </div>
      ))}

      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Scarcity Investment Tips</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Low print runs under 500 copies command the highest premiums over time
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            PSA population reports can reveal hidden scarcity in older sets
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Print run reductions mid-season often signal future premium growth
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Printer size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Edition Print Run Tracker</h2>
              <p className="text-sm text-slate-400">Estimate print runs and identify scarcity-driven value</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'estimates' && renderEstimates()}
          {activeTab === 'trends' && renderTrends()}
          {activeTab === 'scarcity' && renderScarcity()}
        </div>
      </div>
    </div>
  );
};

export default EditionPrintRunModal;
