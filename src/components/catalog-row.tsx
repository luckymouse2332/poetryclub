import Link from "next/link";
import type { ReactNode } from "react";

/** 不是上游组件：公开目录行，业务负责日期格式、摘要排版及元数据内容。 */
export function CatalogRow({
  date,
  href,
  title,
  titleLevel: Heading = "h2",
  description,
  metadata,
}: {
  date: ReactNode;
  href: string;
  title: ReactNode;
  titleLevel?: "h2" | "h3";
  description?: ReactNode;
  metadata: ReactNode;
}) {
  return (
    <article className="grid min-w-0 gap-4 bg-transparent py-6 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-8 sm:py-8">
      {date}
      <Heading className="min-w-0 font-serif text-section-title font-normal text-foreground">
        <Link
          href={href}
          className="block min-h-control content-center wrap-anywhere underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:text-primary focus-visible:decoration-primary"
        >
          {title}
        </Link>
      </Heading>
      {description ? (
        <div className="min-w-0 sm:col-start-2">{description}</div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-start-2">
        {metadata}
      </div>
    </article>
  );
}
