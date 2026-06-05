/*
  Warnings:

  - You are about to drop the `PropertyCalculation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScoreBreakdown` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PropertyCalculation" DROP CONSTRAINT "PropertyCalculation_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreBreakdown" DROP CONSTRAINT "ScoreBreakdown_propertyId_fkey";

-- DropTable
DROP TABLE "PropertyCalculation";

-- DropTable
DROP TABLE "ScoreBreakdown";

-- DropEnum
DROP TYPE "ExpenseType";

-- DropEnum
DROP TYPE "StrategyType";
