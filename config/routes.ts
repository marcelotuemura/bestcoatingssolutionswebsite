/**
 * Typed registry of public routes for the first release and deferred surfaces.
 *
 * Navigation, sitemap, and breadcrumbs consume this registry. Marketing page
 * compositions land in later phases; paths are registered now for shell/nav.
 */
export type RouteChangeFrequency =
  'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface RouteDefinition {
  /** URL path relative to the locale prefix (e.g. `/marine`). */
  readonly path: string;
  /** Dictionary key under `nav` for localized labels. */
  readonly labelKey: string;
  /** Whether the route should appear in the generated sitemap. */
  readonly sitemap: boolean;
  readonly changeFrequency: RouteChangeFrequency;
  readonly priority: number;
  /** When false, omit from launch sitemap even if sitemap flag is true later. */
  readonly launch: boolean;
}

export const routes = {
  home: {
    path: '/',
    labelKey: 'home',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 1.0,
    launch: true,
  },
  marine: {
    path: '/marine',
    labelKey: 'marine',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.9,
    launch: true,
  },
  aviation: {
    path: '/aviation',
    labelKey: 'aviation',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.9,
    launch: true,
  },
  services: {
    path: '/services',
    labelKey: 'services',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.8,
    launch: true,
  },
  projects: {
    path: '/projects',
    labelKey: 'projects',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    launch: true,
  },
  beforeAfter: {
    path: '/before-after',
    labelKey: 'beforeAfter',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    launch: true,
  },
  about: {
    path: '/about',
    labelKey: 'about',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.6,
    launch: true,
  },
  serviceArea: {
    path: '/service-area',
    labelKey: 'serviceArea',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.7,
    launch: true,
  },
  scheduleVisit: {
    path: '/schedule-visit',
    labelKey: 'scheduleVisit',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.8,
    launch: true,
  },
  estimateRequest: {
    path: '/estimate-request',
    labelKey: 'estimateRequest',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.8,
    launch: true,
  },
  thankYou: {
    path: '/thank-you',
    labelKey: 'thankYou',
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0.1,
    launch: true,
  },
  contact: {
    path: '/contact',
    labelKey: 'contact',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.7,
    launch: true,
  },
  privacy: {
    path: '/privacy',
    labelKey: 'privacy',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.2,
    launch: true,
  },
  terms: {
    path: '/terms',
    labelKey: 'terms',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.2,
    launch: true,
  },
  accessibility: {
    path: '/accessibility',
    labelKey: 'accessibility',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.2,
    launch: true,
  },
  faq: {
    path: '/faq',
    labelKey: 'faq',
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.7,
    launch: true,
  },
  workmanship: {
    path: '/workmanship',
    labelKey: 'workmanship',
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.6,
    launch: true,
  },
  resources: {
    path: '/resources',
    labelKey: 'resources',
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.75,
    launch: true,
  },
  /** Deferred — keep registered, out of launch sitemap. */
  process: {
    path: '/process',
    labelKey: 'process',
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0.6,
    launch: false,
  },
  gallery: {
    path: '/gallery',
    labelKey: 'gallery',
    sitemap: false,
    changeFrequency: 'weekly',
    priority: 0.6,
    launch: false,
  },
  blog: {
    path: '/blog',
    labelKey: 'blog',
    sitemap: false,
    changeFrequency: 'weekly',
    priority: 0.7,
    launch: false,
  },
  portal: {
    path: '/portal',
    labelKey: 'portal',
    sitemap: false,
    changeFrequency: 'never',
    priority: 0.3,
    launch: false,
  },
} as const satisfies Record<string, RouteDefinition>;

export type RouteKey = keyof typeof routes;

/** Primary navigation shown in the site header. */
export const primaryNav: readonly RouteKey[] = [
  'marine',
  'services',
  'projects',
  'resources',
  'about',
  'contact',
];

/** Footer secondary links. */
export const footerNav: readonly RouteKey[] = [
  'about',
  'marine',
  'aviation',
  'services',
  'projects',
  'faq',
  'resources',
  'serviceArea',
  'workmanship',
  'contact',
  'estimateRequest',
  'privacy',
  'terms',
];

/** CTA keys used in header/footer. */
export const ctaRoutes = {
  estimate: 'estimateRequest',
  schedule: 'scheduleVisit',
} as const satisfies Record<string, RouteKey>;

/** Routes emitted into the dynamic sitemap for the launch. */
export const sitemapRoutes: readonly RouteDefinition[] = Object.values(
  routes,
).filter((route) => route.sitemap && route.launch);
