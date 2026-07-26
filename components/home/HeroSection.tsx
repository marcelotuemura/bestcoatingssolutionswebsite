'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { BrandLogoMark } from '@/components/brand/BrandLogoMark';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { brandLogo } from '@/config/brand-logo';
import { homePlaceholders } from '@/config/home-placeholders';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface HeroSectionProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

/**
 * Phase 5D cinematic hero — full-bleed atmosphere, brand first,
 * one message, two CTAs. No competing chrome in the first viewport.
 */
export function HeroSection({ locale, dictionary }: HeroSectionProps) {
  const reduce = useReducedMotion();
  const copy = dictionary.home.hero;
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden"
      data-testid="home-hero"
      aria-labelledby="home-hero-heading"
    >
      <div aria-hidden className="absolute inset-0">
        <Image
          src={homePlaceholders.marineVisual.src}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,13,24,0.72)_0%,rgba(5,13,24,0.55)_42%,rgba(5,13,24,0.88)_100%)]" />
        <div className="bcs-ocean-texture absolute inset-0 opacity-50" />
      </div>

      <Container className="relative z-10 flex min-h-[100svh] flex-col justify-end pt-28 pb-16 sm:justify-center sm:pt-32 sm:pb-24 lg:pb-28">
        <div className="max-w-3xl">
          <motion.div
            className="mb-10"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, ease }}
            data-testid="hero-brand-logo"
          >
            <BrandLogoMark
              maxHeightPx={brandLogo.recommendedMaxHeightPx.hero}
              priority
              className="max-w-[min(100%,22rem)]"
            />
            <span className="sr-only">{copy.logoAlt}</span>
          </motion.div>

          <motion.h1
            id="home-hero-heading"
            className="font-display text-text-primary text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.8, delay: 0.15, ease }
            }
          >
            {copy.headline}
          </motion.h1>

          <motion.p
            className="text-text-secondary mt-6 max-w-xl text-base text-pretty sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.7, delay: 0.28, ease }
            }
          >
            {copy.support}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.65, delay: 0.4, ease }
            }
          >
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.projects.path)}
              variant="secondary"
            >
              {dictionary.cta.viewWork}
            </ButtonLink>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
