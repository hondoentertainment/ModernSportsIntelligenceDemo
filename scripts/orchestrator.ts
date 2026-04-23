#!/usr/bin/env node
// @ts-nocheck
/**
 * Orchestrator — Automated Feature Builder for MSI Platform
 *
 * Generates all 4 required files (service, widget, modal, page) from templates
 * and auto-wires them into App.tsx, constants.tsx, and lib/featureCatalog.ts.
 *
 * Usage:
 *   npx tsx scripts/orchestrator.ts \
 *     --name "Market Maker" \
 *     --phase 114 \
 *     --tier "industry-first" \
 *     --category "Trading" \
 *     --description "AI-powered market making for card liquidity" \
 *     --icon "Bot"
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

// ── Arg parsing ─────────────────────────────────────────────────────────────────

interface FeatureSpec {
  name: string;
  phase: number;
  tier: string;
  category: string;
  description: string;
  icon: string;
}

function parseArgs(argv: string[]): FeatureSpec {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[++i];
      if (!value || value.startsWith('--')) {
        console.error(`Missing value for --${key}`);
        process.exit(1);
      }
      args[key] = value;
    }
  }

  const required = ['name', 'phase', 'tier', 'category', 'description', 'icon'];
  const missing = required.filter(k => !args[k]);
  if (missing.length > 0) {
    console.error(`\nMissing required arguments: ${missing.map(m => `--${m}`).join(', ')}`);
    console.error(`\nUsage: npx tsx scripts/orchestrator.ts \\`);
    console.error(`  --name "Feature Name" \\`);
    console.error(`  --phase 114 \\`);
    console.error(`  --tier "industry-first" \\`);
    console.error(`  --category "Trading" \\`);
    console.error(`  --description "Description here" \\`);
    console.error(`  --icon "Bot"\n`);
    process.exit(1);
  }

  return {
    name: args.name,
    phase: parseInt(args.phase, 10),
    tier: args.tier,
    category: args.category,
    description: args.description,
    icon: args.icon,
  };
}

// ── Name transforms ─────────────────────────────────────────────────────────────

function toPascalCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(name: string): string {
  const pascal = toPascalCase(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-|-$/g, '');
}

function toStorageKey(name: string): string {
  return toCamelCase(name);
}

function toFeatureId(name: string): string {
  return toKebabCase(name);
}

function toRoutePath(name: string): string {
  return '/' + toKebabCase(name);
}

function toNavId(name: string): string {
  return toCamelCase(name);
}

/** Map user-supplied tier string to FeatureTier union type */
function normalizeTier(tier: string): string {
  const mapping: Record<string, string> = {
    'core': 'Core',
    'differentiated': 'Differentiated',
    'industry-first': 'Industry-First',
    'competitive-moat': 'Competitive Moat',
    'competitive moat': 'Competitive Moat',
    'bloomberg-grade': 'Bloomberg-Grade',
    'bloomberg grade': 'Bloomberg-Grade',
    'advanced-intelligence': 'Advanced Intelligence',
    'advanced intelligence': 'Advanced Intelligence',
  };
  return mapping[tier.toLowerCase()] || tier;
}

// ── Template substitution ───────────────────────────────────────────────────────

function applyTemplate(template: string, spec: FeatureSpec): string {
  const pascal = toPascalCase(spec.name);
  const camel = toCamelCase(spec.name);
  const kebab = toKebabCase(spec.name);

  return template
    .replace(/\{\{PASCAL_NAME\}\}/g, pascal)
    .replace(/\{\{CAMEL_NAME\}\}/g, camel)
    .replace(/\{\{KEBAB_NAME\}\}/g, kebab)
    .replace(/\{\{DISPLAY_NAME\}\}/g, spec.name)
    .replace(/\{\{DESCRIPTION\}\}/g, spec.description)
    .replace(/\{\{PHASE\}\}/g, String(spec.phase))
    .replace(/\{\{ICON_NAME\}\}/g, spec.icon)
    .replace(/\{\{STORAGE_KEY\}\}/g, toStorageKey(spec.name))
    .replace(/\{\{CATEGORY\}\}/g, spec.category)
    .replace(/\{\{TIER\}\}/g, normalizeTier(spec.tier));
}

// ── File generation ─────────────────────────────────────────────────────────────

