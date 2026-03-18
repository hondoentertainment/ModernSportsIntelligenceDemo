/**
 * Audit Trail & Compliance Logging Service
 * Enterprise-grade immutable audit trail with compliance dashboards and regulatory reporting.
 */

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

function getAuditEvents(): AuditEvent[] {
  return [
    { id: 'ae-1', timestamp: '2026-03-17 14:45:22', category: 'trading', severity: 'info', actor: 'ProspectHunter', action: 'trade.executed', resource: 'Trade #4582', details: 'Sold 2024 Bowman Chrome lot — 15 cards for $1,250', ipAddress: '192.168.1.45', sessionId: 'sess_a8f2', result: 'success', metadata: { amount: '$1,250', cards: '15' } },
    { id: 'ae-2', timestamp: '2026-03-17 14:32:15', category: 'auth', severity: 'security', actor: 'unknown', action: 'auth.login_failed', resource: 'Login Portal', details: 'Failed login attempt from TOR exit node — 3rd attempt in 10 minutes', ipAddress: '185.220.101.4', sessionId: 'none', result: 'blocked', metadata: { attempts: '3', source: 'TOR' } },
    { id: 'ae-3', timestamp: '2026-03-17 14:15:08', category: 'finance', severity: 'info', actor: 'CardShark92', action: 'report.generated', resource: 'NAV Report', details: 'Generated February 2026 NAV report for LP distribution', ipAddress: '192.168.1.10', sessionId: 'sess_c3d1', result: 'success', metadata: { reportType: 'nav-report' } },
    { id: 'ae-4', timestamp: '2026-03-17 13:55:44', category: 'admin', severity: 'warning', actor: 'WaxBreaker99', action: 'permission.escalation', resource: 'Admin Settings', details: 'Attempted to access admin settings without admin role', ipAddress: '203.45.67.89', sessionId: 'sess_e5f2', result: 'blocked', metadata: { requiredRole: 'admin', userRole: 'trader' } },
    { id: 'ae-5', timestamp: '2026-03-17 13:40:30', category: 'api', severity: 'info', actor: 'api_key:msi_live_a3f2', action: 'api.request', resource: '/api/v1/portfolio', details: 'Portfolio data fetch — 847 holdings returned', ipAddress: '34.102.45.90', sessionId: 'api_sess_1', result: 'success', metadata: { latency: '45ms', records: '847' } },
    { id: 'ae-6', timestamp: '2026-03-17 12:20:11', category: 'compliance', severity: 'critical', actor: 'system', action: 'compliance.check', resource: 'AML Screening', details: 'New counterparty flagged by OFAC screening — manual review required', ipAddress: 'internal', sessionId: 'sys_check', result: 'failure', metadata: { counterparty: 'Redacted', matchType: 'partial' } },
    { id: 'ae-7', timestamp: '2026-03-17 11:05:55', category: 'portfolio', severity: 'info', actor: 'DataDiana', action: 'portfolio.valuation', resource: 'Fund NAV', details: 'Daily mark-to-market completed — NAV: $4,890,000', ipAddress: '10.0.1.22', sessionId: 'sess_g7h3', result: 'success', metadata: { nav: '$4,890,000', change: '+$42,000' } },
    { id: 'ae-8', timestamp: '2026-03-17 10:30:18', category: 'data', severity: 'info', actor: 'system', action: 'data.sync', resource: 'Market Data Feed', details: 'Synced 12,450 price points from 5 marketplace APIs', ipAddress: 'internal', sessionId: 'sys_sync', result: 'success', metadata: { records: '12,450', sources: '5' } },
    { id: 'ae-9', timestamp: '2026-03-17 09:15:02', category: 'auth', severity: 'info', actor: 'CardShark92', action: 'auth.login', resource: 'Login Portal', details: 'Successful login with MFA verification', ipAddress: '192.168.1.10', sessionId: 'sess_c3d1', result: 'success', metadata: { mfa: 'totp', device: 'Chrome/Desktop' } },
    { id: 'ae-10', timestamp: '2026-03-16 23:45:00', category: 'compliance', severity: 'info', actor: 'system', action: 'compliance.daily_check', resource: 'All Rules', details: 'Daily compliance scan completed — 0 new violations detected', ipAddress: 'internal', sessionId: 'sys_check', result: 'success', metadata: { rulesChecked: '24', violations: '0' } },
  ];
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
  getComplianceRules,
  getComplianceReports,
  getRetentionPolicies,
  getAuditTrailStats,
  getSeverityColor,
  getCategoryColor,
  getComplianceStatusColor,
};
