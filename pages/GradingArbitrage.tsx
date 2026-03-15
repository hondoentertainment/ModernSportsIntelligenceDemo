import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  ArrowRightLeft,
  TrendingUp,
  BarChart3,
  Package,
  Clock,
} from 'lucide-react';
import {
  getCrossGradeOpportunities,
  getGradeTranslationTable,
  getGradePremiums,
  getActiveSubmissions,
  getGradingArbitrageStats,
  type GradingCompany,
} from '../lib/gradingArbitrageService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const companyColors: Record<GradingCompany, { text: string; bg: string; bar: string }> = {
  PSA: { text: 'text-red-400', bg: 'bg-red-500/20', bar: '#f87171' },
  BGS: { text: 'text-blue-400', bg: 'bg-blue-500/20', bar: '#60a5fa' },
  SGC: { text: 'text-amber-400', bg: 'bg-amber-500/20', bar: '#fbbf24' },
  CSG: { text: 'text-purple-400', bg: 'bg-purple-500/20', bar: '#c084fc' },
};

const riskConfig: Record<string, { text: string; bg: string }> = {
  low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  high: { text: 'text-red-400', bg: 'bg-red-500/10' },
};

const statusConfig: Record<string, { text: string; bg: string; label: string }> = {
  submitted: { text: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Submitted' },
  in_progress: { text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'In Progress' },
  success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Success' },
  fail: { text: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
  returned: { text: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Returned' },
};

const GradingArbitrage: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('Victor Wembanyama');
  const [selectedCard, _setSelectedCard] = useState('2023 Panini Prizm Silver RC');

  const opportunities = useMemo(() => getCrossGradeOpportunities(), []);
  const translations = useMemo(() => getGradeTranslationTable(), []);
  const submissions = useMemo(() => getActiveSubmissions(), []);
  const stats = useMemo(() => getGradingArbitrageStats(), []);
  const premiums = getGradePremiums(selectedPlayer, selectedCard);

  const premiumChartData = premiums.map(row => ({
    grade: row.grade,
    PSA: row.psa,
    BGS: row.bgs,
    SGC: row.sgc,
    CSG: row.csg,
  }));

  const translationGroups = translations.reduce<Record<string, typeof translations>>((acc, t) => {
    const key = `${t.fromCompany} \u2192 ${t.toCompany}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-lime-500/10">
          <RefreshCw size={24} className="text-lime-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Grading Arbitrage
          </h1>
          <p className="text-sm text-slate-400">
            Cross-Grade Intelligence & ROI Optimization
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-lime-400">{stats.totalOpportunities}</p>
          <p className="text-xs text-slate-500">Opportunities</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.avgROI}%</p>
          <p className="text-xs text-slate-500">Avg ROI</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">${stats.totalPotentialProfit.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Potential Profit</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.activeSubmissions}</p>
          <p className="text-xs text-slate-500">Active Submissions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center col-span-2 md:col-span-1">
          <p className="text-sm font-bold text-lime-400 truncate">{stats.bestOpportunity.split(' — ')[0]}</p>
          <p className="text-xs text-slate-500">Best Opportunity</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Opportunities (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-lime-400" />
            <h2 className="text-lg font-semibold text-slate-100">Top Cross-Grade Opportunities</h2>
          </div>

          {opportunities.map((opp, idx) => {
            const risk = riskConfig[opp.riskLevel];
            const profit = opp.expectedValue - opp.currentValue - opp.crossoverFee - opp.shippingCost;

            return (
              <div key={opp.id} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 hover:border-lime-500/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-slate-700/50 rounded-lg text-sm font-bold text-slate-300">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{opp.player}</h4>
                      <p className="text-xs text-slate-400">{opp.cardDescription}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-lime-400">+{opp.netROI}%</span>
                    <p className="text-[10px] text-slate-500">Net ROI</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500">Current Value</p>
                    <p className="text-sm font-semibold text-slate-200">${opp.currentValue.toLocaleString()}</p>
                    <span className={`text-[10px] ${companyColors[opp.currentCompany].text}`}>
                      {opp.currentCompany} {opp.currentGrade}
                    </span>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500">Expected Value</p>
                    <p className="text-sm font-semibold text-emerald-400">${opp.expectedValue.toLocaleString()}</p>
                    <span className={`text-[10px] ${companyColors[opp.targetCompany].text}`}>
                      {opp.targetCompany} {opp.expectedGrade}
                    </span>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500">Success Rate</p>
                    <p className={`text-sm font-semibold ${opp.gradeUpProbability >= 65 ? 'text-emerald-400' : opp.gradeUpProbability >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {opp.gradeUpProbability}%
                    </p>
                    <span className="text-[10px] text-slate-500">probability</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500">Net Profit</p>
                    <p className="text-sm font-semibold text-lime-400">${profit.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-500">if successful</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-medium ${risk.bg} ${risk.text}`}>
                      {opp.riskLevel.charAt(0).toUpperCase() + opp.riskLevel.slice(1)} Risk
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Fee: ${opp.crossoverFee} + ${opp.shippingCost} shipping
                    </span>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-lime-500/10 text-lime-400 rounded-lg text-xs font-medium hover:bg-lime-500/20 transition-colors">
                    <ArrowRightLeft size={12} />
                    Submit Cross-Grade
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{opp.reasoning}</p>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Grade Premiums Chart */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-lime-400" />
              <h3 className="text-sm font-semibold text-slate-200">Grade Premiums</h3>
            </div>

            <div className="space-y-2 mb-3">
              <select
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none"
              >
                {['Victor Wembanyama', 'Luka Doncic', 'Anthony Edwards', 'Jayson Tatum', 'Patrick Mahomes', 'Shohei Ohtani'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={premiumChartData} barCategoryGap="15%">
                <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                />
                <Bar dataKey="PSA" fill={companyColors.PSA.bar} radius={[3, 3, 0, 0]} />
                <Bar dataKey="BGS" fill={companyColors.BGS.bar} radius={[3, 3, 0, 0]} />
                <Bar dataKey="SGC" fill={companyColors.SGC.bar} radius={[3, 3, 0, 0]} />
                <Bar dataKey="CSG" fill={companyColors.CSG.bar} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Translation Table */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft size={16} className="text-lime-400" />
              <h3 className="text-sm font-semibold text-slate-200">Grade Translation</h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.entries(translationGroups).map(([groupKey, rows]) => (
                <div key={groupKey}>
                  <p className="text-[10px] font-semibold text-lime-400 mb-2">{groupKey}</p>
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-1 text-slate-500">From</th>
                        <th className="text-left py-1 text-slate-500">To</th>
                        <th className="text-left py-1 text-slate-500">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/30">
                          <td className="py-1.5 text-slate-300">{row.fromGrade}</td>
                          <td className="py-1.5 text-slate-300">{row.expectedGrade}</td>
                          <td className="py-1.5">
                            <span className={`font-medium ${
                              row.successRate >= 70 ? 'text-emerald-400' : row.successRate >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {row.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Active Submissions */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-lime-400" />
              <h3 className="text-sm font-semibold text-slate-200">Active Submissions</h3>
            </div>

            <div className="space-y-2">
              {submissions.map(sub => {
                const status = statusConfig[sub.status];
                return (
                  <div key={sub.id} className="bg-slate-900/50 rounded-lg p-2.5">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[11px] font-medium text-slate-200 truncate flex-1">{sub.card}</p>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-medium ${status.bg} ${status.text} whitespace-nowrap`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className={companyColors[sub.fromCompany].text}>{sub.fromCompany} {sub.fromGrade}</span>
                        <ArrowRightLeft size={8} className="text-slate-600" />
                        <span className={companyColors[sub.toCompany].text}>{sub.toCompany}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={8} />
                        <span>{sub.submittedDate}</span>
                      </div>
                    </div>
                    {sub.resultGrade !== undefined && (
                      <p className={`text-[9px] mt-1 font-medium ${sub.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        Result: {sub.toCompany} {sub.resultGrade}
                        {sub.status === 'success' && ` (+$${sub.expectedReturn})`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingArbitrage;
