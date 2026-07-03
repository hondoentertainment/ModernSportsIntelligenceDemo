/**
 * Audit Trail & Compliance Logging Service
 * Enterprise-grade immutable audit trail with compliance dashboards and regulatory reporting.
 */

import { getLocalAuditTrail } from './auditLog';
import { fetchRemoteAuditEvents, type FetchRemoteAuditOptions } from './auditTrailRemote';

export type AuditCategory = 'portfolio' | 'trading' | 'auth' | 'admin' | 'finance' | 'api' | 'compliance' | 'data';
export type AuditSeverity = 'info' | 'warning' | 'critical' | 'security';
export type ComplianceStatus = 'compliant' | 'review-needed' | 'violation' | 'remediated';

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  sessionId: string;
  result: 'success' | 'failure' | 'blocked';
  metadata: Record<string, string>;
  /**
   * Provenance of the row:
   * - `recorded` — written locally via `logAuditEvent` during this session.
   * - `cloud` — fetched from the Supabase `audit_events` table for the signed-in user.
   * - `sample` — illustrative demo rows for empty states.
   */
  source?: 'recorded' | 'cloud' | 'sample';
}

export interface AuditEventFilters {
  /** Case-insensitive substring match across action, resource, details, actor. */
  search?: string;
  /** Restrict to one or more categories. Empty/undefined = all. */
  categories?: AuditCategory[];
  /** Restrict to one or more severities. Empty/undefined = all. */
  severities?: AuditSeverity[];
  /** Restrict to one or more provenance sources. Empty/undefined = all. */
  sources?: AuditEvent['source'][];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ComplianceStatus;
  lastChecked: string;
  violationCount: number;
  autoEnforced: boolean;
}

export interface ComplianceReport {
  id: string;
  title: string;
  period: string;
  generatedDate: string;
  findings: number;
  criticalFindings: number;
  status: 'pending' | 'submitted' | 'accepted';
  framework: string;
}

export interface RetentionPolicy {
  category: AuditCategory;
  retentionDays: number;
  totalEvents: number;
  storageSize: string;
  lastPurge: string;
}

export interface AuditTrailStats {
  totalEvents: number;
  eventsToday: number;
  securityEvents: number;
  complianceScore: number;
  activeRules: number;
  violations: number;
  avgEventsPerDay: number;
  dataRetentionDays: number;
  storageUsed: string;
  exportsPending: number;
}

type LogCategory = 'portfolio' | 'valuation' | 'autonomy' | 'auth' | 'system';

function mapLogCategoryToTrail(cat: string): AuditCategory {
  const c = cat as LogCategory;
  if (c === 'portfolio' || c === 'valuation') return 'portfolio';
  if (c === 'autonomy') return 'trading';
  if (c === 'auth') return 'auth';
  return 'data';
}

