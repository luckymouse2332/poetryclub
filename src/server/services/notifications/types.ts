import type { AnnouncementAudience } from "@/server/validation/notifications";
import type { KnownNotificationType } from "./definitions";

export class NotificationMutationError extends Error {
  constructor(public readonly code: "not_found" | "forbidden") {
    super(code);
    this.name = "NotificationMutationError";
  }
}

export class AnnouncementMutationError extends Error {
  constructor(
    public readonly code:
      | "not_found"
      | "already_published"
      | "concurrent_conflict"
      | "empty_audience",
  ) {
    super(code);
    this.name = "AnnouncementMutationError";
  }
}

export type NotificationListItem = Readonly<{
  id: string;
  type: string;
  category: string;
  label: string;
  title: string;
  body: string;
  href: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: Date;
  readAt: Date | null;
}>;

export type NotificationPaginatedResult = Readonly<{
  items: ReadonlyArray<NotificationListItem>;
  page: number;
  pageCount: number;
  total: number;
}>;

export type AnnouncementSummary = Readonly<{
  id: string;
  title: string;
  body: string;
  href: string | null;
  audience: AnnouncementAudience;
  status: "draft" | "published";
  creatorName: string;
  notificationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}>;

export type UserAnnouncementDetail = Readonly<{
  id: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: Date;
  publishedAt: Date;
}>;

export type AnnouncementPaginatedResult = Readonly<{
  items: ReadonlyArray<AnnouncementSummary>;
  page: number;
  pageCount: number;
  total: number;
}>;

export type NotificationDispatch = Readonly<{
  notificationId: string;
  type: string;
  createdAt: Date;
  recipientIds: ReadonlyArray<string>;
}>;

export type CreateNotificationInput = Readonly<{
  type: KnownNotificationType | (string & {});
  title: string;
  body: string;
  href?: string | null;
  actorId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown>;
  dedupeKey: string;
  recipientIds: ReadonlyArray<string>;
}>;

