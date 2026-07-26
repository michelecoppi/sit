# Light/Dark Mode Visual Audit and Fix

## Objective

Perform a complete visual and functional audit of the SIT frontend theme system, with particular attention to **light mode**.

The theme toggle already allows users to switch between light and dark mode, but several pages and components still contain hard-coded dark backgrounds, dark gradients, borders, shadows, or text colors that do not adapt correctly.

The goal is not to redesign the application. The goal is to make the existing interface fully coherent, readable, accessible, and visually polished in both themes without reducing performance or changing existing behavior.

---

## Main Problems Already Identified

These examples are confirmed starting points, not the complete scope of the task.

### 1. Public capsule: `Symbolic content`

In the public capsule page, the `Symbolic content` payload area remains very dark in light mode.

Current behavior:

- the payload container uses a fixed dark background;
- the content can appear visually disconnected from the rest of the light page;
- depending on surrounding styles and payload rendering, readability and visual hierarchy are poor;
- the component does not feel like a native light-mode surface.

Expected behavior:

- in light mode, use a light or neutral code-surface background with high-contrast dark symbolic text;
- in dark mode, preserve an appropriate dark code-surface appearance;
- retain monospaced typography, scrolling, copy behavior, payload integrity, and responsive layout;
- make sure long symbolic strings remain readable and do not overflow the page.

Relevant area:

- `src/pages/CapsulePublicPage.tsx`
- section titled `Symbolic content`
- authoritative payload `<pre>` container

### 2. Home page: `live_encoder.sit`

The `live_encoder.sit` card on the Home page remains predominantly black or very dark in light mode and visually clashes with the rest of the page.

Expected behavior:

- provide a dedicated light-mode visual treatment for the entire encoder console;
- update the console chrome, body, input, output, status bar, labels, borders, icons, and buttons together;
- do not simply change the outer background while leaving dark internal sections unchanged;
- maintain the terminal-inspired identity without making the card look like a dark-mode island;
- preserve the current dark-mode appearance unless a small adjustment is required for consistency or contrast.

Relevant areas:

- `src/pages/HomePage.tsx`
- `live_encoder.sit`
- related styles in `src/index.css`

### 3. SIT Native cards in Playground 1.0 and 2.0

Cards and panels related to SIT Native in both Playground editions still use dark colors or dark gradients in light mode.

Expected behavior:

- identify all SIT Native cards, result panels, informational cards, previews, examples, token displays, and action surfaces in Playground 1.0 and 2.0;
- replace hard-coded dark styling with theme-aware styling;
- light mode should use coherent light surfaces, readable dark text, subtle borders, and restrained accents;
- dark mode should remain coherent and readable;
- preserve the visual distinction between SIT 1.0 and SIT 2.0 without relying on permanently dark cards.

Relevant starting points:

- `src/pages/PlaygroundPage.tsx`
- SIT 2.0/native playground components and pages
- shared card or panel classes used by both editions

---

## Required Audit Scope

Do not fix only the three examples above. Review the complete frontend for theme inconsistencies.

Audit at least:

- Home
- Playground 1.0
- Playground 2.0 / SIT Native
- Public capsule page
- Private or authenticated capsule views, where present
- Dashboard and profile-related pages
- Documentation pages
- Alphabet, grammar, dictionary, and semantic pages
- Authentication pages and dialogs
- Navigation, footer, menus, dropdowns, badges, tooltips, modals, alerts, empty states, loading states, and error states
- Inputs, textareas, selects, buttons, tabs, code blocks, preformatted output, tables, cards, panels, and nested cards

Search for hard-coded theme-sensitive utilities and CSS declarations such as:

- `bg-slate-950`, `bg-slate-900`, `bg-black`
- dark gradients applied without light-mode alternatives
- `text-white`, `text-slate-100`, or other light text without a corresponding light-mode surface
- dark borders or rings used in both themes
- fixed inline colors
- custom CSS selectors that do not react to the `.dark` class or current theme attribute
- pseudo-elements, overlays, shadows, and decorative gradients that remain too dark in light mode

A fixed dark surface is acceptable only when it has a clear semantic reason, such as a deliberate terminal/code preview. Even in that case, confirm that it is visually compatible with light mode and that contrast is accessible. Prefer a theme-aware version unless the dark treatment is essential to the component identity.

---

## Implementation Requirements

### Theme-aware styling

- Use the existing theme mechanism and Tailwind dark variants or existing CSS theme selectors.
- Avoid introducing a second competing theme system.
- Prefer reusable theme tokens, shared component classes, or CSS custom properties when multiple components use the same surface.
- Avoid duplicating large style strings when a shared abstraction improves consistency.
- Do not add runtime-heavy theme libraries.
- Do not add unnecessary JavaScript for styling that can be handled through CSS or Tailwind.

### Readability and accessibility

For every corrected component, verify:

- text remains readable in both themes;
- labels, placeholders, secondary text, disabled text, and metadata have sufficient contrast;
- borders are visible but not excessively strong;
- focus states remain visible;
- hover and active states work in both themes;
- links and buttons are clearly distinguishable;
- selected tabs and controls remain obvious;
- code and symbolic payloads are legible;
- status colors such as success, warning, and error remain understandable in both themes.

Target WCAG AA contrast where practical:

- at least 4.5:1 for normal text;
- at least 3:1 for large text and meaningful non-text UI indicators.

