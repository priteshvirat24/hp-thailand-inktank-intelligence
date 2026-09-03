import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Server-only packages to prevent client-side credential bundling
  serverExternalPackages: ['zod'],
};

export default nextConfig;
