import { ProjectDetailPage } from '@/components/portfolio/ProjectDetailPage';
import {
  getProjectBySlug,
  getPublishedProjects,
  getVisibleProjects,
} from '@/config/projects';
import { includeTestFixtures } from '@/config/publication';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const projects = includeTestFixtures()
    ? getVisibleProjects()
    : getPublishedProjects();
  return locales.flatMap((locale) =>
    projects.map((project) => ({
      locale,
      slug: project.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const project = getProjectBySlug(slug);
  if (!project) {
    return {};
  }
  const copy = project.copy[raw];
  return buildPageMetadata({
    locale: raw,
    path: `/projects/${slug}`,
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }
  const dictionary = await getDictionary(locale);
  const copy = project.copy[locale];
  const crumbs = breadcrumbJsonLd(locale, [
    { name: dictionary.nav.home, path: '/' },
    { name: dictionary.nav.projects, path: '/projects' },
    { name: copy.title, path: `/projects/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <ProjectDetailPage
        locale={locale}
        dictionary={dictionary}
        project={project}
      />
    </>
  );
}
