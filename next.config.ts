import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // `forbidden()` 与 React View Transition 在 Next 16.2 仍需显式启用。
  experimental: {
    authInterrupts: true,
    viewTransition: true,
  },
};

export default nextConfig;
