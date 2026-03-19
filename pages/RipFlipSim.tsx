import React, { useState, useMemo } from 'react';
import {
  Package,
  BarChart3,
  TrendingUp,
  History,
  Layers,
  Target,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getProducts,
  getProductById,
  runSimulation,
  getSimulationHistory,
  compareProducts,
  getTopEVProducts,
  getRipFlipStats,
  getHitProbabilities,
  formatCurrency,
  formatPercent,
  getEVColor,
  getProductTypeLabel,
  getProductTypeColor,
  getProbabilityColor,
} from '../lib/trading/ripFlipSimService';
import type { Product, SimulationResult } from '../lib/trading/ripFlipSimService';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'products' | 'simulator' | 'compare' | 'history';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'products', label: 'Products', icon: <Package size={16} /> },
  { key: 'simulator', label: 'Simulator', icon: <Target size={16} /> },
  { key: 'compare', label: 'Compare', icon: <ArrowUpDown size={16} /> },
  { key: 'history', label: 'History', icon: <History size={16} /> },
];

// ─── Products Tab ─────────────────────────────────────────────────────────────

const ProductsTab: React.FC = () => {
  const products = useMemo(() => getProducts(), []);
  const topProducts = useMemo(() => getTopEVProducts(products.length), []);

  const evChartData = topProducts.map((p) => ({
    name: p.name.replace(/^2024\s+/, '').substring(0, 20),
    evRatio: Math.round(p.evRatio * 100),
    price: p.price,
  }));

  return (
    <div className="space-y-6">
      {/* EV Ranking Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          EV Ratio Rankings
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" domain={[0, 120]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={150} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [`${value}%`, 'EV Ratio']}
              />
              <Bar dataKey="evRatio" radius={[0, 4, 4, 0]}>
                {evChartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.evRatio >= 100 ? '#4ade80' : entry.evRatio >= 85 ? '#facc15' : entry.evRatio >= 70 ? '#fb923c' : '#f87171'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const hitProbs = getHitProbabilities(product.id);

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm leading-tight">{product.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getProductTypeColor(product.type)}`}>
              {getProductTypeLabel(product.type)}
            </span>
            <span className="text-xs text-slate-400">{product.sport}</span>
          </div>
        </div>
        <div className={`text-lg font-bold ${getEVColor(product.evRatio)}`}>
          {(product.evRatio * 100).toFixed(0)}%
          <div className="text-[10px] text-slate-400 text-right">EV Ratio</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-slate-900 rounded-lg p-2">
          <div className="text-slate-400">Price</div>
          <div className="text-white font-medium">{formatCurrency(product.price)}</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-2">
          <div className="text-slate-400">Expected Value</div>
          <div className="text-white font-medium">{formatCurrency(product.expectedValue)}</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-slate-400 font-medium">Hit Probabilities</div>
        {hitProbs.slice(0, 4).map((hit, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-300">{hit.type}</span>
            <div className="flex items-center gap-3">
              <span className={getProbabilityColor(hit.probability)}>
                {formatPercent(hit.probability)}
              </span>
              <span className="text-slate-400 w-16 text-right">{formatCurrency(hit.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Simulator Tab ────────────────────────────────────────────────────────────

const SimulatorTab: React.FC = () => {
  const products = useMemo(() => getProducts(), []);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? '');
  const [trials, setTrials] = useState(1000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const sim = runSimulation(selectedProductId, trials);
      setResult(sim);
      setIsRunning(false);
    }, 300);
  };

  const selectedProduct = getProductById(selectedProductId);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target size={18} className="text-emerald-400" />
          Monte Carlo Simulator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Product</label>
            <select
              className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-600 text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Trials</label>
            <input
              type="number"
              className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 border border-slate-600 text-sm"
              value={trials}
              onChange={(e) => setTrials(parseInt(e.target.value) || 100)}
              min={1}
              max={100000}
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium text-sm transition-colors disabled:opacity-50"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
        </div>
        {selectedProduct && (
          <div className="mt-3 text-xs text-slate-400">
            Price: {formatCurrency(selectedProduct.price)} | EV Ratio: {(selectedProduct.evRatio * 100).toFixed(1)}% | {selectedProduct.cardsPerPack * selectedProduct.packsPerBox} total cards
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Avg Return" value={formatCurrency(result.avgReturn)} color="text-blue-400" />
            <StatCard label="Median Return" value={formatCurrency(result.medianReturn)} color="text-cyan-400" />
            <StatCard label="Profit Probability" value={formatPercent(result.profitProbability)} color={result.profitProbability > 0.5 ? 'text-green-400' : 'text-red-400'} />
            <StatCard label="Best / Worst" value={`${formatCurrency(result.bestCase)} / ${formatCurrency(result.worstCase)}`} color="text-amber-400" />
          </div>

          {/* Distribution Histogram */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" />
              Return Distribution ({result.trials.toLocaleString()} trials)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'count') return [value, 'Count'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className={`text-lg font-bold ${color}`}>{value}</div>
  </div>
);

// ─── Compare Tab ──────────────────────────────────────────────────────────────

const CompareTab: React.FC = () => {
  const products = useMemo(() => getProducts(), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([products[0]?.id ?? '', products[1]?.id ?? '']);

  const comparison = useMemo(() => {
    const valid = selectedIds.filter(Boolean);
    return valid.length >= 2 ? compareProducts(valid) : null;
  }, [selectedIds]);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowUpDown size={18} className="text-orange-400" />
          Select Products to Compare
        </h3>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => (
            <button
              key={p.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedIds.includes(p.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              onClick={() => toggleProduct(p.id)}
            >
              {p.name.replace(/^2024\s+/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {comparison && (
        <>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Winner: {comparison.winner.name}</span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-1">{comparison.winner.reason}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 pb-2 pr-4">Metric</th>
                    {comparison.products.map((p) => (
                      <th key={p.id} className="text-right text-slate-400 pb-2 px-2 min-w-[120px]">
                        {p.name.replace(/^2024\s+/, '').substring(0, 18)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', render: (p: Product) => formatCurrency(p.price) },
                    { label: 'Expected Value', render: (p: Product) => formatCurrency(p.expectedValue) },
                    { label: 'EV Ratio', render: (p: Product) => `${(p.evRatio * 100).toFixed(1)}%` },
                    { label: 'Type', render: (p: Product) => getProductTypeLabel(p.type) },
                    { label: 'Cards/Box', render: (p: Product) => `${p.cardsPerPack * p.packsPerBox}` },
                    { label: 'Hit Types', render: (p: Product) => `${p.hits.length}` },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-slate-700/50">
                      <td className="py-2 text-slate-300 pr-4">{row.label}</td>
                      {comparison.products.map((p) => (
                        <td key={p.id} className="py-2 text-right text-white px-2">
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hit Probability Comparison Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              Hit Probability Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparison.products.slice(0, 4).map((product) => {
                const hitData = product.hits.map((h) => ({
                  name: h.type,
                  probability: Math.round(h.probability * 10000) / 100,
                  value: h.avgValue,
                }));
                return (
                  <div key={product.id}>
                    <h4 className="text-sm text-slate-300 mb-2">{product.name.replace(/^2024\s+/, '')}</h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hitData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                            formatter={(v: number) => [`${v}%`, 'Probability']}
                          />
                          <Bar dataKey="probability" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── History Tab ──────────────────────────────────────────────────────────────

const HistoryTab: React.FC = () => {
  const history = getSimulationHistory();
  const stats = getRipFlipStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Simulations" value={stats.totalSimulations.toLocaleString()} color="text-blue-400" />
        <StatCard label="Avg EV Ratio" value={`${(stats.avgEVRatio * 100).toFixed(1)}%`} color="text-cyan-400" />
        <StatCard label="Products Tracked" value={stats.totalProductsTracked.toString()} color="text-purple-400" />
        <StatCard label="Best Product" value={stats.bestProduct.replace(/^2024\s+/, '').substring(0, 20)} color="text-green-400" />
        <StatCard label="Worst Product" value={stats.worstProduct.replace(/^2024\s+/, '').substring(0, 20)} color="text-red-400" />
      </div>

      {/* History Table */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <History size={18} className="text-amber-400" />
          Simulation History
        </h3>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">No simulations run yet. Head to the Simulator tab to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 pb-2">Product</th>
                  <th className="text-right text-slate-400 pb-2">Trials</th>
                  <th className="text-right text-slate-400 pb-2">Avg Return</th>
                  <th className="text-right text-slate-400 pb-2">Profit Prob</th>
                  <th className="text-right text-slate-400 pb-2">Best</th>
                  <th className="text-right text-slate-400 pb-2">Worst</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map((sim, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2 text-white">{sim.productName.replace(/^2024\s+/, '')}</td>
                    <td className="py-2 text-right text-slate-300">{sim.trials.toLocaleString()}</td>
                    <td className="py-2 text-right text-blue-400">{formatCurrency(sim.avgReturn)}</td>
                    <td className="py-2 text-right text-emerald-400">{formatPercent(sim.profitProbability)}</td>
                    <td className="py-2 text-right text-green-400">{formatCurrency(sim.bestCase)}</td>
                    <td className="py-2 text-right text-red-400">{formatCurrency(sim.worstCase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const RipFlipSim: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('products');

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="px-8 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Rip & Flip Simulator
            </h1>
            <p className="text-sm text-slate-400">
              Monte Carlo analysis for sealed product expected value
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8">
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 w-fit border border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-8 py-6">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'simulator' && <SimulatorTab />}
        {activeTab === 'compare' && <CompareTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
};

export default RipFlipSim;
