// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Building2, DollarSign, TrendingUp, Users, FileText, Shield,
  BarChart3, Zap, PieChart, Award, Clock, CheckCircle,
} from 'lucide-react';
import {
  getFundOverview,
  getFundInvestors,
  getNAVBreakdown,
  getPerformanceAttribution,
  getRecentReports,
  getFundReportingStats,
  getReportTypeLabel,
  getReportStatusColor,
} from '../lib/utils/fundReportingService';

const FundReporting: React.FC = () => {
  const fund = useMemo(() => getFundOverview(), []);
  const investors = useMemo(() => getFundInvestors(), []);
  const nav = useMemo(() => getNAVBreakdown(), []);
  const attribution = useMemo(() => getPerformanceAttribution(), []);
  const reports = useMemo(() => getRecentReports(), []);
  const stats = useMemo(() => getFundReportingStats(), []);
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'attribution' | 'reports'>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Building2 size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Fund Reporting & LP Letters</h1>
              <p className="text-slate-400 text-sm">
                NAV calculations, performance attribution, investor relations, and institutional reporting
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Fund Summary */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-900/20 rounded-xl border border-emerald-500/20 p-6">
          <h3 className="text-emerald-400 font-bold text-sm mb-4">{fund.fundName}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><p className="text-slate-500 text-[10px] uppercase">AUM</p><p className="text-white font-bold text-2xl">${(fund.aum / 1000000).toFixed(2)}M</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">NAV</p><p className="text-white font-bold text-2xl">${(fund.nav / 1000000).toFixed(2)}M</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">Inception Return</p><p className="text-green-400 font-bold text-2xl">+{fund.inceptionReturn}%</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">YTD</p><p className="text-green-400 font-bold text-2xl">+{fund.ytdReturn}%</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">Sharpe Ratio</p><p className="text-white font-bold text-2xl">{fund.sharpeRatio}</p></div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div><p className="text-slate-500 text-[10px] uppercase">NAV/Unit</p><p className="text-white font-bold">${fund.navPerUnit.toFixed(3)}</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">Distributions</p><p className="text-white font-bold">${(fund.distributions / 1000).toFixed(0)}K</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">Max Drawdown</p><p className="text-red-400 font-bold">{fund.maxDrawdown}%</p></div>
            <div><p className="text-slate-500 text-[10px] uppercase">Holdings</p><p className="text-white font-bold">{fund.holdingsCount}</p></div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['overview', 'investors', 'attribution', 'reports'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'overview' ? 'NAV Breakdown' : tab === 'investors' ? `Investors (${investors.length})` : tab === 'attribution' ? 'Attribution' : `Reports (${reports.length})`}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-emerald-400" />NAV Composition
            </h3>
            <div className="space-y-3">
              {nav.map(n => (
                <div key={n.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-semibold">{n.category}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">${(n.value / 1000).toFixed(0)}K</span>
                      <span className="text-slate-400">{n.weight}%</span>
                      <span className={n.monthChange >= 0 ? 'text-green-400' : 'text-red-400'}>{n.monthChange >= 0 ? '+' : ''}{n.monthChange}% MTD</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${n.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="space-y-3">
            {investors.map(inv => (
              <div key={inv.id} className={`bg-slate-900 rounded-xl border p-5 ${inv.status === 'redeemed' ? 'border-slate-700 opacity-60' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold text-sm">{inv.name}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-500'
                    }`}>{inv.status}</span>
                  </div>
                  <span className="text-green-400 font-bold">+{inv.netReturn}%</span>
                </div>
                <div className="grid grid-cols-5 gap-3 text-xs">
                  <div><p className="text-slate-500 text-[10px] uppercase">Commitment</p><p className="text-white font-bold">${(inv.commitment / 1000).toFixed(0)}K</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Contributed</p><p className="text-white font-bold">${(inv.contributed / 1000).toFixed(0)}K</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Ownership</p><p className="text-white font-bold">{inv.ownership}%</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Distributions</p><p className="text-emerald-400 font-bold">${(inv.distributions / 1000).toFixed(0)}K</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Since</p><p className="text-slate-300">{inv.joinedDate}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attribution' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" />Performance Attribution (Inception)
            </h3>
            <div className="space-y-3">
              {attribution.map(a => (
                <div key={a.factor}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-white text-xs font-semibold">{a.factor}</span>
                      <p className="text-slate-500 text-[10px]">{a.description}</p>
                    </div>
                    <span className={`text-sm font-bold ${a.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {a.contribution >= 0 ? '+' : ''}{a.contribution}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${a.contribution >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(a.weight)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-emerald-400" />
                  <div>
                    <h4 className="text-white font-semibold text-sm">{r.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">{getReportTypeLabel(r.type)}</span>
                      <span>{r.period}</span>
                      <span>{r.pageCount} pages</span>
                      {r.recipientCount > 0 && <span>{r.recipientCount} recipients</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getReportStatusColor(r.status)}`}>{r.status}</span>
                  <p className="text-slate-500 text-[10px] mt-1">{r.generatedDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundReporting;
