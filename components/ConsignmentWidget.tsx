import React, { useMemo } from 'react';
import { Package, Clock, BarChart3 } from 'lucide-react';
import { CardInventory } from '../types';
import { ConsignmentService, ConsignmentStatus, ConsignmentSummary } from '../lib/consignmentService';

interface ConsignmentWidgetProps {
  inventory: CardInventory[];
  onCardClick?: (_cardId: string) => void;
}

const STATUS_DOT: Record<ConsignmentStatus, string> = {
  shipped: 'bg-blue-400',
  received: 'bg-amber-400',
  listed: 'bg-green-400',
  sold: 'bg-lime-400',
  returned: 'bg-red-400',
  disputed: 'bg-orange-400',
};

const STATUS_LABEL: Record<ConsignmentStatus, string> = {
  shipped: 'Shipped',
  received: 'Received',
  listed: 'Listed',
  sold: 'Sold',
  returned: 'Returned',
  disputed: 'Disputed',
};

const ConsignmentWidget: React.FC<ConsignmentWidgetProps> = ({ _inventory, onCardClick }) => {
  const summary = useMemo<ConsignmentSummary>(
    () => ConsignmentService.generateConsignmentSummary(),
    [],
  );

  const allConsignments = useMemo(() => ConsignmentService.getConsignments(), []);

  const activeConsignments = useMemo(() => {
    return allConsignments
      .filter((e) => ['shipped', 'received', 'listed'].includes(e.status))
      .sort((a, b) => new Date(b.dateShipped).getTime() - new Date(a.dateShipped).getTime())
      .slice(0, 5);
  }, [allConsignments]);

  const housePerformance = useMemo(() => {
    const houses = ConsignmentService.getConsignmentHouses();
    return houses.map((house) => {
      const houseEntries = allConsignments.filter((e) => e.houseId === house.id);
      const soldEntries = houseEntries.filter((e) => e.status === 'sold');
      const totalSold = soldEntries.length;
      const avgNetPct =
        soldEntries.length > 0
          ? soldEntries.reduce((sum, e) => {
              if (!e.soldPrice || e.soldPrice === 0) return sum;
              return sum + ((e.netProceeds ?? 0) / e.soldPrice) * 100;
            }, 0) / soldEntries.length
          : 100 - house.commissionRate; // estimated if no history
      return {
        id: house.id,
        name: house.name,
        soldCount: totalSold,
        totalEntries: houseEntries.length,
        avgNetPct,
        rating: house.rating,
      };
    });
  }, [allConsignments]);

  const maxSold = Math.max(1, ...housePerformance.map((h) => h.soldCount));

  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
          <Package size={22} />
        </div>
        <div>
          <h3 className="text-2xl font-bebas tracking-wide text-white">Consignment Tracker</h3>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            {summary.totalConsigned} Total &bull; {summary.totalPending} Pending &bull;{' '}
            {summary.totalSold} Sold
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Consigned
          </p>
          <p className="text-xl font-mono font-bold text-white">{summary.totalConsigned}</p>
        </div>
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Pending Sale
          </p>
          <p className="text-xl font-mono font-bold text-amber-400">{summary.totalPending}</p>
        </div>
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Net Proceeds
          </p>
          <p className="text-xl font-mono font-bold text-brand-lime">
            ${summary.totalNetProceeds.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Avg Commission
          </p>
          <p className="text-xl font-mono font-bold text-brand-muted">
            {summary.avgCommissionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Active Consignments */}
      {activeConsignments.length > 0 && (
        <div>
          <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
            Active Consignments
          </h4>
          <div className="space-y-2">
            {activeConsignments.map((entry) => {
              const elapsed = daysSince(entry.dateShipped);
              const house = ConsignmentService.getHouseById(entry.houseId);
              const progressPct = house
                ? Math.min(100, (elapsed / house.avgDaysToSell) * 100)
                : 50;

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 bg-brand-charcoal/50 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => onCardClick?.(entry.cardId)}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[entry.status]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{entry.cardName}</p>
                    <p className="text-[9px] text-brand-muted truncate">
                      {entry.houseName} &bull; {STATUS_LABEL[entry.status]}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progressPct >= 100
                            ? 'bg-amber-400'
                            : progressPct >= 60
                            ? 'bg-brand-lime'
                            : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-white">
                      ${entry.askingPrice.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-mono text-brand-muted flex items-center gap-1 justify-end">
                      <Clock size={9} />
                      {elapsed}d
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance by House */}
      <div>
        <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <BarChart3 size={12} />
          Performance by House
        </h4>
        <div className="space-y-2">
          {housePerformance.map((house) => (
            <div
              key={house.id}
              className="flex items-center gap-3 text-xs"
            >
              <span className="w-24 text-brand-muted truncate text-[10px]">{house.name}</span>
              <div className="flex-1 flex items-center gap-2">
                {/* Sold count bar */}
                <div className="flex-1 h-4 bg-slate-800 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-brand-lime/30 rounded-md"
                    style={{ width: `${(house.soldCount / maxSold) * 100}%` }}
                  />
                  {house.soldCount > 0 && (
                    <span className="absolute inset-0 flex items-center pl-2 text-[9px] font-mono text-white">
                      {house.soldCount} sold
                    </span>
                  )}
                </div>
              </div>
              <span className="w-14 text-right text-[10px] font-mono text-brand-lime">
                {house.avgNetPct.toFixed(0)}% net
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {summary.totalConsigned === 0 && (
        <div className="text-center py-6">
          <Package size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-brand-muted">No consignments yet</p>
          <p className="text-[10px] text-slate-600 mt-1">
            Open a card to consign it through a partner house
          </p>
        </div>
      )}
    </div>
  );
};

const MemoizedConsignmentWidget = React.memo(ConsignmentWidget);
export { MemoizedConsignmentWidget as ConsignmentWidget };
export default MemoizedConsignmentWidget;
