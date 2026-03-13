# Joe — MSI Feature Orchestration Agent

*"Let Joe handle it."*

Joe is the MSI platform's automated feature orchestration agent. Joe handles the creation, validation, and management of all platform features — eliminating the manual, error-prone process of creating 4 files and wiring them into 3 config files for every new feature.

## Quick Start

```bash
# Generate a single feature with all files + wiring
npx tsx scripts/orchestrator.ts \
  --name "Market Maker" \
  --phase 114 \
  --tier "industry-first" \
  --category "Trading" \
  --description "AI-powered market making for card liquidity" \
  --icon "Bot"

# Validate all features have correct files and wiring
npx tsx scripts/feature-validator.ts

# Build multiple features from a JSON file
npx tsx scripts/batch-builder.ts --input features.json

# Compare implementation state against PRD
npx tsx scripts/feature-diff.ts
```

## What Gets Generated

For each feature, the orchestrator creates **4 files** and modifies **3 existing files**:

### Created Files

| File | Location | Description |
|------|----------|-------------|
| Service | `lib/{camelName}Service.ts` | Types, mock data, localStorage caching, public API |
| Widget | `components/{PascalName}Widget.tsx` | Dashboard widget with stats bar, click-to-open |
| Modal | `components/{PascalName}Modal.tsx` | Full modal with tabs, search, filters |
| Page | `pages/{PascalName}.tsx` | Route page that hosts the modal |

### Modified Files

| File | Change |
|------|--------|
| `App.tsx` | Adds lazy import + route |
| `constants.tsx` | Adds nav item with icon |
| `lib/featureCatalog.ts` | Adds feature catalog entry |

## npm Scripts

```bash
npm run orchestrate -- --name "..." --phase N --tier "..." --category "..." --description "..." --icon "..."
npm run orchestrate:batch -- --input features.json
npm run validate-features
npm run feature-diff
```

## Orchestrator (`scripts/orchestrator.ts`)

### Arguments

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `--name` | Yes | Display name | `"Market Maker"` |
| `--phase` | Yes | Phase number | `114` |
| `--tier` | Yes | Feature tier | `"industry-first"` |
| `--category` | Yes | Feature category | `"Trading"` |
| `--description` | Yes | Short description | `"AI-powered market making"` |
| `--icon` | Yes | Lucide icon name | `"Bot"` |

### Supported Tiers

- `core`
- `competitive-moat` or `competitive moat`
- `bloomberg-grade` or `bloomberg grade`
- `advanced-intelligence` or `advanced intelligence`
- `differentiated`
- `industry-first`

### Name Conventions

The orchestrator auto-derives all naming variants from `--name`:

| Input | PascalCase | camelCase | kebab-case | Route |
|-------|-----------|-----------|------------|-------|
| `"Market Maker"` | `MarketMaker` | `marketMaker` | `market-maker` | `/market-maker` |
| `"AI Vision Lab"` | `AiVisionLab` | `aiVisionLab` | `ai-vision-lab` | `/ai-vision-lab` |

### Idempotent Operation

The orchestrator skips files/wiring that already exist:

```
  ⊘ Service already exists: lib/marketMakerService.ts (skipping)
  ✓ Created components/MarketMakerWidget.tsx
  ✓ Created components/MarketMakerModal.tsx
  ✓ Created pages/MarketMaker.tsx
```

### Validation Steps

After generation, the orchestrator:
1. Verifies all 4 files exist
2. Checks App.tsx has the lazy import and route
3. Checks constants.tsx has the nav item
4. Checks featureCatalog.ts has the feature entry
5. Runs TypeScript type checking on generated files

## Template Customization (`scripts/templates/`)

### Template Placeholders

Templates use `{{PLACEHOLDER}}` markers that get replaced during generation:

| Placeholder | Example Value |
|-------------|---------------|
| `{{PASCAL_NAME}}` | `MarketMaker` |
| `{{CAMEL_NAME}}` | `marketMaker` |
| `{{KEBAB_NAME}}` | `market-maker` |
| `{{DISPLAY_NAME}}` | `Market Maker` |
| `{{DESCRIPTION}}` | `AI-powered market making...` |
| `{{PHASE}}` | `114` |
| `{{ICON_NAME}}` | `Bot` |
| `{{STORAGE_KEY}}` | `marketMaker` |
| `{{CATEGORY}}` | `Trading` |
| `{{TIER}}` | `Industry-First` |

