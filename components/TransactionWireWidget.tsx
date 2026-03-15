// Transaction Wire Widget — Compact dashboard feed of latest transactions
import React, { useMemo } from 'react';
import {
  Newspaper,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { getRecentTransactions, getTransactionStats, Transaction } from '../lib/transactionWireService';

interface TransactionWireWidgetProps {
  onOpenModal: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`;
  return `$${price.toLocaleString()}`;
}

function _formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SPORT_COLOR: Record<string, string> = {
  MLB: 'text-red-400',
  NBA: 'text-orange-400',
  NFL: 'text-blue-400',
};

const TransactionRow: React.FC<{ txn: Transaction }> = ({ txn }) => {
  const delta = ((txn.price - txn.previousPrice) / txn.previousPrice) * 100;
  const isUp = delta >= 0;

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-700/30 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {txn.isNotable && <Zap size={10} className="text-amber-400 flex-shrink-0" />}
          <span className="text-xs font-semibold text-slate-200 truncate">{txn.player}</span>
          <span className={`text-[10px] font-bold ${SPORT_COLOR[txn.sport] || 'text-slate-400'}`}>{txn.sport}</span>
        </div>
        <p className="text-[10px] text-slate-500 truncate">{txn.cardDescription}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold text-slate-200">{formatPrice(txn.price)}</p>
        <div className="flex items-center justify-end gap-0.5">
          {isUp ? (
            <TrendingUp size={9} className="text-emerald-400" />
          ) : (
            <TrendingDown size={9} className="text-red-400" />
          )}
          <span className={`text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{delta.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const TransactionWireWidget: React.FC<TransactionWireWidgetProps> = ({ onOpenModal }) => {
  const recent = useMemo(() => getRecentTransactions(5), []);
  const stats = useMemo(() => getTransactionStats(), []);

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 hover:border-lime-500/30 transition-all cursor-pointer group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-500/20">
            <Newspaper size={16} className="text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Transaction Wire</h3>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Volume</p>
          <p className="text-sm font-bold text-slate-200">{formatPrice(stats.totalVolume)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Deals</p>
          <p className="text-sm font-bold text-slate-200">{stats.totalTransactions}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Notable</p>
          <p className="text-sm font-bold text-amber-400">{stats.notableDeals}</p>
        </div>
      </div>

      {/* Transaction feed */}
      <div className="space-y-0">
        {recent.map(txn => (
          <TransactionRow key={txn.id} txn={txn} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-700/30 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">{stats.platformCount} platforms tracked</span>
        <span className="text-[10px] text-lime-400 font-semibold group-hover:underline">View All →</span>
      </div>
    </div>
  );
};

export default TransactionWireWidget;
