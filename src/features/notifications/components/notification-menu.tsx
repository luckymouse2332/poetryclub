"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SiteNavLink } from "@/components/site-nav-link";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import type { NotificationView } from "@/features/notifications/formatters";

type NotificationPopoverProps = Readonly<{
  unreadCount: number;
  items: ReadonlyArray<NotificationView>;
  className: string;
}>;

type NotificationNavigationProps = NotificationPopoverProps;

function NotificationUnreadDot({ unreadCount }: { unreadCount: number }) {
  return unreadCount > 0 ? (
    <span
      role="img"
      aria-label="有未读通知"
      className="ml-1 size-1.5 shrink-0 rounded-full bg-seal"
    />
  ) : null;
}

export function NotificationPopover({
  unreadCount,
  items,
  className,
}: NotificationPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    const stream = new EventSource("/api/notifications/stream");
    const refresh = () => {
      setStreamError(false);
      router.refresh();
    };
    const handleOpen = () => setStreamError(false);
    const handleUnavailable = () => setStreamError(true);
    const handleError = () => setStreamError(true);
    stream.addEventListener("notification", refresh);
    stream.addEventListener("open", handleOpen);
    stream.addEventListener("unavailable", handleUnavailable);
    stream.addEventListener("error", handleError);
    return () => {
      stream.removeEventListener("notification", refresh);
      stream.removeEventListener("open", handleOpen);
      stream.removeEventListener("unavailable", handleUnavailable);
      stream.removeEventListener("error", handleError);
      stream.close();
    };
  }, [router]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={className}
          aria-label={`通知，${unreadCount} 条未读`}
        >
          通知
          <NotificationUnreadDot unreadCount={unreadCount} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(26rem,calc(100vw-2rem))] max-h-[min(34rem,calc(100vh-2rem))] overflow-hidden p-0"
      >
        <div className="flex max-h-[min(34rem,calc(100vh-2rem))] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-4 py-4">
            <div>
              <PopoverTitle className="text-body font-semibold">
                最近通知
              </PopoverTitle>
              <PopoverDescription className="mt-1 text-caption text-subtle">
                快速查看最近收到的站内消息
              </PopoverDescription>
            </div>
            <span className="shrink-0 text-label text-subtle">
              {unreadCount} 条未读
            </span>
          </header>
          {streamError ? (
            <p
              role="status"
              className="border-b border-border-subtle bg-warning-surface px-4 py-2 text-caption text-warning"
            >
              实时更新暂时不可用，通知中心仍可正常查看。
            </p>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto px-3">
            {items.length > 0 ? (
              <ul aria-label="最近通知">
                {items.map((item) => (
                  <NotificationListItem
                    key={item.id}
                    notification={item}
                    variant="preview"
                  />
                ))}
              </ul>
            ) : (
              <p className="px-3 py-10 text-center text-label text-subtle">
                还没有通知
              </p>
            )}
          </div>
          <footer className="border-t border-border-subtle p-2">
            <Link
              href="/notifications"
              className="flex min-h-control items-center justify-center rounded-md px-3 py-2 text-label font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              查看全部通知
            </Link>
          </footer>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NotificationNavigation({
  unreadCount,
  items,
  className,
}: NotificationNavigationProps) {
  return (
    <>
      <li className="lg:hidden">
        <SiteNavLink
          href="/notifications"
          match="prefix"
          className={className}
        >
          通知
          <NotificationUnreadDot unreadCount={unreadCount} />
        </SiteNavLink>
      </li>
      <li className="hidden lg:block">
        <NotificationPopover
          unreadCount={unreadCount}
          items={items}
          className={className}
        />
      </li>
    </>
  );
}
