# Roadmap Review & Feature Enhancement Recommendations

**Date:** 2026-03-08
**Last updated:** 2026-09-06
**Scope:** Review of the 24-phase roadmap (PRD.md) and strategic next-steps (next-steps-recommendation.md)

## Status addendum (2026-09-06)

Engineering-friendly NEXT_STEPS that are now **Shipped** in product (demo/DAL-safe; no secret or `VITE_FF_REAL_*` flips):

| Item                                             | Status                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| #1 Barcode / cert scan (card-show floor loop)    | **Shipped** (#119) — CameraFeed + cert/UPC resolver prefills Add Asset. Live PSA stays gated.          |
| #3 Swipe triage (keep / sell / consign / review) | **Shipped** — Collection mobile 4-way swipe + haptics + local review queue.                            |
| #5 Bundle / lot negotiation                      | **Shipped** (#119) — Arena lot/package pricing on existing negotiation surfaces.                       |
| #6 Negotiation analytics                         | **Shipped** (#117) — win rate, discount, time-to-close, walk-away from local Arena history.            |
| #12 Agent transparency / why-panels              | **Shipped** (#118) — expandable reasoning on multi-agent recommendations.                              |
| #18 Hobby Health Index                           | **Shipped (seeded)** — disclosed synthetic composite on Macro-Sentinel. Not a live feed.               |
| #19 Insurance-grade report                       | **Shipped** — timestamped FMV packet, totals, methodology, printable/PDF from Report Modal.            |
| #24 Collection embed / vanity widget             | **Shipped** — iframe snippet + preview on Share Alpha / Public Portfolio. Custom domain still open.    |
| Migration conflict / duplicate policy UX         | **Shipped** — merge vs skip preview on Migration Banner + Profile when local and cloud both have data. |

