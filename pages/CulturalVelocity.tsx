import React, { useState, useMemo } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Activity,
  Film,
  Music,
  Globe,
  Users,
  Target,
  AlertTriangle,
} from 'lucide-react';
import {
  getCulturalEvents,
  getVelocityStats,
  getDomainColor,
  getPhaseColor,
  getPhaseLabel,
  type CulturalEvent,
  type CulturalDomain,
} from '../lib/analytics/culturalVelocityService';

const DOMAIN_ICONS: Record<CulturalDomain, React.ReactNode> = {
  film: <Film size={14} />,
  music: <Music size={14} />,
  'social-media': <Globe size={14} />,
  politics: <Users size={14} />,
  fashion: <Zap size={14} />,
  gaming: <Target size={14} />,
  documentary: <Eye size={14} />,
  streaming: <Activity size={14} />,
};

const CulturalVelocity: React.FC = () => {
  const events = useMemo(() => getCulturalEvents(), []);
  const stats = useMemo(() => getVelocityStats(), []);
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [domainFilter, setDomainFilter] = useState<CulturalDomain | 'all'>('all');

  const filtered = domainFilter === 'all' ? events : events.filter(e => e.domain === domainFilter);
  const domains: CulturalDomain[] = ['film', 'music', 'social-media', 'documentary', 'streaming', 'gaming', 'politics', 'fashion'];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Zap size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cultural Velocity Tracker</h1>
              <p className="text-slate-400 text-sm">
                How cultural moments create price shocks across the card market
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-orange-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Active Catalysts</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeCatalysts}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Pre-Catalysts</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{stats.preCatalysts}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">At Peak</span>
            </div>
            <p className="text-amber-400 font-bold text-3xl">{stats.peakEvents}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Opportunities</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalOpportunities}</p>
          </div>
        </div>

        {/* Domain Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              domainFilter === 'all' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            All
          </button>
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1 ${
                domainFilter === d ? `${getDomainColor(d)} border border-current/50` : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {DOMAIN_ICONS[d]}
              {d.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
              className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-orange-500/50 ${
                selectedEvent?.id === event.id ? 'border-orange-500/70 ring-1 ring-orange-500/30' : 'border-slate-800'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 text-xs font-bold ${getDomainColor(event.domain)}`}>
                        {DOMAIN_ICONS[event.domain]}
                        {event.domain.replace('-', ' ')}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className={`text-xs font-bold ${getPhaseColor(event.phase)}`}>
                        {getPhaseLabel(event.phase)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{event.title}</h3>
                  </div>
                  <div className="text-right ml-4">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-700 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{event.velocityScore}</span>
                    </div>
                    <p className="text-slate-500 text-[10px] mt-1">velocity</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
                  <span className={event.priceImpact >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {event.priceImpact >= 0 ? '+' : ''}{event.priceImpact}% price impact
                  </span>
                  <span>{(event.reachEstimate / 1_000_000).toFixed(1)}M reach</span>
                  <span>{event.confidence}% conf</span>
                </div>

                <div className="bg-slate-800/50 rounded px-3 py-2">
                  <p className="text-slate-400 text-xs">
                    <Clock size={12} className="inline mr-1" />
                    Monetization window: <span className="text-orange-400 font-semibold">{event.monetizationWindow}</span>
                  </p>
                </div>
              </div>

              {selectedEvent?.id === event.id && (
                <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                  <h4 className="text-orange-400 font-semibold text-xs uppercase tracking-wide mb-3">Affected Players & Sets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {event.affectedPlayers.map((p, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-white text-sm">{p.name}</span>
                            <span className="text-slate-500 text-xs ml-2">{p.sport}</span>
                          </div>
                          <span className={`text-sm font-bold ${p.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {p.priceChange >= 0 ? '+' : ''}{p.priceChange}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase mb-2">Affected Sets</p>
                      <div className="flex flex-wrap gap-1">
                        {event.affectedSets.map((s, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">{s}</span>
                        ))}
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className="text-slate-500 text-xs">Detected: {event.detectedDate}</p>
                        <p className="text-slate-500 text-xs">Peak: {event.peakDate}</p>
                        <p className="text-slate-500 text-xs">Est. duration: {event.estimatedDuration}</p>
                        <p className="text-slate-500 text-xs">Source: {event.source}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CulturalVelocity;
