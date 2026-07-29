# Domain configuration fix — Vercel “Invalid Configuration”

**Status:** Diagnosis only — **no DNS changes applied**  
**Date:** 2026-07-28  
**Related:** [`POST_MERGE_49_VERIFICATION.md`](./POST_MERGE_49_VERIFICATION.md)  
**App readiness:** Production build for merge SHA `5d0c1d7` (PR #49) succeeded on Vercel

---

## Current situation

| Fact | Evidence |
|------|----------|
| Application is production-ready | Local quality suite + GitHub CI pass; Vercel reports deployment **success** for `5d0c1d7` |
| No `vercel.json` in repo | Expected — not required for Next.js on Vercel |
| `next.config.ts` / `package.json` | Valid (`next build` / `next start`, `packageManager: pnpm@10.33.3`) |
| Canonical site URL in code | `https://bestcoatingssolutions.com` (`config/site.ts`; overridable via `NEXT_PUBLIC_SITE_URL`) |
| Brand web address | `bestcoatingssolutions.com` (apex, no `www`) — `BRAND_GUIDE.md` |
| Authoritative nameservers | Cloudflare: `nena.ns.cloudflare.com`, `nile.ns.cloudflare.com` |
| Apex `A` / `AAAA` | **None** (DNS `NOERROR` + empty ANSWER / SOA only) |
| `www` `A` / `CNAME` | **None** |
| Email MX | **Present** (Google Workspace: `aspmx.l.google.com` + alts) — must be preserved |
| Public HTTPS | `curl` → **Could not resolve host** (domain does not resolve to an IP) |
| Vercel UI | Owner reports **Invalid Configuration** on the domain |

Vercel’s own docs state that adding a third-party domain commonly shows **Invalid Configuration** until the DNS records Vercel expects are present and correct  
([Troubleshooting domains — Misconfigured domain issues](https://vercel.com/docs/domains/troubleshooting#misconfigured-domain-issues)).

---

## Domain intent (primary / redirect / www)

| Role | Hostname | Behavior |
|------|----------|----------|
| **Primary domain** | `bestcoatingssolutions.com` | Canonical production origin (matches `siteConfig.url` default and brand) |
| **Redirect domain** | `www.bestcoatingssolutions.com` | Should **redirect → apex** once both are added in Vercel Domains |
| **Expected www behavior** | Visitors typing `www.…` | Land on `https://bestcoatingssolutions.com/…` (301/308 via Vercel) |

In **Vercel → Project → Settings → Domains**, set:

1. `bestcoatingssolutions.com` as the **primary** production domain  
2. `www.bestcoatingssolutions.com` as a domain that **redirects to** the apex  

Do **not** change Cloudflare nameservers to Vercel. Keep Cloudflare as DNS host so existing **Google MX** and SPF/TXT records continue to work.

---

## Root cause

**Primary cause: Missing DNS records that point the domain at Vercel (DNS misconfiguration).**

Not indicated by evidence:

| Hypothesis | Why ruled out / deferred |
|------------|--------------------------|
| Wrong repository / Next.js / `vercel.json` | App builds and deploys successfully |
| Wrong nameservers for this setup | Nameservers correctly point at Cloudflare (correct when using Cloudflare DNS + Vercel A/CNAME) |
| SSL as the *first* failure | SSL cannot issue until the hostname resolves to Vercel; HTTP-01 needs a working A/CNAME first |
| Missing `_vercel` verification TXT (ownership) | Not observed; ownership may already be on this Vercel team. Only add TXT if Vercel Domains UI explicitly asks |
| Cloudflare Proxy as sole cause | Proxy cannot be the *only* issue while **no A/CNAME exists at all**; after adding records, Proxy must still be **DNS Only** |

**Exact mechanism:** Vercel Domains expects diggable `A` (apex) and/or `CNAME` (`www`). Public resolvers currently return **no answer records** for either. Until those exist (and match Vercel’s values), Vercel keeps the domain in **Invalid Configuration**.

---

## Exact DNS records to create (Cloudflare)

> **Confirm the Value column in Vercel → Domains** for this project. Vercel documents the standard apex IP `76.76.21.21` and a CNAME target such as `cname.vercel-dns.com` / `cname.vercel-dns-0.com` ([Working with DNS](https://vercel.com/docs/domains/working-with-dns)). If the Domains panel shows a different IP or CNAME hostname, **use the panel values**.

Create these in **Cloudflare → DNS → Records** for zone `bestcoatingssolutions.com`:

| Host | Type | Value | Proxy status (Cloudflare) | TTL |
|------|------|-------|---------------------------|-----|
| `@` | **A** | `76.76.21.21` | **DNS Only** (grey cloud) | Auto (or 60–300s while cutting over) |
| `www` | **CNAME** | `cname.vercel-dns.com.` | **DNS Only** (grey cloud) | Auto (or 60–300s while cutting over) |

### Cloudflare UI tips

- Host `@` = apex `bestcoatingssolutions.com`
- Host `www` = `www.bestcoatingssolutions.com`
- Copy CNAME targets **exactly** as shown in Vercel (including trailing `.` if displayed)
- **Proxy status must be DNS Only** for both records when using Vercel as the origin. Orange-cloud (Proxied) frequently keeps domains in Invalid Configuration / breaks certificate issuance

### Do **not** change

| Record | Action |
|--------|--------|
| `NS` (Cloudflare) | Leave as-is |
| Google `MX` (`aspmx.l.google.com` etc.) | Leave as-is (email) |
| Existing `TXT` (SPF, Google site verification) | Leave as-is |
| Do **not** add apex `CNAME` | Invalid at zone apex when MX/NS exist ([Vercel apex guidance](https://vercel.com/docs/domains/troubleshooting#working-with-apex-domain)) |
| Do **not** add `AAAA` pointing at Vercel | Vercel does not support IPv6 for custom domains yet |

### If Vercel asks for ownership verification

Only then add (example — use the **exact** token from the UI):

| Host | Type | Value | Proxy | TTL |
|------|------|-------|-------|-----|
| `_vercel` | TXT | *(value from Vercel Domains UI)* | DNS Only | Auto |

---

## Expected propagation time

| Change | Typical wait |
|--------|----------------|
| New/updated `A` / `CNAME` (TTL Auto / low) | Often **minutes to ~1 hour**; allow up to a few hours |
| Full global cache flush | Up to **24–48 hours** in worst cases |
| Nameserver changes | **Not required** for this fix; avoid unless migrating DNS hosts |

Recommendation: set TTL to **60–300 seconds** before/during cutover; raise later after verification.

---

## Verification checklist (owner)

After saving Cloudflare records (**DNS Only**):

1. **Cloudflare DNS**
   - [ ] Apex `A` → `76.76.21.21` (or Vercel-shown IP), grey cloud  
   - [ ] `www` `CNAME` → Vercel CNAME target, grey cloud  
   - [ ] MX still list Google `aspmx…` records  

2. **CLI / public DNS**
   ```bash
   dig +short A bestcoatingssolutions.com
   # expect: 76.76.21.21   (or the IP Vercel displayed)

   dig +short CNAME www.bestcoatingssolutions.com
   # expect: cname.vercel-dns.com.  (or the CNAME Vercel displayed)

   dig +short MX bestcoatingssolutions.com
   # expect: Google MX still present
   ```

3. **Vercel → Domains**
   - [ ] Apex status changes from **Invalid Configuration** → **Valid**  
   - [ ] SSL certificate shows issued / active  
   - [ ] `www` configured to **redirect to** apex  

4. **Browser**
   - [ ] `https://bestcoatingssolutions.com/en/marine` loads Formula hero + gallery  
   - [ ] `https://www.bestcoatingssolutions.com/en/marine` redirects to apex  
   - [ ] Hard refresh / private window to avoid cache  

5. **Env (read-only confirm; do not change in this task)**
   - [ ] Production `NEXT_PUBLIC_SITE_URL` is `https://bestcoatingssolutions.com` (no trailing slash)

---

## Why Vercel shows “Invalid Configuration” (classification)

| Category | Applies? | Notes |
|----------|----------|-------|
| **DNS** | **YES — primary** | No apex `A`, no `www` `CNAME`; hostname does not resolve |
| **Missing CNAME** | **YES** (for `www`) | No `www` CNAME today |
| **Wrong / missing A record** | **YES** (for apex) | No apex `A` today |
| **Cloudflare Proxy** | **Risk after records exist** | Must use **DNS Only**; Proxied often blocks Valid status |
| **Wrong nameservers** | **No** | Cloudflare NS are correct for this architecture |
| **SSL** | **Secondary / follow-on** | Cannot complete until DNS points at Vercel |
| **Verification TXT** | **Only if UI asks** | Not required by current public DNS evidence alone |

---

## Rollback procedure

If traffic or email misbehaves after DNS edits:

1. In Cloudflare DNS, **remove** the new apex `A` and `www` `CNAME` (or restore previous values from Cloudflare’s record history / screenshots taken before change).  
2. **Do not delete** Google `MX` or existing mail-related `TXT`.  
3. Wait for prior TTL to expire (or flush local DNS).  
4. Confirm email still works (`MX` dig + send/receive test).  
5. Vercel Domains may return to Invalid Configuration until records are restored correctly — that is expected.  
6. Application deployments on Vercel remain intact; rollback is DNS-only.

---

## Out of scope (explicitly not done)

- No DNS edits  
- No Cloudflare / Vercel dashboard mutations  
- No new Vercel project  
- No repository application code changes  
- No secret / env rotation  

---

## Owner action summary

1. Open **Vercel → Project → Settings → Domains** and note the exact `A` / `CNAME` values shown.  
2. In **Cloudflare → DNS**, add those records with **Proxy = DNS Only**.  
3. Preserve **Google MX**.  
4. Wait for propagation; re-check until Vercel shows **Valid**.  
5. Verify `/en/marine` on the apex hostname.
