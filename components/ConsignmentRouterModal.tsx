// Consignment Router Modal — platform comparison table + fee breakdown
import React, { useState, useMemo } from 'react';
import {
  X, Route, DollarSign, Clock, Users, TrendingUp, Award,
  ArrowUpRight, ArrowDownRight, BarChart3, Percent, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  getConsignmentOptions,
  getPlatformComparison,
  getLiquidityEnrichedConsignment,
  ConsignmentOption,
  PlatformComparison,
  LiquidityEnrichedConsignment,
} from '../lib/consignmentRouterService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface ConsignmentRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'comparison' | 'fees' | 'details';

const TABS: { id: TabId; label: string }[] = [
  { id: 'comparison', label: 'Platform Comparison' },
  { id: 'fees', label: 'Fee Breakdown' },
  { id: 'details', label: 'Detailed Analysis' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  ebay: '#3b82f6',
  pwcc: '#10b981',
  heritage: '#a855f7',
  myslabs: '#f43f5e',
  goldin: '#f59e0b',
  comc: '#06b6d4',
};

const PLATFORM_TEXT_COLORS: Record<string, string> = {
  ebay: 'text-blue-400',
  pwcc: 'text-emerald-400',
  heritage: 'text-purple-400',
  myslabs: 'text-rose-400',
  goldin: 'text-amber-400',
  comc: 'text-cyan-400',
};

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatCurrencyExact(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function formatBuyerPool(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

// ── Score Badge ─────────────────────────────────────────────────────────────────

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : score >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded border ${color}`}>
      {score}
    </span>
  );
};

// ── Tab: Comparison ─────────────────────────────────────────────────────────────

const ComparisonTab: React.FC<{ options: ConsignmentOption[] }> = ({ options }) => {
  const chartData = useMemo(
    () => options.map(o => ({
      name: o.platform.name.split(' ')[0],
      netProceeds: Math.round(o.netProceeds),
      platformId: o.platform.id,
    })),
    [options],
  );

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Net Proceeds by Platform</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [formatCurrency(value), 'Net Proceeds']}
              />
              <Bar dataKey="netProceeds" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.platformId} fill={PLATFORM_COLORS[entry.platformId] ?? '#84cc16'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Platform</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Est. Sale</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Total Fees</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Net Proceeds</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">STR</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Days</th>
                <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt, i) => (
                <tr
                  key={opt.platform.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${i === 0 ? 'bg-lime-500/5' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Award size={12} className="text-lime-400" />}
                      <span className={`font-semibold ${PLATFORM_TEXT_COLORS[opt.platform.id] ?? 'text-white'}`}>
                        {opt.platform.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right px-3 py-2.5 text-slate-300 font-mono">{formatCurrency(opt.estimatedSalePrice)}</td>
                  <td className="text-right px-3 py-2.5 text-red-400 font-mono">{formatCurrencyExact(opt.fees.total)}</td>
                  <td className="text-right px-3 py-2.5 text-emerald-400 font-bold font-mono">{formatCurrency(opt.netProceeds)}</td>
                  <td className="text-right px-3 py-2.5 text-slate-300">{formatPercent(opt.sellThroughRate)}</td>
                  <td className="text-right px-3 py-2.5 text-slate-300">{opt.avgDaysToSell}d</td>
                  <td className="text-right px-3 py-2.5"><ScoreBadge score={opt.recommendationScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Tab: Fee Breakdown ──────────────────────────────────────────────────────────

const FeeBreakdownTab: React.FC<{ options: ConsignmentOption[] }> = ({ options }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((opt) => {
        const feePercent = opt.fees.total / opt.estimatedSalePrice;
        return (
          <div
            key={opt.platform.id}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold ${PLATFORM_TEXT_COLORS[opt.platform.id] ?? 'text-white'}`}>
                {opt.platform.name}
              </span>
              <span className="text-xs text-slate-500">
                {formatPercent(feePercent)} total
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Seller Fee ({formatPercent(opt.platform.sellerFeeRate)})</span>
                <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.sellerFee)}</span>
              </div>
              {opt.fees.buyersPremium > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Buyer&apos;s Premium ({formatPercent(opt.platform.buyersPremium)})</span>
                  <span className="text-amber-400 font-mono">{formatCurrencyExact(opt.fees.buyersPremium)}</span>
                </div>
              )}
              {opt.fees.fixedFee > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Fixed Fee</span>
                  <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.fixedFee)}</span>
                </div>
              )}
              {opt.fees.shipping > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.shipping)}</span>
                </div>
              )}
              {opt.fees.insurance > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Insurance</span>
                  <span className="text-red-400 font-mono">{formatCurrencyExact(opt.fees.insurance)}</span>
                </div>
              )}

              <div className="border-t border-slate-700/50 pt-2 mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Total Fees</span>
                <span className="text-red-400 font-bold font-mono">{formatCurrencyExact(opt.fees.total)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">Net Proceeds</span>
                <span className="text-emerald-400 font-bold font-mono">{formatCurrency(opt.netProceeds)}</span>
              </div>
            </div>

            {/* Fee bar */}
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500/60 rounded-full"
                style={{ width: `${Math.min(feePercent * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Tab: Detailed Analysis ──────────────────────────────────────────────────────

const DetailedTab: React.FC<{ options: ConsignmentOption[] }> = ({ options }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const isExpanded = expanded === opt.platform.id;
        return (
          <div key={opt.platform.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : opt.platform.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                {i === 0 && <Award size={16} className="text-lime-400" />}
                <div>
                  <span className={`text-sm font-bold ${PLATFORM_TEXT_COLORS[opt.platform.id] ?? 'text-white'}`}>
                    {opt.platform.name}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.reasoning}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBadge score={opt.recommendationScore} />
                {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-slate-700/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <DollarSign size={14} className="mx-auto text-emerald-400 mb-1" />
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(opt.netProceeds)}</p>
                    <p className="text-[10px] text-slate-500">Net Proceeds</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <TrendingUp size={14} className="mx-auto text-blue-400 mb-1" />
                    <p className="text-sm font-bold text-blue-400">{formatPercent(opt.sellThroughRate)}</p>
                    <p className="text-[10px] text-slate-500">Sell-Through</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <Clock size={14} className="mx-auto text-amber-400 mb-1" />
                    <p className="text-sm font-bold text-amber-400">{opt.avgDaysToSell}d</p>
                    <p className="text-[10px] text-slate-500">Avg Days to Sell</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <Users size={14} className="mx-auto text-purple-400 mb-1" />
                    <p className="text-sm font-bold text-purple-400">{formatBuyerPool(opt.buyerPoolSize)}</p>
                    <p className="text-[10px] text-slate-500">Buyer Pool</p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {opt.platform.specialties.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full border border-slate-600/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────────

const ConsignmentRouterModal: React.FC<ConsignmentRouterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('comparison');
  const [cardValue, setCardValue] = useState(1000);

  const options = useMemo(() => getConsignmentOptions('Card', cardValue), [cardValue]);
  const liquidityContext = useMemo(() => {
    // Create a representative card for liquidity enrichment
    const mockCard = {
      id: 'consignment-query',
      player: 'Query Card',
      year: 2023,
      manufacturer: 'Panini',
      cardNumber: '1',
      set: 'Prizm',
      sport: 'Basketball' as const,
      league: 'NBA' as const,
      isAutographed: false,
      condition: 'Near Mint' as const,
      isGraded: true,
      gradingCompany: 'PSA',
      grade: '9',
      purchasePrice: cardValue * 0.7,
      purchaseDate: '2023-06-01',
      currentValue: cardValue,
    };
    return getLiquidityEnrichedConsignment(mockCard, cardValue);
  }, [cardValue]);
  const best = options[0] ?? null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Route size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Consignment Router</h2>
              <p className="text-xs text-slate-500">Optimal platform recommendation engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Card value input */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Card Value:</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                value={cardValue}
                onChange={(e) => setCardValue(Math.max(0, Number(e.target.value)))}
                className="bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white w-32 focus:outline-none focus:border-lime-500/50"
              />
            </div>
          </div>
          <div className="flex gap-1">
            {[250, 500, 1000, 2500, 5000, 10000].map((val) => (
              <button
                key={val}
                onClick={() => setCardValue(val)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                  cardValue === val
                    ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                ${val.toLocaleString()}
              </button>
            ))}
          </div>
          {best && (
            <div className="ml-auto flex items-center gap-2">
              <Award size={14} className="text-lime-400" />
              <span className="text-xs text-slate-400">Best:</span>
              <span className="text-xs font-bold text-lime-400">{best.platform.name}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'comparison' && <ComparisonTab options={options} />}
          {activeTab === 'fees' && <FeeBreakdownTab options={options} />}
          {activeTab === 'details' && <DetailedTab options={options} />}
        </div>
      </div>
    </div>
  );
};

export default ConsignmentRouterModal;
