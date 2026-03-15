import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, BarChart3, ArrowRightLeft, Clock, DollarSign, Layers } from 'lucide-react';
import {
  getGraderProfiles,
  getTrustScores,
  getCrossoverResults,
  getTurnaroundData,
  getAuditorAlerts,
  getPopulationReport,
  getGradingTrends,
  getSubmissionRecommendation,
  comparePriceMultipliers,
  getCompanyConfig,
  getSeverityConfig,
  formatCurrency,
  type GraderProfile,
  type TrustScore,
  type CrossoverResult,
  type TurnaroundData,
  type AuditorAlert,
  type PopulationReport,
  type GradingTrend,
  type SubmissionRecommendation,
  type PriceImpact,
} from '../lib/gradingAuditorService';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const GradingAuditor: React.FC = () => {
  const [profiles, setProfiles] = useState<GraderProfile[]>([]);
  const [trustScores, setTrustScores] = useState<TrustScore[]>([]);
  const [crossovers, setCrossovers] = useState<CrossoverResult[]>([]);
  const [turnaroundData, setTurnaroundData] = useState<TurnaroundData[]>([]);
  const [alerts, setAlerts] = useState<AuditorAlert[]>([]);
  const [popReports, setPopReports] = useState<PopulationReport[]>([]);
  const [trends, setTrends] = useState<GradingTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recCardValue, setRecCardValue] = useState(500);

  useEffect(() => {
    try {
      setProfiles(getGraderProfiles());
      setTrustScores(getTrustScores());
      setCrossovers(getCrossoverResults());
      setTurnaroundData(getTurnaroundData());
      setAlerts(getAuditorAlerts());
      setPopReports(getPopulationReport());
      setTrends(getGradingTrends());
      setLoading(false);
    } catch {
      setError('Failed to load Grading Auditor data');
      setLoading(false);
    }
  }, []);

  const recommendations = useMemo<SubmissionRecommendation[]>(
    () => (loading ? [] : getSubmissionRecommendation(recCardValue)),
    [recCardValue, loading]
  );

  const gem10Multipliers = useMemo<PriceImpact[]>(
    () => (loading ? [] : comparePriceMultipliers(10)),
    [loading]
  );

  const radarData = useMemo(() => {
    if (trustScores.length === 0) return [];
    const top4 = trustScores.sort((a, b) => b.overall - a.overall).slice(0, 4);
    const metrics = ['consistency', 'transparency', 'speed', 'value', 'accuracy'] as const;
    return metrics.map(m => {
      const entry: Record<string, string | number> = { metric: m.charAt(0).toUpperCase() + m.slice(1) };
      top4.forEach(s => {
        const cfg = getCompanyConfig(s.company);
        entry[cfg.label] = s[m];
      });
      return entry;
    });
  }, [trustScores]);

  const crossoverMatrix = useMemo(() => {
    const companies = ['psa', 'bgs', 'sgc', 'cgc'] as const;
    const matrix: { from: string; to: string; total: number; success: number; rate: number; avgChange: number }[] = [];
    companies.forEach(from => {
      companies.forEach(to => {
        if (from === to) return;
        const results = crossovers.filter(c => c.fromCompany === from && c.toCompany === to);
        if (results.length === 0) return;
        const successes = results.filter(r => r.success).length;
        const avgChange = results.reduce((s, r) => s + r.gradeChange, 0) / results.length;
        matrix.push({
          from: getCompanyConfig(from).label,
          to: getCompanyConfig(to).label,
          total: results.length,
          success: successes,
          rate: Math.round(successes / results.length * 100),
          avgChange: Math.round(avgChange * 10) / 10,
        });
      });
    });
    return matrix;
  }, [crossovers]);

  const summaryStats = useMemo(() => {
    const totalGraded = popReports.reduce((s, p) => s + p.totalGraded, 0);
    const avgTrust = trustScores.length > 0 ? Math.round(trustScores.reduce((s, t) => s + t.overall, 0) / trustScores.length) : 0;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const crossoverSuccess = crossovers.length > 0 ? Math.round(crossovers.filter(c => c.success).length / crossovers.length * 100) : 0;
    const avgGemRate = popReports.length > 0 ? Math.round(popReports.reduce((s, p) => s + p.gem10Pct, 0) / popReports.length * 10) / 10 : 0;
    const monthlyVol = popReports.reduce((s, p) => s + p.monthlyVolume, 0);
    return { totalGraded, avgTrust, criticalAlerts, crossoverSuccess, avgGemRate, monthlyVol };
  }, [trustScores, alerts, crossovers, popReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Grading Trust &amp; Transparency Auditor...</p>
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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <ShieldCheck size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Grading Trust &amp; Transparency Auditor</h1>
          <p className="text-sm text-slate-400">Consistency scoring, crossover analysis &amp; submission intelligence &mdash; Phase 141</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Companies</p>
          <p className="text-2xl font-bold text-blue-400">{profiles.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Trust</p>
          <p className={`text-2xl font-bold ${summaryStats.avgTrust >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{summaryStats.avgTrust}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Critical Alerts</p>
          <p className="text-2xl font-bold text-red-400">{summaryStats.criticalAlerts}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Crossover %</p>
          <p className="text-2xl font-bold text-cyan-400">{summaryStats.crossoverSuccess}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Gem Rate</p>
          <p className="text-2xl font-bold text-amber-400">{summaryStats.avgGemRate}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Monthly Vol</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(summaryStats.monthlyVol)}</p>
        </div>
      </div>

      {/* Company Trust Scores + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trust Score Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            Trust Scores by Company
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trustScores.sort((a, b) => b.overall - a.overall)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="company" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: string) => v.toUpperCase()} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="overall" fill="#10b981" name="Overall Trust" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consistency" fill="#3b82f6" name="Consistency" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accuracy" fill="#f59e0b" name="Accuracy" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Comparison */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Top 4 Company Comparison
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#64748b' }} />
                <Radar name="PSA" dataKey="PSA" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                <Radar name="BGS" dataKey="BGS" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Radar name="SGC" dataKey="SGC" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Radar name="CGC" dataKey="CGC" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Company Profile Cards */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-400" />
          Grading Company Profiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profiles.map(p => {
            const cfg = getCompanyConfig(p.company);
            const trust = trustScores.find(t => t.company === p.company);
            return (
              <div key={p.company} className={`bg-slate-900/50 border rounded-xl p-4 ${cfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    Trust: {trust?.overall ?? 0}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{p.fullName}</p>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Founded</span><span className="text-slate-300">{p.founded}</span></div>
                  <div className="flex justify-between"><span>Total Graded</span><span className="text-slate-300">{formatCurrency(p.totalGraded)}</span></div>
                  <div className="flex justify-between"><span>Avg Turnaround</span><span className="text-slate-300">{p.avgTurnaround}d</span></div>
                  <div className="flex justify-between"><span>Acceptance</span><span className="text-slate-300">{p.marketAcceptance}%</span></div>
                  <div className="flex justify-between"><span>Slab Design</span><span className="text-slate-300">{p.slabDesignRating}/100</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Score Trends */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Trust Score Trends (12 Months)
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="psa" stroke="#ef4444" strokeWidth={2} dot={false} name="PSA" />
              <Line type="monotone" dataKey="bgs" stroke="#3b82f6" strokeWidth={2} dot={false} name="BGS" />
              <Line type="monotone" dataKey="sgc" stroke="#10b981" strokeWidth={2} dot={false} name="SGC" />
              <Line type="monotone" dataKey="cgc" stroke="#a855f7" strokeWidth={2} dot={false} name="CGC" />
              <Line type="monotone" dataKey="hga" stroke="#06b6d4" strokeWidth={2} dot={false} name="HGA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crossover Matrix + Price Multipliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crossover Matrix */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-cyan-400" />
            Crossover Success Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">From</th>
                  <th className="text-left py-2 px-2">To</th>
                  <th className="text-right py-2 px-2">Count</th>
                  <th className="text-right py-2 px-2">Success</th>
                  <th className="text-right py-2 pl-2">Avg Change</th>
                </tr>
              </thead>
              <tbody>
                {crossoverMatrix.map((row, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-300 font-medium">{row.from}</td>
                    <td className="py-2 px-2 text-slate-300">{row.to}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{row.total}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={`font-bold ${row.rate >= 70 ? 'text-emerald-400' : row.rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {row.rate}%
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <span className={`${row.avgChange > 0 ? 'text-emerald-400' : row.avgChange < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {row.avgChange > 0 ? '+' : ''}{row.avgChange}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Multiplier Table (Gem 10) */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-400" />
            Gem 10 Price Multipliers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Company</th>
                  <th className="text-right py-2 px-2">Multiplier</th>
                  <th className="text-right py-2 px-2">Premium</th>
                  <th className="text-right py-2 pl-2">Avg Sale</th>
                </tr>
              </thead>
              <tbody>
                {gem10Multipliers.map((p, i) => {
                  const cfg = getCompanyConfig(p.company);
                  return (
                    <tr key={i} className="border-b border-slate-700/30">
                      <td className={`py-2 pr-2 font-bold ${cfg.text}`}>{cfg.label}</td>
                      <td className="py-2 px-2 text-right text-slate-300 font-bold">{p.rawMultiplier}x</td>
                      <td className="py-2 px-2 text-right text-emerald-400">+{p.premiumOverRaw}%</td>
                      <td className="py-2 pl-2 text-right text-slate-400">${p.avgSalePrice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Turnaround Comparison */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-purple-400" />
          Turnaround Time Comparison (Standard Tier)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={turnaroundData.filter(t => t.tier === 'standard').sort((a, b) => a.actualDays - b.actualDays)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="company" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: string) => v.toUpperCase()} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="advertisedDays" fill="#3b82f6" name="Advertised" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualDays" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Population Reports */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          Population Reports
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Company</th>
                <th className="text-right py-2 px-2">Total</th>
                <th className="text-right py-2 px-2">Gem 10</th>
                <th className="text-right py-2 px-2">Gem %</th>
                <th className="text-right py-2 px-2">Mint 9</th>
                <th className="text-right py-2 px-2">NM-MT 8</th>
                <th className="text-right py-2 px-2">Monthly Vol</th>
                <th className="text-right py-2 pl-2">YoY</th>
              </tr>
            </thead>
            <tbody>
              {popReports.sort((a, b) => b.totalGraded - a.totalGraded).map(pop => {
                const cfg = getCompanyConfig(pop.company);
                return (
                  <tr key={pop.company} className="border-b border-slate-700/30">
                    <td className={`py-2 pr-2 font-bold ${cfg.text}`}>{cfg.label}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(pop.totalGraded)}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{formatCurrency(pop.gem10Count)}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={`font-bold ${pop.gem10Pct > 40 ? 'text-red-400' : pop.gem10Pct > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {pop.gem10Pct}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">{formatCurrency(pop.mint9Count)}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{formatCurrency(pop.nmMint8Count)}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(pop.monthlyVolume)}</td>
                    <td className="py-2 pl-2 text-right">
                      <span className={`font-bold ${pop.yearOverYearChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pop.yearOverYearChange > 0 ? '+' : ''}{pop.yearOverYearChange}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Recommendation Calculator */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          Submission Recommendation Calculator
        </h2>
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm text-slate-400">Card Value ($):</label>
          <input
            type="number"
            value={recCardValue}
            onChange={e => setRecCardValue(Math.max(1, parseInt(e.target.value) || 0))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-32 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map(rec => {
            const cfg = getCompanyConfig(rec.company);
            return (
              <div key={rec.company} className={`bg-slate-900/50 border rounded-xl p-4 ${cfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${rec.roi > 100 ? 'bg-emerald-500/20 text-emerald-400' : rec.roi > 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                    ROI: {rec.roi}%
                  </span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Tier</span><span className="text-slate-300 capitalize">{rec.recommendedTier.replace('_', ' ')}</span></div>
                  <div className="flex justify-between"><span>Cost</span><span className="text-slate-300">${rec.estimatedCost}</span></div>
                  <div className="flex justify-between"><span>Est. Days</span><span className="text-slate-300">{rec.estimatedDays}</span></div>
                  <div className="flex justify-between"><span>Multiplier</span><span className="text-emerald-400 font-bold">{rec.expectedMultiplier}x</span></div>
                  <div className="flex justify-between"><span>Projected</span><span className="text-emerald-400 font-bold">${rec.projectedValue.toLocaleString()}</span></div>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 italic">{rec.reasoning}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auditor Alerts */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          Auditor Alerts ({alerts.length})
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.sort((a, b) => {
            const order = { critical: 0, warning: 1, info: 2 };
            return order[a.severity] - order[b.severity];
          }).map(alert => {
            const sevCfg = getSeverityConfig(alert.severity);
            const compCfg = getCompanyConfig(alert.company);
            return (
              <div key={alert.id} className={`bg-slate-900/50 border rounded-xl p-4 ${sevCfg.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sevCfg.bg} ${sevCfg.text}`}>{sevCfg.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${compCfg.bg} ${compCfg.text}`}>{compCfg.label}</span>
                  <span className="text-[10px] text-slate-500">{alert.date}</span>
                </div>
                <p className="text-sm font-bold text-white mb-1">{alert.title}</p>
                <p className="text-xs text-slate-400 mb-2">{alert.description}</p>
                <p className="text-[10px] text-cyan-400/70 italic">Impact: {alert.impact}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GradingAuditor;
