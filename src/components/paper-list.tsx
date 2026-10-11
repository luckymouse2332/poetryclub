import { Children, type ComponentProps, type ReactNode } from "react";

import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

/** 不是上游组件：Surface 与连续目录分隔的组合，Card 行自行承担横向留白。 */
export function PaperList({
  children,
  empty,
  inset = true,
  orderedStart,
  className,
  ...props
}: Omit<ComponentProps<typeof Surface>, "variant" | "padding"> & {
  empty?: ReactNode;
  inset?: boolean;
  orderedStart?: number;
}) {
  const populated = Children.toArray(children).length > 0;
  return (
    <Surface
      variant="paper"
      padding="none"
      data-slot="directory-surface"
      className={cn(className)}
      {...props}
    >
      <div
        data-slot={populated ? "paper-list-content" : "paper-list-empty"}
        className={cn(
          !populated && "[&>[data-slot=empty]]:border-0",
          (inset || !populated) && "px-4 sm:px-6 lg:px-8",
        )}
      >
        {populated ? (
          orderedStart === undefined ? (
            <div className="divide-y divide-border-subtle">
              {Children.toArray(children).map((child) => (
                <div
                  key={
                    typeof child === "object" && "key" in child
                      ? child.key
                      : String(child)
                  }
                  data-slot="paper-list-row"
                >
                  {child}
                </div>
              ))}
            </div>
          ) : (
            <ol
              start={orderedStart}
              className="list-decimal divide-y divide-border-subtle pl-6"
            >
              {children}
            </ol>
          )
        ) : (
          empty
        )}
      </div>
    </Surface>
  );
}
