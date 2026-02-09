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
