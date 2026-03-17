// Card Loan Collateral Service — manage card-backed loans and collateral positions

export interface LoanPosition {
  id: string;
  cardName: string;
  grade: string;
  collateralValue: number;
  loanAmount: number;
  ltv: number;
  interestRate: number;
  term: string;
  status: 'active' | 'pending' | 'at-risk' | 'paid';
  startDate: string;
  maturityDate: string;
  lender: string;
}

export interface CollateralCard {
  id: string;
  cardName: string;
  grade: string;
  currentValue: number;
  pledgedValue: number;
  haircut: number;
  condition: 'stable' | 'appreciating' | 'declining';
  lastAppraisal: string;
  eligible: boolean;
}

export function getPositions(): LoanPosition[] {
  return [
    { id: 'lp-1', cardName: '2003 Topps Chrome LeBron James RC #111', grade: 'PSA 10', collateralValue: 42000, loanAmount: 25200, ltv: 60, interestRate: 8.5, term: '12 months', status: 'active', startDate: '2025-09-15', maturityDate: '2026-09-15', lender: 'CardFi' },
    { id: 'lp-2', cardName: '1986 Fleer Michael Jordan RC #57', grade: 'PSA 8', collateralValue: 28000, loanAmount: 15400, ltv: 55, interestRate: 7.9, term: '6 months', status: 'active', startDate: '2026-01-10', maturityDate: '2026-07-10', lender: 'SlabLend' },
    { id: 'lp-3', cardName: '2018 National Treasures Luka Doncic RPA', grade: 'BGS 9.5', collateralValue: 85000, loanAmount: 55250, ltv: 65, interestRate: 9.2, term: '18 months', status: 'at-risk', startDate: '2025-06-01', maturityDate: '2026-12-01', lender: 'CardFi' },
    { id: 'lp-4', cardName: '1952 Topps Mickey Mantle #311', grade: 'SGC 4', collateralValue: 195000, loanAmount: 97500, ltv: 50, interestRate: 6.5, term: '24 months', status: 'active', startDate: '2025-03-20', maturityDate: '2027-03-20', lender: 'Heritage Capital' },
    { id: 'lp-5', cardName: '2020 Prizm Justin Herbert RC Silver', grade: 'PSA 10', collateralValue: 850, loanAmount: 425, ltv: 50, interestRate: 12.0, term: '3 months', status: 'paid', startDate: '2025-12-01', maturityDate: '2026-03-01', lender: 'SlabLend' },
  ];
}

export function getCollateral(): CollateralCard[] {
  return [
    { id: 'cc-1', cardName: '2003 Topps Chrome LeBron James RC #111', grade: 'PSA 10', currentValue: 44500, pledgedValue: 42000, haircut: 40, condition: 'appreciating', lastAppraisal: '2026-03-15', eligible: true },
    { id: 'cc-2', cardName: '1986 Fleer Michael Jordan RC #57', grade: 'PSA 8', currentValue: 29200, pledgedValue: 28000, haircut: 45, condition: 'stable', lastAppraisal: '2026-03-14', eligible: true },
    { id: 'cc-3', cardName: '2018 National Treasures Luka Doncic RPA', grade: 'BGS 9.5', currentValue: 72000, pledgedValue: 85000, haircut: 35, condition: 'declining', lastAppraisal: '2026-03-12', eligible: false },
    { id: 'cc-4', cardName: '1952 Topps Mickey Mantle #311', grade: 'SGC 4', currentValue: 210000, pledgedValue: 195000, haircut: 50, condition: 'appreciating', lastAppraisal: '2026-03-10', eligible: true },
    { id: 'cc-5', cardName: '2001 SP Authentic Tiger Woods RC', grade: 'BGS 9', currentValue: 15800, pledgedValue: 0, haircut: 40, condition: 'stable', lastAppraisal: '2026-03-08', eligible: true },
  ];
}
