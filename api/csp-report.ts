/**
 * CSP violation collector. The enforcing Content-Security-Policy in
 * vercel.json points `report-uri` / `report-to` here so production
 * violations are visible in server logs instead of failing silently.
 *
 * Accepts both legacy `application/csp-report` bodies and the newer
 * Reporting API `application/reports+json` batches. Always returns 204 —
 * a report endpoint must never push errors back to the browser.
 */
import { apiLogger } from './lib/logger.js';

interface CspReportShape {
  'document-uri'?: string;
  documentURL?: string;
  referrer?: string;
  'violated-directive'?: string;
  violatedDirective?: string;
  'effective-directive'?: string;
  effectiveDirective?: string;
  'original-policy'?: string;
  disposition?: string;
  'blocked-uri'?: string;
  blockedURL?: string;
  'line-number'?: number;
  'column-number'?: number;
  'source-file'?: string;
  'status-code'?: number;
  'script-sample'?: string;
}

interface ReportingApiEntry {
  type?: string;
  age?: number;
  url?: string;
  user_agent?: string;
  body?: CspReportShape & Record<string, unknown>;
}

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ResponseLike = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { end: () => unknown; json: (o: object) => unknown };
};

const MAX_LOGGED = 10;

function header(req: RequestLike, name: string): string | undefined {
  const h = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(h) ? h[0] : h;
}

function summarize(report: CspReportShape, ua: string | undefined): Record<string, unknown> {
  return {
    directive:
      report['effective-directive'] ??
      report.effectiveDirective ??
      report['violated-directive'] ??
      report.violatedDirective,
    blockedUri: report['blocked-uri'] ?? report.blockedURL,
    documentUri: report['document-uri'] ?? report.documentURL,
    sourceFile: report['source-file'],
    line: report['line-number'],
    column: report['column-number'],
    disposition: report.disposition,
    userAgent: ua,
  };
}

function normalize(raw: unknown, ua: string | undefined): Array<Record<string, unknown>> {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .filter((entry) => entry && (entry as Record<string, unknown>).type === 'csp-violation')
      .map((entry) => {
        const report = ((entry as ReportingApiEntry).body ?? {}) as CspReportShape;
        return summarize(report, (entry as ReportingApiEntry).user_agent ?? ua);
      });
  }

  if (typeof raw !== 'object') return [];

  const wrapped = (raw as { 'csp-report'?: CspReportShape })['csp-report'];
  const report = wrapped ?? (raw as CspReportShape);
  return report ? [summarize(report, ua)] : [];
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  let parsed: unknown = req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = null;
    }
  }

  const ua = header(req, 'user-agent');
  const violations = normalize(parsed, ua).slice(0, MAX_LOGGED);

  if (violations.length > 0) {
    for (const violation of violations) {
      apiLogger.warn('CSP violation', violation);
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}
