/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output only when NOT on Vercel (for lean Docker images).
  // On Vercel, output must be undefined — Vercel handles its own output format.
  // safe-build.js sets SHIPYARD_STANDALONE=1 when building for Docker.
  output: process.env.VERCEL ? undefined : (process.env.SHIPYARD_STANDALONE === "1" ? "standalone" : undefined),

  // Suppress Prisma native module warnings (Next.js 14 key)
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },

  // Webpack: prevent bundling of Prisma native binaries
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [...existing, "@prisma/client"];
    }
    return config;
  },

  // Allow cross-origin images if needed in the future
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
