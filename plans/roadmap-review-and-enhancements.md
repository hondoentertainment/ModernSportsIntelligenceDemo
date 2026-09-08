# Roadmap Review & Feature Enhancement Recommendations

**Date:** 2026-03-08
**Last updated:** 2026-09-08 (Wave-3 on top of Wave-2 #131/#132)
**Scope:** Review of the 24-phase roadmap (PRD.md) and strategic next-steps (next-steps-recommendation.md)

## Status addendum (2026-09-06)

Engineering-friendly NEXT_STEPS that are now **Shipped** in product (demo/DAL-safe; no secret or `VITE_FF_REAL_*` flips):

| Item                                             | Status                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| #1 Barcode / cert scan (card-show floor loop)    | **Shipped** (#119) — CameraFeed + cert/UPC resolver prefills Add Asset. Live PSA stays gated.             |
| #3 Swipe triage (keep / sell / consign / review) | **Shipped** — Collection mobile 4-way swipe + haptics + local review queue.                               |
| #5 Bundle / lot negotiation                      | **Shipped** (#119) — Arena lot/package pricing on existing negotiation surfaces.                          |
| #6 Negotiation analytics                         | **Shipped** (#117) — win rate, discount, time-to-close, walk-away from local Arena history.               |
| #12 Agent transparency / why-panels              | **Shipped** (#118) — expandable reasoning on multi-agent recommendations.                                 |
| #18 Hobby Health Index                           | **Shipped (seeded)** — disclosed synthetic composite on Macro-Sentinel. Not a live feed.                  |
| #19 Insurance-grade report                       | **Shipped** — timestamped FMV packet, totals, methodology, printable/PDF from Report Modal.               |
| #24 Collection embed / vanity widget             | **Shipped** — iframe snippet + preview on Share Alpha / Public Portfolio. Custom domain still open.       |
| Migration conflict / duplicate policy UX         | **Shipped** — merge vs skip preview on Migration Banner + Profile when local and cloud both have data.    |
| #9 Injury / transaction impact                   | **Shipped (seeded)** — HoldingsCatalystRail + CatalystEngine. Not a live sports wire.                     |
| #11 Seasonal buy/sell windows                    | **Shipped (seeded)** — Dashboard/Collection rails + per-card chips.                                       |
| Priority 3.1 Pop / scarcity weighting            | **Shipped (lite)** — simulated popReport + Alpha Score low-pop premium.                                   |
| Priority 4.2 Trade proposal / portfolio delta    | **Shipped (lite)** — advisory Card A for Card B + cash from local inventory.                              |
| Priority 5.1 Morning briefing visual fidelity    | **Shipped (lite)** — DOM league-allocation bars + text/HTML download. No jsPDF on the live briefing path. |
| Phase 33 Auto-Pilot idempotency                  | **Shipped (stub)** — day-bucketed local keys + duplicate-action guards.                                   |
| #7 Thin P2P intent board                         | **Shipped (lite, 2026-09-08)** — local bids/asks on Collection + Liquidity summary. Not an exchange.      |
| Priority 6.1 Scout-to-Acquire E2E                | **Shipped (demo smoke, 2026-09-08)** — Collection → War Room → Acquisition. No live Gemini refresh.       |
| #15 Adjacent hobby correlation                   | **Shipped (lite, 2026-09-08)** — seeded Pokémon / MTG / memorabilia on existing correlation surfaces.     |
| #2 Price-alert haptics                           | **Shipped (2026-09-08)** — Vibration API alongside Notification / watchlist / target-price paths.         |
| #17 Centering / grade-probability heuristic      | **Shipped (lite, 2026-09-08)** — disclosed non-CV stub on Visual Audit + Centering Analyzer.              |
| #2 remainder — quiet hours + channel prefs       | **Shipped (lite, Wave-2)** — `msi_alert_preferences_v1`; gates haptic + Notification API. Not Web Push.   |
| Non-MLB Performance vs Price                     | **Shipped (partial, Wave-2)** — NBA/NFL/NHL desk + Dashboard binding. Seeded/heuristic disclosure.        |
| Local valuation sparklines                       | **Shipped (lite, Wave-2)** — snapshots then sold comps on Collection. No new `price_history` table.       |
| Card-show show bag                               | **Shipped (lite, Wave-2)** — review + consignment + targets + supplies packing list.                      |
| Priority 3.2 Grading ROI lite                    | **Shipped (lite, Wave-2)** — raw vs PSA 9/10 simulated/comp estimate. Live PSA owner-held.                |
| Phase 33 Auto-Pilot NAV + tax preview            | **Shipped (lite, Wave-2)** — advisory before/after NAV and rough ST/LT tax.                               |
| Portfolio concentration / risk rail              | **Shipped (lite, Wave-3)** — player/league NAV shares + advisory rebalance links.                         |
| Fee-aware break-even strip (#20 remainder)       | **Shipped (lite, Wave-3)** — Collection/sell strip with eBay/COMC/MySlabs/custom presets.                 |
| Soccer hub player/team desks                     | **Shipped (parity, Wave-3)** — desks + Performance vs Price bind on `/soccer-hub`.                        |
| Phase 27 capital gains year-vs-next              | **Shipped (lite, Wave-3)** — Fiscal / Tax Report / Collection sell ST/LT compare. Not IRS completeness.   |
| Phase 33 Auto-Pilot decision replay              | **Shipped (lite, Wave-3)** — day-bucketed considered/collar/approval/NAV replay. No live execution.       |
| Priority 2.2 SyncScheduler product defaults      | **Shipped (lite, Wave-3)** — daily signed-in/demo opt-in remembered via MSI store. Not Web Push.          |

Still **owner-held / open:** #77 Supabase restore, eBay/PSA/Stripe, fractional-vault legal, custom vanity DNS, full P2P exchange, production centering CV, IRS tax-lot regulatory completeness. Tailwind 4 and `@eslint/js` 10 deferred. **#130 shipped:** thin P2P intent board, Scout-to-Acquire smoke, `@google/genai` 2.x, adjacent hobby correlation, price-alert haptics, centering heuristic. **Wave-2 shipped on top of #130. Wave-3 shipped on top of Wave-2.**

---

## 1. Current State Assessment

### Strengths

- **Deep vertical integration** — The platform covers the full collector lifecycle: discovery, acquisition (negotiation), portfolio management, valuation, and exit strategy.
- **AI-first architecture** — Gemini integration for valuation, negotiation, semantic search, and correlation analysis provides genuine differentiation.
- **Financial rigor** — Realized P/L, NAV by league, cost-basis tracking, and grading ROI put this ahead of typical hobby tools.
- **Solid tech stack** — React 19, Vite 6, TypeScript, Supabase with RLS, Stripe billing, and Playwright/Vitest testing provide a modern, maintainable foundation.

### Gaps & Risks Identified

| Area                     | Gap                                                                                              | Risk Level |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ---------- |
| **Data freshness**       | Prices still rely heavily on AI estimation rather than live market feeds                         | High       |
| **Offline reliability**  | PWA/Service Worker work is in-progress but not battle-tested                                     | Medium     |
| **Test coverage**        | Limited unit and E2E tests for financial calculation paths                                       | High       |
| **Multi-sport breadth**  | Feature depth is MLB-centric; NBA, NFL, Soccer, Hockey have thinner integrations                 | Medium     |
| **Social moat**          | Hype Feed exists but no peer-to-peer marketplace or community trading                            | Medium     |
| **Regulatory readiness** | FIFO/LIFO/Specific ID **selector** exists (demo); IRS/CRA **regulatory completeness** still open | High       |

---

## 2. Enhancement Recommendations by Roadmap Phase

### Phase 15 (In Progress): Mobile Native Experience

**Current plan is sound.** Recommended additions:

1. **Barcode/QR Scanner Integration** — Add camera-based barcode scanning (using the existing `CameraFeed.tsx`) to instantly look up cards by UPC or PSA cert number. This turns the phone into a "scanner gun" at card shows and significantly speeds up inventory ingestion at live events.

2. **Haptic Feedback for Price Alerts** — **Shipped (2026-09-08) + Wave-2 quiet hours:** Vibration API fires with watchlist / target-price / NotificationService paths (`lib/utils/haptics.ts`) and honors `msi_alert_preferences_v1`. No-ops when the API is missing. Dedicated Web Push remains optional.

3. **Swipe Gestures for Triage** — Implement swipe-left/right on card items for quick "Add to Watchlist" / "Mark for Sale" actions. Card show use cases demand speed over precision.

---

### Phase 16: Agentic Negotiation

**Recommendations:**

4. **Negotiation Playbook Templates** — **Shipped** (playbooks + Arena selector). Gemini counters now receive the selected playbook and a seller-firmness hint; deterministic demo bands apply when AI is unavailable. Not live marketplace trading.

5. **Multi-Item Bundle Negotiation** — Extend the negotiation modal to handle "lot" purchases (e.g., "I'll take all 5 of your Bowman Chrome autos for $X"). Bundle deals are the highest-value transactions at card shows and online.

6. **Negotiation Analytics Dashboard** — Track win rate, average discount achieved, time-to-close, and walk-away frequency across all negotiations. This turns the feature from a tool into an intelligence layer.

---

### Phase 17: Institutional Liquidity Pool

**Recommendations:**

7. **Peer-to-Peer Marketplace (P2P Exchange)** — **Partial (intent board, 2026-09-08):** collectors can post buy/sell intents from local inventory on Collection (Liquidity Pool shows a summary). Bids/asks are advisory intents with MSI store persistence — **not** order matching, escrow, live trading, or MSI-house inventory. A full P2P order book / exchange remains open before MSI takes inventory risk.

8. **Consignment Tracking** — Many high-value cards are sold through consignment services (PWCC, Goldin). Add a "Consignment" status to the card lifecycle with fields for consignment partner, listing date, reserve price, and seller fees. This fills a gap no competing tool addresses well.

---

### Phase 18: Predictive Alpha Engine

**Recommendations:**

9. **Injury & Transaction Impact Modeling** — **Shipped (seeded, 2026-09-07):** holdings-relevant injury/transaction cards on `HoldingsCatalystRail` / `CatalystEngine`. Live MLB transaction feeds remain owner-held.

10. **Comparable Sales Regression** — **Shipped (Comps Used UX):** Collection grid/list lists the sold/historical comps that drive `preferredValuationForCard` / `selectPreferredValuation`. Thin tape and AI-only paths stay labeled. Live eBay tape still owner-held; no `VITE_FF_REAL_*` flip.

11. **Seasonal Pattern Detection** — **Shipped (seeded, 2026-09-07):** Buy/Sell/Hold window hints per player/league (spring training, All-Star, playoffs, off-season) on Dashboard + Collection. Heuristic disclosure — not live sold comps.

---

### Phase 19: Multi-Agent Intelligence

**Recommendations:**

12. **Agent Transparency & Audit Trail** — **Shipped (deepened):** expandable “Why this recommendation?” on War Room committee cards, outcome memory, guild proposals, Auto-Pilot actions, and acquisition pricing. Agents may log `reasoningChain` / `conflictNotes`; when a run stored a conclusion only, the panel says so instead of inventing steps. User/admin audit timelines remain on `/audit-trail`.

13. **User-Defined Agent Priorities** — **Shipped:** risk / time-horizon / league-tilt / max-position sliders persist via MSI store (`msi_agent_user_preferences`) and are injected into War Room committee prompts + Auto-Pilot ranking. Human still approves. Not a live cloned trader.

14. **Agent Conflict Resolution UI** — **Shipped:** Consensus View on War Room / Outcome Memory shows per-agent Buy/Wait/Hold/Sell stance plus a split summary when agents disagree. Missing opinions are disclosed, never invented.

---

### Phases 20-24: Advanced Intelligence Layers

**Recommendations:**

15. **Cross-Asset Correlation (Phase 21) — Add Non-Sports Collectibles** — **Shipped (lite, 2026-09-08):** seeded Pokémon / MTG / memorabilia on the existing Cross-Asset Correlation page, dashboard widget, and correlation modals, with on-screen disclosure. **Not** live auction or TCG feeds. Live series remain open.

16. **Fiscal Intelligence (Phase 22) — Tax-Lot Accounting** — **Partial (demo):** FIFO / LIFO / Specific ID / Average selector persists via MSI store; lot-matching math is unit-tested; Schedule D–style packet already shipped. **Not** IRS Form 8949 / Schedule D regulatory completeness.

17. **Visual Audit Simulation (Phase 23) — Centering Analysis** — **Partial (heuristic, 2026-09-08):** disclosed non-CV geometry/metadata stub on Visual Audit + Centering Analyzer (L/R, T/B, score, probability buckets). Copy states it is **not** a production computer-vision model and **not** a PSA prediction. Full CV / PSA-grade model still open.

18. **Macro-Sentinel (Phase 24) — Hobby Market Health Index** — Create a composite index (similar to a VIX for sports cards) that aggregates eBay velocity, average sale prices, new PSA submissions, and social sentiment into a single "Hobby Health" score. This becomes a signature feature for the platform's brand.

---

## 3. Net-New Feature Recommendations (Not in Current Roadmap)

These features are not covered by any existing phase but would meaningfully accelerate platform adoption and retention:

### 19. Collection Insurance Valuation Report

**Priority: High** | **Effort: Medium**

Generate insurance-ready valuation documents with timestamped FMV for each card, total collection value, and photo documentation. Insurance companies require this, and no hobby tool produces it automatically. Leverage the existing `pdfExport.ts` and `reportGenerator.ts` infrastructure.

### 20. Break-Even Calculator

**Priority: High** | **Effort: Low**

For each card, calculate and display the break-even sale price accounting for: purchase price + grading fees + shipping + platform seller fees (eBay 13%, COMC, MySlabs). **Shipped (lite, Wave-3)** on Collection card detail / sell surfaces via the existing Break-Even calculator helpers, including a custom fee preset. Full marketplace listing quotes remain open.

### 21. "What If" Portfolio Simulator

**Priority: Medium** | **Effort: Medium**

Let users simulate portfolio changes before executing: "What happens to my NAV if I sell Card A and buy Card B?" Show the delta in diversification, risk concentration, and projected returns. This turns the platform from a ledger into a decision-support system.

### 22. Grading Submission Batch Planner

**Priority: Medium** | **Effort: Medium**

Help users plan grading submissions by: (a) identifying raw cards with the highest grading ROI potential, (b) grouping them into cost-efficient submission tiers (PSA economy, regular, express), and (c) calculating expected net value after grading fees. This bridges the existing `GradingCalculatorModal` into a batch workflow.

### 23. eBay Listing Draft Generator

**Priority: Medium** | **Effort: Low**

Auto-generate eBay listing titles and descriptions from card metadata (player, year, set, grade, comp prices). Follow eBay SEO best practices (keyword ordering, character limits). Users can copy to clipboard or (future) publish directly via eBay API. This reduces friction in the "exit" phase of the collector lifecycle.

### 24. Collection Sharing & Embed Widget

**Priority: Medium** | **Effort: Medium**

Extend the existing `PublicPortfolio.tsx` with an embeddable widget (iframe or Web Component) that collectors can place on their personal sites, forums, or social profiles. Add a vanity URL (e.g., `msi.app/u/username`). Community visibility drives organic growth.

### 25. Wax Break ROI Tracker

**Priority: Low** | **Effort: Low**

Track the cost vs. return of wax/hobby box breaks. Input the break cost and log every card pulled; calculate the instant ROI of the break. This is a common use case with no good tooling and would bring in a new user segment (break participants).

---

## 4. Recommended Priority Reordering

Based on the analysis above, the suggested execution order for maximum impact:

| Order | Item                                           | Rationale                                                                                  |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1     | **Phase 15 completion** + Barcode Scanner (#1) | Unlock the card show use case — in-person events are the hobby's center of gravity         |
| 2     | **Break-Even Calculator** (#20)                | Trivial to build, immediately useful, drives daily active usage                            |
| 3     | **Tax-Lot Accounting** (#16)                   | Highest value for "sports as an asset class" positioning; tax season is a forcing function |
| 4     | **Phase 18 + Injury/Transaction Alerts** (#9)  | Predictive signals are the #1 reason users would pay for a Pro subscription                |
| 5     | **Insurance Valuation Report** (#19)           | Monetizable as a premium feature; no competition                                           |
| 6     | **Phase 16 + Bundle Negotiation** (#5)         | AI negotiation is the most shareable/viral feature                                         |
| 7     | **Phase 17 + P2P Exchange** (#7)               | Build marketplace liquidity organically before taking inventory risk                       |
| 8     | **Phase 19 + Agent Transparency** (#12)        | Multi-agent only works if users trust the agents                                           |
| 9     | **Visual Grading Prediction** (#17)            | High word-of-mouth potential; technically ambitious but defensible                         |
| 10    | **Hobby Market Health Index** (#18)            | Brand-defining feature that positions MSI as the Bloomberg of sports cards                 |

---

## 5. Technical Recommendations

### Testing

- **Financial calculation paths must have 100% unit test coverage** before adding more features. NAV, P/L, ROI, and tax-lot calculations are liability-critical.
- Add snapshot tests for PDF report generation to catch formatting regressions.

### Performance

- The existing `@tanstack/react-virtual` integration is good. Ensure all list/grid views use it consistently, especially as card counts grow.
- Consider adding React Suspense boundaries around AI-powered components (Deep Search, Correlation Terminal) that have variable latency.

### Data Architecture

- Add a `price_history` table in Supabase with daily snapshots. Many recommended features (seasonality detection, trend analysis, comp regression) require historical price data that currently isn't persisted.
- Introduce an `events` table for tracking MLB transactions, injuries, and milestones. This feeds the Predictive Alpha Engine and alert system.

### API Strategy

- Prioritize the eBay Browse API integration — it unlocks accurate FMV, comp-based predictions, and listing generation simultaneously.
- Consider the PSA Cert Verification API for instant grade lookups during barcode scanning.

---

## 6. Summary

The existing 24-phase roadmap is ambitious and well-structured. The enhancements above focus on three themes:

1. **Close the data gap** — Move from AI-estimated prices to market-verified data (eBay comps, PSA certs, MLB transactions).
2. **Complete the lifecycle** — Add features for every stage: discovery, acquisition, management, optimization, exit, and tax reporting.
3. **Build trust through transparency** — Agent audit trails, comp-backed predictions, and insurance-grade reports make the platform credible for serious collectors managing real capital.

The platform's positioning as "Bloomberg for sports cards" is achievable. The key constraint is not features — it's data quality and financial accuracy. Prioritize the foundation (verified pricing, tax compliance, test coverage) before scaling to more speculative features.
