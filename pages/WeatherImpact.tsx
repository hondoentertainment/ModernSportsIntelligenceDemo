import React, { useState, useMemo } from 'react';
import { CloudRain, Thermometer, AlertTriangle, TrendingUp, Award } from 'lucide-react';
import {
  getWeatherStats,
  getWeatherGameImpacts,
  getHistoricWeatherEvents,
  getWeatherAlerts,
  getConditionColor,
  getConditionLabel,
  getStatusColor,
  getRecommendationConfig,
} from '../lib/analytics/weatherImpactService';
import WeatherImpactWidget from '../components/WeatherImpactWidget';
import WeatherImpactModal from '../components/WeatherImpactModal';

const WeatherImpact: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => getWeatherStats(), []);
  const games = useMemo(() => getWeatherGameImpacts(), []);
  const historicEvents = useMemo(() => getHistoricWeatherEvents(), []);
  const alerts = useMemo(() => getWeatherAlerts(), []);

  const buyAlerts = alerts.filter(a => a.recommendation === 'buy_before');
  const sellAlerts = alerts.filter(a => a.recommendation === 'sell_before');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <CloudRain size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Weather Impact Engine</h1>
            <p className="text-sm text-slate-400">Environmental Intelligence for Card Values</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-sm font-bold hover:bg-cyan-500/20 transition-colors"
        >
          <CloudRain size={16} />
          Full Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Games Tracked</p>
          <p className="text-3xl font-bold text-white">{stats.gamesTracked}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Postponements</p>
          <p className="text-3xl font-bold text-red-400">{stats.postponements}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Weather Alerts</p>
          <p className="text-3xl font-bold text-amber-400">{stats.weatherAlerts}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Impact</p>
          <p className="text-3xl font-bold text-blue-400">{stats.avgWeatherImpact}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Premium</p>
          <p className="text-3xl font-bold text-emerald-400">{stats.topWeatherPremium}x</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Widget */}
        <div className="lg:col-span-1">
          <WeatherImpactWidget onOpenModal={() => setIsModalOpen(true)} />
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buy Signals */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Weather-Based Buy Signals
            </h3>
            <div className="space-y-3">
              {buyAlerts.map((alert, idx) => {
                const rec = getRecommendationConfig(alert.recommendation);
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{alert.player}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${rec.bg} ${rec.text} ${rec.border}`}>
                          {rec.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{alert.upcomingGame}</p>
                      <p className="text-xs text-slate-500 mt-1">{alert.forecast}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-lg font-bold text-emerald-400">+{alert.expectedImpact}%</p>
                      <p className="text-[10px] text-slate-500 uppercase">Expected</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sell Signals */}
          {sellAlerts.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Weather Risk Warnings
              </h3>
              <div className="space-y-3">
                {sellAlerts.map((alert, idx) => {
                  const rec = getRecommendationConfig(alert.recommendation);
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-red-500/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{alert.player}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${rec.bg} ${rec.text} ${rec.border}`}>
                            {rec.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{alert.upcomingGame}</p>
                        <p className="text-xs text-slate-500 mt-1">{alert.reasoning}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-red-400">{alert.expectedImpact}%</p>
                        <p className="text-[10px] text-slate-500 uppercase">Expected</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Famous Weather Games */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Legendary Weather Game Premiums
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {historicEvents.slice(0, 4).map(event => {
                const condColor = getConditionColor(event.weather.condition);
                return (
                  <div key={event.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${condColor.bg} ${condColor.text}`}>
                        {getConditionLabel(event.weather.condition)}
                      </span>
                      <span className="text-lg font-black text-emerald-400">{event.memorabiliaMultiplier}x</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{event.event}</h4>
                    <p className="text-xs text-slate-400">{event.date} &middot; {event.weather.temp}°F</p>
                    <div className="mt-2 text-xs text-slate-500">
                      Top card: {event.affectedCards[0]?.player} (+{event.affectedCards[0]?.premiumPercent}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Game Forecasts */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Upcoming Game Forecasts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="text-left py-2 pr-4">Game</th>
                    <th className="text-left py-2 pr-4">Venue</th>
                    <th className="text-center py-2 pr-4">Condition</th>
                    <th className="text-center py-2 pr-4">Temp</th>
                    <th className="text-center py-2 pr-4">Wind</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {games.map(game => {
                    const condColor = getConditionColor(game.weather.condition);
                    const statusColor = getStatusColor(game.gameStatus);
                    return (
                      <tr key={game.gameId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-white">{game.teams}</span>
                          <span className="block text-[10px] text-slate-500">{game.date}</span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-400">{game.venue}</td>
                        <td className="py-3 pr-4 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${condColor.bg} ${condColor.text}`}>
                            {getConditionLabel(game.weather.condition)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center text-white font-semibold">{game.weather.temp}°F</td>
                        <td className="py-3 pr-4 text-center text-slate-400">{game.weather.windSpeed} mph</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${statusColor.bg} ${statusColor.text}`}>
                            {game.gameStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <WeatherImpactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default WeatherImpact;
