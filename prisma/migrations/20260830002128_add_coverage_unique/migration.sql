/*
  Warnings:

  - A unique constraint covering the columns `[branchId,name]` on the table `coverage_areas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `coverage_areas_branchId_name_key` ON `coverage_areas`(`branchId`, `name`);
