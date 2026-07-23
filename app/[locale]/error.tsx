'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { getDictionarySync } from '@/i18n/get-dictionary';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { useParams } from 'next/navigation';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const raw = params?.locale;
  const locale: Locale =
    typeof raw === 'string' && isLocale(raw) ? raw : defaultLocale;
  const dictionary = getDictionarySync(locale);
  const copy = dictionary.conversion.error;

  useEffect(() => {
    // Avoid logging sensitive details; digest only for diagnostics.
    if (process.env.NODE_ENV !== 'production') {
      console.error('Locale error boundary', error.digest ?? error.message);
    }
  }, [error]);

  return (
    <main id="main-content">
      <Section>
        <Container narrow className="text-center">
          <Heading as="h1">{copy.title}</Heading>
          <p className="text-silver-300 mt-4 text-pretty">{copy.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={reset}>
              {copy.retry}
            </Button>
            <ButtonLink href={localePath(locale)} variant="secondary">
              {dictionary.nav.home}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
