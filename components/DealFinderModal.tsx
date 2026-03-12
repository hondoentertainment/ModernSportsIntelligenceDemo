import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Search,
  ArrowRightLeft,
  Bell,
  History,
  TrendingDown,
  DollarSign,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ShoppingCart,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  Shield,
} from 'lucide-react';
import { CardInventory, Sport } from '../types';
import {
  generateListings,
  findDeals,
  findArbitrage,
  getDealAlerts,
  getDealHistory,
  logDealAction,
  getDealSummary,
  Deal,
  ArbitrageOpportunity,
  DealAlert,
  DealHistory,
  DealFilter,
  Platform,
  PLATFORM_FEES,
  PLATFORM_COLORS,
} from '../lib/dealFinderService';

interface DealFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'deals' | 'arbitrage' | 'alerts' | 'history';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'deals', label: 'Deals', icon: <Search size={16} /> },
  { id: 'arbitrage', label: 'Arbitrage', icon: <ArrowRightLeft size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
  { id: 'history', label: 'History', icon: <History size={16} /> },
];

const ALL_PLATFORMS: Platform[] = ['eBay', 'COMC', 'MySlabs', 'Goldin', 'Private'];
const ALL_SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-green-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-slate-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-red-500/15 border-red-500/30';
  if (score >= 60) return 'bg-green-500/15 border-green-500/30';
  if (score >= 40) return 'bg-amber-500/15 border-amber-500/30';
  return 'bg-slate-500/15 border-slate-500/30';
}

function getRecommendationBadge(rec: Deal['recommendation']): { label: string; color: string; bg: string } {
  switch (rec) {
    case 'strong_buy': return { label: 'Strong Buy', color: 'text-red-400', bg: 'bg-red-500/10 border border-red-500/30' };
    case 'buy': return { label: 'Buy', color: 'text-green-400', bg: 'bg-green-500/10 border border-green-500/30' };
    case 'fair': return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/30' };
    case 'overpriced': return { label: 'Overpriced', color: 'text-slate-400', bg: 'bg-slate-500/10 border border-slate-500/30' };
  }
}

function getRiskBadge(risk: ArbitrageOpportunity['riskLevel']): { label: string; color: string; icon: React.ReactNode } {
  switch (risk) {
    case 'low': return { label: 'Low Risk', color: 'text-green-400', icon: <Shield size={12} /> };
    case 'medium': return { label: 'Med Risk', color: 'text-amber-400', icon: <AlertTriangle size={12} /> };
    case 'high': return { label: 'High Risk', color: 'text-red-400', icon: <AlertTriangle size={12} /> };
  }
}

// ---- Deals Tab ----

