import React, { useState, useEffect } from 'react';
import { Leaf, TrendingDown, Award, ShoppingCart, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  getMonthlyFootprint, getCarbonCategories, getRecentTransactions,
  getEcoScore, getCarbonOffsets, getEcoBadges, getEcoTips,
  getTotalFootprint, getOffsetNeededKg, formatCo2,
  type EcoScore, type MonthlyFootprint, type CarbonCategory,
  type CarbonOffset, type EcoBadge,
} from '../lib/carbonFootprintService.ts';

const PIE_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399'];

const GRADE_COLOR: Record<string, string> = {
  A: 'text-green-400', B: 'text-emerald-400', C: 'text-yellow-400',
  D: 'text-orange-400', F: 'text-red-400',
};
const GRADE_BG: Record<string, string> = {
  A: 'bg-green-900/40 border-green-600', B: 'bg-emerald-900/40 border-emerald-600',
  C: 'bg-yellow-900/40 border-yellow-600', D: 'bg-orange-900/40 border-orange-600',
  F: 'bg-red-900/40 border-red-600',
};

const CarbonFootprintTracker: React.FC = () => {
  const [monthly, setMonthly] = useState<MonthlyFootprint[]>([]);
  const [categories, setCategories] = useState<CarbonCategory[]>([]);
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [offsets, setOffsets] = useState<CarbonOffset[]>([]);
  const [badges, setBadges] = useState<EcoBadge[]>([]);
  const [tips, setTips] = useState<{ icon: string; tip: string }[]>([]);
  const [totals, setTotals] = useState({ totalCo2Kg: 0, totalOffsetKg: 0, netKg: 0 });
  const [offsetNeeded, setOffsetNeeded] = useState(0);
  const [transactions, setTransactions] = useState<ReturnType<typeof getRecentTransactions>>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setMonthly(getMonthlyFootprint());
    setCategories(getCarbonCategories());
    setEcoScore(getEcoScore());
    setOffsets(getCarbonOffsets());
    setBadges(getEcoBadges());
    setTips(getEcoTips());
    setTotals(getTotalFootprint());
    setOffsetNeeded(getOffsetNeededKg());
    setTransactions(getRecentTransactions());
    setLoading(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Leaf className="w-8 h-8 text-green-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Carbon Footprint Tracker</h1>
          <p className="text-gray-400 text-sm">Environmental impact of your collecting activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Emissions', value: formatCo2(totals.totalCo2Kg), color: 'text-red-400' },
          { label: 'Offset Purchased', value: formatCo2(totals.totalOffsetKg), color: 'text-green-400' },
          { label: 'Net Footprint', value: formatCo2(totals.netKg), color: 'text-yellow-400' },
          { label: 'vs Avg Collector', value: `${ecoScore?.comparedToAvgCollector ?? 0 > 0 ? '+' : ''}${ecoScore?.comparedToAvgCollector ?? 0}%`, color: (ecoScore?.comparedToAvgCollector ?? 0) <= 0 ? 'text-green-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eco Score */}
        {ecoScore && (
          <div className={`border rounded-xl p-6 text-center ${GRADE_BG[ecoScore.grade]}`}>
            <p className="text-gray-400 text-sm mb-2">Eco Score</p>
            <p className={`text-7xl font-black ${GRADE_COLOR[ecoScore.grade]}`}>{ecoScore.grade}</p>
            <p className="text-2xl font-bold text-white mt-1">{ecoScore.overall}/100</p>
            <div className="mt-4 space-y-2 text-left">
              {Object.entries(ecoScore.breakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-400">{k}</span>
                  <span className="text-white font-semibold">{v}/100</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Area Chart */}
        <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-300 font-semibold mb-3">Monthly Footprint vs Offsets</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="offsetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="co2Kg" stroke="#f87171" fill="url(#co2Grad)" name="Emissions (kg)" />
              <Area type="monotone" dataKey="offsetKg" stroke="#10b981" fill="url(#offsetGrad)" name="Offsets (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Pie */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-300 font-semibold mb-3">Emissions by Category</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={categories} dataKey="co2Kg" nameKey="category" cx="50%" cy="50%" outerRadius={70}>
                  {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {categories.map((c, i) => (
                <div key={c.category} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-300">{c.category}</span>
                  <span className="text-gray-500 ml-auto">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eco Badges */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-300 font-semibold mb-3">Eco Badges</p>
          <div className="grid grid-cols-2 gap-3">
            {badges.map(b => (
              <div key={b.id} className={`rounded-lg p-3 border text-center ${b.earned ? 'border-green-600 bg-green-900/20' : 'border-gray-700 opacity-50'}`}>
                <div className="text-2xl mb-1">{b.earned ? '🌿' : '🔒'}</div>
                <p className="text-xs font-semibold text-white truncate">{b.name}</p>
                {b.earnedDate && <p className="text-xs text-green-400 mt-1">{b.earnedDate}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offset Marketplace */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-300 font-semibold">Carbon Offset Marketplace</p>
          <div className="bg-yellow-900/40 border border-yellow-600 rounded-lg px-3 py-1 text-sm">
            <span className="text-yellow-300">Need to offset: </span>
            <span className="text-white font-bold">{formatCo2(offsetNeeded)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offsets.map(o => (
            <div key={o.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{o.provider}</p>
                <p className="text-sm text-gray-400">{o.project}</p>
                <p className="text-sm text-green-400 mt-1">${o.costPerTon}/ton CO₂</p>
              </div>
              <button
                onClick={() => showToast(`Offset purchased from ${o.provider}!`)}
                disabled={!o.available}
                className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Go Carbon Neutral CTA */}
      <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700 rounded-xl p-5 flex items-center gap-4">
        <Zap className="w-8 h-8 text-green-400 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-white">Go Carbon Neutral</p>
          <p className="text-sm text-gray-300">
            Purchase <span className="text-green-400 font-semibold">{formatCo2(offsetNeeded)}</span> in offsets to fully neutralize your collecting footprint this year.
          </p>
        </div>
        <button
          onClick={() => showToast('Redirecting to offset marketplace...')}
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
        >
          Offset Now
        </button>
      </div>

      {/* Tips */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <p className="text-gray-300 font-semibold mb-3 flex items-center gap-2"><Leaf className="w-4 h-4 text-green-400" /> Reduce Your Footprint</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((t, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-xl">{t.icon}</span>
              <span className="text-gray-300">{t.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <p className="text-gray-300 font-semibold mb-3">Recent Transactions</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left pb-2">Type</th>
                <th className="text-left pb-2">Description</th>
                <th className="text-right pb-2">Distance</th>
                <th className="text-right pb-2">CO₂</th>
                <th className="text-right pb-2">Offset</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 8).map(t => (
                <tr key={t.id} className="border-b border-gray-800">
                  <td className="py-2 capitalize text-gray-300">{t.type.replace('_', ' ')}</td>
                  <td className="py-2 text-gray-400">{t.cardName ?? t.vendor ?? '-'}</td>
                  <td className="py-2 text-right text-gray-300">{t.distance} mi</td>
                  <td className="py-2 text-right text-red-400">{formatCo2(t.co2Kg)}</td>
                  <td className="py-2 text-right">
                    {t.offsetPurchased
                      ? <CheckCircle className="w-4 h-4 text-green-400 inline" />
                      : <AlertCircle className="w-4 h-4 text-gray-600 inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintTracker;
