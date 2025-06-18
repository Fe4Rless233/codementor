// ===== NEXT.CONFIG.JS =====
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true,  <-- REMOVE THIS LINE
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig