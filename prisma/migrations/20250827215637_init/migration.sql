/*
  Warnings:

  - The `status` column on the `withdrawal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'rejected';

-- AlterTable
ALTER TABLE "public"."withdrawal" DROP COLUMN "status",
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'pending';

-- DropEnum
DROP TYPE "public"."WithdrawalStatus";
