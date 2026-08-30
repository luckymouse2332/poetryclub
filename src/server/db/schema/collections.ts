import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { poem } from "./poems";

export const collectionStatus = pgEnum("collection_status", [
  "draft",
  "published",
]);

export const collectionModerationStatus = pgEnum(
  "collection_moderation_status",
  ["visible", "hidden"],
);

export const collectionVisibility = pgEnum("collection_visibility", [
  "public",
  "members_only",
]);

export const poemCollection = pgTable(
  "poem_collection",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: collectionStatus("status").default("draft").notNull(),
    visibility: collectionVisibility("visibility").default("public").notNull(),
    moderationStatus: collectionModerationStatus("moderation_status")
      .default("visible")
      .notNull(),
    moderationReason: text("moderation_reason"),
    moderatedAt: timestamp("moderated_at"),
    moderatedBy: text("moderated_by").references(
      (): AnyPgColumn => user.id,
      { onDelete: "set null" },
    ),
    creationToken: text("creation_token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    publishedAt: timestamp("published_at"),
  },
  (table) => [
    unique("collection_owner_creation_token_unique").on(
      table.ownerId,
      table.creationToken,
    ),
    index("collection_owner_updated_at_idx").on(table.ownerId, table.updatedAt),
    index("collection_publication_lookup_idx").on(
      table.status,
      table.moderationStatus,
      table.visibility,
      table.publishedAt,
    ),
    check(
      "collection_status_published_at_check",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),
    check(
      "collection_moderation_state_check",
      sql`(${table.moderationStatus} = 'visible' AND ${table.moderationReason} IS NULL AND ${table.moderatedAt} IS NULL AND ${table.moderatedBy} IS NULL) OR (${table.moderationStatus} = 'hidden' AND trim(coalesce(${table.moderationReason}, '')) <> '' AND ${table.moderatedAt} IS NOT NULL)`,
    ),
  ],
);

export const poemCollectionItem = pgTable(
  "poem_collection_item",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => poemCollection.id, { onDelete: "cascade" }),
    poemId: text("poem_id")
      .notNull()
      .references(() => poem.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "poem_collection_item_pk",
      columns: [table.collectionId, table.poemId],
    }),
    unique("poem_collection_item_position_unique").on(
      table.collectionId,
      table.position,
    ),
    index("poem_collection_item_poem_idx").on(table.poemId),
    check("poem_collection_item_position_check", sql`${table.position} >= 0`),
  ],
);

export const poemCollectionRelations = relations(
  poemCollection,
  ({ one, many }) => ({
    owner: one(user, {
      fields: [poemCollection.ownerId],
      references: [user.id],
    }),
    items: many(poemCollectionItem),
  }),
);

export const poemCollectionItemRelations = relations(
  poemCollectionItem,
  ({ one }) => ({
    collection: one(poemCollection, {
      fields: [poemCollectionItem.collectionId],
      references: [poemCollection.id],
    }),
    poem: one(poem, {
      fields: [poemCollectionItem.poemId],
      references: [poem.id],
    }),
  }),
);
