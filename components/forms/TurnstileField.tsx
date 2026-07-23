'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile widget. Renders only when a site key is provided.
 */
export function TurnstileField({
  siteKey,
  onTokenChange,
  label,
}: {
  readonly siteKey: string;
  readonly onTokenChange: (token: string | null) => void;
  readonly label: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);

  onTokenChangeRef.current = onTokenChange;

  useEffect(() => {
    if (!siteKey) {
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-bcs-turnstile="true"]',
    );
    if (existing) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.dataset.bcsTurnstile = 'true';
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, [siteKey]);

  useEffect(() => {
    if (
      !scriptReady ||
      !siteKey ||
      !containerRef.current ||
      !window.turnstile
    ) {
      return;
    }
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (token) => onTokenChangeRef.current(token),
      'expired-callback': () => onTokenChangeRef.current(null),
      'error-callback': () => onTokenChangeRef.current(null),
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid="turnstile-field">
      <p className="text-silver-400 text-sm">{label}</p>
      <div ref={containerRef} />
    </div>
  );
}

export function resetTurnstileWidget(): void {
  if (typeof window !== 'undefined' && window.turnstile) {
    window.turnstile.reset();
  }
}
