// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  X,
  CloudRain,
  Thermometer,
  Wind,
  MapPin,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getWeatherGameImpacts,
  getHistoricWeatherEvents,
  getVenueProfiles,
  getWeatherAlerts,
  getConditionColor,
  getConditionLabel,
  getStatusColor,
  getRecommendationConfig,
  WeatherGameImpact,
  HistoricWeatherEvent,
  VenueWeatherProfile,
  WeatherAlertCard,
} from '../lib/analytics/weatherImpactService';

interface WeatherImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'forecast' | 'historic' | 'venues' | 'alerts';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'forecast', label: 'Forecast', icon: <CloudRain size={16} /> },
  { id: 'historic', label: 'Historic Events', icon: <Award size={16} /> },
  { id: 'venues', label: 'Venue Profiles', icon: <Building2 size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <ShieldAlert size={16} /> },
];

// ---- Tab Components ----

const ForecastTab: React.FC<{ games: WeatherGameImpact[] }> = ({ games }) => (
  <div className="space-y-4">
    {games.map(game => {
      const condColor = getConditionColor(game.weather.condition);
      const statusColor = getStatusColor(game.gameStatus);

      return (
        <div key={game.gameId} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Game Header */}
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${condColor.bg} border ${condColor.border}`}>
                {game.weather.condition === 'snow' || game.weather.condition === 'extreme_cold' ? (
                  <Thermometer className={`w-4 h-4 ${condColor.text}`} />
                ) : game.weather.condition === 'wind' ? (
                  <Wind className={`w-4 h-4 ${condColor.text}`} />
                ) : (
                  <CloudRain className={`w-4 h-4 ${condColor.text}`} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{game.teams}</h4>
                <p className="text-xs text-slate-400">{game.venue} &middot; {game.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${condColor.bg} ${condColor.text} ${condColor.border}`}>
                {getConditionLabel(game.weather.condition)}
              </span>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                {game.gameStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Weather Details */}
          <div className="p-4 grid grid-cols-4 gap-3 border-b border-slate-700/50">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Temp</p>
              <p className="text-lg font-bold text-white">{game.weather.temp}°F</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Wind</p>
              <p className="text-lg font-bold text-white">{game.weather.windSpeed} mph</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Humidity</p>
              <p className="text-lg font-bold text-white">{game.weather.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Precip</p>
              <p className="text-lg font-bold text-white">{game.weather.precipitation}"</p>
            </div>
          </div>

          {/* Card Impacts */}
          <div className="p-4 space-y-2">
            {game.cardImpact.map((impact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">{impact.player}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${condColor.bg} ${condColor.text}`}>
                      {impact.impactType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{impact.description}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ml-3 flex items-center gap-1 ${
                  impact.valueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {impact.valueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {impact.valueChange >= 0 ? '+' : ''}{impact.valueChange}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const HistoricTab: React.FC<{ events: HistoricWeatherEvent[] }> = ({ events }) => (
  <div className="space-y-4">
    {events.map(event => {
      const condColor = getConditionColor(event.weather.condition);

      return (
        <div key={event.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Event Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">{event.event}</h4>
              <span className="text-2xl font-black text-emerald-400">{event.memorabiliaMultiplier}x</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {event.date}
              </span>
              <span className={`flex items-center gap-1 ${condColor.text}`}>
                <Thermometer className="w-3 h-3" /> {event.weather.temp}°F
              </span>
              <span className={`flex items-center gap-1 ${condColor.text}`}>
                <Wind className="w-3 h-3" /> {event.weather.windSpeed} mph
              </span>
              <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${condColor.bg} ${condColor.text}`}>
                {getConditionLabel(event.weather.condition)}
              </span>
            </div>
          </div>

          {/* Affected Cards */}
          <div className="p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-3">
              Affected Cards &amp; Premiums
            </p>
            <div className="space-y-2">
              {event.affectedCards.map((card, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <div>
                    <p className="text-sm font-semibold text-white">{card.player}</p>
                    <p className="text-xs text-slate-400">{card.card}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{card.premiumPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const VenueTab: React.FC<{ venues: VenueWeatherProfile[] }> = ({ venues }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const typeColor = (type: string) => {
    if (type === 'dome') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (type === 'retractable') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="space-y-3">
      {venues.map(venue => {
        const isExpanded = expanded === venue.venue;
        return (
          <div key={venue.venue} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : venue.venue)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">{venue.venue}</h4>
                  <p className="text-xs text-slate-400">{venue.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${typeColor(venue.type)}`}>
                  {venue.type}
                </span>
                <span className="text-xs text-slate-400">
                  {venue.rainDelayFrequency}% delays
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 pt-0 space-y-4">
                {/* Monthly Temps */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                    Average Temps by Month
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(venue.avgTemp).map(([month, temp]) => (
                      <div key={month} className="bg-slate-900/50 rounded-lg px-3 py-2 text-center border border-slate-700/30">
                        <p className="text-[10px] text-slate-500">{month}</p>
                        <p className={`text-sm font-bold ${temp > 80 ? 'text-red-400' : temp < 40 ? 'text-cyan-300' : 'text-white'}`}>
                          {temp}°F
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Impact */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                    Performance: Indoor vs Outdoor Avg
                  </p>
                  <div className="space-y-2">
                    {venue.performanceImpact.map((perf, idx) => {
                      const diff = perf.indoorAvg - perf.outdoorAvg;
                      const isPositiveDiff = diff > 0;
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                          <span className="text-xs text-slate-300 font-medium">{perf.category}</span>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-emerald-400 font-semibold">
                              Indoor: {typeof perf.indoorAvg === 'number' && perf.indoorAvg < 1
                                ? perf.indoorAvg.toFixed(3)
                                : perf.indoorAvg.toFixed(1)}
                            </span>
                            <span className="text-amber-400 font-semibold">
                              Outdoor: {typeof perf.outdoorAvg === 'number' && perf.outdoorAvg < 1
                                ? perf.outdoorAvg.toFixed(3)
                                : perf.outdoorAvg.toFixed(1)}
                            </span>
                            <span className={`font-bold ${isPositiveDiff ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositiveDiff ? '+' : ''}{diff < 1 && diff > -1 ? diff.toFixed(3) : diff.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Rain Delay %</p>
                    <p className="text-lg font-bold text-blue-400">{venue.rainDelayFrequency}%</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Games Cancelled</p>
                    <p className="text-lg font-bold text-red-400">{venue.gamesCancelled}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AlertsTab: React.FC<{ alerts: WeatherAlertCard[]; venues: VenueWeatherProfile[] }> = ({ alerts, venues }) => {
  // Build chart data: avg weather impact by venue type
  const chartData = useMemo(() => {
    const typeMap: Record<string, { delays: number; cancelled: number; count: number }> = {};
    venues.forEach(v => {
      if (!typeMap[v.type]) typeMap[v.type] = { delays: 0, cancelled: 0, count: 0 };
      typeMap[v.type].delays += v.rainDelayFrequency;
      typeMap[v.type].cancelled += v.gamesCancelled;
      typeMap[v.type].count += 1;
    });
    return Object.entries(typeMap).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      avgDelayRate: Math.round((data.delays / data.count) * 10) / 10,
      totalCancelled: data.cancelled,
    }));
  }, [venues]);

  const COLORS = ['#22d3ee', '#84cc16', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Impact by Venue Type Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          Weather Impact by Venue Type
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avgDelayRate" name="Avg Delay Rate %" radius={[6, 6, 0, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actionable Alerts */}
      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const rec = getRecommendationConfig(alert.recommendation);
          return (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${rec.text}`} />
                  <h4 className="text-sm font-bold text-white">{alert.player}</h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${rec.bg} ${rec.text} ${rec.border}`}>
                    {rec.label}
                  </span>
                </div>
                <span className={`text-sm font-bold ${
                  alert.expectedImpact >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {alert.expectedImpact >= 0 ? '+' : ''}{alert.expectedImpact}%
                </span>
              </div>

              <div className="mb-3 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {alert.upcomingGame}
                </span>
                <span className="flex items-center gap-1">
                  <CloudRain className="w-3 h-3" /> {alert.forecast}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                {alert.reasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Main Modal ----

const WeatherImpactModal: React.FC<WeatherImpactModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('forecast');

  const games = useMemo(() => getWeatherGameImpacts(), []);
  const historicEvents = useMemo(() => getHistoricWeatherEvents(), []);
  const venues = useMemo(() => getVenueProfiles(), []);
  const alerts = useMemo(() => getWeatherAlerts(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <CloudRain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Weather Impact Engine</h2>
                <p className="text-sm text-slate-400">Environmental intelligence for card values</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'forecast' && <ForecastTab games={games} />}
          {activeTab === 'historic' && <HistoricTab events={historicEvents} />}
          {activeTab === 'venues' && <VenueTab venues={venues} />}
          {activeTab === 'alerts' && <AlertsTab alerts={alerts} venues={venues} />}
        </div>
      </div>
    </div>
  );
};

export default WeatherImpactModal;
