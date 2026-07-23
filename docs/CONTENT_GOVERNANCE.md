# Content Governance

Publication statuses used across projects, resources, testimonials, and related records.

## Statuses

| Status | Meaning | Public site | Sitemap | Structured data |
|--------|---------|-------------|---------|-----------------|
| Draft | Internal work in progress | No | No | No |
| Owner Review | Waiting for owner approval | No | No | No |
| Legal Review | Waiting for legal approval (when required) | No | No | No |
| Approved | Owner approved; may still need publication step | No (until published) | No | No |
| Published | Publicly visible and owner-approved | Yes | Yes | Yes (when eligible) |
| Coming Soon | Announced but not ready | No | No | No |
| Future | Reserved placeholder for later work | No | No | No |
| Archived | Removed from public surfaces | No | No | No |

## Additional gates

- **Image Approval Required** — project/resource images need `publicationApproved: true`.
- **Customer Consent Required** — testimonials and identifiable project photography need granted consent.
- **Test Fixtures** — labeled test-only records. Never enter the sitemap or production structured data. Visible only when `BCS_INCLUDE_TEST_FIXTURES=1`.

## Review and publication workflow

1. Author draft content in typed config/content modules.
2. Technical review for safety, accuracy, and localization parity.
3. Owner review (and legal review when warranty/insurance/legal copy changes).
4. Set `ownerApprovalStatus: 'approved'`.
5. Set `status: 'published'` only after approvals and consent gates pass.
6. Verify the page, sitemap entry, and structured data match visible copy.
7. Archive instead of deleting when content must leave the public site.

Unapproved facts must not render on production pages.
