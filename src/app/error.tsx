"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

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
    <div className="flex flex-1 flex-col items-center justify-center px-page py-section text-center">
      <h1 className="font-serif text-page-title font-medium tracking-tight">出了点问题</h1>
      <p className="mt-3 max-w-reading text-body text-subtle">
        页面加载失败，请稍后重试。如果问题持续出现，请联系管理员。
      </p>
      <Button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6"
      >
        重试
      </Button>
    </div>
  );
}
