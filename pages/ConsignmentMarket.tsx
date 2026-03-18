import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, DollarSign, TrendingUp, Clock, Star, BarChart3,
  Package, ArrowRight, Calculator, MessageSquare, CheckCircle,
  AlertCircle, XCircle, Timer, RefreshCw,
} from 'lucide-react';
import {
  getConsignmentHouses,
  getMyListings,
  compareHouses,
  getConsignmentStats,
  getRecentSales,
  getFeeCalculation,
  getHouseReviews,
  formatCurrency,
  formatPercent,
  getStatusColor,
  getStatusLabel,
  getRatingColor,
  type ConsignmentHouse,
  type ConsignmentListing,
  type ConsignmentComparison,
  type ConsignmentStats,
  type HouseReview,
} from '../lib/trading/consignmentMarketService.ts';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';

type Tab = 'compare' | 'consignments' | 'calculator' | 'reviews';

const TAB_CONFIG: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'compare', label: 'Compare Houses', icon: <Building2 className="w-4 h-4" /> },
  { key: 'consignments', label: 'My Consignments', icon: <Package className="w-4 h-4" /> },
  { key: 'calculator', label: 'Fee Calculator', icon: <Calculator className="w-4 h-4" /> },
  { key: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
];

const BAR_COLORS = ['#84cc16', '#22d3ee', '#a78bfa', '#f472b6', '#fb923c', '#facc15', '#34d399', '#f87171', '#60a5fa', '#c084fc'];