const DealsTab: React.FC<{
  deals: Deal[];
  filters: DealFilter;
  onFilterChange: (f: DealFilter) => void;
  onAction: (deal: Deal, action: DealHistory['action']) => void;
}> = ({ deals, filters, onFilterChange, onAction }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {deals.length} deal{deals.length !== 1 ? 's' : ''} found
        </p>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            showFilters
              ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Filter size={12} />
          Filters
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Sport Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Sport
              </label>
              <select
                value={filters.sport ?? ''}
                onChange={e => onFilterChange({ ...filters, sport: (e.target.value || undefined) as Sport | undefined })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="">All Sports</option>
                {ALL_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Platform
              </label>
              <select
                value={filters.platform ?? ''}
                onChange={e => onFilterChange({ ...filters, platform: (e.target.value || undefined) as Platform | undefined })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="">All Platforms</option>
                {ALL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Max Price
              </label>
              <select
                value={filters.maxPrice ?? ''}
                onChange={e => onFilterChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="">No Limit</option>
                <option value="50">Under $50</option>
                <option value="100">Under $100</option>
                <option value="250">Under $250</option>
                <option value="500">Under $500</option>
                <option value="1000">Under $1,000</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy ?? 'score'}
                onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as DealFilter['sortBy'] })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="score">Deal Score</option>
                <option value="savings">Savings</option>
                <option value="price">Price (Low)</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Deal List */}
      <div className="space-y-2">
        {deals.map(deal => {
          const platColors = PLATFORM_COLORS[deal.listing.platform as Platform];
          const recBadge = getRecommendationBadge(deal.recommendation);
          return (
            <div
              key={deal.id}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3 hover:border-slate-600 transition-colors"
            >
              {/* Top Row */}
              <div className="flex items-start gap-3">
                {/* Score */}
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${getScoreBg(deal.dealScore)}`}>
                  <span className={`font-bebas text-xl tracking-wider ${getScoreColor(deal.dealScore)}`}>
                    {deal.dealScore}
                  </span>
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {deal.listing.player}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {deal.listing.cardDescription}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${platColors.text} ${platColors.bg} border ${platColors.border}`}>
                      {deal.listing.platform}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${recBadge.color} ${recBadge.bg}`}>
                      {recBadge.label}
                    </span>
                    {deal.listing.isGraded && deal.listing.grade && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
                        {deal.listing.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Savings */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bebas tracking-wider text-white">
                    ${deal.listing.listPrice.toFixed(2)}
                  </p>
                  {deal.savingsAmount > 0 ? (
                    <p className="flex items-center justify-end gap-0.5 text-xs font-bold text-green-400">
                      <TrendingDown size={12} />
                      Save ${deal.savingsAmount.toFixed(2)} ({deal.savingsPercent.toFixed(1)}%)
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Fair: ${deal.listing.fairValue.toFixed(2)}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    +${deal.platformFee.toFixed(2)} fee ({(PLATFORM_FEES[deal.listing.platform] * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={e => { e.stopPropagation(); onAction(deal, 'purchased'); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/20 transition-colors"
                >
                  <ShoppingCart size={11} />
                  Buy
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onAction(deal, 'watchlisted'); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-colors"
                >
                  <Eye size={11} />
                  Watch
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onAction(deal, 'passed'); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-500/10 border border-slate-500/30 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-500/20 transition-colors"
                >
                  <XCircle size={11} />
                  Pass
                </button>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
                  <Clock size={10} />
                  {deal.listing.listingAge}d ago
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deals.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No deals match your filters. Try adjusting criteria.
        </div>
      )}
    </div>
  );
};

// ---- Arbitrage Tab ----

const ArbitrageTab: React.FC<{
  opportunities: ArbitrageOpportunity[];
}> = ({ opportunities }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {opportunities.length} arbitrage opportunit{opportunities.length !== 1 ? 'ies' : 'y'}
        </p>
        <span className="text-xs text-slate-400">
          Net profit after all fees
        </span>
      </div>

      {opportunities.map(arb => {
        const buyPlatColors = PLATFORM_COLORS[arb.buyListing.platform as Platform];
        const sellPlatColors = PLATFORM_COLORS[arb.sellPlatform as Platform];
        const riskBadge = getRiskBadge(arb.riskLevel);

        return (
          <div
            key={arb.id}
            className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3 hover:border-slate-600 transition-colors"
          >
            {/* Card Info */}
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {arb.buyListing.player}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {arb.buyListing.cardDescription}
                </p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${riskBadge.color}`}>
                {riskBadge.icon}
                {riskBadge.label}
              </div>
            </div>

            {/* Buy -> Sell Flow */}
            <div className="flex items-center gap-2">
              {/* Buy Side */}
              <div className="flex-1 p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Buy on</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${buyPlatColors.text} ${buyPlatColors.bg} border ${buyPlatColors.border}`}>
                    {arb.buyListing.platform}
                  </span>
                  <span className="text-sm font-bold text-white">${arb.buyPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  +${arb.buyFee.toFixed(2)} fee
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 p-2 text-brand-lime">
                <ArrowRight size={18} />
              </div>

              {/* Sell Side */}
              <div className="flex-1 p-3 bg-slate-800/60 border border-slate-700 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sell on</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${sellPlatColors.text} ${sellPlatColors.bg} border ${sellPlatColors.border}`}>
                    {arb.sellPlatform}
                  </span>
                  <span className="text-sm font-bold text-white">${arb.sellPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  -${arb.sellFee.toFixed(2)} fee
                </p>
              </div>
            </div>

            {/* Profit */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-green-500/5 border border-green-500/20 rounded-xl">
              <span className="text-xs text-slate-400">Net Profit</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bebas tracking-wider text-green-400">
                  +${arb.netProfit.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/15 border border-green-500/30">
                  {arb.profitPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {opportunities.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No arbitrage opportunities found at this time
        </div>
      )}
    </div>
  );
};

// ---- Alerts Tab ----

const AlertsTab: React.FC<{
  alerts: DealAlert[];
}> = ({ alerts }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {alerts.length} watchlist alert{alerts.length !== 1 ? 's' : ''}
        </p>
        <span className="text-xs text-slate-400">
          Listings below your target price
        </span>
      </div>

      {alerts.map(alert => {
        const platColors = PLATFORM_COLORS[alert.listing.platform as Platform];
        return (
          <div
            key={alert.id}
            className="p-4 bg-slate-800/30 border border-green-500/20 rounded-2xl space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-green-500/10 rounded-xl text-green-400">
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {alert.watchlistPlayer}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {alert.listing.cardDescription}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${platColors.text} ${platColors.bg} border ${platColors.border}`}>
                    {alert.listing.platform}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bebas tracking-wider text-green-400">
                  ${alert.currentPrice.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500">
                  Target: ${alert.targetPrice.toFixed(2)}
                </p>
                <p className="text-xs font-bold text-green-400 mt-0.5">
                  {alert.priceDiffPercent.toFixed(1)}% below
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {alerts.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No watchlist alerts. Add targets to your watchlist to receive deal alerts.
        </div>
      )}
    </div>
  );
};

// ---- History Tab ----

const HistoryTab: React.FC<{
  history: DealHistory[];
}> = ({ history }) => {
  const actionIcons: Record<DealHistory['action'], React.ReactNode> = {
    purchased: <ShoppingCart size={14} className="text-green-400" />,
    passed: <XCircle size={14} className="text-slate-400" />,
    watchlisted: <Eye size={14} className="text-blue-400" />,
    expired: <Clock size={14} className="text-amber-400" />,
  };

  const actionLabels: Record<DealHistory['action'], { label: string; color: string }> = {
    purchased: { label: 'Purchased', color: 'text-green-400' },
    passed: { label: 'Passed', color: 'text-slate-400' },
    watchlisted: { label: 'Watchlisted', color: 'text-blue-400' },
    expired: { label: 'Expired', color: 'text-amber-400' },
  };

  const sorted = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {history.length} action{history.length !== 1 ? 's' : ''} logged
        </p>
      </div>

      {sorted.map(entry => {
        const platColors = PLATFORM_COLORS[entry.listing.platform as Platform];
        const actionInfo = actionLabels[entry.action];
        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
          >
            {/* Action Icon */}
            <div className="flex-shrink-0">
              {actionIcons[entry.action]}
            </div>

            {/* Card Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${actionInfo.color}`}>
                  {actionInfo.label}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${platColors.text} ${platColors.bg} border ${platColors.border}`}>
                  {entry.listing.platform}
                </span>
              </div>
              <p className="text-sm text-white truncate mt-0.5">
                {entry.listing.player}
              </p>
              <p className="text-[10px] text-slate-600">
                {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Score & Price */}
            <div className="text-right flex-shrink-0">
              <span className={`font-bebas text-lg tracking-wider ${getScoreColor(entry.dealScore)}`}>
                {entry.dealScore}
              </span>
              <p className="text-xs text-slate-400">
                ${entry.listing.listPrice.toFixed(2)}
              </p>
            </div>
          </div>
        );
      })}

      {history.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No deal actions logged yet. Act on deals to track your history.
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const DealFinderModal: React.FC<DealFinderModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('deals');
  const [filters, setFilters] = useState<DealFilter>({ sortBy: 'score' });
  const [historyVersion, setHistoryVersion] = useState(0);

  const listings = useMemo(() => generateListings(cards), [cards]);
  const deals = useMemo(() => findDeals(listings, filters), [listings, filters]);
  const arbitrage = useMemo(() => findArbitrage(listings), [listings]);
  const summary = useMemo(() => getDealSummary(deals, arbitrage), [deals, arbitrage]);

  // Build a simple watchlist from cards that have target prices or are in inventory
  const alerts = useMemo(() => {
    const watchlist = cards
      .filter(c => c.currentValue && c.currentValue > 0)
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        player: c.player,
        targetPrice: (c.currentValue ?? c.purchasePrice) * 0.85,
        sport: c.sport,
      }));
    return getDealAlerts(listings, watchlist);
  }, [listings, cards]);

  const history = useMemo(() => getDealHistory(), [historyVersion]);

  const handleDealAction = useCallback((deal: Deal, action: DealHistory['action']) => {
    logDealAction(deal.id, action, deal.listing, deal.dealScore, deal.savingsAmount);
    setHistoryVersion(v => v + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-green-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-2xl border border-green-500/30">
              <Search size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  <DollarSign size={10} />
                  ${summary.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} potential savings
                </span>
                {summary.arbitrageCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Zap size={10} />
                    {summary.arbitrageCount} arb
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Deal <span className="text-green-400">Finder</span> & Arbitrage
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => {
            let badge: number | null = null;
            if (tab.id === 'deals') badge = deals.filter(d => d.dealScore >= 50).length;
            if (tab.id === 'arbitrage') badge = arbitrage.length;
            if (tab.id === 'alerts') badge = alerts.length;
            if (tab.id === 'history') badge = history.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-brand-lime border-brand-lime bg-brand-lime/5'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {badge !== null && badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-brand-lime/20 text-brand-lime'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'deals' && (
            <DealsTab
              deals={deals}
              filters={filters}
              onFilterChange={setFilters}
              onAction={handleDealAction}
            />
          )}
          {activeTab === 'arbitrage' && <ArbitrageTab opportunities={arbitrage} />}
          {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
          {activeTab === 'history' && <HistoryTab history={history} />}
        </div>
      </div>
    </div>
  );
};

export default DealFinderModal;
