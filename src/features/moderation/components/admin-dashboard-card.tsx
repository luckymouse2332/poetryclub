import Link from "next/link";

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
          "relative h-full border-0 shadow-none transition-colors has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-seal has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background",
          TONE_CLASSES[tone],
        )}
      >
        <CardHeader>
          <CardTitle>
            <Link
              href={href}
              className="after:absolute after:inset-0 no-underline transition-colors hover:text-seal-foreground focus-visible:outline-none"
            >
              {title}
            </Link>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
