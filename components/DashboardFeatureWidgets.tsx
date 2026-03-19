import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dna,
  HeartPulse,
  GitCompareArrows,
  ShieldAlert,
  Timer,
  Sprout,
  Waves,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { getAllGenomes, type GenomeProfile } from '../lib/core/cardGenomeService.ts';
import { getInjuryProbabilities, type InjuryProbability } from '../lib/analytics/injuryIntelService.ts';
import { getAssetCorrelations, type AssetCorrelation } from '../lib/analytics/crossAssetCorrelationService.ts';
import { getStressTestResults, type StressTestResult } from '../lib/analytics/portfolioStressTestService.ts';
import { getActiveOpportunities, type ArbitrageOpportunity } from '../lib/analytics/temporalArbitrageService.ts';
import { getFarmMetrics, type YieldFarmMetrics } from '../lib/utils/yieldFarmingService.ts';
import { getMarketEntropy, type MarketEntropy } from '../lib/analytics/chaosTheoryService.ts';
import { getAllLiquidityProfiles, type LiquidityProfile } from '../lib/analytics/liquidityDepthService.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetConfig {
  id: string;
  label: string;
  route: string;
  color: string;        // tailwind ring / accent color
  bgColor: string;      // subtle background tint
  icon: React.ReactNode;
}

type TrendDirection = 'up' | 'down' | 'flat';

interface WidgetData {
  value: string;
  subLabel: string;
  trend: TrendDirection;
  barPercent?: number;   // optional 0-100 for mini bar
  barColor?: string;     // tailwind bg class for bar fill
  statusColor?: string;  // dot color override
}

// ---------------------------------------------------------------------------
// Widget definitions (static config)
// ---------------------------------------------------------------------------

const WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: 'genome',
    label: 'Genome Score',
    route: '/card-genome-sequencer',
    color: 'ring-violet-500/40',
    bgColor: 'bg-violet-500/5',
    icon: <Dna size={16} className="text-violet-400" />,
  },
  {
    id: 'injury',
    label: 'Injury Alert',
    route: '/injury-oracle',
    color: 'ring-red-500/40',
    bgColor: 'bg-red-500/5',
    icon: <HeartPulse size={16} className="text-red-400" />,
  },
  {
    id: 'crossAsset',
    label: 'Cross-Asset Alpha',
    route: '/cross-asset-correlation',
    color: 'ring-cyan-500/40',
    bgColor: 'bg-cyan-500/5',
    icon: <GitCompareArrows size={16} className="text-cyan-400" />,
  },
  {
    id: 'var',
    label: 'Portfolio VaR',
    route: '/portfolio-stress-tester',
    color: 'ring-amber-500/40',
    bgColor: 'bg-amber-500/5',
    icon: <ShieldAlert size={16} className="text-amber-400" />,
  },
  {
    id: 'arbitrage',
    label: 'Arbitrage Signals',
    route: '/temporal-arbitrage-radar',
    color: 'ring-emerald-500/40',
    bgColor: 'bg-emerald-500/5',
    icon: <Timer size={16} className="text-emerald-400" />,
  },
  {
    id: 'yield',
    label: 'Yield APY',
    route: '/card-yield-farming',
    color: 'ring-lime-500/40',
    bgColor: 'bg-lime-500/5',
    icon: <Sprout size={16} className="text-lime-400" />,
  },
  {
    id: 'entropy',
    label: 'Market Entropy',
    route: '/chaos-theory-simulator',
    color: 'ring-fuchsia-500/40',
    bgColor: 'bg-fuchsia-500/5',
    icon: <Waves size={16} className="text-fuchsia-400" />,
  },
  {
    id: 'liquidity',
    label: 'Liquidity Score',
    route: '/liquidity-depth-scanner',
    color: 'ring-sky-500/40',
    bgColor: 'bg-sky-500/5',
    icon: <Droplets size={16} className="text-sky-400" />,
  },
];

// ---------------------------------------------------------------------------
// Trend arrow component
// ---------------------------------------------------------------------------

const TrendArrow: React.FC<{ direction: TrendDirection }> = ({ direction }) => {
  if (direction === 'up')
    return <TrendingUp size={12} className="text-emerald-400" />;
  if (direction === 'down')
    return <TrendingDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-slate-500" />;
};

// ---------------------------------------------------------------------------
// Data derivation helpers
// ---------------------------------------------------------------------------

