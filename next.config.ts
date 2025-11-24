import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  // allowedDevOrigins: ["*.example.com"],
  experimental: {
    authInterrupts: true,
    // ppr: "incremental",
  },
};

export default nextConfig;
