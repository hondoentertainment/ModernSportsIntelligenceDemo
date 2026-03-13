#!/usr/bin/env node
/**
 * Feature Change Analyzer — compares current feature state against PRD.md
 *
 * Identifies:
 * - Features mentioned in PRD but not yet implemented (in featureCatalog)
 * - Features implemented but not mentioned in PRD
 * - Phase coverage gaps
 *
 * Usage:
 *   npx tsx scripts/feature-diff.ts
 *   npx tsx scripts/feature-diff.ts --prd ./PRD.md
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Types ───────────────────────────────────────────────────────────────────────

interface CatalogFeature {
  id: string;
  name: string;
  phase: number;
  tier: string;
  category: string;
}

interface PrdFeature {
  name: string;
  phase: number | null;
  section: string;
}

interface DiffReport {
  inPrdOnly: PrdFeature[];
  inCatalogOnly: CatalogFeature[];
  matched: { prd: PrdFeature; catalog: CatalogFeature }[];
  phaseCoverage: { phase: number; inPrd: boolean; inCatalog: boolean }[];
}

// ── Parse featureCatalog.ts ─────────────────────────────────────────────────────

function parseCatalog(rootDir: string): CatalogFeature[] {
  const catalogPath = path.join(rootDir, 'lib', 'featureCatalog.ts');
  const content = fs.readFileSync(catalogPath, 'utf-8');

  const entries: CatalogFeature[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (!idMatch) continue;
    const nameMatch = line.match(/name:\s*'([^']+)'/);
    if (!nameMatch) continue;

    const tierMatch = line.match(/tier:\s*'([^']+)'/);
    const categoryMatch = line.match(/category:\s*'([^']+)'/);
    const phaseMatch = line.match(/phase:\s*(\d+)/);

    entries.push({
      id: idMatch[1],
      name: nameMatch[1],
      phase: phaseMatch ? parseInt(phaseMatch[1], 10) : 0,
      tier: tierMatch ? tierMatch[1] : '',
      category: categoryMatch ? categoryMatch[1] : '',
    });
  }

  return entries;
}

// ── Parse PRD.md ────────────────────────────────────────────────────────────────

function parsePrd(prdPath: string): PrdFeature[] {
  const content = fs.readFileSync(prdPath, 'utf-8');
  const features: PrdFeature[] = [];
  const seen = new Set<string>();

  let currentSection = 'General';

  const lines = content.split('\n');
  for (const line of lines) {
    // Track section headers
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      currentSection = headerMatch[1].trim();
    }

    // Match "Phase N:" or "Phase N " patterns
    const phaseMatch = line.match(/Phase\s+(\d+)[:\s]/i);

    // Match bold feature names "**Feature Name**"
    const boldMatch = line.match(/\*\*([^*]+)\*\*/g);
    if (boldMatch) {
      for (const b of boldMatch) {
        const featureName = b.replace(/\*\*/g, '').trim();
        // Filter out non-feature bold text (too short, common labels, etc.)
        if (featureName.length < 4) continue;
        if (/^(Note|Warning|Important|Version|Key|Phase|Section|TODO)/i.test(featureName)) continue;
        if (seen.has(featureName.toLowerCase())) continue;
        seen.add(featureName.toLowerCase());

        features.push({
          name: featureName,
          phase: phaseMatch ? parseInt(phaseMatch[1], 10) : null,
          section: currentSection,
        });
      }
    }

    // Match "- **Name**: Description" and "- Name: Description" patterns with phases
    if (phaseMatch && !boldMatch) {
      const descMatch = line.match(/Phase\s+\d+[:\s]+([^:,]+)/i);
      if (descMatch) {
        const name = descMatch[1].replace(/\*\*/g, '').trim();
        if (name.length >= 4 && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          features.push({
            name,
            phase: parseInt(phaseMatch[1], 10),
            section: currentSection,
          });
        }
      }
    }
  }

  return features;
}

// ── Fuzzy name matching ─────────────────────────────────────────────────────────

function normalize(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);

  // Exact match
  if (na === nb) return true;

  // One contains the other
  if (na.includes(nb) || nb.includes(na)) return true;

  // Word overlap (at least 60% of shorter name's words match)
  const wa = new Set(na.split(' '));
  const wb = new Set(nb.split(' '));
  const smaller = wa.size <= wb.size ? wa : wb;
  const larger = wa.size > wb.size ? wa : wb;
  let matches = 0;
  for (const w of smaller) {
    if (larger.has(w)) matches++;
  }
  return smaller.size > 0 && matches / smaller.size >= 0.6;
}

// ── Diff logic ──────────────────────────────────────────────────────────────────

