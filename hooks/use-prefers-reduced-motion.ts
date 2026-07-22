'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to prefers-reduced-motion. Defaults to true on the server and
 * before hydration so we never flash motion for users who prefer reduced.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(media.matches);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}
