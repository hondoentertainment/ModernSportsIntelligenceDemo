// Phase 154: Card Photography & Listing Optimizer Page
// Route: /listing-optimizer | Icon: Camera
import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Search,
  Clock,
  Eye,
  Target,
  Zap,
  Tag,
  Globe,
} from 'lucide-react';
import {
  getListingAnalyses,
  getPhotoTips,
  getPricingRecommendations,
  getPlatformDistribution,
  getCompetitorListings,
  getTimingRecommendations,
  getSEOKeywords,
  getScoreImprovements,
  getOptimizerSummary,
  formatCurrency,
  PLATFORM_META,
  QUALITY_META,
  type ListingAnalysis,
  type PhotoTip,
  type PricingRecommendation,
  type PlatformDistribution,
  type CompetitorListing,
  type TimingRecommendation,
  type SEOKeyword,
  type ScoreImprovement,
  type ListingOptimizerSummary,
} from '../lib/trading/listingOptimizerService';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const _SCORE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#10b981'];

function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

const PLATFORM_COLORS: Record<string, string> = {
  ebay: '#3b82f6',
  comc: '#22c55e',
  myslabs: '#a855f7',
  mercari: '#ef4444',
  whatnot: '#f97316',
  sportslots: '#14b8a6',
};

const ListingOptimizer: React.FC = () => {
  const [listings, setListings] = useState<ListingAnalysis[]>([]);
  const [photoTips, setPhotoTips] = useState<PhotoTip[]>([]);
  const [pricing, setPricing] = useState<PricingRecommendation[]>([]);
  const [platforms, setPlatforms] = useState<PlatformDistribution[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorListing[]>([]);
  const [timing, setTiming] = useState<TimingRecommendation[]>([]);
  const [keywords, setKeywords] = useState<SEOKeyword[]>([]);
  const [improvements, setImprovements] = useState<ScoreImprovement[]>([]);
  const [summary, setSummary] = useState<ListingOptimizerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setListings(getListingAnalyses());
      setPhotoTips(getPhotoTips());
      setPricing(getPricingRecommendations());
      setPlatforms(getPlatformDistribution());
      setCompetitors(getCompetitorListings());
      setTiming(getTimingRecommendations());
      setKeywords(getSEOKeywords());
      setImprovements(getScoreImprovements());
      setSummary(getOptimizerSummary());
      setLoading(false);
    } catch  {
      setError('Failed to load Listing Optimizer data');
      setLoading(false);
    }
  }, []);

  const improvementChartData = useMemo(() => {
    return improvements.map(imp => ({
      category: imp.category,
      before: imp.before,
      after: imp.after,
    }));
  }, [improvements]);

  const platformPieData = useMemo(() => {
    return platforms.map(p => ({
      name: PLATFORM_META[p.platform]?.label ?? p.platform,
      value: p.listings,
      color: PLATFORM_COLORS[p.platform] || '#64748b',
    }));
  }, [platforms]);

  const bestTimingDay = useMemo(() => {
    if (timing.length === 0) return null;
    return timing.reduce((best, t) => t.score > best.score ? t : best, timing[0]);
  }, [timing]);

  const totalEstimatedRevenue = useMemo(() => {
    return listings.reduce((s, l) => s + l.suggestedPrice * l.estimatedSales, 0);
  }, [listings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Listing Optimizer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Camera size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Card Photography &amp; Listing Optimizer</h1>
            <p className="text-sm text-slate-400">AI-powered listing analysis, photo scoring, SEO optimization, and pricing intelligence &mdash; Phase 154</p>
          </div>
        </div>
        {summary && (
          <span className="px-3 py-1.5 text-sm font-bold bg-cyan-500/20 text-cyan-300 rounded-full">
            {summary.totalListings} Listings Analyzed
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Listings</p>
          <p className="text-2xl font-bold text-white">{summary?.totalListings ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Analyzed</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Score</p>
          <p className={`text-2xl font-bold ${scoreColor(summary?.avgScore ?? 0)}`}>{summary?.avgScore ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">/ 100</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Est. Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalEstimatedRevenue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Improvements</p>
          <p className="text-2xl font-bold text-amber-400">{summary?.improvementOpportunities ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Opportunities</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Platform</p>
          <p className="text-2xl font-bold text-blue-400">{summary?.topPlatform ?? '—'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Photo</p>
          <p className={`text-2xl font-bold ${scoreColor(summary?.avgPhotoScore ?? 0)}`}>{summary?.avgPhotoScore ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Score</p>
        </div>
      </div>

      {/* Listing Analysis Cards */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Target size={18} className="text-cyan-400" />
          Listing Analysis &amp; Scores
        </h2>
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{listing.cardName}</p>
                  <p className="text-[10px] text-slate-500">
                    {PLATFORM_META[listing.platform]?.label ?? listing.platform} &middot; Listed {listing.listingDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${scoreColor(listing.overallScore)}`}>{listing.overallScore}</p>
                  <p className="text-[10px] text-slate-500">Overall Score</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[
                  { label: 'Title', value: listing.titleScore },
                  { label: 'Photo', value: listing.photoScore },
                  { label: 'Description', value: listing.descriptionScore },
                  { label: 'Pricing', value: listing.pricingScore },
                  { label: 'SEO', value: listing.seoScore },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
                    <div className="w-full h-2 bg-slate-700 rounded-full">
                      <div className={`h-full rounded-full ${scoreBg(item.value)}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <p className={`text-[10px] font-bold mt-1 ${scoreColor(item.value)}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Current: <span className="text-white font-bold">{formatCurrency(listing.currentPrice)}</span></span>
                <span>Suggested: <span className="text-emerald-400 font-bold">{formatCurrency(listing.suggestedPrice)}</span></span>
                <span>Photo: <span className={`font-bold ${QUALITY_META[listing.photoQuality]?.color ?? 'text-slate-400'}`}>{QUALITY_META[listing.photoQuality]?.label ?? listing.photoQuality}</span></span>
                <span>Est. Views: <span className="text-blue-400 font-bold">{listing.estimatedViews}</span></span>
              </div>
              {listing.improvementTips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {listing.improvementTips.map((tip, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">{tip}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BarChart Score Improvements + PieChart Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Score Improvements (Before vs After)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={improvementChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="before" fill="#ef4444" name="Before" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="#22c55e" name="After" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Globe size={18} className="text-violet-400" />
            Platform Distribution
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {platformPieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Photo Scoring Tips */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Camera size={18} className="text-cyan-400" />
          Photography Best Practices &amp; Scoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {photoTips.map(tip => (
            <div key={tip.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">{tip.category}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tip.impact === 'high' ? 'bg-red-500/20 text-red-400' : tip.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {tip.impact} impact
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-2">{tip.tip}</p>
              <div className="w-full h-2 bg-slate-700 rounded-full">
                <div className={`h-full rounded-full ${scoreBg(tip.score)}`} style={{ width: `${tip.score}%` }} />
              </div>
              <p className={`text-[10px] font-bold mt-1 ${scoreColor(tip.score)}`}>Impact Score: {tip.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Title Suggestions + Pricing Recommendations */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Tag size={18} className="text-amber-400" />
          Title Suggestions &amp; Missing Keywords
        </h2>
        <div className="space-y-3">
          {listings.filter(l => l.missingKeywords.length > 0).map(listing => (
            <div key={listing.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-sm font-bold text-white mb-1">{listing.cardName}</p>
              <p className="text-xs text-emerald-400 mb-2">Suggested: <span className="text-slate-300 font-normal">{listing.suggestedTitle}</span></p>
              <div className="flex flex-wrap gap-1">
                {listing.missingKeywords.map((kw, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">+ {kw}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Recommendations */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-emerald-400" />
          Pricing Recommendations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Card</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Current</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Recommended</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Comp Low</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Comp Avg</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Comp High</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Demand</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map(rec => (
                <tr key={rec.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-white font-medium text-xs">{rec.cardName}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{formatCurrency(rec.currentPrice)}</td>
                  <td className={`py-2 px-3 text-right font-bold ${rec.recommendedPrice > rec.currentPrice ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(rec.recommendedPrice)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{formatCurrency(rec.competitorLow)}</td>
                  <td className="py-2 px-3 text-right text-blue-400">{formatCurrency(rec.competitorAvg)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{formatCurrency(rec.competitorHigh)}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rec.demandLevel === 'very_high' ? 'bg-emerald-500/20 text-emerald-400' : rec.demandLevel === 'high' ? 'bg-blue-500/20 text-blue-400' : rec.demandLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {rec.demandLevel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`py-2 px-3 text-right font-bold ${scoreColor(rec.confidence)}`}>{rec.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitor Analysis + Timing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Analysis */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Eye size={18} className="text-violet-400" />
            Competitor Analysis
          </h2>
          <div className="space-y-3">
            {competitors.map(comp => (
              <div key={comp.id} className={`bg-slate-900/50 border rounded-xl p-4 ${comp.sold ? 'border-emerald-500/30' : 'border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{comp.seller}</p>
                    <p className="text-[10px] text-slate-500">{comp.cardName}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${comp.sold ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {comp.sold ? 'Sold' : 'Active'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div>
                    <p className="text-slate-500">Price</p>
                    <p className="text-white font-bold">{formatCurrency(comp.price)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Photo</p>
                    <p className={`font-bold ${scoreColor(comp.photoScore)}`}>{comp.photoScore}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Watchers</p>
                    <p className="text-blue-400 font-bold">{comp.watchers}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Days</p>
                    <p className="text-slate-300 font-bold">{comp.daysListed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timing Recommendations */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Clock size={18} className="text-amber-400" />
            Optimal Listing Timing
          </h2>
          {bestTimingDay && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-emerald-400 font-bold mb-1">Best Time to List</p>
              <p className="text-lg font-bold text-white">{bestTimingDay.dayOfWeek} at {bestTimingDay.hour}:00</p>
              <p className="text-[10px] text-slate-400">Avg {bestTimingDay.avgViews} views &middot; {bestTimingDay.avgSales} sales</p>
            </div>
          )}
          <div className="space-y-2">
            {timing.map(t => (
              <div key={t.dayOfWeek} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-white">{t.dayOfWeek}</p>
                  <p className={`text-xs font-bold ${scoreColor(t.score)}`}>{t.score}</p>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full">
                  <div className={`h-full rounded-full ${scoreBg(t.score)}`} style={{ width: `${t.score}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>Best at {t.hour}:00</span>
                  <span>{t.avgViews} views &middot; {t.avgSales} sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Keywords */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Search size={18} className="text-brand-lime" />
          SEO Keywords &amp; Search Volume
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Keyword</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Search Volume</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Competition</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Relevance</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Trending</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map(kw => (
                <tr key={kw.keyword} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3 text-white font-medium">{kw.keyword}</td>
                  <td className="py-2 px-3 text-right text-blue-400 font-bold">{kw.searchVolume.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${kw.competition === 'high' ? 'bg-red-500/20 text-red-400' : kw.competition === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {kw.competition}
                    </span>
                  </td>
                  <td className={`py-2 px-3 text-right font-bold ${scoreColor(kw.relevance)}`}>{kw.relevance}%</td>
                  <td className="py-2 px-3">
                    {kw.trending && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1 w-fit">
                        <Zap size={10} /> Trending
                      </span>
                    )}
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

export default ListingOptimizer;
