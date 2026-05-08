/*
  Warnings:

  - A unique constraint covering the columns `[domain]` on the table `University` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "University" ADD COLUMN     "domain" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "University_domain_key" ON "University"("domain");
