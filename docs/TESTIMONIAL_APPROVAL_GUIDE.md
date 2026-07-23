# Testimonial Approval Guide

## Written consent

Publish testimonials only with written publication consent on file (`publicationConsentStatus: 'granted'`).

## Quote accuracy

Quotes must match the approved source. Do not invent or embellish customer statements.

## Editing limitations

Light edits for spelling or length are allowed only when they do not change meaning, and only with owner approval when material.

## Display-name options

Use the customer-approved display name. Prefer first name + last initial when full name consent is absent.

## Rating verification

Publish ratings only when verified. If rating is absent, do not show stars and do not invent a score.

## Source record

Retain the source (`written`, `email`, `form`, `in-person`, or `other`) in the content record.

## Publication approval

Requires:

- `status: 'published'`
- `ownerApprovalStatus: 'approved'`
- `publicationConsentStatus: 'granted'`

## Removal process

Set status to `archived` and remove from public collections immediately upon consent withdrawal or owner request.

## Structured data

Do not emit `Review` or `AggregateRating` JSON-LD without approved qualifying testimonials.
