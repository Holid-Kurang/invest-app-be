/*
  Warnings:

  - You are about to drop the `return` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."return" DROP CONSTRAINT "return_id_user_fkey";

-- DropTable
DROP TABLE "public"."return";

-- DropEnum
DROP TYPE "public"."ReturnStatus";
