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
  // Enable wildcard subdomain routing for multi-tenant
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite subdomain requests to /masjid/[slug]
        {
          source: "/:path((?!_next|api|favicon.ico).*)",
          has: [
            {
              type: "host",
              value: "(?<slug>[^.]+)\\.(mosq\\.io|localhost)",
            },
          ],
          destination: "/masjid/:slug/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
