"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log to the console. In production, a real error-reporting service
    // would be wired here. Do not expose the raw error to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">出了点问题</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        页面加载失败，请稍后重试。如果问题持续出现，请联系管理员。
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        重试
      </button>
    </div>
  );
}
