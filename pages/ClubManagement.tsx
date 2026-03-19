import React, { useState, useMemo } from 'react';
import {
  Crown, Users, Target, TrendingUp, DollarSign, Shield,
  Award, Activity, Clock, CheckCircle, BarChart3, Zap,
} from 'lucide-react';
import {
  getClubs,
  getClubStats,
  getTierLabel,
  getTierColor,
  getRoleColor,
} from '../lib/utils/clubManagementService';

const ClubManagement: React.FC = () => {
  const clubs = useMemo(() => getClubs(), []);
  const stats = useMemo(() => getClubStats(), []);
  const [selectedClub, setSelectedClub] = useState(clubs[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'goals' | 'activity'>('overview');

  const club = clubs.find(c => c.id === selectedClub);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown size={22} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Club & Guild Management</h1>
              <p className="text-slate-400 text-sm">
                Create and manage collector clubs with shared goals, treasury, and member hierarchy
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Crown, color: 'text-amber-400', label: 'Total Clubs', value: stats.totalClubs },
            { icon: Users, color: 'text-blue-400', label: 'Total Members', value: stats.totalMembers },
            { icon: Target, color: 'text-green-400', label: 'Goals Completed', value: stats.goalsCompleted },
            { icon: Shield, color: 'text-purple-400', label: 'Retention', value: `${stats.avgMemberRetention}%` },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-3xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Club Selector */}
        <div className="flex gap-2">
          {clubs.map(c => (
            <button key={c.id} onClick={() => setSelectedClub(c.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                selectedClub === c.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{c.name}</button>
          ))}
        </div>

        {club && (
          <>
            {/* Club Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/50 rounded-xl border border-slate-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-xl">{club.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getTierColor(club.tier)}`}>{getTierLabel(club.tier)}</span>
                  </div>
                  <p className="text-slate-400 text-sm italic mt-1">"{club.motto}"</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold text-2xl">${(club.totalPortfolioValue / 1000).toFixed(0)}K</p>
                  <p className="text-slate-500 text-xs">Combined Portfolio</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center"><p className="text-white font-bold text-lg">{club.memberCount}/{club.maxMembers}</p><p className="text-slate-500 text-xs">Members</p></div>
                <div className="text-center"><p className="text-green-400 font-bold text-lg">+{club.avgMemberROI}%</p><p className="text-slate-500 text-xs">Avg ROI</p></div>
                <div className="text-center"><p className="text-blue-400 font-bold text-lg">{club.weeklyActiveMembers}</p><p className="text-slate-500 text-xs">Weekly Active</p></div>
                <div className="text-center"><p className="text-emerald-400 font-bold text-lg">${club.treasury.balance.toLocaleString()}</p><p className="text-slate-500 text-xs">Treasury</p></div>
                <div className="text-center"><p className="text-purple-400 font-bold text-lg">{club.focus.join(', ')}</p><p className="text-slate-500 text-xs">Focus</p></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {(['overview', 'members', 'goals', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    activeTab === tab ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}>{tab}</button>
              ))}
            </div>

            {activeTab === 'members' && (
              <div className="space-y-3">
                {club.members.map(m => (
                  <div key={m.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <Users size={18} className={getRoleColor(m.role)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">@{m.handle}</span>
                          <span className={`text-[10px] font-bold uppercase ${getRoleColor(m.role)}`}>{m.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{m.specialties.join(', ')}</span>
                          <span>•</span>
                          <span>Active {m.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-white font-bold">${(m.portfolioValue / 1000).toFixed(0)}K</p>
                        <p className="text-slate-500 text-[10px]">Portfolio</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-bold">{m.contributionScore}</p>
                        <p className="text-slate-500 text-[10px]">Contribution</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-4">
                {club.goals.map(g => (
                  <div key={g.id} className={`bg-slate-900 rounded-xl border p-5 ${g.status === 'completed' ? 'border-green-500/30' : 'border-slate-800'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-semibold text-sm">{g.title}</h4>
                          {g.status === 'completed' && <CheckCircle size={14} className="text-green-400" />}
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{g.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-xs">Deadline: {g.deadline}</p>
                        <p className="text-slate-500 text-xs">{g.contributorCount} contributors</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all ${g.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }} />
                    </div>
                    <p className="text-slate-400 text-xs">{g.currentValue.toLocaleString()} / {g.targetValue.toLocaleString()} ({Math.round((g.currentValue / g.targetValue) * 100)}%)</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-2">
                {club.recentActivity.map(a => (
                  <div key={a.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity size={14} className={
                        a.type === 'acquisition' ? 'text-green-400' : a.type === 'sale' ? 'text-blue-400' :
                        a.type === 'achievement' ? 'text-amber-400' : a.type === 'milestone' ? 'text-purple-400' : 'text-slate-400'
                      } />
                      <div>
                        <p className="text-slate-300 text-xs">{a.description}</p>
                        <p className="text-slate-500 text-[10px]">@{a.memberHandle} • {a.timestamp}</p>
                      </div>
                    </div>
                    {a.value && <p className="text-white font-bold text-sm">${a.value.toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h4 className="text-amber-400 font-semibold text-xs uppercase tracking-wide mb-4">Treasury Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><p className="text-slate-500 text-[10px] uppercase">Balance</p><p className="text-emerald-400 font-bold text-lg">${club.treasury.balance.toLocaleString()}</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Monthly Dues</p><p className="text-white font-bold text-lg">${club.treasury.monthlyDues}/member</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Total Collected</p><p className="text-white font-bold text-lg">${club.treasury.totalCollected.toLocaleString()}</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Total Spent</p><p className="text-white font-bold text-lg">${club.treasury.totalSpent.toLocaleString()}</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Shared Assets</p><p className="text-white font-bold text-lg">{club.treasury.sharedAssets} cards</p></div>
                  <div><p className="text-slate-500 text-[10px] uppercase">Pending</p><p className="text-amber-400 font-bold text-lg">${club.treasury.pendingExpenses.toLocaleString()}</p></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClubManagement;
