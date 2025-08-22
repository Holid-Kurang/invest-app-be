-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('pending', 'success');

-- CreateEnum
CREATE TYPE "public"."ReturnStatus" AS ENUM ('pending', 'succes');

-- CreateEnum
CREATE TYPE "public"."WithdrawalStatus" AS ENUM ('pending', 'success', 'rejected');

-- CreateTable
CREATE TABLE "public"."users" (
    "id_user" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."invest" (
    "id_invest" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "proof" VARCHAR(255),
    "status" "public"."Status" NOT NULL DEFAULT 'pending',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invest_pkey" PRIMARY KEY ("id_invest")
);

-- CreateTable
CREATE TABLE "public"."return" (
    "id_return" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."ReturnStatus" NOT NULL DEFAULT 'pending',
    "request_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "return_pkey" PRIMARY KEY ("id_return")
);

-- CreateTable
CREATE TABLE "public"."withdrawal" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."WithdrawalStatus" NOT NULL DEFAULT 'pending',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."invest" ADD CONSTRAINT "invest_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."return" ADD CONSTRAINT "return_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."withdrawal" ADD CONSTRAINT "withdrawal_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
