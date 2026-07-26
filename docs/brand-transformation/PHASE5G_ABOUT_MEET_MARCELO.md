# Phase 5G — About: Meet Marcelo

**Status:** In review / awaiting approval  
**Branch:** `cursor/phase-5g-about-meet-marcelo-5ec4`  
**Base:** `main` (Phase 5F merged)  
**Date:** 2026-07-26

---

## Intent

Treat About as the culmination of the visitor journey — answering *who is the craftsman behind the standards already seen* — while keeping Best Coatings Solutions at the center. Not a résumé dump.

---

## Structure shipped

| Section | Purpose |
|---------|---------|
| Meet Marcelo | Concise intro + honest photo slot (workshop/project when approved) |
| Where it began | Japan · precision and consistency — short, not chronological dump |
| Experience across industries | Automotive, marine, aviation lessons — emphasis on standards learned |
| Why Best Coatings Solutions exists | Emotional center: preparation, honesty, respect, craft over shortcuts |
| Standards that guide every project | Diagnose · Prepare · Match · Communicate · Inspect |
| Professional background | Restrained timeline/list of employers & manufacturers + disclaimer |
| Closing invitation | Calm Contact CTA — discuss a project, not a hard sell |

---

## Claim discipline

- First name **Marcelo** only  
- Career chapter ends at **HCB Yachts** before BCS  
- Employer/manufacturer names are factual background only  
- Disclaimer includes: no endorsement, affiliation, **authorization**, or partnership  
- No FAA / authorized aviation facility implication  
- No stock photography inventing a shop floor  
- Unapproved owner facts remain hidden (`getApprovedAboutFacts()` empty)

---

## Background names included

Employers / associated manufacturing: Aisin Sin Ei; Toyota, Honda, Mitsubishi (associated environments); MarineMax; Nautical Ventures; HCB Yachts.

Vessel manufacturers (factual experience list): Azimut, Viking, Riva, Ferretti, De Antonio, Beneteau, Axopar, Sheaffer, HCB.

Aviation background: Bombardier business jets; military helicopters — cosmetic refinishing context only.

---

## Design notes

- Editorial layout (hierarchy, typography, spacing) — not card grids  
- Shared marketing primitives (`PageHero`, `ContentSection`, `EstimateCtaBand`)  
- Closing band uses `mode="contact"`  
- Photo slot uses marine texture + honest caption until real assets arrive  

---

## Review evidence

Artifacts: `/opt/cursor/artifacts/phase5g-screenshots/`

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm test` (incl. `phase5g-about`) | Pass (261) |
| `pnpm build` | Pass |
| E2E About (`phase5.spec` — About) | Pass (3) |

---

## Suggested next (owner)

**Phase 5G.5 — Brand Consistency Audit** before Projects/Contact polish: typography, shared components, spacing, CTA hierarchy, EN/ES alignment, terminology, claim hygiene, a11y/responsive.

---

## Approval request

Approve Phase 5G before Phase 5G.5 Brand Consistency Audit (or next owner-directed phase).
