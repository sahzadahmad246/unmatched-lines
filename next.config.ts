import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dx28ql7ig/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "", // Google User Content uses the default HTTPS port
        pathname: "/**", // Allow any path from this hostname
      },
    ],
  },
  serverExternalPackages: ["mongoose"],
  output: "standalone",
};

export default nextConfig;