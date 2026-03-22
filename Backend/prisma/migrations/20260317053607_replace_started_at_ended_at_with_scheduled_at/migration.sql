/*
  Warnings:

  - You are about to drop the column `endedAt` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Interview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "endedAt",
DROP COLUMN "startedAt";
