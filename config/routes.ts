/**
 * Typed registry of every public route the site will expose.
 *
 * Pages themselves are NOT implemented yet (foundation phase). This registry is
 * the contract that navigation, the dynamic sitemap and future breadcrumb /
 * structured-data helpers build on, so routes stay consistent as pages land.
 *
 * `changeFrequency` / `priority` mirror the sitemap spec and are used directly
 * by `app/sitemap.ts`.
 */
export type RouteChangeFrequency =
  'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface RouteDefinition {
  /** URL path relative to the site origin. */
  readonly path: string;
  /** Human-readable label for navigation and breadcrumbs. */
  readonly label: string;
  /** Whether the route should appear in the generated sitemap. */
  readonly sitemap: boolean;
  readonly changeFrequency: RouteChangeFrequency;
  readonly priority: number;
}

export const routes = {
  home: {
    path: '/',
    label: 'Home',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  marine: {
    path: '/marine',
    label: 'Marine',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  aviation: {
    path: '/aviation',
    label: 'Aviation',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  services: {
    path: '/services',
    label: 'Services',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  projects: {
    path: '/projects',
    label: 'Projects',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  beforeAfter: {
    path: '/before-after',
    label: 'Before & After',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  process: {
    path: '/process',
    label: 'Process',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.6,
  },
  about: {
    path: '/about',
    label: 'About',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.6,
  },
  gallery: {
    path: '/gallery',
    label: 'Gallery',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  blog: {
    path: '/blog',
    label: 'Blog',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  scheduleVisit: {
    path: '/schedule-visit',
    label: 'Schedule Visit',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  estimateRequest: {
    path: '/estimate-request',
    label: 'Estimate Request',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  contact: {
    path: '/contact',
    label: 'Contact',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.7,
  },
  portal: {
    path: '/portal',
    label: 'Customer Portal',
    sitemap: false,
    changeFrequency: 'never',
    priority: 0.3,
  },
  privacy: {
    path: '/privacy',
    label: 'Privacy',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.2,
  },
  terms: {
    path: '/terms',
    label: 'Terms',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.2,
  },
  accessibility: {
    path: '/accessibility',
    label: 'Accessibility',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.2,
  },
} as const satisfies Record<string, RouteDefinition>;

export type RouteKey = keyof typeof routes;

/** Primary navigation shown in the site header. */
export const primaryNav: readonly RouteKey[] = [
  'marine',
  'aviation',
  'services',
  'projects',
  'about',
  'contact',
];

/** Routes that should be emitted into the dynamic sitemap. */
export const sitemapRoutes: readonly RouteDefinition[] = Object.values(
  routes,
).filter((route) => route.sitemap);