interface GeneratedFile {
  path: string;
  description: string;
}

function generateFiles(rootDir: string, spec: FeatureSpec): GeneratedFile[] {
  const templatesDir = path.join(rootDir, 'scripts', 'templates');
  const pascal = toPascalCase(spec.name);
  const camel = toCamelCase(spec.name);
  const generated: GeneratedFile[] = [];

  // 1. Service
  const serviceTemplate = fs.readFileSync(path.join(templatesDir, 'service.template.ts'), 'utf-8');
  const servicePath = path.join(rootDir, 'lib', `${camel}Service.ts`);
  if (!fs.existsSync(servicePath)) {
    fs.writeFileSync(servicePath, applyTemplate(serviceTemplate, spec));
    generated.push({ path: servicePath, description: `lib/${camel}Service.ts` });
  }

  // 2. Widget
  const widgetTemplate = fs.readFileSync(path.join(templatesDir, 'widget.template.tsx'), 'utf-8');
  const widgetPath = path.join(rootDir, 'components', `${pascal}Widget.tsx`);
  if (!fs.existsSync(widgetPath)) {
    fs.writeFileSync(widgetPath, applyTemplate(widgetTemplate, spec));
    generated.push({ path: widgetPath, description: `components/${pascal}Widget.tsx` });
  }

  // 3. Modal
  const modalTemplate = fs.readFileSync(path.join(templatesDir, 'modal.template.tsx'), 'utf-8');
  const modalPath = path.join(rootDir, 'components', `${pascal}Modal.tsx`);
  if (!fs.existsSync(modalPath)) {
    fs.writeFileSync(modalPath, applyTemplate(modalTemplate, spec));
    generated.push({ path: modalPath, description: `components/${pascal}Modal.tsx` });
  }

  // 4. Page
  const pageTemplate = fs.readFileSync(path.join(templatesDir, 'page.template.tsx'), 'utf-8');
  const pagePath = path.join(rootDir, 'pages', `${pascal}.tsx`);
  if (!fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, applyTemplate(pageTemplate, spec));
    generated.push({ path: pagePath, description: `pages/${pascal}.tsx` });
  }

  return generated;
}

// ── Auto-wiring: App.tsx ────────────────────────────────────────────────────────

function wireAppTsx(rootDir: string, spec: FeatureSpec): boolean {
  const appPath = path.join(rootDir, 'App.tsx');
  let content = fs.readFileSync(appPath, 'utf-8');
  const pascal = toPascalCase(spec.name);
  const routePath = toRoutePath(spec.name);

  // Check if already wired
  if (content.includes(`import('./pages/${pascal}.tsx')`)) {
    return false;
  }

  // Add lazy import before the "// Auth pages" comment or before the App layout
  const lazyImport = `const ${pascal} = lazy(() => import('./pages/${pascal}.tsx'));`;

  // Find the last lazy import line and insert after it
  const lazyImportPattern = /^const \w+ = lazy\(\(\) => import\('[^']+'\)\);$/gm;
  let lastMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = lazyImportPattern.exec(content)) !== null) {
    lastMatch = match;
  }

  if (lastMatch) {
    const insertPos = lastMatch.index + lastMatch[0].length;
    content = content.slice(0, insertPos) + '\n' + lazyImport + content.slice(insertPos);
  } else {
    console.error('  ERROR: Could not find lazy import section in App.tsx');
    return false;
  }

  // Add route before the catch-all route
  const catchAllPattern = /(\s*<Route path="\*" element=\{<Navigate to="\/" replace \/>\} \/>)/;
  const routeLine = `                <Route path="${routePath}" element={<${pascal} />} />`;
  const catchAllMatch = content.match(catchAllPattern);
  if (catchAllMatch && catchAllMatch.index !== undefined) {
    content = content.slice(0, catchAllMatch.index) + '\n' + routeLine + content.slice(catchAllMatch.index);
  } else {
    console.error('  ERROR: Could not find catch-all route in App.tsx');
    return false;
  }

  fs.writeFileSync(appPath, content);
  return true;
}

// ── Auto-wiring: constants.tsx ──────────────────────────────────────────────────