function computeDiff(catalog: CatalogFeature[], prd: PrdFeature[]): DiffReport {
  const matched: DiffReport['matched'] = [];
  const catalogMatched = new Set<string>();
  const prdMatched = new Set<number>();

  // Try to match PRD features to catalog features
  for (let pi = 0; pi < prd.length; pi++) {
    const prdFeature = prd[pi];
    for (const catFeature of catalog) {
      if (catalogMatched.has(catFeature.id)) continue;
      if (fuzzyMatch(prdFeature.name, catFeature.name)) {
        matched.push({ prd: prdFeature, catalog: catFeature });
        catalogMatched.add(catFeature.id);
        prdMatched.add(pi);
        break;
      }
    }
  }

  const inPrdOnly = prd.filter((_, i) => !prdMatched.has(i));
  const inCatalogOnly = catalog.filter(c => !catalogMatched.has(c.id));

  // Phase coverage
  const allPhases = new Set<number>();
  catalog.forEach(c => allPhases.add(c.phase));
  prd.filter(p => p.phase !== null).forEach(p => allPhases.add(p.phase!));
  const phaseCoverage = Array.from(allPhases).sort((a, b) => a - b).map(phase => ({
    phase,
    inPrd: prd.some(p => p.phase === phase),
    inCatalog: catalog.some(c => c.phase === phase),
  }));

  return { inPrdOnly, inCatalogOnly, matched, phaseCoverage };
}

// ── Report ──────────────────────────────────────────────────────────────────────

function printReport(diff: DiffReport): void {
  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║  MSI Feature Diff — PRD vs Implementation                  ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

  console.log(`  Matched features:      ${diff.matched.length}`);
  console.log(`  In PRD only:           ${diff.inPrdOnly.length}`);
  console.log(`  In catalog only:       ${diff.inCatalogOnly.length}\n`);

  if (diff.inPrdOnly.length > 0) {
    console.log('─── Features in PRD but NOT implemented ───────────────────────\n');
    diff.inPrdOnly.forEach(f => {
      const phase = f.phase !== null ? `Phase ${f.phase}` : 'No phase';
      console.log(`  ◯ ${f.name} (${phase}) — ${f.section}`);
    });
    console.log('');
  }

  if (diff.inCatalogOnly.length > 0) {
    console.log('─── Features implemented but NOT in PRD ───────────────────────\n');
    diff.inCatalogOnly.forEach(f => {
      console.log(`  ● ${f.name} (Phase ${f.phase}) — ${f.tier} / ${f.category}`);
    });
    console.log('');
  }

  // Phase coverage gaps
  const missingInCatalog = diff.phaseCoverage.filter(p => p.inPrd && !p.inCatalog);
  const missingInPrd = diff.phaseCoverage.filter(p => !p.inPrd && p.inCatalog);

  if (missingInCatalog.length > 0) {
    console.log('─── Phases in PRD missing from catalog ────────────────────────\n');
    console.log(`  ${missingInCatalog.map(p => p.phase).join(', ')}\n`);
  }

  if (missingInPrd.length > 0) {
    console.log('─── Phases in catalog missing from PRD ────────────────────────\n');
    console.log(`  ${missingInPrd.map(p => p.phase).join(', ')}\n`);
  }

  // Coverage summary
  const totalPhases = diff.phaseCoverage.length;
  const coveredBoth = diff.phaseCoverage.filter(p => p.inPrd && p.inCatalog).length;
  console.log('─── Coverage Summary ──────────────────────────────────────────\n');
  console.log(`  Total distinct phases: ${totalPhases}`);
  console.log(`  Covered in both:      ${coveredBoth}`);
  console.log(`  Coverage:             ${totalPhases ? Math.round((coveredBoth / totalPhases) * 100) : 0}%\n`);
}

// ── Arg parsing ─────────────────────────────────────────────────────────────────

function getArgs(argv: string[]): { prdPath: string } {
  let prdPath = '';
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--prd' && argv[i + 1]) {
      prdPath = argv[++i];
    }
  }
  return { prdPath };
}

// ── Main ────────────────────────────────────────────────────────────────────────

function main(): void {
  const rootDir = path.resolve(process.cwd());
  const { prdPath: argPrd } = getArgs(process.argv);

  const prdPath = argPrd
    ? (path.isAbsolute(argPrd) ? argPrd : path.resolve(process.cwd(), argPrd))
    : path.join(rootDir, 'PRD.md');

  if (!fs.existsSync(prdPath)) {
    console.error(`\nERROR: PRD file not found: ${prdPath}`);
    console.error('Use --prd <path> to specify the PRD file location.\n');
    process.exit(1);
  }

  const catalog = parseCatalog(rootDir);
  const prd = parsePrd(prdPath);

  console.log(`  Parsed ${catalog.length} features from featureCatalog.ts`);
  console.log(`  Parsed ${prd.length} feature mentions from PRD.md`);

  const diff = computeDiff(catalog, prd);
  printReport(diff);
}

main();
