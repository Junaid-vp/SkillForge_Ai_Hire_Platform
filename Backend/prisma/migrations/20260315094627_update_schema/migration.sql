-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'STARTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "HR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
