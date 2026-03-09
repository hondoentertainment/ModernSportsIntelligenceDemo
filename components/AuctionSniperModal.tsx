import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Crosshair, Eye, Clock, TrendingUp, TrendingDown,
  Users, Shield, AlertTriangle, Target, Zap, BarChart3
} from 'lucide-react';
import {
  AuctionListing,
  SniperAnalysis,
  SniperStrategy,
  watchAuction,
  isAuctionWatched,
} from '../lib/auctionSniperService';

interface AuctionSniperModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: AuctionListing | null;
  analysis: SniperAnalysis | null;
}

const STRATEGY_CONFIG: Record<SniperStrategy, { label: string; color: string; bgColor: string; borderColor: string }> = {
  snipe:     { label: 'SNIPE',     color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/40' },
  early_bid: { label: 'EARLY BID', color: 'text-blue-400',    bgColor: 'bg-blue-500/20',    borderColor: 'border-blue-500/40' },
  watch:     { label: 'WATCH',     color: 'text-amber-400',   bgColor: 'bg-amber-500/20',   borderColor: 'border-amber-500/40' },
  skip:      { label: 'SKIP',      color: 'text-red-400',     bgColor: 'bg-red-500/20',     borderColor: 'border-red-500/40' },
};

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const AuctionSniperModal: React.FC<AuctionSniperModalProps> = ({ isOpen, onClose, listing, analysis }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [watched, setWatched] = useState(false);
  const [sniped, setSniped] = useState(false);

  // Initialize state on open
  useEffect(() => {
    if (isOpen && listing) {
      setTimeLeft(listing.timeRemaining);
      setWatched(isAuctionWatched(listing.id));
      setSniped(false);
    }
  }, [isOpen, listing]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !listing) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, listing]);

  const handleWatch = useCallback(() => {
    if (!listing) return;
    watchAuction(listing.id);
    setWatched(true);
  }, [listing]);

  const handleSnipe = useCallback(() => {
    setSniped(true);
  }, []);

  if (!isOpen || !listing || !analysis) return null;

  const strat = STRATEGY_CONFIG[analysis.strategy];
  const bidPct = listing.estimatedValue > 0
    ? Math.round((listing.currentBid / listing.estimatedValue) * 100)
    : 0;
  const savingsPct = listing.estimatedValue > 0
    ? Math.round((analysis.expectedSavings / listing.estimatedValue) * 100)
    : 0;

  const urgencyColor = timeLeft < 3600
    ? 'text-red-400'
    : timeLeft < 21600
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Crosshair className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <h2 className="text-xl font-bold text-white truncate">
                  {listing.player}
                </h2>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${strat.bgColor} ${strat.color} ${strat.borderColor}`}>
                  {strat.label}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {listing.year} {listing.manufacturer} {listing.set} &middot; {listing.grade}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Countdown */}
          <div className="mt-4 flex items-center gap-3">
            <Clock className={`w-4 h-4 ${urgencyColor}`} />
            <span className={`text-2xl font-mono font-bold ${urgencyColor}`}>
              {formatCountdown(timeLeft)}
            </span>
            {timeLeft < 3600 && timeLeft > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full animate-pulse">
                ENDING SOON
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Fair Value vs Current Bid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Value Comparison
            </h3>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Current Bid</span>
                <span className="text-white font-semibold">${listing.currentBid.toFixed(2)}</span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    bidPct < 70 ? 'bg-emerald-500' : bidPct < 90 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, bidPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fair Value</span>
                <span className="text-emerald-400 font-semibold">${analysis.fairValue.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 text-right">
                {bidPct}% of estimated value
              </div>
            </div>
          </div>

          {/* Competition Analysis */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Competition Analysis
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-1">Watchers</p>
                <p className="text-lg font-bold text-white">{listing.watchers}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-1">Bids</p>
                <p className="text-lg font-bold text-white">{listing.bidCount}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
                <p className="text-xs text-slate-400 mb-1">Competition</p>
                <p className={`text-sm font-bold capitalize ${
                  analysis.competitionLevel === 'fierce' ? 'text-red-400' :
                  analysis.competitionLevel === 'high' ? 'text-amber-400' :
                  analysis.competitionLevel === 'medium' ? 'text-blue-400' :
                  'text-emerald-400'
                }`}>
                  {analysis.competitionLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Optimal Bid Recommendation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Bid Recommendation
            </h3>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Max Bid</span>
                <span className="text-xl font-bold text-emerald-400">${analysis.maxBid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        analysis.confidence >= 70 ? 'bg-emerald-500' :
                        analysis.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysis.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white">{analysis.confidence}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Expected Savings</span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  ${analysis.expectedSavings.toFixed(2)} ({savingsPct}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Bid Timing</span>
                <span className="text-sm font-semibold text-blue-400">
                  {analysis.bidTiming}s before end
                </span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Risk Assessment
            </h3>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                {analysis.riskLevel === 'high' ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : analysis.riskLevel === 'medium' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Shield className="w-4 h-4 text-emerald-400" />
                )}
                <span className={`text-sm font-bold capitalize ${
                  analysis.riskLevel === 'high' ? 'text-red-400' :
                  analysis.riskLevel === 'medium' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {analysis.riskLevel} risk
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {analysis.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex gap-3">
          {!sniped ? (
            <button
              onClick={handleSnipe}
              disabled={analysis.strategy === 'skip'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                analysis.strategy === 'skip'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              Set Snipe &middot; ${analysis.maxBid.toFixed(2)}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
              Snipe Set @ ${analysis.maxBid.toFixed(2)}
            </div>
          )}

          <button
            onClick={handleWatch}
            disabled={watched}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              watched
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            {watched ? 'Watching' : 'Watch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionSniperModal;
