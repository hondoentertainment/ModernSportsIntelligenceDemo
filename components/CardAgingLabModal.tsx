// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  FlaskConical,
  Thermometer,
  Droplets,
  Sun,
  Package,
  TrendingDown,
  ChevronRight,
  Shield,
  Clock,
  Award,
} from 'lucide-react';
import {
  simulateAging,
  getStorageTypeLabel,
  type StorageCondition,
  type StorageType,
  type UVExposure,
  type AirQuality,
} from '../lib/utils/cardAgingSimService';

interface CardAgingLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_GRADES = ['PSA 10', 'BGS 9.5', 'PSA 9', 'PSA 8', 'PSA 7', 'Raw'];

const STORAGE_QUICK: { value: StorageType; label: string }[] = [
  { value: 'shoebox', label: 'Shoebox' },
  { value: 'penny_sleeve', label: 'Penny Sleeve' },
  { value: 'toploader', label: 'Toploader' },
  { value: 'one_touch', label: 'One-Touch' },
  { value: 'graded_case', label: 'Graded Slab' },
  { value: 'vault', label: 'Vault' },
];

function getScoreColor(score: number): string {
  if (score >= 85) return '#34d399';
  if (score >= 65) return '#3b82f6';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}

export const CardAgingLabModal: React.FC<CardAgingLabModalProps> = ({ isOpen, onClose }) => {
  const [grade, setGrade] = useState('PSA 10');
  const [storageType, setStorageType] = useState<StorageType>('toploader');
  const [temperature, setTemperature] = useState(72);
  const [humidity, setHumidity] = useState(50);
  const [uvExposure] = useState<UVExposure>('low');
  const [airQuality] = useState<AirQuality>('moderate');

  const conditions: StorageCondition = useMemo(
    () => ({
      temperature,
      humidity,
      uvExposure,
      airQuality,
      storageType,
      isClimateControlled: false,
    }),
    [temperature, humidity, uvExposure, airQuality, storageType]
  );

  const simulation = useMemo(() => simulateAging(grade, conditions), [grade, conditions]);

  if (!isOpen) return null;

  const proj5 = simulation.projections.find((p) => p.yearsFromNow === 5);
  const proj10 = simulation.projections.find((p) => p.yearsFromNow === 10);
  const proj25 = simulation.projections.find((p) => p.yearsFromNow === 25);

  const score = simulation.preservationScore.score;
  const scoreColor = getScoreColor(score);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-label="Card Aging Quick Check">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-700 flex items-center justify-between bg-brand-lime/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
              <FlaskConical size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  <FlaskConical size={10} />
                  Quick Check
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Card Aging <span className="text-brand-lime">Quick Check</span>
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

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Grade Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={12} className="text-brand-lime" />
              Current Grade
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    grade === g
                      ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={12} className="text-brand-lime" />
              Storage Type
            </label>
            <div className="flex flex-wrap gap-2">
              {STORAGE_QUICK.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStorageType(s.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    storageType === s.value
                      ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Thermometer size={12} /> Temperature
                </span>
                <span className="text-xs font-bold text-slate-200">{temperature}°F</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-brand-lime"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Droplets size={12} /> Humidity
                </span>
                <span className="text-xs font-bold text-slate-200">{humidity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-brand-lime"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            {/* Score + Degradation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full border-4 flex items-center justify-center"
                  style={{ borderColor: scoreColor }}
                >
                  <span className="text-lg font-bold text-white">{score}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">
                    {simulation.preservationScore.grade} - {simulation.preservationScore.label}
                  </div>
                  <div className="text-[10px] text-slate-500">Preservation Score</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-400">
                  {simulation.degradationRate.gradePointsPerYear} pts/yr
                </div>
                <div className="text-[10px] text-slate-500">Degradation Rate</div>
              </div>
            </div>

            {/* Timeline Projections */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '5 Years', proj: proj5 },
                { label: '10 Years', proj: proj10 },
                { label: '25 Years', proj: proj25 },
              ].map(({ label, proj }) =>
                proj ? (
                  <div key={label} className="p-3 bg-slate-700/30 rounded-xl text-center space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
                      <Clock size={10} />
                      {label}
                    </div>
                    <div className="text-sm font-bold text-slate-200">{proj.projectedGrade}</div>
                    <div className="text-xs text-slate-400">{proj.gradeNumeric.toFixed(1)}</div>
                    <div
                      className={`text-[10px] font-bold ${proj.valueChangePercent < 0 ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {proj.valueChangePercent > 0 ? '+' : ''}
                      {proj.valueChangePercent}% value
                    </div>
                  </div>
                ) : null
              )}
            </div>

            {/* Top Suggestions */}
            {simulation.preservationScore.suggestions.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Top Recommendations
                </h4>
                {simulation.preservationScore.suggestions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <ChevronRight size={10} className="text-brand-lime mt-0.5 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            )}

            {/* Upgrade suggestion */}
            {simulation.recommendations.length > 0 && (
              <div className="p-3 bg-brand-lime/5 border border-brand-lime/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield size={14} className="text-brand-lime mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-300">
                      <span className="font-bold text-brand-lime">Upgrade suggestion:</span>{' '}
                      Switch to{' '}
                      <span className="font-bold text-white">
                        {simulation.recommendations[0].label}
                      </span>{' '}
                      for {simulation.recommendations[0].protectionLevel}% protection (
                      {simulation.recommendations[0].gradeRetention25yr} grade at 25 years)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardAgingLabModal;
