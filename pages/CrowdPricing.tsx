// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Award,
  Target,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Shield,
} from 'lucide-react';
import {
  getPriceRequests,
  getTopPricers,
  getCrowdPricingStats,
  getConfidenceColor,
  getRequestStatusColor,
  getExpertiseColor,
  type PriceRequest,
  type PriceVote,
  type TopPricer,
  type CrowdPricingStats,
  type PriceRequestStatus,
  type ConfidenceLevel,
  type VoterExpertise,
} from '../lib/analytics/crowdPricingService';

// ---- Helper Components ----

const StatusBadge: React.FC<{ status: PriceRequestStatus }> = ({ status }) => {
  const color = getRequestStatusColor(status);
  const labels: Record<PriceRequestStatus, string> = {
    'open': 'Open',
    'voting': 'Voting',
    'consensus-reached': 'Consensus',
    'expired': 'Expired',
    'disputed': 'Disputed',
  };
  const icons: Record<PriceRequestStatus, React.ReactNode> = {
    'open': <Clock size={11} />,
    'voting': <Users size={11} />,
    'consensus-reached': <CheckCircle2 size={11} />,
    'expired': <Clock size={11} />,
    'disputed': <AlertTriangle size={11} />,
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: color + '22', color }}
    >
      {icons[status]}
      {labels[status]}
    </span>
  );
};

const ExpertiseBadge: React.FC<{ level: VoterExpertise }> = ({ level }) => {
  const color = getExpertiseColor(level);
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: color + '18', color }}
    >
      {level}
    </span>
  );
};

const ConfidenceBar: React.FC<{ level: ConfidenceLevel }> = ({ level }) => {
  const color = getConfidenceColor(level);
  const widths: Record<ConfidenceLevel, string> = {
    'low': '25%',
    'moderate': '50%',
    'high': '75%',
    'very-high': '100%',
  };
  const labels: Record<ConfidenceLevel, string> = {
    'low': 'Low Confidence',
    'moderate': 'Moderate Confidence',
    'high': 'High Confidence',
    'very-high': 'Very High Confidence',
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">Confidence</span>
        <span className="font-semibold" style={{ color }}>{labels[level]}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: widths[level], backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const PriceRangeBar: React.FC<{ range: { low: number; high: number }; consensusPrice: number | null; votes: PriceVote[] }> = ({ range, consensusPrice, votes }) => {
  const spread = range.high - range.low;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>${range.low.toLocaleString()}</span>
        <span>${range.high.toLocaleString()}</span>
      </div>
      <div className="relative h-3 bg-slate-700/60 rounded-full overflow-hidden">
        {/* Vote markers */}
        {votes.map((vote) => {
          const position = spread > 0 ? ((vote.estimatedPrice - range.low) / spread) * 100 : 50;
          const clampedPos = Math.min(Math.max(position, 2), 98);
          return (
            <div
              key={vote.id}
              className="absolute top-0 h-full w-1 rounded-full opacity-60"
              style={{
                left: `${clampedPos}%`,
                backgroundColor: getExpertiseColor(vote.expertise),
              }}
              title={`${vote.voterHandle}: $${vote.estimatedPrice.toLocaleString()}`}
            />
          );
        })}
        {/* Consensus marker */}
        {consensusPrice !== null && spread > 0 && (
          <div
            className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-emerald-400"
            style={{ left: `${((consensusPrice - range.low) / spread) * 100}%` }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400 whitespace-nowrap">
              ${consensusPrice.toLocaleString()}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[10px] text-slate-600">Spread: ${spread.toLocaleString()}</span>
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: getExpertiseColor('authority') }} /> Authority</span>
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: getExpertiseColor('expert') }} /> Expert</span>
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: getExpertiseColor('intermediate') }} /> Intermediate</span>
        </div>
      </div>
    </div>
  );
};

