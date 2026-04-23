// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  User,
  Lightbulb,
  Flame,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Heart,
  TrendingDown,
  Shield,
  Coffee,
  Activity,
} from 'lucide-react';
import {
  getBurnoutSignals,
  getBurnoutProfile,
  getBurnoutStats,
} from '../lib/core/collectorBurnoutIndexService';

interface CollectorBurnoutIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'signals' | 'profile' | 'recommendations';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'signals', label: 'Signals', icon: <AlertTriangle size={16} /> },
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={16} /> },
];

const severityGauge = (level: number) => {
  if (level >= 80) return { color: 'text-red-400', bg: 'bg-red-500', barBg: 'bg-red-500/20', label: 'Critical' };
  if (level >= 60) return { color: 'text-amber-400', bg: 'bg-amber-500', barBg: 'bg-amber-500/20', label: 'High' };
  if (level >= 40) return { color: 'text-yellow-400', bg: 'bg-yellow-500', barBg: 'bg-yellow-500/20', label: 'Moderate' };
  return { color: 'text-green-400', bg: 'bg-green-500', barBg: 'bg-green-500/20', label: 'Low' };
};

const CollectorBurnoutIndexModal: React.FC<CollectorBurnoutIndexModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('signals');

  const signals = useMemo(() => getBurnoutSignals(), []);
  const profile = useMemo(() => getBurnoutProfile(), []);
  const stats = useMemo(() => getBurnoutStats(), []);

  if (!isOpen) return null;

  const overallScore = stats?.burnoutIndex ?? profile?.burnoutIndex ?? 45;
  const gauge = severityGauge(overallScore);

  const renderSignals = () => (
    <div className="space-y-4">
      {signals.map((signal: any, idx: number) => {
        const severity = signal.severity ?? signal.score ?? 50;
        const g = severityGauge(severity);
        return (
          <div key={signal.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${g.barBg}`}>
                  <Flame size={16} className={g.color} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{signal.name || signal.title || signal.signal}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{signal.category || signal.type || 'Behavioral'}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${g.barBg} ${g.color}`}>
                {g.label}
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-3">{signal.description || signal.details}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${g.bg}`} style={{ width: `${severity}%` }} />
              </div>
              <span className={`text-sm font-bold ${g.color}`}>{severity}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={overallScore >= 80 ? '#ef4444' : overallScore >= 60 ? '#f59e0b' : overallScore >= 40 ? '#eab308' : '#22c55e'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${gauge.color}`}>{overallScore}</span>
              <span className="text-xs text-slate-400">{gauge.label}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-semibold text-slate-200">Burnout Profile</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {profile?.summary || 'Your collecting patterns show moderate engagement levels. Monitor spending velocity and emotional purchasing triggers.'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Engagement</p>
              <p className="text-sm font-bold text-slate-200">{profile?.engagement ?? 'Moderate'}</p>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Risk Level</p>
              <p className={`text-sm font-bold ${gauge.color}`}>{gauge.label}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {(profile?.dimensions || [
          { name: 'Spending Fatigue', score: 55 },
          { name: 'Decision Fatigue', score: 40 },
          { name: 'FOMO Pressure', score: 65 },
          { name: 'Collection Satisfaction', score: 72 },
          { name: 'Market Anxiety', score: 48 },
          { name: 'Social Comparison', score: 35 },
        ]).map((dim: any, idx: number) => {
          const dg = severityGauge(dim.score ?? dim.value ?? 50);
          return (
            <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2">{dim.name || dim.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${dg.bg}`} style={{ width: `${dim.score ?? dim.value ?? 50}%` }} />
                </div>
                <span className={`text-xs font-bold ${dg.color}`}>{dim.score ?? dim.value ?? 50}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      {[
        { icon: <Coffee size={16} className="text-lime-400" />, title: 'Take a Collecting Break', desc: 'Step away from marketplaces for 48-72 hours. Research shows that short breaks reset dopamine sensitivity and improve decision quality.' },
        { icon: <Shield size={16} className="text-lime-400" />, title: 'Set Spending Limits', desc: 'Configure weekly spending caps to prevent impulsive purchases during high-emotion periods.' },
        { icon: <Heart size={16} className="text-lime-400" />, title: 'Reconnect with Joy', desc: 'Focus on the cards you love rather than market value. Organize your collection, share with friends, or write about your favorite pieces.' },
        { icon: <Activity size={16} className="text-lime-400" />, title: 'Diversify Activities', desc: 'Balance collecting with other hobbies. Over-indexing on a single pursuit accelerates burnout.' },
      ].map((rec, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lime-500/20 flex-shrink-0">{rec.icon}</div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">{rec.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{rec.desc}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Wellness Reminder</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Collecting should be enjoyable. If you notice persistent stress, reduced enjoyment, or compulsive purchasing behaviors, consider speaking with a financial wellness advisor.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Battery size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Collector Burnout Index</h2>
              <p className="text-sm text-slate-400">Monitor collecting fatigue and wellness signals</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Burnout Index</p>
            <p className={`text-xl font-bold ${gauge.color}`}>{overallScore}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Active Signals</p>
            <p className="text-xl font-bold text-slate-100">{stats?.activeSignals ?? signals.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Trend</p>
            <p className="text-xl font-bold text-amber-400">{stats?.trend ?? 'Stable'}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Risk Level</p>
            <p className={`text-xl font-bold ${gauge.color}`}>{gauge.label}</p>
          </div>
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

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'signals' && renderSignals()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'recommendations' && renderRecommendations()}
        </div>
      </div>
    </div>
  );
};

export default CollectorBurnoutIndexModal;
