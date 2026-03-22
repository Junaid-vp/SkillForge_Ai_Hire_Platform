-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "developerName" TEXT NOT NULL,
    "developerEmail" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "interviewDate" TIMESTAMP(3) NOT NULL,
    "interviewTime" TEXT NOT NULL,
    "uniqueCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Developer_developerEmail_key" ON "Developer"("developerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_uniqueCode_key" ON "Developer"("uniqueCode");