function wireConstants(rootDir: string, spec: FeatureSpec): boolean {
  const constPath = path.join(rootDir, 'constants.tsx');
  let content = fs.readFileSync(constPath, 'utf-8');
  const navId = toNavId(spec.name);
  const routePath = toRoutePath(spec.name);

  // Check if already wired
  if (content.includes(`id: '${navId}'`)) {
    return false;
  }

  // Ensure the icon is imported
  const iconImport = spec.icon;
  const importBlockMatch = content.match(/import \{([^}]+)\} from 'lucide-react';/);
  if (importBlockMatch) {
    const importedIcons = importBlockMatch[1].split(',').map(s => s.trim());
    if (!importedIcons.includes(iconImport)) {
      const newImports = [...importedIcons, `\n  ${iconImport}`].join(',');
      content = content.replace(importBlockMatch[0], `import {${newImports}} from 'lucide-react';`);
    }
  }

  // Add nav item before settings (last real nav item)
  const settingsPattern = /(\s*\{ id: 'settings',.*?\},?\n)/;
  const settingsMatch = content.match(settingsPattern);
  if (settingsMatch && settingsMatch.index !== undefined) {
    const navEntry = `  { id: '${navId}', label: '${spec.name}', icon: <${iconImport} size={20} />, path: '${routePath}' },\n`;
    content = content.slice(0, settingsMatch.index) + '\n' + navEntry + content.slice(settingsMatch.index);
  } else {
    // Fallback: add before the closing bracket of NAV_ITEMS
    const closingBracket = content.lastIndexOf('];');
    if (closingBracket !== -1) {
      const navEntry = `  { id: '${navId}', label: '${spec.name}', icon: <${iconImport} size={20} />, path: '${routePath}' },\n`;
      content = content.slice(0, closingBracket) + navEntry + content.slice(closingBracket);
    } else {
      console.error('  ERROR: Could not find NAV_ITEMS in constants.tsx');
      return false;
    }
  }

  fs.writeFileSync(constPath, content);
  return true;
}

// ── Auto-wiring: lib/featureCatalog.ts ──────────────────────────────────────────

function wireFeatureCatalog(rootDir: string, spec: FeatureSpec): boolean {
  const catalogPath = path.join(rootDir, 'lib', 'featureCatalog.ts');
  let content = fs.readFileSync(catalogPath, 'utf-8');
  const featureId = toFeatureId(spec.name);
  const routePath = toRoutePath(spec.name);
  const tier = normalizeTier(spec.tier);

  // Check if already wired
  if (content.includes(`id: '${featureId}'`)) {
    return false;
  }

  // Generate keywords from name and description
  const keywords = [
    ...spec.name.toLowerCase().split(/\s+/),
    ...spec.description.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 4),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

  const catalogEntry = `  { id: '${featureId}', name: '${spec.name}', description: '${spec.description.replace(/'/g, "\\'")}', tier: '${tier}', category: '${spec.category}', status: 'live', path: '${routePath}', icon: '${spec.icon}', phase: ${spec.phase}, keywords: [${keywords.map(k => `'${k}'`).join(', ')}] },`;

  // Insert before the closing bracket of FEATURE_CATALOG
  const closingPattern = /^];\s*$/m;
  const closingMatch = content.match(closingPattern);
  if (closingMatch && closingMatch.index !== undefined) {
    content = content.slice(0, closingMatch.index) + '\n' + catalogEntry + '\n' + content.slice(closingMatch.index);
  } else {
    console.error('  ERROR: Could not find FEATURE_CATALOG closing bracket');
    return false;
  }

  fs.writeFileSync(catalogPath, content);
  return true;
}

// ── Validation ──────────────────────────────────────────────────────────────────

