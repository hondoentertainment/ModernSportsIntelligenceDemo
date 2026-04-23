// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Gift,
  AlertTriangle,
  Zap,
  Trophy,
  DollarSign,
  Star,
  Clock,
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  Award,
} from 'lucide-react';
import {
  getAvailablePacks,
  getPackHistory,
  getDailyDeals,
  getJackpotInfo,
  getLeaderboard,
  getSeasonPass,
  getCollectorProfile,
  calculateExpectedValue,
  getStreakBonus,
  getRarityConfig,
  getTierConfig,
  formatCurrency,
  type VendingPack,
  type OpenedPack,
  type DailyDeal,
  type Jackpot,
  type LeaderboardEntry,
  type SeasonPass,
  type CollectorProfile,
} from '../lib/trading/vendingMachineService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const RARITY_COLORS: Record<string, string> = {
  common: '#64748b',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  ultra_rare: '#a855f7',
  legendary: '#f59e0b',
};

const VendingMachine: React.FC = () => {
  const [packs, setPacks] = useState<VendingPack[]>([]);
  const [history, setHistory] = useState<OpenedPack[]>([]);
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [jackpot, setJackpot] = useState<Jackpot | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [seasonPass, setSeasonPass] = useState<SeasonPass | null>(null);
  const [profile, setProfile] = useState<CollectorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPacks(getAvailablePacks());
      setHistory(getPackHistory());
      setDeals(getDailyDeals());
      setJackpot(getJackpotInfo());
      setLeaderboard(getLeaderboard());
      setSeasonPass(getSeasonPass());
      setProfile(getCollectorProfile());
      setLoading(false);
    } catch  {
      setError('Failed to load Vending Machine data');
      setLoading(false);
    }
  }, []);

  const totalSpent = useMemo(() => history.reduce((s, h) => s + h.pricePaid, 0), [history]);
  const totalValue = useMemo(() => history.reduce((s, h) => s + h.totalValue, 0), [history]);
  const totalProfit = totalValue - totalSpent;
  const overallROI = totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;

  const rarityDistribution = useMemo(() => {
    const allCards = history.flatMap(h => h.cards);
    const counts: Record<string, number> = {};
    allCards.forEach(c => { counts[c.rarity] = (counts[c.rarity] || 0) + 1; });
    return Object.entries(counts).map(([rarity, count]) => ({
      name: getRarityConfig(rarity as any).label,
      value: count,
      color: RARITY_COLORS[rarity] || '#64748b',
    }));
  }, [history]);

  const evByTier = useMemo(() => {
    const tiers: ('bronze' | 'silver' | 'gold' | 'platinum' | 'diamond')[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    return tiers.map(tier => {
      const tierPacks = packs.filter(p => p.tier === tier);
      const tierHistory = history.filter(h => h.tier === tier);
      const avgEV = tierPacks.length > 0
        ? tierPacks.reduce((s, p) => s + calculateExpectedValue(p.id).ev, 0) / tierPacks.length
        : 0;
      const avgActual = tierHistory.length > 0
        ? tierHistory.reduce((s, h) => s + h.totalValue, 0) / tierHistory.length
        : 0;
      return { tier: getTierConfig(tier).label, expectedValue: Math.round(avgEV * 100) / 100, actualValue: Math.round(avgActual * 100) / 100 };
    });
  }, [packs, history]);

  const spendByDay = useMemo(() => {
    const byDate = new Map<string, { spent: number; value: number }>();
    history.forEach(h => {
      const date = new Date(h.openedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = byDate.get(date) || { spent: 0, value: 0 };
      existing.spent += h.pricePaid;
      existing.value += h.totalValue;
      byDate.set(date, existing);
    });
    return Array.from(byDate.entries()).map(([date, data]) => ({ date, spent: data.spent, value: data.value }));
  }, [history]);

  const streakInfo = useMemo(() => getStreakBonus(), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Vending Machine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Gift size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AI Vending Machine & Impulse Pack Simulator</h1>
            <p className="text-sm text-slate-400">Gamified pack-opening simulator with AI-themed mystery packs &mdash; Phase 139</p>
          </div>
        </div>
        {profile && (
          <span className="px-3 py-1.5 text-sm font-bold bg-violet-500/20 text-violet-300 rounded-full">
            Level {profile.level} &middot; {profile.streak} Day Streak
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-slate-600 mt-1">{history.length} packs</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Profit / Loss</p>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Overall ROI</p>
          <p className={`text-2xl font-bold ${overallROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Jackpot Pool</p>
          <p className="text-2xl font-bold text-violet-400">{jackpot ? formatCurrency(jackpot.poolAmount) : '$0'}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Streak Bonus</p>
          <p className="text-2xl font-bold text-amber-400">{streakInfo.bonusMultiplier}x</p>
          <p className="text-xs text-slate-600 mt-1">{streakInfo.currentStreak} day streak</p>
        </div>
      </div>

      {/* Pack Store + Daily Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Package size={18} className="text-brand-lime" />
            Pack Store
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {packs.map(pack => {
              const tierCfg = getTierConfig(pack.tier);
              const ev = calculateExpectedValue(pack.id);
              return (
                <div key={pack.id} className={`bg-slate-900/50 border rounded-xl p-4 ${tierCfg.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tierCfg.bg} ${tierCfg.text}`}>
                      {tierCfg.label}
                    </span>
                    {pack.limitedEdition && (
                      <span className="text-[10px] font-bold text-red-400 uppercase">Limited</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{pack.name}</p>
                  <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{pack.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brand-lime">{formatCurrency(pack.price)}</span>
                    <span className="text-[10px] text-slate-500">EV: {formatCurrency(ev.ev)}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">{pack.cardsPerPack} cards/pack &middot; Stock: {pack.stock}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-400" />
            Daily Deals
          </h2>
          <div className="space-y-3">
            {deals.map(deal => (
              <div key={deal.id} className={`p-3 rounded-xl border ${deal.featured ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-900/50 border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white">{deal.packName}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    -{deal.discount}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 line-through">{formatCurrency(deal.originalPrice)}</span>
                  <span className="text-sm font-bold text-amber-400">{formatCurrency(deal.dealPrice)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={10} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500">Expires: {new Date(deal.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row: Rarity Distribution + EV by Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Star size={18} className="text-purple-400" />
            Pull Rarity Distribution
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rarityDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {rarityDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Expected vs Actual Value by Tier
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evByTier}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [formatCurrency(value)]} />
                <Bar dataKey="expectedValue" fill="#3b82f6" name="Expected Value" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualValue" fill="#84cc16" name="Actual Value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> Expected</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-brand-lime rounded" /> Actual</span>
          </div>
        </div>
      </div>

      {/* Spend vs Value Over Time */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-emerald-400" />
          Spend vs Value Over Time
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [formatCurrency(value)]} />
              <Area type="monotone" dataKey="spent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Spent" />
              <Area type="monotone" dataKey="value" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} name="Value" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pack History */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Package size={18} className="text-blue-400" />
          Pack Opening History
        </h2>
        <div className="space-y-3">
          {history.slice(0, 10).map(op => {
            const tierCfg = getTierConfig(op.tier);
            return (
              <div key={op.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tierCfg.bg} ${tierCfg.text}`}>
                        {tierCfg.label}
                      </span>
                      <p className="text-sm font-bold text-white">{op.packName}</p>
                      {op.streakBonus && <Zap size={12} className="text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(op.openedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${op.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {op.profit >= 0 ? '+' : ''}{formatCurrency(op.profit)}
                    </p>
                    <p className="text-[10px] text-slate-500">Paid: {formatCurrency(op.pricePaid)} &middot; Value: {formatCurrency(op.totalValue)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {op.cards.map((card, idx) => {
                    const cfg = getRarityConfig(card.rarity);
                    return (
                      <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {card.player} &mdash; {formatCurrency(card.estimatedValue)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jackpot + Season Pass Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jackpot Tracker */}
        {jackpot && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-amber-400" />
              Jackpot Tracker
            </h2>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-amber-400">{formatCurrency(jackpot.poolAmount)}</p>
              <p className="text-xs text-slate-500 mt-1">Current Pool &middot; {jackpot.contributions} contributions</p>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full mb-4">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${Math.min(100, (jackpot.poolAmount / 20000) * 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <p className="text-[10px] text-slate-500">Last Winner</p>
                <p className="text-xs font-bold text-white">{jackpot.lastWinner}</p>
                <p className="text-[10px] text-amber-400">{formatCurrency(jackpot.lastWinAmount)}</p>
              </div>
              <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <p className="text-[10px] text-slate-500">Next Draw</p>
                <p className="text-xs font-bold text-white">{new Date(jackpot.nextDrawDate).toLocaleDateString()}</p>
                <p className="text-[10px] text-slate-500">Ticket: {formatCurrency(jackpot.ticketCost)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Season Pass */}
        {seasonPass && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Award size={18} className="text-violet-400" />
              Season Pass
            </h2>
            <p className="text-sm text-white font-medium mb-2">{seasonPass.seasonName}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400">Tier {seasonPass.currentTier}/{seasonPass.maxTiers}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" style={{ width: `${(seasonPass.xpEarned / seasonPass.xpRequired) * 100}%` }} />
              </div>
              <span className="text-xs text-violet-400">{seasonPass.xpEarned.toLocaleString()}/{seasonPass.xpRequired.toLocaleString()} XP</span>
            </div>
            <div className="space-y-2">
              {seasonPass.rewards.map(reward => (
                <div key={reward.tier} className={`flex items-center gap-3 p-2 rounded-lg border ${reward.claimed ? 'bg-emerald-500/5 border-emerald-500/20' : reward.tier <= seasonPass.currentTier ? 'bg-violet-500/5 border-violet-500/20' : 'bg-slate-900/30 border-slate-700/20 opacity-50'}`}>
                  <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${reward.claimed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {reward.tier}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{reward.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{reward.description}</p>
                  </div>
                  {reward.claimed && <span className="text-[10px] text-emerald-400 font-bold">Claimed</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Users size={18} className="text-cyan-400" />
          Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Rank</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">User</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Total Value</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Best Pull</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Packs</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">ROI</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Streak</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Level</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(entry => (
                <tr key={entry.rank} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-3">
                    <span className={`font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>#{entry.rank}</span>
                  </td>
                  <td className="py-2 px-3 text-white font-medium">{entry.username}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">{formatCurrency(entry.totalValue)}</td>
                  <td className="py-2 px-3 text-slate-400 text-xs truncate max-w-[200px]">{entry.bestPull}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{entry.packsOpened}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={entry.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {entry.roi >= 0 ? '+' : ''}{entry.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-amber-400">{entry.streak}</td>
                  <td className="py-2 px-3 text-right text-violet-400">{entry.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsible Collecting */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-emerald-400" />
          Responsible Collecting
        </h2>
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Daily Budget</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">{formatCurrency(profile.spentToday)} / {formatCurrency(profile.dailyBudget)}</span>
                <span className={`text-xs font-bold ${profile.spentToday / profile.dailyBudget > 0.8 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {((profile.spentToday / profile.dailyBudget) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full">
                <div
                  className={`h-full rounded-full ${profile.spentToday / profile.dailyBudget > 0.8 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (profile.spentToday / profile.dailyBudget) * 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Weekly Budget</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">{formatCurrency(profile.spentThisWeek)} / {formatCurrency(profile.weeklyBudget)}</span>
                <span className={`text-xs font-bold ${profile.spentThisWeek / profile.weeklyBudget > 0.8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {((profile.spentThisWeek / profile.weeklyBudget) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full">
                <div
                  className={`h-full rounded-full ${profile.spentThisWeek / profile.weeklyBudget > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (profile.spentThisWeek / profile.weeklyBudget) * 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Collecting Tips</p>
              <ul className="space-y-1">
                <li className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-400 flex-shrink-0" />
                  Set a budget before opening packs
                </li>
                <li className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-400 flex-shrink-0" />
                  Track your ROI over time, not per pack
                </li>
                <li className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-400 flex-shrink-0" />
                  Higher tier packs have better EV ratios
                </li>
                <li className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-400 flex-shrink-0" />
                  Take breaks between sessions
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendingMachine;
