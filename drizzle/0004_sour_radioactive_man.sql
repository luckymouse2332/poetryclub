CREATE TYPE "public"."poem_visibility" AS ENUM('public', 'members_only');--> statement-breakpoint
DROP INDEX "poem_status_moderation_status_published_at_idx";--> statement-breakpoint
ALTER TABLE "poem" ADD COLUMN "visibility" "poem_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
CREATE INDEX "poem_status_moderation_visibility_published_at_idx" ON "poem" USING btree ("status","moderation_status","visibility","published_at");