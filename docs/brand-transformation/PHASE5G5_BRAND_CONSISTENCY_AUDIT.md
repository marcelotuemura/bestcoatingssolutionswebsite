# Phase 5G.5 — Brand Consistency Audit

**Status:** Approved · merged to `main`  
**Branch:** `cursor/phase-5g5-brand-consistency-audit-5ec4`  
**Base:** `main` (Phase 5G merged)  
**Date:** 2026-07-26

---

## Intent

Formal quality gate after Phases 5B–5G. Verify one design system, one claim discipline, and one CTA hierarchy across the public marketing experience before further feature work.

---

## Audit scope

| Area | Focus |
|------|--------|
| Design | Tokens, typography, buttons, editorial vs cards, motion |
| Content | Marine/Aviation terminology, EN/ES alignment, CTA wording |
| Brand | One company · two divisions · About complements homepage |
| Accessibility | Contrast, focus, reduced motion, language switcher |
| Performance | Build health; Lighthouse deferred where lab is unstable |
| Legal | Disclaimer, aviation scope, privacy/terms status |

---

## Findings & remediations

### Fixed in this phase

| ID | Severity | Finding | Remediation |
|----|----------|---------|-------------|
| D1 | P0 | Primary button hover/active dropped below AA (white on `#0a84ff` / `#3b9dff`) | Hover/active stay on darker pressed-blue family |
| D2 | P0 | Shared marketing kit still on `silver-*` / `electric-*` / `navy-*` | Migrated `ContentSection`, `PageHero`, `Breadcrumbs`, `EstimateCtaBand`, `FaqSection` to semantic tokens |
| D3 | P0 | Skip link used non-AA electric fill | `bg-accent-pressed` + semantic ring offset |
| C1 | P1 | Header/mobile always Estimate — conflicted with Aviation/About Contact hierarchy | Route-aware `HeaderPrimaryCta` + MobileNav primary CTA |
| C2 | P1 | ES `refinamiento` / `Coincidencia de color` drifted from division lexicon | Normalized to `refinación` / `Igualación de color` |
| C3 | P1 | About disclaimer heading hard-coded English | Localized `disclaimerHeading` |
| C4 | P1 | Contact meta under-sold Aviation | Meta + form lead updated |
| B1 | P1 | Projects empty state used pill chips | `ButtonLink` hierarchy |
| B2 | P1 | Projects list used card grid | Editorial divider list |
| B3 | P1 | FAQ / ProcessSteps used dashed cards | Editorial dividers |
| B4 | P1 | CTA band chrome mismatched homepage | Aligned to semantic card radius; `contact-cta` id when Contact mode |
| A1 | P1 | Language switcher on primitive tokens | Semantic tokens / control radius |
| A2 | P2 | Mobile nav hard-coded brand string | `siteConfig.name` |
| V1 | P2 | Aviation title casing vs Marine | `Aviation refinishing` |
| V2 | P2 | Homepage “repair shop” framing | Craftsman language EN/ES |

### Deferred (documented — not invented)

| ID | Severity | Finding | Why deferred |
|----|----------|---------|--------------|
| L1 | P0 | Privacy & Terms pages remain provisional / owner-legal placeholders | Requires owner + legal counsel — do not invent legal copy |
| L2 | P2 | Manufacturer spelling | **Resolved (RC):** owner-confirmed **Shaefer** |
| P1 | P2 | Full Lighthouse lab suite | Prior Phase 5D noted lab instability; unit/build/e2e used as gate |
| M1 | P2 | Official logo asset still pending | Temporary wordmark remains; Brand Standards Guide later |
| M2 | P2 | Orphan unused homepage dictionary sections (`whyBcs`, etc.) | Cleanup after Brand Standards Guide |

---

## Checklist results

### Design — Pass (with remediations above)

- [x] Typography hierarchy (Newsreader + Manrope)  
- [x] Semantic spacing/token direction on shared marketing primitives  
- [x] Accent/button AA resting + hover family  
- [x] Editorial dividers preferred over decorative cards on audited surfaces  
- [x] `prefers-reduced-motion` global coverage retained  

### Content — Pass

- [x] Marine restoration / refinishing language  
- [x] Aviation cosmetic-only + Contact CTA  
- [x] EN/ES terminology alignment (refinación / igualación)  
- [x] No banned endorsement claims on flagship surfaces  
- [x] CTA hierarchy enforced in header + page bands  
- [x] First name only  

### Brand — Pass

- [x] Marine + Aviation share division primitives  
- [x] About complements homepage (deepens, does not repeat journey)  
- [x] Tone remains calm / premium  

### Accessibility — Pass (engineering gate)

- [x] Skip link contrast  
- [x] Focus ring tokens on audited chrome  
- [x] Reduced-motion global kill-switch  
- [x] Language switcher semantic focus styles  
- [ ] Full manual keyboard audit of every secondary page — recommended in Brand Standards follow-up  

### Performance — Conditional pass

- [x] `pnpm build` / unit suite green  
- [ ] Production Lighthouse evidence — deferred (see P1)  

### Legal — Conditional pass

- [x] Employer/manufacturer disclaimer includes **authorization**  
- [x] Aviation exclusion language intact  
- [ ] Privacy/Terms substance — **owner/legal required** (L1)  

---

## Tests added

`tests/unit/phase5g5-brand-audit.test.ts` — CTA hierarchy, terminology, disclaimer, banned claims.

## Verification

| Command | Result |
|---------|--------|
| `pnpm test` | Pass (266) |
| `pnpm build` | Pass |
| Marketing e2e (phase3 / phase5 About+Projects / home CTAs) | Pass (26) |

Evidence: `/opt/cursor/artifacts/phase5g5-screenshots/`

---

## Suggested next

1. Owner/legal finalize Privacy & Terms (L1)  
2. Confirm manufacturer spelling (L2)  
3. After official logo lands: write `docs/brand-transformation/BRAND_STANDARDS.md` consolidating positioning, voice, typography, color, logo, photography, terminology, CTA hierarchy, a11y principles  

---

## Approval request

Approve Phase 5G.5 as the quality gate before Projects/Contact feature expansion or Brand Standards Guide drafting.
