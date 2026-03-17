import React, { useState, useMemo } from 'react';
import {
  Store, Package, DollarSign, TrendingUp, AlertTriangle,
  Clock, BarChart3, Zap, ArrowUpDown, Tag, Eye,
} from 'lucide-react';
import {
  getDealerInventory,
  getVenuePerformance,
  getInventoryAlerts,
  getRecentBulkOps,
  getDealerInventoryStats,
  getVenueColor,
  getCategoryLabel,
} from '../lib/dealerInventoryService';

const DealerInventory: React.FC = () => {
  const inventory = useMemo(() => getDealerInventory(), []);
  const venues = useMemo(() => getVenuePerformance(), []);
  const alerts = useMemo(() => getInventoryAlerts(), []);
  const bulkOps = useMemo(() => getRecentBulkOps(), []);
  const stats = useMemo(() => getDealerInventoryStats(), []);
  const [activeTab, setActiveTab] = useState<'inventory' | 'venues' | 'alerts'>('inventory');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Store size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dealer Inventory Management</h1>
              <p className="text-slate-400 text-sm">
                Enterprise-grade inventory with bulk operations, multi-venue listing, and turnover analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Package, color: 'text-orange-400', label: 'Total Items', value: stats.totalItems },
            { icon: DollarSign, color: 'text-emerald-400', label: 'Total Value', value: `$${(stats.totalValue / 1000).toFixed(0)}K` },
            { icon: TrendingUp, color: 'text-green-400', label: 'Unrealized P/L', value: `+$${(stats.unrealizedProfit / 1000).toFixed(0)}K` },
            { icon: BarChart3, color: 'text-blue-400', label: 'Revenue MTD', value: `$${(stats.revenueThisMonth / 1000).toFixed(1)}K` },
            { icon: Clock, color: 'text-amber-400', label: 'Avg Turnover', value: `${stats.avgTurnoverDays}d` },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {(['inventory', 'venues', 'alerts'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'inventory' ? `Inventory (${stats.totalItems})` : tab === 'venues' ? 'Venue Performance' : `Alerts (${alerts.length})`}</button>
          ))}
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-2">
            {inventory.map(item => (
              <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold text-sm">{item.cardName}</h4>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">{getCategoryLabel(item.category)}</span>
                    {item.quantity > 1 && <span className="text-orange-400 text-xs font-bold">x{item.quantity}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Loc: {item.location}</span>
                    <span>{item.daysInInventory}d in inventory</span>
                    {item.listedVenues.length > 0 && (
                      <div className="flex gap-1">
                        {item.listedVenues.map(v => (
                          <span key={v} className={`px-1 py-0.5 rounded text-[10px] font-bold capitalize ${getVenueColor(v)}`}>{v}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1">
                      {item.tags.map(t => <span key={t} className="text-[10px] text-slate-600">#{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Cost</p>
                    <p className="text-white font-bold">${item.costBasis}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Value</p>
                    <p className="text-white font-bold">${item.currentValue}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">P/L</p>
                    <p className={`font-bold ${item.currentValue >= item.costBasis ? 'text-green-400' : 'text-red-400'}`}>
                      {item.currentValue >= item.costBasis ? '+' : ''}{Math.round(((item.currentValue - item.costBasis) / item.costBasis) * 100)}%
                    </p>
                  </div>
                  {item.listedPrice && (
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Listed</p>
                      <p className="text-orange-400 font-bold">${item.listedPrice}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {venues.map(v => (
              <div key={v.venue} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-lg font-bold capitalize ${getVenueColor(v.venue).split(' ')[0]}`}>{v.venue}</span>
                  <span className="text-white font-bold">${v.revenue.toLocaleString()}/mo</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div><p className="text-slate-500 text-[10px] uppercase">Listings</p><p className="text-white font-bold">{v.activeListings}</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Sold/mo</p><p className="text-white font-bold">{v.soldThisMonth}</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Avg Days</p><p className="text-white font-bold">{v.avgDaysToSell}d</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Net Margin</p><p className="text-green-400 font-bold">{v.netMargin}%</p></div>
                </div>
                <p className="text-slate-500 text-xs mt-2">Fee: {v.feePercent}%</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-slate-900 rounded-xl border p-4 flex items-start gap-3 ${
                alert.severity === 'critical' ? 'border-red-500/30' : alert.severity === 'warning' ? 'border-amber-500/30' : 'border-slate-800'
              }`}>
                <AlertTriangle size={16} className={
                  alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                } />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{alert.cardName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                      alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>{alert.type.replace('-', ' ')}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{alert.message}</p>
                  <p className="text-slate-600 text-[10px] mt-1">{alert.timestamp}</p>
                </div>
              </div>
            ))}

            {/* Bulk Operations */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 mt-4">
              <h4 className="text-orange-400 font-semibold text-xs uppercase tracking-wide mb-3">Recent Bulk Operations</h4>
              <div className="space-y-2">
                {bulkOps.map(op => (
                  <div key={op.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <div>
                      <span className="text-white text-xs font-semibold capitalize">{op.type.replace('-', ' ')}</span>
                      <span className="text-slate-500 text-xs ml-2">{op.itemCount} items • by @{op.initiatedBy}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      op.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      op.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{op.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerInventory;
