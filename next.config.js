const createNextIntlPlugin = require("next-intl/plugin");
const withPWA = require("@ducanh2912/next-pwa").default;

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 🔒 Security Headers Configuration
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ihlnwzrsvfxgossytuiz.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https:",
      "connect-src 'self' http://localhost:3001 https://ihlnwzrsvfxgossytuiz.supabase.co https://api.goboclean.be wss://",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/fr",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = withNextIntl(
  withPWA({
    dest: "public",
    disable: false,
    register: true,
    skipWaiting: true,
    // Use our custom service worker to fix Safari redirect issues
    sw: 'sw.js', // Points to our custom public/sw.js
    reloadOnOnline: true,
    swcMinify: true,
    // Minimal workbox config since we're using custom SW
    workboxOptions: {
      mode: 'production',
      disableDevLogs: true,
    },
  })(nextConfig)
);
