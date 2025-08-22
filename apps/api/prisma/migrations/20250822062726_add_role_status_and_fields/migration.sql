-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('Active', 'Inactive', 'Banned');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'Active';
