import React, { useEffect, useState } from 'react';
import DataSourceBadge from './DataSourceBadge';
import { psaAdapter } from '../lib/integrations/psaAdapter';

interface CertVerifiedBadgeProps {
    certNumber: string;
    gradingCompany?: string;
    size?: 'xs' | 'sm';
    className?: string;
}

/**
 * Cert-verification label for any card that carries a `certNumber`.
 *
 * Looks the cert up through `psaAdapter.verifyCert` (PSA slabs only for now)
 * and renders the result with the shared DataSourceBadge so the live/mock
 * provenance of the verification is always visible: a real PSA confirmation
 * shows as "PSA Verified" (live), while the simulated adapter response is
 * labeled "PSA (demo)" and must never read as real verification.
 */
const CertVerifiedBadge: React.FC<CertVerifiedBadgeProps> = ({
    certNumber,
    gradingCompany,
    size = 'xs',
    className,
}) => {
    const [result, setResult] = useState<{ verified: boolean; source: 'live' | 'mock' } | null>(null);

    const isPsa = !gradingCompany || gradingCompany === 'PSA';

    useEffect(() => {
        // Drop the previous cert's result so a changed/cleared cert never
        // keeps showing a stale "PSA Verified" badge while (or instead of)
        // the new lookup.
        setResult(null);
        if (!isPsa || !certNumber) return;
        let cancelled = false;
        psaAdapter
            .verifyCert(certNumber)
            .then((r) => {
                if (!cancelled) setResult({ verified: r.verified, source: r.source });
            })
            .catch(() => {
                // verifyCert already degrades to mock internally; a throw here
                // means something unexpected — render nothing rather than an
                // unverifiable claim.
            });
        return () => {
            cancelled = true;
        };
    }, [certNumber, isPsa]);

    if (!isPsa || !result || !result.verified) return null;

    return (
        <DataSourceBadge
            variant={result.source === 'live' ? 'live' : 'mock'}
            label={result.source === 'live' ? 'PSA Verified' : 'PSA (demo)'}
            size={size}
            className={className}
        />
    );
};

export default CertVerifiedBadge;
