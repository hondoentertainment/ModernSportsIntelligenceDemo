import React, { useMemo } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Droplets,
  Zap,
} from 'lucide-react';
import {
  getCurrentWeather,
  getForecast,
  conditionLabel,
  type WeatherCondition,
} from '../lib/cardWeatherService';

interface CardWeatherWidgetProps {
  onClick?: () => void;
}

// Mini weather icon (no animation for widget perf)
const MiniWeatherIcon: React.FC<{ condition: WeatherCondition; size?: number }> = ({ condition, size = 20 }) => {
  switch (condition) {
    case 'sunny':
      return <Sun size={size} className="text-yellow-400" />;
    case 'partly_cloudy':
      return (
        <div className="relative" style={{ width: size, height: size }}>
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

export const CardWeatherWidget: React.FC<CardWeatherWidgetProps> = ({ onClick }) => {
  const weather = useMemo(() => getCurrentWeather(), []);
  const forecast = useMemo(() => getForecast(3), []);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Sun size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Card <span className="text-brand-lime">Weather</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Market Weather Forecast
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Current Weather */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <MiniWeatherIcon condition={weather.condition} size={40} />
          <div>
            <p className={`text-4xl font-bold ${tempColor(weather.temperature)}`}>{weather.temperature}&deg;F</p>
            <p className="text-xs text-slate-400">{conditionLabel(weather.condition)}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {weather.windDirection === 'bullish' ? (
                <ArrowUp size={12} className="text-emerald-400" />
              ) : weather.windDirection === 'bearish' ? (
                <ArrowDown size={12} className="text-red-400" />
              ) : (
                <ArrowRight size={12} className="text-yellow-400" />
              )}
              <span className="text-xs text-slate-400 capitalize">{weather.windDirection}</span>
            </div>
            <p className="text-[10px] text-slate-500">Wind</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-400">{weather.humidity}%</p>
            <p className="text-[10px] text-slate-500">Liquidity</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-orange-400">{weather.precipitationChance}%</p>
            <p className="text-[10px] text-slate-500">Correction</p>
          </div>
        </div>
      </div>

      {/* 3-Day Mini Forecast */}
      <div className="flex gap-2">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex-1 bg-slate-900/50 border border-slate-700/40 rounded-xl p-3 text-center"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase">{day.day}</p>
            <div className="flex justify-center my-1">
              <MiniWeatherIcon condition={day.condition} size={18} />
            </div>
            <p className={`text-xs font-bold ${tempColor(day.highTemp)}`}>{day.highTemp}&deg;</p>
            <div className="flex items-center justify-center gap-0.5 mt-0.5">
              {day.windDirection === 'bullish' ? (
                <ArrowUp size={8} className="text-emerald-400" />
              ) : day.windDirection === 'bearish' ? (
                <ArrowDown size={8} className="text-red-400" />
              ) : (
                <ArrowRight size={8} className="text-yellow-400" />
              )}
              <span className="text-[9px] text-slate-500 capitalize">{day.windDirection}</span>
            </div>
          </div>
        ))}
      </div>
    </button>
  );
};

export default CardWeatherWidget;
