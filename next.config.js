/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output creates a minimal self-contained bundle for Docker/VPS.
  // Reduces Docker image size dramatically (copies only what's needed).
  output: process.env.VERCEL ? undefined : "standalone",

  // Suppress noisy Prisma/fs module warnings during Vercel build
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },

  // Silence the "module not found" warnings from Prisma on Vercel
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Webpack from bundling native Prisma binaries
      config.externals = [...(config.externals || []), "@prisma/client"];
    }
    return config;
  },
};

module.exports = nextConfig;
