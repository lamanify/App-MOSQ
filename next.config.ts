import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
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
      {
        protocol: "https",
        hostname: "www.e-solat.gov.my",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimistic client cache for faster navigation
    optimisticClientCache: true,
  },

  // Enable compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Caching headers for static assets
  async headers() {
    return [
      {
        // Cache static assets for 1 year
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache JS/CSS chunks for 1 year (they have content hashes)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache tenant pages with stale-while-revalidate
        source: "/masjid/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },

  // Rewrites for subdomain handling can be added here if needed
  async rewrites() {
    return [];
  },
};

export default nextConfig;
