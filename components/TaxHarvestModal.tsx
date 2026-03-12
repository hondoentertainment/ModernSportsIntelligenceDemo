import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Scissors,
  TrendingDown,
  DollarSign,
  Clock,
  ShieldAlert,
  BarChart3,
  CalendarDays,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wallet,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { CardInventory } from '../types';
import {
  FilingStatus,
  HoldingClass,
  HarvestPriority,
  WashSaleStatus,
  UnrealizedLoss,
  HarvestRecommendation,
  WashSaleWindow,
  TaxBracketInfo,
  HarvestCalendarMonth,
  AnnualTaxSummary,
  scanUnrealizedLosses,
  getHarvestRecommendations,
  getWashSaleWindows,
  getTaxBracketInfo,
  getHarvestCalendar,
  getAnnualTaxSummary,
  recordHarvest,
  loadPreferences,
  savePreferences,
  MONTH_NAMES,
  CAPITAL_LOSS_DEDUCTION_LIMIT,
} from '../lib/taxHarvestService';

interface TaxHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'scanner' | 'recommendations' | 'washsale' | 'bracket' | 'calendar' | 'summary';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scanner', label: 'Loss Scanner', icon: <TrendingDown size={16} /> },
  { id: 'recommendations', label: 'Harvest', icon: <Scissors size={16} /> },
  { id: 'washsale', label: 'Wash Sales', icon: <ShieldAlert size={16} /> },
  { id: 'bracket', label: 'Bracket', icon: <Wallet size={16} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
  { id: 'summary', label: 'Annual', icon: <FileText size={16} /> },
];

const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_joint: 'Married Filing Jointly',
  married_separate: 'Married Filing Separately',
  head_of_household: 'Head of Household',
};

