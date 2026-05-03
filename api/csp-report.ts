/**
 * CSP violation sink. Browsers POST here when a directive blocks a resource
 * (configured via `report-uri` and the `report-to` group in vercel.json).
 *
 * Both legacy `application/csp-report` and modern `application/reports+json`
 * payloads are accepted. The body is structured-logged so violations show up
 * in Vercel logs alongside other apiLogger output.
 */

import { apiLogger } from './lib/logger';

interface CspReportShape {
  'document-uri'?: string;
  referrer?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'original-policy'?: string;
  disposition?: string;
  'blocked-uri'?: string;
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

function header(req: RequestLike, name: string): string | undefined {
  const h = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(h) ? h[0] : h;
}

function summarize(report: CspReportShape, ua: string | undefined): Record<string, unknown> {
  return {
    directive: report['effective-directive'] ?? report['violated-directive'],
    blockedUri: report['blocked-uri'],
    documentUri: report['document-uri'],
    sourceFile: report['source-file'],
    line: report['line-number'],
    column: report['column-number'],
    disposition: report.disposition,
    userAgent: ua,
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const ua = header(req, 'user-agent');
  const body = req.body;

  try {
    if (Array.isArray(body)) {
      // Reporting API: array of report entries.
      for (const entry of body as ReportingApiEntry[]) {
        if (entry?.type !== 'csp-violation' || !entry.body) continue;
        apiLogger.warn('CSP violation', summarize(entry.body, entry.user_agent ?? ua));
      }
    } else if (body && typeof body === 'object') {
      const wrapped = (body as { 'csp-report'?: CspReportShape })['csp-report'];
      const report = wrapped ?? (body as CspReportShape);
      if (report) {
        apiLogger.warn('CSP violation', summarize(report, ua));
      }
    }
  } catch (err) {
    apiLogger.error('Failed to parse CSP report', err);
  }

  // Always 204 — the browser does not retry.
  return res.status(204).end();
}
