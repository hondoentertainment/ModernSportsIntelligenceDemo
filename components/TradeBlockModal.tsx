import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Repeat,
  Tag,
  Bell,
  History,
  Package,
  Plus,
  Trash2,
  Edit3,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowLeftRight,
  Check,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  TradeBlockListing,
  TradeOffer,
  TradeHistory,
  PackageDeal,
  getTradeBlock,
  addToTradeBlock,
  removeFromTradeBlock,
  generateSimulatedOffers,
  evaluateOffer,
  acceptOffer,
  declineOffer,
  counterOffer,
  createPackageDeal,
  getTradeHistory,
  getTradeStats,
} from '../lib/tradeBlockService';

interface TradeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

type TabId = 'block' | 'offers' | 'history' | 'packages';

const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'block', label: 'Trade Block', icon: <Tag size={16} /> },
  { id: 'offers', label: 'Offers', icon: <Bell size={16} /> },
  { id: 'history', label: 'History', icon: <History size={16} /> },
  { id: 'packages', label: 'Package Deals', icon: <Package size={16} /> },
];

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < fullStars
              ? 'text-amber-400 fill-amber-400'
              : i === fullStars && hasHalf
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-slate-600'
          }
        />
      ))}
      <span className="text-[10px] text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: 'accept' | 'counter' | 'decline' }) {
  const config = {
    accept: { text: 'Accept', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: <ThumbsUp size={10} /> },
    counter: { text: 'Counter', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <ArrowLeftRight size={10} /> },
    decline: { text: 'Decline', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <ThumbsDown size={10} /> },
  };
  const c = config[rec];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.color} ${c.bg} border ${c.border}`}>
      {c.icon}
      {c.text}
    </span>
  );
}

export const TradeBlockModal: React.FC<TradeBlockModalProps> = ({
  isOpen,
  onClose,
  inventory,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('block');
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [cardPickerSearch, setCardPickerSearch] = useState('');
  const [editingListing, setEditingListing] = useState<string | null>(null);
  const [askPrice, setAskPrice] = useState('');
  const [minAcceptable, setMinAcceptable] = useState('');
  const [preferences, setPreferences] = useState('');
  const [counterInput, setCounterInput] = useState<Record<string, string>>({});
  const [selectedPackageCards, setSelectedPackageCards] = useState<string[]>([]);
  const [currentPackage, setCurrentPackage] = useState<PackageDeal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const listings = useMemo(() => getTradeBlock(), [refreshKey]);

  const offers = useMemo(() => {
    if (listings.length === 0) return [];
    return generateSimulatedOffers(listings, inventory);
  }, [listings, inventory, refreshKey]);

  const history = useMemo(() => {
    return getTradeHistory().map(h => {
      const card = inventory.find(c => c.id === h.cardId);
      return {
        ...h,
        player: card?.player ?? (h.player || 'Unknown'),
        sport: card?.sport ?? h.sport,
        purchasePrice: card?.purchasePrice ?? h.purchasePrice,
        roi: card && card.purchasePrice > 0
          ? ((h.finalPrice - card.purchasePrice) / card.purchasePrice) * 100
          : h.roi,
      };
    });
  }, [inventory, refreshKey]);

  const stats = useMemo(() => getTradeStats(inventory), [inventory, refreshKey]);

  const listedCardIds = useMemo(() => new Set(listings.map(l => l.cardId)), [listings]);

  const availableCards = useMemo(() => {
    return inventory
      .filter(c => !listedCardIds.has(c.id) && c.status !== 'sold')
      .filter(c => {
        if (!cardPickerSearch) return true;
        const q = cardPickerSearch.toLowerCase();
        return (
          c.player.toLowerCase().includes(q) ||
          c.set.toLowerCase().includes(q) ||
          c.sport.toLowerCase().includes(q)
        );
      });
  }, [inventory, listedCardIds, cardPickerSearch]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleAddCard = useCallback((card: CardInventory) => {
    const value = card.currentValue ?? card.purchasePrice;
    const ask = Math.round(value * 1.15 * 100) / 100;
    const min = Math.round(value * 0.9 * 100) / 100;
    addToTradeBlock(card.id, ask, min, '');
    setShowCardPicker(false);
    setCardPickerSearch('');
    refresh();
  }, [refresh]);

  const handleRemoveCard = useCallback((cardId: string) => {
    removeFromTradeBlock(cardId);
    refresh();
  }, [refresh]);

  const handleStartEdit = useCallback((listing: TradeBlockListing) => {
    setEditingListing(listing.cardId);
    setAskPrice(listing.askPrice.toString());
    setMinAcceptable(listing.minAcceptable.toString());
    setPreferences(listing.preferences);
  }, []);

  const handleSaveEdit = useCallback((cardId: string) => {
    const ask = parseFloat(askPrice) || 0;
    const min = parseFloat(minAcceptable) || 0;
    if (ask > 0) {
      addToTradeBlock(cardId, ask, min > 0 ? min : ask * 0.8, preferences);
    }
    setEditingListing(null);
    refresh();
  }, [askPrice, minAcceptable, preferences, refresh]);

  const handleAcceptOffer = useCallback((offerId: string) => {
    acceptOffer(offerId);
    refresh();
  }, [refresh]);

  const handleDeclineOffer = useCallback((offerId: string) => {
    declineOffer(offerId);
    refresh();
  }, [refresh]);

  const handleCounterOffer = useCallback((offerId: string) => {
    const amount = parseFloat(counterInput[offerId] || '');
    if (amount > 0) {
      counterOffer(offerId, amount);
      setCounterInput(prev => {
        const next = { ...prev };
        delete next[offerId];
        return next;
      });
      refresh();
    }
  }, [counterInput, refresh]);

  const handleTogglePackageCard = useCallback((cardId: string) => {
    setSelectedPackageCards(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId],
    );
    setCurrentPackage(null);
  }, []);

  const handleBuildPackage = useCallback(() => {
    if (selectedPackageCards.length < 2) return;
    const pkg = createPackageDeal(selectedPackageCards, inventory);
    setCurrentPackage(pkg);
  }, [selectedPackageCards, inventory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Repeat size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Trade Block & <span className="text-emerald-400">Offer Management</span>
              </h2>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                <span>{stats.activeListings} listed</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className={stats.pendingOffers > 0 ? 'text-amber-400' : ''}>{stats.pendingOffers} pending offers</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>{stats.completedTrades} completed</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 flex-shrink-0">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const hasBadge = tab.id === 'offers' && stats.pendingOffers > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                    : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {hasBadge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {stats.pendingOffers}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">

          {/* ---- Trade Block Tab ---- */}
          {activeTab === 'block' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  Cards Available for Trade
                </p>
                <button
                  onClick={() => setShowCardPicker(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus size={14} />
                  Add Card
                </button>
              </div>

              {/* Card Picker Overlay */}
              {showCardPicker && (
                <div className="p-4 bg-slate-800 border border-slate-600 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Select a Card to List</p>
                    <button
                      onClick={() => { setShowCardPicker(false); setCardPickerSearch(''); }}
                      className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={cardPickerSearch}
                      onChange={e => setCardPickerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
                    {availableCards.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">No matching cards available</p>
                    )}
                    {availableCards.slice(0, 20).map(card => (
                      <button
                        key={card.id}
                        onClick={() => handleAddCard(card)}
                        className="w-full flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-700 border border-slate-700/50 hover:border-emerald-500/30 rounded-xl text-left text-xs transition-all"
                      >
                        <span className="text-white font-medium truncate flex-1">{card.player}</span>
                        <span className="text-slate-500">{card.year} {card.set}</span>
                        <span className="text-slate-400">{card.sport}</span>
                        <span className="font-mono text-emerald-400">
                          ${(card.currentValue ?? card.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <ChevronRight size={14} className="text-slate-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Listings */}
              {listings.length === 0 && !showCardPicker && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Tag size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No cards on the trade block</p>
                  <p className="text-xs text-slate-600 mt-1">Add cards to start receiving offers</p>
                </div>
              )}

              <div className="space-y-2">
                {listings.map(listing => {
                  const card = inventory.find(c => c.id === listing.cardId);
                  if (!card) return null;
                  const isEditing = editingListing === listing.cardId;
                  const marketValue = card.currentValue ?? card.purchasePrice;
                  const askVsMarket = ((listing.askPrice - marketValue) / marketValue) * 100;

                  return (
                    <div
                      key={listing.id}
                      className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{card.player}</p>
                          <p className="text-[10px] text-slate-500">{card.year} {card.set} &middot; {card.sport} &middot; {card.condition}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono text-emerald-400">${listing.askPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="text-[10px] text-slate-500">
                            Min: ${listing.minAcceptable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          askVsMarket > 10 ? 'text-amber-400 bg-amber-500/10' :
                          askVsMarket < -5 ? 'text-green-400 bg-green-500/10' :
                          'text-slate-400 bg-slate-700/50'
                        }`}>
                          {askVsMarket > 0 ? '+' : ''}{askVsMarket.toFixed(0)}% vs mkt
                        </span>
                        <button
                          onClick={() => isEditing ? handleSaveEdit(listing.cardId) : handleStartEdit(listing)}
                          className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                          {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
                        </button>
                        <button
                          onClick={() => handleRemoveCard(listing.cardId)}
                          className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {isEditing && (
                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700">
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Ask Price</label>
                            <input
                              type="number"
                              value={askPrice}
                              onChange={e => setAskPrice(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Min Acceptable</label>
                            <input
                              type="number"
                              value={minAcceptable}
                              onChange={e => setMinAcceptable(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Preferences</label>
                            <input
                              type="text"
                              value={preferences}
                              onChange={e => setPreferences(e.target.value)}
                              placeholder="e.g. Cash only, no lowballs"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>
                      )}

                      {listing.preferences && !isEditing && (
                        <p className="text-[10px] text-slate-500 italic">{listing.preferences}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Offers Tab ---- */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Incoming Offers ({offers.length})
              </p>

              {offers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Bell size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No pending offers</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {listings.length === 0
                      ? 'List cards on the trade block to start receiving offers'
                      : 'Check back soon for new offers'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {offers.map(offer => {
                  const listing = listings.find(l => l.cardId === offer.cardId);
                  const card = inventory.find(c => c.id === offer.cardId);
                  if (!listing || !card) return null;

                  const evaluation = evaluateOffer(offer, listing, card);
                  const offerVsAsk = ((offer.offerAmount - listing.askPrice) / listing.askPrice) * 100;
                  const timeAgo = Math.round((Date.now() - new Date(offer.createdAt).getTime()) / (1000 * 60 * 60));

                  return (
                    <div
                      key={offer.id}
                      className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4"
                    >
                      {/* Offer Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-700 rounded-lg">
                              <Shield size={14} className="text-slate-400" />
                            </div>
                            <span className="text-sm text-white font-medium">{offer.offererName}</span>
                            <StarRating rating={offer.offererReputation} />
                          </div>
                          <p className="text-[10px] text-slate-500 pl-8">
                            Offer for {card.player} &middot; {timeAgo}h ago
                          </p>
                        </div>
                        <RecommendationBadge rec={evaluation.recommendation} />
                      </div>

                      {/* Price Comparison */}
                      <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl">
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Offer</p>
                          <p className="text-lg font-mono text-white">
                            ${offer.offerAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-center px-4">
                          <span className={`text-sm font-mono font-bold ${
                            offerVsAsk >= 0 ? 'text-green-400' : offerVsAsk >= -15 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {offerVsAsk > 0 ? '+' : ''}{offerVsAsk.toFixed(1)}%
                          </span>
                          <p className="text-[9px] text-slate-600">vs ask</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ask</p>
                          <p className="text-lg font-mono text-slate-400">
                            ${listing.askPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-xs text-slate-400 italic px-1">&ldquo;{offer.message}&rdquo;</p>

                      {/* AI Reasoning */}
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                          AI Analysis ({evaluation.confidence}% confidence)
                        </p>
                        <p className="text-xs text-slate-300">{evaluation.reasoning}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                          <ThumbsUp size={12} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineOffer(offer.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                          <ThumbsDown size={12} />
                          Decline
                        </button>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <input
                            type="number"
                            placeholder="Counter $"
                            value={counterInput[offer.id] || ''}
                            onChange={e => setCounterInput(prev => ({ ...prev, [offer.id]: e.target.value }))}
                            className="w-28 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            onClick={() => handleCounterOffer(offer.id)}
                            disabled={!counterInput[offer.id]}
                            className="flex items-center gap-1 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowLeftRight size={12} />
                            Counter
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- History Tab ---- */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  Completed Trades ({history.length})
                </p>
                {history.length > 0 && (
                  <span className="text-xs text-slate-400">
                    Avg ROI: <span className={`font-mono font-bold ${stats.avgTradeROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.avgTradeROI > 0 ? '+' : ''}{stats.avgTradeROI.toFixed(1)}%
                    </span>
                  </span>
                )}
              </div>

              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <History size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No completed trades yet</p>
                  <p className="text-xs text-slate-600 mt-1">Accept offers to build your trade history</p>
                </div>
              )}

              <div className="space-y-2">
                {history.map(trade => {
                  const completedDate = new Date(trade.completedAt);
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{trade.player}</p>
                        <p className="text-[10px] text-slate-500">
                          {trade.sport} &middot; Sold to {trade.offererName} &middot; {completedDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Ask:</span>
                          <span className="font-mono text-slate-400">${trade.askPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Sold:</span>
                          <span className="font-mono text-white">${trade.finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        trade.roi >= 0
                          ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                          : 'text-red-400 bg-red-500/10 border border-red-500/20'
                      }`}>
                        {trade.roi >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trade.roi > 0 ? '+' : ''}{trade.roi.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Package Deals Tab ---- */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Bundle Builder
              </p>
              <p className="text-xs text-slate-400">
                Select 2 or more cards to create a package deal with combined valuation.
              </p>

              {/* Card Selection */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
                {inventory.filter(c => c.status !== 'sold').map(card => {
                  const isSelected = selectedPackageCards.includes(card.id);
                  const value = card.currentValue ?? card.purchasePrice;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleTogglePackageCard(card.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs transition-all border ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-emerald-400 bg-emerald-500/20' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={12} className="text-emerald-400" />}
                      </div>
                      <span className="font-medium truncate flex-1">{card.player}</span>
                      <span className="text-slate-500">{card.year} {card.set}</span>
                      <span className="text-slate-500">{card.sport}</span>
                      <span className="font-mono text-emerald-400 w-20 text-right">
                        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Build Button */}
              <button
                onClick={handleBuildPackage}
                disabled={selectedPackageCards.length < 2}
                className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-bebas tracking-widest text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Package size={20} />
                Build Package ({selectedPackageCards.length} cards)
              </button>

              {/* Package Result */}
              {currentPackage && (
                <div className="p-5 bg-slate-800/50 border border-emerald-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-emerald-400" />
                    <p className="text-sm font-bold text-white">Package Deal Summary</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Combined Value</p>
                      <p className="text-lg font-mono text-white">
                        ${currentPackage.combinedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Package Price</p>
                      <p className="text-lg font-mono text-emerald-400">
                        ${currentPackage.packagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Bundle Discount</p>
                      <p className="text-lg font-mono text-amber-400">
                        -${currentPackage.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Suggested Ask</p>
                      <p className="text-lg font-mono text-white">
                        ${currentPackage.suggestedAsk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Fairness Score */}
                  <div className="p-4 bg-slate-900/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fairness Score</p>
                      <span className={`text-sm font-mono font-bold ${
                        currentPackage.fairnessScore >= 70 ? 'text-green-400' :
                        currentPackage.fairnessScore >= 40 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {currentPackage.fairnessScore}/100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentPackage.fairnessScore >= 70 ? 'bg-green-500' :
                          currentPackage.fairnessScore >= 40 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${currentPackage.fairnessScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {currentPackage.fairnessScore >= 70
                        ? 'Well-balanced package with fair value distribution'
                        : currentPackage.fairnessScore >= 40
                          ? 'Moderate value spread - consider adjusting card selection'
                          : 'Large value disparity - buyers may prefer individual purchases'}
                    </p>
                  </div>

                  {/* Cards in Package */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Included Cards</p>
                    {currentPackage.cards.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-slate-900/30 rounded-lg text-xs">
                        <span className="text-white">{c.player}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{c.sport}</span>
                          <span className="font-mono text-slate-300">${c.currentValue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeBlockModal;
