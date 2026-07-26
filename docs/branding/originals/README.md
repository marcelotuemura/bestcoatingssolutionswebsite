# Brand originals

Preserve designer-supplied logo masters here **before** optimizing web exports.

Suggested layout:

```text
docs/branding/originals/
  bcs-logo-official-source.png   # or .ai / .pdf / .svg from designer
  bcs-logo-official-source.svg
```

Web-facing exports (do not overwrite originals):

```text
public/brand/bcs-logo-official.webp       # preferred production full mark
public/brand/bcs-logo-official.png        # PNG fallback
public/brand/bcs-logo-header.webp         # compact header
public/brand/bcs-logo-header@2x.webp      # retina header
public/brand/bcs-logo-official.svg        # vector if supplied later
```

`config/brand-logo.ts` auto-detects the first matching web export.
Do not auto-trace raster artwork into SVG and present it as exact trademark art.
