# Customer Journey

How priority audiences move from discovery to a booked visit or estimate on the
BCS public website — and what the product must support at each step.

Related: [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md),
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md),
[`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md),
[`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md).

## Primary audiences

| Segment | Typical need | Preferred proof |
|---------|--------------|-----------------|
| Boat / yacht owners | Cosmetic or structural finish quality | Before/after, mobile convenience |
| Captains / yacht managers | Reliable scheduling, minimal downtime | Process clarity, communication |
| Brokers / marinas / shipyards | Trusted referral partner | Professionalism, area coverage |
| Aircraft owners / managers / FBOs | Permitted on-site or partner-facility work | Aviation-specific capability, care |

Service area: **South Florida, Jupiter southward**. Projects outside the normal
area may be considered by arrangement.

## Journey stages

```
Discover → Orient → Evaluate → Decide → Request → Confirm → (Future: Deliver)
```

### 1. Discover

**Entry points:** organic search, social (Instagram / Facebook), referral,
direct.

**Site jobs:**

- Load fast on mobile; clear brand and divisions.
- Locale: English or Spanish without SEO duplication errors.
- Unique metadata and local service-area cues.

### 2. Orient

**Jobs:**

- Homepage hero establishes BCS as premium marine + aviation specialist.
- Division picker routes to `/marine` or `/aviation`.
- Service area and languages spoken set expectations early.

**Success signal:** Visitor can answer “Is this for my boat/aircraft and my
location?” within one scroll.

### 3. Evaluate

**Jobs:**

- `/services` catalogue (no prices).
- `/projects` and before/after proof (real assets only).
- `/about` for credibility; `/service-area` for geography and travel policy.

**Guardrails:** no fake reviews; placeholders clearly labeled until owner assets
arrive.

### 4. Decide

**Jobs:**

- Reinforce mobile advantage and process.
- Dual CTAs everywhere they matter: **Request an estimate** and **Schedule a
  visit**.
- Estimate policy visible near conversion: free estimates **only in the Fort
  Lauderdale area**; other locations may need review or travel arrangements.

### 5. Request

| Path | Route | Outcome |
|------|-------|---------|
| Estimate | `/estimate-request` | Structured lead + media optional + consent |
| Visit | `/schedule-visit` | Preferred dates/windows + location + consent |
| General | `/contact` | Lightweight message |

Forms use React Hook Form + Zod, accessible on iPhone/iPad, spam-protection
architecture, email notification via a `services/` adapter (no duplicate CRM
logic in v1). Clear success and failure states.

### 6. Confirm

**v1:** On-page success state + email notification to the business (optional
auto-reply later).

**Not in v1:** authenticated portal status, live calendar booking against
production systems, or CRM writes beyond the notification adapter.

### 7. Deliver (future platform)

Post-sale project updates, documents, invoices, and appointments move to the
future customer portal and BCS operations platform — see
[`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md). The marketing site must not
pretend that portal exists unless an approved “Coming Soon” treatment is used.

## Conversion priorities

1. Estimate request (qualified lead with division + location + service need).
2. Schedule visit (on-site assessment intent).
3. Contact (general / partnership / press).
4. Social follow (relationship / proof over time).

Phone (`305-747-8352` once configured in `config/site.ts`) remains a first-class
escape hatch in header/footer/contact strip.

## Journey UX principles

- Mobile-first; large tap targets; no hover-only critical actions.
- One primary action per section; avoid competing promo clusters.
- Preserve locale when moving between pages and into forms.
- Never surprise the user with pricing or “always free” claims.
- Failure states teach recovery (retry, call, email).

## Measurement (launch)

- Funnel: landing → division/services/projects → form start → form success.
- CTA click-through on homepage and division pages.
- Locale split (EN vs ES).
- Form error rates and spam rejection rates.

Wire analytics through existing Vercel Analytics and future event hooks behind
`services/` if custom events are added — do not spray third-party tags without
approval.

## Definition of done (journey)

- A first-time mobile visitor in EN or ES can discover BCS, understand Marine vs
  Aviation, check the service area, and submit an estimate or visit request
  without dead ends.
- Playwright covers primary navigation and all three forms.
