#!/usr/bin/env npx tsx
// @ts-nocheck
/**
 * Feature Coverage Agent
 *
 * Reads the feature catalog and cross-references with tests, pages,
 * components (widgets and modals) to produce a coverage matrix.
 *
 * Usage:
 *   npx tsx scripts/feature-coverage.ts
 *   npx tsx scripts/feature-coverage.ts --json   (machine-readable output)
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'lib', 'featureCatalog.ts');
const PAGES_DIR = path.join(ROOT, 'pages');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const TESTS_DIR = path.join(ROOT, 'tests');
const JSON_MODE = process.argv.includes('--json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** List all files recursively under `dir` matching an optional extension filter */
function listFiles(dir: string, extensions?: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(full, extensions));
    } else if (!extensions || extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

/** Basename without extension */
function baseName(filePath: string): string {
  return path.basename(filePath).replace(/\.(tsx?|test\.tsx?)$/, '');
}

/** Lowercase set of basenames */
function baseNameSet(files: string[]): Set<string> {
  return new Set(files.map((f) => baseName(f).toLowerCase()));
}

// ---------------------------------------------------------------------------
// Parse the feature catalog
// ---------------------------------------------------------------------------

interface FeatureEntry {
  id: string;
  name: string;
  tier: string;
  category: string;
  status: string;
  path: string | null;
  modalId?: string;
  phase: number;
}

function parseFeatureCatalog(): FeatureEntry[] {
  const src = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const features: FeatureEntry[] = [];

  // Match each object literal inside FEATURE_CATALOG array
  const objectRegex = /\{[^}]+\}/g;
  let match: RegExpExecArray | null;

  while ((match = objectRegex.exec(src)) !== null) {
    const block = match[0];

    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const tierMatch = block.match(/tier:\s*'([^']+)'/);
    const categoryMatch = block.match(/category:\s*'([^']+)'/);
    const statusMatch = block.match(/status:\s*'([^']+)'/);
    const pathMatch = block.match(/path:\s*(?:'([^']*)'|null)/);
    const modalMatch = block.match(/modalId:\s*'([^']+)'/);
    const phaseMatch = block.match(/phase:\s*(\d+)/);

    if (idMatch && nameMatch) {
      features.push({
        id: idMatch[1],
        name: nameMatch[1],
        tier: tierMatch?.[1] ?? 'Unknown',
        category: categoryMatch?.[1] ?? 'Unknown',
        status: statusMatch?.[1] ?? 'unknown',
        path: pathMatch?.[1] ?? null,
        modalId: modalMatch?.[1],
        phase: phaseMatch ? parseInt(phaseMatch[1], 10) : 0,
      });
    }
  }

  return features;
}

// ---------------------------------------------------------------------------
// Build coverage data
// ---------------------------------------------------------------------------

interface CoverageRow {
  id: string;
  name: string;
  tier: string;
  category: string;
  phase: number;
  hasPage: boolean;
  hasWidget: boolean;
  hasModal: boolean;
  hasTest: boolean;
  coverageScore: number; // 0-100
}

