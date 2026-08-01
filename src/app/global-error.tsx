"use client";

import { useEffect } from "react";

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
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            backgroundColor: "#ffffff",
            color: "#18181b",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              出了点问题
            </h1>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
              页面加载失败，请稍后重试。
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                backgroundColor: "#4338ca",
                color: "#ffffff",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
