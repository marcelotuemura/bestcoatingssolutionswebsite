# Post-merge verification — PR #49 (Formula marine photography)

**Date:** 2026-07-28  
**Auditor:** Cursor cloud agent (repository + local runtime evidence only)  
**Recommendation:** **GO WITH DOMAIN BLOCKER**

PR #49 merged cleanly. Marine photography, CI, local quality suite, and local visual checks are green. The Vercel **“Invalid Configuration”** signal is **not** explained by repository/build config; DNS evidence points to **missing public A/AAAA/CNAME records** for `bestcoatingssolutions.com` while nameservers are on Cloudflare.

---

## 1. Identity & versions

| Item | Value |
|------|-------|
| Current `main` SHA | `5d0c1d766bef5613f5dc624142b46d460dd1c988` |
| PR #49 merge commit | `5d0c1d766bef5613f5dc624142b46d460dd1c988` |
| PR #49 head (pre-merge) | `860358281fe81f72f4d313213318e35716ec59da` |
| PR #49 merged at | 2026-07-28T12:33:25Z |
| Node | `v22.22.2` |
| pnpm | `10.33.3` (`packageManager`: `pnpm@10.33.3`) |
| Next.js | `15.5.21` |

### PR #49 presence on `main`

Confirmed present:

- `config/marine-photography.ts`
- `components/marine/MarineWorkGallery.tsx`
- `public/images/marine/hero-formula-330cbr-stern.webp`
- `public/images/marine/gallery-01` … `gallery-12` WebP assets

---

## 2. Commands executed

```bash
git fetch origin main && git checkout main && git pull origin main
git rev-parse HEAD
gh pr view 49 --json state,mergedAt,mergeCommit,headRefOid,url
node -v && pnpm -v
node -e "console.log(require('./node_modules/next/package.json').version)"

pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:e2e

# Image inventory (sharp metadata)
node <<'JS' … # see /tmp artifacts locally during run

# Local production serve
PORT=3000 pnpm start
curl -sI http://127.0.0.1:3000/en/marine
curl -sI http://127.0.0.1:3000/images/marine/hero-formula-330cbr-stern.webp
curl -sI http://127.0.0.1:3000/data/pictures/formula/Formula/fromula_1.jpg

# Lighthouse (desktop form factor)
pnpm dlx lighthouse@12.6.0 http://127.0.0.1:3000/en/marine \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=desktop \
  --chrome-path="$PLAYWRIGHT_CHROME" \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --output=json --output=html --output-path=/tmp/post-merge-49/lighthouse-marine

# DNS / domain probes (read-only)
dig +short bestcoatingssolutions.com NS
dig bestcoatingssolutions.com A +noall +answer +comments
curl -v --max-time 15 https://bestcoatingssolutions.com
gh api …/deployments … # Production deploy for merge SHA
```

---

