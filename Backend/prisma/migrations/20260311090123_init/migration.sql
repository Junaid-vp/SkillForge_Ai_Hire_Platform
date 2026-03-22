-- CreateTable
CREATE TABLE "HR" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "designation" TEXT,
    "companyWebsite" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   

    CONSTRAINT "HR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HR_email_key" ON "HR"("email");