function deriveGenomeData(genomes: GenomeProfile[]): WidgetData {
  if (genomes.length === 0)
    return { value: '--', subLabel: 'No data', trend: 'flat' };
  const top = genomes.reduce((a, b) =>
    a.overallGenomeScore > b.overallGenomeScore ? a : b,
  );
  return {
    value: top.overallGenomeScore.toFixed(1),
    subLabel: top.cardName.length > 18 ? top.cardName.slice(0, 18) + '...' : top.cardName,
    trend: top.overallGenomeScore >= 80 ? 'up' : top.overallGenomeScore >= 50 ? 'flat' : 'down',
    barPercent: top.overallGenomeScore,
    barColor:
      top.overallGenomeScore >= 80
        ? 'bg-violet-400'
        : top.overallGenomeScore >= 50
          ? 'bg-violet-300'
          : 'bg-violet-200',
  };
}

function deriveInjuryData(injuries: InjuryProbability[]): WidgetData {
  const highRisk = injuries.filter((p) => p.injuryRisk >= 70);
  const count = highRisk.length;
  return {
    value: String(count),
    subLabel: count === 0 ? 'All clear' : `high-risk player${count > 1 ? 's' : ''}`,
    trend: count > 2 ? 'down' : count === 0 ? 'up' : 'flat',
    statusColor: count >= 3 ? 'bg-red-500' : count >= 1 ? 'bg-amber-500' : 'bg-emerald-500',
  };
}

function deriveCrossAssetData(correlations: AssetCorrelation[]): WidgetData {
  const sp500 = correlations.find(
    (c) => c.asset === 'sp500' || c.label?.toLowerCase().includes('s&p'),
  );
  const corr = sp500 ? sp500.correlation90d : correlations[0]?.correlation90d ?? 0;
  return {
    value: corr.toFixed(2),
    subLabel: 'vs S&P 500 (90d)',
    trend: corr > 0.3 ? 'up' : corr < -0.1 ? 'down' : 'flat',
  };
}

function deriveVaRData(results: StressTestResult[]): WidgetData {
  if (results.length === 0)
    return { value: '--', subLabel: 'No tests run', trend: 'flat' };
  // 95% VaR approximation: sort impacts, take 95th percentile worst
  const impacts = results.map((r) => Math.abs(r.impactPercent)).sort((a, b) => b - a);
  const idx95 = Math.max(0, Math.floor(impacts.length * 0.05));
  const var95 = impacts[idx95] ?? impacts[0];
  return {
    value: `-${var95.toFixed(1)}%`,
    subLabel: '95% confidence',
    trend: var95 > 20 ? 'down' : var95 > 10 ? 'flat' : 'up',
  };
}

function deriveArbitrageData(opps: ArbitrageOpportunity[]): WidgetData {
  return {
    value: String(opps.length),
    subLabel: opps.length === 1 ? 'active window' : 'active windows',
    trend: opps.length >= 5 ? 'up' : opps.length >= 2 ? 'flat' : 'down',
  };
}

function deriveYieldData(metrics: YieldFarmMetrics): WidgetData {
  return {
    value: `${metrics.avgAPY.toFixed(1)}%`,
    subLabel: `TVL $${(metrics.totalValueLocked / 1000).toFixed(0)}k`,
    trend: metrics.avgAPY >= 10 ? 'up' : metrics.avgAPY >= 5 ? 'flat' : 'down',
  };
}

function deriveEntropyData(entropy: MarketEntropy): WidgetData {
  const level = entropy.current;
  const gaugeColor =
    level >= 75 ? 'bg-red-500' : level >= 50 ? 'bg-amber-500' : 'bg-emerald-500';
  return {
    value: level.toFixed(1),
    subLabel: entropy.interpretation.length > 22
      ? entropy.interpretation.slice(0, 22) + '...'
      : entropy.interpretation,
    trend: entropy.trend === 'increasing' ? 'up' : entropy.trend === 'decreasing' ? 'down' : 'flat',
    barPercent: Math.min(level, 100),
    barColor: gaugeColor,
  };
}

