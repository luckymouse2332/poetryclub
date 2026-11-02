import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E uses an isolated cache/lock so a local developer server can stay open.
  distDir: process.env.POETRYCLUB_E2E === "1" ? ".next/e2e" : ".next",
  output: "standalone",
  poweredByHeader: false,
  // `forbidden()` 仍需显式启用；React View Transition 自 Next 16.3 起
  // 无需配置（viewTransition flag 已移除）。
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
