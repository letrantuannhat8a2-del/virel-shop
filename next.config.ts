import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép điện thoại trong cùng mạng LAN
  // truy cập Next.js development resources
  allowedDevOrigins: [
    "192.168.1.8",
  ],

  // Cho phép Next/Image hiển thị ảnh từ Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "qcqztlraqtzhypkinrco.supabase.co",
        pathname:
          "/storage/v1/object/public/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;