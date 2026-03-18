import React, { useMemo, useState, useEffect } from 'react';
import { HeartPulse, Shield, TrendingDown } from 'lucide-react';
import {
  getBiometricStats,
  getCurrentStressLevel,
  getEmotionalStateBg,
  getEmotionalStateColor,
  type EmotionalState,
} from '../lib/utils/biometricTradingGuardService';

interface BiometricTradingGuardWidgetProps {
  onClick?: () => void;
}

const EMOTION_LABELS: Record<EmotionalState, string> = {
  calm: 'Calm',
  elevated: 'Elevated',
  anxious: 'Anxious',
  euphoric: 'Euphoric',
  panic: 'Panic',
};

export const BiometricTradingGuardWidget: React.FC<BiometricTradingGuardWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getBiometricStats(), []);
  const [live, setLive] = useState(() => getCurrentStressLevel());

  // Simulate live updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLive(getCurrentStressLevel());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onClick}
      className="bg-slate-900 rounded-2xl border border-slate-700/60 p-5 cursor-pointer hover:border-rose-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <HeartPulse size={20} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Biometric Guard</h3>
            <p className="text-slate-400 text-xs">Emotional trading protection</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Wearable connected" />
      </div>

      {/* 3-col Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield size={12} className="text-rose-400" />
          </div>
          <p className="text-white font-bold text-lg leading-tight">{stats.tradesBlocked}</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wide">Blocked</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown size={12} className="text-green-400" />
          </div>
          <p className="text-white font-bold text-lg leading-tight">
            ${(stats.moneyProtected / 1000).toFixed(1)}k
          </p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wide">Protected</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <HeartPulse size={12} className="text-amber-400" />
          </div>
          <p className="text-white font-bold text-lg leading-tight">{stats.avgSessionStress}%</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wide">Avg Stress</p>
        </div>
      </div>

      {/* Live Heart Rate + Emotional State */}
      <div className="flex items-center justify-between bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
        {/* Heart rate with pulse */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <HeartPulse size={22} className="text-rose-400 animate-pulse" />
            <div className="absolute inset-0 animate-ping">
              <HeartPulse size={22} className="text-rose-400/30" />
            </div>
          </div>
          <div>
            <span className="text-white font-bold text-xl">{live.heartRate}</span>
            <span className="text-slate-400 text-xs ml-1">bpm</span>
          </div>
        </div>

        {/* Emotional state badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEmotionalStateBg(live.emotionalState)} ${getEmotionalStateColor(live.emotionalState)}`}
        >
          {EMOTION_LABELS[live.emotionalState]}
        </span>
      </div>
    </div>
  );
};

export default BiometricTradingGuardWidget;
