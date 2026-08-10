import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const adminAuditAction = pgEnum("admin_audit_action", [
  "poem_hidden",
  "poem_restored",
  "user_suspended",
  "user_restored",
  "user_promoted",
  "user_demoted",
  "invitation_created",
  "invitation_disabled",
  "announcement_created",
  "announcement_updated",
  "announcement_published",
]);

export const adminTargetType = pgEnum("admin_target_type", [
  "poem",
  "user",
  "invitation",
  "announcement",
]);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    codeHash: text("code_hash").notNull().unique(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    maxUses: integer("max_uses").notNull(),
    usedCount: integer("used_count").default(0).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    disabledAt: timestamp("disabled_at"),
    disabledBy: text("disabled_by").references(
      (): AnyPgColumn => user.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("invitation_expires_at_idx").on(table.expiresAt),
    index("invitation_disabled_at_idx").on(table.disabledAt),
    check("invitation_max_uses_check", sql`${table.maxUses} between 1 and 100`),
    check(
      "invitation_used_count_check",
      sql`${table.usedCount} >= 0 AND ${table.usedCount} <= ${table.maxUses}`,
    ),
    check(
      "invitation_disabled_state_check",
      sql`${table.disabledAt} IS NOT NULL OR ${table.disabledBy} IS NULL`,
    ),
  ],
);

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    action: adminAuditAction("action").notNull(),
    targetType: adminTargetType("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("admin_audit_log_created_at_idx").on(table.createdAt),
    check("admin_audit_log_reason_check", sql`trim(${table.reason}) <> ''`),
  ],
);

export const adminGuard = pgTable(
  "admin_guard",
  {
    id: integer("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check("admin_guard_id_check", sql`${table.id} = 1`),
  ],
);

export const invitationRelations = relations(invitation, ({ one }) => ({
  createdBy: one(user, {
    fields: [invitation.createdBy],
    references: [user.id],
  }),
  disabledBy: one(user, {
    fields: [invitation.disabledBy],
    references: [user.id],
  }),
}));

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  admin: one(user, {
    fields: [adminAuditLog.adminId],
    references: [user.id],
  }),
}));
