import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/debi0yfq9/**",
      },
      {
        protocol: "https",
        hostname: "ubizajfylazlruzbbzql.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
  experimental: {
  },

};

export default nextConfig;
