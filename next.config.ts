// src/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true, // Enable React Strict Mode for development
  // Note: watchOptions.ignored is not supported in Next.js NextConfig.
  // To ignore files, ensure .gitignore excludes logs, temp files, etc.,
  // and prevent editors/scripts from writing to watched directories.
};

export default nextConfig;