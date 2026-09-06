
import React from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { TargetWatchlist } from '../types.ts';
import Sparkline from './Sparkline.tsx';
import { getSparklineData, getPriceTrend } from '../lib/analytics/priceHistory.ts';
import {
  buildValuationProvenanceTitle,
  getStaleValuationLabel,
} from '../lib/utils/valuationFreshness.ts';
import {
  getValuationSourceChipForTarget,
  valuationBadgeVariantForEntity,
} from '../lib/utils/valuationProvenance.ts';
import ValuationProvenanceChips from './ValuationProvenanceChips';

interface WatchlistPriceCardProps {
    target: TargetWatchlist;
    onDelete: (_id: string) => void;
    onMarkAcquired: (_id: string) => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    High: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
    Medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
    Low: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
};

const WatchlistPriceCard: React.FC<WatchlistPriceCardProps> = ({ target, onDelete, onMarkAcquired }) => {
    const priceHit = target.currentMarketPrice != null && target.currentMarketPrice <= target.targetPrice;
    const sparklineData = getSparklineData(`target_${target.id}`);
    const trend = getPriceTrend(`target_${target.id}`);
    const priorityStyle = PRIORITY_STYLES[target.priority] || PRIORITY_STYLES.Medium;
    const valuationChip = getValuationSourceChipForTarget(target);
    const staleLabel = getStaleValuationLabel(target.valuationTimestamp);
    const provenanceTitle = buildValuationProvenanceTitle({
      timestamp: target.valuationTimestamp,
      confidence: undefined,
      rationale: target.pricingRationale,
    });

    // Calculate how close the market price is to the target
    const proximityPercent = target.currentMarketPrice != null
        ? Math.min(100, Math.round((target.targetPrice / target.currentMarketPrice) * 100))
        : 0;

    const priceDelta = target.currentMarketPrice != null
        ? target.currentMarketPrice - target.targetPrice
        : null;

    return (
        <div
            className="group relative rounded-2xl border transition-all duration-300 hover:scale-[1.01]"
            style={{
                background: priceHit
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02))'
                    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4))',
                borderColor: priceHit ? 'rgba(34, 197, 94, 0.4)' : 'rgba(51, 65, 85, 0.5)',
                boxShadow: priceHit ? '0 0 20px rgba(34, 197, 94, 0.15)' : '0 4px 20px rgba(0,0,0,0.2)',
            }}
        >
            {/* Price Hit Indicator */}
            {priceHit && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1 z-10">
                    <AlertTriangle size={10} />
                    TARGET HIT
                </div>
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black text-white uppercase tracking-wide truncate">{target.player}</h3>
                            <span
                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: priorityStyle.bg,
                                    color: priorityStyle.text,
                                    border: `1px solid ${priorityStyle.border}`,
                                }}
                            >
                                {target.priority}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{target.cardDescription}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{target.sport}</span>
                            <span className="text-slate-700">•</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{target.league}</span>
                        </div>
                    </div>

                    {/* Sparkline */}
                    <div className="w-20 h-10 flex-shrink-0 ml-3">
                        <Sparkline data={sparklineData} showTrend={true} />
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Target Price */}
                    <div className="rounded-xl p-3" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            <Target size={10} className="inline mr-1" />
                            Target
                        </p>
                        <p className="text-lg font-black text-brand-lime">${target.targetPrice.toLocaleString()}</p>
                    </div>

                    {/* Market Price */}
                    <div className="rounded-xl p-3" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            {trend === 'up' ? <TrendingUp size={10} className="inline mr-1 text-green-400" /> :
                                trend === 'down' ? <TrendingDown size={10} className="inline mr-1 text-red-400" /> : null}
                            Market
                        </p>
                        <p className={`text-lg font-black ${target.currentMarketPrice != null ? (priceHit ? 'text-green-400' : 'text-white') : 'text-slate-600'}`}>
                            {target.currentMarketPrice != null ? `$${target.currentMarketPrice.toLocaleString()}` : '—'}
                        </p>
                        <ValuationProvenanceChips
                            className="mt-2"
                            sourceChip={valuationChip}
                            badgeVariant={valuationBadgeVariantForEntity(target)}
                            staleLabel={staleLabel}
                            title={provenanceTitle}
                        />
                    </div>
                </div>

                {/* Proximity Bar */}
                {target.currentMarketPrice != null && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Price Proximity</span>
                            <span className={`text-[10px] font-bold ${priceHit ? 'text-green-400' : priceDelta != null && priceDelta < target.targetPrice * 0.1 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                {priceDelta != null && priceDelta > 0 ? `$${priceDelta.toLocaleString()} above` : priceHit ? 'AT OR BELOW TARGET' : ''}
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${proximityPercent}%`,
                                    background: priceHit
                                        ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                        : proximityPercent > 80
                                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                            : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Notes */}
                {target.notes && (
                    <p className="text-[11px] text-slate-500 italic mb-4 line-clamp-2">{target.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {target.searchUrl && (
                        <a
                            href={target.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                        >
                            <ExternalLink size={11} />
                            eBay
                        </a>
                    )}
                    {target.status === 'active' && (
                        <button
                            onClick={() => onMarkAcquired(target.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-green-400 hover:text-white bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                        >
                            <Check size={11} />
                            Acquired
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(target.id)}
                        className="ml-auto p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WatchlistPriceCard;
