/**
 * CSP violation collector. The enforcing Content-Security-Policy in
 * vercel.json points `report-uri` / `report-to` here so production
 * violations are visible in server logs instead of failing silently.
 *
 * Accepts both legacy `application/csp-report` bodies and the newer
 * Reporting API `application/reports+json` batches. Always returns 204 —
 * a report endpoint must never push errors back to the browser.
 */
import { apiLogger } from './lib/logger';

interface CspReportRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface CspResponse {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { json: (o: object) => unknown; end: () => unknown };
}

interface CspViolation {
  documentUri?: string;
  blockedUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  disposition?: string;
}

// Cap how many violations we log per request so a misbehaving client
// cannot flood logs.
const MAX_LOGGED = 10;

function normalize(raw: unknown): CspViolation[] {
  if (!raw || typeof raw !== 'object') return [];

  // Legacy format: { "csp-report": { "document-uri": ..., ... } }
  const legacy = (raw as Record<string, unknown>)['csp-report'];
  if (legacy && typeof legacy === 'object') {
    const r = legacy as Record<string, unknown>;
    return [
      {
        documentUri: String(r['document-uri'] ?? ''),
        blockedUri: String(r['blocked-uri'] ?? ''),
        violatedDirective: String(r['violated-directive'] ?? ''),
        effectiveDirective: String(r['effective-directive'] ?? ''),
        disposition: String(r['disposition'] ?? 'enforce'),
      },
    ];
  }

  // Reporting API format: [ { type: 'csp-violation', body: {...} }, ... ]
  if (Array.isArray(raw)) {
    return raw
      .filter((entry) => entry && (entry as Record<string, unknown>).type === 'csp-violation')
      .map((entry) => {
        const body = ((entry as Record<string, unknown>).body ?? {}) as Record<string, unknown>;
        return {
          documentUri: String(body['documentURL'] ?? ''),
          blockedUri: String(body['blockedURL'] ?? ''),
          violatedDirective: String(body['effectiveDirective'] ?? ''),
          effectiveDirective: String(body['effectiveDirective'] ?? ''),
          disposition: String(body['disposition'] ?? 'enforce'),
        };
      });
  }

  return [];
}

export default async function handler(req: CspReportRequest, res: CspResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let parsed: unknown = req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = null;
    }
  }

  const violations = normalize(parsed).slice(0, MAX_LOGGED);
  if (violations.length === 0) {
    apiLogger.warn('CSP report received with no parseable violations');
  } else {
    for (const v of violations) {
      apiLogger.warn('CSP violation', v);
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}
