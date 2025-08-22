/*
  Warnings:

  - Added the required column `author_id` to the `poems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PoemStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterTable
ALTER TABLE "public"."poems" ADD COLUMN     "author_id" TEXT NOT NULL,
ADD COLUMN     "is_draft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "status" "public"."PoemStatus" NOT NULL DEFAULT 'Pending';

-- AddForeignKey
ALTER TABLE "public"."poems" ADD CONSTRAINT "poems_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
