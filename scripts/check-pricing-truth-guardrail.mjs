import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const provenancePath = path.join(repoRoot, 'lib', 'utils', 'valuationProvenance.ts');
const e2eSpecPath = path.join(repoRoot, 'tests', 'e2e', 'pricing-truth-coverage.spec.ts');

const provenanceSource = fs.readFileSync(provenancePath, 'utf8');
const targetMatch = provenanceSource.match(/FRESH_VERIFIABLE_COVERAGE_TARGET_PCT\s*=\s*(\d+)/);

if (!targetMatch) {
  console.error('Pricing truth guardrail failed: coverage target constant not found.');
  process.exit(1);
}

const targetPct = Number.parseInt(targetMatch[1], 10);
if (Number.isNaN(targetPct) || targetPct < 95) {
  console.error(
    `Pricing truth guardrail failed: target must be >= 95, found ${targetMatch[1]}.`,
  );
  process.exit(1);
}

if (!fs.existsSync(e2eSpecPath)) {
  console.error('Pricing truth guardrail failed: required E2E coverage spec is missing.');
  process.exit(1);
}

console.log(`Pricing truth guardrail passed (target=${targetPct}%, e2e spec present).`);
