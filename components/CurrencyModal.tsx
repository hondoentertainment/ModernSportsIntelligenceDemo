import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Globe,
  ArrowRightLeft,
  BarChart3,
  Shield,
  Bell,
  TrendingUp,
  TrendingDown,
  Check,
  AlertCircle,
  Calculator,
  Search,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { CardInventory } from '../types';
import {
  CurrencyCode,
  CURRENCIES,
  CURRENCY_CODES,
  getSelectedCurrency,
  setSelectedCurrency,
  getAllExchangeRates,
  getExchangeRate,
  convertCurrency,
  formatCurrency,
  getCurrencyTrend,
  getPortfolioInCurrency,
  getCurrencyImpact,
  getCrossBorderComparison,
  calculateImportDuty,
  getDutyCountries,
  getInternationalAlerts,
  CrossBorderComparison,
  DutyEstimate,
} from '../lib/utils/currencyService';

// ── Types ────────────────────────────────────────────────────────────────────────

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'converter' | 'comparison' | 'duty' | 'trends' | 'alerts';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'converter',  label: 'Converter',  icon: <ArrowRightLeft size={16} /> },
  { id: 'comparison', label: 'Compare',    icon: <Search size={16} /> },
  { id: 'duty',       label: 'Duty',       icon: <Shield size={16} /> },
  { id: 'trends',     label: 'Trends',     icon: <BarChart3 size={16} /> },
  { id: 'alerts',     label: 'Alerts',     icon: <Bell size={16} /> },
];

// ── Converter Tab ────────────────────────────────────────────────────────────────

