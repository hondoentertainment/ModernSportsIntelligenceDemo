# UX Design Review — Modern Sports Intelligence (CardX)

**Review date:** March 2025  
**Framework:** Heuristics, accessibility (WCAG), and usability best practices.

---

## Executive summary

The app has a strong foundation: clear primary navigation (sidebar + mobile nav), consistent glass styling, and good use of toasts and loading states on key data pages. Top priorities are **keyboard and screen-reader accessibility** (skip link, focus-visible, nav/dialog semantics), **mobile touch targets and wayfinding** (aria-current, min 44px tap areas), and **dialog/header dropdown polish** (button types, menu roles). A first pass of UX cleanup has been applied (skip link, focus-visible, mobile nav, ConfirmDialog and Header dropdown).

---

## Strengths

- **IA & navigation:** Primary task (Scan / Dashboard / Compare / Alerts, etc.) is clear; sidebar and mobile nav share consistent entry points; active state on desktop sidebar (`aria-current="page"`).
- **Feedback:** Toasts for success/error; loading skeletons and error banners with Retry on data-heavy pages (e.g. Agent Outcome Memory, Catalyst Market, Public Portfolio).
- **Modals:** ConfirmDialog and AddAssetModal use `role="dialog"`, `aria-modal="true"`, and focus trap (ConfirmDialog via `useFocusTrap`).
- **Visual:** Consistent brand (lime/charcoal/slate); icon buttons have `aria-label` (e.g. sidebar toggle, Swarm, Wall HUD, Notifications).
- **Viewport:** No `user-scalable=no`; pinch-zoom allowed.

---

## Recommendations by area

| Area | Finding | Recommendation |
|------|--------|----------------|
| **Accessibility** | Keyboard users had no skip link. | ✅ **Done:** Skip-to-main link; visible on focus only. |
| **Accessibility** | Focus ring was inconsistent or absent. | ✅ **Done:** Global `:focus-visible` outline (lime, 2px) in `index.html`. |
| **Accessibility** | Main content landmark was implicit. | ✅ **Done:** `<main id="main-content" role="main">` for skip target and semantics. |
| **IA & navigation** | Mobile nav did not expose current page to assistive tech. | ✅ **Done:** `aria-current="page"` on active link; active logic matches nested routes. |
| **IA & navigation** | Mobile nav had no accessible name. | ✅ **Done:** `aria-label="Mobile navigation"` on `<nav>`. |
| **Mobile** | Mobile nav tap targets could be under 44px. | ✅ **Done:** `min-h-[44px] min-w-[44px]` and padding on nav links and Install button. |
| **Interaction** | ConfirmDialog buttons could submit forms. | ✅ **Done:** `type="button"` and `aria-label` on Cancel/Confirm. |
| **Interaction** | Header user dropdown menu items were not marked as menuitems. | ✅ **Done:** `role="menuitem"` and `type="button"` on Settings/Sign Out; decorative icons `aria-hidden`. |
| **Interaction** | User dropdown should close on Escape. | Consider adding `onKeyDown` (Escape) to close menu and return focus to trigger. |
| **Content** | Empty states on some frontier pages could be more actionable. | Add “What you can do here” or one primary CTA where relevant. |
| **Visual** | Some icon-only buttons lack tooltips. | Ensure `title` or `aria-label` everywhere (many already have it). |
| **Performance** | Long lists (e.g. inventory) could benefit from virtualization. | Consider virtualized lists if scrolling or DOM size becomes an issue. |

---

## Prioritized list

- **High (done this pass):** Skip-to-main link; focus-visible styles; main landmark; mobile nav aria-current and touch targets; ConfirmDialog button types and aria-labels; Header dropdown menuitem roles and button types.
- **Medium:** Escape to close user dropdown and focus return; consistent tooltips on all icon-only buttons; optional safe-area insets for notched devices on mobile nav.
- **Lower:** Empty-state copy and CTAs; list virtualization; deeper keyboard nav (e.g. arrow keys in command palette).

---

## Cleanup completed (this pass)

1. **App.tsx:** Skip link (first focusable, visible on focus); `<main id="main-content" role="main">`.
2. **index.html:** `:focus` outline removed; `:focus-visible` 2px lime outline + offset.
3. **MobileNav.tsx:** `aria-label="Mobile navigation"`; `aria-current="page"` on active link; active logic for nested routes; min 44×44px touch targets; Install button `type="button"` and `aria-label`.
4. **ConfirmDialog.tsx:** Cancel/Confirm `type="button"` and `aria-label` with label text.
5. **Header.tsx:** User menu items `type="button"`, `role="menuitem"`, `text-left`; decorative icons `aria-hidden`; duplicate lucide import removed.

---

---

## Subagent pass 2 (pipeline: IA → Interaction → Content → Visual → A11y → Mobile)

| Subagent | Changes |
|----------|---------|
| **IA** | `DocumentTitleSync` + `pageTitleForPath()`: tab titles for auth, nav, feature catalog, `/p/*`, and humanized slugs. |
| **Interaction** | Feature search: Escape from input; empty-results state with **Browse all features** CTA. Agent Outcome Memory empty state: **Open War Room** + **Back to dashboard**. User menu: Escape returns focus to trigger. Page loading: `role="status"`, `aria-live="polite"`, **Loading page…** (sr-only). |
| **Content** | Clearer no-match copy in feature search; friendlier Agent Outcome Memory empty copy. |
| **Visual** | Header icon row: 44×44px touch targets on small screens; Notifications `title`; Feature search trigger `title`. |
| **A11y** | Command palette / feature search: `aria-labelledby` + sr-only title inside focus trap; sync strip `role="status"` + `aria-live`; CommandPalette duplicate import fix + `type="button"` on options. |
| **Mobile** | Omni-search + feature search input `text-base md:text-sm` (reduces iOS zoom-on-focus). Bottom nav + page padding use `env(safe-area-inset-bottom)`. `prefers-reduced-motion` reduces animations globally. |

*For subagent definitions, see `.cursor/skills/ux-design-review/subagents.md`.*
