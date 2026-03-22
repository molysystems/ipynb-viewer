import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow serving .well-known directory for Digital Asset Links (TWA)
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
};

export default nextConfig;
