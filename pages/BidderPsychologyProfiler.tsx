import React, { useState, useEffect, useMemo } from 'react';
import { Brain, AlertTriangle, Eye, Zap, TrendingUp, Users, Target, ShieldAlert, Clock } from 'lucide-react';
import {
  getBidderProfiles,
  getBidderProfile,
  getLiveAuctionBidStreams,
  getLiveAuctionBidStream,
  getBidderIntelReports,
  getBidTimingData,
  getAuctionPsychSummary,
  getBidderRadarData,
  formatTimeRemaining,
  formatCurrency,
  type BidderProfile,
  type LiveAuctionBidStream,
  type BidderIntelReport,
  type AuctionPsychSummary,
} from '../lib/bidderPsychologyService.ts';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const DANGER_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const PROFILE_COLORS: Record<string, string> = {
  emotional: 'text-red-400',
  strategic: 'text-blue-400',
  'value hunter': 'text-emerald-400',
  collector: 'text-purple-400',
  dealer: 'text-amber-400',
};

const BidderPsychologyProfiler: React.FC = () => {
  const [profiles, setProfiles] = useState<BidderProfile[]>([]);
  const [auctions, setAuctions] = useState<LiveAuctionBidStream[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('a001');
  const [selectedBidderId, setSelectedBidderId] = useState<string>('b001');
  const [intelReports, setIntelReports] = useState<BidderIntelReport[]>([]);
  const [summary, setSummary] = useState<AuctionPsychSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setProfiles(getBidderProfiles());
      setAuctions(getLiveAuctionBidStreams());
      setSummary(getAuctionPsychSummary());
      setLoading(false);
    } catch {
      setError('Failed to load Bidder Psychology data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIntelReports(getBidderIntelReports(selectedAuctionId));
  }, [selectedAuctionId]);

  const selectedAuction = useMemo(() => getLiveAuctionBidStream(selectedAuctionId), [selectedAuctionId]);
  const selectedBidder = useMemo(() => getBidderProfile(selectedBidderId), [selectedBidderId]);
  const radarData = useMemo(() => getBidderRadarData(selectedBidderId), [selectedBidderId]);
  const bidTimingData = useMemo(() => getBidTimingData(), []);

  const activeBidderProfiles = useMemo(() => {
    if (!selectedAuction) return [];
    const seen = new Set<string>();
    selectedAuction.bids.forEach(b => seen.add(b.bidderId));
    return Array.from(seen).map(id => profiles.find(p => p.id === id)).filter(Boolean) as BidderProfile[];
  }, [selectedAuction, profiles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Bidder Psychology Profiler...</p>
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
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Brain size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Live Auction Bidder Psychology Profiler</h1>
          <p className="text-sm text-slate-400">Real-time competitor analysis — identify poker tells, predict dropout thresholds, win smarter</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bidders Tracked</p>
          <p className="text-3xl font-bold text-purple-400">{summary?.totalBiddersTracked ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Emotional Bidders</p>
          <p className="text-3xl font-bold text-red-400">{summary?.emotionalBiddersDetected ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prediction Accuracy</p>
          <p className="text-3xl font-bold text-emerald-400">
            {summary ? Math.round((summary.successfulPredictions / (summary.successfulPredictions + 112)) * 100) : 0}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Avg Winning Edge</p>
          <p className="text-3xl font-bold text-amber-400">{summary?.avgWinningEdge ?? 0}%</p>
          <p className="text-xs text-slate-500 mt-1">below predicted max</p>
        </div>
      </div>

      {/* Live Auction Monitor */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Eye size={18} className="text-purple-400" />
            Live Auction Monitor
          </h2>
          <div className="flex gap-2">
            {auctions.map(a => (
              <button
                key={a.auctionId}
                onClick={() => { setSelectedAuctionId(a.auctionId); setSelectedBidderId(activeBidderProfiles[0]?.id ?? 'b001'); }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selectedAuctionId === a.auctionId ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500'}`}
              >
                {a.auctionId.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {selectedAuction && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white">{selectedAuction.cardName}</p>
                    <p className="text-xs text-slate-500">{selectedAuction.platform} &middot; {selectedAuction.activeBidders} active bidders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Time Remaining</p>
                    <p className="text-sm font-bold text-red-400 flex items-center gap-1">
                      <Clock size={12} /> {formatTimeRemaining(selectedAuction.timeRemaining)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Current Bid</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedAuction.currentBid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Fair Market Value</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(selectedAuction.fairMarketValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">% of FMV</p>
                    <p className={`text-xl font-bold ${selectedAuction.currentBid / selectedAuction.fairMarketValue < 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {Math.round((selectedAuction.currentBid / selectedAuction.fairMarketValue) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Bid Stream */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Bid Activity</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...selectedAuction.bids].reverse().map((bid, idx) => {
                    const bidder = profiles.find(p => p.id === bid.bidderId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/20 last:border-0 cursor-pointer hover:bg-slate-800/30 px-2 rounded"
                        onClick={() => setSelectedBidderId(bid.bidderId)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${PROFILE_COLORS[bidder?.profileType ?? 'strategic']}`}>{bidder?.username ?? bid.bidderId}</span>
                          {bidder && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] border ${DANGER_COLORS[bidder.dangerLevel]}`}>
                              {bidder.dangerLevel.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {bid.timeSinceLastBid > 0 && (
                            <span className="text-slate-600">{bid.timeSinceLastBid}s gap</span>
                          )}
                          <span className="font-bold text-white">{formatCurrency(bid.amount)}</span>
                          <span className="text-slate-500">{bid.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bidder Radar */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Bidder Radar: {selectedBidder?.username ?? 'Select Bidder'}
              </p>
              {selectedBidder && (
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold capitalize ${PROFILE_COLORS[selectedBidder.profileType]}`}>{selectedBidder.profileType}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded border ${DANGER_COLORS[selectedBidder.dangerLevel]}`}>{selectedBidder.dangerLevel} danger</span>
                </div>
              )}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Radar name="Profile" dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {selectedBidder && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Win Rate</p>
                    <p className="text-sm font-bold text-emerald-400">{Math.round(selectedBidder.winRate * 100)}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Dropout At</p>
                    <p className="text-sm font-bold text-red-400">{Math.round(selectedBidder.typicalDropoutAt * 100)}% FMV</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bidder Intel Cards + Poker Tells */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-400" />
            Bidder Intel Cards
          </h2>
          <div className="space-y-3">
            {intelReports.map((report, idx) => {
              const bidder = profiles.find(p => p.id === report.bidderId);
              return (
                <div
                  key={idx}
                  className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer transition-colors ${selectedBidderId === report.bidderId ? 'border-purple-500/40' : 'border-slate-700/30 hover:border-slate-600'}`}
                  onClick={() => setSelectedBidderId(report.bidderId)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${PROFILE_COLORS[bidder?.profileType ?? 'strategic']}`}>{bidder?.username}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded border capitalize ${DANGER_COLORS[bidder?.dangerLevel ?? 'low']}`}>{bidder?.dangerLevel} danger</span>
                      <span className="text-[10px] text-slate-500 capitalize">{bidder?.profileType}</span>
                    </div>
                    <span className={`text-xs font-bold ${report.confidence >= 80 ? 'text-emerald-400' : report.confidence >= 65 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {report.confidence}% conf.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Predicted Max Bid</p>
                      <p className="text-sm font-bold text-amber-400">{formatCurrency(report.predictedMaxBid)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500">Dropout Probability</p>
                      <p className={`text-sm font-bold ${report.dropoutProbability > 0.6 ? 'text-emerald-400' : report.dropoutProbability > 0.35 ? 'text-amber-400' : 'text-red-400'}`}>
                        {Math.round(report.dropoutProbability * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-xs text-purple-300">{report.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            Poker Tells Panel
          </h2>
          <div className="space-y-4">
            {activeBidderProfiles.map((bidder, idx) => {
              const report = intelReports.find(r => r.bidderId === bidder.id);
              return (
                <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm font-bold ${PROFILE_COLORS[bidder.profileType]}`}>{bidder.username}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full capitalize ${PROFILE_COLORS[bidder.profileType]}`}>{bidder.profileType}</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3 italic">"{bidder.tell}"</p>
                  {report && report.emotionalSignals.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Emotional Signals</p>
                      <div className="space-y-1">
                        {report.emotionalSignals.map((s, i) => (
                          <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">&#x25CF;</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {report && report.strategicSignals.length > 0 && (
                    <div>
                      <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Strategic Signals</p>
                      <div className="space-y-1">
                        {report.strategicSignals.map((s, i) => (
                          <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-blue-400 mt-0.5">&#x25CF;</span> {s}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                    <span>Bid Speed: <span className="text-slate-300 capitalize">{bidder.bidSpeed}</span></span>
                    <span>Auctions: <span className="text-slate-300">{bidder.totalAuctions}</span></span>
                    <span>Win Rate: <span className="text-emerald-400">{Math.round(bidder.winRate * 100)}%</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bid Timing Heatmap */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Bid Timing Heatmap — When Bidders Strike
        </h2>
        <p className="text-xs text-slate-500 mb-4">Average bids per minute by time remaining in auction. The classic sniping spike is visible in the final 2 minutes.</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...bidTimingData].reverse()}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Bids/min', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [`${v} bids/min`, 'Avg Frequency']}
              />
              <Bar
                dataKey="avgBidFrequency"
                name="Avg Bid Frequency"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Bidder Profiles Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          Full Bidder Profile Database
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Username</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Type</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Danger</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Win Rate</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Auctions</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Dropout At</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3">Tell</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-700/20 hover:bg-slate-700/10 cursor-pointer" onClick={() => setSelectedBidderId(p.id)}>
                  <td className="py-3 pr-3">
                    <span className={`text-sm font-bold ${PROFILE_COLORS[p.profileType]}`}>{p.username}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs text-slate-400 capitalize">{p.profileType}</span>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] rounded border ${DANGER_COLORS[p.dangerLevel]}`}>{p.dangerLevel}</span>
                  </td>
                  <td className="py-3 pr-3 text-right text-sm font-bold text-emerald-400">{Math.round(p.winRate * 100)}%</td>
                  <td className="py-3 pr-3 text-right text-sm text-slate-400">{p.totalAuctions}</td>
                  <td className="py-3 pr-3 text-right text-sm text-amber-400">{Math.round(p.typicalDropoutAt * 100)}%</td>
                  <td className="py-3 text-xs text-slate-500 max-w-xs truncate">{p.tell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Summary */}
      <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-purple-400" />
          Active Auction Recommendations
        </h2>
        <div className="space-y-3">
          {intelReports.map((report, idx) => {
            const bidder = profiles.find(p => p.id === report.bidderId);
            return (
              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-900/50 border border-purple-500/20 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${report.dropoutProbability > 0.6 ? 'bg-emerald-400' : report.dropoutProbability > 0.35 ? 'bg-amber-400' : 'bg-red-400'}`} />
                <div>
                  <p className="text-sm text-slate-200">{report.recommendation}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                    <span>Predicted max: <span className="text-amber-400 font-bold">{formatCurrency(report.predictedMaxBid)}</span></span>
                    <span>Confidence: <span className="text-slate-300">{report.confidence}%</span></span>
                    <span>Profile: <span className="text-slate-300 capitalize">{bidder?.profileType}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BidderPsychologyProfiler;
