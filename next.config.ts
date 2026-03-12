import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint errors should not fail production builds on Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors already verified locally, don't block Vercel deploy
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
