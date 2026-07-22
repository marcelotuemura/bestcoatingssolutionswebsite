# `animations/`

Centralised **Framer Motion** variants, transitions and easing curves.

Rationale:

- The homepage is the **only** page with premium animation; every other page
  stays static, lightweight and fast (see `PROJECT_OVERVIEW.md`). Keeping motion
  definitions here prevents animation code from leaking into otherwise-static
  pages.
- Shared easing/duration tokens guarantee a consistent motion language.
- All motion must respect `prefers-reduced-motion` (accessibility).

Typical exports: `fadeInUp`, `stagger`, `easing`, `durations`. GSAP is only
introduced here if a specific effect genuinely cannot be achieved with Framer
Motion.
