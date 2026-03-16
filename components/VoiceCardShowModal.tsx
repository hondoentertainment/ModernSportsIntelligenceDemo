import React, { useState, useMemo } from 'react';
import {
  X,
  Mic,
  MicOff,
  Radio,
  MapPin,
  ScanLine,
  Star,
  Calendar,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Flame,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import {
  getCardShows,
  getVoiceHistory,
  getVendorProfiles,
  getLiveScans,
  getCrowdHeatmap,
  getCompanionStats,
  getNegotiationRange,
  CardShowEvent,
  VoiceCommand,
  VendorProfile,
  LiveScan,
  CrowdHeatzone,
} from '../lib/voiceCardShowService';

interface VoiceCardShowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'assistant' | 'vendors' | 'history' | 'schedule';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'assistant', label: 'Live Assistant', icon: <Mic size={16} /> },
  { id: 'vendors', label: 'Vendor Map', icon: <MapPin size={16} /> },
  { id: 'history', label: 'Scan History', icon: <ScanLine size={16} /> },
  { id: 'schedule', label: 'Show Schedule', icon: <Calendar size={16} /> },
];

const recColors: Record<string, { text: string; bg: string; border: string }> = {
  'strong-buy': { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  buy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  hold: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  pass: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const densityColors: Record<string, { text: string; bg: string }> = {
  low: { text: 'text-green-400', bg: 'bg-green-500/20' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
  high: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
  packed: { text: 'text-red-400', bg: 'bg-red-500/20' },
};

const commandTypeColors: Record<string, string> = {
  identify: 'bg-blue-500/20 text-blue-400',
  'price-check': 'bg-green-500/20 text-green-400',
  negotiate: 'bg-orange-500/20 text-orange-400',
  compare: 'bg-purple-500/20 text-purple-400',
  'add-to-cart': 'bg-emerald-500/20 text-emerald-400',
  'portfolio-check': 'bg-cyan-500/20 text-cyan-400',
};

// ---- Live Assistant Tab ----

const LiveAssistantTab: React.FC = () => {
  const [listening, setListening] = useState(false);
  const voiceHistory = useMemo(() => getVoiceHistory(), []);
  const scans = useMemo(() => getLiveScans(), []);
  const recentCommands = voiceHistory.slice(0, 4);
  const latestScan = scans[0];
  const negotiation = latestScan ? getNegotiationRange(latestScan.marketValue) : null;

  return (
    <div className="space-y-5">
      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setListening(!listening)}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            listening
              ? 'bg-orange-500 shadow-lg shadow-orange-500/40 animate-pulse'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {listening ? (
            <Volume2 size={36} className="text-white" />
          ) : (
            <Mic size={36} className="text-slate-300" />
          )}
          {listening && (
            <span className="absolute inset-0 rounded-full border-4 border-orange-400/40 animate-ping" />
          )}
        </button>
        <p className="text-xs text-slate-400">
          {listening ? 'Listening... say a command' : 'Tap to activate voice assistant'}
        </p>
      </div>

      {/* Recent Transcript */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Recent Commands
        </h4>
        <div className="space-y-2">
          {recentCommands.map(cmd => (
            <div
              key={cmd.id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${commandTypeColors[cmd.commandType]}`}
                >
                  {cmd.commandType.replace('-', ' ')}
                </span>
                <span className="text-[10px] text-slate-500">
                  {Math.round(cmd.confidence * 100)}% conf
                </span>
              </div>
              <p className="text-xs text-slate-300 italic mb-1">&ldquo;{cmd.transcript}&rdquo;</p>
              <p className="text-xs text-slate-400">{cmd.result}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Scan Result Card */}
      {latestScan && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Latest Scan Result
          </h4>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-100">{latestScan.cardIdentified}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                  recColors[latestScan.recommendation].text
                } ${recColors[latestScan.recommendation].bg} ${
                  recColors[latestScan.recommendation].border
                }`}
              >
                {latestScan.recommendation.replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Grade</p>
                <p className="text-sm font-bold text-slate-200">{latestScan.estimatedGrade}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Market Value</p>
                <p className="text-sm font-bold text-orange-400">
                  ${latestScan.marketValue.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Exposure</p>
                <p className="text-sm font-bold text-slate-200">
                  {latestScan.portfolioExposure}%
                </p>
              </div>
            </div>

            {/* Negotiation Range */}
            {negotiation && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-2">Negotiation Range</p>
                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 bg-gradient-to-r from-green-500 to-orange-500 rounded-full"
                    style={{
                      left: `${((negotiation.floor / latestScan.marketValue) * 100) - 10}%`,
                      right: `${100 - ((negotiation.ceiling / latestScan.marketValue) * 100) - 5}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-green-400">Floor: ${negotiation.floor.toLocaleString()}</span>
                  <span className="text-slate-400">Open: ${negotiation.openingOffer.toLocaleString()}</span>
                  <span className="text-orange-400">Ceiling: ${negotiation.ceiling.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Vendor Map Tab ----

const VendorMapTab: React.FC = () => {
  const shows = useMemo(() => getCardShows(), []);
  const activeShow = shows.find(s => s.status === 'live') ?? shows[0];
  const vendors = useMemo(() => getVendorProfiles(activeShow.id), [activeShow]);
  const heatzones = useMemo(() => getCrowdHeatmap(activeShow.id), [activeShow]);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const fairnessColor = (pct: number) => {
    if (pct <= -0.05) return 'text-green-400';
    if (pct <= 0.05) return 'text-amber-400';
    return 'text-red-400';
  };

  const fairnessLabel = (pct: number) => {
    if (pct <= -0.05) return 'Below Market';
    if (pct <= 0.05) return 'At Market';
    return 'Above Market';
  };

  return (
    <div className="space-y-5">
      {/* Crowd Density Zones */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Crowd Density
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {heatzones.map(zone => (
            <div
              key={zone.zone}
              className={`p-3 rounded-xl border border-slate-700/60 ${densityColors[zone.density].bg}`}
            >
              <p className="text-xs font-semibold text-slate-200 truncate">{zone.zone}</p>
              <div className="flex items-center justify-between mt-1">
                <span
                  className={`text-[10px] font-bold uppercase ${densityColors[zone.density].text}`}
                >
                  {zone.density}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Flame size={10} /> {zone.hotDeals} deals
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={10} /> Best: {zone.bestTime}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Vendors ({vendors.length})
        </h4>
        <div className="space-y-2">
          {vendors.map(vendor => (
            <div
              key={vendor.id}
              className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)
                }
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-bold text-orange-400">
                      {vendor.boothNumber}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{vendor.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={
                            i < Math.round(vendor.reputationScore)
                              ? 'text-orange-400 fill-orange-400'
                              : 'text-slate-600'
                          }
                        />
                      ))}
                      <span className="text-[10px] text-slate-500 ml-1">
                        {vendor.reputationScore}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold ${fairnessColor(vendor.avgPriceVsMarket)}`}>
                    {fairnessLabel(vendor.avgPriceVsMarket)}
                  </span>
                  {expandedVendor === vendor.id ? (
                    <ChevronUp size={14} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-500" />
                  )}
                </div>
              </button>

              {expandedVendor === vendor.id && (
                <div className="px-3 pb-3 border-t border-slate-700/40 pt-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vendor.specialties.map(s => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500">Deals</p>
                      <p className="text-xs font-bold text-slate-200">{vendor.dealHistory}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Response</p>
                      <p className="text-xs font-bold text-slate-200">
                        {Math.round(vendor.responseRate * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Vs Market</p>
                      <p className={`text-xs font-bold ${fairnessColor(vendor.avgPriceVsMarket)}`}>
                        {vendor.avgPriceVsMarket > 0 ? '+' : ''}
                        {Math.round(vendor.avgPriceVsMarket * 100)}%
                      </p>
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

// ---- Scan History Tab ----

const ScanHistoryTab: React.FC = () => {
  const scans = useMemo(() => getLiveScans(), []);

  const actionLabel = (rec: string) => {
    switch (rec) {
      case 'strong-buy':
        return 'Purchased';
      case 'buy':
        return 'Negotiating';
      case 'hold':
        return 'Watchlist';
      case 'pass':
        return 'Passed';
      default:
        return rec;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Scans ({scans.length})
        </h4>
      </div>
      {scans.map(scan => (
        <div
          key={scan.id}
          className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex gap-3"
        >
          {/* Thumbnail Placeholder */}
          <div className="flex-shrink-0 w-14 h-20 bg-slate-700/80 rounded-lg flex items-center justify-center">
            <ScanLine size={18} className="text-slate-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {scan.cardIdentified}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{scan.playerName}</p>

            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="text-slate-300 font-medium">{scan.estimatedGrade}</span>
              <span className="text-orange-400 font-bold">
                ${scan.marketValue.toLocaleString()}
              </span>
              <span className="text-slate-500">
                Floor: ${scan.negotiationFloor.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  recColors[scan.recommendation].text
                } ${recColors[scan.recommendation].bg} ${recColors[scan.recommendation].border}`}
              >
                {scan.recommendation.replace('-', ' ')}
              </span>
              <span className="text-[10px] text-slate-500">{actionLabel(scan.recommendation)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Show Schedule Tab ----

const ShowScheduleTab: React.FC = () => {
  const shows = useMemo(() => getCardShows(), []);
  const stats = useMemo(() => getCompanionStats(), []);

  const upcoming = shows.filter(s => s.status === 'upcoming');
  const live = shows.filter(s => s.status === 'live');
  const completed = shows.filter(s => s.status === 'completed');

  const statusBadge = (status: CardShowEvent['status']) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
            <Radio size={10} className="animate-pulse" /> LIVE
          </span>
        );
      case 'upcoming':
        return (
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
            Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-full">
            Completed
          </span>
        );
    }
  };

  const renderShow = (show: CardShowEvent) => (
    <div
      key={show.id}
      className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-100">{show.name}</span>
        {statusBadge(show.status)}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {show.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} /> {show.date}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 text-center">
        <div className="bg-slate-800/80 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">Vendors</p>
          <p className="text-sm font-bold text-slate-200">{show.vendorCount}</p>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">Expected</p>
          <p className="text-sm font-bold text-slate-200">
            {show.estimatedAttendance.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Shows</p>
          <p className="text-lg font-bold text-slate-100">{stats.showsAttended}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Deals</p>
          <p className="text-lg font-bold text-slate-100">{stats.dealsCompleted}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Avg Discount</p>
          <p className="text-lg font-bold text-orange-400">{stats.avgNegotiationDiscount}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Vendors Rated</p>
          <p className="text-lg font-bold text-slate-100">{stats.vendorsRated}</p>
        </div>
      </div>

      {/* Live */}
      {live.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
            Live Now
          </h4>
          <div className="space-y-2">{live.map(renderShow)}</div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            Upcoming
          </h4>
          <div className="space-y-2">{upcoming.map(renderShow)}</div>
        </div>
      )}

      {/* Past */}
      {completed.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Past Shows
          </h4>
          <div className="space-y-2">{completed.map(renderShow)}</div>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

const VoiceCardShowModal: React.FC<VoiceCardShowModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('assistant');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-orange-500/10 to-slate-900 p-6 border-b border-slate-700/60">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/20">
              <Mic size={24} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Voice Card Show Companion
              </h2>
              <p className="text-sm text-slate-400">
                Hands-free AI assistant for live card show negotiations
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/60 bg-slate-900/50 px-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'assistant' && <LiveAssistantTab />}
          {activeTab === 'vendors' && <VendorMapTab />}
          {activeTab === 'history' && <ScanHistoryTab />}
          {activeTab === 'schedule' && <ShowScheduleTab />}
        </div>
      </div>
    </div>
  );
};

export default VoiceCardShowModal;
