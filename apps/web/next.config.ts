import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Allow images from Cloudflare R2 public domain and Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        // Replace with your custom R2 domain in production
        hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME ?? "videos.yourdomain.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Transpile internal workspace packages
  transpilePackages: ["@vibe3/ui", "@vibe3/db", "@vibe3/queue"],

  // Experimental features (Next.js 15+)
  experimental: {
    // Enable partial prerendering for mixed static/dynamic pages
    ppr: false,
  },
};

export default nextConfig;
