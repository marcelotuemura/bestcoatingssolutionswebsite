# Placeholder asset inventory (Phase 2–4)

These assets are **temporary** and must not be presented as final brand or real BCS project work.

Visible UI labels must include clear wording such as **Placeholder Image**, **Future Project**, or **Coming Soon**.

| Asset | Path | Purpose | Replace with |
|-------|------|---------|--------------|
| Temporary logo | `public/brand/bcs-logo-temporary.svg` | Hero logo reveal | Final BCS logo SVG (owner) |
| Marine silhouette | `public/brand/marine-silhouette.svg` | Decorative hero/marine atmosphere | Approved marine photography |
| Aviation silhouette | `public/brand/aviation-silhouette.svg` | Aviation preview atmosphere | Approved aviation photography (when operational) |
| Before/after gradients | CSS in `BeforeAfterSlider` | Interactive demo only | Matched before/after photo pair |
| Featured project copy | `i18n` `home.featured.*` | Case-study structure demo | Real approved case study |
| Marine / service heroes | `config/marketing-placeholders.ts` | Division + service page atmosphere | Approved photography |
| Project image slots | `config/projects.ts` framework | Empty slots labeled placeholder | Owner-approved project images |
| Contact map | Contact page map region | Labeled map placeholder — no embed | Approved map/location treatment if desired |
| Form delivery demo | `config/submission.ts` + mock adapters | Temporary “prepared” success state | Real email/CRM delivery |
| Legal review badges | Privacy / Terms pages | “Requires owner / legal review” | Approved final legal copy |

Config references:

- `config/home-placeholders.ts`
- `config/marketing-placeholders.ts`
- `config/projects.ts` (`published: false` until approved)
- `config/submission.ts`
