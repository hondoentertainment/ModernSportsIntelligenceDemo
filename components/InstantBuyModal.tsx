import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Zap, Clock, TrendingUp, Shield, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CardInventory } from '../types';
import { generateInstantBuyQuote, isQuoteValid, recordInstantBuy, InstantBuyQuote } from '../lib/instantBuyService';

interface InstantBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
  onAccept: (card: CardInventory, payout: number) => void;
}

const InstantBuyModal: React.FC<InstantBuyModalProps> = ({ isOpen, onClose, card, onAccept }) => {
  const [quote, setQuote] = useState<InstantBuyQuote | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [speedWindowActive, setSpeedWindowActive] = useState(true);
  const [quoteCreatedAt] = useState(Date.now());

  // Generate quote on open
  useEffect(() => {
    if (isOpen && card) {
      setQuote(generateInstantBuyQuote(card));
      setAccepted(false);
      setSpeedWindowActive(true);
    }
  }, [isOpen, card]);

  // Countdown timer
  useEffect(() => {
    if (!quote || !isOpen || accepted) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(quote.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);

      // Speed bonus window: first 5 minutes
      const elapsed = now - quoteCreatedAt;
      if (elapsed > 5 * 60 * 1000) {
        setSpeedWindowActive(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [quote, isOpen, accepted, quoteCreatedAt]);

  const handleAccept = useCallback(() => {
    if (!quote || !isQuoteValid(quote)) return;
    recordInstantBuy(quote, speedWindowActive);
    const finalPayout = speedWindowActive
      ? Math.round((quote.netPayout + quote.speedBonus) * 100) / 100
      : quote.netPayout;
    setAccepted(true);
    onAccept(card, finalPayout);
  }, [quote, speedWindowActive, card, onAccept]);

  if (!isOpen || !quote) return null;

  const isExpired = timeLeft === 'Expired';
  const savingsVsEbay = Math.round((quote.comparisons.ebayNet - quote.netPayout) * 100) / 100;
  const finalPayout = speedWindowActive
    ? Math.round((quote.netPayout + quote.speedBonus) * 100) / 100
    : quote.netPayout;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-charcoal/60 to-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 rounded-2xl border border-brand-lime/20">
              <Zap size={24} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">Instant Liquidation</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">MSI House Buy • Instant Payout</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-3 bg-brand-charcoal hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} className="text-brand-muted" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {accepted ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center border-2 border-brand-green/30">
                <CheckCircle2 size={40} className="text-brand-green" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bebas tracking-widest text-white">Sale Complete</h3>
                <p className="text-brand-muted text-sm">
                  <span className="font-bold text-white">{card.player}</span> sold to MSI House
                </p>
              </div>
              <div className="bg-brand-charcoal/50 rounded-2xl p-6 border border-brand-green/20 text-center">
                <p className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-1">Payout Credited</p>
                <p className="text-4xl font-mono font-bold text-brand-green">${finalPayout.toLocaleString()}</p>
                {speedWindowActive && (
                  <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mt-2">
                    +${quote.speedBonus.toLocaleString()} Speed Bonus Applied
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-brand-lime text-brand-charcoal font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Card Info */}
              <div className="flex items-center gap-6 bg-brand-charcoal/30 rounded-2xl p-6 border border-slate-800">
                {card.image && (
                  <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img src={card.image} alt={card.player} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{card.player}</h3>
                  <p className="text-xs text-brand-muted">{card.year} {card.manufacturer} {card.set}</p>
                  {card.isGraded && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-lime/10 border border-brand-lime/20 rounded-lg text-[10px] font-black text-brand-lime uppercase">
                      {card.gradingCompany} {card.grade}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">FMV</p>
                  <p className="text-2xl font-mono font-bold text-white">${quote.fairMarketValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Quote Timer */}
              <div className={`flex items-center justify-between px-6 py-4 rounded-2xl border ${isExpired ? 'bg-brand-red/10 border-brand-red/20' : 'bg-brand-charcoal/50 border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <Clock size={16} className={isExpired ? 'text-brand-red' : 'text-brand-lime'} />
                  <span className="text-xs font-black uppercase tracking-widest text-brand-muted">Quote Expires</span>
                </div>
                <span className={`text-xl font-mono font-bold ${isExpired ? 'text-brand-red' : 'text-white'}`}>
                  {timeLeft}
                </span>
              </div>

              {/* Speed Bonus Banner */}
              {speedWindowActive && !isExpired && (
                <div className="flex items-center gap-3 px-6 py-4 bg-brand-lime/5 border border-brand-lime/20 rounded-2xl animate-pulse">
                  <Zap size={16} className="text-brand-lime" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-brand-lime">Speed Bonus Active</p>
                    <p className="text-[10px] text-brand-muted">Accept within 5 min for +${quote.speedBonus.toLocaleString()} bonus</p>
                  </div>
                  <span className="text-lg font-mono font-bold text-brand-lime">+{Math.round(quote.speedBonus / quote.instantBuyPrice * 100)}%</span>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Pricing Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Fair Market Value</span>
                    <span className="text-sm font-mono text-white">${quote.fairMarketValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-300">House Discount</span>
                      <span className="px-2 py-0.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-[9px] font-black text-brand-orange uppercase">{quote.discountTier}</span>
                    </div>
                    <span className="text-sm font-mono text-brand-red">-{quote.discountPercent}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Instant Buy Price</span>
                    <span className="text-sm font-mono text-white">${quote.instantBuyPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Platform Fee (2%)</span>
                    <span className="text-sm font-mono text-brand-red">-${quote.platformFee.toLocaleString()}</span>
                  </div>
                  {speedWindowActive && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-brand-lime">Speed Bonus</span>
                      <span className="text-sm font-mono text-brand-lime">+${quote.speedBonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="h-px bg-slate-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-white">Your Payout</span>
                    <span className="text-2xl font-mono font-bold text-brand-lime">${finalPayout.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="bg-brand-charcoal/30 rounded-2xl p-6 border border-slate-800 space-y-4">
                <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest">vs. Marketplace Sale</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-charcoal/50 rounded-xl p-4 border border-brand-lime/10">
                    <p className="text-[9px] font-black text-brand-lime uppercase tracking-widest mb-1">MSI Instant</p>
                    <p className="text-xl font-mono font-bold text-white">${finalPayout.toLocaleString()}</p>
                    <p className="text-[10px] text-brand-muted mt-1">Paid now</p>
                  </div>
                  <div className="bg-brand-charcoal/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">eBay Net</p>
                    <p className="text-xl font-mono font-bold text-slate-400">${quote.comparisons.ebayNet.toLocaleString()}</p>
                    <p className="text-[10px] text-brand-muted mt-1">~{quote.comparisons.timeSaved} wait</p>
                  </div>
                </div>
                {savingsVsEbay > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-brand-muted">
                    <AlertTriangle size={12} className="text-brand-orange" />
                    <span>eBay nets ${savingsVsEbay.toLocaleString()} more, but takes {quote.comparisons.timeSaved} + shipping hassle</span>
                  </div>
                )}
              </div>

              {/* Liquidity Score */}
              <div className="flex items-center gap-4 px-6 py-4 bg-brand-charcoal/30 rounded-2xl border border-slate-800">
                <Shield size={18} className="text-brand-teal" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Liquidity Score: {quote.liquidityScore}/100</p>
                  <p className="text-[10px] text-brand-muted">
                    {quote.liquidityScore >= 70
                      ? 'High demand — minimal discount applied'
                      : quote.liquidityScore >= 40
                        ? 'Moderate market depth — standard discount'
                        : 'Limited buyers — higher discount for instant exit'}
                  </p>
                </div>
                <div className="w-16 h-2 bg-brand-charcoal rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${quote.liquidityScore}%`,
                      backgroundColor: quote.liquidityScore >= 70 ? '#22C55E' : quote.liquidityScore >= 40 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-brand-charcoal border border-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isExpired}
                  className="flex-1 py-4 bg-brand-lime text-brand-charcoal font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> Sell Instantly
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstantBuyModal;
