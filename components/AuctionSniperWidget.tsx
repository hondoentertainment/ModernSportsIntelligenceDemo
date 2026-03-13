import React, { useState, useMemo, useEffect } from 'react';
import {
  Crosshair, Clock, TrendingDown, AlertTriangle,
  Zap, Eye, ChevronRight, Activity
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  AuctionListing,
  SniperStrategy,
  generateMockAuctions,
  analyzeListing,
  getAuctionAlerts,
  getAuctionStats,
} from '../lib/auctionSniperService';

interface AuctionSniperWidgetProps {
  inventory: CardInventory[];
  onListingClick?: (listing: AuctionListing) => void;
}

const STRATEGY_BADGE: Record<SniperStrategy, { label: string; cls: string }> = {
  snipe:     { label: 'SNIPE',     cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  early_bid: { label: 'EARLY',     cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  watch:     { label: 'WATCH',     cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  skip:      { label: 'SKIP',      cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

function formatTimeShort(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d`;
}

function timeUrgencyColor(seconds: number): string {
  if (seconds < 3600) return 'text-red-400';
  if (seconds < 21600) return 'text-amber-400';
  return 'text-emerald-400';
}

const AuctionSniperWidget: React.FC<AuctionSniperWidgetProps> = ({ inventory, onListingClick }) => {
  const [timeTick, setTimeTick] = useState(0);

  // Tick every 30s to refresh countdown displays
  useEffect(() => {
    const interval = setInterval(() => setTimeTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const listings = useMemo(() => generateMockAuctions(inventory), [inventory]);

  // Adjust timeRemaining based on elapsed ticks (simulate countdown)
  const adjustedListings = useMemo(() => {
    return listings.map(l => ({
      ...l,
      timeRemaining: Math.max(0, l.timeRemaining - timeTick * 30),
    }));
  }, [listings, timeTick]);

  const analyses = useMemo(
    () => adjustedListings.map(l => analyzeListing(l)),
    [adjustedListings]
  );

  const stats = useMemo(() => getAuctionStats(adjustedListings), [adjustedListings]);
  const alerts = useMemo(() => getAuctionAlerts(adjustedListings), [adjustedListings]);

  // Top 5 opportunities sorted by expected savings (exclude skips)
  const topOpportunities = useMemo(() => {
    return analyses
      .filter(a => a.strategy !== 'skip')
      .sort((a, b) => b.expectedSavings - a.expectedSavings)
      .slice(0, 5);
  }, [analyses]);

  // Show at most 3 alerts
  const topAlerts = useMemo(() => {
    return alerts
      .sort((a, b) => {
        const sev = { critical: 0, warning: 1, info: 2 };
        return sev[a.severity] - sev[b.severity];
      })
      .slice(0, 3);
  }, [alerts]);

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Crosshair size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Auction <span className="text-emerald-400">Sniper</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Live auction opportunities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.endingSoon > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 animate-pulse">
              <Clock size={12} />
              {stats.endingSoon} ending
            </div>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <Crosshair size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">Active:</span>
          <span className="font-bebas text-lg text-white tracking-wider">{stats.totalActive}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <Clock size={12} className="text-red-400" />
          <span className="text-slate-400 font-medium">Ending Soon:</span>
          <span className="font-bebas text-lg text-red-400 tracking-wider">{stats.endingSoon}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingDown size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">Savings:</span>
          <span className="font-mono text-emerald-400">${stats.totalPotentialSavings.toFixed(0)}</span>
        </div>
      </div>

      {/* Top Opportunities */}
      {topOpportunities.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={10} className="text-emerald-400" />
            Top Opportunities
          </p>
          <div className="space-y-1.5">
            {topOpportunities.map(a => {
              const badge = STRATEGY_BADGE[a.strategy];
              return (
                <button
                  key={a.listing.id}
                  onClick={() => onListingClick?.(a.listing)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl text-left transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate group-hover:text-brand-lime transition-colors">
                        {a.listing.player}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>${a.listing.currentBid.toFixed(0)} bid</span>
                      <span className="text-emerald-400">${a.fairValue.toFixed(0)} value</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${timeUrgencyColor(a.listing.timeRemaining)}`}>
                      <Clock size={10} />
                      {formatTimeShort(a.listing.timeRemaining)}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingDown size={10} />
                      ${a.expectedSavings.toFixed(0)}
                    </span>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      {topAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
            <Activity size={10} className="text-amber-400" />
            Alerts
          </p>
          <div className="space-y-1.5">
            {topAlerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                {alert.severity === 'critical' ? (
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                ) : alert.severity === 'warning' ? (
                  <Eye size={14} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <Activity size={14} className="flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {topOpportunities.length === 0 && topAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Crosshair size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No actionable opportunities right now</p>
          <p className="text-xs text-slate-600 mt-1">Add more cards to your inventory for auction analysis</p>
        </div>
      )}
    </div>
  );
};

export default AuctionSniperWidget;
