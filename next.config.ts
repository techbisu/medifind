import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Don't ignore TypeScript errors — they should be fixed, not shipped
  typescript: {
    ignoreBuildErrors: false,
  },
  // Note: Next.js 16 removed the `eslint` config key. Linting is now done
  // via `next lint` or your eslint.config.mjs directly. To fail builds on
  // lint errors, run `bun run lint` in your CI pipeline before `next build`.
  // Enable React strict mode to catch bugs in development
  reactStrictMode: true,
  // Security headers — applied to all responses
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy — only send origin to same site
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy — disable unused browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // Content Security Policy — restrict resource loading
          // 'unsafe-inline' needed for Next.js styles; 'unsafe-eval' needed for dev only
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.mapbox.com https://maps.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.mapbox.com https://maps.googleapis.com ws:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          // HSTS — force HTTPS for 1 year (only sent over HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Cross-Origin policies
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
};

export default nextConfig;
