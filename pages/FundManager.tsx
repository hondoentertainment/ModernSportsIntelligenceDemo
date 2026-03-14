import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, Users, LineChart, DollarSign, AlertTriangle } from 'lucide-react';
import {
  getFunds,
  getSyndicates,
  getFundMetrics,
  getLPPortfolio,
  getFundPositions,
  getCapitalCalls,
  getDistributions,
  getWaterfallDistribution,
  getTotalAUM,
  getActiveSyndicatesCount,
  getTopFundIRR,
  type Fund,
  type Syndicate,
  type FundMetrics,
  type LPInvestor,
  type FundPosition,
  type CapitalCall,
  type Distribution,
  type WaterfallDistribution,
} from '../lib/fundManagerService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FundManager: React.FC = () => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [syndicates, setSyndicates] = useState<Syndicate[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics[]>([]);
  const [investors, setInvestors] = useState<LPInvestor[]>([]);
  const [positions, setPositions] = useState<FundPosition[]>([]);
  const [capitalCalls, setCapitalCalls] = useState<CapitalCall[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [waterfall, setWaterfall] = useState<WaterfallDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setFunds(getFunds());
      setSyndicates(getSyndicates());
      setMetrics(getFundMetrics());
      setInvestors(getLPPortfolio());
      setPositions(getFundPositions());
      setCapitalCalls(getCapitalCalls());
      setDistributions(getDistributions());
      setLoading(false);
    } catch {
      setError('Failed to load fund manager data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFundId) {
      setWaterfall(getWaterfallDistribution(selectedFundId));
    }
  }, [selectedFundId]);

  const totalAUM = useMemo(() => getTotalAUM(), []);
  const activeSyndicates = useMemo(() => getActiveSyndicatesCount(), []);
  const topIRR = useMemo(() => getTopFundIRR(), []);

  const selectedMetrics = useMemo(
    () => (selectedFundId ? metrics.find((m) => m.fundId === selectedFundId) : null),
    [selectedFundId, metrics]
  );

  const fundPositions = useMemo(
    () => (selectedFundId ? positions.filter((p) => p.fundId === selectedFundId) : positions),
    [selectedFundId, positions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Fund &amp; Syndicate Manager...</p>
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <Landmark size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Fund &amp; Syndicate Manager</h1>
            <p className="text-sm text-slate-400">
              Institutional-grade fund creation, NAV tracking &amp; syndicate deals &mdash; Phase 121
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total AUM</p>
          <p className="text-3xl font-bold text-emerald-400">${(totalAUM / 1_000_000).toFixed(1)}M</p>
          <p className="text-xs text-slate-600 mt-1">{funds.length} funds</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top IRR</p>
          <p className="text-3xl font-bold text-brand-lime">{topIRR.irr}%</p>
          <p className="text-xs text-slate-600 mt-1 truncate">{topIRR.fundName}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">LP Investors</p>
          <p className="text-3xl font-bold text-blue-400">{investors.length}</p>
          <p className="text-xs text-slate-600 mt-1">{investors.filter((i) => i.tier === 'anchor').length} anchors</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Syndicates</p>
          <p className="text-3xl font-bold text-amber-400">{activeSyndicates}</p>
          <p className="text-xs text-slate-600 mt-1">{syndicates.length} total</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Positions</p>
          <p className="text-3xl font-bold text-white">{positions.length}</p>
          <p className="text-xs text-slate-600 mt-1">{positions.filter((p) => p.status === 'held').length} held</p>
        </div>
      </div>

      {/* Fund Selector & Metrics */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          Fund Performance
        </h2>
        <div className="flex gap-2 flex-wrap mb-6">
          {funds.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFundId(selectedFundId === f.id ? null : f.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedFundId === f.id
                  ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {f.name}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                f.status === 'investing' ? 'bg-emerald-500/20 text-emerald-400' :
                f.status === 'fundraising' ? 'bg-blue-500/20 text-blue-400' :
                f.status === 'harvesting' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-700 text-slate-400'
              }`}>{f.status}</span>
            </button>
          ))}
        </div>

        {selectedMetrics ? (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'NAV', value: `$${(selectedMetrics.nav / 1_000_000).toFixed(1)}M`, color: 'text-white' },
              { label: 'Net IRR', value: `${selectedMetrics.irr}%`, color: 'text-emerald-400' },
              { label: 'MOIC', value: `${selectedMetrics.moic}x`, color: 'text-blue-400' },
              { label: 'DPI', value: selectedMetrics.dpi.toFixed(2), color: 'text-amber-400' },
              { label: 'TVPI', value: selectedMetrics.tvpi.toFixed(2), color: 'text-purple-400' },
              { label: '% Called', value: `${selectedMetrics.percentCalled}%`, color: 'text-slate-300' },
              { label: 'Distributions', value: `$${(selectedMetrics.totalDistributions / 1_000_000).toFixed(1)}M`, color: 'text-emerald-400' },
              { label: 'Mgmt Fees', value: `$${(selectedMetrics.managementFees / 1_000_000).toFixed(1)}M`, color: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">Select a fund above to view performance metrics</p>
        )}
      </div>

      {/* Portfolio Positions & Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <LineChart size={18} className="text-blue-400" />
            Portfolio Positions
          </h2>
          <div className="space-y-2">
            {fundPositions.map((p) => (
              <div key={p.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{p.assetName}</p>
                  <p className="text-[10px] text-slate-500">{p.sport} &bull; Acquired {p.acquisitionDate}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`text-sm font-bold ${p.multiple >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.multiple.toFixed(2)}x
                  </p>
                  <p className="text-[10px] text-slate-500">${(p.currentValue / 1000).toFixed(0)}k</p>
                </div>
                <span className={`ml-3 text-[10px] px-2 py-0.5 rounded-full ${
                  p.status === 'held' ? 'bg-emerald-500/20 text-emerald-400' :
                  p.status === 'partially_sold' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-700 text-slate-400'
                }`}>{p.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waterfall */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-400" />
            Waterfall Distribution
          </h2>
          {waterfall.length > 0 ? (
            <div className="space-y-3">
              {waterfall.map((w) => (
                <div key={w.tier} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-white mb-1">{w.tier}</p>
                  <p className="text-[10px] text-slate-500 mb-2">{w.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-600">LP Share</span>
                      <p className="text-emerald-400 font-bold">${(w.lpShare / 1_000_000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <span className="text-slate-600">GP Share</span>
                      <p className="text-amber-400 font-bold">${(w.gpShare / 1_000_000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-500">Select a fund to view waterfall</p>
            </div>
          )}
        </div>
      </div>

      {/* Syndicate Deals */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          Syndicate Deals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {syndicates.map((s) => (
            <div key={s.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{s.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  s.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                  s.status === 'funded' ? 'bg-emerald-500/20 text-emerald-400' :
                  s.status === 'active' ? 'bg-brand-lime/20 text-brand-lime' :
                  'bg-slate-700 text-slate-400'
                }`}>{s.status}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
              <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2">
                <div
                  className="h-full bg-brand-lime rounded-full"
                  style={{ width: `${Math.min(100, (s.currentRaise / s.targetRaise) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>${(s.currentRaise / 1_000_000).toFixed(1)}M / ${(s.targetRaise / 1_000_000).toFixed(1)}M</span>
                <span>{s.memberCount} members &bull; {s.expectedReturn}% exp. return</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LP Investors */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          LP Investor Portfolio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {investors.slice(0, 9).map((lp) => (
            <div key={lp.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white truncate">{lp.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  lp.tier === 'anchor' ? 'bg-amber-500/20 text-amber-400' :
                  lp.tier === 'strategic' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-700 text-slate-400'
                }`}>{lp.tier}</span>
              </div>
              <p className="text-[10px] text-slate-500 capitalize">{lp.type.replace('_', ' ')}</p>
              <div className="flex justify-between mt-2 text-[10px]">
                <span className="text-slate-600">Commitment: <span className="text-white">${(lp.commitment / 1_000_000).toFixed(1)}M</span></span>
                <span className="text-emerald-400 font-bold">{lp.netIRR}% IRR</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FundManager;
