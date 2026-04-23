// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Users, Lock, Eye, AlertTriangle, Key,
  CheckCircle, XCircle, Clock, Activity, BarChart3, Zap,
} from 'lucide-react';
import {
  getTeams,
  getAccessAuditLog,
  getRBACStats,
  getRoleLabel,
  getRoleColor,
  getPermissionColor,
} from '../lib/utils/rbacService';

const RBACManager: React.FC = () => {
  const teams = useMemo(() => getTeams(), []);
  const auditLog = useMemo(() => getAccessAuditLog(), []);
  const stats = useMemo(() => getRBACStats(), []);
  const [activeTab, setActiveTab] = useState<'teams' | 'audit' | 'permissions'>('teams');
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id || '');

  const team = teams.find(t => t.id === selectedTeam);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ShieldCheck size={22} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Role-Based Access Control</h1>
              <p className="text-slate-400 text-sm">
                Enterprise-grade team management with roles, permissions, and audit logging
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, color: 'text-blue-400', label: 'Active Users', value: `${stats.activeUsers}/${stats.totalUsers}` },
            { icon: ShieldCheck, color: 'text-green-400', label: 'MFA Adoption', value: `${stats.mfaAdoption}%` },
            { icon: AlertTriangle, color: 'text-red-400', label: 'Denied Access', value: stats.deniedAccessAttempts },
            { icon: Key, color: 'text-amber-400', label: 'Pending Invites', value: stats.pendingInvites },
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

        {/* Tabs */}
        <div className="flex gap-2">
          {(['teams', 'permissions', 'audit'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'teams' ? 'Teams & Members' : tab === 'permissions' ? 'Permission Matrix' : 'Access Audit Log'}</button>
          ))}
        </div>

        {activeTab === 'teams' && (
          <>
            <div className="flex gap-2">
              {teams.map(t => (
                <button key={t.id} onClick={() => setSelectedTeam(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    selectedTeam === t.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}>{t.name} ({t.memberCount})</button>
              ))}
            </div>

            {team && (
              <div className="space-y-3">
                {team.members.map(m => (
                  <div key={m.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <Users size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{m.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(m.role)}`}>{getRoleLabel(m.role)}</span>
                            {m.mfaEnabled && <Lock size={12} className="text-green-400" />}
                            {!m.mfaEnabled && <AlertTriangle size={12} className="text-amber-400" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>@{m.handle}</span>
                            <span>•</span>
                            <span>{m.email}</span>
                            <span>•</span>
                            <span>Last login: {m.lastLogin}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right"><p className="text-white font-bold">{m.sessionsThisMonth}</p><p className="text-slate-500 text-[10px]">Sessions</p></div>
                        <div className="text-right"><p className="text-white font-bold">{m.actionsThisMonth.toLocaleString()}</p><p className="text-slate-500 text-[10px]">Actions</p></div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          m.status === 'active' ? 'bg-green-500/10 text-green-400' : m.status === 'invited' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                        }`}>{m.status}</span>
                      </div>
                    </div>

                    {/* Permission Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.permissions.map(p => (
                        <div key={p.scope} className="flex items-center gap-1 bg-slate-800/50 rounded px-2 py-1">
                          <span className="text-slate-500 text-[10px] uppercase">{p.scope}</span>
                          <span className={`text-[10px] font-bold ${getPermissionColor(p.level)}`}>{p.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'permissions' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 overflow-x-auto">
            <h3 className="text-white font-semibold text-sm mb-4">Permission Matrix</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 pb-3 pr-4">User</th>
                  <th className="text-left text-slate-400 pb-3 pr-4">Role</th>
                  {['Portfolio', 'Trading', 'Analytics', 'Finance', 'Grading', 'Social', 'Admin', 'API'].map(h => (
                    <th key={h} className="text-center text-slate-400 pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.flatMap(t => t.members).map(m => (
                  <tr key={m.id} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 text-white font-semibold">@{m.handle}</td>
                    <td className="py-3 pr-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(m.role)}`}>{getRoleLabel(m.role)}</span></td>
                    {m.permissions.map(p => (
                      <td key={p.scope} className="py-3 px-2 text-center">
                        <span className={`text-[10px] font-bold ${getPermissionColor(p.level)}`}>
                          {p.level === 'full' ? '●' : p.level === 'write' ? '◉' : p.level === 'read' ? '○' : '–'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500">
              <span><span className="text-green-400">●</span> Full</span>
              <span><span className="text-amber-400">◉</span> Write</span>
              <span><span className="text-blue-400">○</span> Read</span>
              <span><span className="text-slate-600">–</span> None</span>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-2">
            {auditLog.map(entry => (
              <div key={entry.id} className={`bg-slate-900 rounded-xl border p-4 flex items-center justify-between ${
                entry.result === 'denied' ? 'border-red-500/30' : entry.result === 'escalated' ? 'border-amber-500/30' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  {entry.result === 'allowed' ? <CheckCircle size={14} className="text-green-400" /> :
                   entry.result === 'denied' ? <XCircle size={14} className="text-red-400" /> :
                   <AlertTriangle size={14} className="text-amber-400" />}
                  <div>
                    <p className="text-slate-300 text-xs">{entry.action}: {entry.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>@{entry.userHandle}</span>
                      <span>{entry.timestamp}</span>
                      <span>IP: {entry.ipAddress}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  entry.result === 'allowed' ? 'bg-green-500/10 text-green-400' :
                  entry.result === 'denied' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>{entry.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RBACManager;
