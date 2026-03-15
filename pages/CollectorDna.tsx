import React, { useState, useEffect, useMemo } from 'react';
import { Dna, Users, Sparkles, TrendingUp, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import {
  getMyDNA,
  findMatches,
  getRecommendations,
  getBuyerSellerMatches,
  getArchetypeBreakdown,
  getCollectorDnaStats,
  getArchetypeColor,
  getArchetypeLabel,
  type CollectorProfile,
  type CollectorMatch,
  type RecommendationFeed,
  type BuyerSellerMatch,
  type CollectorDnaStats,
} from '../lib/collectorDnaService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const CollectorDna: React.FC = () => {
  const [myProfile, setMyProfile] = useState<CollectorProfile | null>(null);
  const [matches, setMatches] = useState<CollectorMatch[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationFeed | null>(null);
  const [buyerSeller, setBuyerSeller] = useState<BuyerSellerMatch[]>([]);
  const [stats, setStats] = useState<CollectorDnaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMyProfile(getMyDNA());
      setMatches(findMatches());
      setRecommendations(getRecommendations());
      setBuyerSeller(getBuyerSellerMatches());
      setStats(getCollectorDnaStats());
      setLoading(false);
    } catch {
      setError('Failed to load Collector DNA data');
      setLoading(false);
    }
  }, []);

  const dnaBreakdown = useMemo(() => getArchetypeBreakdown(), []);

  const radarData = useMemo(() => {
    if (!myProfile) return [];
    return Object.entries(myProfile.dna).map(([key, value]) => ({
      trait: getArchetypeLabel(key as keyof typeof myProfile.dna),
      value,
    }));
  }, [myProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Collector DNA &amp; Match Engine...</p>
        </div>
      </div>
    );
  }

  if (error || !myProfile || !stats || !recommendations) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  const primaryColor = getArchetypeColor(myProfile.primaryArchetype);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Dna size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collector DNA &amp; Match Engine</h1>
          <p className="text-sm text-slate-400">ML-style collector profiling, compatibility matching &amp; recommendations &mdash; Phase 117</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">My Archetype</p>
          <p className={`text-lg font-bold ${primaryColor.text}`}>{getArchetypeLabel(myProfile.primaryArchetype)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Collection Value</p>
          <p className="text-2xl font-bold text-emerald-400">${myProfile.collectionValue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Collectors</p>
          <p className="text-2xl font-bold text-blue-400">{stats.totalCollectors}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Matches</p>
          <p className="text-2xl font-bold text-amber-400">{stats.activeMatches}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trade Opps</p>
          <p className="text-2xl font-bold text-rose-400">{stats.tradeOpportunities}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Match</p>
          <p className="text-2xl font-bold text-purple-400">{stats.avgMatchScore}%</p>
        </div>
      </div>

      {/* DNA Breakdown + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Dna size={18} className="text-purple-400" />
            Your DNA Breakdown
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dnaBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 60]} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" fill="#a78bfa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            DNA Radar Profile
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="trait" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: '#64748b' }} />
                <Radar name="DNA" dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Matches */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          Top Collector Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.slice(0, 6).map((m) => {
            const arcColor = getArchetypeColor(m.collector.primaryArchetype);
            return (
              <div key={m.collector.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${arcColor.bg} ${arcColor.border} border flex items-center justify-center text-sm font-bold ${arcColor.text}`}>
                      {m.collector.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{m.collector.username}</p>
                      <p className={`text-[10px] ${arcColor.text}`}>{getArchetypeLabel(m.collector.primaryArchetype)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-lime">{m.matchScore.overall}%</p>
                    <p className="text-[10px] text-slate-500">match</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600">Overlap</p>
                    <p className="text-xs text-slate-300">{m.matchScore.collectionOverlap}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600">Compat.</p>
                    <p className="text-xs text-slate-300">{m.matchScore.archetypeCompatibility}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600">Trade Opp</p>
                    <p className="text-xs text-slate-300">{m.matchScore.tradeOpportunity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600">Price Fit</p>
                    <p className="text-xs text-slate-300">{m.matchScore.priceAlignment}%</p>
                  </div>
                </div>
                {m.potentialTrades.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><ArrowRightLeft size={10} /> Potential Trade</p>
                    <p className="text-[10px] text-slate-300">{m.potentialTrades[0].youHave} <span className="text-slate-600">&harr;</span> {m.potentialTrades[0].theyHave}</p>
                    <p className="text-[10px] text-emerald-400/70">Fairness: {m.potentialTrades[0].fairness}%</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations + Buyer/Seller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            AI Recommendations
          </h2>
          <p className="text-xs text-slate-500 italic">{recommendations.archetypeInsight}</p>
          <div className="space-y-3">
            {recommendations.items.map((rec) => (
              <div key={rec.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                rec.priority === 'high' ? 'border-amber-500/30' :
                rec.priority === 'medium' ? 'border-blue-500/20' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white">{rec.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    rec.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                  }`}>{rec.priority}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-600 italic">{rec.reasoning}</p>
                  <span className="text-[10px] text-slate-500">Conf: {rec.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Buyer/Seller Matches
          </h2>
          <div className="space-y-3">
            {buyerSeller.map((bs) => (
              <div key={bs.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-bold text-white mb-1 truncate">{bs.card}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                  <span>{bs.buyer.username} <span className="text-slate-600">&rarr;</span> {bs.seller.username}</span>
                  <span className="text-emerald-400 font-bold">{bs.matchConfidence}%</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Ask ${bs.sellerAskPrice.toLocaleString()}</span>
                  <span className="text-slate-500">Max ${bs.buyerMaxPrice.toLocaleString()}</span>
                  <span className="text-brand-lime">Spread ${bs.spread.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1 italic">{bs.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDna;
