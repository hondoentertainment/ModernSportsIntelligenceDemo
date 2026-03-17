import React, { useState, useMemo } from 'react';
import {
  X,
  ScrollText,
  Flame,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';
import {
  getFlipRecords,
  getStreakAnalysis,
  getFlipStats,
} from '../lib/flipStreakAnalyticsService';

interface FlipStreakAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'records' | 'streaks' | 'stats';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'records', label: 'Records', icon: <ScrollText size={16} /> },
  { id: 'streaks', label: 'Streaks', icon: <Flame size={16} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

const FlipStreakAnalyticsModal: React.FC<FlipStreakAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('records');

  const records = useMemo(() => getFlipRecords(), []);
  const streaks = useMemo(() => getStreakAnalysis(), []);
  const stats = useMemo(() => getFlipStats(), []);

  if (!isOpen) return null;

  const renderRecords = () => (
    <div className="space-y-3">
      {records.map((record: any, idx: number) => {
        const profit = (record.salePrice ?? record.soldFor ?? 0) - (record.purchasePrice ?? record.boughtFor ?? 0);
        const isWin = profit > 0;
        const isDraw = profit === 0;
        return (
          <div key={record.id || idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isWin ? 'bg-green-500/20' : isDraw ? 'bg-slate-500/20' : 'bg-red-500/20'}`}>
                  {isWin ? <CheckCircle2 size={16} className="text-green-400" /> :
                   isDraw ? <Minus size={16} className="text-slate-400" /> :
                   <XCircle size={16} className="text-red-400" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{record.cardName || record.card || record.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                    <span>Buy: {formatCurrency(record.purchasePrice ?? record.boughtFor ?? 0)}</span>
                    <span>Sell: {formatCurrency(record.salePrice ?? record.soldFor ?? 0)}</span>
                    <span>{record.holdDays ?? record.daysHeld ?? '—'}d held</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${isWin ? 'text-green-400' : isDraw ? 'text-slate-400' : 'text-red-400'}`}>
                  {isWin ? '+' : ''}{formatCurrency(profit)}
                </p>
                <p className="text-xs text-slate-500">
                  {((profit / (record.purchasePrice ?? record.boughtFor ?? 1)) * 100).toFixed(1)}% ROI
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStreaks = () => {
    const streakData = Array.isArray(streaks) ? streaks : streaks?.streaks || [];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-sm font-semibold text-green-400">Best Win Streak</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{streaks?.bestWinStreak ?? stats?.bestWinStreak ?? 7}</p>
            <p className="text-xs text-slate-400 mt-1">Consecutive profitable flips</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400">Worst Loss Streak</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{streaks?.worstLossStreak ?? stats?.worstLossStreak ?? 3}</p>
            <p className="text-xs text-slate-400 mt-1">Consecutive losses</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Streak History</h3>
          <div className="flex flex-wrap gap-1">
            {(streakData.length > 0 ? streakData : records).slice(0, 30).map((item: any, idx: number) => {
              const isW = item.result === 'win' || item.type === 'win' || ((item.salePrice ?? item.soldFor ?? 0) > (item.purchasePrice ?? item.boughtFor ?? 0));
              return (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isW ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                  title={item.cardName || item.card || `Flip ${idx + 1}`}
                >
                  {isW ? 'W' : 'L'}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-lime-300">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-lime-400">{streaks?.currentStreak ?? stats?.currentStreak ?? 3} <span className="text-base font-normal text-slate-400">wins</span></p>
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <DollarSign size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-slate-100">{formatCurrency(stats?.totalProfit ?? 0)}</p>
          <p className="text-xs text-slate-400 mt-1">Total Profit</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <Target size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-green-400">{stats?.winRate ?? 68}%</p>
          <p className="text-xs text-slate-400 mt-1">Win Rate</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <Zap size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-slate-100">{stats?.avgROI ?? 24}%</p>
          <p className="text-xs text-slate-400 mt-1">Avg ROI</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <Trophy size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-slate-100">{stats?.totalFlips ?? records.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Flips</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Best Flip</h4>
          <p className="text-lg font-bold text-green-400">{formatCurrency(stats?.bestFlipProfit ?? 450)}</p>
          <p className="text-xs text-slate-400 mt-1">{stats?.bestFlipCard ?? 'Top performing card'}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Worst Flip</h4>
          <p className="text-lg font-bold text-red-400">{formatCurrency(stats?.worstFlipProfit ?? -120)}</p>
          <p className="text-xs text-slate-400 mt-1">{stats?.worstFlipCard ?? 'Worst performing card'}</p>
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
              <Flame size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Flip Streak Analytics</h2>
              <p className="text-sm text-slate-400">Track flip performance and win/loss streaks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Total Flips</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalFlips ?? records.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Win Rate</p>
            <p className="text-xl font-bold text-green-400">{stats?.winRate ?? 68}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Total Profit</p>
            <p className="text-xl font-bold text-lime-400">{formatCurrency(stats?.totalProfit ?? 0)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Current Streak</p>
            <p className="text-xl font-bold text-slate-100">{stats?.currentStreak ?? 3}W</p>
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
          {activeTab === 'records' && renderRecords()}
          {activeTab === 'streaks' && renderStreaks()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default FlipStreakAnalyticsModal;
