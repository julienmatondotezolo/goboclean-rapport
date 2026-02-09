const createNextIntlPlugin = require("next-intl/plugin");
const withPWA = require("@ducanh2912/next-pwa").default;

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    disable: false, // Enable PWA in all environments
    register: true,
    skipWaiting: true,
    // Remove custom sw.js to avoid conflicts
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: false, // Disable aggressive caching for Safari compatibility
    reloadOnOnline: true,
    swcMinify: true,
    workboxOptions: {
      disableDevLogs: true,
      // Configure workbox to handle redirects properly
      navigateFallback: '/fr',
      navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.goboclean\.be\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'goboclean-api',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60, // 24 hours
            },
            networkTimeoutSeconds: 10,
          },
        },
        {
          urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'goboclean-images',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            },
          },
        },
      ],
    },
  })(nextConfig)
);
