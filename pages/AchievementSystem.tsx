import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Star,
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  Users,
  Award,
  Target,
  Zap,
  ChevronRight,
  CheckCircle,
  Circle,
  Flame,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  getAchievements,
  getAchievementsByCategory,
  getUnlockedAchievements,
  getLockedAchievements,
  getCollectorLevel,
  getSeasonalChallenges,
  getLeaderboard,
  getAchievementStats,
  getRecentUnlocks,
  getNextAchievements,
  formatXP,
  getTierColor,
  getTierLabel,
  getCategoryColor,
  getCategoryLabel,
  getProgressColor,
  type Achievement,
  type AchievementCategory,
  type SeasonalChallenge,
  type LeaderboardEntry,
} from '../lib/utils/achievementSystemService.ts';

type TabId = 'achievements' | 'level' | 'seasonal' | 'leaderboard';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'achievements', label: 'Achievements', icon: <Trophy size={18} /> },
  { id: 'level', label: 'Level & XP', icon: <TrendingUp size={18} /> },
  { id: 'seasonal', label: 'Seasonal', icon: <Calendar size={18} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Users size={18} /> },
];

const CATEGORIES: AchievementCategory[] = ['collection', 'trading', 'grading', 'social', 'financial', 'milestone'];

const AchievementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const achievements = useMemo(() => getAchievements(), []);
  const stats = useMemo(() => getAchievementStats(), []);
  const level = useMemo(() => getCollectorLevel(), []);
  const seasonal = useMemo(() => getSeasonalChallenges(), []);
  const leaderboard = useMemo(() => getLeaderboard(), []);
  const recentUnlocks = useMemo(() => getRecentUnlocks(5), []);
  const nextAchievements = useMemo(() => getNextAchievements(4), []);

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return achievements;
    return getAchievementsByCategory(selectedCategory);
  }, [achievements, selectedCategory]);

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: getCategoryLabel(cat),
      value: achievements.filter(a => a.category === cat && a.unlocked).length,
      color: getCategoryColor(cat),
    }));
  }, [achievements]);

  const renderAchievementCard = (achievement: Achievement) => (
    <div
      key={achievement.id}
      className={`rounded-xl p-4 border transition-all ${
        achievement.unlocked
          ? 'bg-slate-800 border-slate-600 hover:border-slate-500'
          : 'bg-slate-800/50 border-slate-700/50 opacity-75'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${getTierColor(achievement.tier)}20`, border: `2px solid ${getTierColor(achievement.tier)}` }}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm truncate">{achievement.name}</h3>
            {achievement.unlocked ? (
              <Unlock size={14} className="text-green-400 shrink-0" />
            ) : (
              <Lock size={14} className="text-slate-500 shrink-0" />
            )}
          </div>
          <p className="text-slate-400 text-xs mt-0.5">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: getTierColor(achievement.tier), backgroundColor: `${getTierColor(achievement.tier)}20` }}
            >
              {getTierLabel(achievement.tier)}
            </span>
            <span className="text-xs text-slate-500">{formatXP(achievement.xpReward)}</span>
          </div>
          {!achievement.unlocked && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{achievement.progress}/{achievement.target}</span>
                <span className="text-slate-500">{Math.round(achievement.progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${achievement.progressPercent}%`, backgroundColor: getProgressColor(achievement.progressPercent) }}
                />
              </div>
            </div>
          )}
          {achievement.unlocked && achievement.unlockedDate && (
            <p className="text-xs text-green-400/70 mt-1">Unlocked {achievement.unlockedDate}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Unlocked', value: `${stats.unlockedCount}/${stats.totalAchievements}`, icon: <Trophy size={20} className="text-yellow-400" /> },
          { label: 'Total XP', value: formatXP(stats.totalXP), icon: <Star size={20} className="text-blue-400" /> },
          { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: <Flame size={20} className="text-orange-400" /> },
          { label: 'Rarest', value: stats.rarest.name, icon: <Award size={20} className="text-purple-400" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">{stat.icon}<span className="text-slate-400 text-xs">{stat.label}</span></div>
            <p className="text-white font-bold text-lg">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(renderAchievementCard)}
      </div>
    </div>
  );

  const renderLevelTab = () => (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{level.level}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{level.title}</h2>
            <p className="text-slate-400">{formatXP(level.totalXP)} total</p>
          </div>
        </div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Level {level.level}</span>
          <span className="text-slate-400">Level {level.level + 1}</span>
        </div>
        <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${level.progressPercent}%` }}
          />
        </div>
        <p className="text-center text-slate-400 text-sm mt-2">{formatXP(level.xpToNext)} to next level</p>
      </div>

      {/* Perks */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Active Perks</h3>
        <div className="space-y-2">
          {level.perks.map(perk => (
            <div key={perk} className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-slate-300">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-bold text-lg mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Unlocks */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-bold text-lg mb-4">Recent Unlocks</h3>
          <div className="space-y-3">
            {recentUnlocks.map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{a.name}</p>
                  <p className="text-slate-500 text-xs">{a.unlockedDate}</p>
                </div>
                <span className="text-xs text-blue-400">+{formatXP(a.xpReward)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Achievements */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Target size={20} className="text-green-400" /> Next Achievable</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextAchievements.map(renderAchievementCard)}
        </div>
      </div>
    </div>
  );

  const renderSeasonalTab = () => (
    <div className="space-y-6">
      {seasonal.map((challenge: SeasonalChallenge) => (
        <div key={challenge.id} className={`bg-slate-800 rounded-xl p-6 border ${challenge.active ? 'border-blue-500/50' : 'border-slate-700'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">{challenge.name}</h3>
                {challenge.active && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Active</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">{challenge.description}</p>
              <p className="text-slate-500 text-xs mt-1">{challenge.season} | {challenge.startDate} to {challenge.endDate}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-2xl">{challenge.completionPercent}%</p>
              <p className="text-slate-500 text-xs">Complete</p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${challenge.completionPercent}%`, backgroundColor: getProgressColor(challenge.completionPercent) }}
            />
          </div>
          <div className="space-y-2 mb-4">
            {challenge.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {task.completed ? (
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                ) : (
                  <Circle size={16} className="text-slate-500 shrink-0" />
                )}
                <span className={task.completed ? 'text-slate-400 line-through' : 'text-slate-300'}>{task.name}</span>
                <span className="ml-auto text-xs text-blue-400">+{formatXP(task.xpReward)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-3">
            <Award size={16} className="text-yellow-400" />
            <span className="text-sm text-slate-300">Reward: <span className="text-yellow-400 font-medium">{challenge.reward}</span></span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 text-xs font-medium p-4">Rank</th>
              <th className="text-left text-slate-400 text-xs font-medium p-4">Collector</th>
              <th className="text-left text-slate-400 text-xs font-medium p-4">Level</th>
              <th className="text-left text-slate-400 text-xs font-medium p-4">XP</th>
              <th className="text-left text-slate-400 text-xs font-medium p-4">Achievements</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry: LeaderboardEntry) => (
              <tr
                key={entry.userId}
                className={`border-b border-slate-700/50 ${entry.userId === 'current' ? 'bg-blue-500/10' : 'hover:bg-slate-700/30'}`}
              >
                <td className="p-4">
                  <span className={`font-bold ${entry.rank <= 3 ? 'text-yellow-400' : 'text-slate-400'}`}>
                    #{entry.rank}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{entry.avatar}</span>
                    <span className={`font-medium ${entry.userId === 'current' ? 'text-blue-400' : 'text-white'}`}>
                      {entry.username}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-slate-300">Lv. {entry.level}</td>
                <td className="p-4 text-slate-300">{formatXP(entry.totalXP)}</td>
                <td className="p-4 text-slate-300">{entry.achievementCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy size={32} className="text-yellow-400" />
            Achievements & Badges
          </h1>
          <p className="text-slate-400 mt-2">Track your collecting milestones and earn rewards</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'level' && renderLevelTab()}
        {activeTab === 'seasonal' && renderSeasonalTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </div>
    </div>
  );
};

export default AchievementSystem;
