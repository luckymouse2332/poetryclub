import * as React from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
};

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  align = "start",
  as: Heading = "h1",
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-label font-semibold text-seal">{eyebrow}</p>
      ) : null}
      {typeof title === "string" ? (
        <Heading className="font-serif text-page-title font-medium tracking-tight text-foreground">
          {title}
        </Heading>
      ) : (
        title
      )}
      {description ? (
        <p className="max-w-reading text-body text-subtle">{description}</p>
      ) : null}
      {actions ? (
        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-2",
            align === "center" && "justify-center",
          )}
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export { PageHeader };
