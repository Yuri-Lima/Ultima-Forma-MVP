import { useEffect, useState } from 'react';

/**
 * Returns true when the media query matches (e.g. viewport is below the breakpoint).
 * Uses 1024px to match Tailwind's default `lg` breakpoint.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(max-width: 1023px)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const handler = () => setIsMobile(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
