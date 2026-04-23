// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
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
  Minus,
  AlertTriangle,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Radio,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  getCurrentWeather,
  getSportWeather,
  getRegionalWeather,
  getForecast,
  getWeatherAlerts,
  getWeatherHistory,
  getSignalBreakdown,
  getSeasonalPatterns,
  getPressureSystems,
  getWeatherMap,
  conditionLabel,
  type WeatherCondition,
  type MarketWeather,
  type WeatherForecast,
  type WeatherSignal,
  type WeatherAlert,
  type RegionalWeather,
  type SportWeather,
  type PressureSystem,
  type SignalCategory,
} from '../lib/utils/cardWeatherService';

// ---- Weather Icon Component with CSS Animations ----

const WeatherIcon: React.FC<{ condition: WeatherCondition; size?: number; animated?: boolean }> = ({
  condition,
  size = 48,
  animated = true,
}) => {
  const animClass = animated ? 'animate-pulse' : '';

  switch (condition) {
    case 'sunny':
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <Sun size={size} className="text-yellow-400" />
          {animated && (
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-0.5 bg-yellow-400/40 rounded-full"
                  style={{
                    height: size * 0.18,
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translateY(-${size * 0.55}px)`,
                    transformOrigin: '0 0',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      );
    case 'partly_cloudy':
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <Sun size={size * 0.7} className="text-yellow-400 absolute top-0 right-0" />
          <Cloud size={size * 0.8} className={`text-slate-300 absolute bottom-0 left-0 ${animated ? 'animate-bounce' : ''}`} style={{ animationDuration: '3s' }} />
        </div>
      );
    case 'cloudy':
      return <Cloud size={size} className={`text-slate-400 ${animated ? 'animate-bounce' : ''}`} style={{ animationDuration: '4s' }} />;
    case 'rain':
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <CloudRain size={size} className="text-blue-400" />
          {animated && (
            <div className="absolute bottom-0 left-1/4 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-0.5 h-2 bg-blue-400/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s`, animationDuration: '0.8s' }}
                />
              ))}
            </div>
          )}
        </div>
      );
    case 'thunderstorm':
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <CloudLightning size={size} className="text-purple-400" />
          {animated && (
            <Zap
              size={size * 0.35}
              className="absolute bottom-0 right-1 text-yellow-400 animate-ping"
              style={{ animationDuration: '1.5s' }}
            />
          )}
        </div>
      );
    case 'snow':
      return <CloudSnow size={size} className={`text-sky-300 ${animClass}`} />;
    case 'fog':
      return <CloudFog size={size} className={`text-slate-500 ${animated ? 'animate-pulse' : ''}`} style={{ animationDuration: '3s' }} />;
    case 'hurricane':
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <Wind size={size} className="text-red-400" />
          {animated && (
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1s' }}>
              <Activity size={size * 0.4} className="text-red-500 absolute top-0 left-1/3" />
            </div>
          )}
        </div>
      );
    case 'tornado':
      return (
        <div style={{ width: size, height: size }} className="relative">
          <Wind size={size} className={`text-red-500 ${animated ? 'animate-spin' : ''}`} style={{ animationDuration: '0.5s' }} />
        </div>
      );
    case 'rainbow':
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <Sun size={size * 0.6} className="text-yellow-400 absolute top-0 right-0" />
          <div
            className={`absolute bottom-0 left-0 rounded-t-full border-4 border-b-0 ${animated ? 'animate-pulse' : ''}`}
            style={{
              width: size * 0.7,
              height: size * 0.35,
              borderColor: 'transparent',
              borderTopColor: '#f87171',
              boxShadow:
                'inset 0 3px 0 #fb923c, inset 0 6px 0 #facc15, inset 0 9px 0 #4ade80, inset 0 12px 0 #60a5fa, inset 0 15px 0 #a78bfa',
              animationDuration: '2s',
            }}
          />
        </div>
      );
    default:
      return <Cloud size={size} className="text-slate-400" />;
  }
};

// ---- Wind Direction Icon ----

const WindDirectionIcon: React.FC<{ direction: string; size?: number }> = ({ direction, size = 16 }) => {
  if (direction === 'bullish') return <ArrowUp size={size} className="text-emerald-400" />;
  if (direction === 'bearish') return <ArrowDown size={size} className="text-red-400" />;
  return <ArrowRight size={size} className="text-yellow-400" />;
};

