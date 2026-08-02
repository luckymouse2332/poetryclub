import * as React from "react";

import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="text-muted-foreground [&_svg]:size-8" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3 className="text-body font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-reading text-body text-subtle">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
