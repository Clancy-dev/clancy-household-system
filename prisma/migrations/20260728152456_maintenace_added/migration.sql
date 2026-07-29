/*
  Warnings:

  - You are about to drop the column `categoryId` on the `MaintenanceItem` table. All the data in the column will be lost.
  - You are about to drop the `MaintenanceCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `MaintenanceItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceItem" DROP CONSTRAINT "MaintenanceItem_categoryId_fkey";

-- DropIndex
DROP INDEX "MaintenanceItem_categoryId_idx";

-- AlterTable
ALTER TABLE "MaintenanceItem" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropTable
DROP TABLE "MaintenanceCategory";

-- CreateIndex
CREATE INDEX "MaintenanceItem_category_idx" ON "MaintenanceItem"("category");
