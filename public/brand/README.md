# Brand assets (`public/brand`)

## Official logo (owner-approved)

The official Best Coatings Solutions mark includes a powerboat, a business jet,
metallic blue “BCS” lettering, and the company name.

### Production files (committed)

| File | Role |
|------|------|
| `bcs-logo-official.webp` | **Preferred** full mark (hero, footer, brand moments) |
| `bcs-logo-official.png` | PNG fallback of the full mark |
| `bcs-logo-header.webp` | Compact header lockup |
| `bcs-logo-header.png` | Header PNG fallback |
| `bcs-logo-header@2x.webp` | Retina header lockup |
| `bcs-logo-header@2x.png` | Retina header PNG fallback |

### Resolver order (`config/brand-logo.ts`)

**Official (full mark)** — first match wins:

1. `bcs-logo-official.webp` — preferred production raster  
2. `bcs-logo-official.svg` — vector if supplied later  
3. `bcs-logo-official.png` — raster fallback  

**Header** — first match, then falls back to official:

1. `bcs-logo-header.webp`  
2. `bcs-logo-header.png`  
3. official mark  

Retina: `bcs-logo-header@2x.webp` / `.png` preferred for the compact header render.

Preserve untouched masters under `docs/branding/originals/`.

Current production rasters are **opaque near-black plates** that match site
`bg-primary`. Do not invent transparent or alternate artwork.

## Not the official logo

| File | Role |
|------|------|
| `bcs-logo-temporary.svg` | Legacy layout scaffolding only — never treat as official |
| `marine-silhouette.svg` | Decorative placeholder |
| `aviation-silhouette.svg` | Decorative placeholder |

Do not redesign the official mark. Do not invent boat/jet artwork.
