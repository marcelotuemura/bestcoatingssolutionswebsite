# Phase 5F — Aviation Division

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-5f-aviation-division-5ec4`  
**Base:** `main` (Phase 5E merged)  
**Date:** 2026-07-26

---

## Intent

Make Aviation a complete, credible, premium division page that shares Marine’s design language while expressing a different environment — precision, metallic/composite surfaces, controlled lighting — through atmosphere and content only.

---

## What shipped

1. Aviation page rebuilt on shared `DivisionHero` + `DivisionProcess`  
2. Aviation atmosphere copy (precision / metallic / composite / geometry)  
3. **Show the Process:** Assessment → Surface preparation → Composite refinement → Paint restoration → Finish inspection  
4. Editorial capabilities list (cosmetic refinishing language)  
5. Scope section retained (FAA / structural / mechanical exclusions)  
6. Contact CTA only (no public estimate booking)  
7. EN/ES copy + evidence screenshots  

---

## Process (Aviation)

| Step | Title |
|-----:|-------|
| 01 | Assessment |
| 02 | Surface preparation |
| 03 | Composite refinement |
| 04 | Paint restoration |
| 05 | Finish inspection |

---

## Scope guardrails

Explicitly excluded in copy: FAA repair station, structural airframe work, mechanical maintenance, engines, avionics, flight-critical repairs.

Inquiries via Contact. Marine remains the public estimate path.

---

## Shared vs differentiated

| Shared with Marine | Differentiated |
|--------------------|----------------|
| DivisionHero, DivisionProcess, typography, buttons, spacing, editorial lists | Aviation texture, silhouette, process steps, capability wording, Contact CTA |

---

## Review evidence

Artifacts: `/opt/cursor/artifacts/phase5f-screenshots/`

Hero / full / process / capabilities / scope across desktop, laptop, tablet, iPhone; Spanish process; marine vs aviation hero comparison frames.

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass (incl. `phase5f-aviation`) |
| `pnpm build` | Pass |
| E2E aviation (phase3) | Pass |

---

## Deferred

- Real aviation photography  
- Optional Process Highlights (DAM)  
- Phase 5G About as craftsman culmination  

---

## Approval request

Approve Phase 5F before Phase 5G About.
