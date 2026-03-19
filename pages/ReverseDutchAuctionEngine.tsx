import React, { useState, useEffect, useMemo } from 'react';
import { Timer, TrendingDown, Bell, Eye, DollarSign, AlertTriangle, Plus, Star, CheckCircle, BarChart3, List, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  getActiveAuctions,
  getDutchAuctionStats,
  getDutchAuctionAlerts,
  getAuctionHistory,
  getMyListings,
  getPriceTrajectory,
  formatCurrency,
  formatCountdown,
  type DutchAuction,
  type DutchAuctionStats,
  type DutchAuctionAlert,
  type DutchAuctionHistory,
  type MyListing,
} from '../lib/trading/reverseDutchAuctionService.ts';

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24'];

const ReverseDutchAuctionEngine: React.FC = () => {
  const [auctions, setAuctions] = useState<DutchAuction[]>([]);
  const [stats, setStats] = useState<DutchAuctionStats | null>(null);
  const [alerts, setAlerts] = useState<DutchAuctionAlert[]>([]);
  const [history, setHistory] = useState<DutchAuctionHistory[]>([]);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<DutchAuction | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'mylistings' | 'history'>('live');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set(['rda-002', 'rda-005']));
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal form state
  const [form, setForm] = useState({
    cardName: '',
    openingPrice: '',
    floorPrice: '',
    decrementAmount: '',
    decrementInterval: '6 hours',
  });

  useEffect(() => {
    try {
      const aucList = getActiveAuctions();
      setAuctions(aucList);
      setStats(getDutchAuctionStats());
      setAlerts(getDutchAuctionAlerts());
      setHistory(getAuctionHistory());
      setMyListings(getMyListings());
      setSelectedAuction(aucList[0] ?? null);
      setLoading(false);
    } catch {
      setError('Failed to load Dutch Auction data');
      setLoading(false);
    }
  }, []);

  const trajectoryData = useMemo(() => {
    if (!selectedAuction) return [];
    return getPriceTrajectory(selectedAuction.id);
  }, [selectedAuction]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleBuyNow(auction: DutchAuction) {
    showToast(`Purchase initiated for ${auction.cardName.split(' ').slice(0, 5).join(' ')}... at ${formatCurrency(auction.currentPrice)}`);
  }

  function toggleWatch(id: string) {
    setWatchedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from watchlist');
      } else {
        next.add(id);
        showToast('Added to watchlist');
      }
      return next;
    });
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    showToast(`Dutch auction created for "${form.cardName || 'your card'}"!`);
    setShowCreateModal(false);
    setForm({ cardName: '', openingPrice: '', floorPrice: '', decrementAmount: '', decrementInterval: '6 hours' });
  }

  function getDiscountColor(discountPct: number): string {
    if (discountPct >= 20) return 'text-emerald-400';
    if (discountPct >= 10) return 'text-amber-400';
    return 'text-slate-300';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Dutch Auction Engine...</p>
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <TrendingDown size={24} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Reverse Dutch Auction Engine</h1>
            <p className="text-sm text-slate-400">Prices drop on schedule — first mover wins, patience saves money</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create Dutch Auction
        </button>
      </div>

      {/* Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Auctions</p>
            <p className="text-3xl font-bold text-orange-400">{stats.totalActive}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Discount</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.avgDiscount}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Drops to Sale</p>
            <p className="text-3xl font-bold text-blue-400">{stats.avgDecrementsToSale}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buyer Avg Saving</p>
            <p className="text-3xl font-bold text-amber-400">{formatCurrency(stats.buyerAvgSaving)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-purple-400">{stats.successRate}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Volume This Month</p>
            <p className="text-2xl font-bold text-brand-lime">{formatCurrency(stats.totalVolumeThisMonth)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['live', 'mylistings', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200'}`}
          >
            {tab === 'live' ? 'Live Auctions' : tab === 'mylistings' ? 'My Listings' : 'History'}
          </button>
        ))}
      </div>

      {/* Live Auctions Tab */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auction Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auctions.map(auction => (
                <div
                  key={auction.id}
                  onClick={() => setSelectedAuction(auction)}
                  className={`bg-slate-900/50 border rounded-xl p-4 cursor-pointer hover:border-orange-500/40 transition-colors ${selectedAuction?.id === auction.id ? 'border-orange-500/50 bg-orange-500/5' : 'border-slate-700/30'}`}
                >
                  {/* Top row: sport badge + decrement countdown */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30">
                      {auction.sport} · {auction.year}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                      <Timer size={8} />
                      Next drop: {formatCountdown(auction.nextDecrement)}
                    </span>
                  </div>

                  {/* Card name */}
                  <p className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">{auction.cardName}</p>
                  <p className="text-[10px] text-slate-500 mb-3">{auction.gradingCompany} {auction.grade} · {auction.seller} ({auction.sellerRating}★)</p>

                  {/* Pricing */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-slate-500 line-through">{formatCurrency(auction.openingPrice)} open</p>
                      <p className={`text-2xl font-bold ${getDiscountColor(auction.discountVsFMV)}`}>{formatCurrency(auction.currentPrice)}</p>
                      <p className="text-[10px] text-slate-500">Floor: {formatCurrency(auction.floorPrice)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${auction.discountVsFMV >= 20 ? 'bg-emerald-500/20 text-emerald-400' : auction.discountVsFMV >= 10 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/30 text-slate-400'}`}>
                        {auction.discountVsFMV.toFixed(1)}% below FMV
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">FMV: {formatCurrency(auction.fairMarketValue)}</p>
                    </div>
                  </div>

                  {/* Decrement progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                      <span>Drop {auction.decrementCount}/{auction.maxDecrements}</span>
                      <span>{auction.decrementAmount > 0 ? `-${formatCurrency(auction.decrementAmount)}` : ''} per {auction.decrementInterval}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(auction.decrementCount / auction.maxDecrements) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Watcher count */}
                  <p className="text-[10px] text-slate-500 mb-3 flex items-center gap-1">
                    <Eye size={9} /> {auction.watcherCount} watching
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleBuyNow(auction); }}
                      className="flex-1 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-lg text-xs font-bold transition-colors"
                    >
                      Buy Now at {formatCurrency(auction.currentPrice)}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); toggleWatch(auction.id); }}
                      className={`p-2 rounded-lg border transition-colors ${watchedIds.has(auction.id) ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:text-slate-200'}`}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: selected auction chart + alerts */}
          <div className="space-y-4">
            {/* Price trajectory chart */}
            {selectedAuction && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                  <BarChart3 size={16} className="text-orange-400" />
                  Price Trajectory
                </h3>
                <p className="text-[10px] text-slate-500 mb-3 truncate">{selectedAuction.cardName.split(' ').slice(0, 5).join(' ')}...</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trajectoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="step" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(val: number) => formatCurrency(val)}
                      />
                      <Line type="monotone" dataKey="price" name="Dutch Price" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                      <Line type="monotone" dataKey="fmv" name="Fair Market Value" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-3 mt-2 justify-center text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block rounded" />Dutch Price</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded border-dashed" />FMV</span>
                </div>
              </div>
            )}

            {/* Alerts panel */}
            <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Bell size={16} className="text-orange-400" />
                Active Alerts
              </h3>
              <div className="space-y-3">
                {alerts.length === 0 && (
                  <p className="text-xs text-slate-500">No urgent alerts right now.</p>
                )}
                {alerts.map(alert => (
                  <div key={alert.auctionId} className="bg-slate-900/50 border border-orange-500/10 rounded-xl p-3">
                    <p className="text-xs font-bold text-white mb-1 line-clamp-1">{alert.cardName.split(' ').slice(0, 5).join(' ')}...</p>
                    <p className="text-[10px] text-orange-300 mb-2">{alert.message}</p>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Current: <span className="text-emerald-400 font-bold">{formatCurrency(alert.currentPrice)}</span></span>
                      <span>Save: <span className="text-amber-400 font-bold">{formatCurrency(alert.savings)}</span></span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">Next drop: {formatCountdown(alert.nextDecrement)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Listings Tab */}
      {activeTab === 'mylistings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <List size={18} className="text-orange-400" />
              My Active Listings
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus size={14} />
              New Listing
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myListings.map(listing => (
              <div key={listing.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${listing.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : listing.status === 'sold' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                    {listing.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Eye size={9} /> {listing.watcherCount}</span>
                </div>
                <p className="text-sm font-bold text-white mb-3 line-clamp-2">{listing.cardName}</p>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Opening:</span>
                    <span className="text-slate-300 line-through">{formatCurrency(listing.openingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className="text-orange-400 font-bold text-sm">{formatCurrency(listing.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Floor:</span>
                    <span className="text-slate-400">{formatCurrency(listing.floorPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drops:</span>
                    <span className="text-slate-300">-{formatCurrency(listing.decrementAmount)} / {listing.decrementInterval}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            Completed Auctions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Card</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Opening</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Final Price</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Drops Taken</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Duration</th>
                  <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Buyer Saved</th>
                  <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr key={idx} className="border-b border-slate-700/20 hover:bg-slate-700/10 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-white max-w-[260px] truncate">{h.cardName}</p>
                    </td>
                    <td className="py-3 pr-4 text-right text-sm text-slate-400 line-through">{formatCurrency(h.openingPrice)}</td>
                    <td className="py-3 pr-4 text-right text-sm font-bold text-orange-400">{formatCurrency(h.finalPrice)}</td>
                    <td className="py-3 pr-4 text-right text-sm text-slate-300">{h.decrementsTaken}</td>
                    <td className="py-3 pr-4 text-right text-sm text-slate-300">{h.totalTimeDays}d</td>
                    <td className="py-3 pr-4 text-right text-sm font-bold text-emerald-400">{formatCurrency(h.buyerSaving)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${h.sellerResult === 'satisfied' ? 'bg-emerald-500/10 text-emerald-400' : h.sellerResult === 'accepted floor' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                        {h.sellerResult.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Dutch Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingDown size={20} className="text-orange-400" />
                <h2 className="text-lg font-bold text-white">Create Dutch Auction</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Card Name</label>
                <input
                  type="text"
                  value={form.cardName}
                  onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))}
                  placeholder="e.g. 2023 Prizm Victor Wembanyama Rookie PSA 10"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Opening Price ($)</label>
                  <input
                    type="number"
                    value={form.openingPrice}
                    onChange={e => setForm(f => ({ ...f, openingPrice: e.target.value }))}
                    placeholder="5000"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Floor Price ($)</label>
                  <input
                    type="number"
                    value={form.floorPrice}
                    onChange={e => setForm(f => ({ ...f, floorPrice: e.target.value }))}
                    placeholder="2500"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Decrement ($)</label>
                  <input
                    type="number"
                    value={form.decrementAmount}
                    onChange={e => setForm(f => ({ ...f, decrementAmount: e.target.value }))}
                    placeholder="250"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Interval</label>
                  <select
                    value={form.decrementInterval}
                    onChange={e => setForm(f => ({ ...f, decrementInterval: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
                  >
                    <option>4 hours</option>
                    <option>6 hours</option>
                    <option>8 hours</option>
                    <option>12 hours</option>
                    <option>24 hours</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-xl text-sm font-bold transition-colors"
                >
                  Launch Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReverseDutchAuctionEngine;
