import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Star,
  Award,
  Send,
  ShoppingCart,
} from 'lucide-react';
import { CardInventory, CardConsignmentSnapshot } from '../types';
import {
  ConsignmentService,
  ConsignmentEntry,
  ConsignmentStatus,
  HouseComparison,
} from '../lib/trading/consignmentService';
import ConfirmDialog from './ConfirmDialog';

interface ConsignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory | null;
  inventory: CardInventory[];
  onConsignmentStarted?: (cardId: string, patch: Partial<CardInventory>) => void | Promise<void>;
  onConsignmentEnded?: (cardId: string) => void | Promise<void>;
}

const STATUS_COLORS: Record<ConsignmentStatus, { bg: string; text: string; label: string }> = {
  shipped: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Shipped' },
  received: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Received' },
  listed: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', label: 'Listed' },
  sold: { bg: 'bg-lime-400/10 border-lime-400/30', text: 'text-lime-400', label: 'Sold' },
  returned: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Returned' },
  disputed: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', label: 'Disputed' },
};

const STATUS_ORDER: ConsignmentStatus[] = ['shipped', 'received', 'listed', 'sold'];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  shipped: <Truck size={14} />,
  received: <Package size={14} />,
  listed: <ShoppingCart size={14} />,
  sold: <CheckCircle2 size={14} />,
  returned: <RotateCcw size={14} />,
  disputed: <AlertTriangle size={14} />,
};

