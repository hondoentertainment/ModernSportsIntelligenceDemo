/**
 * Grading & authentication types for PSA, BGS, SGC adapters.
 */

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CSG' | 'HGA';

/** Result of a cert number lookup */
export interface CertVerificationResult {
  certNumber: string;
  company: GradingCompany;
  verified: boolean;
  /** Card details from the grading company */
  cardDetails?: {
    year: string;
    brand: string;
    set: string;
    cardNumber: string;
    player: string;
    grade: string;
    qualifier?: string;
    variety?: string;
  };
  /** Population data for this exact card+grade */
  population?: {
    thisGrade: number;
    higherGrades: number;
    totalGraded: number;
  };
  labelType?: string;
  imageUrl?: string;
  lookupDate: string;
}

/** Population report entry */
export interface PopulationEntry {
  grade: string;
  count: number;
  qualifier?: string;
}

/** Full population report for a card */
export interface PopulationReport {
  year: string;
  brand: string;
  set: string;
  cardNumber: string;
  player: string;
  company: GradingCompany;
  grades: PopulationEntry[];
  totalGraded: number;
  lastUpdated: string;
}

/** Grade prediction input */
export interface GradePredictionInput {
  imageUrls?: string[];
  corners: number;
  edges: number;
  surface: number;
  centering: number;
  company: GradingCompany;
}

/** Grade prediction result */
export interface GradePredictionResult {
  predictedGrade: string;
  confidence: number;
  breakdown: {
    corners: string;
    edges: string;
    surface: string;
    centering: string;
  };
  estimatedValue: number;
  costToGrade: number;
  roi: number;
}
