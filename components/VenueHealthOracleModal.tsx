// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Shield,
  Star,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { getVenues, getComparisons } from '../lib/analytics/venueHealthOracleService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VenueHealthOracleModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('scores');

  const venues = useMemo(() => getVenues(), []);
  const comparisons = useMemo(() => getComparisons(), []);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 75) return 'text-teal-400';
    if (score >= 65) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 75) return 'bg-teal-500/20 border-teal-500/30';
    if (score >= 65) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp size={14} className="text-emerald-400" />;
    if (trend === 'declining') return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const getRecommendationBadge = (rec: string) => {
    const map: Record<string, { color: string; bg: string; label: string }> = {
      'strongly-recommended': { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Strongly Recommended' },
      'recommended': { color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30', label: 'Recommended' },
      'use-with-caution': { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Use with Caution' },
      'avoid': { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', label: 'Avoid' },
    };
    const info = map[rec] || map['recommended'];
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${info.bg} ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'text-red-400 bg-red-500/15 border-red-500/30';
    if (severity === 'major') return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
  };

  const activeIssues = useMemo(() => {
    return venues.flatMap(v =>
      v.recentIssues.map(issue => ({ ...issue, venueName: v.name }))
    );
  }, [venues]);

  const avgScore = useMemo(() => {
    return Math.round(venues.reduce((sum, v) => sum + v.overallScore, 0) / venues.length);
  }, [venues]);

  const tabs = [
    { id: 'scores', label: 'Venue Scores', icon: <Star size={16} /> },
    { id: 'comparisons', label: 'Comparisons', icon: <BarChart3 size={16} /> },
    { id: 'issues', label: 'Active Issues', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500/10 to-slate-900 px-6 py-5 border-b border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Building2 size={22} className="text-teal-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Venue Health Oracle</h2>
                <p className="text-slate-400 text-xs">Real-time reputation scoring for every marketplace and auction house</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Venue Scores Tab */}
          {activeTab === 'scores' && (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-white font-bold text-2xl">{venues.length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Venues Tracked</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className={`font-bold text-2xl ${getScoreColor(avgScore)}`}>{avgScore}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Avg Score</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-emerald-400 font-bold text-2xl">{venues.filter(v => v.recommendation === 'strongly-recommended').length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Top Rated</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 text-center">
                  <p className="text-amber-400 font-bold text-2xl">{activeIssues.filter(i => !i.resolved).length}</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Open Issues</p>
                </div>
              </div>

              {/* Venue Cards */}
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getScoreBg(venue.overallScore)}`}>
                        <span className={`font-bold text-lg ${getScoreColor(venue.overallScore)}`}>{venue.overallScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold text-sm">{venue.name}</h3>
                          {getTrendIcon(venue.trend)}
                          <span className="text-slate-500 text-[10px] uppercase">{venue.trend}</span>
                        </div>
                        <span className="text-slate-500 text-xs capitalize">{venue.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                    {getRecommendationBadge(venue.recommendation)}
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[
                      { label: 'Dispute Rate', value: `${venue.metrics.disputeRate}%`, warn: venue.metrics.disputeRate > 2 },
                      { label: 'Shipping', value: `${venue.metrics.avgShippingDays}d`, warn: venue.metrics.avgShippingDays > 6 },
                      { label: 'Buyer Prot.', value: `${venue.metrics.buyerProtection}%`, warn: venue.metrics.buyerProtection < 80 },
                      { label: 'Seller Fees', value: `${venue.metrics.sellerFees}%`, warn: venue.metrics.sellerFees > 10 },
                      { label: 'Fraud Det.', value: `${venue.metrics.fraudDetection}%`, warn: venue.metrics.fraudDetection < 80 },
                    ].map((m) => (
                      <div key={m.label} className="text-center p-2 bg-slate-700/30 rounded-lg">
                        <p className={`font-bold text-sm ${m.warn ? 'text-amber-400' : 'text-white'}`}>{m.value}</p>
                        <p className="text-slate-500 text-[10px]">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      {venue.strengths.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-400">
                          <CheckCircle size={10} className="mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {venue.weaknesses.slice(0, 2).map((w, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-400">
                          <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Issues */}
                  {venue.recentIssues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/40">
                      {venue.recentIssues.map((issue) => (
                        <div key={issue.id} className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className="text-slate-300 text-xs truncate">{issue.description}</span>
                          {issue.resolved && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-medium border border-emerald-500/30">
                              Resolved
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comparisons Tab */}
          {activeTab === 'comparisons' && (
            <div className="space-y-5">
              {comparisons.map((comp) => (
                <div
                  key={comp.metric}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40"
                >
                  <h3 className="text-white font-semibold text-sm mb-4">{comp.metric}</h3>
                  <div className="space-y-3">
                    {comp.venues.map((v) => {
                      const maxVal = Math.max(...comp.venues.map(x => x.value));
                      const pct = (v.value / maxVal) * 100;
                      return (
                        <div key={v.name} className="flex items-center gap-3">
                          <span className="text-slate-400 text-xs w-6 text-right font-mono">#{v.rank}</span>
                          <span className="text-white text-xs w-20 truncate">{v.name}</span>
                          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${v.rank <= 2 ? 'bg-teal-500' : v.rank <= 4 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-white text-xs font-mono w-14 text-right">{v.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Best For... Summary */}
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-5">
                <h3 className="text-teal-400 text-xs font-semibold uppercase tracking-wide mb-3">Quick Recommendations</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { use: 'High-value singles', venue: 'Goldin', reason: 'Top authentication & buyer pool' },
                    { use: 'Low fees', venue: 'COMC', reason: '5% seller fees, vault storage' },
                    { use: 'Quick sale', venue: 'eBay', reason: 'Largest audience, fastest liquidity' },
                    { use: 'Premium consignment', venue: 'PWCC', reason: 'Strong auction results, vaulting' },
                  ].map((rec) => (
                    <div key={rec.use} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40">
                      <p className="text-teal-400 text-[10px] font-semibold uppercase tracking-wide">{rec.use}</p>
                      <p className="text-white text-sm font-bold">{rec.venue}</p>
                      <p className="text-slate-400 text-[10px]">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Issues Tab */}
          {activeTab === 'issues' && (
            <div className="space-y-5">
              {/* Issue Summary Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide">Active Issue Tracker</p>
                  <p className="text-white font-bold text-2xl">{activeIssues.length} Issues Found</p>
                </div>
                <Shield size={28} className="text-amber-400" />
              </div>

              {activeIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-medium capitalize">
                        {issue.type.replace('-', ' ')}
                      </span>
                      <span className="text-teal-400 text-xs font-semibold">{(issue as any).venueName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.resolved ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">Resolved</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-semibold border border-red-500/30">Open</span>
                      )}
                      <span className="text-slate-500 text-xs">{issue.date}</span>
                    </div>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed mb-3">{issue.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-400" />
                      <span className="text-slate-400 text-xs">User Impact: <span className="text-white font-semibold">{issue.userImpact}%</span></span>
                    </div>
                    <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${issue.userImpact > 50 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${issue.userImpact}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueHealthOracleModal;
