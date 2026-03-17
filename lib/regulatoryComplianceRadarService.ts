// Regulatory Compliance Radar — Phase 224
// Track emerging legislation around collectible securities, sales tax nexus, and AML rules

export interface RegulatoryAlert {
  id: string;
  title: string;
  jurisdiction: string;
  category: 'sales-tax' | 'securities' | 'aml' | 'import-export' | 'consumer-protection';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'proposed' | 'pending' | 'enacted';
  effectiveDate: string;
  summary: string;
  impactScore: number;
  portfolioExposure: number;
  actionRequired: string;
}

export interface TaxNexusState {
  state: string;
  code: string;
  hasSalesTax: boolean;
  collectibleExempt: boolean;
  threshold: number;
  rate: number;
  marketplaceFacilitator: boolean;
  riskLevel: 'safe' | 'caution' | 'warning' | 'critical';
}

export interface ComplianceScore {
  overall: number;
  salesTax: number;
  aml: number;
  securities: number;
  documentation: number;
  reporting: number;
}

export interface AMLFlag {
  id: string;
  transactionId: string;
  type: 'structuring' | 'velocity' | 'counterparty' | 'jurisdiction' | 'threshold';
  description: string;
  amount: number;
  date: string;
  riskScore: number;
  resolved: boolean;
}

const MOCK_ALERTS: RegulatoryAlert[] = [
  { id: 'ra-1', title: 'IRS Collectible Capital Gains Rate Increase', jurisdiction: 'Federal', category: 'sales-tax', severity: 'critical', status: 'proposed', effectiveDate: '2027-01-01', summary: 'Proposed increase of collectible LTCG rate from 28% to 33% for gains over $100K.', impactScore: 94, portfolioExposure: 72, actionRequired: 'Review holding periods and consider accelerating planned exits before effective date.' },
  { id: 'ra-2', title: 'California AB-2847: Digital Collectible Securities', jurisdiction: 'California', category: 'securities', severity: 'high', status: 'pending', effectiveDate: '2026-07-01', summary: 'Fractional card ownership interests may be classified as securities requiring broker-dealer registration.', impactScore: 88, portfolioExposure: 45, actionRequired: 'Audit any fractional positions held in CA-based platforms.' },
  { id: 'ra-3', title: 'EU Anti-Money Laundering Directive 7 (AMLD7)', jurisdiction: 'European Union', category: 'aml', severity: 'high', status: 'enacted', effectiveDate: '2026-06-01', summary: 'Luxury goods including collectibles over €5,000 require buyer identity verification.', impactScore: 82, portfolioExposure: 28, actionRequired: 'Ensure all EU transactions have compliant KYC documentation.' },
  { id: 'ra-4', title: 'New York Marketplace Facilitator Amendment', jurisdiction: 'New York', category: 'sales-tax', severity: 'medium', status: 'active', effectiveDate: '2026-01-01', summary: 'Marketplace platforms must now collect sales tax on peer-to-peer card transactions over $600.', impactScore: 76, portfolioExposure: 55, actionRequired: 'Verify marketplace tax collection on NY-bound sales.' },
  { id: 'ra-5', title: 'FinCEN Collectible Transaction Reporting', jurisdiction: 'Federal', category: 'aml', severity: 'critical', status: 'proposed', effectiveDate: '2027-04-01', summary: 'Cash transactions in collectibles over $5,000 may require Currency Transaction Reports (CTRs).', impactScore: 91, portfolioExposure: 38, actionRequired: 'Prepare documentation protocols for high-value cash transactions.' },
  { id: 'ra-6', title: 'UK Import Duty on Graded Cards', jurisdiction: 'United Kingdom', category: 'import-export', severity: 'medium', status: 'enacted', effectiveDate: '2026-03-01', summary: 'Graded sports cards now classified under luxury goods with 20% VAT + 6.5% import duty.', impactScore: 68, portfolioExposure: 15, actionRequired: 'Factor import costs into UK-bound arbitrage calculations.' },
  { id: 'ra-7', title: 'Texas SB-1142: Collectible Consumer Protection', jurisdiction: 'Texas', category: 'consumer-protection', severity: 'low', status: 'proposed', effectiveDate: '2027-01-01', summary: 'Mandatory 3-day cooling-off period for collectible purchases over $2,500.', impactScore: 42, portfolioExposure: 22, actionRequired: 'Monitor legislative progress; low immediate impact.' },
  { id: 'ra-8', title: 'South Dakota v. Wayfair Extension to Collectibles', jurisdiction: 'Multi-State', category: 'sales-tax', severity: 'high', status: 'active', effectiveDate: '2026-01-01', summary: '12 additional states now enforce economic nexus for collectible sellers exceeding $100K or 200 transactions.', impactScore: 85, portfolioExposure: 62, actionRequired: 'Review sales volume per state and register where thresholds are met.' },
];

