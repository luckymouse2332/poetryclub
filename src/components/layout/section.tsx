import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  as?: "h2" | "h3" | "h4";
  className?: string;
  children: React.ReactNode;
};

function Section({
  title,
  description,
  actions,
  as: Heading = "h2",
  className,
  children,
}: SectionProps) {
  const hasHeader =
    title !== undefined || description !== undefined || actions !== undefined;
  const hasCopy = title !== undefined || description !== undefined;

  return (
    <section className={cn("py-section", className)}>
      {hasHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          {hasCopy ? (
            <div className="max-w-reading space-y-1">
              {title ? (
                typeof title === "string" ? (
                  <Heading className="text-section-title font-semibold text-foreground">
                    {title}
                  </Heading>
                ) : (
                  title
                )
              ) : null}
              {description ? (
                <p className="text-body text-subtle">{description}</p>
              ) : null}
            </div>
          ) : null}
          {actions ? (
            <div className="ml-auto flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(hasHeader && "mt-6")}>{children}</div>
    </section>
  );
}

export { Section };
