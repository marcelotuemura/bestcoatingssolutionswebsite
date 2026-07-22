# Accessibility

Target: **WCAG 2.1 AA** across the entire site and portal. Accessibility is a
requirement, not a phase.

## Commitments

- **Contrast:** all text meets AA (≥ 4.5:1 body, ≥ 3:1 large text). The dark
  palette in `DESIGN_SYSTEM.md` is chosen with this in mind; verify every new
  foreground/background pair.
- **Keyboard:** every interactive element is reachable and operable by keyboard,
  in a logical order, with a **visible focus indicator** (electric-500 ring). No
  keyboard traps.
- **Semantics:** correct landmarks (`header`, `nav`, `main`, `footer`), one
  `<h1>` per page, logical heading order, and `alt` text on all meaningful
  imagery.
- **Forms:** every field has an associated `<label>`; errors are announced and
  programmatically associated (RHF + Zod messaging).
- **Motion:** honour `prefers-reduced-motion`; homepage animation degrades to
  static. Smooth scrolling is already disabled under reduced motion in
  `app/globals.css`.
- **Color independence:** never rely on color alone to convey meaning.
- **Language:** `<html lang="en">` set in the root layout.
- **Zoom/responsive:** usable to 200% zoom; no horizontal scrolling at standard
  breakpoints.

## How we verify

- **Automated:** ESLint `jsx-a11y` rules (via `next/core-web-vitals`); optional
  `@axe-core/playwright` checks added with E2E as pages land.
- **Manual:** keyboard-only walkthrough, screen reader smoke test (VoiceOver /
  NVDA), and Lighthouse a11y audit per page.
- **Design review:** contrast checked at design time against the token palette.

## Definition of done (per page/component)

Keyboard operable, visible focus, AA contrast, correct semantics/labels,
reduced-motion respected, and a11y checks pass in review.