function metadataToStrings(meta: unknown): Record<string, string> {
  if (!meta || typeof meta !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    out[k] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  return out;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDetails(meta: unknown, entityType: string, action: string): string {
  const metaStr = metadataToStrings(meta);
  const parts = Object.entries(metaStr)
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${v}`);
  if (parts.length > 0) return parts.join(' · ');
  return `${action} · ${entityType}`;
}

/** Maps rows from `logAuditEvent` / `getLocalAuditTrail` into UI rows. */
export function mapStoredRecordToAuditEvent(
  raw: unknown,
  index: number,
  source: 'recorded' | 'cloud' = 'recorded',
): AuditEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const action = typeof r.action === 'string' ? r.action : null;
  const entityType = typeof r.entity_type === 'string' ? r.entity_type : 'record';
  if (!action) return null;

  const createdRaw = r.created_at;
  const created = typeof createdRaw === 'string' ? createdRaw : new Date().toISOString();
  const catStr = typeof r.category === 'string' ? r.category : 'system';
  const category = mapLogCategoryToTrail(catStr);
  const severity: AuditSeverity =
    catStr === 'auth' && /fail|denied|blocked|invalid/i.test(action) ? 'security' : 'info';

  const entityId = typeof r.entity_id === 'string' ? r.entity_id : null;
  const userId = typeof r.user_id === 'string' ? r.user_id : null;
  const actor = userId ? `user:${userId.slice(0, 8)}…` : source === 'cloud' ? 'cloud' : 'local';

  return {
    id: `${source === 'cloud' ? 'cld' : 'rec'}-${index}-${created}-${action}`,
    timestamp: formatTimestamp(created),
    category,
    severity,
    actor,
    action,
    resource: entityId ? `${entityType} · ${entityId}` : entityType,
    details: formatDetails(r.metadata, entityType, action),
    ipAddress: '—',
    sessionId: '—',
    result: 'success',
    metadata: metadataToStrings(r.metadata),
    source,
  };
}

function getSampleAuditEvents(): AuditEvent[] {
  return [
    { id: 'ae-1', timestamp: '2026-03-17 14:45:22', category: 'trading', severity: 'info', actor: 'ProspectHunter', action: 'trade.executed', resource: 'Trade #4582', details: 'Sold 2024 Bowman Chrome lot — 15 cards for $1,250', ipAddress: '192.168.1.45', sessionId: 'sess_a8f2', result: 'success', metadata: { amount: '$1,250', cards: '15' }, source: 'sample' },
    { id: 'ae-2', timestamp: '2026-03-17 14:32:15', category: 'auth', severity: 'security', actor: 'unknown', action: 'auth.login_failed', resource: 'Login Portal', details: 'Failed login attempt from TOR exit node — 3rd attempt in 10 minutes', ipAddress: '185.220.101.4', sessionId: 'none', result: 'blocked', metadata: { attempts: '3', source: 'TOR' }, source: 'sample' },
    { id: 'ae-3', timestamp: '2026-03-17 14:15:08', category: 'finance', severity: 'info', actor: 'CardShark92', action: 'report.generated', resource: 'NAV Report', details: 'Generated February 2026 NAV report for LP distribution', ipAddress: '192.168.1.10', sessionId: 'sess_c3d1', result: 'success', metadata: { reportType: 'nav-report' }, source: 'sample' },
    { id: 'ae-4', timestamp: '2026-03-17 13:55:44', category: 'admin', severity: 'warning', actor: 'WaxBreaker99', action: 'permission.escalation', resource: 'Admin Settings', details: 'Attempted to access admin settings without admin role', ipAddress: '203.45.67.89', sessionId: 'sess_e5f2', result: 'blocked', metadata: { requiredRole: 'admin', userRole: 'trader' }, source: 'sample' },
    { id: 'ae-5', timestamp: '2026-03-17 13:40:30', category: 'api', severity: 'info', actor: 'api_key:msi_live_a3f2', action: 'api.request', resource: '/api/v1/portfolio', details: 'Portfolio data fetch — 847 holdings returned', ipAddress: '34.102.45.90', sessionId: 'api_sess_1', result: 'success', metadata: { latency: '45ms', records: '847' }, source: 'sample' },
    { id: 'ae-6', timestamp: '2026-03-17 12:20:11', category: 'compliance', severity: 'critical', actor: 'system', action: 'compliance.check', resource: 'AML Screening', details: 'New counterparty flagged by OFAC screening — manual review required', ipAddress: 'internal', sessionId: 'sys_check', result: 'failure', metadata: { counterparty: 'Redacted', matchType: 'partial' }, source: 'sample' },
    { id: 'ae-7', timestamp: '2026-03-17 11:05:55', category: 'portfolio', severity: 'info', actor: 'DataDiana', action: 'portfolio.valuation', resource: 'Fund NAV', details: 'Daily mark-to-market completed — NAV: $4,890,000', ipAddress: '10.0.1.22', sessionId: 'sess_g7h3', result: 'success', metadata: { nav: '$4,890,000', change: '+$42,000' }, source: 'sample' },
    { id: 'ae-8', timestamp: '2026-03-17 10:30:18', category: 'data', severity: 'info', actor: 'system', action: 'data.sync', resource: 'Market Data Feed', details: 'Synced 12,450 price points from 5 marketplace APIs', ipAddress: 'internal', sessionId: 'sys_sync', result: 'success', metadata: { records: '12,450', sources: '5' }, source: 'sample' },
    { id: 'ae-9', timestamp: '2026-03-17 09:15:02', category: 'auth', severity: 'info', actor: 'CardShark92', action: 'auth.login', resource: 'Login Portal', details: 'Successful login with MFA verification', ipAddress: '192.168.1.10', sessionId: 'sess_c3d1', result: 'success', metadata: { mfa: 'totp', device: 'Chrome/Desktop' }, source: 'sample' },
    { id: 'ae-10', timestamp: '2026-03-16 23:45:00', category: 'compliance', severity: 'info', actor: 'system', action: 'compliance.daily_check', resource: 'All Rules', details: 'Daily compliance scan completed — 0 new violations detected', ipAddress: 'internal', sessionId: 'sys_check', result: 'success', metadata: { rulesChecked: '24', violations: '0' }, source: 'sample' },
  ];
}

function getAuditEvents(): AuditEvent[] {
  const stored = getLocalAuditTrail()
    .map((row, i) => mapStoredRecordToAuditEvent(row, i))
    .filter((e): e is AuditEvent => e !== null);
  return [...stored, ...getSampleAuditEvents()];
}

async function getRemoteAuditEvents(
  userId: string | undefined | null,
  opts?: FetchRemoteAuditOptions,
): Promise<AuditEvent[]> {
  const rows = await fetchRemoteAuditEvents(userId, opts);
  return rows
    .map((row, i) => mapStoredRecordToAuditEvent(row, i, 'cloud'))
    .filter((e): e is AuditEvent => e !== null);
}

/** Apply UI filters in-memory. Returns a new array preserving input order. */
export function filterAuditEvents(events: AuditEvent[], filters: AuditEventFilters): AuditEvent[] {
  const q = filters.search?.trim().toLowerCase() ?? '';
  const cats = filters.categories && filters.categories.length > 0 ? new Set(filters.categories) : null;
  const sevs = filters.severities && filters.severities.length > 0 ? new Set(filters.severities) : null;
  const srcs = filters.sources && filters.sources.length > 0 ? new Set(filters.sources) : null;

  return events.filter((e) => {
    if (cats && !cats.has(e.category)) return false;
    if (sevs && !sevs.has(e.severity)) return false;
    if (srcs && !srcs.has(e.source)) return false;
    if (q) {
      const hay = `${e.action} ${e.resource} ${e.details} ${e.actor}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Returns the earliest `created_at` ISO string across the given raw rows
 * (used as the `before` cursor when paginating older audit events). Returns
 * `undefined` if no row carries a usable string timestamp — in which case
 * callers should disable the "load older" affordance.
 */
export function getOldestCreatedAt(rows: Array<{ created_at?: unknown } | null | undefined>): string | undefined {
  let oldest: string | undefined;
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const ts = row.created_at;
    if (typeof ts !== 'string' || ts.length === 0) continue;
    if (oldest === undefined || ts < oldest) oldest = ts;
  }
  return oldest;
}

/** Build a CSV string from the given events. Fields are RFC 4180-quoted. */
export function exportAuditEventsToCSV(events: AuditEvent[]): string {
  const header = [
    'timestamp',
    'source',
    'category',
    'severity',
    'actor',
    'action',
    'resource',
    'result',
    'details',
    'metadata',
  ];
  const escape = (val: string | undefined): string => {
    const s = val ?? '';
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = events.map((e) => [
    e.timestamp,
    e.source ?? 'sample',
    e.category,
    e.severity,
    e.actor,
    e.action,
    e.resource,
    e.result,
    e.details,
    JSON.stringify(e.metadata ?? {}),
  ].map(escape).join(','));
  return [header.join(','), ...rows].join('\r\n');
}

function getComplianceRules(): ComplianceRule[] {
  return [
    { id: 'cr-1', name: 'AML/KYC Verification', description: 'All counterparties must pass identity verification before transactions over $3,000', category: 'Financial Crime', status: 'compliant', lastChecked: '2026-03-17', violationCount: 0, autoEnforced: true },
    { id: 'cr-2', name: 'Sales Tax Nexus', description: 'Collect and remit sales tax for jurisdictions where nexus is established', category: 'Tax', status: 'compliant', lastChecked: '2026-03-17', violationCount: 1, autoEnforced: true },
    { id: 'cr-3', name: 'Data Retention Policy', description: 'Retain all transaction records for minimum 7 years per IRS requirements', category: 'Record Keeping', status: 'compliant', lastChecked: '2026-03-17', violationCount: 0, autoEnforced: true },
    { id: 'cr-4', name: 'OFAC Screening', description: 'Screen all counterparties against OFAC sanctions list', category: 'Financial Crime', status: 'review-needed', lastChecked: '2026-03-17', violationCount: 1, autoEnforced: true },
    { id: 'cr-5', name: 'Insider Trading Prevention', description: 'Prevent trading on material non-public information about card releases', category: 'Market Integrity', status: 'compliant', lastChecked: '2026-03-17', violationCount: 0, autoEnforced: false },
    { id: 'cr-6', name: 'Investor Accreditation', description: 'Verify accredited investor status for fund participants', category: 'Securities', status: 'compliant', lastChecked: '2026-03-15', violationCount: 0, autoEnforced: false },
    { id: 'cr-7', name: 'Privacy (CCPA/GDPR)', description: 'Handle personal data per privacy regulations with consent tracking', category: 'Privacy', status: 'compliant', lastChecked: '2026-03-17', violationCount: 0, autoEnforced: true },
    { id: 'cr-8', name: 'MFA Enforcement', description: 'Require MFA for all accounts with trading or admin access', category: 'Security', status: 'review-needed', lastChecked: '2026-03-17', violationCount: 2, autoEnforced: true },
  ];
}

function getComplianceReports(): ComplianceReport[] {
  return [
    { id: 'cpr-1', title: 'Q4 2025 Compliance Review', period: 'Q4 2025', generatedDate: '2026-01-10', findings: 3, criticalFindings: 0, status: 'accepted', framework: 'Internal Policy' },
    { id: 'cpr-2', title: '2025 Annual AML Report', period: 'FY 2025', generatedDate: '2026-02-01', findings: 1, criticalFindings: 0, status: 'submitted', framework: 'FinCEN BSA' },
    { id: 'cpr-3', title: 'Q1 2026 Compliance Review', period: 'Q1 2026', generatedDate: '2026-03-17', findings: 2, criticalFindings: 1, status: 'pending', framework: 'Internal Policy' },
  ];
}

function getRetentionPolicies(): RetentionPolicy[] {
  return [
    { category: 'trading', retentionDays: 2555, totalEvents: 45200, storageSize: '128 MB', lastPurge: '2026-01-01' },
    { category: 'auth', retentionDays: 365, totalEvents: 12800, storageSize: '22 MB', lastPurge: '2026-03-01' },
    { category: 'finance', retentionDays: 2555, totalEvents: 8900, storageSize: '34 MB', lastPurge: 'Never' },
    { category: 'api', retentionDays: 90, totalEvents: 890000, storageSize: '1.2 GB', lastPurge: '2026-03-15' },
    { category: 'compliance', retentionDays: 2555, totalEvents: 3400, storageSize: '12 MB', lastPurge: 'Never' },
    { category: 'admin', retentionDays: 730, totalEvents: 5600, storageSize: '18 MB', lastPurge: '2026-01-01' },
    { category: 'portfolio', retentionDays: 2555, totalEvents: 28400, storageSize: '85 MB', lastPurge: 'Never' },
    { category: 'data', retentionDays: 30, totalEvents: 1200000, storageSize: '2.8 GB', lastPurge: '2026-03-17' },
  ];
}

function getAuditTrailStats(): AuditTrailStats {
  return {
    totalEvents: 2194300,
    eventsToday: 4520,
    securityEvents: 18,
    complianceScore: 94,
    activeRules: 8,
    violations: 3,
    avgEventsPerDay: 5200,
    dataRetentionDays: 2555,
    storageUsed: '4.3 GB',
    exportsPending: 1,
  };
}

function getSeverityColor(severity: AuditSeverity): string {
  const colors: Record<AuditSeverity, string> = {
    info: 'text-blue-400 bg-blue-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    critical: 'text-red-400 bg-red-500/10',
    security: 'text-rose-400 bg-rose-500/10',
  };
  return colors[severity];
}

function getCategoryColor(cat: AuditCategory): string {
  const colors: Record<AuditCategory, string> = {
    portfolio: 'text-emerald-400', trading: 'text-blue-400', auth: 'text-amber-400',
    admin: 'text-purple-400', finance: 'text-green-400', api: 'text-cyan-400',
    compliance: 'text-rose-400', data: 'text-slate-400',
  };
  return colors[cat];
}

function getComplianceStatusColor(status: ComplianceStatus): string {
  const colors: Record<ComplianceStatus, string> = {
    compliant: 'text-green-400 bg-green-500/10',
    'review-needed': 'text-amber-400 bg-amber-500/10',
    violation: 'text-red-400 bg-red-500/10',
    remediated: 'text-blue-400 bg-blue-500/10',
  };
  return colors[status];
}

export {
  getAuditEvents,
  getRemoteAuditEvents,
  getComplianceRules,
  getComplianceReports,
  getRetentionPolicies,
  getAuditTrailStats,
  getSeverityColor,
  getCategoryColor,
  getComplianceStatusColor,
};
