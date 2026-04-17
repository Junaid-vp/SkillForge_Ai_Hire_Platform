-- AlterTable
ALTER TABLE "HR" ADD COLUMN     "notifInterviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifProgress" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifSubmissions" BOOLEAN NOT NULL DEFAULT true;
