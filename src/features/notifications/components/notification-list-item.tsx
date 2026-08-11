"use client";

import { useFormStatus } from "react-dom";

import {
  markNotificationReadAction,
  openNotificationAction,
} from "@/features/notifications/actions";
import type { NotificationView } from "@/features/notifications/formatters";
import { cn } from "@/lib/utils";

type NotificationListItemProps = Readonly<{
  notification: NotificationView;
  variant?: "preview" | "full";
}>;

function NotificationActionButton({
  notification,
  variant,
}: NotificationListItemProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "relative flex w-full flex-col items-start text-left transition-colors hover:bg-surface-muted/60 focus-visible:bg-surface-muted/60 disabled:cursor-wait disabled:opacity-60",
        variant === "preview" ? "px-3 py-3" : "px-4 py-4",
      )}
    >
      <NotificationListItemContent
        notification={notification}
        variant={variant}
        pending={pending}
      />
    </button>
  );
}

function NotificationListItemContent({
  notification,
  variant = "full",
  pending = false,
}: NotificationListItemProps & { pending?: boolean }) {
  return (
    <>
      <span className="flex w-full items-center gap-2">
        {notification.unread ? (
          <span
            className="h-5 w-0.5 shrink-0 rounded-full bg-seal"
            aria-label="未读"
          />
        ) : null}
        <span className="text-caption text-subtle">{notification.label}</span>
        <time
          dateTime={notification.createdAtISO}
          className="ml-auto shrink-0 text-caption text-subtle"
        >
          {notification.createdAtLabel}
        </time>
      </span>
      <span
        className={cn(
          "mt-1 line-clamp-2 w-full text-foreground",
          notification.unread ? "font-semibold" : "font-medium",
          variant === "preview" ? "text-label" : "text-body",
        )}
      >
        {notification.title}
      </span>
      <span
        className={cn(
          "mt-1 line-clamp-2 w-full text-subtle",
          variant === "preview" ? "text-caption" : "text-body",
        )}
      >
        {notification.body}
      </span>
      {pending ? (
        <span className="mt-2 text-caption text-muted-foreground">
          正在处理…
        </span>
      ) : null}
    </>
  );
}

export function NotificationListItem({
  notification,
  variant = "full",
}: NotificationListItemProps) {
  const action = notification.href
    ? openNotificationAction.bind(null, notification.id)
    : notification.unread
      ? markNotificationReadAction.bind(null, notification.id)
      : null;

  return (
    <li
      data-unread={notification.unread}
      className="border-b border-border-subtle last:border-b-0 data-[unread=true]:bg-seal-surface/40"
    >
      {action ? (
        <form action={action}>
          <NotificationActionButton
            notification={notification}
            variant={variant}
          />
        </form>
      ) : (
        <div
          className={cn(
            "flex w-full flex-col items-start text-left",
            variant === "preview" ? "px-3 py-3" : "px-4 py-4",
          )}
        >
          <NotificationListItemContent
            notification={notification}
            variant={variant}
          />
        </div>
      )}
    </li>
  );
}
