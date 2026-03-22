-- CreateTable
CREATE TABLE "TaskLibrary" (
    "id" TEXT NOT NULL,
    "hrId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskLibrary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskLibrary" ADD CONSTRAINT "TaskLibrary_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "HR"("id") ON DELETE SET NULL ON UPDATE CASCADE;
