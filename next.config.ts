import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cos.ap-guangzhou.myqcloud.com",
      },
      {
        protocol: "https",
        hostname: "*.myqcloud.com",
      },
    ],
  },
};

export default nextConfig;
