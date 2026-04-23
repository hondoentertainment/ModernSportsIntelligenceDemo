// @ts-nocheck
import React, { useMemo } from 'react';
import {
  GitBranch,
  AlertTriangle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getCorrelationMatrix,
  getDiversificationScoreAnalysis,
  getMacroAlerts,
  getHedgeSignals,
  CardSegment,
  AssetClass,
} from '../lib/analytics/crossAssetCorrelationService';

interface CrossAssetCorrelationWidgetProps {
  inventory: CardInventory[];
  onExpand?: () => void;
}

function correlationColor(value: number): string {
  if (value >= 0.6) return 'bg-red-500';
  if (value >= 0.3) return 'bg-orange-400';
  if (value >= 0.1) return 'bg-yellow-400';
  if (value > -0.1) return 'bg-slate-500';
  if (value > -0.3) return 'bg-cyan-400';
  return 'bg-blue-500';
}

function correlationTextColor(value: number): string {
  if (value >= 0.6) return 'text-red-400';
  if (value >= 0.3) return 'text-orange-400';
  if (value >= 0.1) return 'text-yellow-400';
  if (value > -0.1) return 'text-slate-400';
  if (value > -0.3) return 'text-cyan-400';
  return 'text-blue-400';
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 25) return 'text-orange-400';
  return 'text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 75) return '#34d399';
  if (score >= 50) return '#facc15';
  if (score >= 25) return '#fb923c';
  return '#f87171';
}

const MINI_SEGMENTS: CardSegment[] = [
  'modern_basketball_rookies',
  'vintage_baseball',
  'modern_football',
  'pokemon_tcg',
];

const MINI_ASSETS: AssetClass[] = ['sp500', 'nasdaq', 'bitcoin', 'gold'];

const MINI_SEGMENT_SHORT: Record<string, string> = {
  modern_basketball_rookies: 'Bball',
  vintage_baseball: 'Vintage',
  modern_football: 'Football',
  pokemon_tcg: 'Pokemon',
};

const MINI_ASSET_SHORT: Record<string, string> = {
  sp500: 'S&P',
  nasdaq: 'NAS',
  bitcoin: 'BTC',
  gold: 'Gold',
};

export const CrossAssetCorrelationWidget: React.FC<CrossAssetCorrelationWidgetProps> = ({
  inventory,
  onExpand,
}) => {
  const matrix = useMemo(() => getCorrelationMatrix(90), []);
  const diversification = useMemo(
    () => getDiversificationScoreAnalysis(inventory),
    [inventory]
  );
  const macroAlerts = useMemo(() => getMacroAlerts(), []);
  const hedgeSignals = useMemo(() => getHedgeSignals(inventory), [inventory]);

  const topAlert = macroAlerts.find(a => a.severity === 'critical') || macroAlerts[0];
  const topHedge = hedgeSignals.find(h => h.priority === 'high') || hedgeSignals[0];

  const score = diversification.overall;
  const circumference = 2 * Math.PI * 36;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
            <GitBranch size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              CROSS-ASSET CORRELATION
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Macro Hedge Intelligence
            </p>
          </div>
        </div>
        {onExpand && (
          <button
            onClick={onExpand}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            Expand <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Mini Correlation Heatmap */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">
          Correlation Heatmap (90d)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr>
                <th className="text-left text-slate-500 pb-1 pr-1" />
                {MINI_ASSETS.map(a => (
                  <th
                    key={a}
                    className="text-center text-slate-400 pb-1 px-0.5 font-normal"
                  >
                    {MINI_ASSET_SHORT[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MINI_SEGMENTS.map(seg => (
                <tr key={seg}>
                  <td className="text-slate-400 pr-1 py-0.5 whitespace-nowrap">
                    {MINI_SEGMENT_SHORT[seg]}
                  </td>
                  {MINI_ASSETS.map(asset => {
                    const cell = matrix.cells.find(
                      c => c.segment === seg && c.asset === asset
                    );
                    const val = cell?.coefficient90d ?? 0;
                    return (
                      <td key={asset} className="px-0.5 py-0.5">
                        <div
                          className={`${correlationColor(val)} bg-opacity-30 rounded px-1 py-0.5 text-center ${correlationTextColor(val)} font-mono`}
                        >
                          {val > 0 ? '+' : ''}
                          {val.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diversification Score Gauge */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={scoreRingColor(score)}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bebas ${scoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400">Diversification Score</p>
          <p className={`text-lg font-bebas ${scoreColor(score)}`}>
            {score >= 75
              ? 'Well Diversified'
              : score >= 50
                ? 'Moderate'
                : score >= 25
                  ? 'Concentrated'
                  : 'High Risk'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Concentration: {diversification.concentrationRisk}% | Macro Exposure:{' '}
            {diversification.macroExposure}%
          </p>
        </div>
      </div>

      {/* Top Macro Alert */}
      {topAlert && (
        <div
          className={`rounded-xl p-3 border ${
            topAlert.severity === 'critical'
              ? 'bg-red-500/5 border-red-500/20'
              : topAlert.severity === 'warning'
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-blue-500/5 border-blue-500/20'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={14}
              className={
                topAlert.severity === 'critical'
                  ? 'text-red-400'
                  : topAlert.severity === 'warning'
                    ? 'text-amber-400'
                    : 'text-blue-400'
              }
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">
                {topAlert.title}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                {topAlert.recommendation}
              </p>
            </div>
            <span
              className={`text-xs font-mono flex-shrink-0 ${
                topAlert.historicalCardImpact >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {topAlert.historicalCardImpact >= 0 ? '+' : ''}
              {topAlert.historicalCardImpact.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Top Hedge Recommendation */}
      {topHedge && (
        <div className="rounded-xl p-3 border bg-indigo-500/5 border-indigo-500/20">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium">Hedge Signal</p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                {topHedge.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-red-400 font-mono">
                  {topHedge.currentCorrelation.toFixed(2)}
                </span>
                <ArrowRight size={10} className="text-slate-500" />
                <span className="text-[10px] text-green-400 font-mono">
                  {topHedge.projectedCorrelation.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 ml-auto">
                  {topHedge.confidence}% conf
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossAssetCorrelationWidget;
