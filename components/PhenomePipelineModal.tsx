import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Target,
  Activity,
  Eye,
  ArrowUpRight,
  Flame,
  Award,
  Signal,
} from 'lucide-react';
import {
  getPhenoms,
  getPhenomStats,
} from '../lib/utils/phenomePipelineService';

interface PhenomePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'pipeline' | 'signals' | 'stats';

const tabs = [
  { id: 'pipeline' as TabId, label: 'Pipeline', icon: <Users size={16} /> },
  { id: 'signals' as TabId, label: 'Signals', icon: <Signal size={16} /> },
  { id: 'stats' as TabId, label: 'Stats', icon: <BarChart3 size={16} /> },
];

function getBreakoutColor(prob: number): string {
  if (prob >= 80) return 'text-green-400';
  if (prob >= 60) return 'text-lime-400';
  if (prob >= 40) return 'text-amber-400';
  return 'text-slate-400';
}

function getBreakoutBg(prob: number): string {
  if (prob >= 80) return 'bg-green-500/20';
  if (prob >= 60) return 'bg-lime-500/20';
  if (prob >= 40) return 'bg-amber-500/20';
  return 'bg-slate-500/20';
}

function getGradeColor(grade: string): string {
  const g = parseFloat(grade) || 0;
  if (g >= 70) return 'text-green-400';
  if (g >= 55) return 'text-lime-400';
  if (g >= 40) return 'text-amber-400';
  return 'text-red-400';
}

const PhenomePipelineModal: React.FC<PhenomePipelineModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('pipeline');

  const phenoms = useMemo(() => getPhenoms(), []);
  const stats = useMemo(() => getPhenomStats(), []);

  if (!isOpen) return null;

  const topProspects = [...phenoms].sort((a: any, b: any) => (b.breakoutProbability ?? 0) - (a.breakoutProbability ?? 0));
  const signalProspects = phenoms.filter((p: any) => p.signals && p.signals.length > 0);

  const renderPipeline = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Total Prospects</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.totalProspects ?? phenoms.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-slate-400">Hot Prospects</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.hotProspects ?? topProspects.filter((p: any) => (p.breakoutProbability ?? 0) >= 75).length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Avg Breakout %</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.avgBreakoutProbability ?? 0}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Avg Scout Grade</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.avgScoutGrade ?? 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Prospect Pipeline
        </h3>
        {topProspects.map((phenom: any) => (
          <div
            key={phenom.id}
            className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getBreakoutBg(phenom.breakoutProbability ?? 0)}`}>
                  <Star size={16} className={getBreakoutColor(phenom.breakoutProbability ?? 0)} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{phenom.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{phenom.sport ?? phenom.position}</span>
                    {phenom.team && <span className="text-xs text-slate-500">| {phenom.team}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getBreakoutColor(phenom.breakoutProbability ?? 0)}`}>
                  {phenom.breakoutProbability ?? 0}%
                </div>
                <p className="text-xs text-slate-500">Breakout Prob</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500">Scout Grade</p>
                <p className={`text-sm font-semibold ${getGradeColor(String(phenom.scoutGrade ?? phenom.grade ?? 0))}`}>
                  {phenom.scoutGrade ?? phenom.grade ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Age</p>
                <p className="text-sm font-semibold text-slate-200">{phenom.age ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Card Value</p>
                <p className="text-sm font-semibold text-slate-200">${(phenom.cardValue ?? phenom.currentValue ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Upside</p>
                <p className="text-sm font-semibold text-green-400 flex items-center gap-1">
                  <ArrowUpRight size={12} /> {phenom.upside ?? phenom.projectedGrowth ?? 0}%
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (phenom.breakoutProbability ?? 0) >= 75 ? 'bg-green-500' :
                  (phenom.breakoutProbability ?? 0) >= 50 ? 'bg-lime-500' :
                  (phenom.breakoutProbability ?? 0) >= 30 ? 'bg-amber-500' : 'bg-slate-500'
                }`}
                style={{ width: `${phenom.breakoutProbability ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSignals = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Active Signals
      </h3>
      {(signalProspects.length > 0 ? signalProspects : topProspects.slice(0, 6)).map((phenom: any) => (
        <div key={phenom.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <Signal size={16} className="text-lime-400" />
            <h4 className="text-sm font-semibold text-slate-200">{phenom.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBreakoutBg(phenom.breakoutProbability ?? 0)} ${getBreakoutColor(phenom.breakoutProbability ?? 0)}`}>
              {phenom.breakoutProbability ?? 0}% Breakout
            </span>
          </div>
          {phenom.signals ? (
            <div className="space-y-2">
              {phenom.signals.map((signal: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <Zap size={12} className={signal.positive !== false ? 'text-green-400' : 'text-red-400'} />
                  <span className="text-slate-300">{signal.description ?? signal.label ?? signal}</span>
                  {signal.strength && (
                    <span className="ml-auto text-slate-500">{signal.strength}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <Zap size={12} className="text-green-400" />
                <span className="text-slate-300">Performance trend: Rising</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Eye size={12} className="text-amber-400" />
                <span className="text-slate-300">Market attention: Increasing</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Activity size={12} className="text-lime-400" />
                <span className="text-slate-300">Card volume: Above average</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStats = () => (
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
          <p className="text-sm font-semibold text-lime-300">Pipeline Insights</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Focus on prospects with breakout probability above 70% for best ROI
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Scout grades above 60 historically correlate with 3x card value growth
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Early acquisition before breakout confirmation yields highest premiums
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
              <Star size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Phenome Pipeline</h2>
              <p className="text-sm text-slate-400">Track prospect breakout potential and scout intelligence</p>
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
          {activeTab === 'pipeline' && renderPipeline()}
          {activeTab === 'signals' && renderSignals()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default PhenomePipelineModal;