const MOCK_TAX_NEXUS: TaxNexusState[] = [
  { state: 'California', code: 'CA', hasSalesTax: true, collectibleExempt: false, threshold: 500000, rate: 7.25, marketplaceFacilitator: true, riskLevel: 'warning' },
  { state: 'New York', code: 'NY', hasSalesTax: true, collectibleExempt: false, threshold: 500000, rate: 8.0, marketplaceFacilitator: true, riskLevel: 'warning' },
  { state: 'Texas', code: 'TX', hasSalesTax: true, collectibleExempt: false, threshold: 500000, rate: 6.25, marketplaceFacilitator: true, riskLevel: 'caution' },
  { state: 'Florida', code: 'FL', hasSalesTax: true, collectibleExempt: false, threshold: 100000, rate: 6.0, marketplaceFacilitator: true, riskLevel: 'caution' },
  { state: 'Oregon', code: 'OR', hasSalesTax: false, collectibleExempt: true, threshold: 0, rate: 0, marketplaceFacilitator: false, riskLevel: 'safe' },
  { state: 'Montana', code: 'MT', hasSalesTax: false, collectibleExempt: true, threshold: 0, rate: 0, marketplaceFacilitator: false, riskLevel: 'safe' },
  { state: 'Pennsylvania', code: 'PA', hasSalesTax: true, collectibleExempt: true, threshold: 100000, rate: 6.0, marketplaceFacilitator: true, riskLevel: 'safe' },
  { state: 'Illinois', code: 'IL', hasSalesTax: true, collectibleExempt: false, threshold: 100000, rate: 6.25, marketplaceFacilitator: true, riskLevel: 'caution' },
  { state: 'Ohio', code: 'OH', hasSalesTax: true, collectibleExempt: false, threshold: 100000, rate: 5.75, marketplaceFacilitator: true, riskLevel: 'caution' },
  { state: 'New Jersey', code: 'NJ', hasSalesTax: true, collectibleExempt: false, threshold: 100000, rate: 6.625, marketplaceFacilitator: true, riskLevel: 'warning' },
  { state: 'Delaware', code: 'DE', hasSalesTax: false, collectibleExempt: true, threshold: 0, rate: 0, marketplaceFacilitator: false, riskLevel: 'safe' },
  { state: 'New Hampshire', code: 'NH', hasSalesTax: false, collectibleExempt: true, threshold: 0, rate: 0, marketplaceFacilitator: false, riskLevel: 'safe' },
];

const MOCK_COMPLIANCE_SCORE: ComplianceScore = {
  overall: 74,
  salesTax: 68,
  aml: 82,
  securities: 71,
  documentation: 79,
  reporting: 65,
};

const MOCK_AML_FLAGS: AMLFlag[] = [
  { id: 'aml-1', transactionId: 'TXN-8847', type: 'threshold', description: 'Single transaction exceeds $10,000 reporting threshold', amount: 12500, date: '2026-03-12', riskScore: 72, resolved: false },
  { id: 'aml-2', transactionId: 'TXN-8831', type: 'structuring', description: 'Three transactions within 24h totaling $9,800 — possible structuring pattern', amount: 9800, date: '2026-03-10', riskScore: 85, resolved: false },
  { id: 'aml-3', transactionId: 'TXN-8790', type: 'velocity', description: 'Unusual spike in transaction frequency — 14 purchases in 48 hours', amount: 34200, date: '2026-03-05', riskScore: 61, resolved: true },
  { id: 'aml-4', transactionId: 'TXN-8756', type: 'counterparty', description: 'Counterparty flagged by community trust graph for pattern of disputes', amount: 4200, date: '2026-02-28', riskScore: 78, resolved: false },
];

export function getAlerts(): RegulatoryAlert[] { return [...MOCK_ALERTS]; }
export function getTaxNexus(): TaxNexusState[] { return [...MOCK_TAX_NEXUS]; }
export function getComplianceScore(): ComplianceScore { return { ...MOCK_COMPLIANCE_SCORE }; }
export function getAMLFlags(): AMLFlag[] { return [...MOCK_AML_FLAGS]; }
export function getCriticalAlertCount(): number { return MOCK_ALERTS.filter(a => a.severity === 'critical').length; }
export function getExposedStatesCount(): number { return MOCK_TAX_NEXUS.filter(s => s.riskLevel === 'warning' || s.riskLevel === 'critical').length; }

export default { getAlerts, getTaxNexus, getComplianceScore, getAMLFlags, getCriticalAlertCount, getExposedStatesCount };
