import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  env,
  getEnvSchemaFailureMessages,
  getSupabaseEnvPairingIssues,
  getProductionTelemetryIssues,
  isClientProductionBuild,
} from '../lib/utils/env';

/**
 * Blocks the top of the shell when production build has invalid or mismatched public env.
 */
const ProductionConfigBanner: React.FC = () => {
  const prod = isClientProductionBuild();
  const schemaIssues = prod ? getEnvSchemaFailureMessages() : [];
  const pairing = prod ? getSupabaseEnvPairingIssues(env()) : [];
  const telemetry = prod ? getProductionTelemetryIssues(env()) : [];
  const all = [...schemaIssues, ...pairing, ...telemetry];
  if (all.length === 0) return null;

  return (
    <div
      role="alert"
      className="shrink-0 border-b border-red-500/40 bg-red-950/90 px-4 py-3 text-left text-sm text-red-100"
    >
      <div className="flex items-start gap-3 max-w-5xl mx-auto">
        <AlertTriangle className="shrink-0 text-red-400 mt-0.5" size={20} aria-hidden />
        <div>
          <p className="font-black uppercase tracking-widest text-xs text-red-300 mb-2">
            Production configuration error
          </p>
          <ul className="list-disc list-inside space-y-1 text-red-100/95">
            {all.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductionConfigBanner;
