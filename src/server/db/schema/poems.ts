import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const poemStatus = pgEnum("poem_status", ["draft", "published"]);

export const poemModerationStatus = pgEnum("poem_moderation_status", [
  "visible",
  "hidden",
]);

export const poemVisibility = pgEnum("poem_visibility", [
  "public",
  "members_only",
]);

export const poem = pgTable(
  "poem",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    context: text("context"),
    occurredAt: timestamp("occurred_at"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: poemStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    publishedAt: timestamp("published_at"),
    creationToken: text("creation_token").notNull(),
    moderationStatus: poemModerationStatus("moderation_status")
      .default("visible")
      .notNull(),
    visibility: poemVisibility("visibility").default("public").notNull(),
    moderationReason: text("moderation_reason"),
    moderatedAt: timestamp("moderated_at"),
    moderatedBy: text("moderated_by").references(
      (): AnyPgColumn => user.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    unique("poem_author_id_creation_token_unique").on(
      table.authorId,
      table.creationToken,
    ),
    index("poem_status_published_at_idx").on(table.status, table.publishedAt),
    index("poem_author_id_updated_at_idx").on(table.authorId, table.updatedAt),
    index("poem_status_moderation_visibility_published_at_idx").on(
      table.status,
      table.moderationStatus,
      table.visibility,
      table.publishedAt,
    ),
    check(
      "poem_status_published_at_check",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),
    check(
      "poem_moderation_state_check",
      sql`(${table.moderationStatus} = 'visible' AND ${table.moderationReason} IS NULL AND ${table.moderatedAt} IS NULL AND ${table.moderatedBy} IS NULL) OR (${table.moderationStatus} = 'hidden' AND trim(coalesce(${table.moderationReason}, '')) <> '' AND ${table.moderatedAt} IS NOT NULL)`,
    ),
  ],
);

export const poemRelations = relations(poem, ({ one }) => ({
  author: one(user, {
    fields: [poem.authorId],
    references: [user.id],
  }),
}));
