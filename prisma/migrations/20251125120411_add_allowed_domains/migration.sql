-- AlterTable
ALTER TABLE "University" ADD COLUMN     "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];
