CREATE TYPE "public"."comment_moderation_status" AS ENUM('visible', 'hidden');--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'comment_hidden';--> statement-breakpoint
ALTER TYPE "public"."admin_audit_action" ADD VALUE 'comment_restored';--> statement-breakpoint
ALTER TYPE "public"."admin_target_type" ADD VALUE 'comment';--> statement-breakpoint
CREATE TABLE "poem_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"poem_id" text NOT NULL,
	"author_id" text NOT NULL,
	"parent_id" text,
	"root_id" text NOT NULL,
	"depth" integer NOT NULL,
	"body" text NOT NULL,
	"creation_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"moderation_status" "comment_moderation_status" DEFAULT 'visible' NOT NULL,
	"moderation_reason" text,
	"moderated_at" timestamp,
	"moderated_by" text,
	CONSTRAINT "poem_comment_author_creation_token_unique" UNIQUE("author_id","creation_token"),
	CONSTRAINT "poem_comment_depth_check" CHECK ("poem_comment"."depth" >= 0),
	CONSTRAINT "poem_comment_hierarchy_check" CHECK (("poem_comment"."depth" = 0 AND "poem_comment"."parent_id" IS NULL AND "poem_comment"."root_id" = "poem_comment"."id") OR ("poem_comment"."depth" > 0 AND "poem_comment"."parent_id" IS NOT NULL AND "poem_comment"."root_id" <> "poem_comment"."id")),
	CONSTRAINT "poem_comment_body_check" CHECK (("poem_comment"."deleted_at" IS NULL AND char_length(trim("poem_comment"."body")) BETWEEN 1 AND 2000) OR ("poem_comment"."deleted_at" IS NOT NULL AND "poem_comment"."body" = '')),
	CONSTRAINT "poem_comment_moderation_state_check" CHECK (("poem_comment"."moderation_status" = 'visible' AND "poem_comment"."moderation_reason" IS NULL AND "poem_comment"."moderated_at" IS NULL AND "poem_comment"."moderated_by" IS NULL) OR ("poem_comment"."moderation_status" = 'hidden' AND trim(coalesce("poem_comment"."moderation_reason", '')) <> '' AND "poem_comment"."moderated_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "poem_comment" ADD CONSTRAINT "poem_comment_poem_id_poem_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_comment" ADD CONSTRAINT "poem_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_comment" ADD CONSTRAINT "poem_comment_parent_id_poem_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."poem_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_comment" ADD CONSTRAINT "poem_comment_root_id_poem_comment_id_fk" FOREIGN KEY ("root_id") REFERENCES "public"."poem_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poem_comment" ADD CONSTRAINT "poem_comment_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "poem_comment_poem_depth_activity_idx" ON "poem_comment" USING btree ("poem_id","depth","last_activity_at","id");--> statement-breakpoint
CREATE INDEX "poem_comment_root_created_idx" ON "poem_comment" USING btree ("root_id","created_at","id");--> statement-breakpoint
CREATE INDEX "poem_comment_author_created_idx" ON "poem_comment" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "poem_comment_moderation_created_idx" ON "poem_comment" USING btree ("moderation_status","created_at","id");