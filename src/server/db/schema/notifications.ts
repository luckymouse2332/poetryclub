import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const announcementStatus = pgEnum("announcement_status", [
  "draft",
  "published",
]);

export const announcementAudience = pgEnum("announcement_audience", [
  "all_accounts",
  "active_accounts",
  "active_members",
  "active_admins",
]);

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    actorId: text("actor_id").references((): AnyPgColumn => user.id, {
      onDelete: "set null",
    }),
    targetType: text("target_type"),
    targetId: text("target_id"),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("notification_dedupe_key_unique").on(table.dedupeKey),
    index("notification_created_at_idx").on(table.createdAt),
    index("notification_type_created_at_idx").on(table.type, table.createdAt),
    check("notification_type_check", sql`trim(${table.type}) <> ''`),
    check("notification_title_check", sql`trim(${table.title}) <> ''`),
    check("notification_body_check", sql`trim(${table.body}) <> ''`),
    check(
      "notification_target_pair_check",
      sql`(${table.targetType} IS NULL AND ${table.targetId} IS NULL) OR (${table.targetType} IS NOT NULL AND ${table.targetId} IS NOT NULL)`,
    ),
  ],
);

export const notificationRecipient = pgTable(
  "notification_recipient",
  {
    notificationId: text("notification_id")
      .notNull()
      .references(() => notification.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at"),
  },
  (table) => [
    primaryKey({
      name: "notification_recipient_pk",
      columns: [table.notificationId, table.userId],
    }),
    index("notification_recipient_user_read_idx").on(
      table.userId,
      table.readAt,
    ),
    index("notification_recipient_notification_idx").on(table.notificationId),
  ],
);

export const announcement = pgTable(
  "announcement",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    audience: announcementAudience("audience")
      .default("active_accounts")
      .notNull(),
    status: announcementStatus("status").default("draft").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    notificationId: text("notification_id").references(() => notification.id, {
      onDelete: "restrict",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    publishedAt: timestamp("published_at"),
  },
  (table) => [
    unique("announcement_notification_id_unique").on(table.notificationId),
    index("announcement_status_updated_at_idx").on(
      table.status,
      table.updatedAt,
    ),
    check("announcement_title_check", sql`trim(${table.title}) <> ''`),
    check("announcement_body_check", sql`trim(${table.body}) <> ''`),
    check(
      "announcement_publish_state_check",
      sql`(${table.status} = 'draft' AND ${table.publishedAt} IS NULL AND ${table.notificationId} IS NULL) OR (${table.status} = 'published' AND ${table.publishedAt} IS NOT NULL AND ${table.notificationId} IS NOT NULL)`,
    ),
  ],
);

export const notificationRelations = relations(notification, ({ one, many }) => ({
  actor: one(user, {
    fields: [notification.actorId],
    references: [user.id],
  }),
  recipients: many(notificationRecipient),
}));

export const notificationRecipientRelations = relations(
  notificationRecipient,
  ({ one }) => ({
    notification: one(notification, {
      fields: [notificationRecipient.notificationId],
      references: [notification.id],
    }),
    user: one(user, {
      fields: [notificationRecipient.userId],
      references: [user.id],
    }),
  }),
);

export const announcementRelations = relations(announcement, ({ one }) => ({
  creator: one(user, {
    fields: [announcement.createdBy],
    references: [user.id],
  }),
  notification: one(notification, {
    fields: [announcement.notificationId],
    references: [notification.id],
  }),
}));
