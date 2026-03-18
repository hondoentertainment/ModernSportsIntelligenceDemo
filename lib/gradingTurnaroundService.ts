import { store } from './dal/syncStore';

// ---- Types ----

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CGC';

export type TurnaroundTier = 'value' | 'regular' | 'express' | 'super_express' | 'walk_through';

export type SubmissionStatus = 'in_transit' | 'received' | 'in_progress' | 'completed';

export type TrendDirection = 'faster' | 'slower' | 'stable';

export interface TurnaroundReport {
  id: string;
  company: GradingCompany;
  tier: TurnaroundTier;
  reportedDays: number;
  submittedDate: string;
  receivedDate: string | null;
  completedDate: string | null;
  status: SubmissionStatus;
  userId: string;
  location: string;
}

export interface TurnaroundAverage {
  company: GradingCompany;
  tier: TurnaroundTier;
  avgDays: number;
  minDays: number;
  maxDays: number;
  medianDays: number;
  reportCount: number;
  trend: TrendDirection;
  lastUpdated: string;
}

export interface ETAPrediction {
  company: GradingCompany;
  tier: TurnaroundTier;
  predictedDays: number;
  confidence: number;
  basedOnReports: number;
  range: { min: number; max: number };
}

export interface TurnaroundStats {
  totalReports: number;
  avgDaysAllCompanies: number;
  fastestCompany: GradingCompany;
  slowestCompany: GradingCompany;
  reportsThisWeek: number;
  trendDirection: TrendDirection;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_grading_turnaround';

// ---- Mock Data ----

const MOCK_REPORTS: TurnaroundReport[] = [
  { id: 'gt-001', company: 'PSA', tier: 'regular', reportedDays: 45, submittedDate: '2025-12-01', receivedDate: '2025-12-05', completedDate: '2026-01-15', status: 'completed', userId: 'user-1', location: 'New York, NY' },
  { id: 'gt-002', company: 'PSA', tier: 'express', reportedDays: 12, submittedDate: '2026-01-10', receivedDate: '2026-01-13', completedDate: '2026-01-22', status: 'completed', userId: 'user-2', location: 'Los Angeles, CA' },
  { id: 'gt-003', company: 'PSA', tier: 'super_express', reportedDays: 5, submittedDate: '2026-02-01', receivedDate: '2026-02-02', completedDate: '2026-02-06', status: 'completed', userId: 'user-1', location: 'Chicago, IL' },
  { id: 'gt-004', company: 'PSA', tier: 'walk_through', reportedDays: 2, submittedDate: '2026-02-15', receivedDate: '2026-02-15', completedDate: '2026-02-17', status: 'completed', userId: 'user-3', location: 'Dallas, TX' },
  { id: 'gt-005', company: 'PSA', tier: 'value', reportedDays: 90, submittedDate: '2025-10-01', receivedDate: '2025-10-08', completedDate: '2025-12-30', status: 'completed', userId: 'user-4', location: 'Miami, FL' },
  { id: 'gt-006', company: 'BGS', tier: 'regular', reportedDays: 55, submittedDate: '2025-11-15', receivedDate: '2025-11-20', completedDate: '2026-01-09', status: 'completed', userId: 'user-2', location: 'Seattle, WA' },
  { id: 'gt-007', company: 'BGS', tier: 'express', reportedDays: 15, submittedDate: '2026-01-05', receivedDate: '2026-01-08', completedDate: '2026-01-20', status: 'completed', userId: 'user-5', location: 'Houston, TX' },
  { id: 'gt-008', company: 'BGS', tier: 'super_express', reportedDays: 7, submittedDate: '2026-02-10', receivedDate: '2026-02-11', completedDate: '2026-02-17', status: 'completed', userId: 'user-1', location: 'Phoenix, AZ' },
  { id: 'gt-009', company: 'BGS', tier: 'value', reportedDays: 120, submittedDate: '2025-09-01', receivedDate: '2025-09-10', completedDate: '2025-12-30', status: 'completed', userId: 'user-3', location: 'Denver, CO' },
  { id: 'gt-010', company: 'SGC', tier: 'regular', reportedDays: 30, submittedDate: '2026-01-20', receivedDate: '2026-01-23', completedDate: '2026-02-19', status: 'completed', userId: 'user-4', location: 'Atlanta, GA' },
  { id: 'gt-011', company: 'SGC', tier: 'express', reportedDays: 8, submittedDate: '2026-02-05', receivedDate: '2026-02-06', completedDate: '2026-02-13', status: 'completed', userId: 'user-2', location: 'Portland, OR' },
  { id: 'gt-012', company: 'SGC', tier: 'value', reportedDays: 60, submittedDate: '2025-11-01', receivedDate: '2025-11-05', completedDate: '2025-12-31', status: 'completed', userId: 'user-5', location: 'Boston, MA' },
  { id: 'gt-013', company: 'CGC', tier: 'regular', reportedDays: 40, submittedDate: '2026-01-15', receivedDate: '2026-01-19', completedDate: '2026-02-24', status: 'completed', userId: 'user-1', location: 'San Francisco, CA' },
  { id: 'gt-014', company: 'CGC', tier: 'express', reportedDays: 10, submittedDate: '2026-02-08', receivedDate: '2026-02-09', completedDate: '2026-02-18', status: 'completed', userId: 'user-3', location: 'Nashville, TN' },
  { id: 'gt-015', company: 'CGC', tier: 'walk_through', reportedDays: 3, submittedDate: '2026-03-01', receivedDate: '2026-03-01', completedDate: '2026-03-04', status: 'completed', userId: 'user-4', location: 'Las Vegas, NV' },
  { id: 'gt-016', company: 'PSA', tier: 'regular', reportedDays: 50, submittedDate: '2026-02-01', receivedDate: '2026-02-05', completedDate: null, status: 'in_progress', userId: 'user-1', location: 'New York, NY' },
  { id: 'gt-017', company: 'BGS', tier: 'regular', reportedDays: 60, submittedDate: '2025-12-10', receivedDate: '2025-12-15', completedDate: '2026-02-08', status: 'completed', userId: 'user-6', location: 'Minneapolis, MN' },
  { id: 'gt-018', company: 'SGC', tier: 'super_express', reportedDays: 4, submittedDate: '2026-03-05', receivedDate: '2026-03-06', completedDate: '2026-03-09', status: 'completed', userId: 'user-2', location: 'San Diego, CA' },
];

// ---- Storage helpers ----

function loadReports(): TurnaroundReport[] {
  if (store.has(STORAGE_KEY)) {
    return store.get<TurnaroundReport[]>(STORAGE_KEY, []);
  }
  const initial = [...MOCK_REPORTS];
  store.set(STORAGE_KEY, initial);
  return initial;
}

function saveReports(reports: TurnaroundReport[]): void {
  store.set(STORAGE_KEY, reports);
}

// ---- Utility functions ----

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeTrend(reports: TurnaroundReport[]): TrendDirection {
  const completed = reports.filter(r => r.status === 'completed' && r.completedDate);
  if (completed.length < 4) return 'stable';
  const sorted = [...completed].sort((a, b) => a.submittedDate.localeCompare(b.submittedDate));
  const half = Math.floor(sorted.length / 2);
  const olderAvg = sorted.slice(0, half).reduce((s, r) => s + r.reportedDays, 0) / half;
  const newerAvg = sorted.slice(half).reduce((s, r) => s + r.reportedDays, 0) / (sorted.length - half);
  const diff = newerAvg - olderAvg;
  if (diff < -2) return 'faster';
  if (diff > 2) return 'slower';
  return 'stable';
}

// ---- Exported functions ----

export function getTurnaroundReports(): TurnaroundReport[] {
  return loadReports();
}

export function addReport(report: Omit<TurnaroundReport, 'id'>): TurnaroundReport {
  const reports = loadReports();
  const newReport: TurnaroundReport = {
    ...report,
    id: `gt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  reports.push(newReport);
  saveReports(reports);
  return newReport;
}

export function getTurnaroundAverages(): TurnaroundAverage[] {
  const reports = loadReports();
  const companies: GradingCompany[] = ['PSA', 'BGS', 'SGC', 'CGC'];
  const tiers: TurnaroundTier[] = ['value', 'regular', 'express', 'super_express', 'walk_through'];
  const averages: TurnaroundAverage[] = [];

  for (const company of companies) {
    for (const tier of tiers) {
      const matching = reports.filter(
        r => r.company === company && r.tier === tier && r.status === 'completed'
      );
      if (matching.length === 0) continue;
      const days = matching.map(r => r.reportedDays);
      const avg = days.reduce((s, d) => s + d, 0) / days.length;
      averages.push({
        company,
        tier,
        avgDays: Math.round(avg * 10) / 10,
        minDays: Math.min(...days),
        maxDays: Math.max(...days),
        medianDays: median(days),
        reportCount: matching.length,
        trend: computeTrend(matching),
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  return averages;
}

export function getETAPrediction(company: GradingCompany, tier: TurnaroundTier): ETAPrediction {
  const reports = loadReports();
  const matching = reports.filter(
    r => r.company === company && r.tier === tier && r.status === 'completed'
  );

  if (matching.length === 0) {
    // Fallback defaults by tier
    const defaults: Record<TurnaroundTier, number> = {
      value: 75,
      regular: 45,
      express: 12,
      super_express: 5,
      walk_through: 2,
    };
    return {
      company,
      tier,
      predictedDays: defaults[tier],
      confidence: 20,
      basedOnReports: 0,
      range: { min: Math.round(defaults[tier] * 0.7), max: Math.round(defaults[tier] * 1.5) },
    };
  }

  const days = matching.map(r => r.reportedDays);
  const avg = days.reduce((s, d) => s + d, 0) / days.length;
  const min = Math.min(...days);
  const max = Math.max(...days);
  const confidence = Math.min(95, 30 + matching.length * 10);

  return {
    company,
    tier,
    predictedDays: Math.round(avg),
    confidence,
    basedOnReports: matching.length,
    range: { min, max },
  };
}

export function getTurnaroundStats(): TurnaroundStats {
  const reports = loadReports();
  const completed = reports.filter(r => r.status === 'completed');
  const allDays = completed.map(r => r.reportedDays);
  const avgDays = allDays.length > 0
    ? Math.round((allDays.reduce((s, d) => s + d, 0) / allDays.length) * 10) / 10
    : 0;

  // Avg by company
  const companies: GradingCompany[] = ['PSA', 'BGS', 'SGC', 'CGC'];
  const companyAvgs: { company: GradingCompany; avg: number }[] = companies.map(c => {
    const compReports = completed.filter(r => r.company === c);
    const avg = compReports.length > 0
      ? compReports.reduce((s, r) => s + r.reportedDays, 0) / compReports.length
      : Infinity;
    return { company: c, avg };
  });
  const validCompanies = companyAvgs.filter(c => c.avg !== Infinity);
  const fastestCompany = validCompanies.length > 0
    ? validCompanies.reduce((a, b) => a.avg < b.avg ? a : b).company
    : 'PSA';
  const slowestCompany = validCompanies.length > 0
    ? validCompanies.reduce((a, b) => a.avg > b.avg ? a : b).company
    : 'PSA';

  // Reports this week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const reportsThisWeek = reports.filter(r => new Date(r.submittedDate) >= weekAgo).length;

  return {
    totalReports: reports.length,
    avgDaysAllCompanies: avgDays,
    fastestCompany,
    slowestCompany,
    reportsThisWeek,
    trendDirection: computeTrend(completed),
  };
}

export function getCompanyComparison(): Record<GradingCompany, { avgDays: number; reportCount: number; tiers: Record<string, number> }> {
  const reports = loadReports();
  const companies: GradingCompany[] = ['PSA', 'BGS', 'SGC', 'CGC'];
  const result = {} as Record<GradingCompany, { avgDays: number; reportCount: number; tiers: Record<string, number> }>;

  for (const company of companies) {
    const compReports = reports.filter(r => r.company === company && r.status === 'completed');
    const days = compReports.map(r => r.reportedDays);
    const avgDays = days.length > 0 ? Math.round((days.reduce((s, d) => s + d, 0) / days.length) * 10) / 10 : 0;

    const tiers: Record<string, number> = {};
    const tierList: TurnaroundTier[] = ['value', 'regular', 'express', 'super_express', 'walk_through'];
    for (const tier of tierList) {
      const tierReports = compReports.filter(r => r.tier === tier);
      if (tierReports.length > 0) {
        tiers[tier] = Math.round((tierReports.reduce((s, r) => s + r.reportedDays, 0) / tierReports.length) * 10) / 10;
      }
    }

    result[company] = { avgDays, reportCount: compReports.length, tiers };
  }

  return result;
}

export function getTierComparison(company: GradingCompany): TurnaroundAverage[] {
  return getTurnaroundAverages().filter(a => a.company === company);
}

export function getHistoricalTrend(company: GradingCompany, tier: TurnaroundTier): { date: string; days: number }[] {
  const reports = loadReports();
  const matching = reports.filter(
    r => r.company === company && r.tier === tier && r.status === 'completed'
  );
  return matching
    .sort((a, b) => a.submittedDate.localeCompare(b.submittedDate))
    .map(r => ({ date: r.submittedDate, days: r.reportedDays }));
}

export function getMySubmissions(): TurnaroundReport[] {
  const reports = loadReports();
  return reports.filter(r => r.userId === 'user-1');
}

export function formatDays(n: number): string {
  if (n === 1) return '1 day';
  return `${n} days`;
}

export function getCompanyColor(company: GradingCompany): string {
  const colors: Record<GradingCompany, string> = {
    PSA: '#ef4444',
    BGS: '#3b82f6',
    SGC: '#10b981',
    CGC: '#f59e0b',
  };
  return colors[company] ?? '#6b7280';
}

export function getTierLabel(tier: TurnaroundTier): string {
  const labels: Record<TurnaroundTier, string> = {
    value: 'Value',
    regular: 'Regular',
    express: 'Express',
    super_express: 'Super Express',
    walk_through: 'Walk-Through',
  };
  return labels[tier] ?? tier;
}

export function getStatusColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    in_transit: '#f59e0b',
    received: '#3b82f6',
    in_progress: '#8b5cf6',
    completed: '#10b981',
  };
  return colors[status] ?? '#6b7280';
}

export function getTrendIcon(trend: TrendDirection): string {
  const icons: Record<TrendDirection, string> = {
    faster: '↓',
    slower: '↑',
    stable: '→',
  };
  return icons[trend] ?? '→';
}

export function getTrendColor(trend: TrendDirection): string {
  const colors: Record<TrendDirection, string> = {
    faster: '#10b981',
    slower: '#ef4444',
    stable: '#6b7280',
  };
  return colors[trend] ?? '#6b7280';
}
