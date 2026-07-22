'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { homePlaceholders } from '@/config/home-placeholders';
import { routes } from '@/config/routes';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface HeroSectionProps {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}

export function HeroSection({ locale, dictionary }: HeroSectionProps) {
  const reduce = useReducedMotion();
  const copy = dictionary.home.hero;

  return (
    <header className="relative isolate min-h-[100svh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(10,132,255,0.18),transparent_45%),radial-gradient(ellipse_at_80%_0%,rgba(59,157,255,0.12),transparent_40%),linear-gradient(180deg,#050d18_0%,#0a1a2f_48%,#050d18_100%)]"
      />
      <div
        aria-hidden
        className="bcs-ocean-texture pointer-events-none absolute inset-0 opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-70"
      >
        <Image
          src={homePlaceholders.marineVisual.src}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-bottom"
          sizes="100vw"
        />
      </div>

      <Container className="relative z-10 flex min-h-[100svh] flex-col justify-center py-24 sm:py-28">
        <div className="max-w-3xl">
          <motion.div
            className="relative mb-10 inline-block"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <Image
              src={homePlaceholders.logo.src}
              alt={copy.logoAlt}
              width={320}
              height={96}
              priority
              unoptimized
              className="h-auto w-[min(100%,20rem)]"
            />
            {reduce ? null : (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-2 -left-1/3 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-[#3b9dff]/50 to-transparent"
                initial={{ x: '-10%', opacity: 0 }}
                animate={{ x: '320%', opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, delay: 0.35, ease: 'easeInOut' }}
              />
            )}
          </motion.div>

          <motion.h1
            className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }
            }
          >
            {copy.headline}
          </motion.h1>

          <motion.p
            className="text-silver-300 mt-5 max-w-xl text-base text-pretty sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }
            }
          >
            {copy.support}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.55, delay: 0.85, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <ButtonLink href={localePath(locale, routes.estimateRequest.path)}>
              {dictionary.cta.estimate}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, routes.scheduleVisit.path)}
              variant="secondary"
            >
              {dictionary.cta.schedule}
            </ButtonLink>
          </motion.div>
        </div>
      </Container>
    </header>
  );
}
