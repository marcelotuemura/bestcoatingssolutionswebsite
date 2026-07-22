'use client';

import { useEffect } from 'react';

/** Keep `<html lang>` in sync with the active locale segment. */
export function HtmlLang({ lang }: { readonly lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