function deriveLiquidityData(profiles: LiquidityProfile[]): WidgetData {
  if (profiles.length === 0)
    return { value: '--', subLabel: 'No data', trend: 'flat' };
  const avg =
    profiles.reduce((s, p) => s + p.liquidityScore, 0) / profiles.length;
  return {
    value: avg.toFixed(0),
    subLabel: `across ${profiles.length} cards`,
    trend: avg >= 70 ? 'up' : avg >= 40 ? 'flat' : 'down',
    barPercent: avg,
    barColor:
      avg >= 70 ? 'bg-sky-400' : avg >= 40 ? 'bg-sky-300' : 'bg-sky-200',
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const DashboardFeatureWidgets: React.FC = () => {
  const navigate = useNavigate();

  // Raw async data
  const [genomes, setGenomes] = useState<GenomeProfile[]>([]);
  const [injuries, setInjuries] = useState<InjuryProbability[]>([]);
  const [correlations, setCorrelations] = useState<AssetCorrelation[]>([]);
  const [stressResults, setStressResults] = useState<StressTestResult[]>([]);
  const [arbitrageOpps, setArbitrageOpps] = useState<ArbitrageOpportunity[]>([]);
  const [yieldMetrics, setYieldMetrics] = useState<YieldFarmMetrics | null>(null);
  const [entropy, setEntropy] = useState<MarketEntropy | null>(null);
  const [liquidityProfiles, setLiquidityProfiles] = useState<LiquidityProfile[]>([]);

  useEffect(() => {
    // Fire all data fetches in parallel
    getAllGenomes().then(setGenomes).catch(() => {});
    setInjuries(getInjuryProbabilities());
    // crossAssetCorrelation needs cards param - call with empty to get market defaults
    setCorrelations(getAssetCorrelations([]));
    setStressResults(getStressTestResults());
    getActiveOpportunities().then(setArbitrageOpps).catch(() => {});
    getFarmMetrics().then(setYieldMetrics).catch(() => {});
    setEntropy(getMarketEntropy());
    getAllLiquidityProfiles().then(setLiquidityProfiles).catch(() => {});
  }, []);

  // Derive display data per widget using useMemo
  const widgetDataMap = useMemo<Record<string, WidgetData>>(() => {
    const defaultData: WidgetData = { value: '...', subLabel: 'Loading', trend: 'flat' };
    return {
      genome: genomes.length > 0 ? deriveGenomeData(genomes) : defaultData,
      injury: deriveInjuryData(injuries),
      crossAsset: deriveCrossAssetData(correlations),
      var: deriveVaRData(stressResults),
      arbitrage: deriveArbitrageData(arbitrageOpps),
      yield: yieldMetrics ? deriveYieldData(yieldMetrics) : defaultData,
      entropy: entropy ? deriveEntropyData(entropy) : defaultData,
      liquidity: liquidityProfiles.length > 0 ? deriveLiquidityData(liquidityProfiles) : defaultData,
    };
  }, [genomes, injuries, correlations, stressResults, arbitrageOpps, yieldMetrics, entropy, liquidityProfiles]);

  return (
    <div className="reveal-section animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '300ms' }}>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500 whitespace-nowrap">
          Intelligence Signals
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Widget grid - 4 columns on lg, 2 on md, 1 on sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {WIDGET_CONFIGS.map((cfg) => {
          const data = widgetDataMap[cfg.id];
          return (
            <button
              key={cfg.id}
              onClick={() => navigate(cfg.route)}
              className={`
                group relative overflow-hidden rounded-2xl border border-slate-800
                ${cfg.bgColor} hover:border-slate-700
                px-4 py-3 text-left transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20
                focus:outline-none focus:ring-2 ${cfg.color}
              `}
              style={{ maxHeight: 120 }}
            >
              {/* Top row: icon + label + trend */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-slate-800/60">{cfg.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {data.statusColor && (
                    <span className={`w-1.5 h-1.5 rounded-full ${data.statusColor} animate-pulse`} />
                  )}
                  <TrendArrow direction={data.trend} />
                </div>
              </div>

              {/* Value */}
              <div className="text-2xl font-mono font-bold text-white leading-none mb-1 tracking-tight">
                {data.value}
              </div>

              {/* Sub-label */}
              <p className="text-[10px] text-slate-500 font-medium truncate leading-tight">
                {data.subLabel}
              </p>

              {/* Optional mini bar */}
              {data.barPercent !== undefined && (
                <div className="mt-1.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${data.barColor ?? 'bg-slate-600'}`}
                    style={{ width: `${Math.min(data.barPercent, 100)}%` }}
                  />
                </div>
              )}

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/[0.03] to-transparent" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardFeatureWidgets;
