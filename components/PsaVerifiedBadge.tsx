import React, { useEffect, useState } from 'react';
import { psaAdapter } from '../lib/integrations/psaAdapter';
import DataSourceBadge from './DataSourceBadge';

interface PsaVerifiedBadgeProps {
  certNumber: string | undefined;
  /**
   * The card's grading company. PSA verification only applies to PSA slabs,
   * so the badge renders nothing for any other (or unknown) grader — the mock
   * adapter returns `verified: true` for any input, so running it on a BGS/SGC
   * cert would falsely label it "PSA verified". Gate at the source.
   */
  gradingCompany?: string;
  size?: 'xs' | 'sm';
  className?: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'verified'; source: 'live' | 'mock' }
  | { kind: 'unverified' }
  | { kind: 'error' };

/**
 * Renders a `DataSourceBadge` reflecting a PSA cert-verification lookup.
 *
 * - Non-PSA grader (or `certNumber` empty) → renders nothing.
 * - Verification in flight → sample badge ("Verifying…").
 * - Verified via live PSA API → live badge ("PSA verified").
 * - Verified via mock adapter (USE_REAL_PSA off) → mock badge
 *   ("PSA verified (demo)") — the source label keeps the demo state honest.
 * - Not verified or lookup failed → stale badge ("Cert unverified") so users
 *   don't mistake it for a confirmed record.
 *
 * The adapter's `verifyCert` is cached in `apiCache`, so multiple badges for
 * the same cert on the same page share one network call.
 */
const PsaVerifiedBadge: React.FC<PsaVerifiedBadgeProps> = ({
  certNumber,
  gradingCompany,
  size = 'xs',
  className,
}) => {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const isPsaSlab = gradingCompany === 'PSA';

  useEffect(() => {
    if (!certNumber || !isPsaSlab) {
      setStatus({ kind: 'idle' });
      return;
    }
    let cancelled = false;
    setStatus({ kind: 'loading' });
    psaAdapter
      .verifyCert(certNumber)
      .then((result) => {
        if (cancelled) return;
        if (result.verified) {
          setStatus({ kind: 'verified', source: result.source === 'live' ? 'live' : 'mock' });
        } else {
          setStatus({ kind: 'unverified' });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [certNumber, isPsaSlab]);

  if (!certNumber || !isPsaSlab || status.kind === 'idle') return null;

  if (status.kind === 'loading') {
    return <DataSourceBadge variant="sample" size={size} label="Verifying…" className={className} />;
  }

  if (status.kind === 'verified') {
    return (
      <DataSourceBadge
        variant={status.source === 'live' ? 'live' : 'mock'}
        size={size}
        label={status.source === 'live' ? 'PSA verified' : 'PSA verified (demo)'}
        className={className}
      />
    );
  }

  // unverified or error — surface a soft "unverified" state so callers never
  // misread absent data as a confirmed cert.
  return <DataSourceBadge variant="stale" size={size} label="Cert unverified" className={className} />;
};

export default PsaVerifiedBadge;
