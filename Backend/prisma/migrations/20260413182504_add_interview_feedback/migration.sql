-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "feedback" JSONB,
ADD COLUMN     "feedbackGeneratedAt" TIMESTAMP(3);
