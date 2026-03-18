import React, { useMemo } from 'react';
import { CloudRain, ChevronRight, Thermometer, Wind, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  getWeatherAlerts,
  getWeatherGameImpacts,
  getHistoricWeatherEvents,
  getConditionColor,
  getConditionLabel,
  getRecommendationConfig,
  getStatusColor,
} from '../lib/analytics/weatherImpactService';

interface WeatherImpactWidgetProps {
  onOpenModal?: () => void;
}

const WeatherImpactWidget: React.FC<WeatherImpactWidgetProps> = ({ onOpenModal }) => {
  const alerts = useMemo(() => getWeatherAlerts(), []);
  const games = useMemo(() => getWeatherGameImpacts(), []);
  const historicEvents = useMemo(() => getHistoricWeatherEvents(), []);

  const activeAlerts = alerts.filter(a => a.recommendation === 'buy_before' || a.recommendation === 'sell_before');
  const impactedGames = games.filter(g => g.gameStatus !== 'on_time');
  const topPremium = historicEvents.reduce(
    (best, e) => (e.memorabiliaMultiplier > best.memorabiliaMultiplier ? e : best),
    historicEvents[0]
  );

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Weather Impact</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Alerts</p>
          <p className="text-lg font-bold text-amber-400">{activeAlerts.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Impacted</p>
          <p className="text-lg font-bold text-red-400">{impactedGames.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Top Premium</p>
          <p className="text-lg font-bold text-emerald-400">{topPremium.memorabiliaMultiplier}x</p>
        </div>
      </div>

      {/* Active Weather Alerts */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Active Alerts
        </h4>

        {activeAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No actionable weather alerts</p>
        ) : (
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map((alert, idx) => {
              const rec = getRecommendationConfig(alert.recommendation);
              return (
                <button
                  key={idx}
                  onClick={onOpenModal}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {alert.player}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${rec.bg} ${rec.text} ${rec.border}`}>
                        {rec.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{alert.forecast}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs font-semibold ${alert.expectedImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {alert.expectedImpact >= 0 ? '+' : ''}{alert.expectedImpact}%
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Impacted Games */}
      {impactedGames.length > 0 && (
        <div className="p-4 pt-0">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            Impacted Games
          </h4>
          <div className="space-y-2">
            {impactedGames.slice(0, 3).map(game => {
              const condColor = getConditionColor(game.weather.condition);
              const statusColor = getStatusColor(game.gameStatus);
              return (
                <div
                  key={game.gameId}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${statusColor.bg} ${statusColor.border}`}
                >
                  <Thermometer className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${condColor.text}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold ${statusColor.text}`}>
                      {game.teams}
                    </span>
                    <span className="text-slate-400 ml-1">
                      — {game.weather.temp}°F, {getConditionLabel(game.weather.condition)}
                    </span>
                    <span className={`ml-2 uppercase font-bold ${statusColor.text}`}>
                      {game.gameStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Weather Premium */}
      <div className="p-4 pt-0">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Legendary Weather Premium
        </h4>
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
          <p className="text-sm font-semibold text-white">{topPremium.event}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">{topPremium.date}</span>
            <span className="text-xs font-bold text-emerald-400">{topPremium.memorabiliaMultiplier}x multiplier</span>
            <span className="text-xs text-cyan-300">{topPremium.weather.temp}°F</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherImpactWidget;
