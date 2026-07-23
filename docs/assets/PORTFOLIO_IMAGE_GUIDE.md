# Portfolio Image Guide

## Recommended dimensions

- Hero / overview: 1600×1000 (or 16:10)
- Before/after pair: matched 1200×800 minimum
- Detail crops: 1200×1200 or 1200×800

Always store explicit width and height in the project image model.

## Approved formats

- Web-friendly: `.webp`, `.jpg`, `.jpeg`, `.png`
- Prefer WebP for production delivery via Next.js image optimization

## File naming

Use descriptive, non-identifying names:

`project-slug-before-01.webp`

Avoid HIN, customer names, claim numbers, or slip numbers in filenames.

## Compression

Compress for web while preserving finish detail. Avoid heavy filters that misrepresent color.

## Before/after camera consistency

- Similar distance, angle, and framing
- Similar time-of-day / lighting when practical
- Do not use unrelated stock photos as “after” evidence

## Lighting consistency

Prefer even, natural light. Avoid mixed color casts between before and after when possible.

## Customer-consent review

Confirm written publication consent before marking images approved.

## Vessel-name review

Remove or blur vessel names unless consent explicitly allows them.

## Registration-number review

Do not publish registration numbers.

## License-plate review

Do not publish vehicle/trailer plates visible in frames.

## Marina-location review

Avoid exact private slip identifiers; general marina/city language only when approved.

## Metadata removal

Strip EXIF GPS and personal metadata before publication.

## Alt-text guidance

Describe the visible condition or repair stage without inventing outcomes. Mark placeholders as placeholders.

## Publication approval workflow

1. Technical crop/color review
2. Privacy review (HIN, names, slips, plates)
3. Customer consent confirmation
4. Owner approval (`publicationApproved: true`)
5. Attach to a published project record
