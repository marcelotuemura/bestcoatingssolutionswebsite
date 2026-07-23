import { describe, expect, it } from 'vitest';
import {
  aboutOwnerFactPlaceholders,
  getApprovedAboutFacts,
} from '@/config/about';
import { faqCategories, faqCategoryIds } from '@/config/faq';
import { shouldShowMarinaDirectory } from '@/config/marinas';
import {
  getPublishedProjects,
  getProjectBySlug,
  getSitemapProjects,
  isValidProjectSlug,
  projectStatusSamples,
  projectTestFixture,
} from '@/config/projects';
import {
  isPubliclyPublishable,
  publicationStatuses,
} from '@/config/publication';
import {
  getApprovedServiceAreaLocations,
  serviceAreaConfig,
} from '@/config/service-area';
import {
  getPublishedTestimonials,
  hasApprovedTestimonials,
  shouldEmitReviewStructuredData,
} from '@/config/testimonials';
import { getAboutContent } from '@/content/about';
import { assertFaqLocaleParity, getFaqCategories } from '@/content/faq';
import {
  getPublishedResources,
  getResourceBySlug,
  getSitemapResources,
  isValidResourceSlug,
  resourceStatusSamples,
  resourceTestFixture,
} from '@/content/resources';
import { getWorkmanshipContent } from '@/content/workmanship';
import { getDictionarySync } from '@/i18n/get-dictionary';
import {
  articleJsonLd,
  faqPageJsonLd,
  shouldOmitReviewStructuredData,
} from '@/lib/seo/structured-data';
import sitemap from '@/app/sitemap';

describe('about content', () => {
  it('provides localized about content without unsupported stats', () => {
    const en = getAboutContent('en');
    const es = getAboutContent('es');
    expect(en.title).toMatch(/Best Coatings Solutions/);
    expect(es.title).toMatch(/Best Coatings Solutions/);
    expect(en.values.length).toBe(8);
    expect(es.values.length).toBe(en.values.length);
    const banned =
      /\bfounded in\b|\bawarded\b|\baward-winning\b|\blargest\b|\bbest in florida\b|\bguaranteed invisible\b/i;
    expect(banned.test(en.introduction.join(' '))).toBe(false);
    expect(banned.test(es.introduction.join(' '))).toBe(false);
    expect(en.introduction.join(' ')).toMatch(/do not invent/i);
  });

  it('hides unapproved owner facts', () => {
    expect(aboutOwnerFactPlaceholders.length).toBeGreaterThan(0);
    expect(getApprovedAboutFacts()).toHaveLength(0);
  });
});

describe('project schema and publication', () => {
  it('accepts valid project statuses', () => {
    expect(publicationStatuses).toContain('draft');
    expect(publicationStatuses).toContain('published');
    expect(publicationStatuses).toContain('future');
    expect(publicationStatuses).toContain('archived');
  });

  it('publishes no fabricated projects', () => {
    expect(getPublishedProjects()).toHaveLength(0);
    expect(getSitemapProjects()).toHaveLength(0);
  });

  it('excludes draft and future samples from public visibility', () => {
    for (const sample of projectStatusSamples) {
      expect(isPubliclyPublishable(sample)).toBe(false);
    }
  });

  it('excludes test fixtures from production publishability and sitemap', () => {
    expect(projectTestFixture.isTestFixture).toBe(true);
    expect(isPubliclyPublishable(projectTestFixture)).toBe(false);
    expect(getSitemapProjects().some((p) => p.isTestFixture)).toBe(false);
    expect(getProjectBySlug(projectTestFixture.slug)).toBeUndefined();
  });

  it('validates project slugs and related services on fixture', () => {
    expect(isValidProjectSlug('gelcoat-repair-demo')).toBe(true);
    expect(isValidProjectSlug('Bad Slug')).toBe(false);
    expect(projectTestFixture.relatedServiceSlugs.length).toBeGreaterThan(0);
    expect(projectTestFixture.beforeAfterPairs.length).toBe(1);
    expect(
      projectTestFixture.images.every((image) => image.publicationApproved),
    ).toBe(true);
  });

  it('supports optional fields safely on empty catalog records', () => {
    const draft = projectStatusSamples[0]!;
    expect(draft.vesselType).toBeUndefined();
    expect(draft.images).toEqual([]);
    expect(draft.beforeAfterPairs).toEqual([]);
  });
});

describe('testimonials empty-safe behavior', () => {
  it('has no published testimonials and omits review schema', () => {
    expect(getPublishedTestimonials()).toHaveLength(0);
    expect(hasApprovedTestimonials()).toBe(false);
    expect(shouldEmitReviewStructuredData()).toBe(false);
    expect(shouldOmitReviewStructuredData()).toBe(true);
  });
});

