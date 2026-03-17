import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Timer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
} from 'lucide-react';
import {
  getBreakEvenCards,
  getBreakEvenStats,
} from '../lib/breakEvenCountdownService';

interface BreakEvenCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'countdown' | 'analysis';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'countdown', label: 'Countdown', icon: <Clock size={16} /> },
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={16} /> },
];

const statusConfig = (status: string) => {
  switch (status) {
    case 'profitable':
      return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: <CheckCircle2 size={16} className="text-green-400" /> };
    case 'on-track':
    case 'ontrack':
      return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: <TrendingUp size={16} className="text-amber-400" /> };
    case 'underwater':
    case 'behind':
      return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: <TrendingDown size={16} className="text-red-400" /> };
    default:
      return { text: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30', icon: <Timer size={16} className="text-slate-400" /> };
  }
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

const BreakEvenCountdownModal: React.FC<BreakEvenCountdownModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('countdown');

  const cards = useMemo(() => getBreakEvenCards(), []);
  const stats = useMemo(() => getBreakEvenStats(), []);

  if (!isOpen) return null;

  const renderCountdown = () => (
    <div className="space-y-4">
      {cards.map((card: any, idx: number) => {
        const status = card.status || 'on-track';
        const cfg = statusConfig(status);
        const purchasePrice = card.purchasePrice ?? card.costBasis ?? 0;
        const currentValue = card.currentValue ?? card.marketValue ?? 0;
        const progress = purchasePrice > 0 ? Math.min((currentValue / purchasePrice) * 100, 150) : 0;
        return (
          <div key={card.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.bg}`}>{cfg.icon}</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{card.cardName || card.name || card.card}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Purchased: {card.purchaseDate || card.acquired || 'Unknown'}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cfg.bg} ${cfg.text}`}>
                {status}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Cost Basis</p>
                <p className="text-sm font-bold text-slate-200">{formatCurrency(purchasePrice)}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Current Value</p>
                <p className={`text-sm font-bold ${currentValue >= purchasePrice ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(currentValue)}
                </p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">P&L</p>
                <p className={`text-sm font-bold ${(currentValue - purchasePrice) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(currentValue - purchasePrice) >= 0 ? '+' : ''}{formatCurrency(currentValue - purchasePrice)}
                </p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Days to BE</p>
                <p className="text-sm font-bold text-lime-400">{card.daysToBreakEven ?? card.daysRemaining ?? '—'}</p>
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{progress.toFixed(0)}% to break-even</p>
          </div>
        );
      })}
    </div>
  );

  const renderAnalysis = () => {
    const profitable = cards.filter((c: any) => c.status === 'profitable').length;
    const onTrack = cards.filter((c: any) => c.status === 'on-track' || c.status === 'ontrack').length;
    const underwater = cards.filter((c: any) => c.status === 'underwater' || c.status === 'behind').length;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30 text-center">
            <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{stats?.profitable ?? profitable}</p>
            <p className="text-xs text-slate-400 mt-1">Profitable</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30 text-center">
            <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-400">{stats?.onTrack ?? onTrack}</p>
            <p className="text-xs text-slate-400 mt-1">On Track</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30 text-center">
            <XCircle size={24} className="text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{stats?.underwater ?? underwater}</p>
            <p className="text-xs text-slate-400 mt-1">Underwater</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-lime-400" />
              <span className="text-sm font-semibold text-slate-200">Total Invested</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">{formatCurrency(stats?.totalInvested ?? cards.reduce((s: number, c: any) => s + (c.purchasePrice ?? c.costBasis ?? 0), 0))}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-lime-400" />
              <span className="text-sm font-semibold text-slate-200">Current Value</span>
            </div>
            <p className="text-3xl font-bold text-lime-400">{formatCurrency(stats?.totalValue ?? cards.reduce((s: number, c: any) => s + (c.currentValue ?? c.marketValue ?? 0), 0))}</p>
          </div>
        </div>
        <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-lime-400" />
            <p className="text-sm font-semibold text-lime-300">Avg Days to Break-Even</p>
          </div>
          <p className="text-3xl font-bold text-slate-100 mb-2">{stats?.avgDaysToBreakEven ?? 45} <span className="text-base font-normal text-slate-400">days</span></p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Based on current market trajectories. Cards with positive momentum are trending toward profitability faster than historical average.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Target size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Break-Even Countdown</h2>
              <p className="text-sm text-slate-400">Track time to profitability for each card investment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Total Cards</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalCards ?? cards.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Profitable</p>
            <p className="text-xl font-bold text-green-400">{stats?.profitable ?? cards.filter((c: any) => c.status === 'profitable').length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">On Track</p>
            <p className="text-xl font-bold text-amber-400">{stats?.onTrack ?? cards.filter((c: any) => c.status === 'on-track').length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Underwater</p>
            <p className="text-xl font-bold text-red-400">{stats?.underwater ?? cards.filter((c: any) => c.status === 'underwater').length}</p>
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
          {activeTab === 'countdown' && renderCountdown()}
          {activeTab === 'analysis' && renderAnalysis()}
        </div>
      </div>
    </div>
  );
};

export default BreakEvenCountdownModal;