### Visual consistency

Light mode should generally use:

- white, slate, or lightly tinted surfaces;
- dark slate text;
- subtle neutral borders;
- soft shadows and restrained gradients;
- accent colors that remain readable on pale backgrounds.

Dark mode should generally use:

- existing dark slate surfaces;
- light text with appropriate hierarchy;
- visible borders and focus states;
- gradients that do not crush contrast.

Do not make every card pure white. Preserve hierarchy through subtle differences between page background, main cards, nested panels, input areas, and output areas.

---

## Theme Toggle Behavior

Verify the theme toggle itself and the resulting state transitions.

The following must work:

1. Switch from light to dark mode on every major route.
2. Switch from dark to light mode on every major route.
3. No full page reload is required.
4. No component remains stuck in the previous theme.
5. The selected theme persists according to the current application behavior.
6. Reloading the page does not create a visible flash of the wrong theme beyond what the current architecture can reasonably avoid.
7. Navigating between routes preserves the selected theme.
8. Browser back/forward navigation does not reset or corrupt the theme.
9. Modals, dropdowns, tooltips, and dynamically rendered content inherit the active theme.
10. Content loaded after an API request uses the correct theme immediately.

---

## Manual Test Matrix

Test at minimum on these viewport widths:

- mobile: approximately 375 px
- tablet: approximately 768 px
- desktop: approximately 1440 px

For each viewport, test both light and dark mode.

### Home page

- `live_encoder.sit` outer card
- title bar and status area
- input and placeholder
- encoded output
- copy button and copied state
- capability cards
- registry links
- performance panel
- call-to-action section

### Public capsule

- loading state
- unavailable/error state
- header
- `Symbolic content` payload panel
- decoded interpretation panel
- copy feedback
- action buttons
- long payload scrolling
- SIT 1.0 and SIT 2.0 capsules

### Playground 1.0

- every tab
- input panels
- output panels
- copy/download controls
- validation messages
- success and error feedback
- capsule save controls
- empty and long values

### Playground 2.0 / SIT Native

- every native card and panel
- token and symbolic displays
- encoding and decoding results
- examples and explanatory content
- interactive controls
- nested cards
- success, warning, error, and empty states

### Global UI

- header and navigation
- theme button
- mobile menu
- footer
- dialogs and dropdowns
- forms
- page-level loaders
- toast or inline feedback
- focus-visible navigation using the keyboard

---

## Automated Testing

Add or update tests where the current test stack makes this practical.

At minimum, tests should confirm:

- the theme toggle changes the root theme state/class correctly;
- the selected theme persists through route changes;
- critical components render their expected light and dark variants;
- no regression breaks existing interactions in the Home encoder, capsule payload actions, or playground controls.

If visual regression tooling already exists, add snapshots for the key examples.

If it does not exist, do not introduce a heavy new framework solely for this task. Prefer focused component/integration tests and document the manual visual checks performed.

---

## Acceptance Criteria

The task is complete only when all of the following are true:

- [ ] The `Symbolic content` section in a public capsule is clearly readable and visually coherent in light mode.
- [ ] The `live_encoder.sit` Home card has a complete light-mode treatment, including all nested elements.
- [ ] SIT Native cards in Playground 1.0 and 2.0 no longer appear as unintended dark-mode surfaces in light mode.
- [ ] All major routes have been checked in both themes.
- [ ] No unreadable dark-on-dark, light-on-light, or low-contrast text remains in the audited pages.
- [ ] Hover, active, focus, selected, disabled, success, warning, and error states work in both themes.
- [ ] The theme toggle works without reload and preserves state across navigation.
- [ ] Mobile, tablet, and desktop layouts have been checked.
- [ ] Existing functionality remains unchanged.
- [ ] No unnecessary dependency or performance regression is introduced.
- [ ] Relevant automated tests pass.
- [ ] Build, lint, and test commands pass, or any pre-existing unrelated failure is clearly documented.

---

## Non-Goals

Do not:

- redesign the entire SIT visual identity;
- change application behavior unrelated to theming;
- remove the dark theme;
- replace the existing theme toggle architecture without a demonstrated technical need;
- introduce large UI libraries or theme dependencies;
- alter encoding, decoding, capsule, authentication, or API logic;
- solve the issue by forcing every component to use the same background color.

---

## Deliverables

The pull request implementing this task should include:

1. Theme-aware style fixes across all affected pages and shared components.
2. Refactoring of repeated theme-sensitive styles when useful.
3. Tests for critical theme behavior where supported by the existing test stack.
4. A concise PR summary listing the audited routes.
5. Before/after screenshots for the three main examples in both light and dark mode:
   - public capsule `Symbolic content`;
   - Home `live_encoder.sit`;
   - SIT Native cards in Playground 1.0 and 2.0.
6. A manual test report covering mobile, tablet, and desktop viewports.

---

## Suggested Implementation Order

1. Inspect the current theme provider/root class and persistence logic.
2. Identify shared surface, text, border, code-block, and nested-card patterns.
3. Fix the three confirmed examples.
4. Audit all remaining routes for hard-coded dark styling.
5. Refactor repeated styles into shared tokens or classes where appropriate.
6. Test all routes in both themes and at the required viewport sizes.
7. Run build, lint, and tests.
8. Document screenshots and manual validation in the implementation PR.