### Customizing Templates

Edit files in `scripts/templates/`:

- `service.template.ts` -- Service layer with types and mock data
- `widget.template.tsx` -- Dashboard widget component
- `modal.template.tsx` -- Detail modal with tabs
- `page.template.tsx` -- Route page component

After generating, customize the output files directly. The templates provide a working scaffold that matches codebase patterns.

## Batch Builder (`scripts/batch-builder.ts`)

### Usage

```bash
npx tsx scripts/batch-builder.ts --input features.json [--stop-on-error] [--dry-run]
```

### Options

| Flag | Description |
|------|-------------|
| `--input`, `-i` | Path to JSON file with feature specs |
| `--stop-on-error` | Stop on first failure |
| `--dry-run` | Show build plan without creating files |

### Input Format

```json
[
  {
    "name": "Market Maker",
    "phase": 114,
    "tier": "industry-first",
    "category": "Trading",
    "description": "AI-powered market making for card liquidity",
    "icon": "Bot"
  },
  {
    "name": "Smart Contract Escrow",
    "phase": 115,
    "tier": "industry-first",
    "category": "Trading",
    "description": "Blockchain-based escrow for trades",
    "icon": "Shield",
    "dependsOn": "Market Maker"
  }
]
```

### Dependencies

Use `"dependsOn": "Feature Name"` to declare build order dependencies. The batch builder resolves the dependency graph and builds in the correct order. Circular dependencies are detected and reported.

## Feature Validator (`scripts/feature-validator.ts`)

Scans all features in `featureCatalog.ts` and verifies:

- Service file exists in `lib/`
- Widget component exists in `components/`
- Modal component exists in `components/`
- Page component exists in `pages/`
- Route exists in `App.tsx`
- Nav item exists in `constants.tsx`
- No orphaned page files without catalog entries

### CI Integration

```yaml
# GitHub Actions example
- name: Validate feature integrity
  run: npx tsx scripts/feature-validator.ts
```

Exit code 1 if any errors are found (missing routes are errors; missing files are warnings).

## Feature Diff (`scripts/feature-diff.ts`)

Compares the current implementation state against the PRD roadmap.

```bash
npx tsx scripts/feature-diff.ts              # Uses ./PRD.md
npx tsx scripts/feature-diff.ts --prd ./docs/PRD.md  # Custom PRD path
```

### Output

- Features in PRD but not implemented
- Features implemented but not in PRD
- Phase coverage gaps
- Coverage percentage

## Common Workflows

### Adding a new phase

```bash
# 1. Generate the feature
npm run orchestrate -- \
  --name "Portfolio Optimizer" \
  --phase 104 \
  --tier "advanced-intelligence" \
  --category "Analytics" \
  --description "ML-powered portfolio optimization engine" \
  --icon "Brain"

# 2. Customize the generated service with real types and data
# 3. Customize widget/modal with feature-specific UI
# 4. Validate
npm run validate-features
```

### Planning a new batch of features

```bash
# 1. Create a JSON spec file
cat > phase-110-115.json << 'EOF'
[
  {"name": "Market Maker", "phase": 110, "tier": "industry-first", "category": "Trading", "description": "AI market making", "icon": "Bot"},
  {"name": "Liquidity Router", "phase": 111, "tier": "industry-first", "category": "Trading", "description": "Smart order routing", "icon": "GitBranch"},
  {"name": "Risk Dashboard", "phase": 112, "tier": "bloomberg-grade", "category": "Analytics", "description": "Real-time risk monitoring", "icon": "AlertTriangle"}
]
EOF

# 2. Preview the build plan
npm run orchestrate:batch -- --input phase-110-115.json --dry-run

# 3. Build all features
npm run orchestrate:batch -- --input phase-110-115.json

# 4. Validate everything
npm run validate-features
```

### Checking roadmap progress

```bash
npm run feature-diff
```
