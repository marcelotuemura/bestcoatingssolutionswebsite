# FAQ Content Guide

## Central source of truth

FAQ answers live in `content/faq-en.ts` and `content/faq-es.ts`, registered by `config/faq.ts`.

## Service-page reuse

When service pages include FAQs, prefer the same wording as the FAQ Center for overlapping topics to prevent conflicts.

## Preventing conflicting answers

- Update the central FAQ first.
- Propagate shared answers to service pages in the same change.
- Avoid page-specific promises that contradict the FAQ Center.

## Warranty wording

Use scope-based language:

> Warranty terms, when applicable, are defined in the approved written repair scope.

Do not publish lifetime or universal warranty durations on FAQ pages.

## Insurance wording

State clearly that coverage decisions belong to the customer and insurer, and that BCS does not guarantee claim approval.

## Structured-data rules

Emit `FAQPage` JSON-LD only when:

- Questions and answers are visibly rendered
- JSON-LD matches visible copy
- Answers are not misleading

Do not add FAQ schema to every page automatically.

## Localization review

English and Spanish category ids and item ids must stay in parity. Run unit parity checks before publishing FAQ changes.
