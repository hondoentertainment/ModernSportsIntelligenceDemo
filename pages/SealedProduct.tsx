// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, TrendingUp, Calendar, BarChart3, DollarSign, Archive, Clock, Layers, Star } from 'lucide-react';
import {
  getSealedProducts,
  getPriceTrends,
  getRipVsHoldAnalysis,
  getRoiByProductType,
  getUpcomingReleases,
  getVintageShowcase,
  getSupplyEstimates,
  getBreakEvenAnalysis,
  getProductTypeDistribution,
  formatCurrency,
  type SealedProduct,
  type PriceTrend,
  type RipVsHold,
  type RoiByType,
  type UpcomingRelease,
  type VintageItem,
  type SupplyEstimate,
  type BreakEvenEntry,
  type ProductTypeDistribution,
} from '../lib/utils/sealedProductService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = ['#8b5cf6', '#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#22d3ee', '#fb923c'];

const SealedProductPage: React.FC = () => {
  const [products, setProducts] = useState<SealedProduct[]>([]);
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
  const [ripVsHold, setRipVsHold] = useState<RipVsHold[]>([]);
  const [roiByType, setRoiByType] = useState<RoiByType[]>([]);
  const [releases, setReleases] = useState<UpcomingRelease[]>([]);
  const [vintage, setVintage] = useState<VintageItem[]>([]);
  const [supply, setSupply] = useState<SupplyEstimate[]>([]);
  const [breakEven, setBreakEven] = useState<BreakEvenEntry[]>([]);
  const [distribution, setDistribution] = useState<ProductTypeDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setProducts(getSealedProducts());
      setPriceTrends(getPriceTrends());
      setRipVsHold(getRipVsHoldAnalysis());
      setRoiByType(getRoiByProductType());
      setReleases(getUpcomingReleases());
      setVintage(getVintageShowcase());
      setSupply(getSupplyEstimates());
      setBreakEven(getBreakEvenAnalysis());
      setDistribution(getProductTypeDistribution());
      setLoading(false);
    } catch {
      setError('Failed to load Sealed Product data');
      setLoading(false);
    }
  }, []);

  const totalPortfolioValue = useMemo(() => products.reduce((s, p) => s + p.currentValue, 0), [products]);
  const totalProducts = useMemo(() => products.length, [products]);
  const avgRoi = useMemo(() => {
    if (products.length === 0) return 0;
    return (products.reduce((s, p) => s + p.roi, 0) / products.length).toFixed(1);
  }, [products]);
  const topGainer = useMemo(() => {
    if (products.length === 0) return null;
    return products.reduce((best, p) => p.roi > best.roi ? p : best, products[0]);
  }, [products]);

  const trendChartData = useMemo(() =>
    priceTrends.map(t => ({
      date: t.date,
      hobby: t.hobbyBox,
      retail: t.retailBox,
      blaster: t.blaster,
    })), [priceTrends]);

  const roiChartData = useMemo(() =>
    roiByType.map(r => ({
      type: r.productType,
      roi: r.avgRoi,
      volume: r.totalVolume,
    })), [roiByType]);

  const distPieData = useMemo(() =>
    distribution.map(d => ({
      name: d.type,
      value: d.count,
    })), [distribution]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Sealed Product Tracker...</p>
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
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Package size={24} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Wax &amp; Sealed Product Investment Tracker</h1>
            <p className="text-sm text-slate-400">Track sealed product values, ROI &amp; investment opportunities &mdash; Phase 156</p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-sm font-bold bg-violet-500/20 text-violet-300 rounded-full">
          {totalProducts} Products
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</p>
          <p className="text-3xl font-bold text-violet-400">{formatCurrency(totalPortfolioValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Products</p>
          <p className="text-3xl font-bold text-blue-400">{totalProducts}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg ROI</p>
          <p className="text-3xl font-bold text-emerald-400">{avgRoi}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Gainer</p>
          <p className="text-2xl font-bold text-amber-400">{topGainer ? `${topGainer.roi}%` : 'N/A'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Upcoming Releases</p>
          <p className="text-3xl font-bold text-red-400">{releases.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vintage Items</p>
          <p className="text-3xl font-bold text-brand-lime">{vintage.length}</p>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Package size={18} className="text-violet-400" />
          Sealed Product Portfolio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.slice(0, 9).map((p, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{p.productType}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.roi >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {p.roi >= 0 ? '+' : ''}{p.roi}% ROI
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate mb-1">{p.name}</p>
              <p className="text-[10px] text-slate-500 mb-3">{p.year} &middot; {p.sport}</p>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] text-slate-500">Purchase Price</p>
                  <p className="text-sm font-bold text-slate-300">{formatCurrency(p.purchasePrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Current Value</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(p.currentValue)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Qty: {p.quantity}</span>
                <span>{p.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Trends LineChart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Sealed Product Price Trends
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Line type="monotone" dataKey="hobby" name="Hobby Box" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
              <Line type="monotone" dataKey="retail" name="Retail Box" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
              <Line type="monotone" dataKey="blaster" name="Blaster" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rip vs Hold Analysis + ROI by Product Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Layers size={18} className="text-amber-400" />
            Rip vs Hold Analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Product</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Rip EV</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Hold Value</th>
                  <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {ripVsHold.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-700/20">
                    <td className="py-3 pr-3">
                      <p className="text-sm font-bold text-white truncate max-w-[160px]">{item.productName}</p>
                      <p className="text-[10px] text-slate-500">{item.year}</p>
                    </td>
                    <td className="py-3 pr-3 text-sm text-right text-emerald-400 font-bold">{formatCurrency(item.ripEV)}</td>
                    <td className="py-3 pr-3 text-sm text-right text-blue-400 font-bold">{formatCurrency(item.holdValue)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.recommendation === 'Hold' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-violet-400" />
            ROI by Product Type
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [name === 'roi' ? `${value}%` : value.toLocaleString()]}
                />
                <Bar dataKey="roi" name="Avg ROI %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Releases Calendar */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-400" />
          Upcoming Releases Calendar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {releases.map((r, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{r.sport}</span>
                <span className="text-[10px] text-slate-500">{r.releaseDate}</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{r.name}</p>
              <p className="text-[10px] text-slate-500 mb-3">{r.manufacturer}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Hobby Box</p>
                  <p className="text-sm font-bold text-violet-400">{formatCurrency(r.hobbyBoxPrice)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Hype Level</p>
                  <p className="text-sm font-bold text-amber-400">{r.hypeLevel}/10</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vintage Sealed Showcase + Supply Estimates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Vintage Sealed Showcase
          </h2>
          <div className="space-y-3">
            {vintage.map((v, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-bold text-amber-400 w-5">#{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{v.name}</p>
                    <p className="text-[10px] text-slate-500">{v.year} &middot; {v.sport}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(v.currentValue)}</span>
                  <span className="text-[10px] text-slate-500">Est. {v.estimatedRemaining} left</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Archive size={18} className="text-cyan-400" />
            Supply Estimates
          </h2>
          <div className="space-y-3">
            {supply.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white truncate flex-1 mr-2">{s.productName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.supplyLevel === 'scarce' ? 'bg-red-500/10 text-red-400' : s.supplyLevel === 'limited' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {s.supplyLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(s.estimatedSupply / s.originalPrint * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{s.estimatedSupply.toLocaleString()} / {s.originalPrint.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Break-Even Analysis + Product Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Break-Even Analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Product</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Cost</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Break-Even</th>
                  <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Hit Needed</th>
                </tr>
              </thead>
              <tbody>
                {breakEven.map((b, idx) => (
                  <tr key={idx} className="border-b border-slate-700/20">
                    <td className="py-3 pr-3">
                      <p className="text-sm font-bold text-white truncate max-w-[160px]">{b.productName}</p>
                    </td>
                    <td className="py-3 pr-3 text-sm text-right text-slate-300">{formatCurrency(b.cost)}</td>
                    <td className="py-3 pr-3 text-sm text-right text-emerald-400 font-bold">{formatCurrency(b.breakEvenValue)}</td>
                    <td className="py-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{b.hitNeeded}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-violet-400" />
            Product Type Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distPieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {distPieData.map((entry, idx) => (
              <span key={entry.name} className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SealedProductPage;
