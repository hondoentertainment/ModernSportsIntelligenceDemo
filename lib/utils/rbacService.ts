/**
 * Role-Based Access Control & Team Permissions Service
 * Enterprise-grade team management with roles, permissions, and audit logging.
 */

export type SystemRole = 'super-admin' | 'admin' | 'manager' | 'analyst' | 'trader' | 'viewer' | 'api-only';
export type PermissionScope = 'portfolio' | 'trading' | 'analytics' | 'finance' | 'grading' | 'social' | 'admin' | 'api';
export type PermissionLevel = 'none' | 'read' | 'write' | 'full';

export interface Permission {
  scope: PermissionScope;
  level: PermissionLevel;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  handle: string;
  role: SystemRole;
  permissions: Permission[];
  lastLogin: string;
  status: 'active' | 'suspended' | 'invited' | 'deactivated';
  mfaEnabled: boolean;
  ipRestrictions: string[];
  joinedDate: string;
  sessionsThisMonth: number;
  actionsThisMonth: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: TeamMember[];
  createdDate: string;
  owner: string;
}

export interface AccessAuditEntry {
  id: string;
  timestamp: string;
  userHandle: string;
  action: string;
  resource: string;
  result: 'allowed' | 'denied' | 'escalated';
  ipAddress: string;
  details: string;
}

export interface RBACStats {
  totalUsers: number;
  activeUsers: number;
  teams: number;
  pendingInvites: number;
  deniedAccessAttempts: number;
  mfaAdoption: number;
  avgSessionsPerUser: number;
  customRoles: number;
}

function getTeams(): Team[] {
  return [
    {
      id: 'team-1',
      name: 'Trading Desk',
      description: 'Active traders with full portfolio and trading access',
      memberCount: 6,
      members: [
        {
          id: 'u1', name: 'Marcus Chen', email: 'marcus@firm.com', handle: 'CardShark92',
          role: 'admin', permissions: [
            { scope: 'portfolio', level: 'full' }, { scope: 'trading', level: 'full' },
            { scope: 'analytics', level: 'full' }, { scope: 'finance', level: 'write' },
            { scope: 'grading', level: 'write' }, { scope: 'social', level: 'write' },
            { scope: 'admin', level: 'full' }, { scope: 'api', level: 'full' },
          ],
          lastLogin: '10m ago', status: 'active', mfaEnabled: true, ipRestrictions: [],
          joinedDate: '2025-01-15', sessionsThisMonth: 84, actionsThisMonth: 1247,
        },
        {
          id: 'u2', name: 'Sarah Kim', email: 'sarah@firm.com', handle: 'ProspectHunter',
          role: 'trader', permissions: [
            { scope: 'portfolio', level: 'write' }, { scope: 'trading', level: 'full' },
            { scope: 'analytics', level: 'read' }, { scope: 'finance', level: 'read' },
            { scope: 'grading', level: 'write' }, { scope: 'social', level: 'write' },
            { scope: 'admin', level: 'none' }, { scope: 'api', level: 'read' },
          ],
          lastLogin: '1h ago', status: 'active', mfaEnabled: true, ipRestrictions: ['192.168.1.0/24'],
          joinedDate: '2025-03-01', sessionsThisMonth: 62, actionsThisMonth: 890,
        },
        {
          id: 'u3', name: 'Jake Williams', email: 'jake@firm.com', handle: 'WaxBreaker99',
          role: 'trader', permissions: [
            { scope: 'portfolio', level: 'write' }, { scope: 'trading', level: 'write' },
            { scope: 'analytics', level: 'read' }, { scope: 'finance', level: 'none' },
            { scope: 'grading', level: 'read' }, { scope: 'social', level: 'write' },
            { scope: 'admin', level: 'none' }, { scope: 'api', level: 'none' },
          ],
          lastLogin: '2h ago', status: 'active', mfaEnabled: false, ipRestrictions: [],
          joinedDate: '2025-06-15', sessionsThisMonth: 45, actionsThisMonth: 534,
        },
      ],
      createdDate: '2025-01-15',
      owner: 'CardShark92',
    },
    {
      id: 'team-2',
      name: 'Analytics Team',
      description: 'Read-only analysts with full analytics and reporting access',
      memberCount: 4,
      members: [
        {
          id: 'u4', name: 'Diana Patel', email: 'diana@firm.com', handle: 'DataDiana',
          role: 'analyst', permissions: [
            { scope: 'portfolio', level: 'read' }, { scope: 'trading', level: 'none' },
            { scope: 'analytics', level: 'full' }, { scope: 'finance', level: 'read' },
            { scope: 'grading', level: 'read' }, { scope: 'social', level: 'read' },
            { scope: 'admin', level: 'none' }, { scope: 'api', level: 'read' },
          ],
          lastLogin: '30m ago', status: 'active', mfaEnabled: true, ipRestrictions: [],
          joinedDate: '2025-04-01', sessionsThisMonth: 55, actionsThisMonth: 420,
        },
        {
          id: 'u5', name: 'Tom Russo', email: 'tom@firm.com', handle: 'AnalystTom',
          role: 'viewer', permissions: [
            { scope: 'portfolio', level: 'read' }, { scope: 'trading', level: 'none' },
            { scope: 'analytics', level: 'read' }, { scope: 'finance', level: 'none' },
            { scope: 'grading', level: 'none' }, { scope: 'social', level: 'none' },
            { scope: 'admin', level: 'none' }, { scope: 'api', level: 'none' },
          ],
          lastLogin: '3d ago', status: 'active', mfaEnabled: false, ipRestrictions: [],
          joinedDate: '2025-08-01', sessionsThisMonth: 12, actionsThisMonth: 89,
        },
      ],
      createdDate: '2025-04-01',
      owner: 'CardShark92',
    },
  ];
}