const priorityConfig: Record<HarvestPriority, { label: string; color: string; bg: string; border: string }> = {
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const washStatusConfig: Record<WashSaleStatus, { label: string; color: string; dot: string }> = {
  clear: { label: 'Clear', color: 'text-green-400', dot: 'bg-green-500' },
  restricted: { label: 'Restricted', color: 'text-red-400', dot: 'bg-red-500' },
  expiring_soon: { label: 'Expiring Soon', color: 'text-amber-400', dot: 'bg-amber-500' },
};

const holdingClassConfig: Record<HoldingClass, { label: string; color: string; bg: string }> = {
  'short-term': { label: 'Short-Term', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'long-term': { label: 'Long-Term', color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export const TaxHarvestModal: React.FC<TaxHarvestModalProps> = ({ isOpen, onClose, cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scanner');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Bracket optimizer state
  const prefs = useMemo(() => loadPreferences(), []);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(prefs.filingStatus);
  const [estimatedIncome, setEstimatedIncome] = useState<number>(prefs.estimatedIncome);
  const [stateCode, setStateCode] = useState<string>(prefs.stateCode);

  const bracketInfo = useMemo(
    () => getTaxBracketInfo(filingStatus, estimatedIncome, stateCode),
    [filingStatus, estimatedIncome, stateCode]
  );

  const losses = useMemo(() => scanUnrealizedLosses(cards), [cards]);
  const recommendations = useMemo(
    () => getHarvestRecommendations(cards, bracketInfo),
    [cards, bracketInfo]
  );
  const washSales = useMemo(() => getWashSaleWindows(), []);
  const calendarData = useMemo(
    () => getHarvestCalendar(cards, bracketInfo),
    [cards, bracketInfo]
  );
  const annualSummary = useMemo(
    () => getAnnualTaxSummary(cards, bracketInfo),
    [cards, bracketInfo]
  );

  const currentMonth = new Date().getMonth();

  const handleSaveBracket = useCallback(() => {
    savePreferences({
      filingStatus,
      estimatedIncome,
      stateCode,
      includeStateRate: true,
      autoDetectWashSales: true,
    });
  }, [filingStatus, estimatedIncome, stateCode]);

  const handleRecordHarvest = useCallback((rec: HarvestRecommendation) => {
    const card = cards.find(c => c.id === rec.cardId);
    if (!card) return;
    recordHarvest(card, rec.lossAmount, rec.holdingClass, rec.taxBenefit);
  }, [cards]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedCard(prev => prev === id ? null : id);
  }, []);

  if (!isOpen) return null;

  // Pie chart data for loss breakdown
  const lossPieData = [
    { name: 'Short-Term', value: losses.filter(l => l.holdingClass === 'short-term').reduce((s, l) => s + l.lossAmount, 0), fill: '#f59e0b' },
    { name: 'Long-Term', value: losses.filter(l => l.holdingClass === 'long-term').reduce((s, l) => s + l.lossAmount, 0), fill: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Calendar bar chart data
  const calendarChartData = calendarData.map(m => ({
    month: m.monthName,
    savings: m.totalTaxSavings,
    losses: m.totalLoss,
    approaching: m.cardsApproachingLongTerm,
    isOptimal: m.isOptimalWindow,
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">

        {/* Header */}
        <div className="p-8 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30">
              <Scissors size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-bebas tracking-widest text-white">
                Tax-Loss <span className="text-rose-400">Harvesting</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Loss scanner, harvest optimizer, wash-sale tracker & bracket analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6">
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-2xl overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex-1 justify-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* ===== LOSS SCANNER TAB ===== */}
          {activeTab === 'scanner' && (
            <>
              {/* Loss Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Unrealized Losses</p>
                  <p className="text-3xl font-bebas tracking-wider text-red-400 mt-1">
                    ${losses.reduce((s, l) => s + l.lossAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Cards Below Cost</p>
                  <p className="text-3xl font-bebas tracking-wider text-white mt-1">{losses.length}</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Approaching Long-Term</p>
                  <p className="text-3xl font-bebas tracking-wider text-amber-400 mt-1">
                    {losses.filter(l => l.holdingClass === 'short-term' && l.daysToLongTerm <= 30).length}
                  </p>
                </div>
              </div>

              {/* Pie Chart */}
              {lossPieData.length > 0 && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Loss Breakdown by Holding Period</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={lossPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {lossPieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Loss Table */}
              {losses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <p className="text-sm text-slate-400">No unrealized losses found</p>
                  <p className="text-xs text-slate-600 mt-1">All cards are at or above cost basis</p>
                </div>
              ) : (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Unrealized Losses ({losses.length} cards)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left text-slate-400 font-medium py-3 px-3">Card</th>
                          <th className="text-right text-slate-400 font-medium py-3 px-3">Cost Basis</th>
                          <th className="text-right text-slate-400 font-medium py-3 px-3">Current</th>
                          <th className="text-right text-slate-400 font-medium py-3 px-3">Loss</th>
                          <th className="text-right text-slate-400 font-medium py-3 px-3">Loss %</th>
                          <th className="text-center text-slate-400 font-medium py-3 px-3">Holding</th>
                          <th className="text-right text-slate-400 font-medium py-3 px-3">Days</th>
                          <th className="text-right text-slate-400 font-medium py-3 px-3">To LT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {losses.slice(0, 20).map(loss => {
                          const hc = holdingClassConfig[loss.holdingClass];
                          return (
                            <tr key={loss.cardId} className="border-b border-slate-800 hover:bg-slate-800/30">
                              <td className="py-3 px-3">
                                <div className="font-medium text-white">{loss.player}</div>
                                <div className="text-[10px] text-slate-500">{loss.set} {loss.year} | {loss.sport}</div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-300">${loss.costBasis.toFixed(2)}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-300">${loss.currentValue.toFixed(2)}</td>
                              <td className="py-3 px-3 text-right font-mono text-red-400 font-bold">-${loss.lossAmount.toFixed(2)}</td>
                              <td className="py-3 px-3 text-right font-mono text-red-400">-{loss.lossPercent.toFixed(1)}%</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${hc.color} ${hc.bg}`}>
                                  {hc.label}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-300">{loss.holdingDays}</td>
                              <td className="py-3 px-3 text-right font-mono">
                                {loss.daysToLongTerm === 0 ? (
                                  <span className="text-blue-400">--</span>
                                ) : (
                                  <span className={loss.daysToLongTerm <= 30 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                                    {loss.daysToLongTerm}d
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {losses.length > 20 && (
                    <p className="text-[10px] text-slate-500 mt-3 text-center">
                      Showing 20 of {losses.length} cards with losses
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* ===== HARVEST RECOMMENDATIONS TAB ===== */}
          {activeTab === 'recommendations' && (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Est. Tax Savings</p>
                  <p className="text-3xl font-bebas tracking-wider text-green-400 mt-1">
                    ${recommendations.reduce((s, r) => s + r.taxBenefit, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Net Benefit</p>
                  <p className="text-3xl font-bebas tracking-wider text-emerald-400 mt-1">
                    ${recommendations.reduce((s, r) => s + r.netBenefit, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Candidates</p>
                  <p className="text-3xl font-bebas tracking-wider text-white mt-1">{recommendations.length}</p>
                </div>
              </div>

              {/* Tax Rate Info */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white">Rates applied: </span>
                    Short-term {(bracketInfo.combinedShortTermRate * 100).toFixed(1)}% |
                    Long-term {(bracketInfo.combinedLongTermRate * 100).toFixed(1)}% |
                    Filing: {FILING_STATUS_LABELS[bracketInfo.filingStatus]} |
                    <span className="text-slate-500"> Adjust in Bracket tab</span>
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Scissors size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No harvest recommendations</p>
                  <p className="text-xs text-slate-600 mt-1">No cards currently qualify for tax-loss harvesting</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map(rec => {
                    const pc = priorityConfig[rec.priority];
                    const hc = holdingClassConfig[rec.holdingClass];
                    const ws = washStatusConfig[rec.washSaleStatus];
                    const isExpanded = expandedCard === rec.id;
                    return (
                      <div
                        key={rec.id}
                        className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden"
                      >
                        {/* Main Row */}
                        <button
                          onClick={() => toggleExpanded(rec.id)}
                          className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-800/40 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pc.bg.replace('/10', '')} ${pc.color.includes('red') ? 'bg-red-500' : pc.color.includes('amber') ? 'bg-amber-500' : 'bg-slate-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-white font-bold truncate">{rec.player}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${pc.color} ${pc.bg} border ${pc.border}`}>
                                {pc.label}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${hc.color} ${hc.bg}`}>
                                {hc.label}
                              </span>
                              {rec.washSaleStatus !== 'clear' && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ws.color} bg-slate-800`}>
                                  {ws.label}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{rec.set} {rec.year} | {rec.sport}</p>
                          </div>
                          <div className="text-right flex-shrink-0 mr-2">
                            <p className="text-sm font-mono text-red-400 font-bold">-${rec.lossAmount.toFixed(2)}</p>
                            <p className="text-[10px] text-green-400 font-mono">+${rec.taxBenefit.toFixed(2)} savings</p>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-5 pb-5 space-y-4 border-t border-slate-700/50 pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                                <p className="text-[9px] text-slate-400 uppercase">Tax Rate</p>
                                <p className="text-sm font-mono text-white font-bold">{rec.applicableTaxRate}%</p>
                              </div>
                              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                                <p className="text-[9px] text-slate-400 uppercase">Tax Benefit</p>
                                <p className="text-sm font-mono text-green-400 font-bold">${rec.taxBenefit.toFixed(2)}</p>
                              </div>
                              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                                <p className="text-[9px] text-slate-400 uppercase">Opp. Cost</p>
                                <p className="text-sm font-mono text-amber-400 font-bold">${rec.opportunityCost.toFixed(2)}</p>
                              </div>
                              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                                <p className="text-[9px] text-slate-400 uppercase">Net Benefit</p>
                                <p className={`text-sm font-mono font-bold ${rec.netBenefit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${rec.netBenefit.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Replacement Suggestions */}
                            {rec.replacementSuggestions.length > 0 && (
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
                                  Replacement Suggestions (Avoid Wash Sale)
                                </p>
                                <div className="space-y-2">
                                  {rec.replacementSuggestions.map(rep => (
                                    <div
                                      key={rep.id}
                                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl text-xs"
                                    >
                                      <RefreshCw size={12} className="text-blue-400 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-white font-medium">{rep.player} - {rep.set} {rep.year}</span>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{rep.reason}</p>
                                      </div>
                                      <span className="text-slate-300 font-mono flex-shrink-0">~${rep.estimatedPrice.toFixed(0)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Harvest Button */}
                            <button
                              onClick={() => handleRecordHarvest(rec)}
                              className="w-full py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            >
                              <Scissors size={14} />
                              Record Harvest
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ===== WASH SALE TAB ===== */}
          {activeTab === 'washsale' && (
            <>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                    <p className="font-bold text-white">Wash Sale Rule (IRS Section 1091)</p>
                    <p>A wash sale occurs when you sell a security at a loss and repurchase the same or a "substantially identical" security within 30 days before or after the sale. The loss is disallowed and added to the cost basis of the replacement.</p>
                    <p className="text-slate-500">For cards: same player, same set, same year, same grade = substantially identical.</p>
                  </div>
                </div>
              </div>

              {washSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <ShieldAlert size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No active wash sale windows</p>
                  <p className="text-xs text-slate-600 mt-1">Harvest a card to create a wash sale tracking window</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {washSales.map((ws, idx) => {
                    const sc = washStatusConfig[ws.status];
                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          ws.status === 'restricted'
                            ? 'bg-red-500/5 border-red-500/20'
                            : ws.status === 'expiring_soon'
                            ? 'bg-amber-500/5 border-amber-500/20'
                            : 'bg-green-500/5 border-green-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                            <span className="text-sm text-white font-bold">{ws.player}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${sc.color} bg-slate-800`}>
                              {sc.label}
                            </span>
                          </div>
                          <span className={`font-mono text-sm font-bold ${sc.color}`}>
                            {ws.daysRemaining}d remaining
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-slate-500 text-[10px] uppercase">Sale Date</p>
                            <p className="text-slate-300 font-mono">{new Date(ws.saleDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[10px] uppercase">Window Start</p>
                            <p className="text-slate-300 font-mono">{new Date(ws.windowStartDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[10px] uppercase">Window End</p>
                            <p className="text-slate-300 font-mono">{new Date(ws.windowEndDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                ws.status === 'restricted' ? 'bg-red-500' :
                                ws.status === 'expiring_soon' ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.max(5, ((30 - ws.daysRemaining) / 30) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {ws.restrictedFromRepurchase && (
                          <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Do not repurchase substantially identical card until window closes
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ===== BRACKET OPTIMIZER TAB ===== */}
          {activeTab === 'bracket' && (
            <>
              {/* Input Form */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-white">Tax Bracket Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Filing Status</label>
                    <select
                      value={filingStatus}
                      onChange={e => setFilingStatus(e.target.value as FilingStatus)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    >
                      {Object.entries(FILING_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Estimated Annual Income</label>
                    <input
                      type="number"
                      value={estimatedIncome}
                      onChange={e => setEstimatedIncome(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
                      min={0}
                      step={5000}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">State</label>
                    <select
                      value={stateCode}
                      onChange={e => setStateCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    >
                      {Object.keys({ CA: 0, NY: 0, NJ: 0, MA: 0, IL: 0, PA: 0, OH: 0, TX: 0, FL: 0, WA: 0, NV: 0, TN: 0, WY: 0, AK: 0, SD: 0, NH: 0, OR: 0, MN: 0, HI: 0, CT: 0, OTHER: 0 }).map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveBracket}
                  className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-colors"
                >
                  Save Configuration
                </button>
              </div>

              {/* Rate Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Marginal Rate</p>
                  <p className="text-2xl font-bebas tracking-wider text-white mt-1">
                    {(bracketInfo.marginalRate * 100).toFixed(0)}%
                  </p>
                  <p className="text-[9px] text-slate-500">Federal</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Effective Rate</p>
                  <p className="text-2xl font-bebas tracking-wider text-slate-300 mt-1">
                    {(bracketInfo.effectiveRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-[9px] text-slate-500">Federal</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Short-Term Combined</p>
                  <p className="text-2xl font-bebas tracking-wider text-amber-400 mt-1">
                    {(bracketInfo.combinedShortTermRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-[9px] text-slate-500">Fed + State</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Long-Term Combined</p>
                  <p className="text-2xl font-bebas tracking-wider text-blue-400 mt-1">
                    {(bracketInfo.combinedLongTermRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-[9px] text-slate-500">Fed + State</p>
                </div>
              </div>

              {/* Harvest Impact at Current Rates */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Harvest Impact at Current Rates</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <span className="text-slate-400">Short-term losses available</span>
                    <span className="font-mono text-red-400 font-bold">
                      ${losses.filter(l => l.holdingClass === 'short-term').reduce((s, l) => s + l.lossAmount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <span className="text-slate-400">Short-term tax savings</span>
                    <span className="font-mono text-green-400 font-bold">
                      ${(losses.filter(l => l.holdingClass === 'short-term').reduce((s, l) => s + l.lossAmount, 0) * bracketInfo.combinedShortTermRate).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <span className="text-slate-400">Long-term losses available</span>
                    <span className="font-mono text-red-400 font-bold">
                      ${losses.filter(l => l.holdingClass === 'long-term').reduce((s, l) => s + l.lossAmount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <span className="text-slate-400">Long-term tax savings</span>
                    <span className="font-mono text-green-400 font-bold">
                      ${(losses.filter(l => l.holdingClass === 'long-term').reduce((s, l) => s + l.lossAmount, 0) * bracketInfo.combinedLongTermRate).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-700" />
                  <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-xs">
                    <span className="text-white font-bold">Total estimated tax savings</span>
                    <span className="font-mono text-green-400 font-bold text-base">
                      ${(
                        losses.filter(l => l.holdingClass === 'short-term').reduce((s, l) => s + l.lossAmount, 0) * bracketInfo.combinedShortTermRate +
                        losses.filter(l => l.holdingClass === 'long-term').reduce((s, l) => s + l.lossAmount, 0) * bracketInfo.combinedLongTermRate
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4">
                <div className="flex items-start gap-2 text-[10px] text-slate-500">
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <span>Tax calculations are estimates for educational purposes only. Consult a qualified tax professional for actual tax advice. State rates are simplified approximations.</span>
                </div>
              </div>
            </>
          )}

          {/* ===== CALENDAR TAB ===== */}
          {activeTab === 'calendar' && (
            <>
              {/* Calendar Chart */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Monthly Harvest Opportunities</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={calendarChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'savings') return [`$${value.toFixed(2)}`, 'Tax Savings'];
                        if (name === 'losses') return [`$${value.toFixed(2)}`, 'Harvestable Losses'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="savings" name="Tax Savings" radius={[4, 4, 0, 0]}>
                      {calendarChartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={idx === currentMonth ? '#f43f5e' : entry.isOptimal ? '#10b981' : '#334155'}
                          opacity={idx === currentMonth ? 1 : entry.isOptimal ? 0.8 : 0.5}
                        />
                      ))}
                    </Bar>
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Calendar Grid */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">12-Month Harvest Calendar</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {calendarData.map((m, i) => {
                    const isCurrent = i === currentMonth;
                    return (
                      <div
                        key={m.month}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-400/50'
                            : m.isOptimalWindow
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-slate-800/30 border-slate-700/30'
                        }`}
                      >
                        <p className={`text-xs font-bold mb-2 ${isCurrent ? 'text-rose-400' : 'text-slate-300'}`}>
                          {m.monthName}
                          {isCurrent && <span className="ml-1 text-[8px] bg-rose-500/20 px-1 py-0.5 rounded">NOW</span>}
                        </p>
                        {m.isOptimalWindow && (
                          <span className="inline-block px-1.5 py-0.5 bg-green-500/15 text-green-400 text-[8px] font-bold rounded-full mb-1.5">
                            OPTIMAL
                          </span>
                        )}
                        <p className="text-[10px] text-slate-400">Savings</p>
                        <p className="text-sm font-mono text-green-400 font-bold">${m.totalTaxSavings.toFixed(0)}</p>
                        {m.cardsApproachingLongTerm > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-1.5 text-[9px] text-amber-400">
                            <Clock size={9} />
                            {m.cardsApproachingLongTerm} crossing LT
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-1.5 text-[9px] text-slate-500">
                          <span>ST: {m.shortTermHarvests}</span>
                          <span>LT: {m.longTermHarvests}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/40" />
                  <span>Current Month</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
                  <span>Optimal Harvest Window</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-amber-400" />
                  <span>Cards crossing long-term threshold</span>
                </div>
              </div>
            </>
          )}

          {/* ===== ANNUAL SUMMARY TAB ===== */}
          {activeTab === 'summary' && (
            <>
              {/* Summary Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Harvestable</p>
                  <p className="text-3xl font-bebas tracking-wider text-red-400 mt-1">
                    ${annualSummary.totalHarvestable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-green-400/60 uppercase tracking-wider font-bold">Projected Tax Savings</p>
                  <p className="text-3xl font-bebas tracking-wider text-green-400 mt-1">
                    ${annualSummary.estimatedTotalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Deduction Limit</p>
                  <p className="text-3xl font-bebas tracking-wider text-white mt-1">
                    ${CAPITAL_LOSS_DEDUCTION_LIMIT.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-slate-500">Annual cap (excess carries forward)</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Annual Tax Impact Breakdown</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight size={14} className="text-amber-400" />
                      <span className="text-slate-300">Short-term harvestable losses</span>
                    </div>
                    <span className="font-mono text-red-400 font-bold">${annualSummary.totalHarvestableShortTerm.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight size={14} className="text-blue-400" />
                      <span className="text-slate-300">Long-term harvestable losses</span>
                    </div>
                    <span className="font-mono text-red-400 font-bold">${annualSummary.totalHarvestableLongTerm.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-700 my-1" />
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={14} className="text-amber-400" />
                      <span className="text-slate-300">Short-term tax savings (at {(bracketInfo.combinedShortTermRate * 100).toFixed(1)}%)</span>
                    </div>
                    <span className="font-mono text-green-400 font-bold">${annualSummary.estimatedShortTermSavings.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={14} className="text-blue-400" />
                      <span className="text-slate-300">Long-term tax savings (at {(bracketInfo.combinedLongTermRate * 100).toFixed(1)}%)</span>
                    </div>
                    <span className="font-mono text-green-400 font-bold">${annualSummary.estimatedLongTermSavings.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-700 my-1" />
                  <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-xs">
                    <span className="text-white font-bold">Total projected savings</span>
                    <span className="font-mono text-green-400 font-bold text-lg">${annualSummary.estimatedTotalSavings.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Cards w/ Losses</p>
                  <p className="text-xl font-bebas tracking-wider text-white mt-1">{annualSummary.cardsWithLosses}</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Approaching LT</p>
                  <p className="text-xl font-bebas tracking-wider text-amber-400 mt-1">{annualSummary.cardsApproachingLongTerm}</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Wash Sale Locks</p>
                  <p className="text-xl font-bebas tracking-wider text-red-400 mt-1">{annualSummary.washSaleRestrictions}</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Loss Carryover</p>
                  <p className="text-xl font-bebas tracking-wider text-slate-300 mt-1">${annualSummary.netCapitalLossCarryover.toFixed(0)}</p>
                </div>
              </div>

              {/* Harvested This Year */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  Harvested This Year ({annualSummary.harvestedThisYear.length} transactions)
                </h3>
                {annualSummary.harvestedThisYear.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No harvests recorded this year</p>
                ) : (
                  <div className="space-y-2">
                    {annualSummary.harvestedThisYear.map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-xs">
                        <div>
                          <span className="text-white font-medium">{h.player}</span>
                          <span className="text-slate-500 ml-2">{new Date(h.harvestDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-red-400">-${h.lossAmount.toFixed(2)}</span>
                          <span className="font-mono text-green-400">+${h.taxSaved.toFixed(2)} saved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-4">
                <div className="flex items-start gap-2 text-[10px] text-slate-500">
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <span>
                    All tax calculations are simulated estimates for educational and planning purposes only.
                    Sports cards tax treatment may vary. The $3,000 annual capital loss deduction limit applies
                    to net losses after offsetting gains. Excess losses carry forward to future years.
                    Consult a qualified tax professional for actual tax advice.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxHarvestModal;
