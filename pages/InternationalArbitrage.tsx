import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ship,
  Shield,
  BarChart3,
  ArrowRightLeft,
} from 'lucide-react';
import {
  getArbitrageOpportunities,
  getMarketProfiles,
  getCurrencyRates,
  getShippingRoutes,
  getCustomsDuties,
  getPlatformFees,
  getPriceComparisons,
  getRegionalTrends,
  getRiskAssessment,
  getArbitrageResult,
  getHistoricalArbitrage,
  getMarketConfig,
  getRiskConfig,
  formatCurrency,
  formatPercent,
  type ArbitrageOpportunity,
  type MarketProfile,
  type CurrencyRate,
  type ShippingRoute,
  type CustomsDuty,
  type PlatformFee,
  type PriceComparison,
  type RegionalTrend,
  type RiskAssessment,
  type ArbitrageResult,
} from '../lib/internationalArbitrageService';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#f43f5e', '#6366f1'];

const InternationalArbitrage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [marketProfiles, setMarketProfiles] = useState<MarketProfile[]>([]);
  const [_currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [shippingRoutes, setShippingRoutes] = useState<ShippingRoute[]>([]);
  const [customsDuties, setCustomsDuties] = useState<CustomsDuty[]>([]);
  const [platformFees, setPlatformFees] = useState<PlatformFee[]>([]);
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [trends, setTrends] = useState<RegionalTrend[]>([]);
  const [arbResult, setArbResult] = useState<ArbitrageResult | null>(null);
  const [historicalData, setHistoricalData] = useState<{ month: string; avgSpread: number; volume: number }[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const opps = getArbitrageOpportunities();
      setOpportunities(opps);
      setMarketProfiles(getMarketProfiles());
      setCurrencyRates(getCurrencyRates());
      setShippingRoutes(getShippingRoutes());
      setCustomsDuties(getCustomsDuties());
      setPlatformFees(getPlatformFees());
      setComparisons(getPriceComparisons());
      setTrends(getRegionalTrends());
      setArbResult(getArbitrageResult());
      setHistoricalData(getHistoricalArbitrage());
      if (opps.length > 0) {
        setSelectedOppId(opps[0].id);
        setRiskAssessment(getRiskAssessment(opps[0].id));
      }
      setLoading(false);
    } catch {
      setError('Failed to load International Arbitrage data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedOppId) return;
    try {
      setRiskAssessment(getRiskAssessment(selectedOppId));
    } catch {
      // ignore
    }
  }, [selectedOppId]);

  const summaryStats = useMemo(() => {
    const totalProfit = arbResult?.totalPotentialProfit || 0;
    const avgSpread = arbResult?.avgSpread || 0;
    const totalOpps = arbResult?.totalOpportunities || 0;
    const lowRisk = opportunities.filter(o => o.riskLevel === 'low').length;
    const topProfit = arbResult?.bestOpportunity?.netProfit || 0;
    const marketsActive = new Set([...opportunities.map(o => o.buyMarket), ...opportunities.map(o => o.sellMarket)]).size;
    return { totalProfit, avgSpread, totalOpps, lowRisk, topProfit, marketsActive };
  }, [arbResult, opportunities]);

  const profitByPairData = useMemo(() => {
    if (!arbResult) return [];
    return arbResult.marketPairStats.slice(0, 8).map((pair, _i) => ({
      name: pair.pair.length > 20 ? pair.pair.slice(0, 18) + '...' : pair.pair,
      value: Math.round(pair.avgProfit),
      count: pair.count,
    }));
  }, [arbResult]);

  const priceComparisonChartData = useMemo(() => {
    return comparisons.slice(0, 6).map(c => {
      const entry: Record<string, string | number> = { card: c.player };
      c.prices.forEach(p => {
        const mCfg = getMarketConfig(p.market);
        entry[mCfg.label] = Math.round(p.priceUSD);
      });
      return entry;
    });
  }, [comparisons]);

  const comparisonMarkets = useMemo(() => {
    const markets = new Set<string>();
    comparisons.slice(0, 6).forEach(c => {
      c.prices.forEach(p => {
        markets.add(getMarketConfig(p.market).label);
      });
    });
    return Array.from(markets);
  }, [comparisons]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Cross-Border &amp; International Arbitrage...</p>
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
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <Globe size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cross-Border &amp; International Arbitrage</h1>
          <p className="text-sm text-slate-400">Price discrepancy detection across global card markets with full cost accounting &mdash; Phase 147</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Opportunities</p>
          <p className="text-2xl font-bold text-blue-400">{summaryStats.totalOpps}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Profit</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summaryStats.totalProfit)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Spread</p>
          <p className="text-2xl font-bold text-amber-400">{summaryStats.avgSpread.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Low Risk</p>
          <p className="text-2xl font-bold text-cyan-400">{summaryStats.lowRisk}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Profit</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(summaryStats.topProfit)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Markets</p>
          <p className="text-2xl font-bold text-rose-400">{summaryStats.marketsActive}</p>
        </div>
      </div>

      {/* Market Overview Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Globe size={18} className="text-emerald-400" />
          Market Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketProfiles.map(mp => {
            const cfg = getMarketConfig(mp.market);
            return (
              <div key={mp.market} className={`bg-slate-900/50 border rounded-xl p-4 ${cfg.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mp.flag}</span>
                    <span className={`text-sm font-bold ${cfg.text}`}>{mp.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{mp.currency}</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Market Size</span><span className="text-slate-300">{(mp.marketSize / 1000).toFixed(0)}K listings</span></div>
                  <div className="flex justify-between"><span>Sellers</span><span className="text-slate-300">{(mp.sellerCount / 1000).toFixed(1)}K</span></div>
                  <div className="flex justify-between"><span>Buyer Demand</span><span className="text-slate-300">{mp.buyerDemand}/100</span></div>
                  <div className="flex justify-between"><span>Avg Differential</span>
                    <span className={`font-bold ${mp.avgPriceDifferential < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {mp.avgPriceDifferential === 0 ? 'Baseline' : `${mp.avgPriceDifferential}%`}
                    </span>
                  </div>
                  <div className="flex justify-between"><span>Avg Ship Days</span><span className="text-slate-300">{mp.avgShippingDays || 'N/A'}</span></div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {mp.primaryPlatforms.slice(0, 2).map(pl => (
                    <span key={pl} className={`text-[9px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{pl}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arbitrage Opportunities Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-cyan-400" />
          Arbitrage Opportunities ({opportunities.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Card</th>
                <th className="text-left py-2 px-2">Buy Market</th>
                <th className="text-left py-2 px-2">Sell Market</th>
                <th className="text-right py-2 px-2">Buy $</th>
                <th className="text-right py-2 px-2">Sell $</th>
                <th className="text-right py-2 px-2">Spread</th>
                <th className="text-right py-2 px-2">Net Profit</th>
                <th className="text-center py-2 px-2">Risk</th>
                <th className="text-right py-2 pl-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 15).map(opp => {
                const buyCfg = getMarketConfig(opp.buyMarket);
                const sellCfg = getMarketConfig(opp.sellMarket);
                const riskCfg = getRiskConfig(opp.riskLevel);
                return (
                  <tr
                    key={opp.id}
                    className={`border-b border-slate-700/30 cursor-pointer transition-colors ${selectedOppId === opp.id ? 'bg-slate-700/20' : 'hover:bg-slate-700/10'}`}
                    onClick={() => setSelectedOppId(opp.id)}
                  >
                    <td className="py-2 pr-2 text-slate-300 font-medium truncate max-w-[180px]">{opp.player}</td>
                    <td className={`py-2 px-2 ${buyCfg.text}`}>{buyCfg.label}</td>
                    <td className={`py-2 px-2 ${sellCfg.text}`}>{sellCfg.label}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{formatCurrency(opp.buyPrice)}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(opp.sellPrice)}</td>
                    <td className="py-2 px-2 text-right">
                      <span className="text-emerald-400 font-bold">{opp.spreadPercent.toFixed(1)}%</span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="text-emerald-400 font-bold">{formatCurrency(opp.netProfit)}</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${riskCfg.bg} ${riskCfg.text}`}>{riskCfg.label}</span>
                    </td>
                    <td className="py-2 pl-2 text-right text-slate-400">{opp.confidence}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BarChart: Price Comparison Across Markets */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Price Comparison Across Markets (USD)
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceComparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="card" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              {comparisonMarkets.map((market, i) => (
                <Bar key={market} dataKey={market} fill={CHART_COLORS[i % CHART_COLORS.length]} name={market} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shipping Routes + Customs Duty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Route Cost Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Ship size={18} className="text-cyan-400" />
            Shipping Routes &amp; Costs
          </h2>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">From</th>
                  <th className="text-left py-2 px-2">To</th>
                  <th className="text-left py-2 px-2">Carrier</th>
                  <th className="text-right py-2 px-2">Cost</th>
                  <th className="text-right py-2 px-2">Days</th>
                  <th className="text-right py-2 pl-2">Reliability</th>
                </tr>
              </thead>
              <tbody>
                {shippingRoutes.map(route => {
                  const fromCfg = getMarketConfig(route.fromMarket);
                  const toCfg = getMarketConfig(route.toMarket);
                  return (
                    <tr key={route.id} className="border-b border-slate-700/30">
                      <td className={`py-2 pr-2 font-medium ${fromCfg.text}`}>{fromCfg.label}</td>
                      <td className={`py-2 px-2 ${toCfg.text}`}>{toCfg.label}</td>
                      <td className="py-2 px-2 text-slate-400">{route.carrier}</td>
                      <td className="py-2 px-2 text-right text-slate-300">${route.cost}</td>
                      <td className="py-2 px-2 text-right text-slate-400">{route.transitDays}d</td>
                      <td className="py-2 pl-2 text-right">
                        <span className={`font-bold ${route.reliabilityScore >= 95 ? 'text-emerald-400' : route.reliabilityScore >= 90 ? 'text-blue-400' : 'text-amber-400'}`}>
                          {route.reliabilityScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customs Duty Reference */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            Customs Duty Reference
          </h2>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Country</th>
                  <th className="text-right py-2 px-2">Duty %</th>
                  <th className="text-right py-2 px-2">VAT %</th>
                  <th className="text-right py-2 px-2">De Minimis</th>
                  <th className="text-left py-2 pl-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {customsDuties.map(duty => {
                  const cfg = getMarketConfig(duty.market);
                  return (
                    <tr key={duty.market} className="border-b border-slate-700/30">
                      <td className={`py-2 pr-2 font-bold ${cfg.text}`}>{duty.country}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{duty.dutyPercent}%</td>
                      <td className="py-2 px-2 text-right text-slate-300">{duty.vatPercent}%</td>
                      <td className="py-2 px-2 text-right text-slate-400">${duty.deMinimusThreshold}</td>
                      <td className="py-2 pl-2 text-slate-500 truncate max-w-[180px]" title={duty.notes}>{duty.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PieChart: Profit by Market Pair + Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PieChart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Avg Profit by Market Pair
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={profitByPairData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ _name, value }) => `$${value}`}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {profitByPairData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`$${value}`, 'Avg Profit']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {profitByPairData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-[9px] text-slate-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment Panel */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-red-400" />
            Risk Assessment
          </h2>
          {riskAssessment ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-400">Overall Risk:</span>
                {(() => {
                  const rCfg = getRiskConfig(riskAssessment.overallRisk);
                  return <span className={`text-sm font-bold px-3 py-1 rounded-full ${rCfg.bg} ${rCfg.text}`}>{rCfg.label}</span>;
                })()}
              </div>
              <div className="space-y-3">
                {riskAssessment.factors.map((factor, idx) => {
                  const fCfg = getRiskConfig(factor.risk);
                  return (
                    <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{factor.factor}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${fCfg.bg} ${fCfg.text}`}>{fCfg.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-1">{factor.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700/30 rounded-full h-1.5">
                          <div
                            className={`rounded-full h-1.5 ${factor.risk === 'low' ? 'bg-emerald-500' : factor.risk === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${factor.probability * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{(factor.probability * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-cyan-400/70 italic mt-3">{riskAssessment.recommendation}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Select an opportunity above to see risk assessment.</p>
          )}
        </div>
      </div>

      {/* LineChart: Spread Trends Over Time */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-400" />
          Arbitrage Spread Trends (Monthly)
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Avg Spread %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Volume', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="avgSpread" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Avg Spread %" />
              <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Volume" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Fee Comparison */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-purple-400" />
          Platform Fee Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Platform</th>
                <th className="text-left py-2 px-2">Market</th>
                <th className="text-right py-2 px-2">Seller Fee</th>
                <th className="text-right py-2 px-2">Buyer Fee</th>
                <th className="text-right py-2 px-2">FX Fee</th>
                <th className="text-right py-2 px-2">Withdrawal</th>
                <th className="text-right py-2 pl-2">Listing</th>
              </tr>
            </thead>
            <tbody>
              {platformFees.map((pf, i) => {
                const cfg = getMarketConfig(pf.market);
                return (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-300 font-medium">{pf.platform}</td>
                    <td className={`py-2 px-2 ${cfg.text}`}>{cfg.label}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{pf.sellerFeePercent}%</td>
                    <td className="py-2 px-2 text-right text-slate-400">{pf.buyerFeePercent}%</td>
                    <td className="py-2 px-2 text-right text-slate-400">{pf.currencyConversionFee}%</td>
                    <td className="py-2 px-2 text-right text-slate-400">${pf.withdrawalFee.toFixed(2)}</td>
                    <td className="py-2 pl-2 text-right text-slate-400">${pf.listingFee.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Trends */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-400" />
          Regional Market Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trends.sort((a, b) => b.impactLevel - a.impactLevel).map(trend => {
            const cfg = getMarketConfig(trend.market);
            return (
              <div key={trend.id} className={`bg-slate-900/50 border rounded-xl p-3 ${cfg.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                  <div className="flex items-center gap-1">
                    {trend.direction === 'rising' ? <TrendingUp size={12} className="text-emerald-400" /> :
                     trend.direction === 'falling' ? <TrendingDown size={12} className="text-red-400" /> :
                     <BarChart3 size={12} className="text-slate-400" />}
                    <span className={`text-xs font-bold ${
                      trend.direction === 'rising' ? 'text-emerald-400' :
                      trend.direction === 'falling' ? 'text-red-400' :
                      'text-slate-400'
                    }`}>{formatPercent(trend.changePercent)}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-white mb-0.5">{trend.category}</p>
                <p className="text-[10px] text-slate-500">{trend.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-slate-600">{trend.timeframe}</span>
                  <span className="text-[9px] text-slate-600">Impact: {trend.impactLevel}/10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InternationalArbitrage;
