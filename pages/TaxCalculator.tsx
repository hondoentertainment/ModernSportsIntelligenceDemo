import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, AlertTriangle, TrendingDown, TrendingUp, DollarSign, FileText, Shield, Calendar, BarChart3, PieChart as PieIcon } from 'lucide-react';
import {
  getTransactionHistory,
  getCapitalGainsSummary,
  getMonthlyGains,
  getTaxBrackets,
  getHarvestingOpportunities,
  getWashSaleAlerts,
  getDeductibleExpenses,
  getForm8949Preview,
  getShortLongSplit,
  formatCurrency,
  type Transaction,
  type CapitalGainsSummary,
  type MonthlyGain,
  type TaxBracket,
  type HarvestingOpportunity,
  type WashSaleAlert,
  type DeductibleExpense,
  type Form8949Entry,
  type ShortLongSplit,
} from '../lib/utils/taxCalculatorService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#f97316', '#60a5fa', '#f87171', '#34d399', '#a78bfa', '#fbbf24', '#22d3ee', '#fb923c'];

const TaxCalculator: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<CapitalGainsSummary | null>(null);
  const [monthlyGains, setMonthlyGains] = useState<MonthlyGain[]>([]);
  const [brackets, setBrackets] = useState<TaxBracket[]>([]);
  const [harvesting, setHarvesting] = useState<HarvestingOpportunity[]>([]);
  const [washAlerts, setWashAlerts] = useState<WashSaleAlert[]>([]);
  const [expenses, setExpenses] = useState<DeductibleExpense[]>([]);
  const [form8949, setForm8949] = useState<Form8949Entry[]>([]);
  const [shortLong, setShortLong] = useState<ShortLongSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTransactions(getTransactionHistory());
      setSummary(getCapitalGainsSummary());
      setMonthlyGains(getMonthlyGains());
      setBrackets(getTaxBrackets());
      setHarvesting(getHarvestingOpportunities());
      setWashAlerts(getWashSaleAlerts());
      setExpenses(getDeductibleExpenses());
      setForm8949(getForm8949Preview());
      setShortLong(getShortLongSplit());
      setLoading(false);
    } catch {
      setError('Failed to load Tax Calculator data');
      setLoading(false);
    }
  }, []);

  const totalGains = useMemo(() => summary?.totalGains ?? 0, [summary]);
  const taxesOwed = useMemo(() => summary?.taxesOwed ?? 0, [summary]);
  const shortTermTotal = useMemo(() => summary?.shortTermGains ?? 0, [summary]);
  const longTermTotal = useMemo(() => summary?.longTermGains ?? 0, [summary]);
  const harvestingSavings = useMemo(() => summary?.harvestingSavings ?? 0, [summary]);
  const effectiveRate = useMemo(() => summary?.effectiveTaxRate ?? 0, [summary]);

  const monthlyChartData = useMemo(() =>
    monthlyGains.map(m => ({
      month: m.month,
      gains: m.gains,
      losses: m.losses,
      net: m.net,
    })), [monthlyGains]);

  const shortLongPie = useMemo(() =>
    shortLong.map(s => ({
      name: s.type,
      value: s.amount,
    })), [shortLong]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Tax Calculator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Calculator size={24} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Tax &amp; Capital Gains Calculator</h1>
            <p className="text-sm text-slate-400">Track capital gains, tax-loss harvesting &amp; filing preparation &mdash; Phase 155</p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-sm font-bold bg-orange-500/20 text-orange-300 rounded-full">
          {transactions.length} Transactions
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Gains</p>
          <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalGains)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Taxes Owed</p>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(taxesOwed)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Short-Term</p>
          <p className="text-3xl font-bold text-amber-400">{formatCurrency(shortTermTotal)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Long-Term</p>
          <p className="text-3xl font-bold text-blue-400">{formatCurrency(longTermTotal)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Harvesting Savings</p>
          <p className="text-3xl font-bold text-purple-400">{formatCurrency(harvestingSavings)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Effective Rate</p>
          <p className="text-3xl font-bold text-brand-lime">{effectiveRate}%</p>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-orange-400" />
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Card/Item</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Buy Date</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Sell Date</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Buy Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Sell Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Gain/Loss</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Term</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx, idx) => (
                <tr key={idx} className="border-b border-slate-700/20">
                  <td className="py-3 pr-3">
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{tx.cardName}</p>
                    <p className="text-[10px] text-slate-500">{tx.platform}</p>
                  </td>
                  <td className="py-3 pr-3 text-sm text-slate-400">{tx.buyDate}</td>
                  <td className="py-3 pr-3 text-sm text-slate-400">{tx.sellDate}</td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{formatCurrency(tx.buyPrice)}</td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{formatCurrency(tx.sellPrice)}</td>
                  <td className={`py-3 pr-3 text-sm text-right font-bold ${tx.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.gainLoss >= 0 ? '+' : ''}{formatCurrency(tx.gainLoss)}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${tx.term === 'short' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {tx.term === 'short' ? 'Short' : 'Long'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Capital Gains Chart + Short vs Long Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-orange-400" />
            Monthly Capital Gains
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Bar dataKey="gains" name="Gains" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" name="Losses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <PieIcon size={18} className="text-blue-400" />
            Short-Term vs Long-Term Split
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shortLongPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {shortLongPie.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {shortLongPie.map((entry, idx) => (
              <span key={entry.name} className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                {entry.name} ({formatCurrency(entry.value)})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Loss Harvesting Opportunities */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingDown size={18} className="text-purple-400" />
          Tax Loss Harvesting Opportunities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {harvesting.map((h, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white truncate flex-1 mr-2">{h.cardName}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 flex-shrink-0">
                  {h.urgency}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500">Cost Basis</p>
                  <p className="text-sm font-bold text-slate-300">{formatCurrency(h.costBasis)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Current Value</p>
                  <p className="text-sm font-bold text-slate-300">{formatCurrency(h.currentValue)}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Potential Tax Savings</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(h.potentialSavings)}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">{h.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wash Sale Alerts */}
      <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-red-400" />
          Wash Sale Alerts
        </h2>
        <div className="space-y-3">
          {washAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{alert.cardName}</p>
                  <p className="text-[10px] text-slate-500">{alert.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <span className="text-sm font-bold text-red-400">{formatCurrency(alert.disallowedLoss)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${alert.severity === 'high' ? 'bg-red-500/10 text-red-400' : alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deductible Expenses + Form 8949 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Deductible Expenses Tracker
          </h2>
          <div className="space-y-3">
            {expenses.map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{exp.category}</p>
                    <p className="text-[10px] text-slate-500 truncate">{exp.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(exp.amount)}</span>
                  <span className="text-[10px] text-slate-500">{exp.date}</span>
                </div>
              </div>
            ))}
            <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-3 mt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-300">Total Deductible</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-amber-400" />
            Form 8949 Preview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Description</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Proceeds</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Cost Basis</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {form8949.slice(0, 8).map((entry, idx) => (
                  <tr key={idx} className="border-b border-slate-700/20">
                    <td className="py-2 pr-3">
                      <p className="text-xs font-bold text-white truncate max-w-[180px]">{entry.description}</p>
                      <p className="text-[10px] text-slate-500">{entry.dateAcquired} - {entry.dateSold}</p>
                    </td>
                    <td className="py-2 pr-3 text-xs text-right text-slate-300">{formatCurrency(entry.proceeds)}</td>
                    <td className="py-2 pr-3 text-xs text-right text-slate-300">{formatCurrency(entry.costBasis)}</td>
                    <td className={`py-2 text-xs text-right font-bold ${entry.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.gainLoss >= 0 ? '+' : ''}{formatCurrency(entry.gainLoss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tax Bracket Information */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-400" />
          Tax Bracket Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {brackets.map((bracket, idx) => (
            <div key={idx} className={`bg-slate-900/50 border rounded-xl p-4 ${bracket.isCurrentBracket ? 'border-orange-500/50' : 'border-slate-700/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">{bracket.rate}%</span>
                {bracket.isCurrentBracket && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold">CURRENT</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mb-1">{bracket.filingStatus}</p>
              <p className="text-xs text-slate-400">{bracket.incomeRange}</p>
              <div className="mt-3 bg-slate-800/50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Short-Term Rate</p>
                <p className="text-sm font-bold text-amber-400">{bracket.shortTermRate}%</p>
              </div>
              <div className="mt-2 bg-slate-800/50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Long-Term Rate</p>
                <p className="text-sm font-bold text-blue-400">{bracket.longTermRate}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Year-End Tax Planning Summary */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-brand-lime" />
          Year-End Tax Planning Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Realized Gains YTD</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalGains)}</p>
            <p className="text-[10px] text-slate-500 mt-2">Including {transactions.filter(t => t.gainLoss > 0).length} profitable trades</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Estimated Tax Liability</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(taxesOwed)}</p>
            <p className="text-[10px] text-slate-500 mt-2">After harvesting deductions applied</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Potential Additional Savings</p>
            <p className="text-2xl font-bold text-purple-400">{formatCurrency(harvestingSavings)}</p>
            <p className="text-[10px] text-slate-500 mt-2">Via tax-loss harvesting opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
