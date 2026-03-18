import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Package,
  Star,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import {
  getSubscriptions,
  getBoxOpenings,
  getROIByProvider,
  getEVAnalysis,
  compareProviders,
  getHitHistory,
  getMonthlyTrendData,
  getProviderName,
  type SubscriptionTier,
  type BoxOpening,
  type SubscriptionROI,
  type EVAnalysis,
  type ProviderComparison,
  type BoxHit,
} from '../lib/utils/subscriptionBoxService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const SubscriptionBox: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionTier[]>([]);
  const [openings, setOpenings] = useState<BoxOpening[]>([]);
  const [roiData, setRoiData] = useState<SubscriptionROI[]>([]);
  const [_evData, setEvData] = useState<EVAnalysis[]>([]);
  const [providers, setProviders] = useState<ProviderComparison[]>([]);
  const [hitHistory, setHitHistory] = useState<BoxHit[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; spent: number; value: number; profit: number; roi: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setSubscriptions(getSubscriptions());
      setOpenings(getBoxOpenings());
      setRoiData(getROIByProvider());
      setEvData(getEVAnalysis());
      setProviders(compareProviders());
      setHitHistory(getHitHistory());
      setTrendData(getMonthlyTrendData());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const totalSpent = useMemo(() => openings.reduce((s, o) => s + o.cost, 0), [openings]);
  const totalValue = useMemo(() => openings.reduce((s, o) => s + o.totalValue, 0), [openings]);
  const totalProfit = totalValue - totalSpent;
  const overallROI = totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;
  const activeSubs = useMemo(() => subscriptions.filter(s => s.active).length, [subscriptions]);

  const topHit = useMemo(() => {
    if (hitHistory.length === 0) return null;
    return hitHistory.reduce((best, h) => h.estimatedValue > best.estimatedValue ? h : best, hitHistory[0]);
  }, [hitHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Subscription Box Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Box size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Subscription Box Intelligence</h1>
            <p className="text-sm text-slate-400">
              ROI tracking, EV analysis &amp; provider comparison &mdash; Phase 116
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
          {activeSubs} Active Subscriptions
        </span>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-white">${totalSpent.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">{openings.length} boxes</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-3xl font-bold text-blue-400">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">estimated hit value</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Profit / Loss</p>
          <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Overall ROI</p>
          <p className={`text-3xl font-bold ${overallROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Best Hit</p>
          {topHit ? (
            <>
              <p className="text-lg font-bold text-white truncate">{topHit.player}</p>
              <p className="text-xs text-brand-lime mt-1">${topHit.estimatedValue.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-lg text-slate-500">N/A</p>
          )}
        </div>
      </div>

      {/* ─── Monthly Trend Chart + Provider Rankings ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Monthly Value vs Spend
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'spent' ? 'Spent' : name === 'value' ? 'Value' : 'Profit']}
                />
                <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.6} />
                <Bar dataKey="value" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/60 rounded" /> Spent</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-brand-lime rounded" /> Value</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-400" />
            Provider Rankings
          </h2>
          <div className="space-y-3">
            {providers.map(p => (
              <div key={p.provider} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">#{p.overallRank}</span>
                    <span className="text-sm font-bold text-white">{p.displayName}</span>
                  </div>
                  <span className={`text-xs font-bold ${p.avgMonthlyROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.avgMonthlyROI >= 0 ? '+' : ''}{p.avgMonthlyROI.toFixed(1)}% ROI
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span>EV: {p.avgEVRatio.toFixed(2)}x</span>
                  <span>Boxes: {p.totalBoxes}</span>
                  <span>Hit Rate: {p.hitRate.toFixed(1)}/box</span>
                  <span>Consistency: {p.consistencyScore.toFixed(0)}</span>
                </div>
                <div className="mt-2 w-full h-1 bg-slate-700 rounded-full">
                  <div
                    className={`h-full rounded-full ${p.avgMonthlyROI >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.max(5, p.consistencyScore))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ROI by Provider/Tier ─────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          ROI by Subscription Tier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roiData.map(roi => (
            <div key={`${roi.provider}-${roi.tierName}`} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{getProviderName(roi.provider)}</p>
                  <p className="text-[10px] text-slate-500">{roi.tierName} Tier | {roi.boxCount} boxes</p>
                </div>
                <p className={`text-xl font-bold ${roi.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {roi.roi >= 0 ? '+' : ''}{roi.roi.toFixed(1)}%
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-600">Spent</p>
                  <p className="text-xs text-slate-400">${roi.totalSpent}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">Value</p>
                  <p className="text-xs text-blue-400">${roi.totalValue}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">Profit</p>
                  <p className={`text-xs ${roi.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {roi.totalProfit >= 0 ? '+' : ''}${roi.totalProfit}
                  </p>
                </div>
              </div>
              {roi.bestHit && (
                <div className="mt-2 p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-[10px] text-slate-500">Best Hit: <span className="text-amber-400">{roi.bestHit.player}</span></p>
                  <p className="text-[10px] text-slate-600">{roi.bestHit.cardDescription} &mdash; ${roi.bestHit.estimatedValue}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Recent Box Openings ──────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Package size={18} className="text-purple-400" />
          Recent Box Openings
        </h2>
        <div className="space-y-3">
          {openings.slice(0, 8).map(opening => (
            <div key={opening.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{opening.productName}</p>
                  <p className="text-[10px] text-slate-500">
                    {getProviderName(opening.provider)} | {opening.tierName} | {new Date(opening.openDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${opening.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {opening.profit >= 0 ? '+' : ''}${opening.profit}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Cost: ${opening.cost} | Value: ${opening.totalValue}
                  </p>
                </div>
              </div>
              {opening.hits.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {opening.hits.map(hit => (
                    <span key={hit.id} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      hit.estimatedValue >= 100
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-700/50 text-slate-400 border-slate-700'
                    }`}>
                      {hit.player} &mdash; ${hit.estimatedValue}
                      {hit.isAuto && ' Auto'}
                      {hit.isNumbered && ' /num'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Active Subscriptions ─────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Box size={18} className="text-blue-400" />
          Active Subscriptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {subscriptions.map(sub => (
            <div key={sub.id} className={`p-4 rounded-xl border ${
              sub.active ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-800/20 border-slate-700/20 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{getProviderName(sub.provider)}</span>
                {sub.active ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-600">Inactive</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-1">{sub.tierName} &mdash; {sub.sport}</p>
              <p className="text-[10px] text-slate-500 mb-2">{sub.description}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-brand-lime font-bold">${sub.monthlyCost}/mo</span>
                <span className="text-slate-600">{sub.avgBoxesPerMonth} box/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBox;
