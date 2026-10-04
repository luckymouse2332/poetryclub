import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  paper: "bg-paper",
  muted: "bg-surface-muted",
  plain: "bg-transparent",
} as const;

type AdminDashboardCardProps = Readonly<{
  href: string;
  title: string;
  description: string;
  tone: keyof typeof TONE_CLASSES;
}>;

export function AdminDashboardCard({
  href,
  title,
  description,
  tone,
}: AdminDashboardCardProps) {
  return (
    <div
      data-slot="admin-dashboard-card"
      data-tone={tone}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full gap-0 transition-colors hover:border-primary/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background",
          TONE_CLASSES[tone],
        )}
      >
        <CardHeader className="border-b-0 pb-0">
          <CardTitle>
            <Link
              href={href}
              className="flex min-h-control items-center justify-between gap-4 after:absolute after:inset-0 no-underline transition-colors hover:text-primary focus-visible:outline-none"
            >
              {title}
              <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 text-primary" />
            </Link>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