const ConsignmentMarket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('compare');
  const [houses, setHouses] = useState<ConsignmentHouse[]>([]);
  const [listings, setListings] = useState<ConsignmentListing[]>([]);
  const [stats, setStats] = useState<ConsignmentStats | null>(null);
  const [calcValue, setCalcValue] = useState<number>(1000);
  const [comparison, setComparison] = useState<ConsignmentComparison | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string>('');
  const [reviews, setReviews] = useState<HouseReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setHouses(getConsignmentHouses());
      setListings(getMyListings());
      setStats(getConsignmentStats());
      setComparison(compareHouses(calcValue));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setComparison(compareHouses(calcValue));
  }, [calcValue]);

  useEffect(() => {
    if (selectedHouseId) {
      setReviews(getHouseReviews(selectedHouseId));
    } else if (houses.length > 0) {
      setSelectedHouseId(houses[0].id);
      setReviews(getHouseReviews(houses[0].id));
    }
  }, [selectedHouseId, houses]);

  const recentSales = useMemo(() => getRecentSales(), [listings]);

  const feeChartData = useMemo(() => {
    if (!comparison) return [];
    return comparison.houses.map(h => ({
      name: h.name.length > 12 ? h.name.substring(0, 12) + '...' : h.name,
      fee: h.feePercent,
      net: h.estimatedNet,
    }));
  }, [comparison]);

  const sellThroughData = useMemo(() => {
    return houses.map(h => ({
      name: h.name.length > 12 ? h.name.substring(0, 12) + '...' : h.name,
      sellThrough: Math.round(h.avgSellThrough * 100),
      days: h.avgDaysToSell,
    }));
  }, [houses]);

  const statusIcon = (status: ConsignmentListing['status']) => {
    switch (status) {
      case 'pending': return <Timer className="w-4 h-4" />;
      case 'listed': return <Package className="w-4 h-4" />;
      case 'sold': return <CheckCircle className="w-4 h-4" />;
      case 'returned': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Consignment Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="w-8 h-8 text-lime-400" />
          Consignment Marketplace
        </h1>
        <p className="text-slate-400 mt-2">
          Compare consignment houses, track listings, and maximize your net proceeds
        </p>
      </div>

      {/* Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Total Consigned</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalConsigned}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Active Listings</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.activeListing}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Total Sold</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.totalSold}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Net Proceeds</p>
            <p className="text-2xl font-bold text-lime-400 mt-1">{formatCurrency(stats.totalNetProceeds)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Avg Fee %</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{formatPercent(stats.avgFeePercent)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Avg Days to Sell</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.avgDaysToSell}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-lime-500 text-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compare Houses Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* House Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {houses.map(house => (
              <div key={house.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-lime-500/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{house.name}</h3>
                  <div className={`flex items-center gap-1 ${getRatingColor(house.rating)}`}>
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{house.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{house.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Fee Tiers</div>
                  {house.feeStructure.map((tier, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-300">{tier.tier}</span>
                      <span className="text-lime-400 font-medium">{tier.feePercent}%</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Sell-Through</p>
                    <p className="text-cyan-400 font-medium">{formatPercent(house.avgSellThrough * 100)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Avg Days</p>
                    <p className="text-orange-400 font-medium">{house.avgDaysToSell}d</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Min Value</p>
                    <p className="text-slate-300">{formatCurrency(house.minConsignmentValue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Reviews</p>
                    <p className="text-slate-300">{house.reviewCount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {house.specialties.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sell-Through Comparison Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Sell-Through Rate Comparison
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellThroughData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="sellThrough" name="Sell-Through %" radius={[4, 4, 0, 0]}>
                    {sellThroughData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* My Consignments Tab */}
      {activeTab === 'consignments' && (
        <div className="space-y-6">
          {/* Status Pipeline */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['pending', 'listed', 'sold', 'returned', 'expired'] as const).map(status => {
              const count = listings.filter(l => l.status === status).length;
              return (
                <div key={status} className="bg-slate-800 rounded-xl p-4 text-center">
                  <div className={`flex items-center justify-center gap-1 mb-1 ${getStatusColor(status)}`}>
                    {statusIcon(status)}
                    <span className="text-sm font-medium">{getStatusLabel(status)}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Listings Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-lime-400" />
                All Consignments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                    <th className="text-left p-3">Card</th>
                    <th className="text-left p-3">House</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Est. Value</th>
                    <th className="text-right p-3">Sold Price</th>
                    <th className="text-right p-3">Fees</th>
                    <th className="text-right p-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(listing => {
                    const house = houses.find(h => h.id === listing.houseId);
                    return (
                      <tr key={listing.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-3">
                          <p className="text-white font-medium">{listing.cardName}</p>
                          <p className="text-slate-500 text-xs">{listing.player} - {listing.sport}</p>
                        </td>
                        <td className="p-3 text-slate-300">{house?.name ?? listing.houseId}</td>
                        <td className="p-3">
                          <span className={`flex items-center gap-1 ${getStatusColor(listing.status)}`}>
                            {statusIcon(listing.status)}
                            {getStatusLabel(listing.status)}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-300">{formatCurrency(listing.estimatedValue)}</td>
                        <td className="p-3 text-right text-green-400">
                          {listing.soldPrice ? formatCurrency(listing.soldPrice) : '—'}
                        </td>
                        <td className="p-3 text-right text-orange-400">{formatCurrency(listing.fees)}</td>
                        <td className="p-3 text-right text-lime-400">
                          {listing.netProceeds != null ? formatCurrency(listing.netProceeds) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sales Feed */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Recent Sales
            </h3>
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div>
                    <p className="text-white font-medium text-sm">{sale.cardName}</p>
                    <p className="text-slate-500 text-xs">{sale.soldDate} - {houses.find(h => h.id === sale.houseId)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{formatCurrency(sale.soldPrice!)}</p>
                    <p className="text-slate-500 text-xs">Net: {formatCurrency(sale.netProceeds!)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fee Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Input */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-lime-400" />
              Fee Calculator
            </h3>
            <div className="flex items-center gap-4">
              <label className="text-slate-400 text-sm">Card Value:</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={calcValue}
                  onChange={e => setCalcValue(Math.max(0, Number(e.target.value)))}
                  className="bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white w-48 focus:outline-none focus:border-lime-500"
                />
              </div>
            </div>
          </div>

          {/* Fee Comparison Table */}
          {comparison && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold">Net Proceeds at Each House</h3>
                <p className="text-slate-400 text-sm">For a card valued at {formatCurrency(calcValue)}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                      <th className="text-left p-3">House</th>
                      <th className="text-right p-3">Fee %</th>
                      <th className="text-right p-3">Fee Amount</th>
                      <th className="text-right p-3">Est. Net</th>
                      <th className="text-right p-3">Days to Sell</th>
                      <th className="text-right p-3">Sell-Through</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.houses.map((h, i) => (
                      <tr key={h.houseId} className={`border-b border-slate-700/50 ${i === 0 ? 'bg-lime-500/10' : ''}`}>
                        <td className="p-3 text-white font-medium">
                          {h.name}
                          {i === 0 && <span className="ml-2 text-xs text-lime-400 font-normal">Lowest Fee</span>}
                        </td>
                        <td className="p-3 text-right text-orange-400">{formatPercent(h.feePercent)}</td>
                        <td className="p-3 text-right text-red-400">{formatCurrency(h.fee)}</td>
                        <td className="p-3 text-right text-lime-400 font-bold">{formatCurrency(h.estimatedNet)}</td>
                        <td className="p-3 text-right text-cyan-400">{h.avgDaysToSell}d</td>
                        <td className="p-3 text-right text-blue-400">{formatPercent(h.sellThrough * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fee Comparison Bar Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              Fee Comparison
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="fee" name="Fee %" fill="#fb923c" radius={[4, 4, 0, 0]}>
                    {feeChartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* House Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {houses.map(house => (
              <button
                key={house.id}
                onClick={() => setSelectedHouseId(house.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedHouseId === house.id
                    ? 'bg-lime-500 text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {house.name}
              </button>
            ))}
          </div>

          {/* House Info + Reviews */}
          {(() => {
            const house = houses.find(h => h.id === selectedHouseId);
            if (!house) return null;
            return (
              <div className="space-y-4">
                {/* House Header */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{house.name}</h2>
                      <p className="text-slate-400 mt-1">{house.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className={`flex items-center gap-1 ${getRatingColor(house.rating)}`}>
                          <Star className="w-4 h-4 fill-current" />
                          {house.rating} ({house.reviewCount} reviews)
                        </span>
                        <span className="text-slate-400">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {house.paymentTerms}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{review.reviewer}</span>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 ${getRatingColor(review.rating)}`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'opacity-30'}`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-500 text-xs">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">{review.comment}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-8 text-slate-500">No reviews yet for this house.</div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ConsignmentMarket;
