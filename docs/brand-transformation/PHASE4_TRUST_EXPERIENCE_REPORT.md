# Phase 4 — Trust Experience Report

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-4-trust-experience-5ec4`  
**Date:** 2026-07-26

---

## Goal

Make the site answer, immediately:

> “Can I trust these people with my boat?”

This phase builds trust architecture — not a full visual redesign of every page.

---

## Phase 3 decisions applied

| Decision | Implementation |
|----------|----------------|
| Employer / OEM names (factual only) | About uses “work performed while employed by…” / “contributed to refinishing work…” |
| About disclaimer | Footer of About story: no endorsement, affiliation, or partnership implied |
| First person “I” | About + shortened homepage hero; craft sections in first person |
| Short hero paragraph | Two sentences; curiosity over full biography |
| Nav label **About** | Primary nav = About; page/section title = Meet Marcelo |
| No header tagline | Header tagline removed; logo + nav only |

---

## Trust architecture

### Homepage order

1. Hero (short first-person support)
2. Meet Marcelo (+ honest photo slot)
3. Philosophy — *Quality Is Built Before the Paint Is Applied*
4. Craft — *Built on Experience. Driven by Detail.*
5. Craftsmanship principles — *Every Repair Begins the Same Way* (four questions)
6. What You Can Expect (seven-step customer journey)
7. Featured Work (honest empty / placeholder framing)
8. How We Can Help (services)
9. Service Area
10. Request an Estimate

**Removed from homepage (trust clarity):** Aviation teaser, Before & After placeholder demo.

Before/After interactive demo remains on `/before-after` until real pairs exist.

### About page

- Meet Marcelo hero (first person)
- Authentic photography slot (labeled; no stock)
- Origin story (Japan → manufacturing refinishing)
- Career path (MarineMax, Nautical Ventures, HCB; aviation background factual)
- Philosophy
- Craftsmanship principles
- What You Can Expect
- Marine focus + how I work
- Values
- Employer/manufacturer disclaimer
- Aviation Coming Soon (de-emphasized)
- Natural estimate CTA

---

## Visual storytelling (honest)

No approved owner photography is in the repo yet. Placement slots exist on Home (Meet Marcelo) and About with explicit notes that stock will not invent a shop floor. Temporary marine silhouette remains hero atmosphere only and is not labeled as project work.

---

## CTAs

Primary: **Request an Estimate** · **View Our Work**  
Meet Marcelo section CTA uses story language (“Meet Marcelo”), not the nav label.

---

## i18n

English and Spanish dictionaries keep parity for new trust sections (philosophy, craft principles, journey, About disclaimer).

---

## Tests

- Unit: About career wording, disclaimer, principles (4), expect steps (7)
- E2E homepage: trust section order, nav About, no header tagline, aviation/before-after absent from home
- E2E About: principles, journey, disclaimer, photo slot
- Before/after slider tests moved to `/before-after`

---

## Explicitly not in Phase 4

- Full visual redesign of every page
- Stock photography substitution
- Invented reviews, certifications, or partnerships
- Training Corpus / Media Phase 8

---

## Owner stop gate

Please review the live trust experience on Home + About.

**Approve Phase 4** before any broader UI redesign (Phase 5+).
