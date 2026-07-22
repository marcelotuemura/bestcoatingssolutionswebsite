# Brand Guide

**Brand manual** for Best Coatings Solutions (BCS) — the full identity system for
digital and physical touchpoints. Applied web tokens remain in
[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and `app/globals.css`; this document is
the source of meaning, usage, and extension beyond the website.

Related: [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md), [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md),
[`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md), [`FUTURE.md`](./FUTURE.md).

---

## 1. Brand essence

**Positioning:** Premium local specialist — mobile marine and aviation coatings,
refinishing, and composite repair.

**Feel:** Apple-inspired simplicity × high-end luxury × technical credibility.
Closer to Feadship / Gulfstream restraint than loud trade advertising.

**Promise:** Care for high-value assets with professional finish, modern methods,
and respectful mobile service.

**Brand test:** If a surface could belong to any contractor after removing the
name, branding is too weak.

---

## 2. Naming

| Form | Use |
|------|-----|
| **Best Coatings Solutions** | Primary legal / hero / formal |
| **BCS** | Compact UI, metadata templates, logo lockups, apparel marks |
| **Best Coatings Solutions (BCS)** | First mention in long-form when helpful |

Do not invent alternate spellings, “Best Coating,” or meme abbreviations in
public materials.

---

## 3. Logo usage

- Primary mark: follow the **uploaded BCS logo identity** (SVG master).
- Clear space: minimum padding ≈ height of the mark’s primary letterform on all
  sides (refine when final SVG geometry is locked in `docs/branding/`).
- Minimum size: legible favicon-derived mark ≥ 16px; full lockup not below
  readability on mobile headers.
- Variants: full color on navy; monochrome silver/white on dark; dark mark only
  on light documents (invoices/PDFs) when needed.
- **Do not:** stretch, recolor outside palette, add drop shadows, place on busy
  photography without scrim, rotate casually, or enclose in low-contrast chips.
- Favicon / app icon: simplified mark on `navy-900`.
- Animation: path reveal + light sweep only per [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md).

---

## 4. Color system

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Atmosphere | `navy-950` | `#050d18` | Page / wrap fields |
| Primary dark | `navy-900` | `#0a1a2f` | Surfaces, theme |
| Raised | `navy-800` | `#0f2340` | Panels |
| Border | `navy-700` | `#163254` | Hairlines, hovers |
| Accent hover | `electric-400` | `#3b9dff` | Highlights |
| Accent | `electric-500` | `#0a84ff` | CTAs, focus, light |
| Accent press | `electric-600` | `#0066cc` | Active |
| Text primary | `silver-100` | `#f4f6f8` | Body on dark |
| Text secondary | `silver-300` | `#cbd3dc` | Supporting |
| Text muted | `silver-500` | `#9aa7b5` | Captions |
| Emphasis | White | `#ffffff` | Headlines / metal |

**Modifiers:** glass (translucency + blur), metal (silver→white gradients) —
sparingly.

**Avoid:** purple-on-white AI defaults, cream+terracotta brochure clichés,
rainbow gradients, neon overload.

Print approximation: specify coated navy/electric equivalents when producing
wraps and signage; keep electric accents limited so vinyl stays premium.

---

## 5. Typography

- Web: purposeful premium sans via `next/font` (foundation uses Inter —
  **confirm keep vs upgrade** before Phase 1 polish).
- Scale: confident headings, generous body line-height; `text-balance` on
  headlines.
- Weights: mostly 400–600; heavier only for rare hero moments.
- Print / PDF: match web family if licensed; otherwise approved substitute with
  similar metrics — document the substitute here when chosen.
- Never use Comic-style, script novelty, or generic “construction yellow”
  display fonts.

---

## 6. Spacing & layout

- Mobile-first; luxury = whitespace.
- 4px spacing grid (Tailwind scale).
- Soft radius (`rounded-xl` / `2xl`) for interactive containers; not bubble-app
  pills everywhere.
- Elevation: hairline borders + subtle gradients over heavy multi-shadow stacks.
- **Default: no cards.** Cards only when they containerize real interaction.
- No cards in the hero. No floating badges on hero media.
- Full-bleed heroes on promotional surfaces.

---

## 7. Iconography

- Minimal line icons; consistent stroke weight.
- Trust pillars and process steps may use icons — keep a single set.
- Do not mix filled cartoon icons with thin technical strokes.
- Prefer inline SVG; no mega icon packs that bloat the brand.

---

## 8. Photography

Full standard: [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md).

Brand summary: real work, reflection/gloss, drone/exterior/interior/night/
waterline/macro/gelcoat/process/before/after/timelapse/video, plus social crops
(vertical, horizontal, Instagram, thumbnail). Permission and honesty required.

---

## 9. Motion & animation

Homepage only for premium choreography. Catalogue (logo, light sweep, ocean
texture, glass, section transitions, button/card hover, image reveal,
before/after slider, parallax, loading) lives in
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md).

Elsewhere: static, fast. Always honour `prefers-reduced-motion`.

---

## 10. Voice & tone

**Voice:** Confident, precise, understated — aerospace and superyacht register.

**Tone shifts slightly by channel:**

| Channel | Tone |
|---------|------|
| Website | Calm authority; short sentences |
| Estimate/schedule emails | Clear, courteous, specific next step |
| Instagram | Visual-first; sparse captions; craft over hype |
| Facebook | Same brand; slightly more explanatory if needed |
| Invoices / PDFs | Neutral professional; no marketing fluff |

**Do:** craftsmanship, protection, restoration, mobility, Fort Lauderdale
estimate honesty.  
**Don’t:** “#1 cheapest,” fake urgency, fake reviews, displayed prices, “free
estimates everywhere.”

**Languages:** Business speaks English, Spanish, Portuguese, Japanese.  
**Site UI v1:** English and Spanish.

---

## 11. Trust messaging

Approved trust pillars (Why BCS) — real capabilities, not testimonials you do
not have:

Mobile Service · Professional Finish · Marine Specialists · Aircraft Specialists ·
Modern Equipment · Fair Pricing · Fast Response · Attention to Detail ·
Multilingual Team

---

## 12. Digital product UI

- Dark navy system on marketing site.
- Focus rings `electric-500`; AA contrast.
- Forms: spacious, iPhone/iPad friendly, labeled errors.
- Portal (future): same tokens and components — see [`FUTURE.md`](./FUTURE.md).
- Portal “Coming Soon” homepage tease: one static mock max; never fake logged-in
  data.

---

## 13. Social media

- Channels live at launch: Instagram, Facebook (URLs in `config/site.ts`).
- Prepare TikTok and others in config without implying they are live.
- Avatar: logo on navy. Cover: reflection/hero still, minimal type.
- Grid: dark, glossy, consistent grade; watermark only if subtle and on-brand.
- Do not ship loud sticker memes or unrelated trending audio that breaks luxury
  positioning.

---

## 14. Business cards

- Navy field, silver/white type, electric accent line optional.
- Front: logo + name + role. Back: phone, email, site, Instagram/Facebook,
  Marine + Aviation cue, service area line.
- QR optional → site or contact; test contrast.
- Soft-touch or matte premium stock preferred over glossy cheap plastic feel.

---

## 15. Vehicle wraps

- Large logo + “Best Coatings Solutions” readable at distance.
- “Marine & Aviation” subtitle; phone number prominent.
- Dark navy base; electric sparingly (pinstripe / light cue — not flame graphics).
- High-quality vinyl; avoid cluttered service laundry lists that look like a
  coupon van.
- Keep legal lettering per local regs.

---

## 16. Uniforms

- Navy shirts/polos; embroidered or printed BCS mark.
- Silver/white type; small electric accent optional.
- Clean, tucked, PPE-compatible; no novelty prints.
- Name optional; division patch optional (Marine / Aviation) if it stays minimal.

---

## 17. Signs & site presence

- Temporary job-site signage: logo, phone, “Mobile Marine & Aviation Coatings.”
- High contrast; weatherproof; no prices.
- Banner hardware should look intentional — not wrinkled generic contractor
  stock.

---

## 18. PDFs & documents

- Letterhead: logo, legal name, contact, site URL.
- Margins generous; navy rules thin; body text dark on white for print
  readability.
- One column preferred for estimates/invoices; clear tables.
- Footer: confidentiality line if needed; page numbers on multi-page docs.

---

## 19. Invoices & estimates (documents)

- Brand header consistent with PDFs.
- Itemization clear; taxes/terms obvious.
- **Public website never displays prices** even if documents include them.
- Estimate cover note may restate: free estimates in Fort Lauderdale area;
  other locations subject to review/travel.
- Future portal will present these digitally ([`FUTURE.md`](./FUTURE.md)) using
  the same identity.

---

## 20. Email signature

Suggested structure:

```
Name
Role | Best Coatings Solutions
Marine & Aviation Coatings
t: 305-747-8352
e: …
w: bestcoatingssolutions.com
Instagram · Facebook
```

- Logo mark small (PNG/SVG compatible) optional; avoid animated GIFs.
- No stacked promotional banners in the signature.
- Spanish alternate signature available for ES correspondence.

---

## 21. Non-negotiables

- No service prices on the public website.
- No “all estimates are free.”
- No fake reviews or fake case studies.
- No production Supabase/Stripe without approval.
- No monorepo / portal build until approved ([`FUTURE.md`](./FUTURE.md)).
- Preserve logo geometry and palette discipline across every touchpoint above.

---

## 22. Asset governance

| Location | Contents |
|----------|----------|
| `docs/branding/` | Logo masters, clear-space diagrams, print exports |
| `docs/assets/` | Doc-only working files |
| `public/` | Favicons, OG images, web-facing exports |
| Owner drive | Photography masters, wrap printer files |

When identity changes, update this manual first, then `DESIGN_SYSTEM.md` tokens,
then shipped assets.
