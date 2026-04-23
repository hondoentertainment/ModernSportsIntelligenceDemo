#!/usr/bin/env node
// @ts-nocheck
/**
 * Batch Feature Builder — runs the orchestrator for multiple features from a JSON file.
 *
 * Usage:
 *   npx tsx scripts/batch-builder.ts --input features.json
 *
 * features.json format:
 * [
 *   { "name": "Market Maker", "phase": 114, "tier": "industry-first", "category": "Trading", "description": "AI market making", "icon": "Bot" },
 *   { "name": "Smart Contract Escrow", "phase": 115, "tier": "industry-first", "category": "Trading", "description": "Blockchain escrow", "icon": "Shield" }
 * ]
 *
 * Features are built in the order specified. If a feature fails, subsequent
 * features continue unless --stop-on-error is passed.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { orchestrate } from './orchestrator.js';

// ── Types ───────────────────────────────────────────────────────────────────────

interface FeatureSpec {
  name: string;
  phase: number;
  tier: string;
  category: string;
  description: string;
  icon: string;
  dependsOn?: string; // name of a feature that must be built first
}

interface BatchResult {
  name: string;
  phase: number;
  success: boolean;
  files: string[];
  errors: string[];
  duration: number;
}

// ── Arg parsing ─────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { inputFile: string; stopOnError: boolean; dryRun: boolean } {
  let inputFile = '';
  let stopOnError = false;
  let dryRun = false;

  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--input':
      case '-i':
        inputFile = argv[++i];
        break;
      case '--stop-on-error':
        stopOnError = true;
        break;
      case '--dry-run':
        dryRun = true;
        break;
    }
  }

  if (!inputFile) {
    console.error('\nUsage: npx tsx scripts/batch-builder.ts --input features.json [--stop-on-error] [--dry-run]\n');
    console.error('Options:');
    console.error('  --input, -i <file>   JSON file with feature specifications');
    console.error('  --stop-on-error      Stop processing on first failure');
    console.error('  --dry-run            Show what would be built without building\n');
    process.exit(1);
  }

  return { inputFile, stopOnError, dryRun };
}

// ── Dependency resolution ───────────────────────────────────────────────────────

function resolveDependencyOrder(features: FeatureSpec[]): FeatureSpec[] {
  const byName = new Map<string, FeatureSpec>();
  features.forEach(f => byName.set(f.name, f));

  const resolved: FeatureSpec[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(name: string): void {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      console.error(`  ERROR: Circular dependency detected involving "${name}"`);
      process.exit(1);
    }

    const feature = byName.get(name);
    if (!feature) return;

    visiting.add(name);

    if (feature.dependsOn) {
      const deps = Array.isArray(feature.dependsOn) ? feature.dependsOn : [feature.dependsOn];
      for (const dep of deps) {
        if (byName.has(dep)) {
          visit(dep);
        }
      }
    }

    visiting.delete(name);
    visited.add(name);
    resolved.push(feature);
  }

  features.forEach(f => visit(f.name));
  return resolved;
}

// ── Main ────────────────────────────────────────────────────────────────────────

function main(): void {
  const { inputFile, stopOnError, dryRun } = parseArgs(process.argv);
  const rootDir = path.resolve(process.cwd());

  // Resolve input file path
  const resolvedInput = path.isAbsolute(inputFile) ? inputFile : path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(resolvedInput)) {
    console.error(`\nERROR: Input file not found: ${resolvedInput}\n`);
    process.exit(1);
  }

  let features: FeatureSpec[];
  try {
    const raw = fs.readFileSync(resolvedInput, 'utf-8');
    features = JSON.parse(raw);
    if (!Array.isArray(features)) {
      console.error('\nERROR: Input file must contain a JSON array of feature specs\n');
      process.exit(1);
    }
  } catch (e: any) {
    console.error(`\nERROR: Failed to parse ${resolvedInput}: ${e.message}\n`);
    process.exit(1);
  }

  // Resolve dependency order
  const ordered = resolveDependencyOrder(features);

  if (dryRun) {
    process.exit(0);
  }

  // Build each feature
  const results: BatchResult[] = [];
  let failCount = 0;

  for (let i = 0; i < ordered.length; i++) {
    const feature = ordered[i];

    const startTime = Date.now();

    try {
      const result = orchestrate(feature, rootDir);
      const duration = Date.now() - startTime;

      results.push({
        name: feature.name,
        phase: feature.phase,
        success: result.success,
        files: result.files,
        errors: result.errors,
        duration,
      });

      if (!result.success) {
        failCount++;
        if (stopOnError) {
          break;
        }
      }
    } catch (e: any) {
      const duration = Date.now() - startTime;
      failCount++;
      results.push({
        name: feature.name,
        phase: feature.phase,
        success: false,
        files: [],
        errors: [e.message],
        duration,
      });

      if (stopOnError) {
        break;
      }
    }
  }

  // Report errors
  results.forEach(r => {
    if (r.errors.length > 0) {
      r.errors.forEach(e => console.warn(`      ERROR: ${e}`));
    }
  });

  process.exit(failCount > 0 ? 1 : 0);
}

main();
