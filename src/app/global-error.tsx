"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import "./globals.css";

// Global error UI must define its own <html> and <body>, and it replaces the
// root layout when active, so global styles from globals.css may not apply.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="text-center">
            <h1 className="text-section-title font-semibold">出了点问题</h1>
            <p className="mt-2 text-label text-muted-foreground">
              页面加载失败，请稍后重试。
            </p>
            <Button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-4"
            >
              重试
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
