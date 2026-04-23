-- AlterEnum
ALTER TYPE "InterviewStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "reminder10Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportSent" BOOLEAN NOT NULL DEFAULT false;
