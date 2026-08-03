import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // `forbidden()`（M3 管理后台 403 边界）在 Next 16.2 仍是实验特性，必须显式启用。
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