describe('FAQ architecture', () => {
  it('registers expected categories with EN/ES parity', () => {
    expect(faqCategoryIds.length).toBe(14);
    expect(faqCategories).toHaveLength(14);
    assertFaqLocaleParity();
    const en = getFaqCategories('en');
    const es = getFaqCategories('es');
    expect(en.length).toBe(es.length);
    expect(en.flatMap((c) => c.items).length).toBe(
      es.flatMap((c) => c.items).length,
    );
  });

  it('builds FAQ schema matching visible items', () => {
    const items = getFaqCategories('en').flatMap((c) => c.items);
    const schema = faqPageJsonLd(items);
    expect(schema?.['@type']).toBe('FAQPage');
    const mainEntity = schema?.mainEntity as { name: string }[];
    expect(mainEntity[0]?.name).toBe(items[0]?.question);
  });

  it('avoids unsupported promises in FAQ answers', () => {
    const text = getFaqCategories('en')
      .flatMap((c) => c.items)
      .map((i) => i.answer)
      .join(' ');
    expect(text).toMatch(/does not guarantee claim approval/i);
    expect(text).toMatch(/do not provide instant website pricing/i);
    expect(text).toMatch(/do not publish a lifetime warranty/i);
    expect(text).not.toMatch(/\bwe guarantee claim approval\b/i);
    expect(text).not.toMatch(/\bwe offer a lifetime warranty\b/i);
  });
});

describe('workmanship and insurance disclaimers', () => {
  it('requires owner/legal review and avoids lifetime warranty', () => {
    const content = getWorkmanshipContent('en');
    expect(content.legalReviewNotice).toMatch(/owner and legal review/i);
    expect(content.warrantyDisclaimer).toMatch(/written repair scope/i);
    const blob = content.sections.map((s) => s.body.join(' ')).join(' ');
    expect(blob).not.toMatch(/lifetime warranty/i);
    expect(blob).not.toMatch(/universal warranty duration/i);
  });

  it('keeps insurance disclaimer language in dictionaries', () => {
    const en =
      getDictionarySync('en').phase5.insuranceExpanded.disclaimers.join(' ');
    const es =
      getDictionarySync('es').phase5.insuranceExpanded.disclaimers.join(' ');
    expect(en).toMatch(/does not guarantee claim approval/i);
    expect(en).toMatch(/coverage decisions belong/i);
    expect(es).toMatch(/no garantiza/i);
  });
});

describe('service area filtering', () => {
  it('publishes only approved locations', () => {
    const approved = getApprovedServiceAreaLocations();
    expect(approved.some((l) => l.name === 'South Florida')).toBe(true);
    expect(approved.some((l) => l.name === 'Fort Lauderdale')).toBe(true);
    expect(approved.every((l) => l.ownerApprovalStatus === 'approved')).toBe(
      true,
    );
    expect(serviceAreaConfig.map.treatment).toBe('placeholder');
    expect(shouldShowMarinaDirectory()).toBe(false);
  });
});

describe('resources schema and filtering', () => {
  it('publishes approved educational resources only', () => {
    const published = getPublishedResources();
    expect(published.length).toBe(8);
    expect(getSitemapResources()).toHaveLength(8);
    for (const sample of resourceStatusSamples) {
      expect(isPubliclyPublishable(sample)).toBe(false);
    }
    expect(isPubliclyPublishable(resourceTestFixture)).toBe(false);
    expect(getResourceBySlug(resourceTestFixture.slug)).toBeUndefined();
    expect(isValidResourceSlug('how-to-photograph-vessel-damage')).toBe(true);
  });

  it('builds article schema for a published resource', () => {
    const resource = getPublishedResources()[0]!;
    const schema = articleJsonLd({
      headline: resource.copy.en.title,
      description: resource.copy.en.summary,
      url: 'https://example.com/en/resources/x',
      authorName: resource.authorDisplayName,
      inLanguage: 'en',
      datePublished: resource.publishedAt,
    });
    expect(schema['@type']).toBe('Article');
  });

  it('avoids unsafe DIY structural instructions', () => {
    const blob = getPublishedResources()
      .map((r) => JSON.stringify(r.copy.en))
      .join(' ');
    expect(blob).toMatch(/does not provide instructions for grinding/i);
    expect(blob).not.toMatch(/mix resin at a 2:1 ratio/i);
  });
});

describe('sitemap exclusions', () => {
  it('includes phase 5 public routes and published resources', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes('/en/faq'))).toBe(true);
    expect(urls.some((url) => url.includes('/en/workmanship'))).toBe(true);
    expect(urls.some((url) => url.includes('/en/resources'))).toBe(true);
    expect(
      urls.some((url) =>
        url.includes('/resources/how-to-photograph-vessel-damage'),
      ),
    ).toBe(true);
    expect(urls.some((url) => url.includes('test-fixture'))).toBe(false);
    expect(urls.some((url) => url.includes('/thank-you'))).toBe(false);
    expect(urls.some((url) => url.includes('draft-sample'))).toBe(false);
  });
});

describe('phase 5 content parity', () => {
  it('keeps English and Spanish phase5 keys aligned', () => {
    const en = getDictionarySync('en').phase5;
    const es = getDictionarySync('es').phase5;
    expect(Object.keys(es)).toEqual(Object.keys(en));
    expect(es.projects.labels.before).toBeTruthy();
    expect(es.faq.title).toBeTruthy();
    expect(es.resources.title).toBeTruthy();
  });
});
