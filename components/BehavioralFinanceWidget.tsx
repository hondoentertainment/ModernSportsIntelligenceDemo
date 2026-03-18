import React, { useMemo } from 'react';
import { Brain, ChevronRight, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import {
  getBehavioralProfile,
  detectBiases,
  getNudges,
  getSeverityConfig,
  formatCurrency,
} from '../lib/analytics/behavioralFinanceService';

interface BehavioralFinanceWidgetProps {
  onOpenModal?: () => void;
}

const BehavioralFinanceWidget: React.FC<BehavioralFinanceWidgetProps> = ({ onOpenModal }) => {
  const profile = useMemo(() => getBehavioralProfile(), []);
  const biases = useMemo(() => detectBiases(), []);
  const nudges = useMemo(() => getNudges(), []);

  const criticalBiases = biases.filter(b => b.severity === 'critical' || b.severity === 'high');
  const activeNudges = nudges.filter(n => !n.acknowledged);
  const topBias = criticalBiases[0];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">Behavioral Finance</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-lg font-bold text-violet-400">{profile.overallScore}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Biases</p>
          <p className="text-lg font-bold text-amber-400">{profile.activeBiases}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Impulse</p>
          <p className={`text-lg font-bold ${profile.impulseLevel === 'high' || profile.impulseLevel === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
            {profile.impulseLevel.charAt(0).toUpperCase() + profile.impulseLevel.slice(1)}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Nudges</p>
          <p className="text-lg font-bold text-emerald-400">{activeNudges.length}</p>
        </div>
      </div>

      {/* Top Bias Alert */}
      {topBias && (
        <div className="p-4 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Top Active Bias
          </h4>
          <button
            onClick={onOpenModal}
            className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {(() => {
                  const sc = getSeverityConfig(topBias.severity);
                  return (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.label}
                    </span>
                  );
                })()}
                <span className="text-sm font-semibold text-white capitalize">
                  {topBias.bias.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{topBias.evidence}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Savings & Streak */}
      <div className="p-4">
        <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Nudge Savings</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-bold">{formatCurrency(profile.totalSavedByNudges)}</span>
            <span className="flex items-center gap-1 text-xs text-violet-400 font-bold">
              <TrendingUp className="w-3 h-3" /> {profile.streakDays}d streak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehavioralFinanceWidget;
