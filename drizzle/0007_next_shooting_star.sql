CREATE TYPE "public"."collection_moderation_status" AS ENUM('visible', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."collection_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."collection_visibility" AS ENUM('public', 'members_only');--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'collection_hidden';--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'collection_restored';--> statement-breakpoint
ALTER TYPE "public"."admin_target_type" ADD VALUE 'collection';--> statement-breakpoint
CREATE TABLE "poem_collection" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"status" "collection_status" DEFAULT 'draft' NOT NULL,
	"visibility" "collection_visibility" DEFAULT 'public' NOT NULL,
	"moderation_status" "collection_moderation_status" DEFAULT 'visible' NOT NULL,
	"moderation_reason" text,
	"moderated_at" timestamp,
	"moderated_by" text,
	"creation_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "collection_owner_creation_token_unique" UNIQUE("owner_id","creation_token"),
	CONSTRAINT "collection_status_published_at_check" CHECK ("poem_collection"."status" <> 'published' OR "poem_collection"."published_at" IS NOT NULL),
	CONSTRAINT "collection_moderation_state_check" CHECK (("poem_collection"."moderation_status" = 'visible' AND "poem_collection"."moderation_reason" IS NULL AND "poem_collection"."moderated_at" IS NULL AND "poem_collection"."moderated_by" IS NULL) OR ("poem_collection"."moderation_status" = 'hidden' AND trim(coalesce("poem_collection"."moderation_reason", '')) <> '' AND "poem_collection"."moderated_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "poem_collection_item" (
	"collection_id" text NOT NULL,
	"poem_id" text NOT NULL,
	"position" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "poem_collection_item_pk" PRIMARY KEY("collection_id","poem_id"),
	CONSTRAINT "poem_collection_item_position_unique" UNIQUE("collection_id","position"),
	CONSTRAINT "poem_collection_item_position_check" CHECK ("poem_collection_item"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "poem_collection" ADD CONSTRAINT "poem_collection_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_collection" ADD CONSTRAINT "poem_collection_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_collection_item" ADD CONSTRAINT "poem_collection_item_collection_id_poem_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."poem_collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_collection_item" ADD CONSTRAINT "poem_collection_item_poem_id_poem_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_owner_updated_at_idx" ON "poem_collection" USING btree ("owner_id","updated_at");--> statement-breakpoint
CREATE INDEX "collection_publication_lookup_idx" ON "poem_collection" USING btree ("status","moderation_status","visibility","published_at");--> statement-breakpoint
CREATE INDEX "poem_collection_item_poem_idx" ON "poem_collection_item" USING btree ("poem_id");