import React, { useState, useMemo } from 'react';
import {
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  getDayProfiles,
  getSeasonalPatterns,
  getTimingRecommendations,
  getCircadianStats,
  getMarketPhaseColor,
  getDayColor,
  type DayOfWeek,
} from '../lib/analytics/circadianOptimizerService';

const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CircadianOptimizer: React.FC = () => {
  const days = useMemo(() => getDayProfiles(), []);
  const patterns = useMemo(() => getSeasonalPatterns(), []);
  const recommendations = useMemo(() => getTimingRecommendations(), []);
  const stats = useMemo(() => getCircadianStats(), []);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');

  const currentDay = days.find(d => d.day === selectedDay)!;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Clock size={22} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Circadian Market Rhythm Optimizer</h1>
              <p className="text-slate-400 text-sm">
                Chronoeconomic analysis — optimal timing for every transaction
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Live Market Phase */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Current Market Phase</p>
              <p className={`text-2xl font-bold capitalize ${getMarketPhaseColor(stats.currentMarketPhase)}`}>
                {stats.currentMarketPhase.replace(/-/g, ' ')}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase">Buyer Activity</p>
                <p className="text-white font-bold text-xl">{stats.currentBuyerActivity}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase">Best Time to List</p>
                <p className="text-cyan-400 font-bold text-xl">{stats.bestTimeToList}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase">Best Time to Bid</p>
                <p className="text-amber-400 font-bold text-xl">{stats.bestTimeToBid}</p>
              </div>
            </div>
          </div>
          {stats.nextMacroEvent && (
            <div className="mt-4 bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-slate-400 text-xs">
                Next macro event: <span className="text-white font-semibold">{stats.nextMacroEvent.name}</span> on {stats.nextMacroEvent.date} — Expected impact: <span className="text-amber-400">{stats.nextMacroEvent.expectedImpact}</span>
              </span>
            </div>
          )}
        </div>

        {/* Day Selector + Heatmap */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-cyan-400" />
            Weekly Market Clock
          </h3>

          {/* Day Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {DAY_ORDER.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : `bg-slate-800 border border-slate-700 hover:text-white ${getDayColor(day)}`
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Day Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-[10px] uppercase">Peak Buying Hour</p>
              <p className="text-white font-bold">{currentDay.peakBuyingHour}:00</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-[10px] uppercase">Peak Selling Hour</p>
              <p className="text-white font-bold">{currentDay.peakSellingHour}:00</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-[10px] uppercase">Best Listing Window</p>
              <p className="text-cyan-400 font-bold">{currentDay.bestListingTime}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-[10px] uppercase">Avg Price Premium</p>
              <p className={`font-bold ${currentDay.avgPricePremium > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentDay.avgPricePremium > 0 ? '+' : ''}{currentDay.avgPricePremium}%
              </p>
            </div>
          </div>

          {/* Hourly Heatmap */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex items-center gap-1 mb-2">
                <Sunrise size={14} className="text-amber-400" />
                <span className="text-slate-500 text-[10px] uppercase tracking-wide flex-1">Hourly Activity Heatmap</span>
                <Moon size={14} className="text-blue-400" />
              </div>
              <div className="grid grid-cols-24 gap-0.5">
                {currentDay.slots.map((slot, i) => {
                  const intensity = Math.round((slot.buyerActivity + slot.sellerActivity) / 2);
                  const bg = intensity > 75 ? 'bg-cyan-500' : intensity > 50 ? 'bg-cyan-600' : intensity > 25 ? 'bg-cyan-800' : 'bg-slate-800';
                  return (
                    <div
                      key={i}
                      className={`h-8 rounded-sm ${bg} relative group cursor-pointer`}
                      style={{ opacity: 0.3 + (intensity / 100) * 0.7 }}
                      title={`${i}:00 — Buyers: ${slot.buyerActivity}% | Sellers: ${slot.sellerActivity}% | Competition: ${slot.bidCompetition}%`}
                    >
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-700 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <p className="text-white font-bold">{i}:00</p>
                        <p className="text-slate-300">Buy: {slot.buyerActivity}% Sell: {slot.sellerActivity}%</p>
                        <p className="text-slate-300">Comp: {slot.bidCompetition}% Impulse: {slot.impulseBuyerConcentration}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-600 text-[10px]">12am</span>
                <span className="text-slate-600 text-[10px]">6am</span>
                <span className="text-slate-600 text-[10px]">12pm</span>
                <span className="text-slate-600 text-[10px]">6pm</span>
                <span className="text-slate-600 text-[10px]">11pm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timing Recommendations */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Zap size={16} className="text-cyan-400" />
              Timing Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.action === 'list' ? 'bg-cyan-500/20 text-cyan-400' :
                      rec.action === 'bid' ? 'bg-amber-500/20 text-amber-400' :
                      rec.action === 'buy-now' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {rec.action}
                    </span>
                    <span className="text-slate-400 text-xs">{rec.confidence}% confidence</span>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">{rec.optimalWindow}</p>
                  <p className="text-green-400 text-xs font-semibold">{rec.expectedBenefit}</p>
                  <p className="text-slate-500 text-xs mt-1">{rec.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Patterns */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              Seasonal & Cyclical Patterns
            </h3>
            <div className="space-y-3">
              {patterns.map((p, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-semibold text-sm">{p.name}</h4>
                    <span className={`text-sm font-bold ${p.priceImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.priceImpact >= 0 ? '+' : ''}{p.priceImpact}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">{p.recurrence}</span>
                    <span className="text-slate-500 text-xs">{p.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircadianOptimizer;
