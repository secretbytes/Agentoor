import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all hostnames
      },
    ],
  },
  eslint :{
    ignoreDuringBuilds:true
  },
  typescript:{
    ignoreBuildErrors:true
    
  }
};

export default nextConfig;