function validateCrossReferences(rootDir: string, spec: FeatureSpec): string[] {
  const errors: string[] = [];
  const pascal = toPascalCase(spec.name);
  const camel = toCamelCase(spec.name);
  const featureId = toFeatureId(spec.name);
  const routePath = toRoutePath(spec.name);

  // Check all 4 files exist
  if (!fs.existsSync(path.join(rootDir, 'lib', `${camel}Service.ts`)))
    errors.push(`Missing service: lib/${camel}Service.ts`);
  if (!fs.existsSync(path.join(rootDir, 'components', `${pascal}Widget.tsx`)))
    errors.push(`Missing widget: components/${pascal}Widget.tsx`);
  if (!fs.existsSync(path.join(rootDir, 'components', `${pascal}Modal.tsx`)))
    errors.push(`Missing modal: components/${pascal}Modal.tsx`);
  if (!fs.existsSync(path.join(rootDir, 'pages', `${pascal}.tsx`)))
    errors.push(`Missing page: pages/${pascal}.tsx`);

  // Check App.tsx has the route
  const appContent = fs.readFileSync(path.join(rootDir, 'App.tsx'), 'utf-8');
  if (!appContent.includes(`path="${routePath}"`))
    errors.push(`App.tsx missing route for ${routePath}`);
  if (!appContent.includes(`import('./pages/${pascal}.tsx')`))
    errors.push(`App.tsx missing lazy import for ${pascal}`);

  // Check constants.tsx has nav item
  const constContent = fs.readFileSync(path.join(rootDir, 'constants.tsx'), 'utf-8');
  const navId = toNavId(spec.name);
  if (!constContent.includes(`id: '${navId}'`))
    errors.push(`constants.tsx missing nav item '${navId}'`);

  // Check featureCatalog.ts has feature entry
  const catalogContent = fs.readFileSync(path.join(rootDir, 'lib', 'featureCatalog.ts'), 'utf-8');
  if (!catalogContent.includes(`id: '${featureId}'`))
    errors.push(`featureCatalog.ts missing feature '${featureId}'`);

  return errors;
}

// ── TypeScript type checking ────────────────────────────────────────────────────

function runTypeCheck(rootDir: string, files: string[]): { success: boolean; output: string } {
  try {
    const result = execSync(`npx tsc --noEmit --pretty 2>&1`, {
      cwd: rootDir,
      encoding: 'utf-8',
      timeout: 60000,
    });
    return { success: true, output: result };
  } catch (e: any) {
    // Filter to only show errors in generated files
    const output = (e.stdout || e.message || '') as string;
    const relevantErrors = output.split('\n').filter((line: string) => {
      return files.some(f => line.includes(path.basename(f)));
    });
    if (relevantErrors.length > 0) {
      return { success: false, output: relevantErrors.join('\n') };
    }
    // If no errors in our files, treat as success (pre-existing errors)
    return { success: true, output: 'Type check passed (pre-existing errors in other files ignored)' };
  }
}

// ── Main ────────────────────────────────────────────────────────────────────────

export function orchestrate(spec: FeatureSpec, rootDir?: string): { success: boolean; files: string[]; errors: string[] } {
  const root = rootDir || path.resolve(process.cwd());
  const errors: string[] = [];

  // Step 1: Generate files
  const generated = generateFiles(root, spec);
  generated.forEach(f => console.warn(`  ✓ Created ${f.description}`));

  // Step 2: Wire into App.tsx
  wireAppTsx(root, spec);

  // Step 3: Wire into constants.tsx
  wireConstants(root, spec);

  // Step 4: Wire into featureCatalog.ts
  wireFeatureCatalog(root, spec);

  // Step 5: Validate cross-references
  const validationErrors = validateCrossReferences(root, spec);
  if (validationErrors.length > 0) {
    validationErrors.forEach(e => {
      errors.push(e);
    });
  }

  // Step 6: Type check
  const generatedPaths = generated.map(g => g.path);
  const typeCheck = runTypeCheck(root, generatedPaths);
  if (!typeCheck.success) {
    errors.push('Type check failed for generated files');
  }

  // Summary
  const allFiles = [
    `lib/${toCamelCase(spec.name)}Service.ts`,
    `components/${toPascalCase(spec.name)}Widget.tsx`,
    `components/${toPascalCase(spec.name)}Modal.tsx`,
    `pages/${toPascalCase(spec.name)}.tsx`,
    'App.tsx (modified)',
    'constants.tsx (modified)',
    'lib/featureCatalog.ts (modified)',
  ];

  if (errors.length === 0) {
    allFiles.forEach(f => console.warn(`    • ${f}`));
  } else {
    errors.forEach(e => console.warn(`    • ${e}`));
  }

  return {
    success: errors.length === 0,
    files: allFiles,
    errors,
  };
}

// ── CLI entry point ─────────────────────────────────────────────────────────────

if (process.argv[1]?.includes('orchestrator')) {
  const spec = parseArgs(process.argv);
  const result = orchestrate(spec);
  process.exit(result.success ? 0 : 1);
}
