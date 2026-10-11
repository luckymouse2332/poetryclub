import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** 不是上游组件：纯文本诗歌纸页；调用方可显式覆盖预览的字号与留白。 */
export function PoemReading({
  className,
  ...props
}: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "mt-8 border-y border-border bg-paper px-4 py-10 font-serif text-body-lg leading-loose whitespace-pre-wrap text-foreground sm:px-6 sm:py-12 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

/** 不是上游组件：阅读背景说明，调用方指定标题 ID，保留二级标题语义。 */
export function ReadingContext({
  title = "创作背景",
  titleId,
  children,
  className,
  ...props
}: ComponentProps<"section"> & { title?: string; titleId?: string }) {
  return (
    <section className={cn(className)} {...props}>
      <h2
        id={titleId}
        className="font-serif text-section-title font-medium text-foreground"
      >
        {title}
      </h2>
      <p className="mt-3 text-body whitespace-pre-wrap text-subtle">
        {children}
      </p>
    </section>
  );
}