export const ConsignmentModal: React.FC<ConsignmentModalProps> = ({
  isOpen,
  onClose,
  card,
  onConsignmentStarted,
  onConsignmentEnded,
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);
  const [askingPrice, setAskingPrice] = useState(0);
  const [shippingCost, setShippingCost] = useState(8);
  const [insuranceCost, setInsuranceCost] = useState(5);
  const [cardConsignments, setCardConsignments] = useState<ConsignmentEntry[]>([]);

  const houses = useMemo(() => ConsignmentService.getConsignmentHouses(), []);

  const cardValue = card ? (card.currentValue ?? card.purchasePrice) : 0;

  const comparisons = useMemo<HouseComparison[]>(() => {
    if (!card) return [];
    return ConsignmentService.compareHouses(cardValue, card.sport);
  }, [card, cardValue]);

  const optimalHouse = useMemo(() => {
    if (!card) return null;
    return ConsignmentService.getOptimalHouse(card);
  }, [card]);

  useEffect(() => {
    if (card) {
      setAskingPrice(Math.round(cardValue * 1.1));
      setCardConsignments(ConsignmentService.getConsignmentsByCard(card.id));
      if (optimalHouse) {
        setSelectedHouseId(optimalHouse.id);
      }
    }
  }, [card, cardValue, optimalHouse]);

  if (!isOpen || !card) return null;

  const hasActiveConsignment = card.status === 'consignment' && !!card.consignment;
  const showReturnToCollection = hasActiveConsignment && !!onConsignmentEnded;

  const handleConfirmReturnToCollection = async () => {
    if (!card) return;
    await onConsignmentEnded?.(card.id);
    setConfirmReturnOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedHouseId || askingPrice <= 0 || !card) return;
    const house = houses.find((h) => h.id === selectedHouseId);
    if (!house) return;

    const entry = ConsignmentService.createConsignment(
      card.id,
      `${card.player} ${card.year} ${card.set}`,
      card.sport,
      selectedHouseId,
      askingPrice,
      shippingCost,
      insuranceCost,
      cardValue,
    );

    const snapshot: CardConsignmentSnapshot = {
      houseId: house.id,
      houseName: house.name,
      entryId: entry.id,
      submittedAt: entry.dateShipped,
      reservePrice: askingPrice,
      sellerFeePercent: house.commissionRate,
      trackingNumber: entry.trackingNumber,
    };

    await onConsignmentStarted?.(card.id, { status: 'consignment', consignment: snapshot });
    setCardConsignments(ConsignmentService.getConsignmentsByCard(card.id));
  };

  const selectedHouse = houses.find((h) => h.id === selectedHouseId);
  const previewCommission = selectedHouse
    ? askingPrice * (selectedHouse.commissionRate / 100) + selectedHouse.fixedFee
    : 0;
  const previewNet = askingPrice - previewCommission - shippingCost - insuranceCost;

  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <ConfirmDialog
        isOpen={confirmReturnOpen}
        title="Return to collection?"
        message={`Mark "${card.player}" as back in your collection? Active consignment details will be cleared from this card; local consignment history is unchanged.`}
        confirmLabel="Return to collection"
        variant="info"
        onConfirm={handleConfirmReturnToCollection}
        onCancel={() => setConfirmReturnOpen(false)}
      />
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Consignment Terminal
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                {card.player} &mdash; {card.year} {card.set}
                {card.isGraded && card.grade ? ` | ${card.gradingCompany} ${card.grade}` : ''}
                {' | '}${cardValue.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          <div
            role="status"
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100/95 leading-relaxed"
          >
            <span className="font-semibold text-amber-200">Planning only: </span>
            Commission tables, ratings, and timelines are illustrative models—not official quotes from any
            consignment house. Marking a card “on consignment” here updates your MSI inventory only; it does not
            submit to third parties. When you are signed in, consignment snapshots sync with your cards in the
            cloud like the rest of your collection.
          </div>
          {showReturnToCollection && card.consignment && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-brand-lime/25 bg-brand-lime/5">
              <div>
                <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1">
                  On consignment
                </p>
                <p className="text-sm text-white font-medium">{card.consignment.houseName}</p>
                <p className="text-[10px] text-brand-muted font-mono mt-0.5">
                  Reserve ${card.consignment.reservePrice?.toLocaleString() ?? '—'} · Tracked {card.consignment.trackingNumber ?? '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmReturnOpen(true)}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-600 bg-slate-800/80 text-white hover:border-brand-lime/40 hover:bg-slate-800 transition-all"
              >
                <RotateCcw size={14} />
                Return to collection
              </button>
            </div>
          )}

          {/* House Comparison Table */}
          <div>
            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              House Comparison — Est. Value ${cardValue.toLocaleString()}
            </h3>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-brand-muted">
                    <th className="text-left p-3 font-black uppercase tracking-widest text-[9px]">House</th>
                    <th className="text-right p-3 font-black uppercase tracking-widest text-[9px]">Comm %</th>
                    <th className="text-right p-3 font-black uppercase tracking-widest text-[9px]">Fees</th>
                    <th className="text-right p-3 font-black uppercase tracking-widest text-[9px]">Net</th>
                    <th className="text-center p-3 font-black uppercase tracking-widest text-[9px]">Rating</th>
                    <th className="text-center p-3 font-black uppercase tracking-widest text-[9px]">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comp, _i) => {
                    const isOptimal = optimalHouse?.id === comp.houseId;
                    return (
                      <tr
                        key={comp.houseId}
                        className={`border-b border-slate-800/50 transition-colors cursor-pointer ${
                          selectedHouseId === comp.houseId
                            ? 'bg-brand-lime/5'
                            : 'hover:bg-slate-800/30'
                        }`}
                        onClick={() => setSelectedHouseId(comp.houseId)}
                      >
                        <td className="p-3 text-white font-medium flex items-center gap-2">
                          {isOptimal && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-lime/10 border border-brand-lime/30 rounded text-brand-lime text-[8px] font-black uppercase tracking-widest">
                              <Award size={10} /> Best
                            </span>
                          )}
                          {comp.houseName}
                          {comp.isSpecialist && (
                            <Star size={10} className="text-amber-400" />
                          )}
                        </td>
                        <td className="p-3 text-right text-brand-muted font-mono">
                          {comp.commissionRate}%
                        </td>
                        <td className="p-3 text-right text-brand-muted font-mono">
                          ${comp.fixedFee}
                        </td>
                        <td className="p-3 text-right text-brand-lime font-mono font-bold">
                          ${comp.netProceeds.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-center text-amber-400 font-mono">
                          {comp.rating}
                        </td>
                        <td className="p-3 text-center text-brand-muted font-mono">
                          ~{comp.avgDaysToSell}d
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Consignment Form */}
          <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              New Consignment
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1.5">
                  Consignment House
                </label>
                <select
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-lime/50 transition-colors"
                >
                  <option value="">Select a house...</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.commissionRate}% + ${h.fixedFee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1.5">
                  Asking Price ($)
                </label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-lime/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1.5">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-lime/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1.5">
                  Insurance ($)
                </label>
                <input
                  type="number"
                  value={insuranceCost}
                  onChange={(e) => setInsuranceCost(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-lime/50 transition-colors"
                />
              </div>

              {/* Net Proceeds Preview */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col justify-center">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">
                  Est. Net Proceeds
                </p>
                <p className={`text-lg font-mono font-bold ${previewNet >= 0 ? 'text-brand-lime' : 'text-red-400'}`}>
                  ${previewNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                {selectedHouse && (
                  <p className="text-[9px] text-brand-muted mt-0.5">
                    Comm: ${previewCommission.toFixed(0)} | Ship: ${shippingCost} | Ins: ${insuranceCost}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={hasActiveConsignment || !selectedHouseId || askingPrice <= 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-brand-lime text-brand-charcoal hover:bg-brand-lime/90"
            >
              <Send size={14} />
              Submit Consignment
            </button>
          </div>

          {/* Active Consignments Timeline */}
          {cardConsignments.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
                Consignment History ({cardConsignments.length})
              </h3>
              <div className="space-y-3">
                {cardConsignments.map((entry) => {
                  const sc = STATUS_COLORS[entry.status];
                  const currentIdx = STATUS_ORDER.indexOf(entry.status);
                  const isTerminal = entry.status === 'returned' || entry.status === 'disputed';

                  return (
                    <div
                      key={entry.id}
                      className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white font-medium">{entry.houseName}</p>
                          <p className="text-[9px] text-brand-muted font-mono">
                            {entry.trackingNumber} &bull; {daysSince(entry.dateShipped)}d elapsed
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.text}`}
                        >
                          {STATUS_ICONS[entry.status]}
                          {sc.label}
                        </span>
                      </div>

                      {/* Timeline */}
                      {!isTerminal && (
                        <div className="flex items-center gap-1">
                          {STATUS_ORDER.map((step, i) => {
                            const isActive = i <= currentIdx;
                            const stepColor = STATUS_COLORS[step];
                            return (
                              <React.Fragment key={step}>
                                <div
                                  className={`flex items-center justify-center w-7 h-7 rounded-full border text-[10px] ${
                                    isActive
                                      ? `${stepColor.bg} ${stepColor.text} border-current`
                                      : 'bg-slate-800/50 border-slate-700 text-slate-600'
                                  }`}
                                >
                                  {STATUS_ICONS[step]}
                                </div>
                                {i < STATUS_ORDER.length - 1 && (
                                  <div
                                    className={`flex-1 h-0.5 rounded ${
                                      i < currentIdx ? 'bg-brand-lime/40' : 'bg-slate-700'
                                    }`}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-[9px] text-brand-muted uppercase tracking-widest">Asking</p>
                          <p className="text-sm font-mono text-white">
                            ${entry.askingPrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-brand-muted uppercase tracking-widest">
                            {entry.status === 'sold' ? 'Sold For' : 'Est. Value'}
                          </p>
                          <p className="text-sm font-mono text-white">
                            ${(entry.soldPrice ?? entry.estimatedValue).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-brand-muted uppercase tracking-widest">Net</p>
                          <p
                            className={`text-sm font-mono font-bold ${
                              entry.netProceeds && entry.netProceeds >= 0
                                ? 'text-brand-lime'
                                : 'text-brand-muted'
                            }`}
                          >
                            {entry.netProceeds != null
                              ? `$${entry.netProceeds.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsignmentModal;
