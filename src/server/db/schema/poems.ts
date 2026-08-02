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

import { user } from "./auth";

export const poemStatus = pgEnum("poem_status", ["draft", "published"]);

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
  },
  (table) => [
    unique("poem_author_id_creation_token_unique").on(
      table.authorId,
      table.creationToken,
    ),
    index("poem_status_published_at_idx").on(table.status, table.publishedAt),
    index("poem_author_id_updated_at_idx").on(table.authorId, table.updatedAt),
    check(
      "poem_status_published_at_check",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),
  ],
);

export const poemRelations = relations(poem, ({ one }) => ({
  author: one(user, {
    fields: [poem.authorId],
    references: [user.id],
  }),
}));
