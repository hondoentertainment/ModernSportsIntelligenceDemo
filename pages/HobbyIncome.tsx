// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Receipt,
  AlertTriangle,
  FileDown,
  Plus,
  Trash2,
  ArrowUpDown,
  PieChart,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getPnLSummary,
  getTaxThreshold,
  getMonthlyBreakdown,
  getTopFlips,
  getPlatformBreakdown,
  getSportBreakdown,
  getYTDSummary,
  exportCSV,
  formatCurrency,
  formatPercent,
  getProfitColor,
  getPlatformColor,
  Transaction,
  TransactionType,
  Platform,
} from '../lib/utils/hobbyIncomeService';

type TabId = 'dashboard' | 'transactions' | 'tax' | 'reports';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
  { id: 'tax', label: 'Tax Center', icon: <Shield className="w-4 h-4" /> },
  { id: 'reports', label: 'Reports', icon: <PieChart className="w-4 h-4" /> },
];

export default function HobbyIncome() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const refresh = () => setRefreshKey(k => k + 1);

  const transactions = useMemo(() => getTransactions(), [refreshKey]);
  const pnl = useMemo(() => getPnLSummary(), [refreshKey]);
  const tax = useMemo(() => getTaxThreshold(), [refreshKey]);
  const monthly = useMemo(() => getMonthlyBreakdown(), [refreshKey]);
  const topFlips = useMemo(() => getTopFlips(5), [refreshKey]);
  const platformData = useMemo(() => getPlatformBreakdown(), [refreshKey]);
  const sportData = useMemo(() => getSportBreakdown(), [refreshKey]);
  const ytd = useMemo(() => getYTDSummary(), [refreshKey]);

  const sortedTransactions = useMemo(() => {
    let filtered = filterType === 'all' ? transactions : transactions.filter(t => t.type === filterType);
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [transactions, sortField, sortDir, filterType]);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    refresh();
  };

  const handleExport = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hobby_income_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addTransaction({
      cardName: fd.get('cardName') as string,
      player: fd.get('player') as string,
      sport: fd.get('sport') as string,
      year: Number(fd.get('year')),
      set: fd.get('set') as string,
      type: fd.get('type') as TransactionType,
      amount: Number(fd.get('amount')),
      date: fd.get('date') as string,
      platform: fd.get('platform') as Platform,
      notes: fd.get('notes') as string,
      grade: (fd.get('grade') as string) || undefined,
    });
    setShowAddForm(false);
    refresh();
  };

  // Waterfall chart data for P&L
  const waterfallData = [
    { name: 'Revenue', value: pnl.totalRevenue, fill: '#10b981' },
    { name: 'Costs', value: -pnl.totalCosts, fill: '#ef4444' },
    { name: 'Net Profit', value: pnl.netProfit, fill: pnl.netProfit >= 0 ? '#3b82f6' : '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-emerald-400" />
              Hobby Income Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your card flipping P&L, taxes, and performance</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
              <FileDown className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <input name="cardName" placeholder="Card Name" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <input name="player" placeholder="Player" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <input name="sport" placeholder="Sport" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <input name="year" type="number" placeholder="Year" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <input name="set" placeholder="Set" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <select name="type" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="trade">Trade</option>
                <option value="grading_fee">Grading Fee</option>
                <option value="shipping">Shipping</option>
                <option value="supplies">Supplies</option>
              </select>
              <input name="amount" type="number" step="0.01" placeholder="Amount" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <input name="date" type="date" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm" />
              <select name="platform" required className="bg-slate-700 rounded-lg px-3 py-2 text-sm">
                <option value="eBay">eBay</option>
                <option value="COMC">COMC</option>
                <option value="MySlabs">MySlabs</option>
                <option value="Local">Local</option>
                <option value="Show">Show</option>
                <option value="Other">Other</option>
              </select>
              <input name="notes" placeholder="Notes" className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <input name="grade" placeholder="Grade (optional)" className="bg-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors">Save</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider">YTD Profit</p>
            <p className={`text-xl font-bold mt-1 ${getProfitColor(ytd.profit)}`}>{formatCurrency(ytd.profit)}</p>
            <p className="text-xs text-slate-500 mt-1">Projected: {formatCurrency(ytd.projectedAnnual)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Transactions</p>
            <p className="text-xl font-bold mt-1">{pnl.transactionCount}</p>
            <p className="text-xs text-slate-500 mt-1">{transactions.filter(t => t.type === 'sell').length} sells</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Profit/Card</p>
            <p className={`text-xl font-bold mt-1 ${getProfitColor(pnl.avgProfit)}`}>{formatCurrency(pnl.avgProfit)}</p>
            <p className="text-xs text-slate-500 mt-1">Margin: {formatPercent(pnl.marginPercent)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Tax Threshold</p>
            <p className="text-xl font-bold mt-1">{tax.percentToLimit.toFixed(0)}%</p>
            <p className="text-xs text-slate-500 mt-1">{formatCurrency(tax.currentIncome)} / {formatCurrency(tax.hobbyLimit)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Best Flip</p>
            <p className="text-xl font-bold mt-1 text-emerald-400">{formatCurrency(pnl.bestFlip.profit)}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{pnl.bestFlip.cardName}</p>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* P&L Waterfall + Monthly Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">P&L Waterfall</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={waterfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Revenue vs Costs</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="costs" name="Costs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Flips */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Flips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topFlips.map((flip, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{flip.cardName}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(flip.buyPrice)} &rarr; {formatCurrency(flip.sellPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${getProfitColor(flip.profit)}`}>{formatCurrency(flip.profit)}</p>
                      <p className="text-xs text-slate-400">{formatPercent(flip.roi)} ROI</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">Transaction Log</h3>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as TransactionType | 'all')}
                className="bg-slate-700 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="trade">Trade</option>
                <option value="grading_fee">Grading Fee</option>
                <option value="shipping">Shipping</option>
                <option value="supplies">Supplies</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700/50 text-slate-400 text-xs uppercase">
                    {(['date', 'cardName', 'player', 'type', 'amount', 'platform'] as (keyof Transaction)[]).map(field => (
                      <th key={field} className="px-4 py-3 text-left cursor-pointer hover:text-slate-200" onClick={() => handleSort(field)}>
                        <span className="flex items-center gap-1">
                          {field === 'cardName' ? 'Card' : field.charAt(0).toUpperCase() + field.slice(1)}
                          <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sortedTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-slate-300">{t.date}</td>
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]">{t.cardName}</td>
                      <td className="px-4 py-3 text-slate-300">{t.player}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          t.type === 'sell' ? 'bg-emerald-900/50 text-emerald-300' :
                          t.type === 'buy' ? 'bg-blue-900/50 text-blue-300' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${t.type === 'sell' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'sell' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{t.platform}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[150px]">{t.notes}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(t.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-6">
            {/* Tax Threshold Gauge */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                IRS 1099-K Threshold
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Current gross income</span>
                  <span className="font-bold">{formatCurrency(tax.currentIncome)}</span>
                </div>
                <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tax.percentToLimit >= 100 ? 'bg-red-500' :
                      tax.percentToLimit >= 75 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(tax.percentToLimit, 100)}%` }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold">
                    {tax.percentToLimit.toFixed(1)}% of {formatCurrency(tax.hobbyLimit)} limit
                  </div>
                </div>
                {tax.isApproachingLimit && (
                  <div className="flex items-start gap-2 p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-200">{tax.recommendation}</p>
                  </div>
                )}
                {!tax.isApproachingLimit && (
                  <p className="text-sm text-slate-400">{tax.recommendation}</p>
                )}
              </div>
            </div>

            {/* Business threshold info */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Tax Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase">Gross Sales (YTD)</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(tax.currentIncome)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase">1099-K Threshold</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(tax.hobbyLimit)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase">Business Threshold</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(tax.businessThreshold)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Platform + Sport Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Platform Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie
                      data={platformData.map(p => ({ name: p.platform, value: p.count }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {platformData.map((p, i) => (
                        <Cell key={i} fill={getPlatformColor(p.platform)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Sport Breakdown</h3>
                <div className="space-y-3">
                  {sportData.map(s => (
                    <div key={s.sport} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-sm font-medium">{s.sport}</span>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${getProfitColor(s.profit)}`}>{formatCurrency(s.profit)}</span>
                        <span className="text-xs text-slate-400 ml-2">({s.count} txns)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Profit Trend */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Profit Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
