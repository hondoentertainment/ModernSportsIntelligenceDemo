import React, { useState, useEffect } from 'react';
import { Thermometer, TrendingUp, TrendingDown, Minus, Activity, Shield } from 'lucide-react';
import {
  getCurrentReading,
  getEmotionalProfile,
  getTemperatureColor,
  STATE_LABELS,
  type ThermometerReading,
  type EmotionalProfile,
  type EmotionalState,
} from '../lib/emotionalThermometerService';

interface EmotionalThermometerWidgetProps {
  onClick?: () => void;
}

const TrendIcon: React.FC<{ trend: 'rising' | 'falling' | 'stable' }> = ({ trend }) => {
  if (trend === 'rising') return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'falling') return <TrendingDown size={12} className="text-green-400" />;
  return <Minus size={12} className="text-slate-400" />;
};

const MiniThermometer: React.FC<{ temperature: number }> = ({ temperature }) => {
  const color = getTemperatureColor(temperature);
  const fillPercent = Math.max(2, Math.min(100, temperature));

  return (
    <div className="relative w-6 h-24">
      {/* Body */}
      <div className="absolute inset-x-0 top-0 bottom-5 rounded-t-full border border-slate-600 bg-slate-900 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 rounded-t-sm"
          style={{
            height: `${fillPercent}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}44`,
          }}
        />
      </div>
      {/* Bulb */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border border-slate-600"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

const EmotionalThermometerWidget: React.FC<EmotionalThermometerWidgetProps> = ({ onClick }) => {
  const [reading, setReading] = useState<ThermometerReading | null>(null);
  const [profile, setProfile] = useState<EmotionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setReading(getCurrentReading());
      setProfile(getEmotionalProfile());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-2/3 mb-3" />
        <div className="h-8 bg-slate-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-full" />
      </div>
    );
  }

  if (!reading || !profile) return null;

  const color = getTemperatureColor(reading.temperature);
  const isWarning = reading.temperature >= 65;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border rounded-xl p-4 transition-all ${
        onClick ? 'cursor-pointer hover:bg-slate-750 hover:border-slate-600' : ''
      } ${isWarning ? 'border-orange-500/40' : 'border-slate-700'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Thermometer size={16} className="text-orange-400" />
          Emotional Thermometer
        </div>
        {isWarning && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 animate-pulse">
            ELEVATED
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex items-center gap-4">
        <MiniThermometer temperature={reading.temperature} />
        <div className="flex-1 min-w-0">
          {/* Temperature */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold" style={{ color }}>{reading.temperature}°</span>
            <TrendIcon trend={reading.trend} />
          </div>
          {/* State */}
          <div className="text-sm truncate mt-0.5" style={{ color }}>
            {STATE_LABELS[reading.state]}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-slate-500" />
          <div>
            <div className="text-xs text-slate-500">Quality</div>
            <div className="text-sm font-medium" style={{ color: getTemperatureColor(100 - reading.tradingQuality) }}>
              {reading.tradingQuality}/100
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-slate-500" />
          <div>
            <div className="text-xs text-slate-500">Risk</div>
            <div className={`text-sm font-medium ${reading.riskMultiplier > 1.5 ? 'text-red-400' : 'text-green-400'}`}>
              {reading.riskMultiplier}x
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalThermometerWidget;
