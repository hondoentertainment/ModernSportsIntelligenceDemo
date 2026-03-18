import React, { useState, useMemo } from 'react';
import { X, MapPin, Calendar, Users, Star, DollarSign, Navigation, Store } from 'lucide-react';
import { getShows, getDealerBooths } from '../lib/utils/cardShowNavigatorService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CardShowNavigatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('shows');
  const shows = useMemo(() => getShows(), []);
  const booths = useMemo(() => getDealerBooths(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'shows', label: 'Shows', count: shows.length },
    { id: 'routing', label: 'Routing', count: booths.length },
  ];

  const getTierColor = (tier: string) => {
    if (tier === 'national') return 'text-amber-400 bg-amber-400/10';
    if (tier === 'regional') return 'text-emerald-400 bg-emerald-400/10';
    return 'text-slate-400 bg-slate-400/10';
  };

  const getPriceColor = (level: string) => {
    if (level === 'ultra-premium') return 'text-amber-400';
    if (level === 'premium') return 'text-violet-400';
    if (level === 'mid') return 'text-blue-400';
    return 'text-slate-400';
  };

  const formatDistance = (d: number) => d >= 100 ? `${d} mi` : `${d} mi`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Card Show Navigator</h2>
              <p className="text-sm text-slate-400">Discover shows, plan routes, and find dealers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'shows' && (
            <div className="space-y-4">
              {shows.map((show) => (
                <div key={show.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{show.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>{show.city}, {show.state}</span>
                        <span className="text-slate-600">|</span>
                        <Navigation className="w-3 h-3" />
                        <span>{formatDistance(show.distance)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTierColor(show.tier)}`}>
                        {show.tier}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-white text-sm">{show.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Dates</div>
                      <div className="text-emerald-400 font-medium text-xs">
                        {new Date(show.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {show.startDate !== show.endDate && ` - ${new Date(show.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Dealers</div>
                      <div className="text-white font-bold">{show.dealers}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Attendance</div>
                      <div className="text-white font-bold">{show.attendance >= 1000 ? `${(show.attendance / 1000).toFixed(0)}K` : show.attendance}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Entry Fee</div>
                      <div className="text-slate-300 font-bold">${show.entryFee}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Location</div>
                      <div className="text-slate-300 text-xs font-medium truncate">{show.location}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {show.highlights.map((h) => (
                      <span key={h} className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-300 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'routing' && (
            <div className="space-y-3">
              {booths.map((booth) => {
                const show = shows.find(s => s.id === booth.showId);
                return (
                  <div key={booth.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-emerald-400" />
                        <div>
                          <h4 className="text-white font-semibold">{booth.dealerName}</h4>
                          <span className="text-xs text-slate-500">Booth {booth.boothNumber} — {show?.name || 'Unknown Show'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium capitalize ${getPriceColor(booth.priceLevel)}`}>
                          {booth.priceLevel}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-white text-sm">{booth.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {booth.specialties.map((s) => (
                        <span key={s} className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>Inventory: {booth.inventoryHighlights.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={booth.acceptsOffers ? 'text-emerald-400' : 'text-slate-500'}>
                        {booth.acceptsOffers ? 'Accepts offers' : 'Fixed prices'}
                      </span>
                      <span className={booth.hasGradedCards ? 'text-blue-400' : 'text-slate-500'}>
                        {booth.hasGradedCards ? 'Has graded cards' : 'Raw only'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardShowNavigatorModal;
