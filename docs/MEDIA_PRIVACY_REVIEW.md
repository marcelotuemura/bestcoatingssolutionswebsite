# Media Privacy Review (Phase 2A)

## Principles

1. New inventory assets default to `privacyStatus = "unchecked"`.
2. Unchecked / blocked / review-required assets **cannot** be marked `published` or `queued`.
3. Checklist is **manual**. Heuristic GPS EXIF detection is advisory only.
4. No claim of complete face recognition, OCR, or HIN detection in this phase.

## Checklist fields

- visible face  
- vessel registration  
- HIN  
- license plate  
- customer document  
- invoice  
- address  
- GPS metadata  
- other private information  

Plus `reviewedAt` / `reviewedBy` when the operator confirms review.

## GPS EXIF

`detectGpsExif()` inspects the EXIF buffer for GPS markers.  
If found: `flags.hasGpsExif = true`, checklist `gpsMetadata = true`, status `review-required`.

Strip metadata before any future public derivative (Phase C).

## UI

`/media/inventory/[id]` — Privacy checklist fieldset + privacy status select.
