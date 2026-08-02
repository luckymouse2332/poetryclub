CREATE TYPE "public"."poem_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "poem" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"context" text,
	"occurred_at" timestamp,
	"author_id" text NOT NULL,
	"status" "poem_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"creation_token" text NOT NULL,
	CONSTRAINT "poem_author_id_creation_token_unique" UNIQUE("author_id","creation_token"),
	CONSTRAINT "poem_status_published_at_check" CHECK ("poem"."status" <> 'published' OR "poem"."published_at" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "poem" ADD CONSTRAINT "poem_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "poem_status_published_at_idx" ON "poem" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "poem_author_id_updated_at_idx" ON "poem" USING btree ("author_id","updated_at");