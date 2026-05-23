/**
 * Shared feature registry types — used by featureCatalog and route supplements.
 */

export type FeatureTier =
  | 'Core'
  | 'Differentiated'
  | 'Industry-First'
  | 'Competitive Moat'
  | 'Bloomberg-Grade'
  | 'Advanced Intelligence';

export type FeatureStatus = 'live' | 'beta' | 'demo' | 'coming-soon';

export interface Feature {
  id: string;
  name: string;
  description: string;
  tier: FeatureTier;
  category: string;
  status: FeatureStatus;
  /** Route path if navigable, or null for modal-only features */
  path: string | null;
  /** Related modal component name (for reference) */
  modalId?: string;
  /** Lucide icon name */
  icon: string;
  /** Phase number from roadmap */
  phase: number;
  /** Keywords for search matching */
  keywords: string[];
}