const VoteCard: React.FC<{ vote: PriceVote }> = ({ vote }) => (
  <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-200">@{vote.voterHandle}</span>
        <ExpertiseBadge level={vote.expertise} />
      </div>
      <span className="text-sm font-bold text-emerald-400">${vote.estimatedPrice.toLocaleString()}</span>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed">{vote.reasoning}</p>
    <div className="flex items-center justify-between text-[10px] text-slate-600">
      <span>Confidence: {vote.confidence}% | Weight: {vote.weight}x</span>
      <span>{new Date(vote.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>
);

// ---- Request Card Component ----

const RequestCard: React.FC<{ request: PriceRequest }> = ({ request }) => {
  const [expanded, setExpanded] = useState(false);

  const weightedAvg = useMemo(() => {
    const totalWeight = request.votes.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight === 0) return 0;
    return Math.round(request.votes.reduce((sum, v) => sum + v.estimatedPrice * v.weight, 0) / totalWeight);
  }, [request.votes]);

  const avgConfidence = useMemo(() => {
    if (request.votes.length === 0) return 0;
    return Math.round(request.votes.reduce((sum, v) => sum + v.confidence, 0) / request.votes.length);
  }, [request.votes]);

  const daysRemaining = useMemo(() => {
    const closing = new Date(request.closingDate);
    const now = new Date();
    const diff = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [request.closingDate]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100 leading-snug">{request.cardName}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>by @{request.requestedBy}</span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-0.5"><Camera size={10} /> {request.photos} photos</span>
              <span className="text-slate-700">|</span>
              <span>{request.category}</span>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{request.cardDescription}</p>

        {/* Price Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Weighted Avg</p>
            <p className="text-base font-bold text-emerald-400">${weightedAvg.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Votes</p>
            <p className="text-base font-bold text-blue-400">{request.votes.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Confidence</p>
            <p className="text-base font-bold" style={{ color: avgConfidence >= 70 ? '#10b981' : avgConfidence >= 50 ? '#f59e0b' : '#ef4444' }}>
              {avgConfidence}%
            </p>
          </div>
        </div>

        {/* Consensus price (if reached) */}
        {request.consensusPrice !== null && request.confidenceLevel !== null && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Consensus Price</span>
              </div>
              <span className="text-lg font-bold text-emerald-400">${request.consensusPrice.toLocaleString()}</span>
            </div>
            <ConfidenceBar level={request.confidenceLevel} />
          </div>
        )}

        {/* Price Range Bar */}
        {request.priceRange && (
          <PriceRangeBar
            range={request.priceRange}
            consensusPrice={request.consensusPrice}
            votes={request.votes}
          />
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-3">
            {request.lastCompDate && (
              <span>Last comp: ${request.lastCompPrice?.toLocaleString()} ({request.lastCompDate})</span>
            )}
            {!request.lastCompDate && <span className="text-amber-500/70">No known comps</span>}
          </div>
          {request.status !== 'consensus-reached' && request.status !== 'expired' && (
            <span className="flex items-center gap-0.5">
              <Clock size={9} />
              {daysRemaining}d remaining
            </span>
          )}
        </div>
      </div>

      {/* Expand/Collapse Votes */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-slate-500 hover:text-slate-300 bg-slate-800/30 border-t border-slate-800 transition-colors"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide' : 'Show'} {request.votes.length} votes
      </button>

      {expanded && (
        <div className="p-4 pt-2 space-y-2 border-t border-slate-800/50">
          {request.votes
            .sort((a, b) => b.weight - a.weight)
            .map((vote) => (
              <VoteCard key={vote.id} vote={vote} />
            ))}
        </div>
      )}
    </div>
  );
};

// ---- Leaderboard Row ----

const PricerRow: React.FC<{ pricer: TopPricer; rank: number }> = ({ pricer, rank }) => {
  const medalColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
  return (
    <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
        style={{
          backgroundColor: rank <= 3 ? medalColors[rank - 1] + '20' : '#1e293b',
          color: rank <= 3 ? medalColors[rank - 1] : '#64748b',
        }}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-slate-200">@{pricer.handle}</span>
          <ExpertiseBadge level={pricer.expertiseLevel} />
        </div>
        <div className="flex flex-wrap gap-1">
          {pricer.specialties.map((s) => (
            <span key={s} className="px-1.5 py-0.5 bg-slate-800/60 text-[10px] text-slate-500 rounded">{s}</span>
          ))}
        </div>
      </div>
      <div className="hidden md:grid grid-cols-4 gap-6 text-center flex-shrink-0">
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Votes</p>
          <p className="text-sm font-bold text-slate-200">{pricer.totalVotes.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Accuracy</p>
          <p className="text-sm font-bold text-emerald-400">{pricer.accuracyScore}%</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Avg Dev</p>
          <p className="text-sm font-bold text-blue-400">{pricer.avgDeviation}%</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Rep</p>
          <p className="text-sm font-bold text-amber-400">{pricer.reputation}</p>
        </div>
      </div>
      {/* Mobile stats */}
      <div className="md:hidden flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-emerald-400">{pricer.accuracyScore}%</p>
          <p className="text-[10px] text-slate-500">{pricer.totalVotes.toLocaleString()} votes</p>
        </div>
      </div>
    </div>
  );
};

// ---- Main Page Component ----

const CrowdPricing: React.FC = () => {
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [topPricers, setTopPricers] = useState<TopPricer[]>([]);
  const [stats, setStats] = useState<CrowdPricingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'open' | 'consensus' | 'leaderboard'>('open');

  useEffect(() => {
    try {
      setRequests(getPriceRequests());
      setTopPricers(getTopPricers());
      setStats(getCrowdPricingStats());
      setLoading(false);
    } catch {
      setError('Failed to load Crowd Pricing data');
      setLoading(false);
    }
  }, []);

  const openRequests = useMemo(
    () => requests.filter((r) => r.status === 'open' || r.status === 'voting' || r.status === 'disputed'),
    [requests]
  );

  const consensusRequests = useMemo(
    () => requests.filter((r) => r.status === 'consensus-reached'),
    [requests]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Crowd Pricing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <BarChart3 size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  const tabs = [
    { key: 'open' as const, label: 'Open Requests', count: openRequests.length },
    { key: 'consensus' as const, label: 'Consensus Reached', count: consensusRequests.length },
    { key: 'leaderboard' as const, label: 'Top Pricers', count: topPricers.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Users size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Crowd-Sourced Price Discovery</h1>
          <p className="text-sm text-slate-400">Community pricing for illiquid cards with no marketplace comps</p>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Requests</p>
            <p className="text-2xl font-bold text-blue-400">{stats.activeRequests}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{stats.requestsThisWeek} this week</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Consensus Reached</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.consensusReached.toLocaleString()}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">of {stats.totalRequests.toLocaleString()} total</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
            <p className="text-2xl font-bold text-amber-400">{stats.avgConfidence}%</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{stats.avgVotesPerRequest} votes/request</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Pricer Accuracy</p>
            <p className="text-2xl font-bold text-purple-400">{stats.topPricerAccuracy}%</p>
            <p className="text-[10px] text-slate-600 mt-0.5">avg {stats.avgTimeToConsensus} to consensus</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'open' && (
        <div className="space-y-4">
          {openRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Target size={32} className="mx-auto mb-2 opacity-50" />
              <p>No open requests at this time.</p>
            </div>
          ) : (
            openRequests.map((request) => <RequestCard key={request.id} request={request} />)
          )}
        </div>
      )}

      {activeTab === 'consensus' && (
        <div className="space-y-4">
          {consensusRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
              <p>No consensus results yet.</p>
            </div>
          ) : (
            consensusRequests.map((request) => <RequestCard key={request.id} request={request} />)
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-slate-300">Community Pricing Leaderboard</h2>
          </div>
          {topPricers.map((pricer, idx) => (
            <PricerRow key={pricer.handle} pricer={pricer} rank={idx + 1} />
          ))}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <Shield size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-500 leading-relaxed">
                <p className="font-semibold text-slate-400 mb-1">How Pricing Authority Works</p>
                <p>
                  Votes are weighted by expertise level. Authority-level pricers (3.2x weight) have demonstrated
                  sustained accuracy above 90% across 500+ votes. Expert pricers (2.4x) maintain 85%+ accuracy.
                  Intermediate (1.6x) and Novice (0.8x) votes contribute to consensus but carry lower weight.
                  Accuracy is measured against eventual sale prices when cards transact within 90 days of consensus.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrowdPricing;
