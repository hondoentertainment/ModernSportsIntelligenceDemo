// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Package,
  BarChart3,
  Briefcase,
  Activity,
  ChevronDown,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';
import {
  WaxPortfolioItem,
  getWaxProducts,
  getBreakProbabilities,
  getWaxPortfolio,
  getWaxStats,
  removeWaxPortfolioItem,
  getWaxProductTypeLabel,
  getSupplyLabel,
  getSupplyColor,
} from '../lib/analytics/waxIntelligenceService';

interface WaxIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'products' | 'break_math' | 'my_wax' | 'analytics';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'Products', icon: <Package size={16} /> },
  { id: 'break_math', label: 'Break Math', icon: <BarChart3 size={16} /> },
  { id: 'my_wax', label: 'My Wax', icon: <Briefcase size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <Activity size={16} /> },
];

type SortKey = 'name' | 'marketPrice' | 'evPerBox' | 'evRatio' | 'roi90d';
type SortDir = 'asc' | 'desc';

// ---- Products Tab ----

const ProductsTab: React.FC = () => {
  const products = useMemo(() => getWaxProducts(), []);
  const [sortKey, setSortKey] = useState<SortKey>('evRatio');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => {
      let av: number | string = a[sortKey];
      let bv: number | string = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [products, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortHeader: React.FC<{ label: string; field: SortKey; className?: string }> = ({ label, field, className }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors ${
        sortKey === field ? 'text-brand-lime' : 'text-brand-muted'
      } ${className ?? ''}`}
    >
      {label}
      <ArrowUpDown size={10} />
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2">
        <SortHeader label="Product" field="name" className="col-span-4" />
        <SortHeader label="Price" field="marketPrice" className="col-span-2 justify-end" />
        <SortHeader label="EV/Box" field="evPerBox" className="col-span-2 justify-end" />
        <SortHeader label="EV Ratio" field="evRatio" className="col-span-2 justify-end" />
        <SortHeader label="90d ROI" field="roi90d" className="col-span-2 justify-end" />
      </div>

      {/* Product Rows */}
      <div className="space-y-1.5">
        {sorted.map(product => (
          <div
            key={product.id}
            className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-2xl hover:bg-slate-800/60 transition-colors"
          >
            {/* Name + Type */}
            <div className="col-span-4 min-w-0">
              <p className="text-sm font-medium text-white truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500">{getWaxProductTypeLabel(product.type)}</span>
                <span className={`text-[10px] font-bold ${getSupplyColor(product.supply)}`}>
                  {getSupplyLabel(product.supply)}
                </span>
              </div>
            </div>

            {/* Market Price */}
            <div className="col-span-2 text-right">
              <p className="text-sm font-mono text-white">${product.marketPrice.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">MSRP ${product.msrp}</p>
            </div>

            {/* EV Per Box */}
            <div className="col-span-2 text-right">
              <p className="text-sm font-mono text-white">${product.evPerBox.toLocaleString()}</p>
            </div>

            {/* EV Ratio */}
            <div className="col-span-2 text-right">
              <span className={`text-sm font-bold ${
                product.evRatio >= 1 ? 'text-brand-lime' : product.evRatio >= 0.85 ? 'text-green-400' : product.evRatio >= 0.7 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {(product.evRatio * 100).toFixed(1)}%
              </span>
            </div>

            {/* 90d ROI */}
            <div className="col-span-2 text-right">
              <span className={`text-sm font-bold ${product.roi90d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.roi90d >= 0 ? '+' : ''}{product.roi90d.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hit Odds Legend */}
      <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
          Hit Odds Reference (Top Products)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {sorted.slice(0, 4).map(p => (
            <div key={p.id} className="px-3 py-2 bg-slate-700/30 rounded-xl">
              <p className="text-xs font-medium text-white truncate mb-1">{p.name}</p>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                <span>Auto: <span className="text-amber-400">{p.hitOdds.auto}</span></span>
                <span>Relic: <span className="text-cyan-400">{p.hitOdds.relic}</span></span>
                <span>#&apos;d: <span className="text-purple-400">{p.hitOdds.numbered}</span></span>
                <span>1/1: <span className="text-red-400">{p.hitOdds.one_of_one}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Break Math Tab ----

const BreakMathTab: React.FC = () => {
  const products = useMemo(() => getWaxProducts(), []);
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? '');
  const [showDropdown, setShowDropdown] = useState(false);

  const probabilities = useMemo(() => getBreakProbabilities(selectedId), [selectedId]);
  const selectedProduct = products.find(p => p.id === selectedId);

  const chartData = useMemo(() => {
    return probabilities.slice(0, 8).map(bp => ({
      name: bp.card.length > 25 ? bp.card.slice(0, 22) + '...' : bp.card,
      expectedValue: bp.expectedValue,
      bestCase: bp.bestCase,
      worstCase: bp.worstCase,
      probability: bp.probability,
    }));
  }, [probabilities]);

  return (
    <div className="space-y-5">
      {/* Product Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
        >
          <span className="truncate">{selectedProduct?.name ?? 'Select a product...'}</span>
          <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
        </button>
        {showDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setShowDropdown(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                  p.id === selectedId ? 'text-amber-400 bg-slate-700/50' : 'text-white'
                }`}
              >
                <span className="text-[10px] text-slate-500">{p.sport.slice(0, 3).toUpperCase()}</span>
                <span className="truncate">{p.name}</span>
                <span className="ml-auto text-[10px] text-slate-500">${p.marketPrice}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <>
          {/* Product Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Price</p>
              <p className="text-lg font-bebas tracking-wider text-white">${selectedProduct.marketPrice}</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">EV/Box</p>
              <p className="text-lg font-bebas tracking-wider text-white">${selectedProduct.evPerBox}</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">EV Ratio</p>
              <p className={`text-lg font-bebas tracking-wider ${
                selectedProduct.evRatio >= 1 ? 'text-brand-lime' : 'text-amber-400'
              }`}>
                {(selectedProduct.evRatio * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Top Pull</p>
              <p className="text-lg font-bebas tracking-wider text-green-400">${selectedProduct.topPull.value.toLocaleString()}</p>
            </div>
          </div>

          {/* Break Probability Bar Chart */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              Expected Value by Pull Type
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ left: 10, right: 20, top: 5, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number, name: string) => {
                    const label = name === 'expectedValue' ? 'Expected Value' : name === 'bestCase' ? 'Best Case' : 'Worst Case';
                    return [`$${value.toLocaleString()}`, label];
                  }}
                />
                <Bar dataKey="expectedValue" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? '#84cc16' : '#f59e0b'} fillOpacity={1 - index * 0.08} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Probability Matrix Table */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              Full Probability Matrix
            </p>
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                <span className="col-span-4">Card</span>
                <span className="col-span-2 text-right">Prob</span>
                <span className="col-span-2 text-right">EV</span>
                <span className="col-span-2 text-right">Best</span>
                <span className="col-span-2 text-right">Worst</span>
              </div>
              {probabilities.map((bp, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-slate-700/30 rounded-xl text-xs"
                >
                  <span className="col-span-4 text-white font-medium truncate">{bp.card}</span>
                  <span className="col-span-2 text-right text-slate-400">
                    {(bp.probability * 100).toFixed(2)}%
                  </span>
                  <span className="col-span-2 text-right text-amber-400 font-mono font-bold">
                    ${bp.expectedValue.toFixed(2)}
                  </span>
                  <span className="col-span-2 text-right text-green-400 font-mono">
                    ${bp.bestCase.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-right text-red-400 font-mono">
                    ${bp.worstCase.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- My Wax Tab ----

const MyWaxTab: React.FC<{ portfolio: WaxPortfolioItem[]; onRefresh: () => void }> = ({ portfolio, onRefresh }) => {
  const totalValue = portfolio.reduce((s, i) => s + i.currentValue, 0);
  const totalCost = portfolio.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  const handleRemove = useCallback((itemId: string) => {
    removeWaxPortfolioItem(itemId);
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Cost Basis</p>
          <p className="text-2xl font-bebas tracking-wider text-slate-300">
            ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Unrealized P/L</p>
          <p className={`text-2xl font-bebas tracking-wider ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-[10px] font-bold ${totalPLPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPLPct >= 0 ? '+' : ''}{totalPLPct.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Portfolio Items */}
      <div className="space-y-2">
        {portfolio.map(item => {
          const plPct = item.purchasePrice * item.quantity > 0
            ? (item.unrealizedPL / (item.purchasePrice * item.quantity)) * 100
            : 0;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700 rounded-2xl hover:bg-slate-800/60 transition-colors"
            >
              {/* Sport Badge */}
              <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {item.product.sport.slice(0, 3)}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                <p className="text-xs text-slate-500">
                  Qty: {item.quantity} ({item.sealed} sealed, {item.opened} opened) &middot; Paid ${item.purchasePrice}/ea
                </p>
              </div>

              {/* Value + P/L */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-mono text-white">
                  ${item.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center justify-end gap-1">
                  {item.unrealizedPL >= 0 ? (
                    <TrendingUp size={10} className="text-green-400" />
                  ) : (
                    <TrendingDown size={10} className="text-red-400" />
                  )}
                  <span className={`text-xs font-bold ${item.unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.unrealizedPL >= 0 ? '+' : ''}${item.unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    <span className="text-[10px] ml-0.5">({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)</span>
                  </span>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(item.id)}
                className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {portfolio.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          <Package size={32} className="mx-auto mb-3 text-slate-600" />
          <p>No sealed wax in your portfolio yet.</p>
          <p className="text-xs mt-1">Products will be tracked here.</p>
        </div>
      )}
    </div>
  );
};

// ---- Analytics Tab ----

const AnalyticsTab: React.FC = () => {
  const products = useMemo(() => getWaxProducts(), []);

  // Price trend chart data (top 5 products by market cap)
  const trendData = useMemo(() => {
    const topProducts = [...products]
      .sort((a, b) => b.marketPrice - a.marketPrice)
      .slice(0, 5);

    // Build data points by month
    const months: string[] = [];
    if (topProducts[0]?.priceHistory.length) {
      topProducts[0].priceHistory.forEach(ph => {
        const d = new Date(ph.date);
        months.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      });
    }

    return months.map((month, idx) => {
      const point: Record<string, string | number> = { month };
      topProducts.forEach(p => {
        if (p.priceHistory[idx]) {
          point[p.name.split(' ').slice(0, 3).join(' ')] = p.priceHistory[idx].price;
        }
      });
      return point;
    });
  }, [products]);

  const lineColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  const topProductNames = useMemo(() => {
    return [...products]
      .sort((a, b) => b.marketPrice - a.marketPrice)
      .slice(0, 5)
      .map(p => p.name.split(' ').slice(0, 3).join(' '));
  }, [products]);

  // Best and worst by ROI
  const bestByROI = useMemo(() => [...products].sort((a, b) => b.roi90d - a.roi90d).slice(0, 5), [products]);
  const worstByROI = useMemo(() => [...products].sort((a, b) => a.roi90d - b.roi90d).slice(0, 5), [products]);

  const roiChartData = useMemo(() => {
    return [...products]
      .sort((a, b) => b.roi90d - a.roi90d)
      .map(p => ({
        name: p.name.length > 20 ? p.name.slice(0, 18) + '...' : p.name,
        roi: p.roi90d,
        fullName: p.name,
      }));
  }, [products]);

  return (
    <div className="space-y-5">
      {/* Price Trends */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          12-Month Price Trends (Top 5 by Market Price)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} interval={1} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: '11px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
              formatter={(value: string) => <span style={{ color: '#94a3b8' }}>{value}</span>}
            />
            {topProductNames.map((name, idx) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={lineColors[idx]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 90d ROI Distribution */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          90-Day ROI by Product
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={roiChartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 9 }} width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, '90d ROI']}
            />
            <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={18}>
              {roiChartData.map((entry, index) => (
                <Cell key={index} fill={entry.roi >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best & Worst Tables */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-500/5 border border-green-500/15 rounded-2xl">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3">
            Best 90d ROI
          </p>
          <div className="space-y-1.5">
            {bestByROI.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-4">{idx + 1}.</span>
                <span className="text-white flex-1 truncate">{p.name}</span>
                <span className="text-green-400 font-bold">+{p.roi90d.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-2xl">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">
            Worst 90d ROI
          </p>
          <div className="space-y-1.5">
            {worstByROI.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-4">{idx + 1}.</span>
                <span className="text-white flex-1 truncate">{p.name}</span>
                <span className={`font-bold ${p.roi90d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {p.roi90d >= 0 ? '+' : ''}{p.roi90d.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const WaxIntelligenceModal: React.FC<WaxIntelligenceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('products');
  const [_refreshKey, setRefreshKey] = useState(0);

  const portfolio = useMemo(() => getWaxPortfolio(), []);
  const stats = useMemo(() => getWaxStats(), []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Package size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <BarChart3 size={10} />
                  {stats.totalProducts} products tracked
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  Avg EV: {(stats.avgEvRatio * 100).toFixed(1)}%
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Wax Market <span className="text-amber-400">Intelligence</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-amber-400 border-amber-400 bg-amber-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'break_math' && <BreakMathTab />}
          {activeTab === 'my_wax' && <MyWaxTab portfolio={portfolio} onRefresh={handleRefresh} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

export default WaxIntelligenceModal;
