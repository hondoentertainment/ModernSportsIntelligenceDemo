/**
 * Fund Reporting Service
 * LP letters, NAV calculations, performance attribution, and institutional fund reporting.
 */

export type ReportType = 'lp-letter' | 'nav-report' | 'performance-attribution' | 'risk-report' | 'tax-schedule' | 'compliance';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type FundStructure = 'lp-fund' | 'syndicate' | 'family-office' | 'dealer-entity';

export interface FundInvestor {
  id: string;
  name: string;
  commitment: number;
  contributed: number;
  ownership: number;
  distributions: number;
  netReturn: number;
  joinedDate: string;
  status: 'active' | 'redeemed' | 'pending';
}

export interface NAVBreakdown {
  category: string;
  value: number;
  weight: number;
  monthChange: number;
  quarterChange: number;
}

export interface PerformanceAttribution {
  factor: string;
  contribution: number;
  weight: number;
  description: string;
}

export interface FundReport {
  id: string;
  type: ReportType;
  title: string;
  period: string;
  generatedDate: string;
  status: 'draft' | 'reviewed' | 'published' | 'distributed';
  recipientCount: number;
  pageCount: number;
}

export interface FundOverview {
  fundName: string;
  structure: FundStructure;
  inceptionDate: string;
  aum: number;
  nav: number;
  navPerUnit: number;
  totalCommitments: number;
  calledCapital: number;
  distributions: number;
  inceptionReturn: number;
  ytdReturn: number;
  mtdReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  investorCount: number;
  holdingsCount: number;
}

export interface FundReportingStats {
  totalReportsGenerated: number;
  reportsThisQuarter: number;
  pendingReviews: number;
  investorsServed: number;
  complianceScore: number;
  nextReportDue: string;
  avgReportTime: string;
}

function getFundOverview(): FundOverview {
  return {
    fundName: 'MSI Collectibles Alpha Fund I, LP',
    structure: 'lp-fund',
    inceptionDate: '2024-01-15',
    aum: 4250000,
    nav: 4890000,
    navPerUnit: 1.149,
    totalCommitments: 5000000,
    calledCapital: 4250000,
    distributions: 380000,
    inceptionReturn: 29.6,
    ytdReturn: 12.4,
    mtdReturn: 2.1,
    sharpeRatio: 1.82,
    maxDrawdown: -8.3,
    investorCount: 12,
    holdingsCount: 847,
  };
}

function getFundInvestors(): FundInvestor[] {
  return [
    { id: 'fi-1', name: 'Chen Family Office', commitment: 1000000, contributed: 850000, ownership: 20.0, distributions: 76000, netReturn: 32.4, joinedDate: '2024-01-15', status: 'active' },
    { id: 'fi-2', name: 'Westbrook Capital', commitment: 750000, contributed: 637500, ownership: 15.0, distributions: 57000, netReturn: 28.9, joinedDate: '2024-01-15', status: 'active' },
    { id: 'fi-3', name: 'Kim Collectibles Trust', commitment: 500000, contributed: 425000, ownership: 10.0, distributions: 38000, netReturn: 31.2, joinedDate: '2024-01-15', status: 'active' },
    { id: 'fi-4', name: 'Harris Sports Holdings', commitment: 500000, contributed: 425000, ownership: 10.0, distributions: 38000, netReturn: 25.8, joinedDate: '2024-03-01', status: 'active' },
    { id: 'fi-5', name: 'Park Avenue Partners', commitment: 400000, contributed: 340000, ownership: 8.0, distributions: 30400, netReturn: 30.1, joinedDate: '2024-01-15', status: 'active' },
    { id: 'fi-6', name: 'Individual LP — J. Martinez', commitment: 250000, contributed: 212500, ownership: 5.0, distributions: 19000, netReturn: 27.5, joinedDate: '2024-06-01', status: 'active' },
    { id: 'fi-7', name: 'Redacted Investor A', commitment: 200000, contributed: 200000, ownership: 4.7, distributions: 22000, netReturn: 22.0, joinedDate: '2024-01-15', status: 'redeemed' },
  ];
}

