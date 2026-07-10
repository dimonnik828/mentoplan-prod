/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `TTK` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TTK" ADD COLUMN     "applicationArea" TEXT,
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "portionNorm" DOUBLE PRECISION,
ADD COLUMN     "sourcePage" INTEGER,
ADD COLUMN     "totalOutputKg" DOUBLE PRECISION,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'блюдо';

-- CreateIndex
CREATE UNIQUE INDEX "TTK_number_key" ON "TTK"("number");
