# Customer Journey

This document describes **psychology**, not a page inventory. Every route,
section, animation, and CTA on the BCS site must support the emotional path
below.

Related: [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md), [`BRAND_GUIDE.md`](./BRAND_GUIDE.md),
[`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md), [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md).

## The funnel (emotional)

```
Visitor lands
    ↓
Feels impressed          ← WOW / brand / motion / craft
    ↓
Understands BCS          ← who we are, Marine + Aviation, mobile model
    ↓
Trusts quality           ← Why BCS pillars, process, professionalism
    ↓
Looks at projects        ← case studies, before/after, featured story
    ↓
Requests estimate        ← clear policy, easy form, no prices on page
    ↓
Schedules visit          ← preferred times, location, consent
    ↓
Receives email           ← business notification (+ optional auto-reply later)
    ↓
Becomes customer         ← offline delivery; portal comes later (FUTURE.md)
```

If a UI element does not move someone forward on this path (or reassure them
where they are), question it.

## Stage detail

### 1. Visitor lands

**Mindset:** Busy, skeptical of contractor sites, protecting a high-value asset.

**Must happen fast:**

- Instant sense of premium (dark navy, restraint, logo presence).
- Correct locale (EN/ES) without confusion.
- No clutter, no price shock, no fake testimonials.

**Homepage job:** Hero WOW within the first viewport
([`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md)).

### 2. Feels impressed

**Emotion:** “This is not a generic painter website.”

**Levers:**

- Logo animation, light sweep, reflective atmosphere.
- Full-bleed imagery / silhouettes — marine then aviation.
- Typography and whitespace that feel Apple-adjacent, not template.

**Failure mode:** Loud banners, emoji, purple gradients, card soup.

### 3. Understands BCS

**Emotion:** “I know who they are and that they do my kind of work.”

**Levers:**

- Who We Are — mobile service; South Florida; marine + aviation.
- Marine and Aviation sections with clear paths into division pages.
- Languages spoken (EN, ES, PT, JA) as hospitality, not a gimmick.
- Service area: Jupiter southward; travel by arrangement.

**Success test:** Visitor can answer “Do they serve my boat/aircraft and my
area?” without hunting.

### 4. Trusts quality

**Emotion:** “I would let them near my vessel / aircraft.”

**Levers (real trust only):**

- Why BCS pillars: Mobile Service, Professional Finish, Marine Specialists,
  Aircraft Specialists, Modern Equipment, Fair Pricing (no dollar amounts),
  Fast Response, Attention to Detail, Multilingual Team.
- Our Process — predictable, respectful of downtime.
- Optional portal “Coming Soon” preview — signals modern operations without
  pretending the product exists.
- Never invent reviews or star ratings.

### 5. Looks at projects

**Emotion:** “I’ve seen proof.”

**Levers:**

- Featured project story teaser on the homepage.
- Before/After slider (felt proof).
- `/projects` as **case studies** — Problem → Repair → Process → Photos →
  Time → Result → Customer (with permission). See
  [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md).

**Failure mode:** Stock photos, unlabeled placeholders presented as real work.

### 6. Requests estimate

**Emotion:** “Asking is safe and clear.”

**Levers:**

- Persistent CTAs; dedicated `/estimate-request`.
- Policy honesty: free estimates **only in the Fort Lauderdale area**; other
  locations may need review or travel arrangements.
- Form: division, contact, asset info, location, service, timing, media,
  consent — accessible on iPhone/iPad.
- No prices on the site.

### 7. Schedules visit

**Emotion:** “I can get someone on-site.”

**Levers:**

- `/schedule-visit` with dates, time window, location, division, media, consent.
- Same spam protection and email adapter pattern as estimate.
- Phone `305-747-8352` as human escape hatch.

### 8. Receives email

**Emotion:** “They got it; someone will respond.”

**v1:**

- Business receives notification via `services/notifications`.
- On-page success state is calm and premium.
- Optional customer auto-reply later (see [`FUTURE.md`](./FUTURE.md)).

**Not v1:** CRM duplication, portal inbox, SMS, push.

### 9. Becomes customer

Happens through real-world delivery. The website’s job ends at qualified intent
and clear follow-up. Post-sale tracking, invoices, approvals, and payments belong
to the future portal — teased at most, never faked.

## How pages serve the funnel

| Psychology stage | Primary surfaces |
|------------------|------------------|
| Impressed | `/` hero |
| Understands | `/` Who We Are, Marine, Aviation; `/marine`, `/aviation`, `/about`, `/service-area` |
| Trusts | `/` Why BCS, Process; `/about`; portal preview |
| Looks at projects | `/` Featured + Before/After; `/projects`, optional `/before-after` |
| Requests estimate | `/estimate-request`; CTAs sitewide |
| Schedules visit | `/schedule-visit` |
| Contact / edge cases | `/contact`, phone, social |
| Receives email | Server action success + email adapter |

## Audience nuances

| Audience | Trust trigger | Proof they seek |
|----------|---------------|-----------------|
| Owners | Care of asset, finish quality | Before/after, attention to detail |
| Captains / managers | Reliability, communication | Process, response speed |
| Marinas / yards / brokers | Referral safety | Professionalism, consistency |
| Aircraft / FBOs | Permission-aware, precision | Aviation capability, clean work |

Tone stays the same; emphasis shifts.

## Anti-patterns (psychology breaks)

- Leading with price or “cheapest.”
- Claiming all estimates are free.
- Fake reviews.
- Portal UI that looks logged-in.
- Forcing the visitor to decode a dashboard-style homepage.
- Animation that entertains but delays understanding.

## Measurement aligned to emotion

Track progression, not vanity:

1. Land → scroll past hero (impressed → understand)  
2. Division or services engagement  
3. Case study / before-after engagement  
4. Form start  
5. Form success  
6. (Later) offline win-rate from CRM — not invented on the marketing site  

## Definition of done

A first-time mobile visitor can feel impressed, understand BCS, find reasons to
trust, see proof, and request an estimate or visit — in either English or Spanish —
without dead ends or deceptive claims.
