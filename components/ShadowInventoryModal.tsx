// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  X,
  MapPin,
  Package,
  Store,
  Bell,
  Calendar,
  Users,
  Star,
  Tag,
  Clock,
  ArrowDown,
  ChevronRight,
  Navigation,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import {
  getShows,
  getInventory,
  getDealers,
  getDealAlerts,
  getShowReports,
  CardShow,
  ShowInventoryItem,
  DealerBooth,
  DealAlert,
  ShowReport,
} from '../lib/core/shadowInventoryService';

interface ShadowInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'nearby' | 'inventory' | 'dealers' | 'alerts';

const ShadowInventoryModal: React.FC<ShadowInventoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('nearby');

  const shows = useMemo(() => getShows(), []);
  const inventory = useMemo(() => getInventory(), []);
  const dealers = useMemo(() => getDealers(), []);
  const alerts = useMemo(() => getDealAlerts(), []);
  const reports = useMemo(() => getShowReports(), []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'nearby', label: 'Nearby Shows', icon: <MapPin size={14} />, count: shows.length },
    { id: 'inventory', label: 'Live Inventory', icon: <Package size={14} />, count: inventory.length },
    { id: 'dealers', label: 'Dealer Map', icon: <Store size={14} />, count: dealers.length },
    { id: 'alerts', label: 'Deal Alerts', icon: <Bell size={14} />, count: alerts.length },
  ];

  if (!isOpen) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDistanceMiles = (lat: number, lng: number): number => {
    const userLat = 39.8283;
    const userLng = -98.5795;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 3959;
    const dLat = toRad(lat - userLat);
    const dLng = toRad(lng - userLng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const getPriceLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'fair': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'high': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'light': return 'text-green-400';
      case 'moderate': return 'text-amber-400';
      case 'packed': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const renderNearbyShows = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{shows.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Upcoming Shows</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{shows.reduce((s, sh) => s + sh.dealerCount, 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Dealers</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{reports.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Field Reports</div>
        </div>
      </div>

      {shows.map((show: CardShow) => {
        const miles = getDistanceMiles(show.lat, show.lng);
        const days = daysUntil(show.date);
        const report = reports.find((r: ShowReport) => r.showId === show.id);
        return (
          <div key={show.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">{show.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={12} className="text-amber-400" />
                  <span className="text-xs text-slate-400">{show.venue}, {show.city}, {show.state}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-amber-400">{miles} mi</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${days <= 14 ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' : 'text-slate-400 bg-slate-800 border-slate-600'}`}>
                  {days > 0 ? `${days} days away` : 'Now'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>{formatDate(show.date)} - {formatDate(show.endDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Store size={11} />
                <span>{show.dealerCount} dealers</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={11} />
                <span>{reports.filter((r: ShowReport) => r.showId === show.id).length} reports</span>
              </div>
            </div>
            {report && (
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={11} className="text-amber-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Latest Report by {report.reporter}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-slate-300">Crowd:</span>
                  <span className={`text-xs font-medium capitalize ${getCrowdColor(report.crowdLevel)}`}>{report.crowdLevel}</span>
                  <span className="text-xs text-slate-300">Pricing:</span>
                  <span className={`text-xs font-medium ${report.overallPricing === 'below_market' ? 'text-green-400' : report.overallPricing === 'at_market' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {report.overallPricing.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{report.notes}</p>
                {report.bestFind && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">{report.bestFind}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderLiveInventory = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{inventory.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Spotted Items</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{inventory.filter((i: ShowInventoryItem) => i.askingPrice < i.estimatedMarketValue).length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Below Market</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            ${Math.round(inventory.reduce((s: number, i: ShowInventoryItem) => s + (i.estimatedMarketValue - i.askingPrice), 0)).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Savings</div>
        </div>
      </div>

      <div className="space-y-3">
        {inventory.map((item: ShowInventoryItem) => {
          const discount = Math.round(((item.estimatedMarketValue - item.askingPrice) / item.estimatedMarketValue) * 100);
          const show = shows.find((s: CardShow) => s.id === item.showId);
          return (
            <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-orange-500/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold text-sm">{item.player}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.cardDescription}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${item.condition === 'graded' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' : 'text-slate-400 bg-slate-800 border-slate-600'}`}>
                    {item.condition === 'graded' ? 'Graded' : 'Raw'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Asking</div>
                    <div className="text-sm font-bold text-white">${item.askingPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Market</div>
                    <div className="text-sm font-bold text-slate-400">${item.estimatedMarketValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Discount</div>
                    <div className={`text-sm font-bold ${discount > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                      {discount > 0 ? `-${discount}%` : `+${Math.abs(discount)}%`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-2 mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Store size={11} className="text-amber-400" />
                    <span>Booth {item.boothNumber}</span>
                  </div>
                  {show && (
                    <div className="flex items-center gap-1">
                      <MapPin size={11} />
                      <span>{show.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>{formatTime(item.reportedAt)} by {item.reportedBy}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDealerMap = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{dealers.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Tracked Dealers</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{(dealers.reduce((s: number, d: DealerBooth) => s + d.rating, 0) / dealers.length).toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Rating</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{dealers.filter((d: DealerBooth) => d.willingToNegotiate).length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Negotiable</div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Show Floor Map</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {['A', 'B', 'C', 'D', 'E', 'F'].map((row) => (
            Array.from({ length: 6 }, (_, i) => {
              const booth = `${row}-${String((i + 1) * 5).padStart(2, '0')}`;
              const dealer = dealers.find((d: DealerBooth) => d.boothNumber.startsWith(row));
              const isOccupied = dealer && dealer.boothNumber[0] === row;
              return (
                <div
                  key={`${row}-${i}`}
                  className={`h-8 rounded text-[8px] flex items-center justify-center font-mono ${
                    isOccupied
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : 'bg-slate-800 border border-slate-700/30 text-slate-600'
                  }`}
                >
                  {booth}
                </div>
              );
            })
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {dealers.map((dealer: DealerBooth) => {
          const show = shows.find((s: CardShow) => s.id === dealer.showId);
          return (
            <div key={dealer.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-orange-500/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold text-sm">{dealer.dealerName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Booth {dealer.boothNumber} {show ? `at ${show.name}` : ''}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getPriceLevelColor(dealer.priceLevel)}`}>
                  {dealer.priceLevel}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Tag size={11} className="text-amber-400" />
                  <span className="text-xs text-slate-300">{dealer.specialty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-white font-medium">{dealer.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {dealer.willingToNegotiate ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                    <CheckCircle2 size={10} /> Negotiable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-slate-700/40 text-slate-400 border border-slate-600 rounded-full">
                    <ShieldCheck size={10} /> Firm Pricing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDealAlerts = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{alerts.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Active Alerts</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {alerts.length > 0 ? Math.round(alerts.reduce((s: number, a: DealAlert) => s + a.discount, 0) / alerts.length) : 0}%
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Discount</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            ${alerts.reduce((s: number, a: DealAlert) => s + (a.marketValue - a.askingPrice), 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Savings</div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
          <Bell size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No unclaimed deal alerts at the moment</p>
          <p className="text-xs text-slate-500 mt-1">Alerts are generated when items are spotted at 15%+ below market value</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: DealAlert) => {
            const show = shows.find((s: CardShow) => s.id === alert.showId);
            return (
              <div key={alert.id} className="bg-slate-800/40 border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/15 rounded-lg">
                      <AlertTriangle size={14} className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{alert.player}</h3>
                      <p className="text-xs text-slate-400">{alert.cardDescription}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">-{alert.discount.toFixed(1)}%</div>
                    <div className="text-[10px] text-slate-500">below market</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 my-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Asking</div>
                    <div className="text-base font-bold text-white">${alert.askingPrice.toLocaleString()}</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 mt-3" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Market Value</div>
                    <div className="text-base font-bold text-slate-400">${alert.marketValue.toLocaleString()}</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 mt-3" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">You Save</div>
                    <div className="text-base font-bold text-green-400">${(alert.marketValue - alert.askingPrice).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Store size={11} className="text-amber-400" />
                      <span>Booth {alert.boothNumber}</span>
                    </div>
                    {show && (
                      <div className="flex items-center gap-1">
                        <MapPin size={11} />
                        <span>{show.city}, {show.state}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{formatTime(alert.alertedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <MapPin size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Navigation size={10} />
                  Show Intel
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-wide text-white">
                Shadow <span className="text-amber-400">Inventory</span> Network
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 border-b border-slate-700/50">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-amber-400 border-amber-400 bg-amber-400/5'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'nearby' && renderNearbyShows()}
          {activeTab === 'inventory' && renderLiveInventory()}
          {activeTab === 'dealers' && renderDealerMap()}
          {activeTab === 'alerts' && renderDealAlerts()}
        </div>
      </div>
    </div>
  );
};

export default ShadowInventoryModal;
