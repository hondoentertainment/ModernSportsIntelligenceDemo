// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Clock, Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  getSubmissions,
  getActiveSubmissions,
  getSubmissionROI,
  getSubmissionsByCompany,
  getCompanyComparison,
  getGroupSubmissions,
  getTurnaroundHistory,
  getAverageTurnaround,
  getNextExpectedReturn,
  getTotalGradingSpend,
  getTotalValueGained,
  getStatusProgress,
  getStatusLabel,
  getCompanyLabel,
  getCompanyColor,
  getTierLabel,
  type GradingSubmission,
  type SubmissionROI,
  type CompanyComparison,
  type GroupSubmission,
} from '../lib/core/gradingTrackerService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const GradingTracker: React.FC = () => {
  const [submissions, setSubmissions] = useState<GradingSubmission[]>([]);
  const [activeSubmissions, setActiveSubmissions] = useState<GradingSubmission[]>([]);
  const [roiData, setRoiData] = useState<SubmissionROI[]>([]);
  const [companyData, setCompanyData] = useState<{ company: string; label: string; count: number; color: string }[]>([]);
  const [companies, setCompanies] = useState<CompanyComparison[]>([]);
  const [groups, setGroups] = useState<GroupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSubmissions(getSubmissions());
      setActiveSubmissions(getActiveSubmissions());
      setRoiData(getSubmissionROI());
      setCompanyData(getSubmissionsByCompany());
      setCompanies(getCompanyComparison());
      setGroups(getGroupSubmissions());
      setLoading(false);
    } catch {
      setError('Failed to load Grading Tracker data');
      setLoading(false);
    }
  }, []);

  const avgTurnaround = useMemo(() => getAverageTurnaround(), []);
  const nextReturn = useMemo(() => getNextExpectedReturn(), []);
  const totalSpend = useMemo(() => getTotalGradingSpend(), []);
  const totalValueGained = useMemo(() => getTotalValueGained(), []);
  const turnaroundHistory = useMemo(() => getTurnaroundHistory(), []);

  const totalROI = useMemo(() => {
    if (roiData.length === 0) return 0;
    return roiData.reduce((s, r) => s + r.roi, 0) / roiData.length;
  }, [roiData]);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Grading Submission Tracker...</p>
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
          <ClipboardCheck size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Grading Submission Tracker</h1>
          <p className="text-sm text-slate-400">Pipeline tracking, turnaround estimates &amp; ROI projections &mdash; Phase 119</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-400">{submissions.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">In Progress</p>
          <p className="text-3xl font-bold text-amber-400">{activeSubmissions.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Turnaround</p>
          <p className="text-3xl font-bold text-purple-400">{avgTurnaround}d</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spend</p>
          <p className="text-2xl font-bold text-red-400">${totalSpend.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value Gained</p>
          <p className="text-2xl font-bold text-emerald-400">+${totalValueGained.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg ROI</p>
          <p className={`text-3xl font-bold ${totalROI >= 0 ? 'text-brand-lime' : 'text-red-400'}`}>{totalROI.toFixed(0)}%</p>
        </div>
      </div>

      {/* Active Submissions Pipeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Package size={18} className="text-amber-400" />
          Submission Pipeline
        </h2>
        <div className="space-y-3">
          {submissions.map(s => {
            const progress = getStatusProgress(s.status);
            const companyColor = getCompanyColor(s.company);
            return (
              <div key={s.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">{s.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${companyColor}20`, color: companyColor, border: `1px solid ${companyColor}40` }}>{getCompanyLabel(s.company)}</span>
                    <span className="text-xs text-slate-500">{getTierLabel(s.tier)}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : s.status === 'graded' || s.status === 'shipped_back' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{getStatusLabel(s.status)}</span>
                </div>
                <p className="text-sm font-bold text-white mb-2">{s.cardName}</p>
                <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: companyColor }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Submitted: {s.submittedDate}</span>
                  <span>Est Return: {s.estimatedReturnDate}</span>
                  <span>Cost: ${s.totalCost.toFixed(2)}</span>
                  {s.estimatedGrade && <span>Est: {s.estimatedGrade}</span>}
                  {s.actualGrade && <span className="text-emerald-400 font-bold">Grade: {s.actualGrade}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Company Pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-blue-400" />
            By Company
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={companyData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count" nameKey="label" paddingAngle={4}>
                  {companyData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {companyData.map(d => (
              <span key={d.company} className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.label} ({d.count})
              </span>
            ))}
          </div>
        </div>

        {/* Turnaround History */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            Turnaround Trends
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={turnaroundHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="psa" stroke="#ef4444" strokeWidth={2} dot={false} name="PSA" />
                <Line type="monotone" dataKey="bgs" stroke="#3b82f6" strokeWidth={2} dot={false} name="BGS" />
                <Line type="monotone" dataKey="sgc" stroke="#f59e0b" strokeWidth={2} dot={false} name="SGC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {nextReturn && (
            <p className="text-[10px] text-slate-500 mt-2">Next expected: <span className="text-slate-300">{nextReturn.cardName}</span> by {nextReturn.estimatedReturnDate}</p>
          )}
        </div>

        {/* ROI Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Grading ROI
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cardName" tick={{ fontSize: 8, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'ROI']}
                />
                <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                  {roiData.map((entry, i) => (
                    <Cell key={i} fill={entry.roi >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Company Comparison + Group Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            Company Comparison
          </h2>
          <div className="space-y-3">
            {companies.map(c => (
              <div key={c.company} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: c.color }}>{c.label}</span>
                  <span className="text-[10px] text-slate-500">Est. {c.yearFounded} | {c.totalGraded} graded</span>
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="text-slate-400">{c.avgTurnaround}d turnaround</span>
                  <span className="text-slate-400">${c.avgCostPerCard}/card</span>
                  <span className="text-slate-400">{c.reputationScore}/100 rep</span>
                  <span className="text-emerald-400">+{c.marketPremium}% premium</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Package size={18} className="text-cyan-400" />
            Group Submissions
          </h2>
          <div className="space-y-3">
            {groups.map(g => (
              <div key={g.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{g.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${g.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : g.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' : g.status === 'returned' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>{g.status.toUpperCase()}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">Organized by {g.organizer} | {getCompanyLabel(g.company)} {getTierLabel(g.tier)}</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="w-full h-1.5 bg-slate-700 rounded-full">
                      <div className="h-full bg-brand-lime rounded-full" style={{ width: `${(g.totalCards / g.maxCards) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 ml-3">{g.totalCards}/{g.maxCards} cards</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{g.members.length} members</span>
                  <span>${g.shippingCostPerCard.toFixed(2)}/card shipping</span>
                  <span>Deadline: {g.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingTracker;
