import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark, TrendingUp, TrendingDown, Users, Vote, DollarSign,
  BarChart3, ShieldCheck, Gavel, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, XCircle, AlertTriangle, Layers, PieChart as PieIcon,
  ExternalLink, Lock, Unlock, Activity, Award,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie,
  ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, ReferenceLine,
} from 'recharts';
import {
  getVaultCards, getVaultDetail, getAllSharePositions, getVaultTransactions,
  getAllDividends, getDividendHistory, getGovernanceProposals, getSecondaryMarket,
  getPortfolioSummary, getVaultPerformance, formatCurrency, formatCurrencyPrecise,
  formatPercent, getCurrentUser,
  type VaultCard, type SharePosition, type VaultTransaction,
  type DividendDistribution, type GovernanceProposal, type SecondaryMarketOrder,
  type PortfolioSummary, type VaultPerformance,
} from '../lib/utils/fractionalVaultService';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Open' },
  funded: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Funded' },
  locked: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Locked' },
  appreciating: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Appreciating' },
  liquidating: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Liquidating' },
};

const PROPOSAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  sell: <Gavel size={14} />,
  insure: <ShieldCheck size={14} />,
  exhibit: <ExternalLink size={14} />,
  regrade: <Award size={14} />,
};

type TabKey = 'gallery' | 'holdings' | 'governance' | 'dividends' | 'market' | 'performance';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'gallery', label: 'Vault Gallery', icon: <Landmark size={16} /> },
  { key: 'holdings', label: 'My Holdings', icon: <Layers size={16} /> },
  { key: 'governance', label: 'Governance', icon: <Vote size={16} /> },
  { key: 'dividends', label: 'Dividends', icon: <DollarSign size={16} /> },
  { key: 'market', label: 'Secondary Market', icon: <BarChart3 size={16} /> },
  { key: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FractionalVault: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('gallery');
  const [loading, setLoading] = useState(true);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [positions, setPositions] = useState<SharePosition[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [dividends, setDividends] = useState<DividendDistribution[]>([]);
  const [orders, setOrders] = useState<SecondaryMarketOrder[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [selectedPerf, setSelectedPerf] = useState<VaultPerformance | null>(null);

  useEffect(() => {
    try {
      const cards = getVaultCards();
      setVaultCards(cards);
      setPositions(getAllSharePositions());
      setPortfolio(getPortfolioSummary());
      setProposals(getGovernanceProposals());
      setDividends(getAllDividends());
      setOrders(getSecondaryMarket());
      if (cards.length > 0) {
        setSelectedVaultId(cards[0].id);
        setSelectedPerf(getVaultPerformance(cards[0].id) ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectVault = (id: string) => {
    setSelectedVaultId(id);
    setSelectedPerf(getVaultPerformance(id) ?? null);
  };

  // ---------- Memoized derived data ----------

  const sportBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    vaultCards.forEach((vc) => { map[vc.sport] = (map[vc.sport] || 0) + vc.totalValue; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [vaultCards]);

  const cumulativeDividendData = useMemo(() => {
    const sorted = [...dividends].sort((a, b) => new Date(a.distributionDate).getTime() - new Date(b.distributionDate).getTime());
    let cumulative = 0;
    return sorted.map((d) => {
      cumulative += d.totalAmount;
      const dt = new Date(d.distributionDate);
      return { date: `${dt.getMonth() + 1}/${dt.getDate()}`, amount: d.totalAmount, cumulative: +cumulative.toFixed(2), source: d.source };
    });
  }, [dividends]);

  const selectedVaultOrders = useMemo(() => {
    return orders.filter((o) => o.vaultCardId === selectedVaultId && o.status === 'open');
  }, [orders, selectedVaultId]);

  const bids = useMemo(() =>
    selectedVaultOrders.filter((o) => o.type === 'buy').sort((a, b) => b.pricePerShare - a.pricePerShare),
    [selectedVaultOrders],
  );

  const asks = useMemo(() =>
    selectedVaultOrders.filter((o) => o.type === 'sell').sort((a, b) => a.pricePerShare - b.pricePerShare),
    [selectedVaultOrders],
  );

  const selectedVault = useMemo(() => vaultCards.find((v) => v.id === selectedVaultId), [vaultCards, selectedVaultId]);

  const holdingsPnlChart = useMemo(() => {
    return positions.map((p) => {
      const vc = vaultCards.find((v) => v.id === p.vaultCardId);
      return {
        name: vc ? vc.player.split(' ').pop() : p.vaultCardId,
        invested: p.avgCostBasis * p.shares,
        current: p.currentValue,
        pnl: p.unrealizedPnL,
      };
    });
  }, [positions, vaultCards]);

  // ---------- Loading state ----------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // ---------- Render helpers ----------

  const renderStatusBadge = (status: string) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.open;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const renderDelta = (value: number, suffix = '%') => {
    const positive = value >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-sm font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {positive ? '+' : ''}{value.toFixed(2)}{suffix}
      </span>
    );
  };

  const fundingPercent = (vc: VaultCard) => +((1 - vc.availableShares / vc.totalShares) * 100).toFixed(1);

  // ====================================================================
  // TAB: Vault Gallery
  // ====================================================================
  const renderGallery = () => (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vault AUM', value: formatCurrency(vaultCards.reduce((s, v) => s + v.totalValue, 0)), icon: <Landmark size={18} className="text-purple-400" /> },
          { label: 'Active Vaults', value: vaultCards.length.toString(), icon: <Layers size={18} className="text-blue-400" /> },
          { label: 'Open for Investment', value: vaultCards.filter((v) => v.vaultStatus === 'open').length.toString(), icon: <Unlock size={18} className="text-emerald-400" /> },
          { label: 'Avg Annualized Return', value: formatPercent(vaultCards.reduce((s, v) => s + v.annualizedReturn, 0) / vaultCards.length), icon: <TrendingUp size={18} className="text-amber-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">{stat.icon}<span className="text-xs text-slate-400">{stat.label}</span></div>
            <p className="text-xl font-bold text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sport breakdown pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">AUM by Sport</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sportBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" nameKey="name" paddingAngle={3}>
                {sportBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Vault Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vaultCards.map((v) => ({ name: v.player.split(' ').pop(), value: v.totalValue / 1000, status: v.vaultStatus, return: v.annualizedReturn }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} formatter={(v: number) => `$${v.toFixed(0)}K`} />
              <Bar dataKey="value" name="Value ($K)" radius={[4, 4, 0, 0]}>
                {vaultCards.map((vc, i) => <Cell key={i} fill={vc.annualizedReturn >= 0 ? '#8b5cf6' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vaultCards.map((vc) => {
          const pct = fundingPercent(vc);
          return (
            <button
              key={vc.id}
              onClick={() => { handleSelectVault(vc.id); setActiveTab('performance'); }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-left hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-100 leading-tight">{vc.cardName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{vc.grade} &middot; {vc.custodian}</p>
                </div>
                {renderStatusBadge(vc.vaultStatus)}
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-lg font-bold text-slate-100">{formatCurrency(vc.totalValue)}</span>
                {renderDelta(vc.annualizedReturn)}
                <span className="text-xs text-slate-500">ann.</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-xs text-slate-500">Price/Share</p>
                  <p className="text-sm font-semibold text-slate-200">{formatCurrencyPrecise(vc.pricePerShare)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Min Invest</p>
                  <p className="text-sm font-semibold text-slate-200">{formatCurrencyPrecise(vc.minInvestment)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Shareholders</p>
                  <p className="text-sm font-semibold text-slate-200">{vc.shareholders.length}</p>
                </div>
              </div>
              {/* Funding progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{pct}% funded</span>
                  <span>{vc.availableShares.toLocaleString()} shares left</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ====================================================================
  // TAB: My Holdings
  // ====================================================================
  const renderHoldings = () => {
    if (!portfolio) return null;
    return (
      <div className="space-y-6">
        {/* Portfolio summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invested', value: formatCurrency(portfolio.totalInvested), color: 'text-blue-400' },
            { label: 'Current Value', value: formatCurrency(portfolio.currentValue), color: 'text-purple-400' },
            { label: 'Unrealized P&L', value: `${formatCurrency(portfolio.totalPnL)} (${formatPercent(portfolio.pnlPercent)})`, color: portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Dividends Received', value: formatCurrencyPrecise(portfolio.totalDividendsReceived), color: 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* P&L bar chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Position P&L Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={holdingsPnlChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="invested" name="Cost Basis" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="Current Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="pnl" name="P&L" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Position table */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300">Your Fractional Positions ({portfolio.vaultCount})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/40">
                  {['Card', 'Shares', 'Avg Cost', 'Current Value', 'Unrealized P&L', 'Acquired'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {positions.map((pos) => {
                  const vc = vaultCards.find((v) => v.id === pos.vaultCardId);
                  const pnlPct = pos.avgCostBasis > 0 ? ((pos.currentValue / (pos.avgCostBasis * pos.shares)) - 1) * 100 : 0;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-200">{vc?.cardName ?? pos.vaultCardId}</p>
                        <p className="text-xs text-slate-400">{vc?.grade}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-200 font-mono">{pos.shares.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono">{formatCurrencyPrecise(pos.avgCostBasis)}</td>
                      <td className="px-4 py-3 text-slate-200 font-mono font-semibold">{formatCurrency(pos.currentValue)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold font-mono ${pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(pos.unrealizedPnL)} <span className="text-xs">({formatPercent(pnlPct)})</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(pos.acquiredDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation pie */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Portfolio Allocation by Card</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={positions.map((p) => {
                  const vc = vaultCards.find((v) => v.id === p.vaultCardId);
                  return { name: vc?.player ?? p.vaultCardId, value: p.currentValue };
                })}
                cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" nameKey="name" paddingAngle={2}
              >
                {positions.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ====================================================================
  // TAB: Governance
  // ====================================================================
  const renderGovernance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Votes', value: proposals.filter((p) => p.status === 'voting').length, icon: <Vote size={18} className="text-purple-400" /> },
          { label: 'Passed', value: proposals.filter((p) => p.status === 'passed').length, icon: <CheckCircle size={18} className="text-emerald-400" /> },
          { label: 'Rejected', value: proposals.filter((p) => p.status === 'rejected').length, icon: <XCircle size={18} className="text-red-400" /> },
          { label: 'Executed', value: proposals.filter((p) => p.status === 'executed').length, icon: <Gavel size={18} className="text-amber-400" /> },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-slate-400">{s.label}</span></div>
            <p className="text-2xl font-bold text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      {proposals.map((prop) => {
        const vc = vaultCards.find((v) => v.id === prop.vaultCardId);
        const totalVotes = prop.votesFor + prop.votesAgainst;
        const forPct = totalVotes > 0 ? (prop.votesFor / totalVotes) * 100 : 0;
        const againstPct = totalVotes > 0 ? (prop.votesAgainst / totalVotes) * 100 : 0;
        const quorumPct = prop.quorumRequired > 0 ? Math.min(100, (totalVotes / prop.quorumRequired) * 100) : 100;
        const quorumMet = totalVotes >= prop.quorumRequired;
        const deadline = new Date(prop.deadline);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 86400000));
        const isActive = prop.status === 'voting';

        return (
          <div key={prop.id} className={`bg-slate-800/60 border rounded-xl p-5 ${isActive ? 'border-purple-500/40' : 'border-slate-700/50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-700/60">{PROPOSAL_TYPE_ICONS[prop.type]}</span>
                <div>
                  <p className="font-semibold text-slate-100">{prop.title}</p>
                  <p className="text-xs text-slate-400">{vc?.cardName ?? prop.vaultCardId} &middot; Proposed by {prop.proposedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Clock size={12} /> {daysLeft}d left
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  prop.status === 'voting' ? 'bg-purple-500/20 text-purple-400' :
                  prop.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                  prop.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">{prop.description}</p>

            {/* Vote bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="text-emerald-400">For: {prop.votesFor.toLocaleString()} ({forPct.toFixed(1)}%)</span>
                <span className="text-red-400">Against: {prop.votesAgainst.toLocaleString()} ({againstPct.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 flex overflow-hidden">
                <div className="h-3 bg-emerald-500 transition-all" style={{ width: `${forPct}%` }} />
                <div className="h-3 bg-red-500 transition-all" style={{ width: `${againstPct}%` }} />
              </div>
            </div>

            {/* Quorum bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Quorum: {totalVotes.toLocaleString()} / {prop.quorumRequired.toLocaleString()}</span>
                <span className={quorumMet ? 'text-emerald-400' : 'text-amber-400'}>{quorumMet ? 'Quorum met' : `${quorumPct.toFixed(0)}% to quorum`}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all ${quorumMet ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${quorumPct}%` }} />
              </div>
            </div>

            {isActive && (
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1">
                  <CheckCircle size={14} /> Vote For
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1">
                  <XCircle size={14} /> Vote Against
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ====================================================================
  // TAB: Dividends
  // ====================================================================
  const renderDividends = () => {
    const sourceBreakdown = (() => {
      const map: Record<string, number> = {};
      dividends.forEach((d) => { map[d.source] = (map[d.source] || 0) + d.totalAmount; });
      return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: +value.toFixed(2) }));
    })();

    const totalDistributed = dividends.reduce((s, d) => s + d.totalAmount, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Distributed', value: formatCurrency(totalDistributed) },
            { label: 'Distributions', value: dividends.length.toString() },
            { label: 'Your Dividends', value: formatCurrencyPrecise(portfolio?.totalDividendsReceived ?? 0) },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-100">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Cumulative dividend chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Cumulative Dividend Distributions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeDividendData}>
              <defs>
                <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#8b5cf6" fill="url(#divGrad)" strokeWidth={2} />
              <Bar dataKey="amount" name="Distribution" fill="#3b82f680" radius={[2, 2, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source pie */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Dividends by Source</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                  {sourceBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent dividends list */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300">Recent Distributions</h3>
            </div>
            <div className="divide-y divide-slate-700/40 max-h-[300px] overflow-y-auto">
              {[...dividends].sort((a, b) => new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime()).slice(0, 15).map((d) => {
                const vc = vaultCards.find((v) => v.id === d.vaultCardId);
                return (
                  <div key={d.id} className="px-4 py-3 hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{vc?.player ?? d.vaultCardId}</p>
                        <p className="text-xs text-slate-400">{d.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(d.totalAmount)}</p>
                        <p className="text-xs text-slate-400">{formatCurrencyPrecise(d.perShareAmount)}/share</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ====================================================================
  // TAB: Secondary Market
  // ====================================================================
  const renderMarket = () => {
    const spread = asks.length > 0 && bids.length > 0
      ? +(asks[0].pricePerShare - bids[0].pricePerShare).toFixed(2)
      : 0;
    const spreadPct = selectedVault ? +((spread / selectedVault.pricePerShare) * 100).toFixed(2) : 0;

    return (
      <div className="space-y-6">
        {/* Vault selector */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-400">Select Vault:</label>
          <select
            value={selectedVaultId}
            onChange={(e) => handleSelectVault(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {vaultCards.map((vc) => (
              <option key={vc.id} value={vc.id}>{vc.player} - {vc.cardName}</option>
            ))}
          </select>
          {selectedVault && (
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="text-xs text-slate-400">NAV Price</p>
                <p className="text-lg font-bold text-slate-100">{formatCurrencyPrecise(selectedVault.pricePerShare)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Spread</p>
                <p className={`text-sm font-semibold ${spreadPct < 2 ? 'text-emerald-400' : spreadPct < 5 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatCurrencyPrecise(spread)} ({spreadPct}%)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order book */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bids */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">Bids (Buy Orders)</h3>
              <span className="ml-auto text-xs text-slate-400">{bids.length} orders</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/40">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400">Price</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Shares</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Total</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {bids.map((o) => (
                  <tr key={o.id} className="hover:bg-emerald-900/10 transition-colors">
                    <td className="px-4 py-2 text-emerald-400 font-mono font-semibold">{formatCurrencyPrecise(o.pricePerShare)}</td>
                    <td className="px-4 py-2 text-right text-slate-300 font-mono">{o.shares}</td>
                    <td className="px-4 py-2 text-right text-slate-300 font-mono">{formatCurrency(o.shares * o.pricePerShare)}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs">{o.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Asks */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <TrendingDown size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold text-red-400">Asks (Sell Orders)</h3>
              <span className="ml-auto text-xs text-slate-400">{asks.length} orders</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/40">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400">Price</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Shares</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Total</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {asks.map((o) => (
                  <tr key={o.id} className="hover:bg-red-900/10 transition-colors">
                    <td className="px-4 py-2 text-red-400 font-mono font-semibold">{formatCurrencyPrecise(o.pricePerShare)}</td>
                    <td className="px-4 py-2 text-right text-slate-300 font-mono">{o.shares}</td>
                    <td className="px-4 py-2 text-right text-slate-300 font-mono">{formatCurrency(o.shares * o.pricePerShare)}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs">{o.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Depth visualization */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Order Book Depth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              ...bids.map((b) => ({ price: b.pricePerShare, bid: b.shares, ask: 0 })),
              ...asks.map((a) => ({ price: a.pricePerShare, bid: 0, ask: a.shares })),
            ].sort((a, b) => a.price - b.price)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="price" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} />
              {selectedVault && <ReferenceLine x={selectedVault.pricePerShare} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'NAV', fill: '#f59e0b', fontSize: 11 }} />}
              <Bar dataKey="bid" name="Bids" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ask" name="Asks" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ====================================================================
  // TAB: Performance
  // ====================================================================
  const renderPerformance = () => {
    if (!selectedPerf || !selectedVault) {
      return <p className="text-slate-400 text-center py-12">Select a vault to view performance.</p>;
    }

    return (
      <div className="space-y-6">
        {/* Vault selector */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-400">Vault:</label>
          <select
            value={selectedVaultId}
            onChange={(e) => handleSelectVault(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {vaultCards.map((vc) => (
              <option key={vc.id} value={vc.id}>{vc.player} - {vc.grade}</option>
            ))}
          </select>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Return', value: formatPercent(selectedPerf.totalReturn), color: selectedPerf.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Sharpe Ratio', value: selectedPerf.sharpeRatio.toFixed(2), color: selectedPerf.sharpeRatio > 1.5 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Max Drawdown', value: `${selectedPerf.maxDrawdown.toFixed(2)}%`, color: 'text-red-400' },
            { label: 'Volatility', value: `${selectedPerf.volatility.toFixed(2)}%`, color: 'text-amber-400' },
            { label: 'Beta', value: selectedPerf.beta.toFixed(2), color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Cumulative returns chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Cumulative Returns: {selectedVault.player} vs Benchmarks
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={selectedPerf.monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={2} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <ReferenceLine y={0} stroke="#475569" />
              <Line type="monotone" dataKey="vaultReturn" name="Vault Return" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="marketBenchmark" name="Card Market Index" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="sp500" name="S&P 500" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly returns bar chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Monthly Returns (Vault)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={selectedPerf.monthlyReturns.map((m, i, arr) => ({
              month: m.month,
              return: i === 0 ? m.vaultReturn : +(m.vaultReturn - arr[i - 1].vaultReturn).toFixed(2),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={3} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#e2e8f0' }} formatter={(v: number) => `${v.toFixed(2)}%`} />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="return" name="Monthly Return" radius={[3, 3, 0, 0]}>
                {selectedPerf.monthlyReturns.map((m, i, arr) => {
                  const ret = i === 0 ? m.vaultReturn : m.vaultReturn - arr[i - 1].vaultReturn;
                  return <Cell key={i} fill={ret >= 0 ? '#10b981' : '#ef4444'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ====================================================================
  // Main render
  // ====================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/20">
          <Landmark size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Fractional Ownership Vault</h1>
          <p className="text-sm text-slate-400">
            Tokenized fractional ownership of grail-tier cards with governance, dividends, and secondary market trading
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'gallery' && renderGallery()}
      {activeTab === 'holdings' && renderHoldings()}
      {activeTab === 'governance' && renderGovernance()}
      {activeTab === 'dividends' && renderDividends()}
      {activeTab === 'market' && renderMarket()}
      {activeTab === 'performance' && renderPerformance()}
    </div>
  );
};

export default FractionalVault;
