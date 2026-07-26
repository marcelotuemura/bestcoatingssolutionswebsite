# Best Coatings Solutions — Brand Standards

**Audience:** Anyone editing the public website, copy, or design system.  
**Status:** Phase 6 baseline (post 5G.5 approval)  
**Authority:** This guide consolidates Phases 1–5G.5. If older docs conflict, **this file + `WORKING_PROMPT_ADDENDUM.md` win** until revised at a stop gate.

---

## 1. Brand positioning

Best Coatings Solutions is a **premium marine and aviation refinishing** company in South Florida.

- **Marine** is the primary commercial division.  
- **Aviation** is a real, visible division limited to **exterior cosmetic refinishing**.  
- One company · one design system · two atmospheres.

**Positioning feeling:** craftsman atelier — not contractor marketplace, not SaaS dashboard, not brochure spam.

---

## 2. Mission & philosophy

**Emotional center:** Careful preparation, honest recommendations, respect for the owner’s investment, craftsmanship over shortcuts.

**Standards that guide every project:**

1. Diagnose before repairing  
2. Prepare before finishing  
3. Match the surrounding surface carefully  
4. Communicate honestly  
5. Inspect before completion  

**Craftsman test:** Does this sound like a real craftsman speaking to an owner? If not, rewrite.

---

## 3. Tone of voice

| Be | Never be |
|----|----------|
| Honest, calm, professional, respectful, craftsman-like | Corporate, flashy, aggressive, salesy, cheap |

- Prefer short sentences and concrete nouns (gelcoat, hull, color match, masking).  
- Company stays the hero; **Marcelo** is the craftsman behind the standards.  
- **First name only** — never publish the last name.  
- No urgency tricks or exclamation marks as persuasion.

Full voice detail: `PHASE2_BRAND_VOICE_GUIDE.md`.

---

## 4. Approved terminology

### Marine

Use: restoration · refinishing · cosmetic repair · surface quality · color matching · gelcoat · fiberglass · preparation · finish inspection  

### Aviation

Use: exterior cosmetic refinishing · paint restoration · composite surface restoration · surface preparation · color matching · finish correction  

### Spanish controlled glossary

| Concept | Preferred ES |
|---------|----------------|
| Refinishing | **refinación** |
| Color matching | **igualación de color** |
| Craftsman | artesano / oficio (context) |

Avoid literal ES drift: do not use *refinamiento* or *coincidencia de color* for those concepts.

---

## 5. Prohibited marketing language

Do **not** use (or near-equivalents):

- Industry-leading · state-of-the-art · unmatched · unbeatable · #1 · world-class  
- Trusted partner · trusted by · partnered with · factory certified · authorized by  
- Award-winning · guaranteed invisible · one-stop solution  
- Cutting-edge · customer satisfaction is our priority (as filler)

Never invent: certifications, awards, partnerships, endorsements, reviews, founding myths, FAA/repair-station status, airworthiness, structural/mechanical aviation maintenance.

---

## 6. Typography

| Role | Family | Token / load |
|------|--------|----------------|
| Display headings | **Newsreader** | `--font-display` via `next/font` |
| Body / UI / buttons | **Manrope** | `--font-sans` via `next/font` |

Do not introduce Inter, Roboto, Arial, or system stacks as primary brand type.

---

## 7. Color system

Prefer **semantic tokens** in `app/globals.css`:

`bg-primary` · `bg-secondary` · `surface` · `accent` / `accent-hover` / `accent-pressed` · `text-primary` / `text-secondary` / `text-muted` · `border` · `focus-ring`

Accent = logo electric blue — use sparingly.  
Primary filled buttons must keep **AA contrast (≥4.5:1)** on resting, hover, and active (pressed-blue family).

Primitives (`navy-*`, `electric-*`, `silver-*`) are legacy-compatible; **new marketing UI should use semantic tokens**.

---

## 8. Spacing, radius, motion

