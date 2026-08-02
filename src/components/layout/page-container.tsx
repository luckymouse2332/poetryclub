import * as React from "react";

import { cn } from "@/lib/utils";

const containerWidthClasses = {
  content: "max-w-content",
  reading: "max-w-reading",
  narrow: "max-w-narrow",
} as const;

export type PageContainerProps = {
  as?: React.ElementType;
  width?: keyof typeof containerWidthClasses;
  className?: string;
  children: React.ReactNode;
};

function PageContainer({
  as,
  width = "content",
  className,
  children,
}: PageContainerProps) {
  const Comp: React.ElementType = as ?? "div";
  return (
    <Comp
      className={cn(
        "mx-auto w-full px-page py-section",
        containerWidthClasses[width],
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export { PageContainer };
