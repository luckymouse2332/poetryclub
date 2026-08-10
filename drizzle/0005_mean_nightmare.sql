CREATE TYPE "public"."announcement_audience" AS ENUM('all_accounts', 'active_accounts', 'active_members', 'active_admins');--> statement-breakpoint
CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'announcement_created';--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'announcement_updated';--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'announcement_published';--> statement-breakpoint
ALTER TYPE "public"."admin_target_type" ADD VALUE 'announcement';--> statement-breakpoint
CREATE TABLE "announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"href" text,
	"audience" "announcement_audience" DEFAULT 'active_accounts' NOT NULL,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"notification_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "announcement_notification_id_unique" UNIQUE("notification_id"),
	CONSTRAINT "announcement_title_check" CHECK (trim("announcement"."title") <> ''),
	CONSTRAINT "announcement_body_check" CHECK (trim("announcement"."body") <> ''),
	CONSTRAINT "announcement_publish_state_check" CHECK (("announcement"."status" = 'draft' AND "announcement"."published_at" IS NULL AND "announcement"."notification_id" IS NULL) OR ("announcement"."status" = 'published' AND "announcement"."published_at" IS NOT NULL AND "announcement"."notification_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"href" text,
	"actor_id" text,
	"target_type" text,
	"target_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dedupe_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_dedupe_key_unique" UNIQUE("dedupe_key"),
	CONSTRAINT "notification_type_check" CHECK (trim("notification"."type") <> ''),
	CONSTRAINT "notification_title_check" CHECK (trim("notification"."title") <> ''),
	CONSTRAINT "notification_body_check" CHECK (trim("notification"."body") <> ''),
	CONSTRAINT "notification_target_pair_check" CHECK (("notification"."target_type" IS NULL AND "notification"."target_id" IS NULL) OR ("notification"."target_type" IS NOT NULL AND "notification"."target_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "notification_recipient" (
	"notification_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp,
	CONSTRAINT "notification_recipient_pk" PRIMARY KEY("notification_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_status_updated_at_idx" ON "announcement" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notification_type_created_at_idx" ON "notification" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "notification_recipient_user_read_idx" ON "notification_recipient" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notification_recipient_notification_idx" ON "notification_recipient" USING btree ("notification_id");