- Calm section rhythm (`py-16 sm:py-24` on major bands).  
- Radius: control `0.5rem` · media `0.125rem` · card `0.75rem`.  
- Motion: premium ease, short durations; honor `prefers-reduced-motion`.  
- Avoid dashboard multi-shadow / glow / pill-cluster noise.

---

## 9. Component rules

- **Cards:** default no cards. Editorial dividers and hierarchy first. Cards only when they aid interaction. Never cards in heroes.  
- **Division pages:** shared `DivisionHero` + `DivisionProcess`; differentiate via atmosphere, photography, copy.  
- **Heroes:** full-bleed / dominant visual plane; brand-forward; one headline + short support + CTA group.  
- **Forms:** labeled fields, associated errors, honest scope notices.

---

## 10. Marine & Aviation content guidelines

| | Marine | Aviation |
|--|--------|----------|
| Process | Inspection → Preparation → Repair → Surface finishing → Color matching → Final inspection | Assessment → Surface preparation → Composite refinement → Paint restoration → Finish inspection |
| Primary CTA | Request an Estimate | Contact / Tell Us About Your Project |
| Atmosphere | Water, hull, gelcoat, organic curves, sunlight | Precision, metallic, composite, controlled light, tight tolerances |

Aviation must never imply regulated maintenance, FAA authorization, structural, engines, avionics, or flight-critical work.

---

## 11. Photography direction

- Real BCS photography before stock.  
- Honest empty/photo slots until approved assets exist — never invent a shop floor.  
- Placeholders must be labeled as temporary / not project photography.  
- Future: Process Highlights (one–two authentic images with short captions).

---

## 12. Logo usage

| Role | Treatment |
|------|-----------|
| Header | Compact wordmark / official compact mark when file lands |
| Footer / brand moments | Full mark |
| Temporary SVG | Evaluation only — **never** treat as official |
| Forbidden | Auto-trace, invent simplified marks, employer/OEM logos |

Drop official file at `public/brand/bcs-logo-official.svg` (or `.webp` / `.png`). Resolver: `config/brand-logo.ts`.

---

## 13. CTA hierarchy

| Context | Primary | Secondary |
|---------|---------|-----------|
| Default / Marine / Estimate flows | Request an Estimate | Call / View work as appropriate |
| Aviation · About | Contact (conversation) | Call / Estimate as secondary |

Implemented via `config/cta-hierarchy.ts` + `HeaderPrimaryCta`.

---

## 14. Accessibility principles

Target: **WCAG 2.1 AA** (`ACCESSIBILITY.md`).

- Visible focus rings · keyboard operability · one H1 · labeled forms  
- AA contrast including interactive states  
- `prefers-reduced-motion`  
- Correct `lang` / language switching  
- Meaningful alt text; decorative images empty alt  

---

## 15. SEO writing guidelines

- Natural language; no keyword stuffing  
- Unique titles/descriptions within length guidance  
- Honest scope in metadata (Marine + Aviation where relevant)  
- Canonical + hreflang via shared metadata helpers  
- Do not publish fake portfolio or review schema  

---

## 16. Translation guidance

- Semantic equivalence over literal translation  
- Pass the craftsman test in Spanish  
- Keep EN/ES key structure aligned  
- Use the controlled glossary above  

---

## 17. Legal wording conventions

| Topic | Convention |
|-------|------------|
| Employers / OEMs | “while employed by…” / factual background only |
| Disclaimer | No endorsement, affiliation, **authorization**, or partnership |
| Career timeline | Ends at **HCB Yachts** before BCS |
| Aviation | Explicit non-authorization / cosmetic-only exclusions |
| Privacy / Terms | Owner + legal review before production — never invent final legal language |
| Estimates | Free estimates only Fort Lauderdale area; forms ≠ binding quotes |

---

## 18. Change control

1. Prefer small PRs that preserve consistency.  
2. Ask: *Does this improve launch quality without compromising consistency, credibility, or premium positioning?*  
3. Stop for owner approval on brand-facing phases.  
4. Update `LAUNCH_READINESS_MATRIX.md` when launch blockers change.  
5. Update this file when a locked decision changes.
