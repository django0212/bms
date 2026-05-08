-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('PHYSICAL', 'EVENT', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "seatNumber" INTEGER,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "FacilityType" NOT NULL DEFAULT 'PHYSICAL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rollNumber" TEXT;
