// Slab Case Forensics Service — analyzes graded card slab integrity and database lookups

export interface SlabAnalysis {
  id: string;
  cardName: string;
  certNumber: string;
  company: string;
  grade: string;
  scanResult: 'authentic' | 'suspect' | 'counterfeit';
  confidence: number;
  caseType: string;
  labelVersion: string;
  fontMatch: number;
  hologramValid: boolean;
  edgeConsistency: number;
  scanDate: string;
  notes: string;
}

export interface DatabaseEntry {
  certNumber: string;
  cardName: string;
  company: string;
  grade: string;
  population: number;
  lastVerified: string;
  status: 'verified' | 'pending' | 'flagged';
}

export function getAnalyses(): SlabAnalysis[] {
  return [
    { id: 'sf-1', cardName: '2003 Topps Chrome LeBron James RC #111', certNumber: '48291034', company: 'PSA', grade: 'PSA 10', scanResult: 'authentic', confidence: 98.7, caseType: 'Standard Holder', labelVersion: 'v4.2', fontMatch: 99.1, hologramValid: true, edgeConsistency: 97.3, scanDate: '2026-03-10', notes: 'Clean scan, all markers verified' },
    { id: 'sf-2', cardName: '1986 Fleer Michael Jordan RC #57', certNumber: '29384756', company: 'BGS', grade: 'BGS 9.5', scanResult: 'authentic', confidence: 96.2, caseType: 'Beckett Holder', labelVersion: 'v3.1', fontMatch: 95.8, hologramValid: true, edgeConsistency: 94.1, scanDate: '2026-03-09', notes: 'Minor wear on case exterior, card authentic' },
    { id: 'sf-3', cardName: '2018 Panini Prizm Luka Doncic RC #280', certNumber: '67381920', company: 'PSA', grade: 'PSA 10', scanResult: 'suspect', confidence: 72.4, caseType: 'Standard Holder', labelVersion: 'v3.8', fontMatch: 84.2, hologramValid: true, edgeConsistency: 71.6, scanDate: '2026-03-08', notes: 'Font spacing anomaly detected on label' },
    { id: 'sf-4', cardName: '1952 Topps Mickey Mantle #311', certNumber: '10293847', company: 'SGC', grade: 'SGC 5', scanResult: 'authentic', confidence: 99.1, caseType: 'SGC Tuxedo', labelVersion: 'v2.0', fontMatch: 98.9, hologramValid: true, edgeConsistency: 99.0, scanDate: '2026-03-07', notes: 'Verified against SGC database' },
    { id: 'sf-5', cardName: '2020 Panini Prizm Justin Herbert RC', certNumber: '55019283', company: 'PSA', grade: 'PSA 9', scanResult: 'counterfeit', confidence: 34.1, caseType: 'Unknown', labelVersion: 'N/A', fontMatch: 41.2, hologramValid: false, edgeConsistency: 38.7, scanDate: '2026-03-06', notes: 'Hologram failed verification, case material inconsistent' },
  ];
}

export function getDatabaseEntries(): DatabaseEntry[] {
  return [
    { certNumber: '48291034', cardName: '2003 Topps Chrome LeBron James RC #111', company: 'PSA', grade: 'PSA 10', population: 3218, lastVerified: '2026-03-10', status: 'verified' },
    { certNumber: '29384756', cardName: '1986 Fleer Michael Jordan RC #57', company: 'BGS', grade: 'BGS 9.5', population: 287, lastVerified: '2026-03-09', status: 'verified' },
    { certNumber: '67381920', cardName: '2018 Panini Prizm Luka Doncic RC #280', company: 'PSA', grade: 'PSA 10', population: 5104, lastVerified: '2026-03-08', status: 'flagged' },
    { certNumber: '10293847', cardName: '1952 Topps Mickey Mantle #311', company: 'SGC', grade: 'SGC 5', population: 41, lastVerified: '2026-03-07', status: 'verified' },
    { certNumber: '55019283', cardName: '2020 Panini Prizm Justin Herbert RC', company: 'PSA', grade: 'PSA 9', population: 0, lastVerified: '2026-03-06', status: 'flagged' },
  ];
}
