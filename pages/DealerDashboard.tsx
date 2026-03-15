import React, { useState, useEffect, useMemo } from 'react';
import { Store, DollarSign, TrendingUp, Package, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  getDealerProfile,
  getInventory,
  getSalesAnalytics,
  getConsignments,
  getMarginAnalysis,
  getStoreConfig,
  getTopSellers,
  getTodaysSales,
  getCustomers,
  getActiveConsignmentCount,
  type DealerProfile,
  type DealerInventoryItem,
  type DailySalesData,
  type ConsignmentItem,
  type MarginAnalysis,
  type MultiStoreConfig,
  type TopSeller,
  type Customer,
} from '../lib/dealerDashboardService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DealerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [inventory, setInventory] = useState<DealerInventoryItem[]>([]);
  const [salesData, setSalesData] = useState<DailySalesData[]>([]);
  const [consignments, setConsignments] = useState<ConsignmentItem[]>([]);
  const [margins, setMargins] = useState<MarginAnalysis[]>([]);
  const [stores, setStores] = useState<MultiStoreConfig[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setProfile(getDealerProfile());
      setInventory(getInventory(selectedStore));
      setSalesData(getSalesAnalytics(selectedStore));
      setConsignments(getConsignments(selectedStore));
      setMargins(getMarginAnalysis(selectedStore));
      setStores(getStoreConfig());
      setTopSellers(getTopSellers(selectedStore));
      setCustomers(getCustomers(selectedStore));
      setLoading(false);
    } catch {
      setError('Failed to load dealer dashboard data');
      setLoading(false);
    }
  }, [selectedStore]);

  const todaySales = useMemo(() => getTodaysSales(selectedStore), [selectedStore]);
  const activeConsignments = useMemo(() => getActiveConsignmentCount(selectedStore), [selectedStore]);

  const totalInventoryValue = useMemo(
    () => inventory.reduce((sum, i) => sum + i.marketValue * i.quantity, 0),
    [inventory]
  );
  const totalInventoryItems = useMemo(
    () => inventory.reduce((sum, i) => sum + i.quantity, 0),
    [inventory]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Dealer Dashboard...</p>
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
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Store size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Dealer Dashboard &amp; Multi-Account</h1>
            <p className="text-sm text-slate-400">
              Sales analytics, inventory management &amp; consignment tracking &mdash; Phase 120
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStore ?? ''}
            onChange={(e) => setSelectedStore(e.target.value || undefined)}
            className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg"
          >
            <option value="">All Stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {profile && (
            <span className="px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-full uppercase">
              {profile.tier}
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Today&rsquo;s Revenue</p>
          <p className="text-3xl font-bold text-emerald-400">${todaySales.revenue.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">{todaySales.transactions} transactions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Today&rsquo;s Margin</p>
          <p className="text-3xl font-bold text-blue-400">{todaySales.marginPercent}%</p>
          <p className="text-xs text-emerald-400/70 mt-1">+${todaySales.margin.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Inventory Value</p>
          <p className="text-3xl font-bold text-white">${(totalInventoryValue / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-600 mt-1">{totalInventoryItems} items</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Consignments</p>
          <p className="text-3xl font-bold text-amber-400">{activeConsignments}</p>
          <p className="text-xs text-slate-600 mt-1">{consignments.length} total</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Customers</p>
          <p className="text-3xl font-bold text-purple-400">{customers.length}</p>
          <p className="text-xs text-slate-600 mt-1">{customers.filter((c) => c.tier === 'whale' || c.tier === 'vip').length} VIP/whale</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          14-Day Sales Analytics
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="revenue" fill="#34d399" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="margin" fill="#84cc16" radius={[4, 4, 0, 0]} name="Margin" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory & Consignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Package size={18} className="text-blue-400" />
            Inventory ({totalInventoryItems} items)
          </h2>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {inventory.slice(0, 12).map((item) => (
              <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{item.cardName}</p>
                  <p className="text-[10px] text-slate-500">{item.player} &bull; {item.grade} &bull; Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-white">${item.listPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400">+{item.marginPercent.toFixed(1)}% margin</p>
                </div>
                <span className={`ml-3 text-[10px] px-2 py-0.5 rounded-full ${
                  item.status === 'in-stock' ? 'bg-emerald-500/20 text-emerald-400' :
                  item.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Consignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <RefreshCw size={18} className="text-amber-400" />
            Consignments
          </h2>
          <div className="space-y-3">
            {consignments.map((c) => (
              <div key={c.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                c.status === 'active' ? 'border-amber-500/30' :
                c.status === 'sold' ? 'border-emerald-500/30' :
                c.status === 'pending-payment' ? 'border-blue-500/20' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">{c.itemName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    c.status === 'active' ? 'bg-amber-500/20 text-amber-400' :
                    c.status === 'sold' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'pending-payment' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>{c.status}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {c.consignorName} &bull; {c.commissionPercent}% commission &bull; {c.daysOnConsignment}d
                </p>
                <p className="text-xs text-slate-400 mt-1">List: ${c.listPrice.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Margin Analysis & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Analysis */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-lime" />
            Margin Analysis by Category
          </h2>
          <div className="space-y-3">
            {margins.map((m) => (
              <div key={m.category} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">{m.category}</p>
                  <p className="text-[10px] text-slate-500">{m.itemCount} items &bull; Avg {m.avgDaysToSell}d to sell</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{m.marginPercent}%</p>
                  <p className="text-[10px] text-slate-500">${m.totalMargin.toLocaleString()} margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Top Sellers
          </h2>
          <div className="space-y-3">
            {topSellers.slice(0, 6).map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{t.itemName}</p>
                  <p className="text-[10px] text-slate-500">{t.unitsSold} sold</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-white">${t.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400">{t.avgMargin}% avg margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Store Overview */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Store size={18} className="text-slate-400" />
          Multi-Store Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((s) => (
            <div key={s.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{s.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{s.location}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">Revenue</p>
                  <p className="text-sm font-bold text-emerald-400">${(s.monthlyRevenue / 1000).toFixed(1)}k</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">Inventory</p>
                  <p className="text-sm font-bold text-blue-400">{s.inventoryCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-600">Staff</p>
                  <p className="text-sm font-bold text-white">{s.staffCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;
