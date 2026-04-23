// @ts-nocheck
import React, { useMemo } from 'react';
import {
  X,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  getCurrentWeather,
  getForecast,
  getWeatherAlerts,
  getSportWeather,
  conditionLabel,
  type WeatherCondition,
} from '../lib/utils/cardWeatherService';

interface CardWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniIcon: React.FC<{ condition: WeatherCondition; size?: number }> = ({ condition, size = 20 }) => {
  switch (condition) {
    case 'sunny':
      return <Sun size={size} className="text-yellow-400" />;
    case 'partly_cloudy':
      return (
        <div className="relative inline-flex" style={{ width: size, height: size }}>
          <Sun size={size * 0.6} className="text-yellow-400 absolute top-0 right-0" />
          <Cloud size={size * 0.7} className="text-slate-300 absolute bottom-0 left-0" />
        </div>
      );
    case 'cloudy':
      return <Cloud size={size} className="text-slate-400" />;
    case 'rain':
      return <CloudRain size={size} className="text-blue-400" />;
    case 'thunderstorm':
      return <CloudLightning size={size} className="text-purple-400" />;
    case 'snow':
      return <CloudSnow size={size} className="text-sky-300" />;
    case 'fog':
      return <CloudFog size={size} className="text-slate-500" />;
    case 'hurricane':
    case 'tornado':
      return <Wind size={size} className="text-red-400" />;
    case 'rainbow':
      return <Sun size={size} className="text-yellow-400" />;
    default:
      return <Cloud size={size} className="text-slate-400" />;
  }
};

function tempColor(t: number): string {
  if (t >= 90) return 'text-red-400';
  if (t >= 75) return 'text-orange-400';
  if (t >= 60) return 'text-yellow-400';
  if (t >= 45) return 'text-sky-400';
  return 'text-blue-400';
}

export const CardWeatherModal: React.FC<CardWeatherModalProps> = ({ isOpen, onClose }) => {
  const weather = useMemo(() => getCurrentWeather(), []);
  const forecast = useMemo(() => getForecast(7), []);
  const alerts = useMemo(() => getWeatherAlerts(), []);
  const sportWeather = useMemo(() => getSportWeather(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-brand-lime/5 sticky top-0 z-10 backdrop-blur-md bg-slate-900/90">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
              <Sun size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  <Zap size={10} />
                  Live Market Weather
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Card <span className="text-brand-lime">Weather</span> System&trade;
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Current Conditions */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <MiniIcon condition={weather.condition} size={56} />
              <div>
                <p className={`text-5xl font-bold ${tempColor(weather.temperature)}`}>{weather.temperature}&deg;F</p>
                <p className="text-sm text-slate-400">{conditionLabel(weather.condition)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Feels like {weather.feelsLike}&deg;F
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Humidity', value: `${weather.humidity}%`, icon: <Droplets size={14} />, color: 'text-blue-400' },
                { label: 'Wind', value: `${weather.windSpeed} mph`, icon: <Wind size={14} />, color: 'text-cyan-400' },
                { label: 'Visibility', value: `${weather.visibility} mi`, icon: <Eye size={14} />, color: 'text-purple-400' },
                { label: 'Correction', value: `${weather.precipitationChance}%`, icon: <CloudRain size={14} />, color: 'text-yellow-400' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1 text-slate-400">
                    {item.icon}
                    <span className="text-[10px] font-bold uppercase">{item.label}</span>
                  </div>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wind direction badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Market Direction:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                weather.windDirection === 'bullish'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : weather.windDirection === 'bearish'
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
              }`}
            >
              {weather.windDirection === 'bullish' ? (
                <ArrowUp size={12} />
              ) : weather.windDirection === 'bearish' ? (
                <ArrowDown size={12} />
              ) : (
                <ArrowRight size={12} />
              )}
              <span className="capitalize">{weather.windDirection}</span>
            </span>
            <span className="text-xs text-slate-500">
              UV (Hype): <span className="text-orange-400 font-bold">{weather.uvIndex}/11</span>
            </span>
            <span className="text-xs text-slate-500">
              Pressure: <span className="text-emerald-400 font-bold">{weather.pressure} hPa</span>
            </span>
          </div>

          {/* 7-Day Forecast */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-brand-lime" />
              7-Day Forecast
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {forecast.map((day) => (
                <div key={day.date} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{day.day}</p>
                  <MiniIcon condition={day.condition} size={20} />
                  <p className={`text-sm font-bold ${tempColor(day.highTemp)}`}>{day.highTemp}&deg;</p>
                  <p className="text-[10px] text-slate-500">{day.lowTemp}&deg;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Weather Summary */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Thermometer size={14} className="text-brand-lime" />
              Sport Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sportWeather.map((sw) => (
                <div key={sw.sport} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <MiniIcon condition={sw.condition} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">{sw.sport}</span>
                      <span className={`text-sm font-bold ${tempColor(sw.temperature)}`}>{sw.temperature}&deg;</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      {sw.windDirection === 'bullish' ? (
                        <ArrowUp size={9} className="text-emerald-400" />
                      ) : sw.windDirection === 'bearish' ? (
                        <ArrowDown size={9} className="text-red-400" />
                      ) : (
                        <ArrowRight size={9} className="text-yellow-400" />
                      )}
                      <span className="capitalize">{sw.windDirection}</span>
                      <span>&bull;</span>
                      <span>Vol: {sw.windSpeed} mph</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-400" />
                Active Alerts ({alerts.length})
              </h3>
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const severityStyle: Record<string, string> = {
                    low: 'border-blue-500/30 bg-blue-500/5',
                    moderate: 'border-yellow-500/30 bg-yellow-500/5',
                    high: 'border-orange-500/30 bg-orange-500/5',
                    extreme: 'border-red-500/30 bg-red-500/5',
                  };
                  return (
                    <div key={alert.id} className={`border rounded-xl p-3 ${severityStyle[alert.severity] ?? severityStyle.low}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          alert.severity === 'high' || alert.severity === 'extreme'
                            ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                            : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-300">{alert.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{alert.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardWeatherModal;
