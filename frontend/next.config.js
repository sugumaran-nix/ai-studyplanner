/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,

  // Image domains (add your CDN / Supabase storage host here)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // API rewrites — dev only (proxy avoids CORS during local dev)
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/:path*`,
          },
        ]
      : [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
