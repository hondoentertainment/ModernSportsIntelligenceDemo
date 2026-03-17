import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Layers,
  Target,
  Gauge,
  LineChart,
} from 'lucide-react';
import {
  getMomentumLines,
  getMarketMomentums,
  getMomentumStats,
} from '../lib/marketMomentumLinesService';

interface MarketMomentumLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'lines' | 'momentum' | 'overview';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'lines', label: 'Lines', icon: <LineChart size={16} /> },
  { id: 'momentum', label: 'Momentum', icon: <Activity size={16} /> },
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
];

const strengthColor = (strength: number | string) => {
  const val = typeof strength === 'string' ? (strength === 'strong' ? 80 : strength === 'moderate' ? 50 : 20) : strength;
  if (val >= 70) return { text: 'text-green-400', bg: 'bg-green-500', barBg: 'bg-green-500/20' };
  if (val >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', barBg: 'bg-amber-500/20' };
  return { text: 'text-red-400', bg: 'bg-red-500', barBg: 'bg-red-500/20' };
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

const MarketMomentumLinesModal: React.FC<MarketMomentumLinesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('lines');

  const lines = useMemo(() => getMomentumLines(), []);
  const momentums = useMemo(() => getMarketMomentums(), []);
  const stats = useMemo(() => getMomentumStats(), []);

  if (!isOpen) return null;

  const renderLines = () => (
    <div className="space-y-4">
      {lines.map((line: any, idx: number) => {
        const str = strengthColor(line.strength ?? line.score ?? 50);
        const isSupport = (line.type || line.lineType || '').toLowerCase().includes('support');
        return (
          <div key={line.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isSupport ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {isSupport
                    ? <ArrowUp size={16} className="text-green-400" />
                    : <ArrowDown size={16} className="text-red-400" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{line.name || line.card || line.label}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">
                    {line.type || line.lineType || 'Support'} Line &middot; {formatCurrency(line.price ?? line.value ?? 0)}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${str.barBg} ${str.text}`}>
                {typeof line.strength === 'number' ? `${line.strength}%` : line.strength || 'Moderate'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Price Level</p>
                <p className="text-sm font-bold text-slate-200">{formatCurrency(line.price ?? line.value ?? 0)}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Tests</p>
                <p className="text-sm font-bold text-slate-200">{line.tests ?? line.touches ?? 0}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Strength</p>
                <p className={`text-sm font-bold ${str.text}`}>{line.strength ?? line.score ?? 50}{typeof line.strength === 'number' ? '%' : ''}</p>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${str.bg}`}
                style={{ width: `${typeof line.strength === 'number' ? line.strength : line.score ?? 50}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMomentum = () => (
    <div className="space-y-4">
      {momentums.map((m: any, idx: number) => {
        const direction = m.direction || m.trend || (m.momentum > 0 ? 'bullish' : 'bearish');
        const isBull = direction === 'bullish' || direction === 'up';
        return (
          <div key={m.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isBull ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {isBull
                    ? <TrendingUp size={16} className="text-green-400" />
                    : <ArrowDown size={16} className="text-red-400" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{m.name || m.card || m.market}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">{direction}</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${isBull ? 'text-green-400' : 'text-red-400'}`}>
                {(m.momentum ?? m.score ?? 0) > 0 ? '+' : ''}{m.momentum ?? m.score ?? 0}%
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Volume</p>
                <p className="text-sm font-bold text-slate-200">{m.volume ?? '—'}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Velocity</p>
                <p className="text-sm font-bold text-slate-200">{m.velocity ?? '—'}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Signal</p>
                <p className={`text-sm font-bold ${isBull ? 'text-green-400' : 'text-red-400'}`}>{m.signal || direction}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Support Lines</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats?.supportLines ?? lines.filter((l: any) => (l.type || '').includes('support')).length}</p>
          <p className="text-xs text-slate-400 mt-1">Active support levels</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Resistance Lines</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats?.resistanceLines ?? lines.filter((l: any) => (l.type || '').includes('resistance')).length}</p>
          <p className="text-xs text-slate-400 mt-1">Active resistance levels</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Market Momentum</span>
          </div>
          <p className={`text-3xl font-bold ${(stats?.overallMomentum ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(stats?.overallMomentum ?? 0) >= 0 ? '+' : ''}{stats?.overallMomentum ?? 12}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Aggregate momentum score</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Breakout Signals</span>
          </div>
          <p className="text-3xl font-bold text-lime-400">{stats?.breakoutSignals ?? 4}</p>
          <p className="text-xs text-slate-400 mt-1">Potential breakout candidates</p>
        </div>
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
              <TrendingUp size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Market Momentum Lines</h2>
              <p className="text-sm text-slate-400">Support/resistance levels and momentum indicators</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Total Lines</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalLines ?? lines.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Bullish</p>
            <p className="text-xl font-bold text-green-400">{stats?.bullishCount ?? momentums.filter((m: any) => (m.direction || m.trend) === 'bullish').length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Bearish</p>
            <p className="text-xl font-bold text-red-400">{stats?.bearishCount ?? momentums.filter((m: any) => (m.direction || m.trend) === 'bearish').length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Momentum</p>
            <p className="text-xl font-bold text-lime-400">{stats?.overallMomentum ?? '+12'}%</p>
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
          {activeTab === 'lines' && renderLines()}
          {activeTab === 'momentum' && renderMomentum()}
          {activeTab === 'overview' && renderOverview()}
        </div>
      </div>
    </div>
  );
};

export default MarketMomentumLinesModal;
