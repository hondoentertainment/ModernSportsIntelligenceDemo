# Recommended Next Steps — Modern Sports Intelligence

> Refreshed **2026-10-28**. Production on `main` is healthy. Canonical owner checklist: [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) (body refreshed 2026-09-27). Forward narrative: [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md). Launch ops: [`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md).

## Current state

MSI's **Bloomberg terminal core** is engineering-complete: consensus ledger across Dashboard, War Room, and Audit Dossier; holdings catalysts; Alpha War Room CTA; `/api-licensing` + `/card-show-mode` GA; command palette keeps `/scan` on dashboard. **Eng-safe product waves through [#144](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/144)** (`3ca10f4`, Phase B–D scaffolds, plus the [#145](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/145) follow-up) are on `main`. The Phase B pricing-truth UI scaffold ([#141](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/141), `db907e3`) shipped **without** live flags. Waves 2–5 ([#131](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/131)–[#139](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/139)) shipped earlier. Six of seven catalog betas are `live`; only `fractional-vault` remains `beta` for legal sign-off (2026-09 quarterly sweep — no promotions, no new hides).

**Production (2026-10-28):** healthy on `main` @ [`faaf5a2`](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/commit/faaf5a2). [#195](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/195) (`faaf5a2`) placed each side of a local trade on that card's ladder. [#194](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/194) (`ac88c95`) scored the typed number on the local offer ladder. [#193](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/193) (`529ccc0`) bumped production dependencies. [#192](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/192) (`27c1426`) bumped dev dependencies. [#191](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/191) (`753e13b`) added the offer ladder on the local sale range. [#190](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/190) (`c3d664e`) placed the collector's number on the local sale range. [#189](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/189) bumped production dependencies. [#188](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/188) bumped dev dependencies. [#187](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/187) (`12fefc3`) added the show pull sheet and the username-auth follow-through. [#186](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/186) added username + password auth. [#185](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/185) aligned frontier desk tests with the collection. [#184](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/184) closed the show floor back into the local book. [#182](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/182) connected the local book to the show floor. [#183](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/183) keeps Google sign-in on the login page when the provider is off. [#181](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/181) set the gzip cap at 3,350,000 bytes. [#180](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/180) dropped the Gemini web SDK from the client bundle. Collector desks already on `main`: [#179](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/179) show day, comps snapshot, trade balance, card location, and weekly recap; [#178](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/178) table notes, grading submit, portfolio chart, CSV, and want-list share; [#177](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/177) set completion from the book. The sell planner landed in [#172](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/172) / [#173](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/173). Toolchain on `main`: Node ≥22.22.2, TypeScript 7 (`@typescript/native` ^7.0.2) side-by-side with the TypeScript 6 API for ESLint, jsdom 30, `tailwindcss` ^4.3.3 ([#161](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/161)), `eslint` ^10.13.0 ([#188](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/188)). `@eslint/js` stays on 9.x. Do not add another major migration in an eng-safe PR.

**Hosted data:** Supabase `ModernSportsIntelligence` (`vhbsokjqchaafluimgjh`) is **ACTIVE_HEALTHY**. Migrations `00001`–`00010` are applied. Production `GET /api/health` is `ok: true` with `config.serverApiAuth: true`. Vercel already has the Supabase URL, anon key, service role, and `ALLOWED_ORIGIN` (presence checked 2026-09-27; re-sync only if those keys rotate). Optional `supabase/migrations/00011_price_history_freshness_sla.sql` stays **file-only**. It is an owner-held optional item. **Engineering agents must not apply it.**

**Still do not claim live Market Movers / SCI Pulse parity** before eBay is live. `npm run ops:check-real-data` is a readiness check for the owner after keys exist. Do not flip `VITE_FF_REAL_*` from an engineering PR.

## Local card-show loop — shipped (2026-10-12 → 2026-10-13)

Owner direction (2026-10-12): local card-show discovery and buying-opportunity surfacing are a **headline** of the platform, and eng-safe daily builds continue toward a complete collector loop on demo/stale tape — deeper than Sports Card Investor / Market Movers on the local book. **[#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) stays the only path to live tape.** That override replaces the older “if #77 slips, do not invent a new product wave” line. It does not authorize secrets, `VITE_FF_REAL_*` flips, applying `00011`, new Labs pages, or live-listings copy.

| Slice                                                                                                            | Where                                                                                                                                                                                   | Honest limit                                                            |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Buying desk** ([#168](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/168), `8dc031d`) | `/local-card-shows` + Dashboard rail. Seeded venue calendar ranked into buy / attend / sell-into-room calls from collection gaps, deal-finder lite, portfolio movers, and the show bag. | Not a promoter scrape. Marks stay demo or stale until eBay is on.       |
| **Trip budget**                                                                                                  | Same desk. Admission + distance-band travel stub + buy reserve − sell credit, against cash the collector is bringing.                                                                   | Travel is a stub, not a fare or hotel quote.                            |
| **Floor calls**                                                                                                  | Same desk. Buy / pass / sell at a typed table price versus the local mark.                                                                                                              | Prices are what you type. Not a live marketplace.                       |
| **Recap into the book**                                                                                          | Same desk. Paper ROI on marked buys, realized gain when a sell has a cost basis, then file the buy or record the sale on the existing collection.                                       | Filing writes the typed row. Not a settlement and not IRS completeness. |

The older `/card-show-planner` demo calendar is unchanged and is not a second source of shows. Card Show Mode stays the bag and floor tools and links here for the trip and recap.

## Portfolio book insights — shipped (#170, `1b65481`)

Sports Card Investor / Market Movers still lead on live tape. On the local book, MSI already has movers and a concentration rail. This desk adds cost-basis P/L, duplicate copies, and slab / era / print-run mix in one place. It reads cards already in the collection. Marks stay demo or stale until eBay is on.

| Slice                        | Where                                                                                                                                                                                         | Honest limit                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Book totals**              | Dashboard rail (after the other local rails) and Collection (above those rails). Preferred mark, purchase plus stored grading / shipping / insurance, unrealized P/L, realized on sold cards. | Not the purchase-only header. A card with no cost stays out of the unrealized percentage. |
| **Cost-basis performers**    | Same desk. Holdings above and below all-in cost.                                                                                                                                              | Not the snapshot mover list.                                                              |
| **Duplicate stacks**         | Same desk. Same player, year, manufacturer, set, and card number. Extra copies are the mark beyond the highest copy, with a graded copy kept on a tie.                                        | Grade and condition can still differ inside a stack.                                      |
| **Slab, era, print-run mix** | Same desk. Grading company or raw, year bucket, and a print run parsed from the end of the set name (`/499`).                                                                                 | Not a Beckett checklist and not a live population report.                                 |

Copy does not claim a live Sports Card Investor portfolio.

## Show alerts and shopping list — shipped (#171)

Sports Card Investor and Market Movers still lead on live tape. On the seeded calendar, a collector can arm a home radius and walk into a show with a shopping list built from the watchlist and the local book.

| Slice             | Where                                                                                                                                                                                                                                                                                                                                                                      | Honest limit                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Show alerts**   | `/local-card-shows`. Home city or this browser’s location, a radius, and a lead time. In-app alerts record that many days before a seeded show inside the radius. Browser delivery follows existing quiet hours and browser-notification prefs.                                                                                                                            | Not a promoter feed. Server Web Push still needs owner-held VAPID keys. This change adds none.                          |
| **Shopping list** | Same desk, on each show. Active watchlist targets, collection gaps, and duplicate extras (same player, year, manufacturer, set, and card number). Target buy is the lower of the preferred local mark and the collector target. Extra copies are sell or trade lines. The higher mark stays, and a graded copy wins a tie. A same-player buy turns the extra into a trade. | Not a dealer inventory. Marks stay demo or stale until eBay is on. Grade and condition can still differ inside a stack. |

Copy does not claim a live Market Movers or Sports Card Investor show calendar.

## Watchlist and show alert digest — shipped (#175)

`/alerts` joins two local signals into one in-app list: watchlist marks at least 5% under the collector target, and seeded shows inside the home radius already saved for show alerts.

| Slice              | Where                                                                      | Honest limit                                                        |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Price drops**    | `/alerts`. Active watchlist rows.                                          | Local or demo tape. Not a live print.                               |
| **Show proximity** | Same digest. Home, radius, and lead time from show alerts on this browser. | Seeded calendar. Server Web Push still needs owner-held VAPID keys. |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Shopping-list buys into the book — shipped (#176)

A shopping-list buy can be filed from the list or from the post-show recap. The price typed at the show is purchase price and tax basis. The local mark, when one exists, is stored as the current value.

| Slice                        | Where                                                                    | Honest limit                                                |
| ---------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **File a shopping-list buy** | `/local-card-shows`, on each show's shopping list and on the trip recap. | Writes the typed row into the collection. Not a settlement. |
| **Cost basis**               | Same draft. `purchasePrice` and `taxBasis` are the paid price.           | A card with no typed price stays off the book.              |

Copy does not claim a live Market Movers or Sports Card Investor fill.

## Set completion from the book — shipped (#177)

Collection and `/set-completion` score demo checklists the book has already started. A pinned goal remembers the target on this browser.

| Slice                | Where                                                                               | Honest limit                                                          |
| -------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Started-set gaps** | Collection and `/set-completion`. Owned card numbers versus a short demo checklist. | Not a Beckett registry. Sets with no matching card stay off the desk. |
| **Completion goal**  | Same desk. Track to 100% and the percent still left.                                | A local pin. Not a live buy list.                                     |

Copy does not claim a live Market Movers or Sports Card Investor checklist.

## Show table notes — shipped (#178)

A seeded show trip can keep the dealer, table, ask, offer, and a short note. The log stays on this browser with that show.

| Slice             | Where                                                          | Honest limit                                |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------- |
| **Table notes**   | `/local-card-shows`, on the trip’s Table notes tab.            | Typed by the collector. Not a dealer quote. |
| **Haggle result** | Same tab. Open, bought, or passed, with the ask and the offer. | Not a settlement and not a live tape.       |

Copy does not claim a live Market Movers or Sports Card Investor show floor.

## Grading submit decision — shipped (#178)

Collection names a demo PSA or BGS lane for the raw cards with the highest local mark, or tells you to hold.

| Slice                 | Where                                                                    | Honest limit                                                       |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **PSA and BGS lanes** | Collection. Economy, regular, and BGS standard.                          | Disclosed demo fees, days, and population. Not a submission quote. |
| **Submit or hold**    | Same desk. Highest demo net, faster turnaround on a tie, hold under $15. | Live PSA stays owner-held.                                         |

Copy does not claim a live PSA or BGS price.

## Portfolio performance — shipped (#178)

Collection draws a six-month demo path from cost to the local mark for cards still held.

| Slice         | Where                   | Honest limit                                              |
| ------------- | ----------------------- | --------------------------------------------------------- |
| **Demo path** | Collection. Lazy chart. | Not a live price history and not a `price_history` table. |

Copy does not claim a live Market Movers or Sports Card Investor portfolio chart.

## Collection CSV — shipped (#178)

Export the book and import that file back. Matching ids update. New rows append. Cards missing from the file stay.

| Slice          | Where       | Honest limit                                   |
| -------------- | ----------- | ---------------------------------------------- |
| **Round-trip** | Collection. | This browser’s book. Not a marketplace import. |

Copy does not claim a live Market Movers or Sports Card Investor import.

## Want-list share — shipped (#178)

`/alerts` builds a read-only link from active targets. The list is in the URL. Opening it does not write the book.

| Slice              | Where                    | Honest limit                                |
| ------------------ | ------------------------ | ------------------------------------------- |
| **Share link**     | `/alerts`.               | Local demo. No server copy.                 |
| **Read-only view** | Same page with `?want=`. | Not a live list and not an editable target. |

Copy does not claim a live Market Movers or Sports Card Investor want list.

## Show day, comps snapshot, trade balance, location, weekly recap — shipped (#179)

Demo book only. The five #178 review notes are fixed here too: CSV import stays available on an empty demo book and applies every row inside the file-size limit, cloud accounts do not get a local-only import, the want-list link follows hydrated targets, and a stored mark of $0 is not replaced by cost.

| Slice              | Where                                                              | Honest limit                                                                                              |
| ------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Show day**       | `/local-card-shows`, under each shopping list.                     | Offline checklist on this browser. Budget left uses saved trip cash, or the trip need when cash is blank. |
| **Comps snapshot** | Collection. Last sales sparkline and median for the card you pick. | Sold comps when the card has them. Otherwise a stable demo sketch around the local mark.                  |
| **Trade balancer** | Collection. Give, receive, and cash against local marks.           | Fair within 5%. Not a marketplace fill.                                                                   |
| **Card location**  | Collection. Binder, box, or slab case, with a filter.              | This browser. Not a warehouse system.                                                                     |
| **Weekly recap**   | Collection. Value change, buys, sells, and top movers.             | Demo path from cost to the local mark. Not a live week.                                                   |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Floor pack — shipped (#182)

The show list, the set desk, the sell planner, and the weekly recap now share one local book. Sports Card Investor and Market Movers still lead on live tape. They do not pack a show from the cards you already hold.

| Slice                              | Where                                                                                                                                                                                                                  | Honest limit                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Set holes on the shopping list** | `/local-card-shows`, on each show. Missing numbers from a demo checklist the book has started, when the show covers that sport. A watched hole is not listed twice. Filing the buy uses the typed price as cost basis. | Not a Beckett registry. The estimate is not a market mark.                      |
| **Watch a hole**                   | Collection and `/set-completion`. One button adds that missing number to the active watchlist.                                                                                                                         | Local or cloud target the existing watchlist already saves. Not a live listing. |
| **Pull from a saved place**        | Shopping-list sell lines and the sell planner. Binder, box, or slab case when one is saved.                                                                                                                            | This browser. Not a warehouse system.                                           |
| **Ask versus median**              | `/local-card-shows`, table notes. Pick a held card and the typed ask is under, at, or over that card's median. Within 5% counts as at.                                                                                 | Sold comps when the card has them. Otherwise a demo sketch. Not a dealer quote. |
| **Floor notes on the week**        | Collection weekly recap. Bought, passed, and open notes dated in the last 7 days, plus typed spend on bought notes.                                                                                                    | Notes with no date stay off the count. Not a settlement.                        |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Frontier desk tests — shipped (#185)

[#185](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/185) (`213b827`) aligned frontier desk tests with collection-driven output. Those desks read the collection. They do not render sample rows. This is not a tape change. No `VITE_FF_REAL_*` flip.

## Google sign-in — shipped (#183)

The login page stays put when Google auth is off. GoTrue answers a disabled provider with a JSON 400, and the client was navigating there. The page probes the authorize URL and shows that failure on the form. This is not a tape change. No `VITE_FF_REAL_*` flip.

## Username + password — shipped (#186)

[#186](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/186) (`569dd05`) is on `main`. Sign-up collects a username (3-20 letters, numbers, or underscores), email, and a password that needs 8+ characters with uppercase, lowercase, and a number. Sign-in accepts a username or an email. A username is resolved to an email on the server (`POST /api/auth/password-sign-in`) with the service role calling `resolve_username_email`. The browser never receives that email, and a miss looks the same as a wrong password. Google sign-in on the login page is unchanged.

Until the owner applies the migration, a username sign-in says to use email instead. Email sign-in, Google, and password reset by email keep working.

| Slice                           | Where                                          | Honest limit                                                                                                         |
| ------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Username sign-up**            | `/signup`                                      | Case-insensitive uniqueness starts when `00013` is applied. Before that, the handle is stored on the auth user only. |
| **Username or email sign-in**   | `/login`                                       | Username lookup needs `00013` and `SUPABASE_SERVICE_ROLE_KEY` on Vercel.                                             |
| **Forgot / reset password**     | `/forgot-password` → email → `/reset-password` | The reset link uses the site origin. Supabase has to allow that origin.                                              |
| **Change username or password** | `/settings`                                    | Password change checks the current password. Username change writes the signed-in user's own `profiles` row.         |

Copy does not claim a live Market Movers or Sports Card Investor tape. No `VITE_FF_REAL_*` flip. The migration is not applied from that PR. The 2026-10-19 audit below is the follow-through on these same pages: the password hint, loading and error states, a stale reset link, a dead session, and the sign-in throttle. It does not apply `00013`.

**Owner steps (do not run from an engineering agent):**

1. On Supabase `vhbsokjqchaafluimgjh`, run the preflight query in `supabase/migrations/00013_profiles_username_login.sql`. If it returns rows, rename the duplicate handles, then apply that file in the SQL editor. Do not apply `00011` in the same pass unless you mean to. After it is applied, run `npm run types:supabase` and commit `types/supabase.gen.ts` so the drift check matches the live schema. The generated file is unchanged in this PR because the functions are not on the live database yet.
2. Authentication → Providers: keep Email enabled. Set the minimum password length to 8 so it matches the form. Confirm email is optional; if it stays on, new accounts must open the confirmation link before sign-in.
3. Authentication → URL configuration: Site URL is the production origin (no hash). Add redirect URLs for production and preview origins. Reset emails use that origin; the app then opens `/#/reset-password`.
4. Authentication → SMTP: the built-in mailer is rate limited. Add custom SMTP before relying on reset or confirmation volume.
5. Vercel already has the service role (presence checked earlier). Username sign-in uses it only on the server. Do not add a `VITE_` copy.

## Show close — shipped (#184)

[#184](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/184) (`a133799`) is on `main`. The table, the shopping list, the weekly recap, and `/alerts` now share one local book. Sports Card Investor and Market Movers still lead on live tape. They do not file a show-floor buy or tell you which ask in the room was cheaper.

| Slice                           | Where                                                                                                                                                                                                                                                               | Honest limit                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Name the card**               | `/local-card-shows`, table notes. Player, card line, and sport, including a card that is not in the book.                                                                                                                                                           | Typed by the collector. Not a dealer inventory.                                           |
| **Cheapest ask**                | Same tab. Two or more notes with the same player. The lowest typed ask, and the high ask when they differ.                                                                                                                                                          | Not a dealer quote. A single note stays off this line.                                    |
| **File a bought note**          | Same tab, into the collection. The offer is the cost basis when it is above zero. Otherwise the ask.                                                                                                                                                                | Writes the typed row. Not a settlement. A note with no player stays off the book.         |
| **Open notes and cheap passes** | `/alerts`, and the dashboard show rail when a note is still open. A pass is listed when the ask is under the held-card median or the shopping-list mark. One button adds it to the watchlist, and the row stays marked on the watchlist after that target is saved. | Local or demo reference. Not Web Push. Server delivery still needs owner-held VAPID keys. |
| **Cash fit**                    | `/local-card-shows`, on each shopping list. Cheapest buys first, against saved trip cash, or the trip need when cash is blank.                                                                                                                                      | Not a fare or a hotel quote. A line with no price does not take cash.                     |
| **Unfiled buys**                | Collection weekly recap. Bought notes with a player that are not in the book yet.                                                                                                                                                                                   | This browser. Not a settlement.                                                           |

The digest also refreshes when watchlist targets hydrate, the same way the want-list link already does. Copy does not claim a live Market Movers or Sports Card Investor tape.

## Grade split and table lots — this change

The sale range already said where a number sits, and a table note already named one card. This splits the stored sales by the grade named on the title or condition, and lets one note hold a lot. Sports Card Investor and Market Movers still lead on live tape. They do not separate raw from PSA 10 on the same local desk, and they do not keep a multi-card lot on one note.

| Slice               | Where                                                                                                                                                                            | Honest limit                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Grade bands**     | Collection comps snapshot, `/alerts`, shopping-list lines, table notes, and the sell planner. Raw, PSA 10, BGS 9.5, and the other named grades each get a low, median, and high. | Sold comps when those sales are stored. A demo sketch is not split. Sales that name neither grade stay on the mixed range. Not a population report.         |
| **Matching ladder** | The same desks. A raw card uses the raw band. A slab uses its company and grade. A watchlist row uses a grade named in the card line.                                            | The ladder stays on the mixed range when that grade is missing, or when the named grade is the whole tape. The offer ladder does not invent a PSA 10 price. |
| **Table lot**       | `/local-card-shows`, table notes. One dealer, one table, and up to six cards. The lot ask is the bundle. Each card can carry its own ask.                                        | The lot price is not one card's sale. A card with no ask stays off that card's range. Not a dealer inventory.                                               |
| **File the lot**    | Same note, when the result is bought. The paid price, offer first, is split by each card's ask and filed as its own cost basis.                                                  | Every card needs a player and an ask. Not a settlement.                                                                                                     |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Trade ladder — shipped (#195)

[#195](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/195) (`faaf5a2`) is on `main`. The trade balancer already says whether the marks are fair within 5%. That change placed each card on its own ladder. Give is the local mark on the sell ladder. Receive is the local mark on the buy ladder. Sports Card Investor and Market Movers still lead on live tape. They do not say whether the card you hand over is under the pass, or whether the card you take is over the walk.

| Slice            | Where                                                                                                                                        | Honest limit                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trade ladder** | Collection, on the trade value balancer. Each card you give sits on ask, take, and pass. Each card you receive sits on open, fair, and walk. | Sold comps when stored. Otherwise a demo sketch. Cash you add is not a rung. A card with no range, and a mark of zero, stay off the count. |
| **Rungs**        | Same desk. Both sides on the rungs, a give under the pass, a receive over the walk, or both.                                                 | The mark comparison within 5% stays. This desk does not borrow a watchlist target or trip cash to pull the walk down. Not a dealer fill.   |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Ladder score — shipped (#194)

[#194](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/194) (`ac88c95`) is on `main`. The ladder already says the three numbers. That change placed the number you will pay, the offer you typed, or the mark you would take on those rungs, then counted the week. Sports Card Investor and Market Movers still lead on live tape. They do not say whether the buy on the list is past the walk, or whether a pass left a number you had said you would pay.

| Slice                    | Where                                                                                                                                          | Honest limit                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Table offer**          | `/local-card-shows`, table notes, when the note names a card in the book. Paid price on a buy, the ask you passed, or the offer still open.    | That card's ladder. A watchlist target does not cap a table note. A note with no card stays off the score. |
| **Shopping-list number** | `/local-card-shows`, on each buy and sell line that already has a ladder. The buy uses that row's target, after the same target and cash caps. | A demo checklist hole is not a score. A blocked ladder is not an offer.                                    |
| **Sell mark**            | Collection comps snapshot and the sell planner. The local mark versus ask, take, and pass.                                                     | Sold comps when stored. Otherwise a demo sketch. Not a dealer bid.                                         |
| **Week**                 | Collection weekly recap and `/alerts`. Dated notes from the last 7 days that sit on a range.                                                   | Notes with no date, and notes with no card in the book, stay off the count. Not a settlement.              |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Offer ladder — shipped (#191)

[#191](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/191) (`753e13b`) is on `main`. The sale range already said where a number sits. That change gave the three numbers to say at the table. Sports Card Investor and Market Movers still lead on live tape. They do not turn that range into an open, a fair number, and a walk, or into an ask, a take, and a pass.

| Slice           | Where                                                                                                                         | Honest limit                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Buy ladder**  | `/alerts`, shopping-list buys, and a held-card table note. Open at the low, fair at the median, walk at the high.             | Sold comps when those sales are stored. Otherwise a stable demo sketch. A demo checklist estimate is not a ladder.         |
| **Target cap**  | `/alerts` and shopping-list buys, on that target's own row. A target under the high pulls the walk down.                      | A target under the low is not an offer inside the range. A table note does not borrow another card's target. Not Web Push. |
| **Cash cap**    | `/local-card-shows`, on each shopping-list buy. Cash still left before that buy, cheapest first, can cap the walk.            | The cash you saved for the trip, or the trip need when cash is blank. Not a fare.                                          |
| **Sell ladder** | Collection comps snapshot, shopping-list sell lines, and the sell planner. Ask the high, take the median, pass under the low. | The sell planner also says when all-in cost is over the low or the high. Not a dealer bid and not IRS completeness.        |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Sale range — shipped (#190)

[#190](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/190) (`c3d664e`) is on `main`. The book, the watchlist, the shopping list, a table note, and the sell planner already showed a mark or a median. That change placed the collector's own number on the low, median, and high of the last sales kept for that card. Sports Card Investor and Market Movers still lead on live tape. They do not say, on those same desks, whether the number you will pay or accept is under the low, inside the range, or over the high.

| Slice                   | Where                                                                            | Honest limit                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Sale range**          | Collection comps snapshot. Low, median, and high, and where the local mark sits. | Sold comps when those sales are stored. Otherwise a stable demo sketch around the local mark. Not a live tape.                       |
| **Target versus range** | `/alerts`. Active watchlist targets, eight at a time, under the low first.       | A target with no stored sales and no local mark stays off the list. Not Web Push. Server delivery still needs owner-held VAPID keys. |
| **Shopping-list buy**   | `/local-card-shows`, on each buy that has a held card or a watchlist mark.       | A demo checklist estimate for a set hole is not a sale range.                                                                        |
| **Table ask**           | `/local-card-shows`, table notes, when the note names a held card.               | A note with no held card keeps the median line and does not invent a range.                                                          |
| **Sell mark**           | Collection sell and trade-in planner. The local mark versus that card's range.   | Not a dealer bid and not IRS completeness.                                                                                           |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Pull sheet — shipped (#187)

[#187](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/187) (`12fefc3`) is on `main`. The shopping list already names a sell copy and where that copy sits. The pull sheet groups those sell lines so the cards come out of the binder, box, or slab case before the seeded show. Sports Card Investor and Market Movers still lead on live tape. They do not pack a show from the place saved on the book.

| Slice          | Where                                                                                                                        | Honest limit                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Pull sheet** | `/local-card-shows`, under each shopping list. Binder, then box, then slab case, then no saved place. One row per sell copy. | This browser. Not a warehouse system. The copy that stays in the book is off the sheet. |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Sell and trade-in planner — shipped (#172 / #173)

The book desk can now name what to sell or trade in. It reads the portfolio insights above (duplicate extras, cost-basis losers, unrealized P/L) and the saved tax-lot method. Marks stay demo or stale until eBay is on.

| Slice                                       | Where                                                                                                                                                                                                                  | Honest limit                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Duplicate extras**                        | Dashboard and Collection, under book insights. Keeps the highest mark (graded on a tie). Names the other copies in FIFO / LIFO / specific-ID / stack-average order.                                                    | Specific ID names nothing until lots are marked on the tax report. A marked keeper is not listed for sale. |
| **Cost-basis losers and long-term winners** | Same desk. Losers use the eBay ~13% fee heuristic. Long-term winners are listed only when they stay ahead after that fee. Short-term winners inside 45 days of long-term treatment are holds.                          | Not a listing and not a dealer bid.                                                                        |
| **Net of fees and wash-sale flag**          | Same desk. Card-show trade-in uses the ~4% fee heuristic. Estimated tax comes from the existing exit simulator. A loss next to a same-card copy bought inside 30 days is held back and the loss is flagged disallowed. | Heuristic only. Not IRS Form 8949 and not a wash-sale determination.                                       |

Copy does not claim a live Sports Card Investor or Market Movers sale feed.

## Mobile polish — shipped (#172)

Touch targets and stacking on the desks a collector actually opens on a phone. No new routes.

| Surface                       | What changed                                                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portfolio book insights**   | One-column totals on narrow screens, wrapping names, and a 44px control that moves focus to the sell planner.                                                   |
| **Sell and trade-in planner** | 44px filters and links, stacked rows, wrapping labels.                                                                                                          |
| **`/local-card-shows`**       | 16px city and sport fields (44px tall), 44px comps / collection / show-bag links, location button exposes pressed state. Trip-loop cash and table prices match. |
| **Dashboard show rail**       | Show-desk link is a 44px target.                                                                                                                                |

Show alerts and the shopping list are the section above. The mobile pass does not edit `lib/shows/showBuyingDesk.ts`.

## Eng-safe audit — 2026-10-28 (grade split and table lots)

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `faaf5a2`. The trade ladder is [#195](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/195) (`faaf5a2`). The ladder score is [#194](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/194). Dependabot [#192](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/192) and [#193](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/193) are on `main`. `npm ci` still warns that `node-domexception@1.0.0` is deprecated under `@google/genai`. That transitive chain is not a trivial non-major follow-up, so it stays. No `@eslint/js` 10 move. This change splits stored sales into raw and named grades, and uses the band that matches the card on the ladder when that band is not the whole tape. A missing grade stays on the mixed range. A demo sketch is not split. The same change keeps a lot of up to six cards on one table note. Each card's ask sits on that card's range. The lot price is not one card's sale. A bought lot files each card, and the paid price is split by those asks. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-28

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `ac88c95`. The ladder score is [#194](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/194) (`ac88c95`). The offer ladder is [#191](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/191). Dependabot [#192](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/192) (dev dependencies, 4 updates) and [#193](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/193) (production dependencies, 4 updates) are on `main`. `npm ci` still warns that `node-domexception@1.0.0` is deprecated under `@google/genai`. That transitive chain is not a trivial non-major follow-up, so it stays. No `@eslint/js` 10 move. [#195](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/195) (`faaf5a2`) places each side of the trade value balancer on that card's ladder. Give is the local mark on ask, take, and pass. Receive is the local mark on open, fair, and walk. Cash you add is not a rung. A card with no range, and a mark of zero, stay off the count. The mark comparison within 5% stays. This desk does not borrow a watchlist target or trip cash to pull the walk down. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-27

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `529ccc0`. The offer ladder is [#191](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/191). The sale range is [#190](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/190). Dependabot [#192](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/192) (dev dependencies, 4 updates) and [#193](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/193) (production dependencies, 4 updates) are on `main`. `npm ci` still warns that `node-domexception@1.0.0` is deprecated under `@google/genai`. That transitive chain is not a trivial non-major follow-up, so it stays. No `@eslint/js` 10 move. This change scores the number you type on that ladder. A buy sits at or under the open, up to the fair, up to the walk, or over the walk. A sell sits at or over the ask, down to the take, down to the pass, or under the pass. The shopping list scores the buy and the offer-near price, with the same target and cash caps. A table note scores the paid price, the ask you passed, or the offer still open, and does not borrow a watchlist target. The comps snapshot and the sell planner score the local mark on the sell ladder. The weekly recap and `/alerts` count dated notes that bought inside the walk, bought over it, or passed a number still at or under it. A demo checklist hole stays off the score. Notes with no date, and notes with no card in the book, stay off the week. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Remaining after this wave

### Still eng-safe

- `npm ci` still warns that `node-domexception@1.0.0` is deprecated under `@google/genai`. That is not a trivial non-major follow-up.
- No `@eslint/js` 10 move. No further Tailwind or ESLint major migration. Gzip cap stays 3,350,000.
- A demo sketch is not split by grade. A sale that does not name a grade stays on the mixed range. A lot card with no ask stays off that card's range. Those are the honest limits of this wave, not a second product pass.

### Owner-held

The unchecked [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) list below stays owner-only: optional file-only `00011`, file-only `00013` (agents must not apply either), Stripe lifecycle smoke, eBay then PSA, optional Sentry, `/audit-trail/admin` confirm, `fractional-vault` legal sign-off, and the full key-rotation drill. Also out of an eng-safe PR: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID keys, and live tape. Do not flip `VITE_FF_REAL_*`.

## Eng-safe audit — 2026-10-26

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `c3d664e` ([#190](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/190)). The sale range is that PR. Dependabot [#188](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/188) and [#189](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/189) stay on `main`. `npm ci` still warns that `node-domexception@1.0.0` is deprecated under `@google/genai`. That transitive chain is not a trivial non-major follow-up, so it stays. No `@eslint/js` 10 move. That pass, now [#191](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/191), added the offer ladder on the same local desks: open, fair, and walk on buys, and ask, take, and pass on sells. That target's own price, or the cash still left, can pull the walk down. A table note uses the held card's range and does not borrow another card's target. A demo checklist hole stays off the ladder. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-20

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `b35555e`. The pull sheet is [#187](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/187). Dependabot [#188](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/188) (dev dependencies, 12 updates) and [#189](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/189) (production dependencies, 9 updates) are on `main`. `npm ci` still warns that `node-domexception@1.0.0` is deprecated under `@google/genai` → `google-auth-library` → `gaxios` → `node-fetch` → `fetch-blob`. Replacing that transitive package is not a trivial non-major follow-up, so it stays. No `@eslint/js` 10 move. That pass, now [#190](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/190), placed the collector's number on the sale range: the comps snapshot, watchlist targets on `/alerts`, shopping-list buys, a held-card table ask, and sell-planner marks. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-19

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `569dd05` ([#186](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/186)). Sections that still said "this change" for merged work now name the PR: username + password [#186](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/186), show close [#184](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/184), frontier desk test alignment [#185](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/185). This change follows those auth flows on demo and pre-`00013` conditions. The password hint stays visible and matches 8+ characters with uppercase, lowercase, and a number. Sign-in, sign-up, forgot password, reset, and settings keep an accessible error and a loading state. A stale reset link, or a session that died on refresh, asks for a new sign-in. `POST /api/auth/password-sign-in` keeps an in-memory throttle. The 429 body does not echo the username. The collector slice groups shopping-list sell lines into a pull sheet by the saved place. That pull sheet is [#187](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/187) on `main`. Owner steps for `00013` stay owner-only. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-16

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `557fe23`. The floor pack is [#182](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/182). Google sign-in staying on the login page is [#183](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/183). This change closes the show on demo tape: a named card on the table note, the cheapest ask in the room, filing a bought note, open notes and cheap passes on `/alerts`, cash fit on the shopping list, and unfiled buys on the weekly recap. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-15

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `d0bd552` (#181). Sections that still said "this change" for merged work now name the PR: set completion [#177](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/177), table notes / grading submit / portfolio chart / CSV / want-list share [#178](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/178), show day / comps snapshot / trade balance / location / weekly recap [#179](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/179), mobile polish [#172](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/172). This change connects those desks on demo tape: set holes on the shopping list, a watch button for a hole, pull-from place on sells, ask versus median on table notes, and dated floor notes on the weekly recap. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-14

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `2e1a09a` (#178). Show day, the comps snapshot, the trade balancer, card location, and the weekly recap were still open and landed in [#179](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/179), with the #178 CSV, want-list, and zero-mark review notes. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git. Gzip cap is 3,350,000.

## Eng-safe audit — 2026-10-13

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `ee57364`. The sell planner and the mobile pass above shipped in [#172](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/172) / [#173](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/173). Show alerts and the shopping list shipped in [#171](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/171). The watchlist and show alert digest shipped in [#175](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/175). Shopping-list buys file into the collection with the paid price as cost basis in [#176](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/176). Collection now tracks demo-checklist gaps for sets the book has started. Everything still open besides that tracker is the #77 list below. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git.

## Owner-held checklist — [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) (open)

Credentials and dashboards only. This list matches the 2026-09-27 #77 body. Do not set secrets, flip `VITE_FF_REAL_*`, apply migrations, or pause Supabase from an engineering PR.

### Still open

- [ ] **Optional migration `00011`** — freshness SLA columns on `price_history`. The SQL file is in-repo only. The owner may apply it in the SQL editor. Engineering agents must not apply it, and must not treat “env is present” as a signal to apply it.
- [ ] **Stripe lifecycle smoke** — test mode against production: subscribe → upgrade → downgrade → cancel → failed-payment (card `4000 0000 0000 0341`). Webhook deliveries 2xx and the user’s tier updates. Punch-list item 6.
- [ ] **eBay** — `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` on Vercel, then `VITE_FF_REAL_EBAY=true`. Watch deployed-E2E and pricing-truth. Degraded fallback already labels comps `source: 'stale'`.
- [ ] **PSA** (after eBay is stable; not in the same change as `VITE_FF_REAL_EBAY`) — `PSA_API_KEY`, then `VITE_FF_REAL_PSA=true`. Punch-list item 5 still requires the key on **both** runtimes: Vercel (`api/grading/psa/cert.ts`) and the Supabase `verify-psa-cert` secret. A missing Edge secret leaves `/slab-verification` on the mock path.
- [ ] **Optional Sentry** — `VITE_SENTRY_DSN` on Vercel for the Issues UI. First-party `/api/client-error` is already live.
- [ ] **`/audit-trail/admin` confirm** — while signed in as an operator, the page renders and writes an `audit.cross_user_read` row.
- [ ] **`fractional-vault` legal sign-off** — securities review of the “Simulation only” disclosure. No engineering blocker. On approval, flip catalog `beta` → `live` in `lib/utils/featureCatalog.ts`.
- [ ] **Full multi-provider key-rotation drill** — the Supabase cutover is logged (2026-07-18). The quarterly drill still needs Stripe staging keys. Runbook: [`plans/incidents/key-rotation-drill.md`](plans/incidents/key-rotation-drill.md).

### Already done on #77

- [x] Restore Supabase `vhbsokjqchaafluimgjh` — **ACTIVE_HEALTHY** (confirmed 2026-09-27). Do not pause it from an engineering PR.
- [x] Vercel Supabase env presence — URL, anon key, service role, and `ALLOWED_ORIGIN` on production.
- [x] Migrations `00001`–`00010` applied; `admin-audit-events` deployed (2026-07-18).
- [x] Health ok and `config.serverApiAuth: true`.
- [x] RLS verification secrets and the July anon smoke.
- [x] First-party error telemetry (`VITE_ERROR_REPORTING_URL` + `VITE_REQUIRE_TELEMETRY`).
- [x] GDPR export and delete.
- [x] First admin bootstrap (`msi-launch-admin@example.com`).
- [x] First key-rotation drill log (Supabase cutover).
- [x] Quarterly catalog sweep (2026-09-05) — `fractional-vault` stayed beta. See [`docs/BETA_EXIT_READINESS_PASS.md`](docs/BETA_EXIT_READINESS_PASS.md).
- [x] Collection list/grid action parity — [#115](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/115) (`760def1`, 2026-09-05).

Leave #77 **open** until the unchecked items land.

## Bloomberg program — status

| Bet                       | Engineering                                                                        | Owner blocker                                            |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Consensus pricing ledger  | ✅ `lib/pricing/consensusMarketLedger` + Dashboard strip + `/api/market/consensus` | Flip `VITE_FF_REAL_EBAY` when keys set                   |
| Holdings-linked news rail | ✅ Dashboard `HoldingsCatalystRail` + `/catalyst-market`                           | Optional `VITE_FF_REAL_SPORTS` later                     |
| War Room as Alpha home    | ✅ Dashboard CTA + ledger context in committee prompts                             | Live tape when eBay flag on                              |
| Institutional export      | ✅ `/audit-dossier` + consensus ledger strip + Schedule D–style packet             | Full IRS regulatory completeness still legal-gated       |
| Developer API desk        | ✅ `/api-licensing` GA; demo metering opt-in / watermarked                         | Real Alpha key issuance later                            |
| Dealer mobile loop        | ✅ `MOBILE_NAV` + floor-loop CTAs; `/scan` palette intent preserved                | Field friction at a real show                            |
| eBay / PSA tape           | ✅ adapters + readiness script (+ Stripe/Sentry presence checks)                   | **Owner keys, then one flag at a time** (eBay, then PSA) |

## Shipped eng-safe detail (2026-09)

> Ship notes for Waves 2–5 and the Phase B–D scaffolds. The **2026-10-12 #77 checklist above is the live owner list.** A footer here that still says “Vercel env sync,” “restore,” or “apply `00011` after env sync” is superseded. The [Forward roadmap](#forward-roadmap-post-eng-safe) below is the current sequence.

## Eng-safe Phase B–D scaffolds — Shipped (2026-09-15, #144 / #145)

Demo/DAL-safe. **No secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no jsPDF on live briefing paths, no `fractional-vault` promotion.** Copy does **not** claim live Market Movers / SCI Pulse parity. [#144](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/144) (`3ca10f4`) plus [#145](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/145) are on `main`. This was the last eng-safe product wave before owner-held #77 keys — not a signal to apply migrations or flip flags.

| Slice                                   | Where                                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Freshness SLA helpers + UI**          | `lib/pricing/freshnessSla.ts` — stamp (≤2d / 3–6d / ≥7d) + tape (≤30d / 31–89d / ≥90d). Badges on Pulse, War Room, Pricing Truth Health, and provenance chips.       |
| **Provenance completeness**             | Confidence only when a sold-comp / thin-tape formula exists (or a stored model score). Preferred valuation stays sold → historical → AI.                             |
| **`price_history` SLA SQL (file only)** | `supabase/migrations/00011_price_history_freshness_sla.sql` — **not applied**. Optional owner SQL-editor item. Engineering agents must not apply it.                 |
| **Server Web Push scaffold**            | `GET/POST /api/push/subscribe` reads `WEB_PUSH_VAPID_*` at runtime, **503 VAPID_UNSET** when missing. Wave-4 client calls the route when configured. No keys in git. |
| **MLB catalyst / PvP wire adapters**    | `lib/integrations/mlbLiveWire.ts` — seeded fallback default; live path structured behind owner sports flag/env. Honest disclosure.                                   |
| **P2P matching lite**                   | Local crossings + reputation stub + escrow **state machine / ledger stubs** on `msi_p2p_intents_v1`. No real money.                                                  |
| **Auto-Pilot adapter + pause**          | Advisory execution stub, kill-switch, global pause. Collars/replay wired. Still no live marketplace fills.                                                           |
| **Show-floor partner stubs**            | Typed show-bag contracts; local bag remains source of truth.                                                                                                         |
| **API licensing + webhooks (lite)**     | Scoped demo tokens + watermarked metering. `valuation.updated` / `alert.triggered` no-op dispatcher gated by `MSI_WEBHOOK_DISPATCH`.                                 |

**Owner-held remainder:** see the 2026-10-12 #77 checklist at the top (optional `00011`, Stripe smoke, eBay then PSA, optional Sentry, admin-audit confirm, legal, rotation drill). Restore and Vercel Supabase env presence are done.

**Out of scope for that wave:** jsPDF on live briefing; new Labs pages; applying `00011` from an agent; live non-MLB sports wires; production CV; IRS completeness; real Alpha key issuance DB. Tailwind 4 and ESLint 10 later landed as dependency bumps on `main`; `@eslint/js` stayed on 9.x. Do not add more major churn.

## Phase B pricing-truth UI scaffold — Shipped (2026-09-10)

Demo/DAL-safe. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on live briefing paths.** `fractional-vault` stays `beta` (legal). Copy does **not** claim live Market Movers / multi-marketplace parity.

| Slice                            | Where                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source-priority model**        | `lib/pricing/pricingTruth.ts` — eBay/sold comps → historical/thin tape → AI/estimate. Collection, Dashboard, Favorites, watchlist, Compare use preferred marks. |
| **Stale + low-liquidity badges** | Portfolio cards / list rows, Dashboard recents, Favorites, watchlist targets. Thresholds disclosed (7d stamp, 90d tape, ≤2 comps, score &lt; 40).               |
| **Provenance chip**              | Source, freshness, confidence if modeled else `conf unknown`, comps count + rationale tooltip. Wired into Comps Used / preferred valuation surfaces.            |
| **Adapters ready**               | Live eBay flag still off. `Live comps` label only when `VITE_FF_REAL_EBAY` is on.                                                                               |

**Owner-held remainder:** eBay then PSA keys on #77 (restore and Vercel Supabase env presence are done). Full Phase B exit = live tape + freshness SLA. Do not claim live Market Movers / SCI parity before that.

## September 2026 Wave-5 — Shipped (2026-09-10)

Demo/DAL-safe deepenings so a serious collector/investor prefers MSI over **Sports Card Investor / Market Movers** _before_ #77 live eBay/PSA keys — while keeping disclosures honest. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.** `fractional-vault` stays `beta` (legal).

| Slice                                 | Label                                    | Where                                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ratio intelligence reports**        | **deepen** (beat Market Movers headline) | Grade / player / variation price-ratio panels from local + sold-comp / consensus marks on Collection, Dashboard, and War Room. Thin tape and heuristic 9/10 fills stay labeled.                                    |
| **Collection & Favorites Top Movers** | **lite**                                 | Portfolio-relative and favorites movers (%, $) from stored snapshots then dated comps. Dashboard, Collection, Favorites, War Room. Empty/thin states honest — not a global live feed.                              |
| **Deal Finder lite**                  | **lite**                                 | Watchlist / target / holding-scan candidates below consensus or fee-aware eBay break-even. Disclosed 15% “great deal” threshold. Existing pricing/comp paths only.                                                 |
| **Market Pulse / hobby indexes**      | **deepen**                               | Multi-segment Pulse (sport / era / sealed-vs-singles) on Dashboard + Collection; Macro-Sentinel chips; terminal quote table uses local Δ instead of random. Seeded + local — **not** live SCI Market Pulse parity. |
| **Card Compare desk**                 | **deepen**                               | `/compare` now desks 2–3 cards: marks, comps used, ratios, ST/LT, concentration. Collection per-card action + 2–3 select “Compare desk”. No new Labs route.                                                        |
| **Whale Collection list**             | **lite** (Priority 6.2)                  | Virtualized list (tanstack) above 24 rows; memoized rows; stable virtual keys on grid + list. Grid was already virtualized.                                                                                        |
| **Sealed wax / TCG parity lite**      | **lite**                                 | Adjacent hobby rail (Pokémon / MTG / memorabilia) on Dashboard + Collection next to sports Pulse. Disclosed proxies.                                                                                               |

### vs Sports Card Investor / Market Movers

MSI now covers **ratio intel + collection/favorites movers + deals + multi-segment Pulse + 2–3 card compare + whale-scale list** on top of the institutional stack SCI lacks (War Room, Auto-Pilot, tax lots, wash-sale, Negotiation Arena, consensus ledger, audit dossier, card-show loop, agent why/consensus). Live eBay/PSA tape and SCI-style marketplace scrapes remain owner-held (#77) — copy does not claim live Market Movers parity.

**Owner-held remainder:** the 2026-10-12 #77 checklist (not a fresh Vercel env sync). Vanity DNS, production centering CV, IRS completeness, and owner VAPID values stay out of eng-safe PRs.

**Deferred from this wave (point-in-time):** jsPDF/html2canvas on the live entry graph; new Labs pages; live non-MLB sports wires; a new `price_history` table beyond optional file-only `00011`; partner show-bag APIs; full P2P matching/escrow; production CV; IRS completeness. Tailwind CSS 4 and ESLint 10 later landed as dependency bumps; do not start another major migration.

## Forward roadmap (post-eng-safe)

Waves 2–5 and the #141 / #144 scaffolds closed the first engineering-safe consumer-intel gap **on the local book**. Owner direction (2026-10-12) keeps eng-safe product depth in scope while [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) is open — including the card-show loop above — so a slipped #77 is not a reason to stop demo-tape buildout. **#77 remains the only path to live tape.** Do not flip `VITE_FF_REAL_*`, apply `00011`, or claim live Market Movers / SCI Pulse parity before eBay is live. Owner narrative: [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md).

### Competitive positioning

| Capability                                                                 | MSI                                       | Market Movers / Sports Card Investor |
| -------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| Agents, War Room, why / consensus                                          | **Lead**                                  | Absent                               |
| Tax / fiscal (lots, ST/LT, wash-sale, sell / trade-in planner)             | **Lead** (advisory; not IRS-complete)     | Thin or absent                       |
| Audit dossier + admin trail                                                | **Lead**                                  | Absent                               |
| Card-show floor loop (discover, trip, floor, recap, alerts, shopping list) | **Lead** (seeded calendar + local book)   | Absent                               |
| Offer ladder (open / fair / walk, ask / take / pass)                       | **Lead** (local range, target, cash left) | Absent                               |
| Ladder score (typed number on the rungs, week count)                       | **Lead** (local ladder)                   | Absent                               |
| Ratio intel, movers, deals, compare, whale list, wax/TCG                   | **Parity-plus on local book** (Wave-5)    | Strong on live tape                  |
| Live multi-marketplace sold comps                                          | Behind #77                                | **They lead until Phase A**          |
| Live Market Pulse / hobby indexes                                          | Seeded + local Δ                          | **They lead until Phase A**          |

### Phase A — Unlock trusted book (#77) — OWNER ONLY

Do not implement keys, apply `00011`, or pause the project from an engineering PR. Restore and Vercel Supabase env presence are **done**. Ordered remainder:

1. ~~Restore Supabase `vhbsokjqchaafluimgjh`~~ — **done (ACTIVE_HEALTHY)**. ~~Vercel Supabase env presence~~ — **done** (URL / anon / service role / `ALLOWED_ORIGIN`). Re-sync only if those keys rotate — [`docs/DEPLOY_ENV_CHECKLIST.md`](docs/DEPLOY_ENV_CHECKLIST.md).
2. Optional `00011_price_history_freshness_sla.sql` — **file-only**. Owner SQL editor only. Agents must not apply it.
3. Stripe lifecycle smoke — [`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md) item 6
4. eBay → server keys, then `VITE_FF_REAL_EBAY` (observe deployed-E2E + pricing-truth)
5. PSA (after eBay is stable; not in the same change) — `PSA_API_KEY` on **both** runtimes, then `VITE_FF_REAL_PSA`:
   - Vercel `PSA_API_KEY` → `api/grading/psa/cert.ts`
   - Supabase secret `PSA_API_KEY` + `verify-psa-cert` deployed → `/slab-verification` (`lookupPsaCert`). Missing this secret falls back to mock.
6. Optional Sentry DSN, `/audit-trail/admin` confirm, `fractional-vault` legal, full multi-provider key-rotation drill

Track on [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

### Phase B — Pricing truth default (eng, after eBay live)

Phase 32 style. Consensus / Comps Used / Collection chips already exist.

**UI scaffold shipped (2026-09-10, this PR):** sold-comp / consensus is the display default on Collection grid/list, Dashboard recents + NAV, Favorites, watchlist/targets, and Compare when comps exist — **even while `VITE_FF_REAL_EBAY` is off**. Honest labels (`Sold comps` / `Thin sold comps` / `AI estimate`); `Live comps` only if the owner-held flag is on. Stale (7d stamp or 90d tape) and thin-tape / low-liquidity (≤2 comps or score &lt; 40) badges plus a compact provenance tooltip (source, freshness, disclosed confidence or `conf unknown`, comps count) on those surfaces. Classifiers live in `lib/pricing/pricingTruth.ts` with Vitest coverage.

**Code remainder shipped (2026-09-15, #144):** freshness SLA helpers + Pulse / War Room / chip badges; confidence only when a formula exists; `00011_price_history_freshness_sla.sql` **file only** (optional owner SQL; agents must not apply it). **Full Phase B exit still needs** [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) live eBay tape + SLA against real comps. Do not flip `VITE_FF_REAL_*` from this class of PR. Do not claim live Market Movers / SCI parity before that tape is on.

### Phase C — Always-on alerts & wires

- **Server Web Push scaffold shipped (2026-09-15):** `/api/push/subscribe` refuses loudly without owner VAPID. Client Wave-4 path calls it when configured. **Keys still owner-held.**
- **MLB catalyst / PvP wire adapters shipped:** seeded fallback default; live structure behind owner sports flag. Honest disclosure — not a live tape.

### Phase D — Real trading moat

- **P2P matching lite shipped:** local suggestions + reputation stub + escrow state-machine UI / ledger stubs. No real money.
- **Execution adapter stub + kill-switch / global pause shipped.** Still no live marketplace fills.
- **Show-floor partner client stubs shipped.** Local show bag remains source of truth.
- Production CV **only if** it beats the disclosed heuristic

### Phase E — Platform

- Real Alpha API keys + webhooks
- Alpha Guilds
- Risk / compliance depth (not IRS theater)
- Multi-tenant scale

### 30 / 60 / 90 — T0 = Phase A complete

**T0** is the day [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) closes. Restore, migrations `00001`–`00010`, health, `serverApiAuth`, and Vercel Supabase env presence are already done, so the critical path inside Phase A is **Stripe lifecycle smoke + eBay live**. PSA stays off until eBay is stable. Optional `00011` does not gate T0 and must not be applied by an agent. If #77 slips, **the clock does not start**.

Eng-safe Phase B–D **scaffolds already shipped** before T0 (#141 / #144) with flags off. That does not start the live-tape clock.

| Window      | Outcome                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-T0**  | Finish the open #77 items. Eng-safe demo-tape depth may continue (owner override, 2026-10-12). No new Labs. Do not flip both real-data flags. Do not apply `00011`. |
| **T0 + 30** | eBay tape observed. PSA on **both** runtimes only if eBay is stable. Live Phase B exit started.                                                                     |
| **T0 + 60** | Phase B default-on + freshness SLA against real comps. Phase C started (Web Push or MLB wire).                                                                      |
| **T0 + 90** | Phase C usable. Phase D scoped. Phase E waits until A–C are boring.                                                                                                 |

### Explicit non-goals (still)

No new Labs pages. Tailwind CSS 4 (`tailwindcss` ^4.3.3) and ESLint 10 are already on `main`; `@eslint/js` stays 9.x — do not start another major migration. Do not flip both real-data flags at once. Do not pause Supabase or apply `00011` from an engineering PR. Do not put secrets in git. Do not promote `fractional-vault` without legal. Do not put jsPDF on live briefing paths. Do not claim live SCI / Market Movers Pulse parity before eBay is live.

## Older wave logs (point-in-time)

> Superseded for sequencing. Use the 2026-10-12 #77 checklist. Lines below that say the project is paused, that restore or Vercel env sync is still open, or that Tailwind is still on 3.4.19 described an earlier week.

## September 2026 Wave-4 — Shipped (2026-09-10)

Demo/DAL-safe deepenings on existing Alerts / Profile / Notification Center, Negotiation Arena, Migration Banner / Profile, Collection / Fiscal / Tax, ProtectedRoute, and the offline banner. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.**

| Slice                                | Label                              | Where                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web Push subscription lite**       | **lite** (Priority 2.2 remainder)  | Client Push API / service-worker readiness on Alert delivery (Alerts / Profile / Notification Center). Endpoint persisted via `msi_web_push_subscription_v1`. Quiet hours + browser-notification prefs still gate delivery. Honest copy: **server-triggered push still needs owner-held VAPID keys + a backend** — no VAPID secrets in git. |
| **Negotiation Arena UX**             | **deepen** (Priority 4.1)          | Agent-thinking animation + seller-firmness / sentiment meter on the existing Arena modal. Gemini firmness when the generate path returns a score; deterministic demo fallback otherwise. Still advisory — not live marketplace trading.                                                                                                     |
| **Field-level migration merge**      | **deepen** (Priority 1.2 leftover) | Duplicate inventory / target preview now lists key field conflicts (mark, cost, dates, grade, notes, status) on Migration Banner + Profile. Demo-safe when cloud is unavailable. No restore.                                                                                                                                                |
| **Holding horizon / wash-sale rail** | **lite**                           | Days held, ST vs LT, and 30-day repurchase proximity on Collection, Fiscal Shield, and Tax Report. Uses local lot dates. **Not** tax advice or IRS completeness.                                                                                                                                                                            |
| **ProtectedRoute loading polish**    | **leftover** (Priority 1.1)        | Session shell stays up until `INITIAL_SESSION` **and** profile are ready (`loading` or `profileLoading`). Auth security model unchanged.                                                                                                                                                                                                    |
| **Offline sync status**              | **lite**                           | Pending / failed counts + retry / requeue on the offline banner and Profile Data Management. Real MSI-store queue only — no mock pending rows.                                                                                                                                                                                              |

**Owner list at the time of this wave (superseded):** see the 2026-10-12 #77 checklist. Restore is done.

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs; full P2P matching/escrow; production CV; IRS completeness; server-triggered Web Push (VAPID + backend).

## September 2026 Wave-3 — Shipped (2026-09-08)

Demo/DAL-safe deepenings on existing Collection, Dashboard, Soccer Hub, Fiscal / Tax Report, War Room Auto-Pilot, and Alerts / Profile / Notification Center. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.**

| Slice                                   | Label                                    | Where                                                                                                                                                                                                                                                 |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portfolio concentration / risk rail** | **lite** (extends trade-proposal math)   | Player + league share of local NAV on Collection + Dashboard. 35% heuristic threshold. Advisory rebalance hints link to existing trade proposals (`/collection`) or Auto-Pilot (`/war-room`). Local inventory only.                                   |
| **Fee-aware break-even strip**          | **lite** (extends Break-Even calculator) | Collection grid/list + Exit Strategy + `BreakEvenModal`. Purchase + grading + shipping + selectable eBay ~13% / COMC / MySlabs / custom presets via `breakEvenService`. Full calculator now wired from card actions.                                  |
| **Soccer hub player/team desks**        | **parity** (NBA/NFL/NHL Wave-2 pattern)  | `/soccer-hub` Players + Teams desks + `LeaguePerformanceVsPricePanel` bound to collection marks. Seeded/heuristic disclosure and empty-bind state. Live soccer wires still unconfigured.                                                              |
| **Capital gains exit simulator**        | **lite** (Phase 27 Fiscal Shield)        | Sell-this-year vs next ST/LT compare via `FiscalService.simulateExit` on Tax Report, Fiscal Shield widget, Tax Exit Simulator, and Collection sell modal. Advisory only — **not** IRS regulatory completeness.                                        |
| **Auto-Pilot decision replay**          | **lite** (Phase 33 exit criteria)        | Day-bucketed local replay (`msi_autopilot_replay_v1`) of actions considered, collars, approvals, and NAV preview snapshot. War Room Auto-Pilot surface. No live marketplace execution.                                                                |
| **SyncScheduler product defaults**      | **lite** (Priority 2.2 leftover)         | Signed-in / demo daily portfolio+watchlist defaults remembered via `msi_sync_product_defaults_v1`. Opt-in toggle on Alert delivery (Alerts / Profile / Notification Center). Quiet hours still suppress haptics + Notification API. **Not** Web Push. |

**Owner list at the time of this wave (superseded):** see the 2026-10-12 #77 checklist. Restore is done.

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; Web Push / server push; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs; full P2P matching/escrow.

## Post-#130 / September 2026 Wave-2 — Shipped (2026-09-08)

Demo/DAL-safe batch on existing Alerts / Profile / Notification Center, Dashboard + NBA/NFL/NHL hubs, Collection, Card Show Mode, and War Room Auto-Pilot. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.**

**What already shipped through #130:** Scout-to-Acquire Playwright smoke; thin P2P intent board; `@google/genai` 2.x; adjacent hobby correlation (lite); price-alert haptics; disclosed centering heuristic (lite). Plus the 2026-09-07 engineering batch (seasonal windows, catalysts, MLB PvP, pop weighting, trade proposals, briefing HTML, Auto-Pilot idempotency / collars, Consensus View, Comps Used, tax-lot selector).

| Slice                                  | Label                                           | Where                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Alert quiet hours + channel prefs**  | **lite** (extends #130 haptics)                 | `msi_alert_preferences_v1` via MSI store. Quiet hours, haptic on/off, Notification API on/off. Gated on NotificationService / haptics / watchlist / target-price / syncScheduler. Settings on `/alerts`, Profile Native Experience, Notification Center prefs. In-app alerts still record. **Not** Web Push. |
| **Non-MLB Performance vs Price**       | **partial** (parity with MLB Dashboard binding) | NBA / NFL / NHL hubs + Dashboard when those leagues are selected. Seeded `getStatLeaders` bound to collection marks. Disclosed heuristic — not a live feed.                                                                                                                                                  |
| **Local valuation / price sparklines** | **lite**                                        | Collection grid + list from stored snapshots, then dated sold comps. Thin/empty states stay honest. **No** new Supabase `price_history` table.                                                                                                                                                               |
| **Card-show “show bag”**               | **lite**                                        | Printable/checklist packing list from swipe-triage review + consignment + active targets + Card Show supplies. `/card-show-mode` + Collection mobile. Local-only.                                                                                                                                            |
| **Grading ROI lite**                   | **lite** (Priority 3.2)                         | Raw vs PSA 9/10 on Collection from sold-comp titles or disclosed multipliers + economy fee. Live PSA owner-held.                                                                                                                                                                                             |
| **Auto-Pilot NAV + tax preview**       | **lite** (Phase 33 leftover)                    | War Room cycle preview: before/after NAV and rough ST/LT tax via `FiscalService.simulateExit`. Advisory — no live execution.                                                                                                                                                                                 |

**Owner list at the time of this wave (superseded):** see the 2026-10-12 #77 checklist. Restore is done.

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; Web Push / server push; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs.

## Engineering-friendly NEXT_STEPS — Shipped (2026-09-08)

Demo/DAL-safe slices. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages.**

| Slice                                             | Where                                                                                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scout-to-Acquire Playwright smoke**             | `tests/e2e/scout-to-acquire.spec.ts` — demo login, seeded Collection holding, Dashboard → War Room scout desk, Acquisition campaign persist. Added to `test:e2e:smoke`. No live Gemini refresh click. |
| **Thin P2P intent board** (roadmap #7 lite)       | Collection panel + Liquidity Pool summary. Local bids/asks via `msi_p2p_intents_v1`. **Not** live trading, matching, escrow, or MSI-house inventory.                                                  |
| **`@google/genai` 2.x**                           | Major bump; `generateContent` / `Type` adapters unchanged (v2 breaks Interactions only).                                                                                                              |
| **Adjacent hobby correlation** (roadmap #15 lite) | Seeded Pokémon / MTG / memorabilia on existing Cross-Asset Correlation page, dashboard widget, and correlation modals. Disclosed synthetic proxies — **not** live feeds. No new Labs pages.           |
| **Price-alert haptics** (roadmap #2)              | Vibration API on watchlist / target-price / NotificationService paths (`lib/utils/haptics.ts`). No-ops on desktop.                                                                                    |
| **Centering heuristic** (roadmap #17 lite)        | Disclosed non-CV geometry/metadata stub on Visual Audit + Centering Analyzer. **Not** a production CV model and **not** a PSA prediction. No heavy CV library.                                        |

**Deferred this pass (2026-09-08, superseded on toolchain):** Tailwind was still on 3.4.19 that week. `tailwindcss` ^4.3.3 landed later in [#161](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/161); `eslint` is ^10.12.0; `@eslint/js` stayed on 9.x. Do not start another major migration. Full P2P order book / exchange, production centering CV / PSA-grade model, and a custom vanity domain stayed open.

Owner list at the time of this wave (superseded): see the 2026-10-12 #77 checklist. Restore is done.

## Engineering-friendly NEXT_STEPS — Shipped (2026-09-07, post-#123)

Demo/DAL-safe product slices on existing Dashboard, Collection, Morning Briefing, and Auto-Pilot surfaces. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages.**

| Slice                                                    | Where                                                                                                                                                                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Seasonal Buy/Sell windows** (roadmap #11)              | Seeded calendar (spring training / All-Star / playoffs / off-season) on Dashboard + Collection rails and per-card chips. Heuristic disclosure — not live tape.                                                             |
| **Injury / transaction catalysts** (roadmap #9)          | `HoldingsCatalystRail` + `CatalystEngine` seeded injury/DFA/call-up cards for matching holdings. Not a live sports wire.                                                                                                   |
| **Performance vs Price** (MLB binding)                   | Dashboard binds `StatsService` / mlbApi hitting lines to collection marks on an existing Recharts composed chart.                                                                                                          |
| **Pop / scarcity weighting** (Priority 3.1 lite)         | `popReport` hydrates from a simulated model when live PSA is unavailable; Alpha Score applies a Pop 1 / low-pop premium; list/grid badges stay honest about source.                                                        |
| **Trade proposal / portfolio delta** (Priority 4.2 lite) | Advisory “Card A for Card B + cash” from local inventory on Collection. Not a P2P marketplace.                                                                                                                             |
| **Morning briefing visual fidelity** (Priority 5.1 lite) | In-modal league-allocation bars + text/HTML download via `leagueAllocation` (no jsPDF/html2canvas on the live briefing path).                                                                                              |
| **Auto-Pilot idempotency stub** (Phase 33 leftover)      | Day-bucketed local keys + duplicate-action guards in `AutonomousExecutionService`. Still advisory — no live execution.                                                                                                     |
| **Agent Consensus View** (roadmap #14)                   | Per-agent Buy / Wait / Hold / Sell stances + split summary on Analyst War Room and Outcome Memory. Builds on `WhyRecommendationPanel` / `agentReasoning`. Missing stances disclosed, never invented.                       |
| **Comps Used** (roadmap #10)                             | Collection grid + list show the sold/historical comps that underpin `preferredValuationForCard`. Thin tape and AI-only paths stay labeled.                                                                                 |
| **Tax-lot method selector**                              | FIFO / LIFO / Specific ID / Average persist via MSI store (`msi_tax_lot_preferences`) and drive Fiscal Intelligence + `/tax-report`. Lot-selection math is unit-tested. **Not** IRS regulatory completeness.               |
| **Auto-Pilot collars + approval**                        | Daily budget, per-asset cap, max drawdown stop; high-dollar or low-confidence actions go to the human approval queue. Acquisition campaigns preview the same collars. Advisory stays default — no live marketplace trades. |

**Deferred / skipped that pass:** Scout-to-Acquire Playwright E2E and thin P2P intent board shipped 2026-09-08. Full P2P order book, production centering CV, custom vanity domain still open.

Owner list at the time of this wave (superseded): see the 2026-10-12 #77 checklist. Restore is done.

## Collection list/grid action parity — Shipped (2026-09-05)

[#115](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/115) squash-merged to `main` (`760def143b6dd79251674c5cd37dfc8c4ec24787`). Collection **list view** now exposes the same per-card actions as grid (watchlist, consignment, sold vault, dossier). No remaining engineering on that gap.

## Quarterly catalog sweep — Done (2026-09-05)

Audit of `lib/utils/featureCatalog.ts` + route supplement + `DISCOVERABLE_FEATURE_CATALOG` gating. Full notes: [`docs/BETA_EXIT_READINESS_PASS.md`](docs/BETA_EXIT_READINESS_PASS.md) § September 2026 sweep.

| Outcome              | Detail                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stayed beta**      | `fractional-vault` — legal/securities-gated; do **not** flip to `live`                                                                                                                                                                            |
| **Hidden / demoted** | None this cycle. Default discovery already excludes `beta` and `demo`                                                                                                                                                                             |
| **Already gone**     | `fractional-vault-v2` was removed earlier (duplicate of v1)                                                                                                                                                                                       |
| **GA honesty**       | Wave-3 exits (`provenance-chain`, `vision-grading`, `liquidity-pool`, `visual-audit`, `live-impact`) remain `live`. Auto-supplement “Demo-grade surface” rows stay `demo` and stay out of Feature Directory unless `VITE_FF_ENABLE_DEMO_SURFACES` |
| **Next sweep**       | ~2026-12                                                                                                                                                                                                                                          |

## Phase 31 — Shipped (2026-07-04 → 2026-07-05)

| Piece                                                                   | Where                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| User audit timeline (`/audit-trail`) with filters/search/CSV/pagination | `pages/AuditTrail.tsx`, `components/audit/*`, `lib/utils/auditTrail*`                                              |
| Admin cross-user viewer (`/audit-trail/admin`)                          | `pages/AdminAuditTrail.tsx`, `components/AdminRoute.tsx`                                                           |
| Server-side cross-user read + audit-of-audit write                      | `supabase/functions/admin-audit-events/index.ts`                                                                   |
| `profiles.role` (member/support/admin) + RLS + trigger guard            | `supabase/migrations/00008_profiles_role.sql` + `00010_profiles_role_fixes.sql` (the P1 recursion + trigger fixes) |
| `operatorRole` + `profileLoading` on AuthContext                        | `contexts/AuthContext.tsx`                                                                                         |
| Key-rotation runbook                                                    | `plans/incidents/key-rotation-drill.md`                                                                            |
| Design reference (post-implementation)                                  | `plans/admin-audit-viewer-spec.md`                                                                                 |

**Activation infra is done and the project is ACTIVE_HEALTHY** (confirmed 2026-09-27, still the status as of this 2026-10-12 refresh). Migrations `00001`–`00010` are applied on `vhbsokjqchaafluimgjh`, Edge Functions were deployed, `msi-launch-admin@example.com` was promoted, and the cutover is logged as the first rotation drill (`plans/incidents/key-rotation-drill.md`, entry `2026-07-18`). Health is `ok: true` with `config.serverApiAuth: true`. Do not pause the project and do not re-run a restore from an engineering PR. The owner check still open is a real login: **confirm `/audit-trail/admin` renders and writes an `audit.cross_user_read` row while signed in as an operator**.

## Platform & toolchain hardening — Shipped (2026-08-01 → 2026-08-13)

Two security findings surfaced through the Dependabot queue and were traced to a
single root cause: the Node 20 floor had fallen behind what the ecosystem ships.

| Change                                                    | Detail                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node floor 20 → 22** (`def3e06`)                        | `.nvmrc` = `22`, `engines.node` = `>=22.22.2`. Every workflow reads `.nvmrc`; `rls-verify.yml` already pinned 22 independently.                                                                                                                                                                                                              |
| **jsdom 29 → 30** (`def3e06`)                             | Required the Node bump (jsdom 30 floor is `^22.22.2`). Pulls patched `undici@^8.9.0`, closing 5 high-severity advisories.                                                                                                                                                                                                                    |
| **`brace-expansion` → 5.0.9** (`e47efc8`)                 | Override bump; closes the DoS that bypassed the CVE-2026-14257 mitigation.                                                                                                                                                                                                                                                                   |
| **TypeScript 7.0.2** (`49c077e`, #102)                    | TS 7 has no programmatic compiler API, so `typescript` is aliased to `@typescript/typescript6` for typescript-eslint while TS 7 installs as `@typescript/native`. No bin collision — the TS 6 alias ships its binary as `tsc6`, so `tsc` is unambiguously 7.0.2.                                                                             |
| **Stripe API version sync** (#97, later #105 / `10407e1`) | `stripe@22.x` `apiVersion` pin follows the 2026 dahlia generation.                                                                                                                                                                                                                                                                           |
| **Dependabot queue**                                      | August pass drained #89 and #92–#103. Later safe bumps continued through [#166](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/166) (`742bc5e`, 2026-10-12) from Dependency Guardian [#155](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/155). No open pull requests as of 2026-10-12. |

Why it matters beyond hygiene: the `undici` advisories were failing
`npm audit --audit-level=high` on `main` itself, so the `CI / CD` gate was red
for every contributor until the Node floor moved. **Contributors on Node 20 must
upgrade** — `npm ci` will refuse the engine constraint.

## Status of the June recommendation (implemented on the July-3 branch)

| Item                                    | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0 — open-PR queue (#74, #75, #59, #58) | ✅ Resolved: dependency groups applied here with the Stripe `apiVersion` fix #74 was missing; #59's goal already shipped on main (June 10 consolidation); #58's unique audit work (filters/search/CSV/pagination + runbook + admin spec) ported here. All four closed as superseded.                                                                                                                                                                                                                   |
| P1 — punch-list items 1/3/4             | ✅ Items 1/3/4 done (2026-07-18): new Supabase project linked, secrets set, RLS smoke green locally, health `serverApiAuth: true`, Deployed E2E live. **2026-10-12:** `vhbsokjqchaafluimgjh` is ACTIVE_HEALTHY again; Vercel Supabase env presence is confirmed; health and `serverApiAuth` still hold. The September “INACTIVE / re-sync first” caveat is superseded. Remaining owner punch-list is the #77 checklist at the top (Stripe smoke, eBay then PSA, optional Sentry). GDPR closed 2026-08. |
| P2 — beta exits                         | ✅ `provenance-chain` live · ✅ `liquidity-pool` live · ✅ `fractional-vault-v2` removed (duplicate). ✅ `vision-grading` live. **2026-09 sweep:** remaining `fractional-vault` stays `beta` (legal sign-off — no engineering).                                                                                                                                                                                                                                                                        |
| P3 — integration depth                  | ✅ eBay comp pagination (offset pages), last-known-good comps served as `source: 'stale'` on live failure, PSA `CertVerifiedBadge` on any card with a `certNumber`.                                                                                                                                                                                                                                                                                                                                    |
| P4 — onboarding                         | ✅ Scan-first empty state, `/demo-flow` tour link, first-card pricing toast pointing at the data-source badge.                                                                                                                                                                                                                                                                                                                                                                                         |

## Priority 1 — Remaining owner-held launch actions

> **Superseded as a checklist by the 2026-10-12 #77 section at the top.** `vhbsokjqchaafluimgjh` is **ACTIVE_HEALTHY**. Migrations `00001`–`00010`, Edge Functions, and the July 18 auth redirect allowlist still stand. Vercel Supabase env presence is confirmed. Optional `00011_price_history_freshness_sla.sql` is file-only — the owner may apply it in the SQL editor; **agents must not**. Abandoned project `iwxqemiqtusgmemlnrby` is unused. **Do not pause from an engineering PR.**

**CI hygiene shipped (engineering):** Deployed E2E on push to `main`; RLS verification fails closed when secrets missing; all workflows now run Node 22 via `.nvmrc`. Tracked in [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

0. **Phase 31 activation** (infra done; one owner check left — item 3):
   1. ~~Apply migrations / deploy Edge Functions~~ — done on `vhbsokjqchaafluimgjh` (2026-07-18). `00001`–`00010` are applied. Do not apply `00011` from an agent.
   2. ~~Assign first admin~~ — `msi-launch-admin@example.com` promoted (`npm run ops:promote-admin`). Promote a personal email the same way after signup.
   3. Confirm `/audit-trail/admin` + `audit.cross_user_read` row while signed in as an admin.
   4. ~~First key-rotation drill~~ — Supabase cutover logged in `plans/incidents/key-rotation-drill.md` (full multi-provider quarterly drill still needs Stripe staging keys).
1. ~~**RLS verification secrets**~~ — set; anon smoke green in July.
2. ~~**Server API auth on the deployment**~~ — `config.serverApiAuth: true` (confirmed with health `ok: true`).
3. ~~**Error telemetry**~~ — `/api/client-error` + `VITE_ERROR_REPORTING_URL` + `VITE_REQUIRE_TELEMETRY=true`. Optional: add `VITE_SENTRY_DSN` for Issues UI.
4. **Stripe lifecycle smoke** — needs Stripe test keys on Vercel (punch-list item 6). Restore is no longer the blocker.
5. ~~**GDPR endpoints**~~ — export E2E green on prod; delete cascade fixed (`profiles` before `auth.users`).

## Priority 2 — Turn on real data (eBay, then PSA)

**Prerequisite:** project is ACTIVE_HEALTHY and Vercel Supabase env is already present. Re-sync (`docs/DEPLOY_ENV_CHECKLIST.md`) only if those keys rotate. Do not set keys or flip `VITE_FF_REAL_*` from an engineering PR. Do not turn eBay and PSA on in the same change.

`npm run ops:check-real-data` is the owner readiness check once keys exist.

1. Set `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` + `VITE_FF_REAL_EBAY=true`; watch Deployed E2E + pricing-truth for a few days. Stale-comp fallback already labels `source: 'stale'`.
2. Then PSA on **both** runtimes (`PSA_API_KEY` on Vercel **and** Supabase `verify-psa-cert`) + `VITE_FF_REAL_PSA=true`. Cert badges and `/slab-verification` switch from demo/mock to live.

## Priority 3 — Last beta exit

- `fractional-vault`: legal/securities sign-off on the "Simulation only" disclosure. No engineering blocker — on approval, flip the catalog status.
- (`vision-grading` exited earlier: the image-handling decision matches `visual-audit` — in-session only, never persisted — and is pinned by tests.)

## Sustained dev experience (background, not blocking)

- Keep merging grouped dependency PRs promptly so they don't pile up. **No open pull requests as of 2026-10-12.** Latest safe patch/minor land is [#166](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/166) (`742bc5e`) from Dependency Guardian [#155](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/155). The weekly report ([#50](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/50) / #155) can stay open as an issue; that is not an open PR. Do not take majors that #166 excluded (`@eslint/js` 10, a `lucide-react` jump, another Tailwind major).
- Tighten coverage gates incrementally — every PR that crosses a service file should add it to the explicit whitelist in `vite.config.ts`.
- **Quarterly catalog sweep — completed 2026-09-05.** Next due ~2026-12. Features `beta` for 90+ days either go `live` or get hidden. `fractional-vault` is still the only remaining beta and is legal-gated.
- The first key-rotation drill is logged (Supabase cutover, `2026-07-18`). The **full multi-provider quarterly drill** still needs Stripe staging keys — it rolls up with Priority 1 item 4.
- Watch for `typescript-eslint` shipping native TS 7 support ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)); when it lands, the `@typescript/typescript6` alias in `package.json` can be dropped and `typescript` pointed straight at 7.x.

## What NOT to do next

1. **Don't add Labs features.** The surface is settled; the work is exits, not entries.
2. **Don't restructure directories.** The DAL and chunk graph are stable; churn buys nothing.
3. **Don't flip both real-data flags at once.** eBay first, observe, then PSA — the degraded-fallback paths get their first production exercise.
4. **Don't let `main` idle behind open PRs again.** The deployed-E2E gate exists precisely so merging is cheap. As of 2026-10-12 there are none.
5. **Don't pause Supabase from an engineering PR.** The project is ACTIVE_HEALTHY. Owner-held dashboard action only.
6. **Don't set real API keys or `VITE_FF_REAL_*` in git or in this class of PR.**
7. **Don't apply `00011_price_history_freshness_sla.sql` or `00013_profiles_username_login.sql`.** Both stay file-only until the owner chooses the SQL editor. `00013` is the username sign-in migration.
8. **Don't put secrets in git, jsPDF on live briefing paths, or live Market Movers / SCI parity claims in copy** before eBay is live.
9. **Don't start another Tailwind or ESLint major migration.** `tailwindcss` ^4.3.3 and `eslint` ^10.12.0 are already on `main`; `@eslint/js` stays 9.x.

## Key references

| Purpose                       | File                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Owner-held launch ops         | `docs/LAUNCH_OPS_PUNCH_LIST.md`                                                     |
| Env checklist (presence done) | `docs/DEPLOY_ENV_CHECKLIST.md` (unpause steps apply only if a future pause happens) |
| Beta status / criteria        | `docs/BETA_FEATURE_EXIT_CRITERIA.md`, `docs/BETA_EXIT_READINESS_PASS.md`            |
| Admin audit viewer design     | `plans/admin-audit-viewer-spec.md`                                                  |
| Key-rotation runbook          | `plans/incidents/key-rotation-drill.md`                                             |
| MVP launch scope              | `docs/MVP_LAUNCH_SCOPE.md`                                                          |
| Production rollout            | `docs/PRODUCTION_ROLLOUT_PHASES.md`                                                 |
| Rollback runbook              | `docs/ROLLBACK_AND_STABILIZATION.md`                                                |
| Coverage policy               | `docs/COVERAGE_POLICY.md`                                                           |
| Labs boundary                 | `lib/productionLaunch.ts`                                                           |
| Forward roadmap (post Wave-5) | `plans/PRODUCT_ROADMAP_2026Q4.md`                                                   |
| Feature inventory vs catalog  | `plans/FEATURE_ROADMAP_REVIEW.md`                                                   |
