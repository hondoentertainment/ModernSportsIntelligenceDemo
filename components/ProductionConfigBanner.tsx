import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  env,
  getEnvSchemaFailureMessages,
  getSupabaseEnvPairingIssues,
  getProductionTelemetryIssues,
  getProductionServerAuthIssues,
  getProductionServerAuthAdminHints,
  isClientDemoMode,
  isClientProductionBuild,
  type HealthConfigPayload,
} from '../lib/utils/env';

/**
 * Blocks the top of the shell when production build has invalid or mismatched public env.
 */
const ProductionConfigBanner: React.FC = () => {
  const prod = isClientProductionBuild();
  const schemaIssues = prod ? getEnvSchemaFailureMessages() : [];
  const pairing = prod ? getSupabaseEnvPairingIssues(env()) : [];
  const telemetry = prod ? getProductionTelemetryIssues(env()) : [];
  const [serverAuthIssues, setServerAuthIssues] = useState<string[]>([]);

  useEffect(() => {
    if (!prod || isClientDemoMode(env())) {
      setServerAuthIssues([]);
      return;
    }

    let cancelled = false;
    fetch('/api/health', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((body: HealthConfigPayload | null) => {
        if (!cancelled) {
          setServerAuthIssues(getProductionServerAuthIssues(env(), body));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [prod]);

  const all = [...schemaIssues, ...pairing, ...telemetry, ...serverAuthIssues];
  const adminHints = getProductionServerAuthAdminHints(serverAuthIssues);
  if (all.length === 0) return null;

  return (
    <div
      role="alert"
      className="shrink-0 border-b border-red-500/40 bg-red-950/90 px-4 py-3 text-left text-sm text-red-100"
    >
      <div className="flex items-start gap-3 max-w-5xl mx-auto">
        <AlertTriangle className="shrink-0 text-red-400 mt-0.5" size={20} aria-hidden />
        <div className="min-w-0">
          <p className="font-black uppercase tracking-widest text-xs text-red-300 mb-2">
            Production configuration error
          </p>
          <ul className="list-disc list-inside space-y-1 text-red-100/95">
            {all.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
          {adminHints.length > 0 && (
            <div className="mt-3 rounded border border-red-500/30 bg-red-950/60 px-3 py-2">
              <p className="font-semibold text-xs uppercase tracking-wide text-red-200 mb-1.5">
                Admin fix (server API auth)
              </p>
              <ul className="list-none space-y-0.5 font-mono text-xs text-red-100/90 break-all">
                {adminHints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionConfigBanner;
