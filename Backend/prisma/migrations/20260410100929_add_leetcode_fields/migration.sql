-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "estimatedTime" INTEGER,
ADD COLUMN     "inputExample" TEXT,
ADD COLUMN     "outputExample" TEXT;

-- CreateTable
CREATE TABLE "CodeAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "output" TEXT,
    "codeStatus" TEXT,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeAnswer_questionId_key" ON "CodeAnswer"("questionId");

-- AddForeignKey
ALTER TABLE "CodeAnswer" ADD CONSTRAINT "CodeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeAnswer" ADD CONSTRAINT "CodeAnswer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
