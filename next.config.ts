import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E uses an isolated cache/lock so a local developer server can stay open.
  distDir: process.env.POETRYCLUB_E2E === "1" ? ".next/e2e" : ".next",
  output: "standalone",
  poweredByHeader: false,
  // `forbidden()` 与 React View Transition 在 Next 16.2 仍需显式启用。
  experimental: {
    authInterrupts: true,
    viewTransition: true,
  },
};

export default nextConfig;
