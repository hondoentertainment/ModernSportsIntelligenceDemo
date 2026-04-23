// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Minus,
  Tag,
  Sparkles,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Newspaper,
} from 'lucide-react';
import {
  getNarrativePremiums,
  getNarrativeTrends,
  getNarrativeStats,
} from '../lib/analytics/narrativePremiumIndexService';

interface NarrativePremiumIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'premiums' | 'trends' | 'analysis';

const tabs = [
  { id: 'premiums' as TabId, label: 'Premiums', icon: <Tag size={16} /> },
  { id: 'trends' as TabId, label: 'Trends', icon: <TrendingUp size={16} /> },
  { id: 'analysis' as TabId, label: 'Analysis', icon: <BarChart3 size={16} /> },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  'rookie_hype': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  'championship': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  'hall_of_fame': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'comeback': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  'retirement': { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  'scandal': { bg: 'bg-red-500/20', text: 'text-red-400' },
  'record_breaking': { bg: 'bg-lime-500/20', text: 'text-lime-400' },
  'trade': { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  'injury': { bg: 'bg-red-500/20', text: 'text-red-400' },
  'media': { bg: 'bg-pink-500/20', text: 'text-pink-400' },
};

function getCategoryStyle(category: string) {
  const key = category?.toLowerCase().replace(/\s+/g, '_');
  return categoryColors[key] ?? { bg: 'bg-slate-500/20', text: 'text-slate-400' };
}

function getTrendIcon(direction: string) {
  switch (direction?.toLowerCase()) {
    case 'up':
    case 'rising': return <TrendingUp size={14} className="text-green-400" />;
    case 'down':
    case 'falling': return <TrendingDown size={14} className="text-red-400" />;
    default: return <Minus size={14} className="text-slate-400" />;
  }
}

const NarrativePremiumIndexModal: React.FC<NarrativePremiumIndexModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('premiums');

  const premiums = useMemo(() => getNarrativePremiums(), []);
  const trends = useMemo(() => getNarrativeTrends(), []);
  const stats = useMemo(() => getNarrativeStats(), []);

  if (!isOpen) return null;

  const renderPremiums = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Active Narratives</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.activeNarratives ?? premiums.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Avg Premium</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.avgPremium ?? 0}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Top Premium</span>
          </div>
          <p className="text-2xl font-bold text-lime-400">{stats.topPremium ?? 0}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Trending Now</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.trendingCount ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Narrative Premiums
        </h3>
        {premiums.map((premium: any) => {
          const catStyle = getCategoryStyle(premium.category ?? premium.narrativeType ?? '');
          return (
            <div key={premium.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${catStyle.bg}`}>
                    <BookOpen size={16} className={catStyle.text} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{premium.name ?? premium.narrative}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                        {(premium.category ?? premium.narrativeType ?? 'general').replace(/_/g, ' ')}
                      </span>
                      {premium.player && <span className="text-xs text-slate-500">{premium.player}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  {getTrendIcon(premium.trend ?? premium.direction ?? 'flat')}
                  <span className={`text-lg font-bold ${
                    (premium.premiumPercent ?? premium.premium ?? 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(premium.premiumPercent ?? premium.premium ?? 0) > 0 ? '+' : ''}{premium.premiumPercent ?? premium.premium ?? 0}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Base Value</p>
                  <p className="text-sm font-semibold text-slate-200">${(premium.baseValue ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Narrative Value</p>
                  <p className="text-sm font-semibold text-lime-400">${(premium.narrativeValue ?? premium.currentValue ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-sm font-semibold text-slate-200">{premium.duration ?? premium.daysActive ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Strength</p>
                  <p className="text-sm font-semibold text-slate-200">{premium.strength ?? premium.intensity ?? 'N/A'}</p>
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
        Narrative Trends
      </h3>
      {trends.map((trend: any, idx: number) => (
        <div key={trend.id ?? idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{trend.name ?? trend.narrative}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{trend.description ?? ''}</p>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(trend.direction ?? trend.trend ?? 'flat')}
              <span className={`text-sm font-bold ${
                (trend.change ?? trend.premiumChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(trend.change ?? trend.premiumChange ?? 0) >= 0 ? '+' : ''}{trend.change ?? trend.premiumChange ?? 0}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (trend.momentum ?? trend.strength ?? 50) >= 70 ? 'bg-green-500' :
                (trend.momentum ?? trend.strength ?? 50) >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${trend.momentum ?? trend.strength ?? 50}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">Momentum</span>
            <span className="text-xs text-slate-400">{trend.momentum ?? trend.strength ?? 50}/100</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-2xl font-bold text-slate-100">
              {typeof value === 'number' ? (value % 1 !== 0 ? value.toFixed(1) : value) : String(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Narrative Alpha Insights</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Championship narratives typically add 20-40% premium that fades within 6 months
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Rookie hype premiums are most volatile - buy before consensus forms
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Hall of Fame narratives provide the most sustained long-term premium
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowDownRight size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
            Scandal narratives cause immediate 30-60% drops with slow recovery
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
              <BookOpen size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Narrative Premium Index</h2>
              <p className="text-sm text-slate-400">Track how storylines drive card values beyond fundamentals</p>
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
          {activeTab === 'premiums' && renderPremiums()}
          {activeTab === 'trends' && renderTrends()}
          {activeTab === 'analysis' && renderAnalysis()}
        </div>
      </div>
    </div>
  );
};

export default NarrativePremiumIndexModal;
