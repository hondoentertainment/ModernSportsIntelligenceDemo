// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Search,
} from 'lucide-react';
import {
  getPricePredictions,
  generateFairOffer,
  getModelAccuracy,
  getPriceHistory,
  getComparableSales,
  getPredictionFactors,
  getTopMovers,
  getConfidenceConfig,
  formatCurrency,
  formatPercent,
  type PricePrediction as PricePredictionType,
  type FairOffer,
  type ModelAccuracy,
  type PriceHistory,
  type ComparableSale,
  type PredictionFactor,
} from '../lib/analytics/pricePredictionService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const PricePrediction: React.FC = () => {
  const [predictions, setPredictions] = useState<PricePredictionType[]>([]);
  const [topUp, setTopUp] = useState<PricePredictionType[]>([]);
  const [topDown, setTopDown] = useState<PricePredictionType[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('card_001');
  const [fairOffers, setFairOffers] = useState<FairOffer[]>([]);
  const [accuracy, setAccuracy] = useState<ModelAccuracy[]>([]);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [comparables, setComparables] = useState<ComparableSale[]>([]);
  const [factors, setFactors] = useState<PredictionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allPredictions = getPricePredictions();
      setPredictions(allPredictions);
      setTopUp(getTopMovers('up', 5));
      setTopDown(getTopMovers('down', 5));
      setAccuracy(getModelAccuracy());
      setLoading(false);
    } catch {
      setError('Failed to load Price Prediction data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCard) return;
    try {
      const offers: FairOffer[] = [];
      const offer = generateFairOffer(selectedCard);
      if (offer) offers.push(offer);
      setFairOffers(offers);
      setHistory(getPriceHistory(selectedCard, 90));
      setComparables(getComparableSales(selectedCard, 8));
      setFactors(getPredictionFactors(selectedCard));
    } catch {
      // ignore
    }
  }, [selectedCard]);

  const selectedPrediction = useMemo(() => {
    return predictions.find(p => p.cardId === selectedCard) || null;
  }, [predictions, selectedCard]);

  const scatterData = useMemo(() => {
    return predictions.map(p => {
      const pred30 = p.predictions.find(pr => pr.timeframe === '30d');
      return {
        name: p.player,
        predicted: pred30?.predictedPrice || p.currentPrice,
        actual: p.currentPrice,
        confidence: pred30?.confidenceScore || 0,
      };
    });
  }, [predictions]);

  const weeklyMoversData = useMemo(() => {
    return predictions
      .map(p => {
        const pred7 = p.predictions.find(pr => pr.timeframe === '7d');
        return {
          player: p.player.split(' ').pop() || p.player,
          change: pred7?.changePercent || 0,
          price: p.currentPrice,
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 10);
  }, [predictions]);

  const chartData = useMemo(() => {
    if (!selectedPrediction || history.length === 0) return [];
    const histSlice = history.slice(-60);
    const combined = histSlice.map(h => ({
      date: h.date.slice(5),
      price: h.price,
      predicted: null as number | null,
    }));
    selectedPrediction.predictions.forEach(pred => {
      combined.push({
        date: pred.timeframe,
        price: null as unknown as number,
        predicted: pred.predictedPrice,
      });
    });
    return combined;
  }, [selectedPrediction, history]);

  const summaryStats = useMemo(() => {
    const avgConfidence = predictions.length > 0
      ? Math.round(predictions.reduce((s, p) => s + (p.predictions.find(pr => pr.timeframe === '30d')?.confidenceScore || 0), 0) / predictions.length)
      : 0;
    const upCount = predictions.filter(p => p.direction === 'up').length;
    const downCount = predictions.filter(p => p.direction === 'down').length;
    const stableCount = predictions.filter(p => p.direction === 'stable').length;
    const totalValue = predictions.reduce((s, p) => s + p.currentPrice, 0);
    return { avgConfidence, upCount, downCount, stableCount, totalValue, total: predictions.length };
  }, [predictions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading AI Price Prediction &amp; Fair Offer Generator...</p>
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
        <div className="p-2 rounded-xl bg-blue-500/20">
          <TrendingUp size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Price Prediction &amp; Fair Offer Generator</h1>
          <p className="text-sm text-slate-400">ML-powered price forecasting with confidence-scored valuations &mdash; Phase 146</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tracked Cards</p>
          <p className="text-2xl font-bold text-blue-400">{summaryStats.total}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bullish</p>
          <p className="text-2xl font-bold text-emerald-400">{summaryStats.upCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bearish</p>
          <p className="text-2xl font-bold text-red-400">{summaryStats.downCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Stable</p>
          <p className="text-2xl font-bold text-amber-400">{summaryStats.stableCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-cyan-400">{summaryStats.avgConfidence}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(summaryStats.totalValue)}</p>
        </div>
      </div>

      {/* Top Movers Up & Down */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers Up */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Top Movers (Bullish)
          </h2>
          <div className="space-y-3">
            {topUp.map(p => {
              const pred30 = p.predictions.find(pr => pr.timeframe === '30d');
              return (
                <div
                  key={p.id}
                  className={`bg-slate-900/50 border rounded-xl p-3 cursor-pointer transition-colors ${selectedCard === p.cardId ? 'border-emerald-500/50' : 'border-slate-700/30 hover:border-slate-600/50'}`}
                  onClick={() => setSelectedCard(p.cardId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[240px]">{p.player}</p>
                      <p className="text-[10px] text-slate-500">{p.sport} &bull; {formatCurrency(p.currentPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{formatPercent(pred30?.changePercent || 0)}</p>
                      <p className="text-[10px] text-slate-500">30d forecast</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-slate-700/30 rounded-full h-1.5">
                    <div className="bg-emerald-500 rounded-full h-1.5" style={{ width: `${pred30?.confidenceScore || 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Movers Down */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-red-400" />
            Top Movers (Bearish)
          </h2>
          <div className="space-y-3">
            {topDown.map(p => {
              const pred30 = p.predictions.find(pr => pr.timeframe === '30d');
              return (
                <div
                  key={p.id}
                  className={`bg-slate-900/50 border rounded-xl p-3 cursor-pointer transition-colors ${selectedCard === p.cardId ? 'border-red-500/50' : 'border-slate-700/30 hover:border-slate-600/50'}`}
                  onClick={() => setSelectedCard(p.cardId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[240px]">{p.player}</p>
                      <p className="text-[10px] text-slate-500">{p.sport} &bull; {formatCurrency(p.currentPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{formatPercent(pred30?.changePercent || 0)}</p>
                      <p className="text-[10px] text-slate-500">30d forecast</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-slate-700/30 rounded-full h-1.5">
                    <div className="bg-red-500 rounded-full h-1.5" style={{ width: `${pred30?.confidenceScore || 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prediction Details & Confidence Bars */}
      {selectedPrediction && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-400" />
            Prediction Details &mdash; {selectedPrediction.player}
          </h2>
          <div className="mb-2">
            <select
              value={selectedCard}
              onChange={e => setSelectedCard(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {predictions.map(p => (
                <option key={p.cardId} value={p.cardId}>{p.cardName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {selectedPrediction.predictions.map(pred => {
              const confCfg = getConfidenceConfig(pred.confidence);
              return (
                <div key={pred.timeframe} className={`bg-slate-900/50 border rounded-xl p-3 ${confCfg.border}`}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{pred.timeframe}</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(pred.predictedPrice)}</p>
                  <p className={`text-xs font-bold ${pred.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(pred.changePercent)}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[9px] ${confCfg.text}`}>{confCfg.label}</span>
                      <span className="text-[9px] text-slate-500">{pred.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-1">
                      <div
                        className={`rounded-full h-1 ${pred.confidenceScore >= 80 ? 'bg-emerald-500' : pred.confidenceScore >= 60 ? 'bg-blue-500' : pred.confidenceScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pred.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Price + Prediction Overlay LineChart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          Historical Price &amp; Prediction Overlay
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Historical Price" />
              <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted Price" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fair Offer Generator */}
      {fairOffers.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Fair Offer Generator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fairOffers.map(offer => {
              const confCfg = getConfidenceConfig(offer.confidence);
              return (
                <React.Fragment key={offer.cardId}>
                  {/* Buy Range */}
                  <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-emerald-400">Buy Range</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${confCfg.bg} ${confCfg.text}`}>{confCfg.label}</span>
                    </div>
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(offer.fairBuyPrice)}</p>
                      <p className="text-[10px] text-slate-500">Fair Buy Price</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>{formatCurrency(offer.buyRange.low)}</span>
                      <span>Range</span>
                      <span>{formatCurrency(offer.buyRange.high)}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2 relative">
                      <div className="bg-emerald-500/40 rounded-full h-2" style={{ width: '100%' }} />
                      <div
                        className="absolute top-0 h-2 w-1 bg-emerald-400 rounded-full"
                        style={{ left: `${((offer.fairBuyPrice - offer.buyRange.low) / (offer.buyRange.high - offer.buyRange.low)) * 100}%` }}
                      />
                    </div>
                  </div>
                  {/* Sell Range */}
                  <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-blue-400">Sell Range</span>
                      <span className="text-[10px] text-slate-500">{offer.evidenceCount} evidence points</span>
                    </div>
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold text-blue-400">{formatCurrency(offer.fairSellPrice)}</p>
                      <p className="text-[10px] text-slate-500">Fair Sell Price</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>{formatCurrency(offer.sellRange.low)}</span>
                      <span>Range</span>
                      <span>{formatCurrency(offer.sellRange.high)}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2 relative">
                      <div className="bg-blue-500/40 rounded-full h-2" style={{ width: '100%' }} />
                      <div
                        className="absolute top-0 h-2 w-1 bg-blue-400 rounded-full"
                        style={{ left: `${((offer.fairSellPrice - offer.sellRange.low) / (offer.sellRange.high - offer.sellRange.low)) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3 italic">{offer.reasoning}</p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Accuracy Metrics by Timeframe */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-amber-400" />
          Model Accuracy by Timeframe
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Timeframe</th>
                <th className="text-right py-2 px-2">Within 5%</th>
                <th className="text-right py-2 px-2">Within 10%</th>
                <th className="text-right py-2 px-2">Within 20%</th>
                <th className="text-right py-2 px-2">Mean Error</th>
                <th className="text-right py-2 pl-2">Predictions</th>
              </tr>
            </thead>
            <tbody>
              {accuracy.map(a => (
                <tr key={a.timeframe} className="border-b border-slate-700/30">
                  <td className="py-2 pr-2 text-slate-300 font-bold uppercase">{a.timeframe}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-bold ${a.within5Percent >= 70 ? 'text-emerald-400' : a.within5Percent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {a.within5Percent}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-bold ${a.within10Percent >= 80 ? 'text-emerald-400' : a.within10Percent >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {a.within10Percent}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-bold ${a.within20Percent >= 85 ? 'text-emerald-400' : a.within20Percent >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                      {a.within20Percent}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-400">{a.meanError}%</td>
                  <td className="py-2 pl-2 text-right text-slate-400">{a.totalPredictions.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparable Sales Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Search size={18} className="text-purple-400" />
          Comparable Sales {selectedPrediction ? `\u2014 ${selectedPrediction.player}` : ''}
        </h2>
        {comparables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Card</th>
                  <th className="text-left py-2 px-2">Grade</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-left py-2 px-2">Platform</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-right py-2 pl-2">Days Ago</th>
                </tr>
              </thead>
              <tbody>
                {comparables.map(sale => (
                  <tr key={sale.id} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-300 font-medium truncate max-w-[200px]">{sale.cardName}</td>
                    <td className="py-2 px-2 text-slate-400">{sale.grade}</td>
                    <td className="py-2 px-2 text-right text-emerald-400 font-bold">${sale.price.toLocaleString()}</td>
                    <td className="py-2 px-2 text-slate-400">{sale.platform}</td>
                    <td className="py-2 px-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">{sale.saleType}</span>
                    </td>
                    <td className="py-2 pl-2 text-right text-slate-500">{sale.daysAgo}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No comparable sales data available for this card. Select a different card above.</p>
        )}
      </div>

      {/* Prediction Factors with Weighted Bars */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          Prediction Factors {selectedPrediction ? `\u2014 ${selectedPrediction.player}` : ''}
        </h2>
        <div className="space-y-3">
          {factors.map((factor, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{factor.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    factor.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                    factor.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>{factor.impact}</span>
                </div>
                <span className="text-xs text-slate-500">Weight: {factor.weight}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">{factor.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700/30 rounded-full h-2">
                  <div
                    className={`rounded-full h-2 ${
                      factor.impact === 'positive' ? 'bg-emerald-500' :
                      factor.impact === 'negative' ? 'bg-red-500' :
                      'bg-slate-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{factor.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ScatterChart: Predicted vs Actual + BarChart: Weekly Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ScatterChart: Predicted vs Current */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-cyan-400" />
            Predicted vs Current Price
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="actual" name="Current Price" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Current ($)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                <YAxis type="number" dataKey="predicted" name="Predicted Price" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Predicted ($)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Cards" data={scatterData} fill="#3b82f6">
                  {scatterData.map((entry, index) => (
                    <Cell key={index} fill={entry.predicted >= entry.actual ? '#10b981' : '#ef4444'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BarChart: Top Movers of the Week */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-400" />
            Top Movers of the Week (7d Forecast)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMoversData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="category" dataKey="player" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Change']} />
                <Bar dataKey="change" name="7d Change %" radius={[0, 4, 4, 0]}>
                  {weeklyMoversData.map((entry, index) => (
                    <Cell key={index} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePrediction;
