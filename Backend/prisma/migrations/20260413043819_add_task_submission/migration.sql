-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "aiReport" TEXT,
ADD COLUMN     "aiScore" INTEGER,
ADD COLUMN     "submissionUrl" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3);
