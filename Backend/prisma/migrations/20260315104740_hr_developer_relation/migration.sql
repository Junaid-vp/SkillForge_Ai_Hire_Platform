/*
  Warnings:

  - Added the required column `hrId` to the `Developer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "hrId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "HR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
