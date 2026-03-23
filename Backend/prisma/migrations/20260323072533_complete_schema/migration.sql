-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'SUBMITTED', 'EXPIRED', 'REVIEWED');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "taskLibraryId" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_interviewId_key" ON "Task"("interviewId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "HR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskLibraryId_fkey" FOREIGN KEY ("taskLibraryId") REFERENCES "TaskLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
