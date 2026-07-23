import type { NextConfig } from 'next';

/**
 * Next.js configuration.
 *
 * Kept intentionally lean. Security headers, image remote patterns and future
 * integration rewrites (Supabase / Stripe / customer portal) will be layered in
 * as those features land, so each addition is traceable in git history.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Estimate multi-photo uploads (policy max ≈ 8 × ~5MB) need headroom.
      bodySizeLimit: '40mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
