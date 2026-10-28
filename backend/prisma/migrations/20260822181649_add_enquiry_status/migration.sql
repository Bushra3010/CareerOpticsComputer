-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- AlterTable
ALTER TABLE "visit_enquiries" ADD COLUMN     "closeNote" TEXT,
ADD COLUMN     "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW';
