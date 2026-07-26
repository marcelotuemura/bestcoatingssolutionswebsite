# Phase 3 — Copywriting Report

**Status:** Awaiting owner approval  
**Date:** 2026-07-26  
**Constraint honored:** Copy + minimal CTA wiring only. **No UI redesign.** Homepage section **order** unchanged (reorder deferred to UI phase).  
**Stop:** Do not start Phase 4 until approved.

---

## What changed (files)

| Area | Files |
|------|--------|
| Homepage / nav / CTAs / meta | `i18n/dictionaries/en.ts`, `es.ts` |
| Contact / estimate forms | `conversion-en.ts`, `conversion-es.ts` |
| Projects empty state | `phase5-en.ts` |
| About — Meet Marcelo | `content/about.ts` |
| All 8 marine services | `content/marine-services-en.ts`, `marine-services-es.ts` |
| Site description | `config/site.ts` |
| Craft pillars list | `config/trust.ts` |
| Hero secondary CTA → View Our Work | `components/home/HeroSection.tsx` (label + link to `/projects` only) |
| Tests | home / phase3 / phase5 / polish unit+e2e expectations |
| Working prompt | `WORKING_PROMPT_ADDENDUM.md` |

---

## Before → after (major)

### Homepage hero

| | Before | After |
|---|--------|--------|
| Headline | Precision coatings for vessels that demand excellence. | **Craftsmanship That Shows in Every Finish** |
| Support | Short South Florida tagline | Owner-approved craftsman paragraph (25+ years; automotive / aviation / marine → BCS) |
| Primary CTA | Request Free Estimate / Request an Estimate | **Request an Estimate** |
| Secondary CTA | Schedule Visit | **View Our Work** → `/projects` |

### Meet Marcelo (was Who We Are / About)

| | Before | After |
|---|--------|--------|
| Home section | Who We Are (company blurb) | **Meet Marcelo** (first-person craft) |
| About H1 | About Best Coatings Solutions | **Meet Marcelo** |
| Story | Company intro + anti-invention disclaimer | Japan → precision → Aisin Sin Ei (background) → marine shops (background) → aviation background → why BCS → every repair |

### Philosophy / craft (mapped onto existing sections)

| Section | Before | After |
|---------|--------|--------|
| Process block | Our Process (consult → deliver) | **Quality Is Built Before the Paint Is Applied** (inspect → prepare → repair & match → finish) |
| Why BCS chips | Why BCS + marketing pillars | **Built on Experience. Driven by Detail.** + process-led labels |

### Services

| Before | After |
|--------|--------|
| Feature lists + “Why Choose BCS” | Outcome leads + “Why proper … matters” / expectations |
| Gelcoat example lead: restore gloss… | **Restore damaged gelcoat while preserving the appearance and integrity of your boat’s original finish.** |

### Projects / contact

| Before | After |
|--------|--------|
| Portfolio framework language | Repair stories; honest empty state |
| Contact title: Contact Best Coatings Solutions | **Tell Us About Your Project** |
| Estimate title: Request a marine estimate review | **Request an Estimate** |

---

## Reasoning for major wording changes

1. **Trust in 15 seconds** — Hero now speaks as a craftsman with verified career length, not “excellence” marketing.  
2. **Show, don’t tell** — “Attention to detail” replaced with inspect / prepare / match / polish language.  
3. **Legal safety** — Employer and aircraft mentions framed as **background only**, with explicit non-endorsement language.  
4. **CTA psychology** — Estimate + View Our Work matches how owners begin; no urgency language.  
5. **Boat-owner first** — Meta and body written for people; keywords appear naturally (gelcoat, fiberglass, South Florida) without stuffing.  
6. **Services as outcomes** — Each page answers problem → approach → why it matters → expectations.  
7. **Spanish parity** — Natural craftsman ES, not literal marketing translation.

---

## Decisions needing owner approval

1. **Employer / OEM names on About** — Aisin Sin Ei, MarineMax, Nautical Ventures, HCB Yachts, Bombardier, military helicopters appear with non-endorsement wording. Confirm OK to publish.  
2. **First-person “I” on homepage + About** — Company remains named; Marcelo speaks. Confirm voice balance.  
3. **Hero supporting paragraph length** — Longer than luxury-minimal default; kept per your Phase 3 brief. Trim?  
4. **Homepage section order** — Content titles updated; **visual order not yet** Hero → Marcelo → Philosophy → Craft → Projects → Services…. Approve copy first, then UI reorder in a later phase.  
5. **Nav label “Meet Marcelo”** for About — Confirm vs keeping “About” in chrome.  
6. **Header tagline** — Now “Marine refinishing” (EN) / “Refinación marina” (ES). Confirm.  
7. **Aviation de-emphasis** — Still on homepage with Coming Soon; copy stresses not bookable.

---

## Explicitly not done (by design)

- UI redesign, typography, palette tokens  
- Homepage component reordering  
- Real photography swap (Phase 8)  
- New case-study content (needs real approved projects)  
- Phase 4 About UI redesign  

---

## Emotional goal check

Copy aims for:

> “I found someone who genuinely cares about doing the repair correctly.”

Not:

> “I found another contractor.”

---

## Approval gate

Approve Phase 3 copy (and the decisions above) before any Phase 4 UI work.