## 3. Quality suite results

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm install --frozen-lockfile` | **PASS** | Exit 0 |
| `pnpm run lint` | **PASS** | 0 errors, 20 pre-existing `no-console` warnings in scripts |
| `pnpm run typecheck` | **PASS** | Exit 0 |
| `pnpm run test` | **PASS** | 31 files / **272** tests |
| `pnpm run build` | **PASS** | Exit 0 |
| `pnpm run test:e2e` | **PASS** | **120** passed (56.1s) after freeing port 3000 |
| GitHub CI on merge SHA | **PASS** | Type Check · Lint · Test · Build + E2E success |

---

## 4. Marine photography verification

| Requirement | Result |
|-------------|--------|
| Formula hero used | **PASS** — `/images/marine/hero-formula-330cbr-stern.webp` |
| Placeholder warning removed from Marine hero | **PASS** — `data-hero-authentic="true"`; Playwright count of hero “Placeholder Image” = 0 |
| Gallery has 12 curated images | **PASS** — config + DOM `img` count = 12 |
| All configured paths exist on disk | **PASS** |
| Images load via `next/image` | **PASS** — `/_next/image?...hero-formula...` → 200 `image/avif`; static WebP → 200 |
| Meaningful alt text | **PASS** — hero alt describes Formula 330 CBR stern gloss; gallery alts > 70 chars; Lighthouse `image-alt` score 1 |
| Mobile no horizontal overflow | **PASS** — 390 / 768 / 1440 viewports `scrollWidth === clientWidth` |
| No invented before/after pairs | **PASS** — `beforeAfterPairs: []` |

### Notes on “Placeholder Image” string in HTML

The serialized dictionary still contains:

- Contact map copy: `Placeholder Image — map embed not configured…`
- Shared `mediaLabel` string used by other temporary surfaces

These are **not** shown on the Marine hero. Intentional remaining placeholders elsewhere (homepage silhouette, aviation, service atmospheres, About, contact map) are unchanged.

### Visual inspection

Screenshots under `/opt/cursor/artifacts/screenshots/post-merge-49/`:

- Homepage + `/en/marine` at mobile / tablet / desktop
- Confirmed hero crop shows Formula stern with legible **FORMULA** branding
- Gallery grid shows authentic gloss + masking process shots

Early screenshots taken before image decode completed looked “empty black”; after waiting for `img.naturalWidth > 0`, hero renders correctly (`naturalWidth: 835`).

---

## 5. Image inventory (`public/images/marine/`)

All WebP. Max published size **265.8 KB**. None flagged as unnecessarily large (>400 KB).

| File | Dimensions | Size (KB) |
|------|------------|-----------|
| `hero-formula-330cbr-stern.webp` | 1920×1440 | 198.1 |
| `gallery-01-bow-mirror-gloss.webp` | 1440×1080 | 168.2 |
| `gallery-02-bow-gloss-detail.webp` | 1440×1080 | 96.7 |
| `gallery-03-stern-branded.webp` | 1920×1440 | 265.8 |
| `gallery-04-hull-forklift-gloss.webp` | 1920×1440 | 105.4 |
| `gallery-05-bow-drydock.webp` | 1920×1440 | 255.2 |
| `gallery-06-masking-graphics.webp` | 1440×1080 | 168.6 |
| `gallery-07-masking-side.webp` | 1440×1080 | 163.5 |
| `gallery-08-masking-portholes.webp` | 1440×1080 | 172.6 |
| `gallery-09-masking-navy.webp` | 1920×1440 | 230.2 |
| `gallery-10-masking-midhull.webp` | 1920×1440 | 223.9 |
| `gallery-11-masking-overspray.webp` | 1920×1440 | 177.1 |
| `gallery-12-masking-stern-quarter.webp` | 1920×1440 | 231.1 |

### Archive vs publish

- Site serves only `/images/marine/*` (under `public/`).
- `GET /data/pictures/...` → **404** (originals not exposed as static public paths).
- Masters remain in `data/pictures/formula/Formula/` (archive).

---

## 6. Lighthouse (`/en/marine`, desktop form factor, local `pnpm start`)

| Category | Score |
|----------|------:|
| Performance | **79** |
| Accessibility | **92** |
| Best Practices | **96** |
| SEO | **100** |

Key metrics: LCP **3.6 s**, CLS **0**, FCP **1.1 s**, TBT **20 ms**.

### Notable audits (not fixed in this task)

- **Performance:** LCP above the project’s 2.5 s budget on local desktop Lighthouse; no speculative image re-encode performed (sizes already ≤266 KB WebP).
- **Accessibility:** `list` / `listitem` failures on Marine process `<ol>` wrapping a grid of `<div>`/`<li>` (pre-existing `DivisionProcess` structure — not introduced by PR #49).
- **Best Practices console:** local 404 for `/_vercel/insights/script.js` and `/favicon.ico` (expected locally; Analytics is Vercel-hosted).

No code changes were made for Lighthouse in this audit.

---

## 7. Vercel configuration audit (repository evidence)

| Artifact | Finding |
|----------|---------|
| `vercel.json` | **Absent** (OK — not required) |
| `next.config.ts` | Valid; `reactStrictMode`, security headers, `images.formats` AVIF/WebP |
| `package.json` scripts | `build` → `next build`, `start` → `next start`; `packageManager` pnpm |
| `.env.example` | Documents `NEXT_PUBLIC_SITE_URL` and other envs; no secrets committed |
| Redirects/rewrites | Locale redirects in `middleware.ts` only; no domain hardcoding |
| `config/site.ts` | Default canonical `https://bestcoatingssolutions.com` overridable via `NEXT_PUBLIC_SITE_URL` |

### Deployment evidence (GitHub → Vercel)

- Production deployment created for merge SHA `5d0c1d7`
- Deployment status: **success** — “Deployment has completed”
- Environment URL: `https://bestcoatingssolutionswebsite-plk13vvf9.vercel.app`
- That `.vercel.app` URL currently redirects to **Vercel SSO** (Deployment Protection) — separate from domain Invalid Configuration
- Commit status context `Vercel`: **success**

### DNS evidence (read-only)

```text
NS  bestcoatingssolutions.com → nile.ns.cloudflare.com / nena.ns.cloudflare.com
A   bestcoatingssolutions.com → ANSWER: 0 (no A/AAAA returned)
curl https://bestcoatingssolutions.com → “Could not resolve host”
```

---

## 8. “Invalid Configuration” diagnosis (categories)

| Category | Verdict | Evidence |
|----------|---------|----------|
| **(a) Repository configuration** | **Not indicated** | Lint/typecheck/tests/build/e2e pass; no `vercel.json` errors; Next config valid; Vercel reports deployment success for merge SHA |
| **(b) Vercel dashboard / project** | **Possible secondary** | Need owner confirmation of Domains panel text, Production branch = `main`, and whether domain is assigned to this project. Deployment Protection SSO on `.vercel.app` is dashboard-side but distinct from “Invalid Configuration” |
| **(c) Cloudflare DNS / domain** | **Most probable primary** | Cloudflare NS present; **no resolvable A/AAAA/CNAME** for apex; HTTPS host lookup fails. Matches typical Vercel Domains “Invalid Configuration” when required DNS records are missing/mismatched |

**Do not guess beyond evidence:** Exact Vercel Domains UI copy was not readable from this environment (Vercel MCP unauthenticated; no dashboard access). Repo + DNS probes are sufficient to rule out (a) as the cause of a failed app build and to prioritize (c).

---

## 9. Exact manual information needed from the owner (later repair)

Please capture and share (screenshots OK):

1. **Vercel → Project → Settings → Domains**
   - Full “Invalid Configuration” message
   - Domains listed (`apex` / `www`)
   - DNS records Vercel says are required (A / CNAME / ALIAS values)
2. **Vercel → Deployments**
   - Production deployment for `5d0c1d7` — Ready? Linked production domains?
3. **Cloudflare → DNS** for `bestcoatingssolutions.com`
   - Current records for `@` and `www` (type, name, content, proxied/DNS-only)
4. Confirm intended production hostname: apex vs `www`
5. Confirm Production env `NEXT_PUBLIC_SITE_URL` matches the intended hostname (do not change yet — just report current value)

Out of scope for this task (explicitly not done): DNS edits, domain removal/add, env rotation, new Vercel project.

---

## 10. Remaining defects / follow-ups (non-blocking for photography)

1. Custom domain does not resolve — **domain blocker**
2. Pre-existing process-list accessibility markup (`DivisionProcess`)
3. Local LCP 3.6 s vs 2.5 s budget — measure again on real production CDN after domain works
4. Missing `/favicon.ico` (and local Analytics script 404)
5. Vercel Deployment Protection SSO on `*.vercel.app` — verify intentional for Production alias

---

## 11. Recommendation

### **GO WITH DOMAIN BLOCKER**

- **GO** for repository / Marine photography / CI / local runtime correctness after PR #49.
- **BLOCKER** for public custom-domain production browsing until Cloudflare DNS records match Vercel’s Domains requirements (and Invalid Configuration clears).

**Owner next step:** Open Vercel Domains + Cloudflare DNS side-by-side, add the exact records Vercel shows for `bestcoatingssolutions.com` / `www`, wait for DNS propagation, re-check Domains status — **without** changing repository photography or creating a new project.
