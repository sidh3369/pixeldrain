import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: false, // ❌ breaks App Router route handlers
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