// ---- Severity Badge ----

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const styles: Record<string, string> = {
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    moderate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    extreme: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[severity] ?? styles.low}`}>
      {severity}
    </span>
  );
};

// ---- Temperature Color ----

function tempColor(t: number): string {
  if (t >= 90) return 'text-red-400';
  if (t >= 75) return 'text-orange-400';
  if (t >= 60) return 'text-yellow-400';
  if (t >= 45) return 'text-sky-400';
  return 'text-blue-400';
}

function tempBg(t: number): string {
  if (t >= 90) return 'bg-red-500/15 border-red-500/30';
  if (t >= 75) return 'bg-orange-500/15 border-orange-500/30';
  if (t >= 60) return 'bg-yellow-500/15 border-yellow-500/30';
  if (t >= 45) return 'bg-sky-500/15 border-sky-500/30';
  return 'bg-blue-500/15 border-blue-500/30';
}

function heatMapColor(intensity: number): string {
  if (intensity >= 0.8) return 'bg-red-500/30 border-red-500/40';
  if (intensity >= 0.6) return 'bg-orange-500/25 border-orange-500/35';
  if (intensity >= 0.4) return 'bg-yellow-500/20 border-yellow-500/30';
  if (intensity >= 0.2) return 'bg-sky-500/20 border-sky-500/30';
  return 'bg-blue-500/15 border-blue-500/25';
}

// ---- Category color for signals ----

function categoryColor(cat: SignalCategory): string {
  const map: Record<SignalCategory, string> = {
    momentum: 'text-purple-400',
    sentiment: 'text-pink-400',
    volume: 'text-blue-400',
    technical: 'text-cyan-400',
    fundamental: 'text-emerald-400',
    social: 'text-orange-400',
    seasonal: 'text-yellow-400',
  };
  return map[cat];
}

function categoryBg(cat: SignalCategory): string {
  const map: Record<SignalCategory, string> = {
    momentum: 'bg-purple-500/15 border-purple-500/30',
    sentiment: 'bg-pink-500/15 border-pink-500/30',
    volume: 'bg-blue-500/15 border-blue-500/30',
    technical: 'bg-cyan-500/15 border-cyan-500/30',
    fundamental: 'bg-emerald-500/15 border-emerald-500/30',
    social: 'bg-orange-500/15 border-orange-500/30',
    seasonal: 'bg-yellow-500/15 border-yellow-500/30',
  };
  return map[cat];
}

// ---- Main Page ----

const CardWeather: React.FC = () => {
  const weather = useMemo(() => getCurrentWeather(), []);
  const forecast = useMemo(() => getForecast(7), []);
  const sportWeather = useMemo(() => getSportWeather(), []);
  const regionalWeather = useMemo(() => getRegionalWeather(), []);
  const alerts = useMemo(() => getWeatherAlerts(), []);
  const history = useMemo(() => getWeatherHistory(30), []);
  const signals = useMemo(() => getSignalBreakdown(), []);
  const seasonal = useMemo(() => getSeasonalPatterns(), []);
  const pressureSystems = useMemo(() => getPressureSystems(), []);
  const weatherMap = useMemo(() => getWeatherMap(), []);

  const [activeSignalCategory, setActiveSignalCategory] = useState<SignalCategory | 'all'>('all');
  const [radarAngle, setRadarAngle] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const filteredSignals = useMemo(
    () => (activeSignalCategory === 'all' ? signals : signals.filter((s) => s.category === activeSignalCategory)),
    [signals, activeSignalCategory]
  );

  const signalCategories: (SignalCategory | 'all')[] = ['all', 'momentum', 'sentiment', 'volume', 'technical', 'fundamental', 'social', 'seasonal'];

  // Aggregate signal score
  const compositeScore = useMemo(() => {
    const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = signals.reduce((sum, s) => sum + s.value * s.weight, 0);
    return Math.round(weightedSum / totalWeight);
  }, [signals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-brand-lime animate-spin" />
            <Radio size={24} className="absolute inset-0 m-auto text-brand-lime animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm font-bold">Scanning market weather signals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-lime/20 border border-brand-lime/30">
            <Sun size={24} className="text-brand-lime" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Card Weather System&trade;</h1>
            <p className="text-sm text-slate-400">
              Real-time market weather forecast &mdash; {signals.length} signals analyzed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
            <Activity size={10} />
            Live
          </span>
        </div>
      </div>

      {/* Hero Weather Display */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Weather */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center text-center space-y-4">
            <WeatherIcon condition={weather.condition} size={80} />
            <div>
              <p className={`text-6xl font-bold ${tempColor(weather.temperature)}`}>{weather.temperature}&deg;F</p>
              <p className="text-slate-400 text-sm mt-1">
                Feels like <span className={tempColor(weather.feelsLike)}>{weather.feelsLike}&deg;F</span>
              </p>
            </div>
            <p className="text-lg font-semibold text-slate-200">{conditionLabel(weather.condition)}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <WindDirectionIcon direction={weather.windDirection} size={14} />
              <span className="capitalize">{weather.windDirection} winds at {weather.windSpeed} mph</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${tempBg(weather.temperature)}`}>
              <Gauge size={14} />
              <span className="text-sm font-bold">Composite Score: {compositeScore > 0 ? '+' : ''}{compositeScore}</span>
            </div>
          </div>

          {/* Right: Current Conditions Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Temperature', value: `${weather.temperature}°F`, icon: <Thermometer size={18} />, sub: 'Market Heat', color: tempColor(weather.temperature) },
              { label: 'Humidity', value: `${weather.humidity}%`, icon: <Droplets size={18} />, sub: 'Liquidity', color: 'text-blue-400' },
              { label: 'Wind Speed', value: `${weather.windSpeed} mph`, icon: <Wind size={18} />, sub: 'Volatility', color: 'text-cyan-400' },
              { label: 'Pressure', value: `${weather.pressure} hPa`, icon: <Gauge size={18} />, sub: 'Buying Pressure', color: 'text-emerald-400' },
              { label: 'Visibility', value: `${weather.visibility} mi`, icon: <Eye size={18} />, sub: 'Market Clarity', color: 'text-purple-400' },
              { label: 'UV Index', value: `${weather.uvIndex}`, icon: <Sun size={18} />, sub: 'Hype Intensity', color: 'text-orange-400' },
              { label: 'Precip. Chance', value: `${weather.precipitationChance}%`, icon: <CloudRain size={18} />, sub: 'Correction Risk', color: 'text-yellow-400' },
              { label: 'Dew Point', value: `${weather.dewPoint}°F`, icon: <Droplets size={18} />, sub: 'Saturation', color: 'text-sky-400' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  {item.icon}
                  <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                </div>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Strip */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-brand-lime" />
          7-Day Market Forecast
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((day) => (
            <div
              key={day.date}
              className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-center space-y-2 hover:border-brand-lime/30 transition-all"
            >
              <p className="text-xs font-bold text-slate-400 uppercase">{day.day}</p>
              <WeatherIcon condition={day.condition} size={32} animated={false} />
              <div className="flex items-center justify-center gap-2">
                <span className={`text-sm font-bold ${tempColor(day.highTemp)}`}>{day.highTemp}&deg;</span>
                <span className="text-xs text-slate-500">/</span>
                <span className="text-xs text-slate-500">{day.lowTemp}&deg;</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <WindDirectionIcon direction={day.windDirection} size={10} />
                <span className="text-[10px] text-slate-500 capitalize">{day.windDirection}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Droplets size={10} className="text-blue-400" />
                <span className="text-[10px] text-slate-500">{day.precipitationChance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Alerts / Storm Tracker */}
      {alerts.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" />
            Storm Tracker &mdash; Active Alerts ({alerts.length})
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-xl p-4 ${
                  alert.severity === 'extreme'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.severity === 'high'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : alert.severity === 'moderate'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{alert.type.replace(/_/g, ' ')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{alert.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                      <span>Area: {alert.affectedArea}</span>
                      <span>Expires: {new Date(alert.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <AlertTriangle
                    size={20}
                    className={
                      alert.severity === 'extreme' || alert.severity === 'high'
                        ? 'text-orange-400 animate-pulse'
                        : 'text-yellow-500'
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Map + Radar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Map */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-brand-lime" />
            Market Weather Map
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {/* Column headers */}
            {['Rookies', 'Vintage', 'Modern/All'].map((h) => (
              <div key={h} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pb-2">
                {h}
              </div>
            ))}
            {weatherMap.regions.map((region) => (
              <div
                key={region.id}
                className={`border rounded-xl p-3 text-center space-y-1 ${heatMapColor(region.intensity)} hover:scale-105 transition-transform cursor-default`}
              >
                <WeatherIcon condition={region.condition} size={20} animated={false} />
                <p className={`text-sm font-bold ${tempColor(region.temperature)}`}>{region.temperature}&deg;</p>
                <p className="text-[10px] text-slate-400 truncate">{region.sport}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500">
            <span>Cool (Low Activity)</span>
            <div className="flex gap-1">
              <div className="w-6 h-2 rounded bg-blue-500/30" />
              <div className="w-6 h-2 rounded bg-sky-500/30" />
              <div className="w-6 h-2 rounded bg-yellow-500/30" />
              <div className="w-6 h-2 rounded bg-orange-500/30" />
              <div className="w-6 h-2 rounded bg-red-500/30" />
            </div>
            <span>Hot (High Activity)</span>
          </div>
        </div>

        {/* Weather Radar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Radio size={18} className="text-brand-lime" />
            Market Radar
          </h2>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Radar circles */}
              {[1, 2, 3, 4].map((r) => (
                <div
                  key={r}
                  className="absolute border border-slate-600/40 rounded-full"
                  style={{
                    width: `${r * 25}%`,
                    height: `${r * 25}%`,
                    top: `${50 - r * 12.5}%`,
                    left: `${50 - r * 12.5}%`,
                  }}
                />
              ))}
              {/* Crosshairs */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-600/40" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-600/40" />
              {/* Sweep line */}
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
                style={{
                  background: 'linear-gradient(to right, rgba(132,204,22,0.6), transparent)',
                  transform: `rotate(${radarAngle}deg)`,
                }}
              />
              {/* Sweep glow */}
              <div
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  width: '50%',
                  height: '50%',
                  background: `conic-gradient(from ${radarAngle - 30}deg, transparent, rgba(132,204,22,0.08), transparent)`,
                  transform: `rotate(0deg) translateY(-50%)`,
                  borderRadius: '0 100% 0 0',
                }}
              />
              {/* Blips for sport weather */}
              {sportWeather.map((sw, i) => {
                const angle = (i / sportWeather.length) * 360;
                const dist = 30 + (sw.temperature / 120) * 60;
                const x = 50 + Math.cos((angle * Math.PI) / 180) * dist * 0.5;
                const y = 50 + Math.sin((angle * Math.PI) / 180) * dist * 0.5;
                const blipColor =
                  sw.windDirection === 'bullish'
                    ? 'bg-emerald-400'
                    : sw.windDirection === 'bearish'
                    ? 'bg-red-400'
                    : 'bg-yellow-400';
                return (
                  <div
                    key={sw.sport}
                    className={`absolute w-3 h-3 rounded-full ${blipColor} animate-ping`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      animationDuration: `${1.5 + i * 0.3}s`,
                    }}
                    title={`${sw.sport}: ${sw.temperature}°F`}
                  />
                );
              })}
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-slate-900/80 rounded-full w-12 h-12 flex items-center justify-center">
                  <span className={`text-xs font-bold ${tempColor(weather.temperature)}`}>{weather.temperature}&deg;</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Bullish</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Sideways</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Bearish</span>
          </div>
        </div>
      </div>

      {/* Sport Weather Cards */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-brand-lime" />
          Sport Weather Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {sportWeather.map((sw) => (
            <div key={sw.sport} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-3 hover:border-brand-lime/30 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">{sw.sport}</h3>
                <WeatherIcon condition={sw.condition} size={24} animated={false} />
              </div>
              <div className="flex items-end gap-1">
                <span className={`text-3xl font-bold ${tempColor(sw.temperature)}`}>{sw.temperature}&deg;</span>
                <span className="text-xs text-slate-500 mb-1">F</span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Wind</span>
                  <span className="flex items-center gap-1">
                    <WindDirectionIcon direction={sw.windDirection} size={10} />
                    {sw.windSpeed} mph
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span>{sw.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Visibility</span>
                  <span>{sw.visibility} mi</span>
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-2">
                <p className="text-[10px] text-slate-500 mb-1">Top Mover</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 truncate mr-2">{sw.topMover}</span>
                  <span className={`text-xs font-bold ${sw.topMoverChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {sw.topMoverChange >= 0 ? '+' : ''}{sw.topMoverChange}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Weather + Pressure Systems side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Weather */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-brand-lime" />
            Regional Weather
          </h2>
          <div className="space-y-3">
            {regionalWeather.map((rw) => (
              <div key={rw.region} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                <WeatherIcon condition={rw.condition} size={28} animated={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200">{rw.category}</h3>
                    <span className={`text-sm font-bold ${tempColor(rw.temperature)}`}>{rw.temperature}&deg;F</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{rw.outlook}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <WindDirectionIcon direction={rw.windDirection} size={10} />
                      {rw.windDirection}
                    </span>
                    <span>Humidity: {rw.humidity}%</span>
                    <span className={rw.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {rw.changePercent >= 0 ? '+' : ''}{rw.changePercent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pressure Systems */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Gauge size={18} className="text-brand-lime" />
            Pressure Systems
          </h2>
          <div className="space-y-3">
            {pressureSystems.map((ps) => (
              <div
                key={ps.id}
                className={`border rounded-xl p-4 ${
                  ps.type === 'high' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                        ps.type === 'high' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
                      }`}
                    >
                      {ps.type === 'high' ? 'H' : 'L'}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{ps.name}</h3>
                      <p className="text-[10px] text-slate-500">{ps.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">Strength:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-3 rounded-sm ${
                            i < ps.strength
                              ? ps.type === 'high'
                                ? 'bg-emerald-400'
                                : 'bg-red-400'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{ps.description}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                  <WindDirectionIcon direction={ps.movingDirection} size={10} />
                  <span className="capitalize">{ps.movingDirection}</span>
                  <span className="mx-1">&bull;</span>
                  <span>{ps.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Weather Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-brand-lime" />
          30-Day Temperature History
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[30, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="temperature" stroke="#84cc16" fill="url(#tempGrad)" strokeWidth={2} name="Temperature (°F)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seasonal Patterns Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-brand-lime" />
          Seasonal Performance Patterns
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="historicalReturn" name="Avg Return (%)" fill="#84cc16" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgVolatility" name="Avg Volatility" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
          {seasonal.map((s) => (
            <div key={s.month} className="text-center text-[10px] text-slate-500 bg-slate-900/40 rounded-lg p-2">
              <p className="font-bold text-slate-300">{s.month}</p>
              <p className="truncate">{s.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Breakdown Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-brand-lime" />
          Signal Breakdown ({signals.length} Signals)
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {signalCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveSignalCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all capitalize ${
                activeSignalCategory === cat
                  ? 'border-brand-lime text-brand-lime bg-brand-lime/10'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Signal Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal</th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="text-right py-2 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
                <th className="text-right py-2 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight</th>
                <th className="text-center py-2 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Trend</th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Bar</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.map((signal) => (
                <tr key={signal.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3">
                    <p className="font-bold text-slate-200 text-xs">{signal.name}</p>
                    <p className="text-[10px] text-slate-500 hidden sm:block">{signal.description}</p>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${categoryBg(signal.category)} ${categoryColor(signal.category)}`}>
                      {signal.category}
                    </span>
                  </td>
                  <td className={`py-2 px-3 text-right font-bold text-xs ${signal.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {signal.value >= 0 ? '+' : ''}{signal.value}
                  </td>
                  <td className="py-2 px-3 text-right text-xs text-slate-400">{(signal.weight * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 text-center">
                    {signal.trend === 'up' ? (
                      <TrendingUp size={14} className="text-emerald-400 inline-block" />
                    ) : signal.trend === 'down' ? (
                      <TrendingDown size={14} className="text-red-400 inline-block" />
                    ) : (
                      <Minus size={14} className="text-yellow-400 inline-block" />
                    )}
                  </td>
                  <td className="py-2 px-3 hidden md:table-cell">
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${signal.value >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(signal.value), 100)}%`, marginLeft: signal.value < 0 ? 'auto' : undefined }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardWeather;