Still **owner-held / open:** tax-lot regulatory completeness (#16), P2P marketplace (#7), centering CV (#17), live marketplace / Stripe / Supabase restore, Gemini-deepened live counters.

---

## 1. Current State Assessment

### Strengths

- **Deep vertical integration** — The platform covers the full collector lifecycle: discovery, acquisition (negotiation), portfolio management, valuation, and exit strategy.
- **AI-first architecture** — Gemini integration for valuation, negotiation, semantic search, and correlation analysis provides genuine differentiation.
- **Financial rigor** — Realized P/L, NAV by league, cost-basis tracking, and grading ROI put this ahead of typical hobby tools.
- **Solid tech stack** — React 19, Vite 6, TypeScript, Supabase with RLS, Stripe billing, and Playwright/Vitest testing provide a modern, maintainable foundation.

### Gaps & Risks Identified

| Area                     | Gap                                                                              | Risk Level |
| ------------------------ | -------------------------------------------------------------------------------- | ---------- |
| **Data freshness**       | Prices still rely heavily on AI estimation rather than live market feeds         | High       |
| **Offline reliability**  | PWA/Service Worker work is in-progress but not battle-tested                     | Medium     |
| **Test coverage**        | Limited unit and E2E tests for financial calculation paths                       | High       |
| **Multi-sport breadth**  | Feature depth is MLB-centric; NBA, NFL, Soccer, Hockey have thinner integrations | Medium     |
| **Social moat**          | Hype Feed exists but no peer-to-peer marketplace or community trading            | Medium     |
| **Regulatory readiness** | No tax-lot accounting (FIFO/LIFO/Specific ID) for IRS/CRA compliance             | High       |

---

## 2. Enhancement Recommendations by Roadmap Phase

### Phase 15 (In Progress): Mobile Native Experience

**Current plan is sound.** Recommended additions:

1. **Barcode/QR Scanner Integration** — Add camera-based barcode scanning (using the existing `CameraFeed.tsx`) to instantly look up cards by UPC or PSA cert number. This turns the phone into a "scanner gun" at card shows and significantly speeds up inventory ingestion at live events.

2. **Haptic Feedback for Price Alerts** — Use the Vibration API alongside push notifications so price threshold alerts feel urgent on mobile. This is a low-effort, high-perception improvement.

3. **Swipe Gestures for Triage** — Implement swipe-left/right on card items for quick "Add to Watchlist" / "Mark for Sale" actions. Card show use cases demand speed over precision.

---

### Phase 16: Agentic Negotiation

**Recommendations:**

4. **Negotiation Playbook Templates** — Let users define reusable negotiation strategies ("Lowball & Walk", "Fair Market Anchor", "Bundle Discount") that the AI agent follows. Currently the agent has a single behavior pattern; playbooks add personalization without requiring users to manually negotiate every time.

5. **Multi-Item Bundle Negotiation** — Extend the negotiation modal to handle "lot" purchases (e.g., "I'll take all 5 of your Bowman Chrome autos for $X"). Bundle deals are the highest-value transactions at card shows and online.

6. **Negotiation Analytics Dashboard** — Track win rate, average discount achieved, time-to-close, and walk-away frequency across all negotiations. This turns the feature from a tool into an intelligence layer.

---

### Phase 17: Institutional Liquidity Pool

**Recommendations:**

7. **Peer-to-Peer Marketplace (P2P Exchange)** — Before building the "MSI House" instant-buy feature, consider a lighter-weight P2P order book where users can post bids/asks. This generates real pricing data, builds community, and validates demand before MSI takes on inventory risk. The "MSI House" can then operate as a market maker within the P2P exchange.

8. **Consignment Tracking** — Many high-value cards are sold through consignment services (PWCC, Goldin). Add a "Consignment" status to the card lifecycle with fields for consignment partner, listing date, reserve price, and seller fees. This fills a gap no competing tool addresses well.

---

### Phase 18: Predictive Alpha Engine

**Recommendations:**

9. **Injury & Transaction Impact Modeling** — Integrate MLB transaction feeds (DFA, call-ups, IL placements) as real-time signals. A prospect getting called up to the majors is the single largest price catalyst in the hobby. The Predictive Alpha Engine should trigger instant alerts for portfolio-relevant transactions.

10. **Comparable Sales Regression** — Supplement Gemini-based price predictions with a lightweight regression model trained on the user's own historical sold data plus eBay comps. Users trust predictions more when they can see the comparable sales driving the estimate. Display a "Comps Used" section alongside each prediction.

11. **Seasonal Pattern Detection** — Card prices follow seasonal patterns (spring training hype, All-Star break, playoff runs, off-season lulls). Surface "Buy Window" and "Sell Window" signals based on historical seasonality for each player/league.

---

### Phase 19: Multi-Agent Intelligence

**Recommendations:**

12. **Agent Transparency & Audit Trail** — **Shipped (deepened):** expandable “Why this recommendation?” on War Room committee cards, outcome memory, guild proposals, Auto-Pilot actions, and acquisition pricing. Agents may log `reasoningChain` / `conflictNotes`; when a run stored a conclusion only, the panel says so instead of inventing steps. User/admin audit timelines remain on `/audit-trail`.

13. **User-Defined Agent Priorities** — Let users configure agent behavior (e.g., "Risk Agent: be aggressive" vs. "Risk Agent: be conservative"). A slider-based configuration for risk tolerance, time horizon, and league preference allows the multi-agent system to align with individual investment theses.

14. **Agent Conflict Resolution UI** — When the Scout agent recommends "Buy" but the Risk agent recommends "Wait," surface the disagreement explicitly. Present a "Consensus View" alongside individual agent opinions, similar to how sell-side analyst ratings work in equities.

---

### Phases 20-24: Advanced Intelligence Layers

**Recommendations:**

15. **Cross-Asset Correlation (Phase 21) — Add Non-Sports Collectibles** — Extend correlation analysis beyond sports leagues to include adjacent collectible markets (Pokemon, Magic: The Gathering, memorabilia). Many collectors diversify across categories, and cross-category correlation data is nearly impossible to find elsewhere.

16. **Fiscal Intelligence (Phase 22) — Tax-Lot Accounting** — Implement FIFO, LIFO, and Specific Identification methods for cost-basis calculation. This is a regulatory requirement for serious collectors reporting capital gains. Generate IRS Schedule D-compatible reports. This is the single highest-value enhancement for the "sports as an asset class" positioning.

17. **Visual Audit Simulation (Phase 23) — Centering Analysis** — Use computer vision to analyze card centering from user-uploaded photos and predict grade probability distributions (e.g., "80% chance PSA 9, 15% chance PSA 10"). This is the feature collectors most wish existed and would drive significant word-of-mouth.

18. **Macro-Sentinel (Phase 24) — Hobby Market Health Index** — Create a composite index (similar to a VIX for sports cards) that aggregates eBay velocity, average sale prices, new PSA submissions, and social sentiment into a single "Hobby Health" score. This becomes a signature feature for the platform's brand.

---

## 3. Net-New Feature Recommendations (Not in Current Roadmap)

These features are not covered by any existing phase but would meaningfully accelerate platform adoption and retention:

### 19. Collection Insurance Valuation Report

**Priority: High** | **Effort: Medium**

Generate insurance-ready valuation documents with timestamped FMV for each card, total collection value, and photo documentation. Insurance companies require this, and no hobby tool produces it automatically. Leverage the existing `pdfExport.ts` and `reportGenerator.ts` infrastructure.

### 20. Break-Even Calculator

**Priority: High** | **Effort: Low**

For each card, calculate and display the break-even sale price accounting for: purchase price + grading fees + shipping + platform seller fees (eBay 13%, COMC, MySlabs). This is a single formula but collectors constantly miscalculate it. Show it prominently on the card detail view.

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
