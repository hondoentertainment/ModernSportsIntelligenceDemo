import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Wifi,
  WifiOff,
  DollarSign,
  ShoppingBag,
  Calendar,
  Star,
  BarChart3,
  ScanLine,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { preferRealCompsWhenConfigured, isFeatureEnabled } from '../lib/featureFlags';
import {
  getUpcomingShows,
  getShowHaul,
  getAllDeals,
  getOfflineStatus,
  getShowVendors,
  getShowChecklist,
  type CardShow,
  type ShowHaul,
  type ShowDeal,
  type OfflineSyncStatus,
  type ShowVendor,
  type ShowChecklist,
} from '../lib/utils/cardShowModeService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const CardShowModePage: React.FC = () => {
  const [shows, setShows] = useState<CardShow[]>([]);
  const [haul, setHaul] = useState<ShowHaul | null>(null);
  const [deals, setDeals] = useState<ShowDeal[]>([]);
  const [offlineStatus, setOfflineStatus] = useState<OfflineSyncStatus | null>(null);
  const [vendors, setVendors] = useState<ShowVendor[]>([]);
  const [_checklist, setChecklist] = useState<ShowChecklist[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const upcomingShows = getUpcomingShows();
      setShows(upcomingShows);
      setDeals(getAllDeals());
      setHaul(getShowHaul());
      setOfflineStatus(getOfflineStatus());
      setVendors(getShowVendors());
      setChecklist(getShowChecklist());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const selectedHaul = useMemo(() => {
    if (!selectedShowId) return haul;
    return getShowHaul(selectedShowId);
  }, [selectedShowId, haul]);

  const categoryChartData = useMemo(() => {
    if (!selectedHaul) return [];
    return selectedHaul.categoryBreakdown.map(c => ({
      name: c.category,
      spent: c.spent,
      value: c.value,
      count: c.count,
    }));
  }, [selectedHaul]);

  const popularityColor = (pop: string) => {
    switch (pop) {
      case 'mega': return 'text-fuchsia-400 bg-fuchsia-500/10';
      case 'high': return 'text-amber-400 bg-amber-500/10';
      case 'medium': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Card Show Field Mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <MapPin size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Card Show Field Mode</h1>
            <p className="text-sm text-slate-400">
              Floor loop: scan → price → cert check → book the deal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {offlineStatus && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${
              offlineStatus.isOnline
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {offlineStatus.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {offlineStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">Floor loop</p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/collection"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-600 text-xs font-bold text-slate-100 hover:border-brand-lime/50"
          >
            <ScanLine size={14} className="text-brand-lime" />
            Scan / price in Collection
          </Link>
          <Link
            to="/grading-vision-engine"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-600 text-xs font-bold text-slate-100 hover:border-brand-lime/50"
          >
            <ShieldCheck size={14} className="text-cyan-300" />
            Cert / grade check
            {!isFeatureEnabled('USE_REAL_PSA') && (
              <span className="text-[9px] uppercase text-amber-300">demo PSA</span>
            )}
          </Link>
          <Link
            to="/war-room"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-600 text-xs font-bold text-slate-100 hover:border-brand-lime/50"
          >
            <Activity size={14} className="text-fuchsia-300" />
            War Room thesis
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-emerald-100/80">
          Live comps: {preferRealCompsWhenConfigured() ? 'ON (eBay flag)' : 'OFF — mock/stale labels until VITE_FF_REAL_EBAY'}
          {' · '}
          PSA: {isFeatureEnabled('USE_REAL_PSA') ? 'live' : 'demo badges'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Upcoming Shows</p>
          <p className="text-3xl font-bold text-blue-400">{shows.length}</p>
          <p className="text-xs text-slate-600 mt-1">in your area</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Deals</p>
          <p className="text-3xl font-bold text-emerald-400">{deals.length}</p>
          <p className="text-xs text-slate-600 mt-1">cards acquired</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-amber-400">${haul?.totalSpent.toLocaleString() ?? '0'}</p>
          <p className="text-xs text-slate-600 mt-1">across all shows</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Overall ROI</p>
          <p className={`text-3xl font-bold ${(haul?.profitLossPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {(haul?.profitLossPercent ?? 0) >= 0 ? '+' : ''}{(haul?.profitLossPercent ?? 0).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-600 mt-1">profit / loss</p>
        </div>
      </div>

      {/* Nearby Shows */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-400" />
          Nearby &amp; Upcoming Shows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map(show => (
            <button
              key={show.id}
              onClick={() => setSelectedShowId(selectedShowId === show.id ? null : show.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedShowId === show.id
                  ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                  : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${popularityColor(show.popularity)}`}>
                  {show.popularity}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin size={10} /> {show.distanceMiles} mi
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1 truncate">{show.name}</p>
              <p className="text-xs text-slate-400 mb-1">{show.location}</p>
              <p className="text-[10px] text-slate-500 mb-2">{show.startDate} &mdash; {show.endDate}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{show.expectedVendors} vendors</span>
                <span className="text-emerald-400">${show.admission} entry</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {show.features.slice(0, 2).map(f => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deal Tracker & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <ShoppingBag size={18} className="text-emerald-400" />
            Deal Tracker {selectedShowId ? `- ${shows.find(s => s.id === selectedShowId)?.name}` : '- All Shows'}
          </h2>
          {selectedHaul && selectedHaul.deals.length > 0 ? (
            <div className="space-y-3">
              {selectedHaul.deals.slice(0, 8).map(deal => {
                const margin = ((deal.estimatedValue - deal.purchasePrice) / deal.purchasePrice) * 100;
                return (
                  <div key={deal.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className={margin >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                        <p className="text-sm font-bold text-white truncate">{deal.cardName}</p>
                      </div>
                      <span className={`text-sm font-bold ${margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{deal.vendorName} &middot; {deal.category} {deal.grade ? `&middot; ${deal.grade}` : ''}</span>
                      <span>Paid ${deal.purchasePrice.toLocaleString()} &rarr; Est ${deal.estimatedValue.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <ShoppingBag size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No deals recorded for this show yet</p>
            </div>
          )}
        </div>

        {/* Category Breakdown Chart */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-400" />
            Category Breakdown
          </h2>
          {categoryChartData.length > 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="spent" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Spent" />
                    <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} name="Est. Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" /> Spent</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded" /> Est. Value</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-500 text-xs">No category data available</p>
            </div>
          )}

          {/* Vendors */}
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            Top Vendors
          </h2>
          <div className="space-y-2">
            {vendors.slice(0, 5).map(vendor => (
              <div key={vendor.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-white">{vendor.name}</p>
                  <span className="text-[10px] text-slate-500">Booth {vendor.boothNumber}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: vendor.reputation }).map((_, i) => (
                    <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offline Sync Status */}
      {offlineStatus && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            {offlineStatus.isOnline ? <Wifi size={18} className="text-emerald-400" /> : <WifiOff size={18} className="text-red-400" />}
            Offline Sync Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase mb-1">Cached Shows</p>
              <p className="text-xl font-bold text-blue-400">{offlineStatus.cachedShows}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase mb-1">Cached Comps</p>
              <p className="text-xl font-bold text-purple-400">{offlineStatus.cachedComps}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase mb-1">Pending Uploads</p>
              <p className="text-xl font-bold text-amber-400">{offlineStatus.pendingUploads}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase mb-1">Cache Size</p>
              <p className="text-xl font-bold text-slate-300">{offlineStatus.cacheSize}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-slate-700 rounded-full">
              <div
                className="h-full bg-brand-lime rounded-full transition-all"
                style={{ width: `${offlineStatus.syncProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Sync: {offlineStatus.syncProgress}% &middot; Last sync: {new Date(offlineStatus.lastSyncTimestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardShowModePage;
