import React, { useState, useEffect, useMemo } from 'react';
import {
  Leaf,
  TrendingDown,
  Award,
  Recycle,
} from 'lucide-react';
import {
  getCarbonFootprint,
  getSustainabilityScore,
  getOffsetOptions,
  getGreenBadges,
  getESGReport,
  getSustainabilityTrends,
  getEcoTips,
  getCommunityRanking,
  BADGE_TIER_COLORS,
  type CarbonFootprint,
  type SustainabilityScore,
  type CarbonOffset,
  type GreenBadge,
  type ESGReport,
  type SustainabilityTrend,
  type CommunityMember,
  type EcoTip,
} from '../lib/analytics/carbonScoreService.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const CarbonScore: React.FC = () => {
  const [footprint, setFootprint] = useState<CarbonFootprint | null>(null);
  const [score, setScore] = useState<SustainabilityScore | null>(null);
  const [offsets, setOffsets] = useState<CarbonOffset[]>([]);
  const [badges, setBadges] = useState<GreenBadge[]>([]);
  const [esgReport, setEsgReport] = useState<ESGReport | null>(null);
  const [trends, setTrends] = useState<SustainabilityTrend[]>([]);
  const [community, setCommunity] = useState<CommunityMember[]>([]);
  const [tips, setTips] = useState<EcoTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setFootprint(getCarbonFootprint());
      setScore(getSustainabilityScore());
      setOffsets(getOffsetOptions());
      setBadges(getGreenBadges());
      setEsgReport(getESGReport());
      setTrends(getSustainabilityTrends());
      setCommunity(getCommunityRanking());
      setTips(getEcoTips());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const earnedBadges = useMemo(() => badges.filter(b => b.isEarned), [badges]);
  const _inProgressBadges = useMemo(() => badges.filter(b => !b.isEarned), [badges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Carbon &amp; Sustainability Score...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <Leaf size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Carbon &amp; Sustainability Score</h1>
          <p className="text-sm text-slate-400">
            Environmental impact tracking, carbon offsets &amp; ESG reporting &mdash; Phase 128
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {footprint && score && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sustainability Score</p>
            <p className="text-3xl font-bold text-emerald-400">{score.overallScore}</p>
            <p className="text-xs text-slate-600 mt-1">Grade: {score.grade} | Top {100 - score.percentile}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total CO2</p>
            <p className="text-3xl font-bold text-amber-400">{footprint.totalCo2Kg} kg</p>
            <p className="text-xs text-slate-600 mt-1">Avg {footprint.monthlyAvgKg} kg/mo</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">vs. Average</p>
            <p className={`text-3xl font-bold ${footprint.comparisonToAvg < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {footprint.comparisonToAvg}%
            </p>
            <p className="text-xs text-slate-600 mt-1">{footprint.comparisonToAvg < 0 ? 'below' : 'above'} avg collector</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trees Needed</p>
            <p className="text-3xl font-bold text-green-400">{footprint.treesNeeded}</p>
            <p className="text-xs text-slate-600 mt-1">to offset annually</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Badges Earned</p>
            <p className="text-3xl font-bold text-purple-400">{earnedBadges.length}</p>
            <p className="text-xs text-slate-600 mt-1">of {badges.length} total</p>
          </div>
        </div>
      )}

      {/* Trend Chart & Carbon Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-emerald-400" />
            Emissions Trend (6 Months)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="offsetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="co2Kg" stroke="#ef4444" fill="url(#co2Grad)" strokeWidth={2} name="Emissions (kg)" />
                <Area type="monotone" dataKey="offsetKg" stroke="#22c55e" fill="url(#offsetGrad)" strokeWidth={2} name="Offsets (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 rounded" /> Emissions</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 rounded" /> Offsets</span>
          </div>
        </div>

        {/* Carbon Breakdown */}
        {footprint && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Recycle size={18} className="text-blue-400" />
              Emission Breakdown
            </h2>
            <div className="space-y-3">
              {footprint.breakdown.map(item => (
                <div key={item.category} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white capitalize">{item.category}</span>
                    <span className="text-sm font-bold text-slate-300">{item.co2Kg} kg</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mb-1">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{item.percentage}% of total</span>
                    <span className={
                      item.trend === 'improving' ? 'text-emerald-400' :
                      item.trend === 'declining' ? 'text-red-400' : 'text-slate-500'
                    }>
                      {item.trend === 'improving' ? '-' : item.trend === 'declining' ? '+' : ''}{Math.abs(item.changePercent)}% {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sustainability Badges & Offset Marketplace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            Sustainability Badges
          </h2>
          <div className="space-y-3">
            {badges.map(badge => (
              <div key={badge.id} className={`bg-slate-900/50 border rounded-xl p-3 flex items-center gap-3 ${
                badge.isEarned ? 'border-emerald-500/30' : 'border-slate-700/30'
              }`}>
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white">{badge.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                      backgroundColor: `${BADGE_TIER_COLORS[badge.tier]}20`,
                      color: BADGE_TIER_COLORS[badge.tier],
                    }}>
                      {badge.tier}
                    </span>
                    {badge.isEarned && <span className="text-[10px] text-emerald-400">Earned</span>}
                  </div>
                  <p className="text-[10px] text-slate-500">{badge.description}</p>
                  {!badge.isEarned && (
                    <div className="mt-1">
                      <div className="w-full h-1 bg-slate-700 rounded-full">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600">{badge.progress}/{badge.target}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offset Marketplace */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Leaf size={18} className="text-emerald-400" />
            Carbon Offset Marketplace
          </h2>
          <div className="space-y-3">
            {offsets.map(offset => (
              <div key={offset.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{offset.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    offset.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                    offset.status === 'purchased' ? 'bg-blue-500/20 text-blue-400' :
                    offset.status === 'verified' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {offset.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{offset.description}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{offset.type.replace(/_/g, ' ')} | {offset.location}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">{offset.co2OffsetKg} kg CO2</span>
                    <span className="text-white font-bold">${offset.priceUsd.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">{offset.certification} | ${offset.pricePerKg.toFixed(2)}/kg</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ESG Report & Community Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ESG Report */}
        {esgReport && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award size={18} className="text-blue-400" />
              ESG Report &mdash; {esgReport.period}
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Environmental</p>
                <p className="text-xl font-bold text-emerald-400">{esgReport.environmentalScore}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Social</p>
                <p className="text-xl font-bold text-blue-400">{esgReport.socialScore}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Governance</p>
                <p className="text-xl font-bold text-purple-400">{esgReport.governanceScore}</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs font-medium text-emerald-400 mb-1">Highlights</p>
              {esgReport.highlights.map((h, idx) => (
                <p key={idx} className="text-[10px] text-slate-400 mb-0.5">+ {h}</p>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-amber-400 mb-1">Recommendations</p>
              {esgReport.recommendations.map((r, idx) => (
                <p key={idx} className="text-[10px] text-slate-400 mb-0.5">- {r}</p>
              ))}
            </div>
          </div>
        )}

        {/* Community Ranking & Eco Tips */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Recycle size={18} className="text-emerald-400" />
              Community Ranking
            </h2>
            <div className="space-y-2">
              {community.map(member => (
                <div key={member.rank} className={`flex items-center gap-3 p-2 rounded-lg ${
                  member.isCurrentUser ? 'bg-brand-lime/10 border border-brand-lime/30' : 'bg-slate-900/30'
                }`}>
                  <span className="text-xs font-bold text-slate-500 w-6 text-right">#{member.rank}</span>
                  <span className={`text-xs font-bold flex-1 ${member.isCurrentUser ? 'text-brand-lime' : 'text-white'}`}>
                    {member.username}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                    backgroundColor: `${BADGE_TIER_COLORS[member.badge]}20`,
                    color: BADGE_TIER_COLORS[member.badge],
                  }}>
                    {member.badge}
                  </span>
                  <span className="text-xs text-slate-400 w-12 text-right">{member.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Leaf size={18} className="text-green-400" />
              Eco Tips
            </h2>
            <div className="space-y-2">
              {tips.slice(0, 5).map(tip => (
                <div key={tip.id} className="flex items-start gap-2 p-2 bg-slate-900/30 rounded-lg">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${tip.implemented ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  <div>
                    <p className="text-xs font-medium text-white">{tip.title}</p>
                    <p className="text-[10px] text-slate-500">{tip.description}</p>
                    <span className="text-[10px] text-emerald-400">-{tip.impactReduction}% emissions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonScore;
