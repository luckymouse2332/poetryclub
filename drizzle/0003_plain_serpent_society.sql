CREATE TYPE "public"."user_role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."poem_moderation_status" AS ENUM('visible', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."admin_audit_action" AS ENUM('poem_hidden', 'poem_restored', 'user_suspended', 'user_restored', 'user_promoted', 'user_demoted', 'invitation_created', 'invitation_disabled');--> statement-breakpoint
CREATE TYPE "public"."admin_target_type" AS ENUM('poem', 'user', 'invitation');--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"action" "admin_audit_action" NOT NULL,
	"target_type" "admin_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_audit_log_reason_check" CHECK (trim("admin_audit_log"."reason") <> '')
);
--> statement-breakpoint
CREATE TABLE "admin_guard" (
	"id" integer PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_guard_id_check" CHECK ("admin_guard"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"created_by" text NOT NULL,
	"max_uses" integer NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"disabled_at" timestamp,
	"disabled_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_code_hash_unique" UNIQUE("code_hash"),
	CONSTRAINT "invitation_max_uses_check" CHECK ("invitation"."max_uses" between 1 and 100),
	CONSTRAINT "invitation_used_count_check" CHECK ("invitation"."used_count" >= 0 AND "invitation"."used_count" <= "invitation"."max_uses"),
	CONSTRAINT "invitation_disabled_state_check" CHECK ("invitation"."disabled_at" IS NOT NULL OR "invitation"."disabled_by" IS NULL)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "suspension_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "suspended_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "suspended_by" text;--> statement-breakpoint
ALTER TABLE "poem" ADD COLUMN "moderation_status" "poem_moderation_status" DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE "poem" ADD COLUMN "moderation_reason" text;--> statement-breakpoint
ALTER TABLE "poem" ADD COLUMN "moderated_at" timestamp;--> statement-breakpoint
ALTER TABLE "poem" ADD COLUMN "moderated_by" text;--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_disabled_by_user_id_fk" FOREIGN KEY ("disabled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_log_created_at_idx" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invitation_expires_at_idx" ON "invitation" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_disabled_at_idx" ON "invitation" USING btree ("disabled_at");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_suspended_by_user_id_fk" FOREIGN KEY ("suspended_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem" ADD CONSTRAINT "poem_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_status_idx" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "poem_status_moderation_status_published_at_idx" ON "poem" USING btree ("status","moderation_status","published_at");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_moderation_state_check" CHECK (("user"."status" = 'active' AND "user"."suspension_reason" IS NULL AND "user"."suspended_at" IS NULL AND "user"."suspended_by" IS NULL) OR ("user"."status" = 'suspended' AND trim(coalesce("user"."suspension_reason", '')) <> '' AND "user"."suspended_at" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "poem" ADD CONSTRAINT "poem_moderation_state_check" CHECK (("poem"."moderation_status" = 'visible' AND "poem"."moderation_reason" IS NULL AND "poem"."moderated_at" IS NULL AND "poem"."moderated_by" IS NULL) OR ("poem"."moderation_status" = 'hidden' AND trim(coalesce("poem"."moderation_reason", '')) <> '' AND "poem"."moderated_at" IS NOT NULL));--> statement-breakpoint
INSERT INTO "admin_guard" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;
