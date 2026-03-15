import React, { useMemo } from 'react';
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  RebalanceAlert,
  getRebalanceSuggestions,
  calculateRebalanceCost,
  acknowledgeAlert,
} from '../lib/rebalancingAlertService';

interface RebalanceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: RebalanceAlert | null;
  inventory: CardInventory[];
}

const severityConfig: Record<
  string,
  { color: string; bg: string; border: string; glow: string; icon: React.ReactNode; label: string }
> = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    glow: 'bg-red-500/15',
    icon: <AlertTriangle size={24} />,
    label: 'Critical',
  },
  warning: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'bg-orange-500/15',
    icon: <AlertCircle size={24} />,
    label: 'Warning',
  },
  info: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'bg-blue-500/15',
    icon: <Info size={24} />,
    label: 'Info',
  },
};

const sportColors: Record<string, string> = {
  Baseball: 'bg-red-500',
  Basketball: 'bg-orange-500',
  Football: 'bg-green-500',
  Hockey: 'bg-blue-500',
  Soccer: 'bg-purple-500',
};

const RebalanceAlertModal: React.FC<RebalanceAlertModalProps> = ({
  isOpen,
  onClose,
  alert,
  inventory,
}) => {
  const _suggestions = useMemo(() => {
    if (!alert || !inventory.length) return [];
    return getRebalanceSuggestions(inventory).filter((s) => s.sport === alert.sport);
  }, [alert, inventory]);

  const costEstimate = useMemo(() => {
    if (!inventory.length) return null;
    return calculateRebalanceCost(inventory);
  }, [inventory]);

  const relatedCards = useMemo(() => {
    if (!alert) return [];
    const active = inventory.filter(
      (c) => c.status !== 'sold' && c.sport === alert.sport
    );
    // Sort by value descending for sell suggestions, ascending for buy context
    return active
      .sort((a, b) => ((b.currentValue ?? b.purchasePrice) - (a.currentValue ?? a.purchasePrice)))
      .slice(0, 5);
  }, [alert, inventory]);

  if (!isOpen || !alert) return null;

  const sev = severityConfig[alert.severity];
  const isOver = alert.driftAmount > 0;

  const handleAcknowledge = () => {
    acknowledgeAlert(alert.id);
    onClose();
  };

  const maxBar = Math.max(alert.currentAllocation, alert.targetAllocation, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
        {/* Severity glow */}
        <div
          className={`absolute -top-20 -right-20 w-56 h-56 ${sev.glow} blur-[80px] rounded-full`}
        />

        <div className="p-8 space-y-6 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${sev.bg} ${sev.color}`}>{sev.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${sev.color}`}
                  >
                    {sev.label} Alert
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {alert.type}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-wide text-white">{alert.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed">{alert.description}</p>

          {/* Allocation Comparison Bars */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Allocation Comparison
            </h3>

            {/* Current */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current</span>
                <span className="text-white font-bold">{alert.currentAllocation.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${sportColors[alert.sport] ?? 'bg-slate-500'}`}
                  style={{ width: `${Math.min((alert.currentAllocation / maxBar) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Target */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target</span>
                <span className="text-[#ADFF2F] font-bold">{alert.targetAllocation}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#ADFF2F]/60 transition-all duration-700"
                  style={{ width: `${Math.min((alert.targetAllocation / maxBar) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Drift indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${sev.bg} ${sev.border} border`}
            >
              {isOver ? (
                <ArrowUpRight size={16} className="text-red-400" />
              ) : (
                <ArrowDownRight size={16} className="text-blue-400" />
              )}
              <span className="text-sm font-bold text-white">
                {isOver ? '+' : ''}
                {alert.driftAmount.toFixed(1)}% drift
              </span>
              <span className="text-xs text-slate-400">
                ({isOver ? 'overallocated' : 'underallocated'})
              </span>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Recommended Action
            </h3>
            <p className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
              {alert.recommendedAction}
            </p>
          </div>

          {/* Card Suggestions */}
          {relatedCards.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                {isOver ? 'Top Cards to Consider Selling' : 'Current Holdings'}
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {relatedCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isOver ? (
                        <Tag size={12} className="text-red-400 flex-shrink-0" />
                      ) : (
                        <ShoppingCart size={12} className="text-blue-400 flex-shrink-0" />
                      )}
                      <span className="text-xs text-white truncate">
                        {card.year} {card.player}
                      </span>
                    </div>
                    <span className="text-xs text-[#ADFF2F] font-bold flex-shrink-0 ml-2">
                      ${(card.currentValue ?? card.purchasePrice).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Cost Estimate */}
          {costEstimate && costEstimate.totalCost > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                Estimated Rebalance Cost
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <DollarSign size={14} className="mx-auto text-slate-500 mb-1" />
                  <div className="text-xs text-white font-bold">
                    ${costEstimate.sellTransactionFees.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Sell Fees</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <DollarSign size={14} className="mx-auto text-slate-500 mb-1" />
                  <div className="text-xs text-white font-bold">
                    ${costEstimate.buyTransactionFees.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Buy Fees</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <DollarSign size={14} className="mx-auto text-slate-500 mb-1" />
                  <div className="text-xs text-white font-bold">
                    ${costEstimate.estimatedTaxImpact.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Est. Tax</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAcknowledge}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ADFF2F]/10 border border-[#ADFF2F]/30 text-[#ADFF2F] rounded-xl font-bold text-sm hover:bg-[#ADFF2F]/20 transition-all"
            >
              <CheckCircle size={16} />
              Acknowledge
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl font-bold text-sm hover:text-white hover:border-slate-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalanceAlertModal;
