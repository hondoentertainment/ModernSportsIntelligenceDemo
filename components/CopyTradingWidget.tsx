import React, { useMemo } from 'react';
import {
  Trophy,
  Users,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Star,
} from 'lucide-react';
import {
  getLeaderboard,
  getMyFollowing,
  getTradeSignals,
  getCommunityBenchmark,
  LeaderboardEntry,
  TradeSignal,
} from '../lib/trading/copyTradingService';

interface CopyTradingWidgetProps {
  onClick?: () => void;
}

function formatROI(roi: number): string {
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const CopyTradingWidget: React.FC<CopyTradingWidgetProps> = ({ onClick }) => {
  const leaderboard = useMemo(() => getLeaderboard().slice(0, 3), []);
  const following = useMemo(() => getMyFollowing(), []);
  const signals = useMemo(() => getTradeSignals('current_user').slice(0, 1), []);
  const benchmark = useMemo(() => getCommunityBenchmark(), []);

  const latestSignal: TradeSignal | undefined = signals[0];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Copy size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Copy <span className="text-amber-400">Trading</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Alpha Leaderboard Network
            </p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>

      {/* Your Performance */}
      <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Your Performance
          </p>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400">
              Top {100 - benchmark.percentile}%
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-lg font-bold text-white">{formatROI(benchmark.userROI)}</p>
            <p className="text-[9px] text-slate-500 uppercase">Annual ROI</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">#{benchmark.rank}</p>
            <p className="text-[9px] text-slate-500 uppercase">Rank</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{following.length}</p>
            <p className="text-[9px] text-slate-500 uppercase">Following</p>
          </div>
        </div>
      </div>

      {/* Top 3 Leaderboard */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Top Performers
        </p>
        <div className="space-y-2">
          {leaderboard.map((entry: LeaderboardEntry, i: number) => (
            <div
              key={entry.collector.id}
              className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-amber-500/20 text-amber-400' :
                  i === 1 ? 'bg-slate-400/20 text-slate-300' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {i + 1}
                </div>
                <div className="text-lg">{entry.collector.avatarUrl}</div>
                <div>
                  <p className="text-sm font-bold text-white">{entry.collector.displayName}</p>
                  <p className="text-[9px] text-slate-500">{entry.collector.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${entry.metrics.annualizedROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatROI(entry.metrics.annualizedROI)}
                </p>
                <p className="text-[9px] text-slate-500 flex items-center justify-end gap-1">
                  <Users size={9} />
                  {entry.collector.followerCount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Signal */}
      {latestSignal && (
        <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Latest Signal
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-md ${latestSignal.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {latestSignal.action === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate max-w-[180px]">
                  {latestSignal.cardName}
                </p>
                <p className="text-[9px] text-slate-500">
                  {latestSignal.collectorName} &middot; {timeAgo(latestSignal.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white">${latestSignal.price.toLocaleString()}</p>
              <p className={`text-[9px] font-bold uppercase ${latestSignal.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {latestSignal.action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-slate-500">
          <TrendingUp size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {leaderboard.length > 0 ? `${leaderboard[0].collector.displayName} leads` : 'View leaderboard'}
          </span>
        </div>
        <Trophy size={14} className="text-amber-500/40" />
      </div>
    </button>
  );
};

export default CopyTradingWidget;