function getAccessAuditLog(): AccessAuditEntry[] {
  return [
    { id: 'al-1', timestamp: '2026-03-17 14:32', userHandle: 'WaxBreaker99', action: 'Export portfolio CSV', resource: 'finance.export', result: 'denied', ipAddress: '203.45.67.89', details: 'User lacks finance:write permission' },
    { id: 'al-2', timestamp: '2026-03-17 14:15', userHandle: 'ProspectHunter', action: 'Execute trade', resource: 'trading.execute', result: 'allowed', ipAddress: '192.168.1.45', details: 'Trade #4582 — Bowman Chrome lot' },
    { id: 'al-3', timestamp: '2026-03-17 13:55', userHandle: 'DataDiana', action: 'Generate analytics report', resource: 'analytics.report', result: 'allowed', ipAddress: '10.0.1.22', details: 'Q1 2026 performance report' },
    { id: 'al-4', timestamp: '2026-03-17 13:40', userHandle: 'AnalystTom', action: 'Modify team settings', resource: 'admin.teams', result: 'denied', ipAddress: '76.32.18.90', details: 'Viewer role cannot modify admin settings' },
    { id: 'al-5', timestamp: '2026-03-17 12:20', userHandle: 'CardShark92', action: 'Invite new member', resource: 'admin.invites', result: 'allowed', ipAddress: '192.168.1.10', details: 'Invited ryan@firm.com as trader' },
    { id: 'al-6', timestamp: '2026-03-17 11:05', userHandle: 'unknown', action: 'Login attempt', resource: 'auth.login', result: 'denied', ipAddress: '185.220.101.4', details: 'Invalid credentials — 3rd attempt from TOR exit node' },
    { id: 'al-7', timestamp: '2026-03-17 10:30', userHandle: 'ProspectHunter', action: 'API key generation', resource: 'api.keys', result: 'escalated', ipAddress: '192.168.1.45', details: 'Requires admin approval for new API key' },
  ];
}

function getRBACStats(): RBACStats {
  return {
    totalUsers: 14,
    activeUsers: 11,
    teams: 3,
    pendingInvites: 2,
    deniedAccessAttempts: 18,
    mfaAdoption: 72,
    avgSessionsPerUser: 48,
    customRoles: 2,
  };
}

function getRoleLabel(role: SystemRole): string {
  const labels: Record<SystemRole, string> = {
    'super-admin': 'Super Admin', admin: 'Admin', manager: 'Manager',
    analyst: 'Analyst', trader: 'Trader', viewer: 'Viewer', 'api-only': 'API Only',
  };
  return labels[role];
}

function getRoleColor(role: SystemRole): string {
  const colors: Record<SystemRole, string> = {
    'super-admin': 'text-red-400 bg-red-500/10',
    admin: 'text-amber-400 bg-amber-500/10',
    manager: 'text-blue-400 bg-blue-500/10',
    analyst: 'text-purple-400 bg-purple-500/10',
    trader: 'text-green-400 bg-green-500/10',
    viewer: 'text-slate-400 bg-slate-500/10',
    'api-only': 'text-cyan-400 bg-cyan-500/10',
  };
  return colors[role];
}

function getPermissionColor(level: PermissionLevel): string {
  const colors: Record<PermissionLevel, string> = {
    none: 'text-slate-600', read: 'text-blue-400', write: 'text-amber-400', full: 'text-green-400',
  };
  return colors[level];
}

export {
  getTeams,
  getAccessAuditLog,
  getRBACStats,
  getRoleLabel,
  getRoleColor,
  getPermissionColor,
};
