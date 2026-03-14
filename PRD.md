# Product Requirements Document (PRD): Modern Sports Intelligence

## 1. Document Control
- Product: Modern Sports Intelligence (MSI)
- PRD Version: 2.0
- Last Updated: March 7, 2026
- Status: Active

## 2. Executive Summary
Modern Sports Intelligence is an AI-assisted portfolio intelligence platform for sports-card investors. MSI combines collection management, valuation engines, social signal layers, and autonomous recommendations to help users discover, acquire, manage, and exit assets with institutional-style controls.

MSI currently operates as a production-oriented application with working authentication, cloud/local sync, AI valuation fallback systems, and advanced analytics modules. The current strategic focus is reliability, governance, and safe automation.

## 3. Vision, Mission, and Product Outcomes
### 3.1 Vision
Become the system of record for sports-card asset intelligence, bridging collector workflows with institutional risk and execution discipline.

### 3.2 Mission
Provide users with accurate market context, explainable decisions, and controlled automation across the asset lifecycle.

### 3.3 Product Outcomes
- Higher valuation confidence and provenance transparency.
- Faster decision-to-action cycles for buys, sells, and rebalancing.
- Reduced operational risk via policy controls, auditability, and recovery playbooks.

## 4. Target Users
- Professional/HNW collectors managing diversified portfolios.
- Data-driven prospectors seeking lagging-alpha opportunities.
- Competitive hobby analysts using social + market intelligence.
- Collaborative groups (Guilds) performing pooled acquisitions.

## 5. Scope
### 5.1 In Scope
- Portfolio ingestion, valuation, watchlist, and alert workflows.
- AI-assisted pricing, negotiation, and multi-agent strategic analysis.
- Social profile sharing, leaderboard, and guild intelligence modules.
- Fiscal analysis (tax estimates, exit simulations).
- Autonomous action recommendation logging and risk-collar controls.

### 5.2 Out of Scope (Current)
- Broker-dealer execution and regulated order routing.
- Guaranteed external market data coverage across all asset classes.
- On-chain custody or tokenized settlement.

## 6. Functional Requirements
### 6.1 Portfolio System
- Users can create, update, and delete card assets and watchlist targets.
- System supports active/sold states, cost basis, valuation history, and notes.
- System supports local mode with cloud sync when authenticated.

### 6.2 Valuation Engine
- Primary valuation source order: eBay/API sources when available, AI fallback otherwise.
- Every valuation record must store timestamp and source metadata.
- UI must expose stale/low-confidence signals when source quality degrades.

### 6.3 Intelligence Layers
- Macro, scarcity, liquidity, and correlation modules surface portfolio-level insights.
- Multi-agent committee can produce thesis outputs and action candidates.
- Arbitrage and cross-asset views are advisory unless explicitly approved.

### 6.4 Social and Guilds
- Users can toggle profile visibility (`is_public`).
- Public profile and leaderboard queries must respect RLS policy constraints.
- Guild proposals support shared thesis visibility and staged collaboration.

### 6.5 Automation and Safety
- Auto-Pilot actions require configured risk collars.
- High-risk actions must be policy-gated before execution.
- All autonomous actions must be auditable.

## 7. Non-Functional Requirements
### 7.1 Reliability
- Core portfolio and valuation flows target 99.9% uptime.
- Sync drift incidents target <1% monthly user impact.

### 7.2 Performance
- Dashboard interaction target: P95 <150ms on high-density workloads.
- Bulk operations should remain responsive for 10k+ asset users.

### 7.3 Security
- RLS enforced on all multi-tenant data tables.
- Secrets loaded only from environment configuration.
- Missing/invalid runtime config must generate explicit warnings.

### 7.4 Observability
- Critical state changes require structured audit events.
- Incidents require runbooks and postmortem-ready logs.

## 8. Technical Architecture
### 8.1 Stack
- Frontend: React 19 + TypeScript + Vite
- Data/Auth: Supabase
- AI: Google GenAI (Gemini)
- Visualization/UI: Recharts + Lucide + custom CSS system
- Testing: Vitest + Playwright

### 8.2 Core Services
- `useSupabaseInventory`: inventory/watchlist orchestration
- `gemini.ts` + related agents: AI workflows
- `auditLog.ts`: local + cloud audit persistence
- `runtimeConfig.ts`: startup environment validation

### 8.3 Data Governance Controls
- `audit_events` table with RLS policies
- Public profile access governed by explicit public-read policy
- Incident playbooks for auth lockout, sync drift, pricing failure

## 9. Data Model (Key Domains)
- Portfolio: cards, targets, price history
- Identity/Social: profiles, public visibility, leaderboard projections
- Governance: audit events, migration metadata, sync status
- Intelligence: theses, swarm insights, arbitrage nodes, macro signals

## 10. Phase Status
### 10.1 Delivered Foundation (Phases 1-30)
- Portfolio lifecycle, auth, migration, valuation pipelines, social/guild modules, macro/fiscal/autonomy prototypes.

### 10.2 Current Work (Phase 31)
- Trust, security, and governance hardening.
- Implemented: runtime config checks, audit logging foundation, incident playbooks, audit schema/policies.
- Remaining: audit timeline UI, CI RLS policy tests, operational key-rotation drill.

### 10.3 Next (Phase 32)
- Pricing truth layer completion.
- In progress: provenance fields (`valuationSource`, `valuationTimestamp`).
- Remaining: stale/quality badges, confidence-based UX gating, source-priority regression tests.

### 10.4 Planned (Phases 33-36)
- Phase 33: Autonomous execution safety gates + idempotent action contracts.
- Phase 34: Guild governance + pooled contribution ledger.
- Phase 35: Reliability scaling + queue/telemetry/cost controls.
- Phase 36: API productization + scoped tokens + webhooks + enterprise controls.

## 11. Success Metrics
- Security: 0 critical RLS/Auth findings in scheduled audits.
- Integrity: <1% sync drift incidents monthly.
- Pricing: >=95% valuations sourced from verifiable market data within SLA.
- Safety: 100% high-risk autonomous actions policy-gated.
- Reliability: 99.9% uptime for core workflows.
- Performance: P95 interaction <150ms at target scale.

## 12. Release and Validation Strategy
### 12.1 Quality Gates
- Build must pass.
- Unit tests must pass.
- Critical path smoke tests for auth, sync, valuation, and portfolio mutations.

### 12.2 Rollout Strategy
- Stage schema/policy updates first.
- Validate public/private data boundaries in staging.
- Promote to production with rollback-ready policy snapshot.

## 13. Risks and Mitigations
- External API instability: maintain source fallback and stale-state labeling.
- Multi-tenant leakage risk: enforce RLS tests per release.
- Automation overreach: strict risk collars + approval checkpoints.
- Operational regressions: codified incident playbooks + audit replay.

## 14. Open Decisions
- Final confidence scoring algorithm for valuation quality tiers.
- Approval UX for high-risk autonomous actions.
- Guild governance model defaults (quorum, veto, treasury controls).
- API monetization model and tiered rate limits for Phase 36.
