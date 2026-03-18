import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity,
  Flame,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getHotColdList,
  getSportIndexes,
} from '../lib/analytics/playerIndexService';

interface PlayerIndexWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

// Mini sparkline rendered as SVG
const MiniSparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({
  data,
  color,
  width = 60,
  height = 20,
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Tiny pie chart as SVG
const MiniPieChart: React.FC<{ slices: { label: string; value: number; color: string }[]; size?: number }> = ({
  slices,
  size = 80,
}) => {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  let startAngle = -90;

  const paths = slices.map((slice, i) => {
    const pct = slice.value / total;
    const angle = pct * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    startAngle = endAngle;

    return <path key={i} d={path} fill={slice.color} opacity={0.85} />;
  });

  return (
    <svg width={size} height={size}>
      {paths}
    </svg>
  );
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const PlayerIndexWidget: React.FC<PlayerIndexWidgetProps> = ({ cards, onClick }) => {
  // Top 5 hot players
  const hotPlayers = useMemo(() => {
    const list = getHotColdList(cards, '24h');
    return list.filter(e => e.changePct > 0).slice(0, 5);
  }, [cards]);

  // Portfolio player exposure (top 5 players by value in user's cards)
  const playerExposure = useMemo(() => {
    const byPlayer: Record<string, number> = {};
    cards.forEach(c => {
      const val = c.currentValue ?? c.purchasePrice;
      byPlayer[c.player] = (byPlayer[c.player] || 0) + val;
    });
    const sorted = Object.entries(byPlayer)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return sorted.map(([label, value], i) => ({
      label,
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [cards]);

  // Sport index sparklines
  const sportIndexes = useMemo(() => getSportIndexes(cards), [cards]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Player <span className="text-blue-400">Market Index</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Performance tracker & market intelligence
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Hot Players */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
          <Flame size={12} className="text-orange-400" />
          Today's Hot Players
        </div>
        <div className="space-y-1">
          {hotPlayers.map(player => (
            <div
              key={player.playerName}
              className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-xl text-xs"
            >
              <span className="flex-1 text-white font-medium truncate">
                {player.playerName}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">
                {player.sport.slice(0, 3)}
              </span>
              <MiniSparkline data={player.sparkline} color="#10b981" width={40} height={14} />
              <span className="text-green-400 font-bold font-mono w-16 text-right">
                +{player.changePct.toFixed(1)}%
              </span>
            </div>
          ))}
          {hotPlayers.length === 0 && (
            <div className="text-xs text-slate-500 px-3 py-2">No hot players today</div>
          )}
        </div>
      </div>

      {/* Player Exposure Pie + Sport Sparklines */}
      <div className="flex items-start gap-6">
        {/* Pie chart */}
        {playerExposure.length > 0 && (
          <div className="flex-shrink-0">
            <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
              Top Exposure
            </div>
            <MiniPieChart slices={playerExposure} size={72} />
          </div>
        )}

        {/* Sport Sparklines */}
        <div className="flex-1 space-y-1.5">
          <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Sport Indexes
          </div>
          {sportIndexes.map(si => (
            <div key={si.sport} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-slate-400 truncate">{si.sport}</span>
              <MiniSparkline
                data={si.sparkline}
                color={si.change30d >= 0 ? '#10b981' : '#ef4444'}
                width={48}
                height={14}
              />
              <span
                className={`font-mono font-bold w-14 text-right ${
                  si.change30d >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {si.change30d >= 0 ? '+' : ''}
                {si.change30d.toFixed(1)}%
              </span>
              {si.change30d >= 0 ? (
                <TrendingUp size={12} className="text-green-400" />
              ) : (
                <TrendingDown size={12} className="text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-400 bg-blue-500/5 border border-blue-500/15 rounded-xl">
        <Activity size={14} />
        Open Player Index
      </div>
    </button>
  );
};

export default PlayerIndexWidget;