const ConverterTab: React.FC<{
  cards: CardInventory[];
  activeCurrency: CurrencyCode;
  onCurrencyChange: (_code: CurrencyCode) => void;
}> = ({ cards, activeCurrency, onCurrencyChange }) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(activeCurrency === 'USD' ? 'EUR' : activeCurrency);
  const [amount, setAmount] = useState<string>('100');

  const converted = useMemo(() => {
    const val = parseFloat(amount) || 0;
    return convertCurrency(val, fromCurrency, toCurrency);
  }, [amount, fromCurrency, toCurrency]);

  const rate = useMemo(() => {
    const fromRate = getExchangeRate(fromCurrency);
    const toRate = getExchangeRate(toCurrency);
    return toRate / fromRate;
  }, [fromCurrency, toCurrency]);

  const portfolio = useMemo(
    () => getPortfolioInCurrency(cards, activeCurrency),
    [cards, activeCurrency]
  );

  const rates = useMemo(() => getAllExchangeRates(), []);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Display Currency
        </p>
        <div className="grid grid-cols-5 gap-2">
          {CURRENCY_CODES.map(code => {
            const info = CURRENCIES[code];
            const isActive = code === activeCurrency;
            return (
              <button
                key={code}
                onClick={() => onCurrencyChange(code)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="text-sm font-bold">{info.symbol}</span>
                <span className="text-[10px] font-bold">{code}</span>
                {isActive && <Check size={10} className="text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Value</p>
          <p className="text-xl font-bebas tracking-wider text-white">
            {formatCurrency(portfolio.totalValue, activeCurrency)}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Cost</p>
          <p className="text-xl font-bebas tracking-wider text-slate-300">
            {formatCurrency(portfolio.totalCost, activeCurrency)}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">ROI</p>
          <p className={`text-xl font-bebas tracking-wider ${portfolio.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.roi >= 0 ? '+' : ''}{portfolio.roi.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Quick Converter */}
      <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Quick Converter
        </p>

        <div className="flex items-center gap-3">
          {/* From */}
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 mb-1 block">From</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value as CurrencyCode)}
                className="bg-slate-900 border border-slate-600 rounded-xl px-2 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {CURRENCY_CODES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap */}
          <button
            onClick={handleSwap}
            className="p-2.5 bg-slate-700 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl transition-all mt-4"
          >
            <ArrowRightLeft size={16} />
          </button>

          {/* To */}
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 mb-1 block">To</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={CURRENCIES[toCurrency].decimalPlaces === 0
                  ? Math.round(converted).toLocaleString()
                  : converted.toFixed(2)
                }
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-emerald-400 font-mono"
              />
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value as CurrencyCode)}
                className="bg-slate-900 border border-slate-600 rounded-xl px-2 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {CURRENCY_CODES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          1 {fromCurrency} = {rate < 10 ? rate.toFixed(4) : rate.toFixed(2)} {toCurrency}
        </p>
      </div>

      {/* Exchange Rate Table */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Live Exchange Rates (vs USD)
        </p>
        <div className="space-y-1.5">
          {rates.map(r => {
            const info = CURRENCIES[r.to];
            return (
              <div
                key={r.to}
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/30 border border-slate-700/50 rounded-xl"
              >
                <span className="text-sm font-bold text-white w-10">{r.to}</span>
                <span className="text-xs text-slate-400 flex-1">{info.name}</span>
                <span className="text-xs font-mono text-slate-300 w-20 text-right">
                  {r.rate < 10 ? r.rate.toFixed(4) : r.rate.toFixed(2)}
                </span>
                <span className={`text-xs font-bold w-16 text-right ${
                  r.change24h > 0 ? 'text-red-400' : r.change24h < 0 ? 'text-green-400' : 'text-slate-500'
                }`}>
                  {r.change24h > 0 ? '+' : ''}{r.change24h.toFixed(2)}%
                </span>
                <span className={`text-xs w-16 text-right ${
                  r.change7d > 0 ? 'text-red-400' : r.change7d < 0 ? 'text-green-400' : 'text-slate-500'
                }`}>
                  7d: {r.change7d > 0 ? '+' : ''}{r.change7d.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Comparison Tab ───────────────────────────────────────────────────────────────

const ComparisonTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const activeCards = useMemo(
    () => cards.filter(c => c.status !== 'sold' && (c.currentValue ?? 0) > 20).slice(0, 10),
    [cards]
  );
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);

  const comparison: CrossBorderComparison | null = useMemo(() => {
    if (activeCards.length === 0) return null;
    return getCrossBorderComparison(activeCards[selectedCardIdx]);
  }, [activeCards, selectedCardIdx]);

  if (activeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Search size={32} className="mb-3 opacity-50" />
        <p className="text-sm">Add cards to your inventory to compare cross-border prices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Card Selector */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Select Card
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activeCards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setSelectedCardIdx(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                idx === selectedCardIdx
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {card.player} ({card.year})
            </button>
          ))}
        </div>
      </div>

      {comparison && (
        <>
          {/* Best Deal Banner */}
          {comparison.maxSavingsUSD > 0 && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <TrendingDown size={18} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Save {formatCurrency(comparison.maxSavingsUSD, 'USD')} ({comparison.savingsPercent}%)
                </p>
                <p className="text-xs text-slate-400">
                  Best price on {comparison.bestDealMarketplace}
                </p>
              </div>
            </div>
          )}

          {/* Marketplace Listings */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              Marketplace Comparison — {comparison.cardName}
            </p>
            <div className="space-y-2">
              {comparison.listings
                .sort((a, b) => a.totalUSD - b.totalUSD)
                .map(listing => (
                <div
                  key={listing.marketplace}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    listing.isBestDeal
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                >
                  {listing.isBestDeal && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
                      Best
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{listing.marketplace}</p>
                    <p className="text-xs text-slate-500">
                      Price: {formatCurrency(listing.localPrice, listing.currency)} + {formatCurrency(listing.shippingLocal, listing.currency)} shipping
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono text-white">
                      {formatCurrency(listing.totalUSD, 'USD')}
                    </p>
                    <p className={`text-xs font-bold ${
                      listing.netSavingsUSD > 0 ? 'text-green-400' : listing.netSavingsUSD < 0 ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {listing.netSavingsUSD > 0 ? 'Save ' : listing.netSavingsUSD < 0 ? 'Extra ' : ''}
                      {listing.netSavingsUSD !== 0 ? formatCurrency(Math.abs(listing.netSavingsUSD), 'USD') : 'Base'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Duty Tab ─────────────────────────────────────────────────────────────────────

const DutyTab: React.FC = () => {
  const [itemValue, setItemValue] = useState<string>('250');
  const [destination, setDestination] = useState<string>('UK');
  const countries = useMemo(() => getDutyCountries(), []);

  const estimate: DutyEstimate = useMemo(() => {
    const val = parseFloat(itemValue) || 0;
    return calculateImportDuty(val, destination);
  }, [itemValue, destination]);

  return (
    <div className="space-y-6">
      <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Import Duty Calculator
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 mb-1 block">Item Value (USD)</label>
            <div className="flex items-center gap-2">
              <Calculator size={14} className="text-slate-500" />
              <input
                type="number"
                value={itemValue}
                onChange={e => setItemValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="250"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 mb-1 block">Destination</label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <span className="text-xs text-slate-400">Item Value</span>
          <span className="text-sm font-mono text-white">{formatCurrency(estimate.itemValueUSD, 'USD')}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <span className="text-xs text-slate-400">
            Customs Duty ({(estimate.dutyRate * 100).toFixed(1)}%)
          </span>
          <span className={`text-sm font-mono ${estimate.dutyAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {estimate.dutyAmount > 0 ? formatCurrency(estimate.dutyAmount, 'USD') : 'Free'}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <span className="text-xs text-slate-400">
            VAT / Tax ({(estimate.vatRate * 100).toFixed(1)}%)
          </span>
          <span className={`text-sm font-mono ${estimate.vatAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {estimate.vatAmount > 0 ? formatCurrency(estimate.vatAmount, 'USD') : 'Free'}
          </span>
        </div>
        {estimate.handlingFee > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
            <span className="text-xs text-slate-400">Handling Fee</span>
            <span className="text-sm font-mono text-amber-400">
              {formatCurrency(estimate.handlingFee, 'USD')}
            </span>
          </div>
        )}
        <div className="h-px bg-slate-700" />
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl">
          <span className="text-xs font-bold text-white">Total Duty & Tax</span>
          <span className={`text-sm font-bold font-mono ${estimate.totalDutyAndTax > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {estimate.totalDutyAndTax > 0 ? formatCurrency(estimate.totalDutyAndTax, 'USD') : 'No duties'}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <span className="text-sm font-bold text-white">Total Landed Cost</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {formatCurrency(estimate.totalLandedCost, 'USD')}
          </span>
        </div>
      </div>

      {/* Quick Reference */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Duty-Free Thresholds
        </p>
        <div className="grid grid-cols-2 gap-2">
          {countries.map(c => {
            const _info = calculateImportDuty(0, c.code);
            return (
              <div
                key={c.code}
                className="flex items-center justify-between px-3 py-2 bg-slate-800/20 rounded-lg"
              >
                <span className="text-xs text-slate-400">{c.name}</span>
                <span className="text-xs font-mono text-slate-300">
                  &lt;{formatCurrency(
                    c.code === 'JP' ? 10000 :
                    c.code === 'AU' ? 1000 :
                    c.code === 'US' ? 800 :
                    c.code === 'CH' ? 300 :
                    c.code === 'UK' ? 135 :
                    c.code === 'EU' ? 150 :
                    c.code === 'CA' ? 20 :
                    50,
                    'USD'
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Trends Tab ───────────────────────────────────────────────────────────────────

const TrendsTab: React.FC<{ cards: CardInventory[]; activeCurrency: CurrencyCode }> = ({ cards, activeCurrency }) => {
  const [trendCurrency, setTrendCurrency] = useState<CurrencyCode>(activeCurrency === 'USD' ? 'EUR' : activeCurrency);
  const trendData = useMemo(() => getCurrencyTrend(trendCurrency, 30), [trendCurrency]);
  const impact = useMemo(() => getCurrencyImpact(cards, trendCurrency), [cards, trendCurrency]);

  const minRate = useMemo(() => Math.min(...trendData.map(p => p.rate)), [trendData]);
  const maxRate = useMemo(() => Math.max(...trendData.map(p => p.rate)), [trendData]);
  const padding = (maxRate - minRate) * 0.1 || 0.01;

  // Portfolio value over time in target currency
  const portfolioTrend = useMemo(() => {
    const totalValueUSD = cards
      .filter(c => c.status !== 'sold')
      .reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);

    return trendData.map(point => ({
      date: point.date,
      rate: point.rate,
      portfolioValue: Math.round(totalValueUSD * point.rate * 100) / 100,
    }));
  }, [cards, trendData]);

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CURRENCY_CODES.filter(c => c !== 'USD').map(code => (
          <button
            key={code}
            onClick={() => setTrendCurrency(code)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
              code === trendCurrency
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {code}
          </button>
        ))}
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">24h</p>
          <p className={`text-lg font-bebas tracking-wider ${
            impact.change24hPercent < 0 ? 'text-green-400' : impact.change24hPercent > 0 ? 'text-red-400' : 'text-slate-300'
          }`}>
            {impact.change24hPercent > 0 ? '+' : ''}{impact.change24hPercent.toFixed(2)}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">7d</p>
          <p className={`text-lg font-bebas tracking-wider ${
            impact.change7dPercent < 0 ? 'text-green-400' : impact.change7dPercent > 0 ? 'text-red-400' : 'text-slate-300'
          }`}>
            {impact.change7dPercent > 0 ? '+' : ''}{impact.change7dPercent.toFixed(2)}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">30d</p>
          <p className={`text-lg font-bebas tracking-wider ${
            impact.change30dPercent < 0 ? 'text-green-400' : impact.change30dPercent > 0 ? 'text-red-400' : 'text-slate-300'
          }`}>
            {impact.change30dPercent > 0 ? '+' : ''}{impact.change30dPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Exchange Rate Chart */}
      <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">
          USD/{trendCurrency} — 30-Day Trend
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="currencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={v => v.slice(5)}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                domain={[minRate - padding, maxRate + padding]}
                tickFormatter={v => trendCurrency === 'JPY' ? v.toFixed(1) : v.toFixed(3)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [
                  trendCurrency === 'JPY' ? value.toFixed(2) : value.toFixed(4),
                  `1 USD = ${trendCurrency}`
                ]}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#currencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Value Chart */}
      <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">
          Portfolio Value in {trendCurrency} — 30-Day Impact
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={v => v.slice(5)}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={v => trendCurrency === 'JPY'
                  ? `${(v / 1000).toFixed(0)}K`
                  : `${CURRENCIES[trendCurrency].symbol}${v.toLocaleString()}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [
                  formatCurrency(value, trendCurrency),
                  'Portfolio Value'
                ]}
              />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FX Impact */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
        impact.trend === 'favorable'
          ? 'bg-green-500/5 border-green-500/20'
          : impact.trend === 'unfavorable'
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-slate-800/30 border-slate-700'
      }`}>
        {impact.trend === 'favorable' ? (
          <TrendingUp size={18} className="text-green-400 flex-shrink-0" />
        ) : impact.trend === 'unfavorable' ? (
          <TrendingDown size={18} className="text-red-400 flex-shrink-0" />
        ) : (
          <ArrowRightLeft size={18} className="text-slate-400 flex-shrink-0" />
        )}
        <div>
          <p className={`text-sm font-bold ${
            impact.trend === 'favorable' ? 'text-green-400' :
            impact.trend === 'unfavorable' ? 'text-red-400' : 'text-slate-300'
          }`}>
            {impact.trend === 'favorable' ? 'Favorable' :
             impact.trend === 'unfavorable' ? 'Unfavorable' : 'Neutral'} Currency Environment
          </p>
          <p className="text-xs text-slate-400">
            FX movement has {impact.trend === 'favorable' ? 'increased' : impact.trend === 'unfavorable' ? 'decreased' : 'not significantly affected'} your portfolio value by {formatCurrency(Math.abs(impact.impactAmount), trendCurrency)} in {trendCurrency} terms.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Alerts Tab ───────────────────────────────────────────────────────────────────

const AlertsTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const alerts = useMemo(() => getInternationalAlerts(cards), [cards]);

  const urgencyConfig: Record<string, { bg: string; border: string; text: string }> = {
    high:   { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400' },
    medium: { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400' },
    low:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400' },
  };

  const typeIcons: Record<string, React.ReactNode> = {
    currency_advantage: <TrendingDown size={16} />,
    duty_free:          <Shield size={16} />,
    price_gap:          <BarChart3 size={16} />,
    rate_swing:         <ArrowRightLeft size={16} />,
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Bell size={32} className="mb-3 opacity-50" />
        <p className="text-sm">No international alerts at this time.</p>
        <p className="text-xs text-slate-600 mt-1">Alerts trigger when currency movements create buying opportunities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
        {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}
      </p>
      {alerts.map(alert => {
        const config = urgencyConfig[alert.urgency];
        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${config.bg} ${config.border}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5 ${config.text}`}>
                {typeIcons[alert.type] ?? <AlertCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-bold ${config.text}`}>{alert.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${config.bg} ${config.text} border ${config.border}`}>
                    {alert.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
                {alert.savingsUSD > 0 && (
                  <p className="text-xs font-bold text-green-400 mt-2">
                    Potential savings: {formatCurrency(alert.savingsUSD, 'USD')}
                  </p>
                )}
                {alert.marketplace && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Marketplace: {alert.marketplace}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Modal ───────────────────────────────────────────────────────────────────

const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose, cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('converter');
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>(() => getSelectedCurrency());

  const handleCurrencyChange = useCallback((code: CurrencyCode) => {
    setActiveCurrency(code);
    setSelectedCurrency(code);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Globe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ArrowRightLeft size={10} />
                  {CURRENCY_CODES.length} currencies supported
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Multi-Currency <span className="text-emerald-400">Markets</span>
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
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {activeTab === 'converter' && (
            <ConverterTab
              cards={cards}
              activeCurrency={activeCurrency}
              onCurrencyChange={handleCurrencyChange}
            />
          )}
          {activeTab === 'comparison' && <ComparisonTab cards={cards} />}
          {activeTab === 'duty' && <DutyTab />}
          {activeTab === 'trends' && <TrendsTab cards={cards} activeCurrency={activeCurrency} />}
          {activeTab === 'alerts' && <AlertsTab cards={cards} />}
        </div>
      </div>
    </div>
  );
};

export default CurrencyModal;
