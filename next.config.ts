import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'site.dwvapp.com.br' },
    ],
  },
};

export default nextConfig;
