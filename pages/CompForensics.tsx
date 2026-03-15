import React, { useState, useEffect, useMemo } from 'react';
import {
  Microscope,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Search,
  FileText,
  Users,
} from 'lucide-react';
import {
  getTrackedCards,
  getComps,
  analyzeComps,
  detectOutliers,
  getSellerReputation,
  getPriceClusters,
  generateForensicReport,
  getPlatformPriceComparison,
  getRecentComps,
  getPlatformConfig,
  getOutlierConfig,
  formatCurrency,
  type CardEntry,
  type CompSale,
  type CompAnalysis,
  type ForensicReport,
  type SellerReputation as SellerReputationType,
} from '../lib/compForensicsService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';

const CompForensics: React.FC = () => {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('card_001');
  const [comps, setComps] = useState<CompSale[]>([]);
  const [analysis, setAnalysis] = useState<CompAnalysis | null>(null);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [sellers, setSellers] = useState<SellerReputationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCards(getTrackedCards());
      setSellers(getSellerReputation());
      setLoading(false);
    } catch {
      setError('Failed to load Comp Forensics data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCardId) {
      const cardComps = getComps(selectedCardId);
      setComps(cardComps);
      if (cardComps.length > 0) {
        setAnalysis(analyzeComps(cardComps));
        setReport(generateForensicReport(selectedCardId));
      }
    }
  }, [selectedCardId]);

  const outliers = useMemo(() => detectOutliers(comps), [comps]);
  const _recentComps = useMemo(() => getRecentComps(10), []);
  const platformComparison = useMemo(() => selectedCardId ? getPlatformPriceComparison(selectedCardId) : [], [selectedCardId]);
  const _clusters = useMemo(() => getPriceClusters(comps), [comps]);

  const totalComps = useMemo(() => getRecentComps().length, []);
  const totalOutliers = useMemo(() => getRecentComps().filter(c => c.is_outlier).length, []);
  const avgConfidence = useMemo(() => Math.round(cards.reduce((s, c) => s + c.fmvConfidence, 0) / (cards.length || 1)), [cards]);

  const scatterData = useMemo(() => {
    return comps.map(c => ({
      date: c.date,
      price: c.price,
      isOutlier: c.is_outlier,
      platform: c.platform,
      reason: c.outlier_reason,
    }));
  }, [comps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Comparable Sales Forensics...</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Microscope size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Real-Time Comparable Sales Forensics</h1>
            <p className="text-sm text-slate-400">Statistical analysis, outlier detection &amp; fair market value estimation &mdash; Phase 132</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Tracked</p>
          <p className="text-3xl font-bold text-cyan-400">{cards.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Comps Analyzed</p>
          <p className="text-3xl font-bold text-blue-400">{totalComps}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Outliers Detected</p>
          <p className="text-3xl font-bold text-amber-400">{totalOutliers}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
          <p className="text-3xl font-bold text-emerald-400">{avgConfidence}%</p>
        </div>
      </div>

      {/* Card Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Search size={18} className="text-cyan-400" />
          Select Card for Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`p-3 rounded-xl border text-left transition-colors ${selectedCardId === card.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'}`}
            >
              <p className="text-sm font-bold text-white truncate mb-1">{card.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{card.compCount} comps</span>
                <span className="text-sm font-bold text-white">{formatCurrency(card.fmv)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${card.fmvConfidence >= 90 ? 'bg-emerald-500/20 text-emerald-400' : card.fmvConfidence >= 75 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {card.fmvConfidence}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Price Distribution + Statistical Analysis */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" />
              Price Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => formatCurrency(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Price']}
                  />
                  <Scatter name="Sales" data={scatterData} dataKey="price">
                    {scatterData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.isOutlier ? '#f87171' : '#22d3ee'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Clean Sale</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Outlier</span>
            </div>
          </div>

          {/* Statistical Panel */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              Statistical Analysis
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Fair Market Value</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(analysis.fair_market_value)}</p>
                <p className="text-[10px] text-slate-500">Confidence: {analysis.fmv_confidence}%</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Mean / Median</p>
                <p className="text-lg font-bold text-white">{formatCurrency(analysis.mean)}</p>
                <p className="text-[10px] text-slate-500">Median: {formatCurrency(analysis.median)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Std Deviation</p>
                <p className="text-lg font-bold text-amber-400">{formatCurrency(analysis.std_dev)}</p>
                <p className="text-[10px] text-slate-500">IQR: {formatCurrency(analysis.iqr)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">95% Confidence Interval</p>
                <p className="text-sm font-bold text-white">{formatCurrency(analysis.confidence_interval[0])} &ndash; {formatCurrency(analysis.confidence_interval[1])}</p>
                <p className="text-[10px] text-slate-500">Sample: {analysis.sample_size} sales</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Price Range</p>
                <p className="text-sm font-bold text-white">{formatCurrency(analysis.min_price)} &ndash; {formatCurrency(analysis.max_price)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Trend</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${analysis.trend_direction === 'up' ? 'text-emerald-400' : analysis.trend_direction === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                  {analysis.trend_direction === 'up' ? <TrendingUp size={16} /> : analysis.trend_direction === 'down' ? <TrendingDown size={16} /> : null}
                  {analysis.trend_percent > 0 ? '+' : ''}{analysis.trend_percent}%
                </p>
                <p className="text-[10px] text-slate-500">{analysis.outlier_count} outliers removed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outlier Breakdown */}
      {outliers.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            Outlier Breakdown ({outliers.length} flagged)
          </h2>
          <div className="space-y-3">
            {outliers.map(o => {
              const pc = getPlatformConfig(o.platform);
              const oc = o.outlier_reason ? getOutlierConfig(o.outlier_reason) : null;
              return (
                <div key={o.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${pc.bg} ${pc.text} border ${pc.border} flex-shrink-0`}>{pc.label}</span>
                    {oc && <span className={`text-[10px] px-2 py-0.5 rounded border ${oc.bg} ${oc.text} ${oc.border} flex-shrink-0`}>{oc.label}</span>}
                    <div className="min-w-0">
                      <p className="text-xs text-slate-300 truncate">{o.condition_notes}</p>
                      <p className="text-[10px] text-slate-500">{o.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-400 flex-shrink-0 ml-2">{formatCurrency(o.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Comparison + Forensic Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Price Comparison */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            Platform Price Comparison
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Avg Price']}
                />
                <Bar dataKey="avgPrice" name="Avg Price" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forensic Report Summary */}
        {report && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-violet-400" />
              Forensic Report
            </h2>
            <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <p className="text-sm font-bold text-white mb-2">{report.cardName}</p>
              <p className="text-xs text-slate-300 mb-3">{report.recommendation}</p>
              {report.riskFactors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-red-400 font-bold uppercase">Risk Factors:</p>
                  {report.riskFactors.map((risk, idx) => (
                    <p key={idx} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                      <AlertTriangle size={10} className="text-amber-400 flex-shrink-0 mt-0.5" /> {risk}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Seller Type Breakdown</p>
              {report.sellerBreakdown.map(sb => (
                <div key={sb.seller_type} className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg text-xs">
                  <span className="text-slate-300 capitalize">{sb.seller_type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{sb.count} sales</span>
                    <span className="text-white font-bold">{formatCurrency(sb.avgPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seller Reputation */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-emerald-400" />
          Seller Reputation Scores
        </h2>
        <div className="space-y-3">
          {sellers.slice(0, 8).map(s => {
            const pc = getPlatformConfig(s.platform);
            return (
              <div key={s.sellerId} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${s.trustScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : s.trustScore >= 70 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {s.trustScore}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{s.sellerName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${pc.bg} ${pc.text} ${pc.border}`}>{pc.label}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{s.seller_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">Sales</p>
                    <p className="text-xs font-bold text-white">{s.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">Rating</p>
                    <p className="text-xs font-bold text-emerald-400">{s.positiveRating}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">vs FMV</p>
                    <p className={`text-xs font-bold ${s.avgPriceVsFmv <= 0 ? 'text-emerald-400' : s.avgPriceVsFmv <= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.avgPriceVsFmv > 0 ? '+' : ''}{s.avgPriceVsFmv}%
                    </p>
                  </div>
                  {s.suspiciousActivity > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                      {s.suspiciousActivity} flags
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompForensics;