function buildCoverage(): CoverageRow[] {
  const features = parseFeatureCatalog();

  // Collect files
  const pageFiles = listFiles(PAGES_DIR, ['.tsx']);
  const componentFiles = listFiles(COMPONENTS_DIR, ['.tsx']);
  const testFiles = [
    ...listFiles(path.join(TESTS_DIR, 'lib'), ['.test.ts']),
    ...listFiles(path.join(TESTS_DIR, 'components'), ['.test.tsx', '.test.ts']),
    ...listFiles(path.join(TESTS_DIR, 'e2e'), ['.spec.ts']),
  ];

  const pageBaseNames = baseNameSet(pageFiles);
  const componentBaseNames = baseNameSet(componentFiles);

  // Build a lowercased set of all test file basenames (strip .test / .spec)
  const testBaseNames = new Set(
    testFiles.map((f) => {
      const name = path.basename(f);
      return name
        .replace(/\.spec\.ts$/, '')
        .replace(/\.test\.tsx?$/, '')
        .toLowerCase();
    }),
  );

  // Also read test file contents to search for feature IDs
  const allTestContent = testFiles
    .map((f) => fs.readFileSync(f, 'utf-8'))
    .join('\n')
    .toLowerCase();

  // Read all source files for cross-referencing
  const _allSourceFiles = [
    ...listFiles(path.join(ROOT, 'lib'), ['.ts']),
    ...componentFiles,
    ...pageFiles,
  ];

  const rows: CoverageRow[] = features.map((feature) => {
    const idLower = feature.id.toLowerCase();
    // Convert kebab-case to likely PascalCase and camelCase for matching
    const pascal = feature.id
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    const pascalLower = pascal.toLowerCase();

    // -- Has page? --
    let hasPage = false;
    if (feature.path && feature.path !== '/') {
      // Feature declares a route — check if a matching page file exists
      const routeSlug = feature.path.replace(/^\//, '').toLowerCase();
      hasPage = pageBaseNames.has(routeSlug) || pageBaseNames.has(pascalLower);
    } else if (feature.path === '/') {
      // Dashboard-level feature, consider it covered
      hasPage = true;
    } else {
      // Modal-only feature — no page needed, mark as N/A (true)
      hasPage = true;
    }

    // -- Has widget? --
    const widgetName = `${pascalLower}widget`;
    const hasWidget =
      componentBaseNames.has(widgetName) ||
      componentBaseNames.has(`${pascalLower}`) ||
      // Check for partial matches
      [...componentBaseNames].some(
        (n) => n.includes(idLower.replace(/-/g, '')) && n.includes('widget'),
      );

    // -- Has modal? --
    const modalName = `${pascalLower}modal`;
    const hasModal =
      componentBaseNames.has(modalName) ||
      // Check for partial matches
      [...componentBaseNames].some(
        (n) => n.includes(idLower.replace(/-/g, '')) && n.includes('modal'),
      );

    // -- Has test? --
    const hasTest =
      testBaseNames.has(pascalLower) ||
      testBaseNames.has(`${pascalLower}service`) ||
      testBaseNames.has(`${pascalLower}modal`) ||
      testBaseNames.has(idLower.replace(/-/g, '')) ||
      allTestContent.includes(idLower) ||
      allTestContent.includes(pascalLower);

    // Calculate coverage score (weighted)
    let score = 0;
    if (hasPage) score += 25;
    if (hasWidget) score += 25;
    if (hasModal) score += 25;
    if (hasTest) score += 25;

    return {
      id: feature.id,
      name: feature.name,
      tier: feature.tier,
      category: feature.category,
      phase: feature.phase,
      hasPage,
      hasWidget,
      hasModal,
      hasTest,
      coverageScore: score,
    };
  });

  return rows.sort((a, b) => a.phase - b.phase);
}

// ---------------------------------------------------------------------------
// Render output
// ---------------------------------------------------------------------------

function renderMarkdown(rows: CoverageRow[]): string {
  const lines: string[] = [];
  const total = rows.length;
  const fullyCovered = rows.filter((r) => r.coverageScore === 100).length;
  const avgScore = Math.round(rows.reduce((s, r) => s + r.coverageScore, 0) / total);

  const withPages = rows.filter((r) => r.hasPage).length;
  const withWidgets = rows.filter((r) => r.hasWidget).length;
  const withModals = rows.filter((r) => r.hasModal).length;
  const withTests = rows.filter((r) => r.hasTest).length;

  lines.push('# Feature Coverage Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString().split('T')[0]}`);
  lines.push(`**Total features:** ${total}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Fully covered (page + widget + modal + test) | ${fullyCovered}/${total} (${Math.round((fullyCovered / total) * 100)}%) |`);
  lines.push(`| Features with pages | ${withPages}/${total} |`);
  lines.push(`| Features with widgets | ${withWidgets}/${total} |`);
  lines.push(`| Features with modals | ${withModals}/${total} |`);
  lines.push(`| Features with tests | ${withTests}/${total} |`);
  lines.push(`| Average coverage score | ${avgScore}/100 |`);
  lines.push('');

  // Group by tier
  const tiers = new Map<string, CoverageRow[]>();
  for (const row of rows) {
    const list = tiers.get(row.tier) || [];
    list.push(row);
    tiers.set(row.tier, list);
  }

  for (const [tier, tierRows] of tiers) {
    lines.push(`## ${tier}`);
    lines.push('');
    lines.push('| # | Feature | Page | Widget | Modal | Test | Score |');
    lines.push('|---|---------|------|--------|-------|------|-------|');

    for (const row of tierRows) {
      const check = (v: boolean) => (v ? 'Y' : '**--**');
      const scoreEmoji =
        row.coverageScore === 100 ? '100' : row.coverageScore >= 75 ? `${row.coverageScore}` : `${row.coverageScore}`;
      lines.push(
        `| ${row.phase} | ${row.name} | ${check(row.hasPage)} | ${check(row.hasWidget)} | ${check(row.hasModal)} | ${check(row.hasTest)} | ${scoreEmoji} |`,
      );
    }
    lines.push('');
  }

  // Gap analysis
  const gaps = rows.filter((r) => r.coverageScore < 100);
  if (gaps.length > 0) {
    lines.push('## Coverage Gaps');
    lines.push('');
    lines.push('Features missing one or more artifacts:');
    lines.push('');
    for (const gap of gaps) {
      const missing: string[] = [];
      if (!gap.hasPage) missing.push('page');
      if (!gap.hasWidget) missing.push('widget');
      if (!gap.hasModal) missing.push('modal');
      if (!gap.hasTest) missing.push('test');
      lines.push(`- **${gap.name}** (${gap.id}): missing ${missing.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {

  const rows = buildCoverage();

  if (JSON_MODE) {
    const summary = {
      generated: new Date().toISOString(),
      totalFeatures: rows.length,
      fullyCovered: rows.filter((r) => r.coverageScore === 100).length,
      averageScore: Math.round(rows.reduce((s, r) => s + r.coverageScore, 0) / rows.length),
      features: rows,
    };
    process.stdout.write(JSON.stringify(summary, null, 2));
  } else {
    const report = renderMarkdown(rows);

    // Also write to file
    const outPath = path.join(ROOT, 'coverage-report.md');
    fs.writeFileSync(outPath, report, 'utf-8');
  }
}

main();
