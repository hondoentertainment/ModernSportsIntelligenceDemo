import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface BetaFeatureBannerProps {
  /** Short feature name for the banner heading. */
  featureName: string;
  /** What data source is shown (e.g. simulated scores, demo vault). */
  dataSourceLabel: string;
  /** Optional extra legal or product copy. */
  disclaimer?: string;
}

/**
 * Required disclosure for catalog `beta` features per docs/BETA_FEATURE_EXIT_CRITERIA.md.
 */
const BetaFeatureBanner: React.FC<BetaFeatureBannerProps> = ({
  featureName,
  dataSourceLabel,
  disclaimer,
}) => (
  <div
    role="status"
    className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
    data-testid="beta-feature-banner"
  >
    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
    <div>
      <p className="font-semibold text-amber-200">
        Beta — {featureName}
      </p>
      <p className="mt-1 text-amber-100/90">
        Data source: <span className="font-medium">{dataSourceLabel}</span>.
        {' '}Not live production trading, grading certification, or financial advice.
      </p>
      {disclaimer ? (
        <p className="mt-1 text-xs text-amber-200/80">{disclaimer}</p>
      ) : null}
    </div>
  </div>
);

export default BetaFeatureBanner;
