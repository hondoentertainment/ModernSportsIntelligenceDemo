import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Package,
  ShoppingBag,
  BarChart3,
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  SealedProduct,
  WaxPortfolioEntryWithValue,
  HoldVsRipAnalysis,
  getWaxPortfolio,
  getSealedProducts,
  addToWaxPortfolio,
  removeFromWaxPortfolio,
  getProductPriceHistory,
  holdVsRip,
  getReleaseCalendar,
  getProductTypeLabel,
  getSportColor,
} from '../lib/utils/waxInvestService';

interface WaxInvestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'portfolio' | 'browse' | 'analysis' | 'calendar';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'portfolio', label: 'Portfolio', icon: <Package size={16} /> },
  { id: 'browse', label: 'Browse', icon: <ShoppingBag size={16} /> },
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={16} /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
];

// ---- Portfolio Tab ----

const PortfolioTab: React.FC<{
  portfolio: WaxPortfolioEntryWithValue[];
  onRemove: (_entryId: string) => void;
}> = ({ portfolio, onRemove }) => {
  const totalValue = portfolio.reduce((s, e) => s + e.currentTotalValue, 0);
  const totalCost = portfolio.reduce((s, e) => s + e.totalCost, 0);
  const totalROI = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
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
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total ROI</p>
          <p className={`text-2xl font-bebas tracking-wider ${totalROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-2">
        {portfolio.map(entry => {
          const sc = getSportColor(entry.product.sport);
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700 rounded-2xl hover:bg-slate-800/60 transition-colors"
            >
              {/* Sport Badge */}
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sc.text} ${sc.bg} border ${sc.border}`}>
                {entry.product.sport.slice(0, 3)}
              </span>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{entry.product.name}</p>
                <p className="text-xs text-slate-500">
                  Qty: {entry.quantity} &middot; Cost: ${entry.costBasis.toLocaleString()}/ea
                </p>
              </div>

              {/* Value + ROI */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-mono text-white">
                  ${entry.currentTotalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className={`text-xs font-bold ${entry.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.roi >= 0 ? '+' : ''}{entry.roi.toFixed(1)}%
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(entry.id)}
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
          <p>No sealed products in your portfolio yet.</p>
          <p className="text-xs mt-1">Browse the product database to add some.</p>
        </div>
      )}
    </div>
  );
};

// ---- Browse Tab ----

const BrowseTab: React.FC<{
  onAdd: (_productId: string, _quantity: number, _costBasis: number) => void;
}> = ({ onAdd }) => {
  const products = useMemo(() => getSealedProducts(), []);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [costBasis, setCostBasis] = useState(0);

  const filteredProducts = useMemo(() => {
    if (sportFilter === 'all') return products;
    return products.filter(p => p.sport === sportFilter);
  }, [products, sportFilter]);

  const handleAdd = (product: SealedProduct) => {
    if (addingId === product.id) {
      if (quantity > 0 && costBasis > 0) {
        onAdd(product.id, quantity, costBasis);
        setAddingId(null);
        setQuantity(1);
        setCostBasis(0);
      }
    } else {
      setAddingId(product.id);
      setQuantity(1);
      setCostBasis(product.currentValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sport Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['all', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'].map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              sportFilter === s
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {s === 'all' ? 'All Sports' : s}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="space-y-3">
        {filteredProducts.map(product => {
          const sc = getSportColor(product.sport);
          const appreciation = ((product.currentValue - product.msrp) / product.msrp) * 100;
          const isAdding = addingId === product.id;

          return (
            <div
              key={product.id}
              className="p-4 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-3 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Sport Badge */}
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${sc.text} ${sc.bg} border ${sc.border}`}>
                  {product.sport.slice(0, 3)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getProductTypeLabel(product.productType)} &middot; {product.year}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500">MSRP ${product.msrp}</p>
                  <p className="text-sm font-mono text-white">${product.currentValue.toLocaleString()}</p>
                  <p className={`text-xs font-bold ${appreciation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {appreciation >= 0 ? '+' : ''}{appreciation.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Key Rookies */}
              <div className="flex flex-wrap gap-1.5">
                {product.keyRookies.map(rookie => (
                  <span key={rookie} className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-[10px] text-slate-300">
                    {rookie}
                  </span>
                ))}
              </div>

              {/* Add Controls */}
              {isAdding ? (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full mt-0.5 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest">Cost/ea ($)</label>
                    <input
                      type="number"
                      min={1}
                      value={costBasis}
                      onChange={e => setCostBasis(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full mt-0.5 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-1.5 pt-4">
                    <button
                      onClick={() => handleAdd(product)}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setAddingId(null)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleAdd(product)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 transition-colors"
                >
                  <Plus size={12} />
                  Add to Portfolio
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Analysis Tab ----

const AnalysisTab: React.FC = () => {
  const products = useMemo(() => getSealedProducts(), []);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? '');
  const [showDropdown, setShowDropdown] = useState(false);

  const analysis = useMemo<HoldVsRipAnalysis | null>(
    () => selectedProductId ? holdVsRip(selectedProductId) : null,
    [selectedProductId]
  );

  const priceHistory = useMemo(
    () => selectedProductId ? getProductPriceHistory(selectedProductId) : [],
    [selectedProductId]
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const evChartData = useMemo(() => {
    if (!analysis) return [];
    return [
      { name: 'Hold EV', value: analysis.holdEV, color: '#3b82f6' },
      { name: 'Rip EV', value: analysis.ripEV, color: '#10b981' },
    ];
  }, [analysis]);

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
            {products.map(p => {
              const sc = getSportColor(p.sport);
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProductId(p.id); setShowDropdown(false); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                    p.id === selectedProductId ? 'text-blue-400 bg-slate-700/50' : 'text-white'
                  }`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${sc.text} ${sc.bg}`}>
                    {p.sport.slice(0, 3)}
                  </span>
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {analysis && (
        <>
          {/* Verdict */}
          <div className={`p-5 rounded-2xl border space-y-2 ${
            analysis.recommendation === 'hold'
              ? 'bg-blue-500/5 border-blue-500/20'
              : 'bg-green-500/5 border-green-500/20'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className={analysis.recommendation === 'hold' ? 'text-blue-400' : 'text-green-400'} />
              <span className={`text-lg font-bebas tracking-wider ${
                analysis.recommendation === 'hold' ? 'text-blue-400' : 'text-green-400'
              }`}>
                Recommendation: {analysis.recommendation === 'hold' ? 'HOLD' : 'RIP'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {analysis.recommendation === 'hold'
                ? `Holding expected value ($${analysis.holdEV.toLocaleString()}) exceeds ripping EV ($${analysis.ripEV.toFixed(2)}). The sealed premium and appreciation trend favor keeping it sealed.`
                : `Ripping expected value ($${analysis.ripEV.toFixed(2)}) exceeds holding EV ($${analysis.holdEV.toLocaleString()}). The potential pulls justify opening this product.`
              }
            </p>
          </div>

          {/* EV Comparison Bar Chart */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              Expected Value Comparison
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={evChartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'EV']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {evChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Pulls Table */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              Key Pulls ({analysis.totalCardsPerBox} cards/box)
            </p>
            <div className="space-y-1.5">
              {analysis.keyPulls.map((pull, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-700/30 rounded-xl text-xs">
                  <span className="text-white font-medium flex-1 truncate">{pull.card}</span>
                  <span className="text-slate-400 flex-shrink-0">
                    {(pull.pullRate * 100).toFixed(2)}%
                  </span>
                  <span className="text-slate-300 font-mono flex-shrink-0">${pull.value.toFixed(0)}</span>
                  <span className="text-green-400 font-mono font-bold flex-shrink-0">${pull.ev.toFixed(2)} EV</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price History Chart */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
              12-Month Price History
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={priceHistory} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="waxPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} interval={1} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#waxPriceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Calendar Tab ----

const CalendarTab: React.FC = () => {
  const releases = useMemo(() => getReleaseCalendar(), []);
  const now = new Date();

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
        Upcoming Releases (Next 3 Months)
      </p>

      {releases.map(release => {
        const sc = getSportColor(release.sport);
        const releaseDate = new Date(release.releaseDate);
        const daysUntil = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const _dateStr = releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <div
            key={release.id}
            className="flex items-start gap-4 p-4 bg-slate-800/30 border border-slate-700 rounded-2xl hover:bg-slate-800/50 transition-colors"
          >
            {/* Date Column */}
            <div className="text-center flex-shrink-0 w-16">
              <p className="text-lg font-bebas tracking-wider text-white">{releaseDate.toLocaleDateString('en-US', { month: 'short' })}</p>
              <p className="text-2xl font-bebas tracking-wider text-white leading-tight">{releaseDate.getDate()}</p>
              <p className={`text-[10px] font-bold mt-0.5 ${
                daysUntil <= 7 ? 'text-green-400' : daysUntil <= 14 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                {daysUntil}d away
              </p>
            </div>

            <div className="h-full w-px bg-slate-700 self-stretch flex-shrink-0" />

            {/* Release Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${sc.text} ${sc.bg} border ${sc.border}`}>
                  {release.sport}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {getProductTypeLabel(release.productType)}
                </span>
              </div>

              <p className="text-sm font-medium text-white">{release.name}</p>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">
                  MSRP: <span className="text-white font-mono">${release.msrp}</span>
                </span>
              </div>

              {release.keyRookies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {release.keyRookies.map(rookie => (
                    <span key={rookie} className="px-1.5 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-[10px] text-slate-300">
                      {rookie}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {releases.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          <Calendar size={32} className="mx-auto mb-3 text-slate-600" />
          <p>No upcoming releases in the next 3 months.</p>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const WaxInvestModal: React.FC<WaxInvestModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');
  const [_refreshKey, setRefreshKey] = useState(0);

  const portfolio = useMemo(() => getWaxPortfolio(), []);

  const handleRemove = useCallback((entryId: string) => {
    removeFromWaxPortfolio(entryId);
    setRefreshKey(k => k + 1);
  }, []);

  const handleAdd = useCallback((productId: string, quantity: number, costBasis: number) => {
    addToWaxPortfolio(productId, quantity, costBasis);
    setRefreshKey(k => k + 1);
    setActiveTab('portfolio');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Package size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <ShoppingBag size={10} />
                  {portfolio.length} product{portfolio.length !== 1 ? 's' : ''} tracked
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Sealed Wax <span className="text-blue-400">Investment Tracker</span>
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
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
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
          {activeTab === 'portfolio' && <PortfolioTab portfolio={portfolio} onRemove={handleRemove} />}
          {activeTab === 'browse' && <BrowseTab onAdd={handleAdd} />}
          {activeTab === 'analysis' && <AnalysisTab />}
          {activeTab === 'calendar' && <CalendarTab />}
        </div>
      </div>
    </div>
  );
};

export default WaxInvestModal;
