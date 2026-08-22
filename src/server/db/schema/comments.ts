import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { poem } from "./poems";

export const commentModerationStatus = pgEnum("comment_moderation_status", [
  "visible",
  "hidden",
]);

export const poemComment = pgTable(
  "poem_comment",
  {
    id: text("id").primaryKey(),
    poemId: text("poem_id")
      .notNull()
      .references(() => poem.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references(
      (): AnyPgColumn => poemComment.id,
      { onDelete: "cascade" },
    ),
    rootId: text("root_id")
      .notNull()
      .references((): AnyPgColumn => poemComment.id, { onDelete: "cascade" }),
    depth: integer("depth").notNull(),
    body: text("body").notNull(),
    creationToken: text("creation_token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    editedAt: timestamp("edited_at"),
    deletedAt: timestamp("deleted_at"),
    lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
    moderationStatus: commentModerationStatus("moderation_status")
      .default("visible")
      .notNull(),
    moderationReason: text("moderation_reason"),
    moderatedAt: timestamp("moderated_at"),
    moderatedBy: text("moderated_by").references(
      (): AnyPgColumn => user.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    unique("poem_comment_author_creation_token_unique").on(
      table.authorId,
      table.creationToken,
    ),
    index("poem_comment_poem_depth_activity_idx").on(
      table.poemId,
      table.depth,
      table.lastActivityAt,
      table.id,
    ),
    index("poem_comment_root_created_idx").on(
      table.rootId,
      table.createdAt,
      table.id,
    ),
    index("poem_comment_author_created_idx").on(
      table.authorId,
      table.createdAt,
    ),
    index("poem_comment_moderation_created_idx").on(
      table.moderationStatus,
      table.createdAt,
      table.id,
    ),
    check("poem_comment_depth_check", sql`${table.depth} >= 0`),
    check(
      "poem_comment_hierarchy_check",
      sql`(${table.depth} = 0 AND ${table.parentId} IS NULL AND ${table.rootId} = ${table.id}) OR (${table.depth} > 0 AND ${table.parentId} IS NOT NULL AND ${table.rootId} <> ${table.id})`,
    ),
    check(
      "poem_comment_body_check",
      sql`(${table.deletedAt} IS NULL AND char_length(trim(${table.body})) BETWEEN 1 AND 2000) OR (${table.deletedAt} IS NOT NULL AND ${table.body} = '')`,
    ),
    check(
      "poem_comment_moderation_state_check",
      sql`(${table.moderationStatus} = 'visible' AND ${table.moderationReason} IS NULL AND ${table.moderatedAt} IS NULL AND ${table.moderatedBy} IS NULL) OR (${table.moderationStatus} = 'hidden' AND trim(coalesce(${table.moderationReason}, '')) <> '' AND ${table.moderatedAt} IS NOT NULL)`,
    ),
  ],
);

export const poemCommentRelations = relations(poemComment, ({ one, many }) => ({
  poem: one(poem, {
    fields: [poemComment.poemId],
    references: [poem.id],
  }),
  author: one(user, {
    fields: [poemComment.authorId],
    references: [user.id],
    relationName: "comment_author",
  }),
  parent: one(poemComment, {
    fields: [poemComment.parentId],
    references: [poemComment.id],
    relationName: "comment_parent",
  }),
  children: many(poemComment, { relationName: "comment_parent" }),
  root: one(poemComment, {
    fields: [poemComment.rootId],
    references: [poemComment.id],
    relationName: "comment_root",
  }),
  thread: many(poemComment, { relationName: "comment_root" }),
  moderator: one(user, {
    fields: [poemComment.moderatedBy],
    references: [user.id],
    relationName: "comment_moderator",
  }),
}));
