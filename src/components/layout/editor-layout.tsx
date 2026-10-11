import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** 不是上游组件：编辑正文与 sticky 设置栏的布局组合，不管理表单状态。 */
export function EditorLayout({
  children,
  settings,
  className,
  ...props
}: ComponentProps<"div"> & { settings: ReactNode }) {
  return (
    <div
      className={cn(
        "grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(17rem,0.8fr)]",
        className,
      )}
      {...props}
    >
      {children}
      <div className="space-y-4 xl:sticky xl:top-8">{settings}</div>
    </div>
  );
}
