import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  getVaultedCards,
  getArbitrageOpportunities,
  getPlatformFees,
  getTransferHistory,
  getPlatformHealthStatus,
  getVaultSummary,
  getPlatformLabel,
  getAllPlatformNetProceeds,
  type VaultCard,
  type ArbitrageOpportunity,
  type PlatformFees,
  type TransferRequest,
  type PlatformHealthStatus,
  type VaultSummary,
} from '../lib/trading/vaultArbitrageService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const STATUS_DOT: Record<string, string> = {
  online: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-red-500',
};

const STATUS_COLORS: Record<string, string> = {
  online: 'text-emerald-400',
  degraded: 'text-amber-400',
  offline: 'text-red-400',
};

const TRANSFER_BADGE: Record<string, string> = {
  pending: 'bg-slate-500/20 text-slate-400',
  in_transit: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-slate-500/20 text-slate-500',
};

const BAR_COLORS = ['#06b6d4', '#84cc16', '#f59e0b', '#8b5cf6', '#ef4444'];

const VaultArbitrage: React.FC = () => {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [fees, setFees] = useState<PlatformFees[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [health, setHealth] = useState<PlatformHealthStatus[]>([]);
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [selectedCard, setSelectedCard] = useState<VaultCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allCards = getVaultedCards();
      setCards(allCards);
      setOpportunities(getArbitrageOpportunities());
      setFees(getPlatformFees());
      setTransfers(getTransferHistory());
      setHealth(getPlatformHealthStatus());
      setSummary(getVaultSummary());
      if (allCards.length > 0) setSelectedCard(allCards[0]);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const proceedsChartData = useMemo(() => {
    if (!selectedCard) return [];
    return getAllPlatformNetProceeds(selectedCard).map(p => ({
      name: p.label,
      netProceeds: p.netProceeds,
      fees: Math.round((p.salePrice - p.netProceeds) * 100) / 100,
    }));
  }, [selectedCard]);

  const activeTransfers = useMemo(
    () => transfers.filter(t => t.status === 'pending' || t.status === 'in_transit').length,
    [transfers]
  );

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Vault Arbitrage Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <ArrowRightLeft size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Vault Arbitrage Engine</h1>
            <p className="text-sm text-slate-400">
              Cross-platform migration &amp; fee-optimized listing router &mdash; Phase 129
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-cyan-500/20 text-cyan-300">
            {opportunities.length} Opportunities
          </span>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Vaulted Value</p>
          <p className="text-3xl font-bold text-white">${summary.totalValue.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">{summary.totalCards} cards across vaults</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Arbitrage Opportunities</p>
          <p className="text-3xl font-bold text-cyan-400">{opportunities.length}</p>
          <p className="text-xs text-slate-600 mt-1">cards with better options</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Potential Net Gain</p>
          <p className="text-3xl font-bold text-emerald-400">
            ${Math.round(summary.totalArbitrageOpportunity).toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 mt-1">after transfer fees</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Transfers</p>
          <p className="text-3xl font-bold text-amber-400">{activeTransfers}</p>
          <p className="text-xs text-slate-600 mt-1">in progress</p>
        </div>
      </div>

      {/* ─── Platform Fee Comparison Table ──────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          Platform Fee Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-500 uppercase pb-3 pr-4">Platform</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Seller Fee</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Shipping</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Storage/mo</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Processing</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 px-3">Transfer Out</th>
                <th className="text-right text-xs text-slate-500 uppercase pb-3 pl-3">Transfer In</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.platform} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                  <td className={`py-3 pr-4 font-bold ${fee.color}`}>{fee.label}</td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {(fee.sellerFeePercent * 100).toFixed(1)}%{fee.sellerFeeFlat > 0 ? ` + $${fee.sellerFeeFlat.toFixed(2)}` : ''}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">${fee.shippingCostOut.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {fee.storageCostMonthly > 0 ? `$${fee.storageCostMonthly.toFixed(2)}` : 'Free'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {fee.paymentProcessing > 0 ? `${(fee.paymentProcessing * 100).toFixed(1)}%` : 'Incl.'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">${fee.transferOutFee.toFixed(2)}</td>
                  <td className="py-3 pl-3 text-right text-slate-300">${fee.transferInFee.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Arbitrage Opportunities ────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-400" />
          Arbitrage Opportunities
        </h2>
        <div className="space-y-3">
          {opportunities.slice(0, 8).map(opp => (
            <div key={opp.card.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-cyan-500/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{opp.card.player}</p>
                  <p className="text-[10px] text-slate-500">{opp.card.cardDescription} | {opp.card.grade}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">+${opp.netGainAfterTransfer.toLocaleString()}</p>
                  <p className="text-[10px] text-cyan-400">+{opp.gainPercent}% net gain</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-700 text-slate-300 uppercase">
                  {getPlatformLabel(opp.currentPlatform)}
                </span>
                <ArrowRight size={12} className="text-cyan-400" />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 uppercase">
                  {getPlatformLabel(opp.recommendedPlatform)}
                </span>
                <span className="text-[10px] text-slate-500 ml-auto">
                  Transfer fee: ${opp.transferCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{opp.reasoning}</span>
                <span className={`font-bold ${opp.confidence >= 80 ? 'text-emerald-400' : opp.confidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {opp.confidence}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Net Proceeds Chart + Transfer History ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Proceeds Comparison Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Net Proceeds by Platform
          </h2>
          <div className="mb-3">
            <select
              value={selectedCard?.id || ''}
              onChange={e => {
                const card = cards.find(c => c.id === e.target.value);
                if (card) setSelectedCard(card);
              }}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              {cards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.player} - {c.cardDescription} ({c.grade}) - ${c.estimatedValue.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={proceedsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'netProceeds' ? 'Net Proceeds' : 'Total Fees']}
                />
                <Bar dataKey="netProceeds" name="Net Proceeds" radius={[4, 4, 0, 0]}>
                  {proceedsChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transfer History */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Package size={18} className="text-slate-400" />
            Transfer History
          </h2>
          <div className="space-y-3">
            {transfers.slice(0, 6).map(transfer => (
              <div key={transfer.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{transfer.player}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {getPlatformLabel(transfer.fromPlatform)} &rarr; {getPlatformLabel(transfer.toPlatform)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-400">${transfer.transferFee.toFixed(2)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${TRANSFER_BADGE[transfer.status]}`}>
                    {transfer.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Platform Health ──────────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          Platform Health &amp; Demand
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {health.map(p => (
            <div key={p.platform} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status]}`} />
                <span className={`text-sm font-bold ${p.color}`}>{p.label}</span>
              </div>
              <p className={`text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</p>
              <div className="mt-2 space-y-1">
                <p className="text-[10px] text-slate-500">
                  Avg Sale: <span className="text-slate-300 font-semibold">{p.avgSaleDays}d</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Demand: <span className={`font-semibold ${p.buyerDemandScore >= 70 ? 'text-emerald-400' : p.buyerDemandScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {p.buyerDemandScore}/100
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">{p.activeListings.toLocaleString()} listings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaultArbitrage;
