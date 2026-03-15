#!/usr/bin/env node
/**
 * Feature Integrity Validator — verifies that all features in featureCatalog.ts
 * have corresponding service, widget, modal, and page files, plus proper wiring
 * in App.tsx and constants.tsx.
 *
 * Usage:
 *   npx tsx scripts/feature-validator.ts
 *
 * Exit codes:
 *   0 — all features valid
 *   1 — issues found (suitable for CI gating)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Types ───────────────────────────────────────────────────────────────────────

interface FeatureEntry {
  id: string;
  name: string;
  path: string | null;
  phase: number;
  icon: string;
}

interface ValidationIssue {
  featureId: string;
  featureName: string;
  type: 'missing_file' | 'missing_route' | 'missing_nav' | 'orphaned';
  message: string;
  severity: 'error' | 'warning';
}

// ── Parse featureCatalog.ts ─────────────────────────────────────────────────────

function parseFeatureCatalog(rootDir: string): FeatureEntry[] {
  const catalogPath = path.join(rootDir, 'lib', 'featureCatalog.ts');
  const content = fs.readFileSync(catalogPath, 'utf-8');

  const entries: FeatureEntry[] = [];
  // Parse each line that contains a feature entry (has id: '...')
  const lines = content.split('\n');
  for (const line of lines) {
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (!idMatch) continue;
    const nameMatch = line.match(/name:\s*'([^']+)'/);
    if (!nameMatch) continue;

    const pathMatch = line.match(/path:\s*(?:'([^']*)'|null)/);
    const phaseMatch = line.match(/phase:\s*(\d+)/);
    const iconMatch = line.match(/icon:\s*'([^']+)'/);

    entries.push({
      id: idMatch[1],
      name: nameMatch[1],
      path: pathMatch ? (pathMatch[1] !== undefined ? pathMatch[1] : null) : null,
      phase: phaseMatch ? parseInt(phaseMatch[1], 10) : 0,
      icon: iconMatch ? iconMatch[1] : '',
    });
  }

  return entries;
}

// ── Name helpers ────────────────────────────────────────────────────────────────

function toPascalCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(name: string): string {
  const pascal = toPascalCase(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function _toKebabCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-|-$/g, '');
}

// ── Scan for files ──────────────────────────────────────────────────────────────

function getExistingFiles(rootDir: string, dir: string): Set<string> {
  const fullDir = path.join(rootDir, dir);
  if (!fs.existsSync(fullDir)) return new Set();
  return new Set(fs.readdirSync(fullDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx')));
}

// ── Validation logic ────────────────────────────────────────────────────────────

function validateFeatures(rootDir: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const features = parseFeatureCatalog(rootDir);

  const libFiles = getExistingFiles(rootDir, 'lib');
  const componentFiles = getExistingFiles(rootDir, 'components');
  const pageFiles = getExistingFiles(rootDir, 'pages');

  const appContent = fs.readFileSync(path.join(rootDir, 'App.tsx'), 'utf-8');
  const constContent = fs.readFileSync(path.join(rootDir, 'constants.tsx'), 'utf-8');

  // Features that have dedicated pages (with routes)
  const navigableFeatures = features.filter(f => f.path && f.path !== '/' && f.path !== null);

  // Check each navigable feature
  for (const feature of navigableFeatures) {
    const pascal = toPascalCase(feature.name);
    const camel = toCamelCase(feature.name);

    // Check for service file
    const serviceFile = `${camel}Service.ts`;
    if (!libFiles.has(serviceFile)) {
      // Try common variations
      const altService = `${pascal.charAt(0).toLowerCase() + pascal.slice(1)}Service.ts`;
      if (!libFiles.has(altService)) {
        issues.push({
          featureId: feature.id,
          featureName: feature.name,
          type: 'missing_file',
          message: `Missing service: lib/${serviceFile}`,
          severity: 'warning',
        });
      }
    }

    // Check for widget
    const widgetFile = `${pascal}Widget.tsx`;
    if (!componentFiles.has(widgetFile)) {
      issues.push({
        featureId: feature.id,
        featureName: feature.name,
        type: 'missing_file',
        message: `Missing widget: components/${widgetFile}`,
        severity: 'warning',
      });
    }

    // Check for modal
    const modalFile = `${pascal}Modal.tsx`;
    if (!componentFiles.has(modalFile)) {
      issues.push({
        featureId: feature.id,
        featureName: feature.name,
        type: 'missing_file',
        message: `Missing modal: components/${modalFile}`,
        severity: 'warning',
      });
    }

    // Check for page
    const pageFile = `${pascal}.tsx`;
    if (!pageFiles.has(pageFile)) {
      issues.push({
        featureId: feature.id,
        featureName: feature.name,
        type: 'missing_file',
        message: `Missing page: pages/${pageFile}`,
        severity: 'warning',
      });
    }

    // Check App.tsx has route
    if (feature.path && feature.path !== '/') {
      if (!appContent.includes(`path="${feature.path}"`)) {
        issues.push({
          featureId: feature.id,
          featureName: feature.name,
          type: 'missing_route',
          message: `App.tsx missing route for path="${feature.path}"`,
          severity: 'error',
        });
      }
    }

    // Check constants.tsx has nav item (by path match)
    if (feature.path && feature.path !== '/') {
      if (!constContent.includes(`path: '${feature.path}'`)) {
        issues.push({
          featureId: feature.id,
          featureName: feature.name,
          type: 'missing_nav',
          message: `constants.tsx missing nav item for path '${feature.path}'`,
          severity: 'warning',
        });
      }
    }
  }

  // Check for orphaned pages (pages without catalog entries)
  const _catalogPaths = new Set(features.filter(f => f.path).map(f => f.path));
  const allPages = getExistingFiles(rootDir, 'pages');
  const knownPageNames = new Set(features.map(f => toPascalCase(f.name)));
  // Also consider common page names that are infrastructure
  const infraPages = new Set(['Login', 'Signup', 'ForgotPassword', 'ResetPassword', 'PublicPortfolio', 'Profile', 'FeatureDirectory']);

  for (const pageFile of allPages) {
    const pageName = pageFile.replace(/\.tsx?$/, '');
    if (!knownPageNames.has(pageName) && !infraPages.has(pageName)) {
      issues.push({
        featureId: 'orphaned',
        featureName: pageName,
        type: 'orphaned',
        message: `Orphaned page: pages/${pageFile} (not in featureCatalog)`,
        severity: 'warning',
      });
    }
  }

  return issues;
}

// ── Report ──────────────────────────────────────────────────────────────────────

function printReport(issues: ValidationIssue[]): void {
  if (issues.length === 0) {
    return;
  }

  // Group by type
  const missingFiles = issues.filter(i => i.type === 'missing_file').length;
  const missingRoutes = issues.filter(i => i.type === 'missing_route').length;
  const missingNavs = issues.filter(i => i.type === 'missing_nav').length;
  const orphaned = issues.filter(i => i.type === 'orphaned').length;

  if (missingFiles) console.warn(`    Missing files:  ${missingFiles}`);
  if (missingRoutes) console.warn(`    Missing routes: ${missingRoutes}`);
  if (missingNavs) console.warn(`    Missing navs:   ${missingNavs}`);
  if (orphaned) console.warn(`    Orphaned:       ${orphaned}`);
}

// ── Main ────────────────────────────────────────────────────────────────────────

function main(): void {
  const rootDir = path.resolve(process.cwd());
  const issues = validateFeatures(rootDir);
  printReport(issues);

  const hasErrors = issues.some(i => i.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

main();
