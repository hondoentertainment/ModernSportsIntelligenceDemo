import { describe, expect, it } from 'vitest';
import { fitIssueBody, GITHUB_ISSUE_BODY_LIMIT } from '../../scripts/fit-issue-body.mjs';

function healthReport(options?: {
  largeFiles?: number;
  duplicates?: number;
  padding?: string;
}) {
  const largeFiles = options?.largeFiles ?? 3;
  const duplicates = options?.duplicates ?? 2;
  const fileRows = Array.from({ length: largeFiles }, (_, index) => {
    const lines = 500 + index;
    return `| \`lib/file-${String(index).padStart(4, '0')}.ts\` | ${lines} |`;
  });
  fileRows.push('| `lib/analytics/realTimePriceEngineService.ts` | 1808 |');
  const duplicateBlocks = Array.from({ length: duplicates }, (_, index) => {
    const name = `service${String(index).padStart(4, '0')}.ts`;
    return `Duplicate filename: ${name}\n  ./lib/${name}\n  ./lib/analytics/${name}`;
  });

  return [
    '## Code Health Report',
    '',
    '**Generated:** 2026-10-05 06:49 UTC',
    '',
    '### Codebase Size',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    '| TypeScript/TSX files | 2087 |',
    '',
    '### Large Files (> 500 lines) — Consider Refactoring',
    '',
    '| File | Lines |',
    '|------|-------|',
    ...fileRows,
    '',
    '### Potentially Unused Exports',
    '',
    'Exports declared but not imported elsewhere (top 30):',
    '',
    '```',
    '```',
    '',
    '### Duplicate Code Patterns',
    '',
    'Files with similar names that may contain duplicate logic:',
    '',
    '```',
    ...duplicateBlocks,
    '',
    'Services with similar function signatures (possible abstraction candidates):',
    '  (33 occurrences) function formatCurrency(value: number): string',
    '```',
    '',
    '### Health Score',
    '',
    '| Dimension | Score |',
    '|-----------|-------|',
    '| **Overall health** | **50/100** |',
    '',
    options?.padding ?? '',
  ].join('\n');
}

describe('fitIssueBody', () => {
  it('returns a short report unchanged', () => {
    const report = healthReport();
    expect(report.length).toBeLessThan(GITHUB_ISSUE_BODY_LIMIT);
    expect(fitIssueBody(report)).toBe(report);
  });

  it('keeps an oversized report within the GitHub issue body limit', () => {
    const report = healthReport({ largeFiles: 400, duplicates: 800 });
    expect(report.length).toBeGreaterThan(GITHUB_ISSUE_BODY_LIMIT);

    const runUrl =
      'https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/actions/runs/37274330943';
    const body = fitIssueBody(report, { runUrl });

    expect(body.length).toBeLessThanOrEqual(GITHUB_ISSUE_BODY_LIMIT);
    expect(body).toContain('### Codebase Size');
    expect(body).toContain('| **Overall health** | **50/100** |');
    expect(body).toContain('| `lib/analytics/realTimePriceEngineService.ts` | 1808 |');
    expect(body).toContain('function formatCurrency(value: number): string');
    expect(body).toContain(runUrl);
    expect(body).toContain('code-health-report');
    expect(body).not.toContain('service0799.ts');
  });

  it('still fits when only a custom limit is available', () => {
    const report = healthReport({ padding: 'x'.repeat(5000) });
    const body = fitIssueBody(report, { limit: 800, runUrl: 'https://example.test/run/1' });
    expect(body.length).toBeLessThanOrEqual(800);
    expect(body).toContain('https://example.test/run/1');
  });

  it('keeps the health score when a non-bulk section is what overflows', () => {
    const report = healthReport({
      largeFiles: 1,
      duplicates: 1,
      padding: '',
    }).replace(
      '```\n```',
      `\`\`\`\n${'unused export line that should be cut\n'.repeat(200)}\`\`\``,
    );
    const body = fitIssueBody(report, { limit: 900, runUrl: 'https://example.test/run/3' });
    expect(body.length).toBeLessThanOrEqual(900);
    expect(body).toContain('| **Overall health** | **50/100** |');
    expect(body).toContain('https://example.test/run/3');
  });

  it('truncates a heading-free report without exceeding the limit', () => {
    const report = `${'line of duplicate detail\n'.repeat(4000)}done`;
    expect(report.length).toBeGreaterThan(GITHUB_ISSUE_BODY_LIMIT);
    const body = fitIssueBody(report, { runUrl: 'https://example.test/run/2' });
    expect(body.length).toBeLessThanOrEqual(GITHUB_ISSUE_BODY_LIMIT);
    expect(body).toContain('https://example.test/run/2');
  });
});
