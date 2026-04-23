// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Radar, AlertTriangle, TrendingUp, Calendar, Zap, Target, BarChart3, ChevronDown, ChevronUp, Award } from 'lucide-react';
import {
  getPredictedAnnouncements,
  getManufacturerCadences,
  getAnnouncementSignals,
  getHistoricalAccuracy,
  getOverallAccuracyRate,
  getPrePositioningOpportunities,
  getSignalsForProduct,
  getSignalTypeLabel,
  getSignalTypeColor,
  getSignalStrengthColor,
  getMarketImpactColor,
  formatCurrency,
  type PredictedAnnouncement,
  type ManufacturerCadence,
  type AnnouncementSignal,
  type HistoricalAccuracy,
  type PrePositioningOpportunity,
} from '../lib/analytics/productAnnouncementRadarService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ProductAnnouncementRadar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<PredictedAnnouncement[]>([]);
  const [cadences, setCadences] = useState<ManufacturerCadence[]>([]);
  const [signals, setSignals] = useState<AnnouncementSignal[]>([]);
  const [history, setHistory] = useState<HistoricalAccuracy[]>([]);
  const [opportunities, setOpportunities] = useState<PrePositioningOpportunity[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState<number>(0);
  const [expandedProductId, setExpandedProductId] = useState<string | null>('pa001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAnnouncements(getPredictedAnnouncements());
      setCadences(getManufacturerCadences());
      setSignals(getAnnouncementSignals());
      setHistory(getHistoricalAccuracy());
      setOpportunities(getPrePositioningOpportunities());
      setOverallAccuracy(getOverallAccuracyRate());
      setLoading(false);
    } catch {
      setError('Failed to load Product Announcement Radar data');
      setLoading(false);
    }
  }, []);

  const historyChartData = useMemo(() =>
    history.map(h => ({
      year: String(h.year),
      accuracy: Math.round((h.correct / h.predictionsTotal) * 100),
      total: h.predictionsTotal,
      correct: h.correct,
    })), [history]);

  const productSignals = useMemo(() => {
    if (!expandedProductId) return [];
    const product = announcements.find(a => a.id === expandedProductId);
    if (!product) return [];
    return getSignalsForProduct(product.productName);
  }, [expandedProductId, announcements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Product Announcement Radar...</p>
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Radar size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Predictive Product Announcement Radar</h1>
            <p className="text-sm text-slate-400">ML-powered release prediction — position before the announcement pump</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <Award size={18} className="text-emerald-400" />
          <span className="text-sm font-bold text-emerald-300">{overallAccuracy}% historical prediction accuracy</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Predictions</p>
          <p className="text-3xl font-bold text-cyan-400">{announcements.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Signals Detected</p>
          <p className="text-3xl font-bold text-amber-400">{signals.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Next Predicted</p>
          <p className="text-3xl font-bold text-emerald-400">{announcements[0]?.daysUntilPredicted ?? 0}d</p>
          <p className="text-xs text-slate-500 mt-1">away</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buy Opportunities</p>
          <p className="text-3xl font-bold text-purple-400">{opportunities.filter(o => o.action === 'buy now').length}</p>
        </div>
      </div>

      {/* Predicted Announcements Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-cyan-400" />
          Predicted Announcements Timeline
        </h2>
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const isExpanded = expandedProductId === announcement.id;
            return (
              <div key={announcement.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedProductId(isExpanded ? null : announcement.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-white">{announcement.productName}</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded border ${getSignalStrengthColor(announcement.signalStrength)}`}>
                          {announcement.signalStrength.toUpperCase()}
                        </span>
                        <span className={`text-xs font-bold capitalize ${getMarketImpactColor(announcement.marketImpact)}`}>
                          {announcement.marketImpact} impact
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span>{announcement.manufacturer}</span>
                        <span>&middot;</span>
                        <span>{announcement.sport}</span>
                        <span>&middot;</span>
                        <span className="text-cyan-400 font-bold">{announcement.predictedAnnouncementDate}</span>
                        <span>&middot;</span>
                        <span className={announcement.daysUntilPredicted <= 14 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                          {announcement.daysUntilPredicted} days away
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Confidence meter */}
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${announcement.confidence >= 85 ? 'bg-emerald-400' : announcement.confidence >= 70 ? 'bg-amber-400' : 'bg-slate-500'}`}
                              style={{ width: `${announcement.confidence}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${announcement.confidence >= 85 ? 'text-emerald-400' : announcement.confidence >= 70 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {announcement.confidence}%
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded: Why We Think This */}
                {isExpanded && (
                  <div className="border-t border-slate-700/30 p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Why We Think This</p>
                        <div className="space-y-1.5">
                          {announcement.predictionBasis.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="text-emerald-400 mt-0.5 flex-shrink-0">&#x2713;</span>
                              {reason}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3 italic">{announcement.historicalAnnouncementPattern}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Key Rookies</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {announcement.expectedKeyRookies.map((rookie, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg">{rookie}</span>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cards to Watch Now</p>
                        <div className="space-y-1">
                          {announcement.relatedCardsToWatch.map((card, idx) => (
                            <p key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                              <span className="text-amber-400 mt-0.5">&#x25B6;</span> {card}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Signals for this product */}
                    {productSignals.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detected Signals</p>
                        <div className="space-y-2">
                          {productSignals.map((signal) => (
                            <div key={signal.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                              <span className={`px-2 py-0.5 text-[10px] rounded border flex-shrink-0 ${getSignalTypeColor(signal.signalType)}`}>
                                {getSignalTypeLabel(signal.signalType)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-300">{signal.description}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{signal.detectedAt} &middot; Strength: {signal.strength}/100</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Signal Feed + Pre-Positioning Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Feed */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            Live Signal Feed
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {signals.map((signal) => (
              <div key={signal.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] rounded border flex-shrink-0 ${getSignalTypeColor(signal.signalType)}`}>
                    {getSignalTypeLabel(signal.signalType)}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 ml-auto">
                    <span>{signal.manufacturer}</span>
                    <span>&middot;</span>
                    <span>{signal.detectedAt}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-2">{signal.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${signal.strength >= 80 ? 'bg-emerald-400' : signal.strength >= 60 ? 'bg-amber-400' : 'bg-slate-500'}`}
                      style={{ width: `${signal.strength}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Signal: {signal.strength}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Accuracy */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            Historical Prediction Accuracy
          </h2>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`${v}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" name="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {history.map((h, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-200">{h.year}</span>
                  <span className="text-sm font-bold text-emerald-400">{Math.round((h.correct / h.predictionsTotal) * 100)}%</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  <span>{h.correct}/{h.predictionsTotal} correct</span>
                  <span>&middot;</span>
                  <span>Avg {h.avgDaysEarly} days early</span>
                </div>
                <p className="text-[10px] text-cyan-300 italic">{h.bestCall}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-Positioning Opportunities Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-purple-400" />
          Pre-Positioning Opportunities
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Card to Watch</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Product</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Current Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Expected Price</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Expected ROI</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Action</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3">Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp, idx) => (
                <tr key={idx} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                  <td className="py-3 pr-3">
                    <p className="text-xs font-bold text-white max-w-[180px] leading-tight">{opp.cardToWatch}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <p className="text-[10px] text-slate-400 max-w-[140px] leading-tight">{opp.productName}</p>
                  </td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{formatCurrency(opp.currentPrice)}</td>
                  <td className="py-3 pr-3 text-sm text-right font-bold text-emerald-400">{formatCurrency(opp.expectedPostAnnouncementPrice)}</td>
                  <td className="py-3 pr-3 text-sm text-right font-bold text-amber-400">+{opp.expectedROI.toFixed(1)}%</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${opp.action === 'buy now' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                      {opp.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-[10px] text-slate-400 max-w-xs">{opp.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manufacturer Cadence Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-400" />
          Manufacturer Cadence Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Manufacturer</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Avg Days Between</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Preferred Day</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Lead Time (days)</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">2026 Releases</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3">Remaining Predicted</th>
              </tr>
            </thead>
            <tbody>
              {cadences.map((c, idx) => (
                <tr key={idx} className="border-b border-slate-700/20">
                  <td className="py-3 pr-3">
                    <span className="text-sm font-bold text-slate-200">{c.manufacturer}</span>
                  </td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{c.avgDaysBetweenReleases}d</td>
                  <td className="py-3 pr-3 text-sm text-cyan-400">{c.preferredAnnouncementDay}</td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{c.leadTimeToRelease}d</td>
                  <td className="py-3 pr-3 text-sm text-right text-emerald-400 font-bold">{c.currentYearReleases}</td>
                  <td className="py-3 text-sm text-right text-amber-400 font-bold">{c.predictedRemainingReleases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600 mt-3">Cadence patterns derived from 5+ years of manufacturer announcement data. Lead time = days from announcement to release date.</p>
      </div>
    </div>
  );
};

export default ProductAnnouncementRadar;
