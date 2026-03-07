import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ["10.17.180.145:3000", "localhost:3000"]
  } as any // Use 'any' in case NextConfig types aren't fully up-to-date yet
};

export default nextConfig;