function getNAVBreakdown(): NAVBreakdown[] {
  return [
    { category: 'Modern RC (Graded)', value: 1850000, weight: 37.8, monthChange: 4.2, quarterChange: 12.5 },
    { category: 'Vintage (Pre-1980)', value: 1200000, weight: 24.5, monthChange: 1.8, quarterChange: 8.2 },
    { category: 'Prospects & 1st Bowman', value: 680000, weight: 13.9, monthChange: 6.5, quarterChange: 18.9 },
    { category: 'Sealed Wax', value: 420000, weight: 8.6, monthChange: -1.2, quarterChange: 3.4 },
    { category: 'Autographs & Memorabilia', value: 380000, weight: 7.8, monthChange: 2.1, quarterChange: 7.8 },
    { category: 'Basketball & Football', value: 260000, weight: 5.3, monthChange: 3.8, quarterChange: 15.2 },
    { category: 'Cash & Equivalents', value: 100000, weight: 2.1, monthChange: 0, quarterChange: 0 },
  ];
}

function getPerformanceAttribution(): PerformanceAttribution[] {
  return [
    { factor: 'Card Selection Alpha', contribution: 8.2, weight: 55, description: 'Outperformance from individual card picks vs benchmark' },
    { factor: 'Timing Alpha', contribution: 3.1, weight: 21, description: 'Value added from buy/sell timing decisions' },
    { factor: 'Market Beta', contribution: 4.5, weight: 30, description: 'Return from overall card market appreciation' },
    { factor: 'Grade Premium Capture', contribution: 2.8, weight: 19, description: 'Returns from strategic grading and crossover submissions' },
    { factor: 'Sector Rotation', contribution: 1.4, weight: 9, description: 'Value added from shifting between sports/eras' },
    { factor: 'Transaction Costs', contribution: -1.5, weight: -10, description: 'Drag from fees, shipping, and grading costs' },
    { factor: 'Currency / FX', contribution: -0.1, weight: -1, description: 'Impact of international transactions' },
  ];
}

function getRecentReports(): FundReport[] {
  return [
    { id: 'fr-1', type: 'lp-letter', title: 'Q4 2025 LP Letter', period: 'Q4 2025', generatedDate: '2026-01-15', status: 'distributed', recipientCount: 12, pageCount: 8 },
    { id: 'fr-2', type: 'nav-report', title: 'February 2026 NAV Report', period: 'Feb 2026', generatedDate: '2026-03-01', status: 'published', recipientCount: 12, pageCount: 4 },
    { id: 'fr-3', type: 'performance-attribution', title: 'Q1 2026 Attribution Analysis', period: 'Q1 2026', generatedDate: '2026-03-15', status: 'draft', recipientCount: 0, pageCount: 6 },
    { id: 'fr-4', type: 'tax-schedule', title: '2025 K-1 Schedules', period: 'FY 2025', generatedDate: '2026-02-28', status: 'reviewed', recipientCount: 12, pageCount: 24 },
    { id: 'fr-5', type: 'risk-report', title: 'March 2026 Risk Dashboard', period: 'Mar 2026', generatedDate: '2026-03-17', status: 'draft', recipientCount: 0, pageCount: 5 },
    { id: 'fr-6', type: 'compliance', title: 'AML/KYC Annual Review', period: 'FY 2025', generatedDate: '2026-01-31', status: 'published', recipientCount: 3, pageCount: 12 },
  ];
}

function getFundReportingStats(): FundReportingStats {
  return {
    totalReportsGenerated: 48,
    reportsThisQuarter: 8,
    pendingReviews: 2,
    investorsServed: 12,
    complianceScore: 96,
    nextReportDue: '2026-04-01',
    avgReportTime: '2.5 hours',
  };
}

function getReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    'lp-letter': 'LP Letter', 'nav-report': 'NAV Report', 'performance-attribution': 'Attribution',
    'risk-report': 'Risk Report', 'tax-schedule': 'Tax Schedule', compliance: 'Compliance',
  };
  return labels[type];
}

function getReportStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-slate-400 bg-slate-500/10',
    reviewed: 'text-amber-400 bg-amber-500/10',
    published: 'text-blue-400 bg-blue-500/10',
    distributed: 'text-green-400 bg-green-500/10',
  };
  return colors[status] || 'text-slate-400 bg-slate-500/10';
}

export {
  getFundOverview,
  getFundInvestors,
  getNAVBreakdown,
  getPerformanceAttribution,
  getRecentReports,
  getFundReportingStats,
  getReportTypeLabel,
  getReportStatusColor,
};
