# `components/`

Reusable React components. **Server Components by default**; Client Components
only for genuine interaction (mobile nav, language path awareness, reduced-motion
subscription, html lang sync).

| Folder | Contents |
|--------|----------|
| `ui/` | Button, ButtonLink, Container, Section, Heading, Input, Textarea, Select, Checkbox, Label, Badge, Divider |
| `layout/` | SkipLink, Logo, SiteHeader, SiteFooter, MobileNav, LanguageSwitcher, SiteShell, RoutePlaceholder |

Style with Tailwind brand tokens from `app/globals.css`. Keep vendor SDKs out —
data access belongs in `services/`.
