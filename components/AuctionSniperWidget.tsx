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
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Auction Sniper</h3>
        </div>
        <span className="text-xs text-slate-500">Live Opportunities</span>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Active</p>
          <p className="text-lg font-bold text-white">{stats.totalActive}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Ending Soon</p>
          <p className="text-lg font-bold text-red-400">{stats.endingSoon}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Potential Savings</p>
          <p className="text-lg font-bold text-emerald-400">${stats.totalPotentialSavings.toFixed(0)}</p>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          Top Opportunities
        </h4>

        {topOpportunities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No actionable opportunities right now</p>
        ) : (
          <div className="space-y-2">
            {topOpportunities.map(a => {
              const badge = STRATEGY_BADGE[a.strategy];
              return (
                <button
                  key={a.listing.id}
                  onClick={() => onListingClick?.(a.listing)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">
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
                    <span className={`text-xs font-mono font-semibold ${timeUrgencyColor(a.listing.timeRemaining)}`}>
                      <Clock className="w-3 h-3 inline mr-0.5" />
                      {formatTimeShort(a.listing.timeRemaining)}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      ${a.expectedSavings.toFixed(0)}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Alerts */}
      {topAlerts.length > 0 && (
        <div className="p-4 pt-0">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Alerts
          </h4>
          <div className="space-y-2">
            {topAlerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                ) : alert.severity === 'warning' ? (
                  <Eye className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionSniperWidget;
