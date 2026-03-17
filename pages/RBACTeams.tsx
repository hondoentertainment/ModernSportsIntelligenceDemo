import React, { useState, useMemo } from 'react';
import {
  Shield, Users, Lock, Eye, AlertTriangle, Key,
  CheckCircle, XCircle, Clock, Zap, BarChart3, UserCheck,
} from 'lucide-react';
import {
  getTeams,
  getAccessAuditLog,
  getRBACStats,
  getRoleLabel,
  getRoleColor,
  getPermissionColor,
} from '../lib/rbacService';

const RBACTeams: React.FC = () => {
  const teams = useMemo(() => getTeams(), []);
  const auditLog = useMemo(() => getAccessAuditLog(), []);
  const stats = useMemo(() => getRBACStats(), []);
  const [activeTab, setActiveTab] = useState<'teams' | 'audit'>('teams');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(teams[0]?.id || null);

  const team = teams.find(t => t.id === selectedTeam);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield size={22} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Role-Based Access Control & Team Permissions</h1>
              <p className="text-slate-400 text-sm">
                Enterprise-grade team management with roles, permissions, and security audit logging
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, color: 'text-blue-400', label: 'Active Users', value: `${stats.activeUsers}/${stats.totalUsers}` },
            { icon: Shield, color: 'text-green-400', label: 'MFA Adoption', value: `${stats.mfaAdoption}%` },
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

        <div className="flex gap-2">
          {(['teams', 'audit'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'teams' ? 'Teams & Members' : 'Access Audit Log'}</button>
          ))}
        </div>

        {activeTab === 'teams' && (
          <>
            <div className="flex gap-2">
              {teams.map(t => (
                <button key={t.id} onClick={() => setSelectedTeam(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                    selectedTeam === t.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}>{t.name} ({t.memberCount})</button>
              ))}
            </div>

            {team && (
              <div className="space-y-3">
                {team.members.map(m => (
                  <div key={m.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          m.status === 'active' ? 'bg-green-500/10' : 'bg-slate-800'
                        }`}>
                          <UserCheck size={18} className={m.status === 'active' ? 'text-green-400' : 'text-slate-500'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{m.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(m.role)}`}>{getRoleLabel(m.role)}</span>
                            {m.mfaEnabled && <Lock size={10} className="text-green-400" />}
                          </div>
                          <p className="text-slate-500 text-xs">@{m.handle} • {m.email}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Last login: {m.lastLogin}</p>
                        <p>{m.sessionsThisMonth} sessions • {m.actionsThisMonth} actions/mo</p>
                      </div>
                    </div>

                    {/* Permission Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {m.permissions.map(p => (
                        <div key={p.scope} className="bg-slate-800/50 rounded p-2 text-center">
                          <p className="text-slate-500 text-[10px] uppercase mb-1">{p.scope}</p>
                          <p className={`text-xs font-bold capitalize ${getPermissionColor(p.level)}`}>{p.level}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-2">
            {auditLog.map(entry => (
              <div key={entry.id} className={`bg-slate-900 rounded-xl border p-4 flex items-center justify-between ${
                entry.result === 'denied' ? 'border-red-500/30' : entry.result === 'escalated' ? 'border-amber-500/30' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  {entry.result === 'allowed' ? <CheckCircle size={16} className="text-green-400" /> :
                   entry.result === 'denied' ? <XCircle size={16} className="text-red-400" /> :
                   <AlertTriangle size={16} className="text-amber-400" />}
                  <div>
                    <p className="text-white text-xs font-semibold">{entry.action}</p>
                    <p className="text-slate-500 text-[10px]">
                      @{entry.userHandle} • {entry.resource} • {entry.ipAddress}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{entry.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    entry.result === 'allowed' ? 'bg-green-500/10 text-green-400' :
                    entry.result === 'denied' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>{entry.result}</span>
                  <p className="text-slate-500 text-[10px] mt-1">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RBACTeams;
