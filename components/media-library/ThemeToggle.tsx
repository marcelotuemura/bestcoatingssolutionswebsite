'use client';

import { useEffect, useState } from 'react';

export type MediaTheme = 'dark' | 'light';

const STORAGE_KEY = 'bcs-media-theme';

export function useMediaTheme() {
  const [theme, setThemeState] = useState<MediaTheme>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preferred: MediaTheme =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    setThemeState(preferred);
    document.documentElement.dataset.mediaTheme = preferred;
    setReady(true);
  }, []);

  function setTheme(next: MediaTheme) {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.mediaTheme = next;
  }

  function toggleTheme() {
    setThemeState((current) => {
      const next: MediaTheme = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.dataset.mediaTheme = next;
      return next;
    });
  }

  return { theme, setTheme, toggleTheme, ready };
}

export function ThemeToggle() {
  const { theme, toggleTheme, ready } = useMediaTheme();
  if (!ready) {
    return (
      <span
        className="border-navy-700 text-silver-500 inline-flex h-8 w-20 rounded-lg border px-2 text-xs"
        aria-hidden="true"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="border-navy-700 bg-navy-900/70 text-silver-300 hover:border-electric-500 focus-visible:ring-electric-500 media-light:border-slate-300 media-light:bg-white media-light:text-slate-700 rounded-lg border px-3 py-1.5 text-xs transition focus-visible:ring-2 focus-visible:outline-none"
      data-testid="media-theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      data-theme={theme}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
