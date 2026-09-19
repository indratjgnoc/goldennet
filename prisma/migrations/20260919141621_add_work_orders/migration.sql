-- CreateTable
CREATE TABLE `work_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workOrderCode` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `technicianId` INTEGER NULL,
    `installationId` INTEGER NULL,
    `type` ENUM('INSTALLATION', 'TROUBLESHOOTING', 'REPAIR', 'MAINTENANCE', 'UPGRADE', 'DOWNGRADE') NOT NULL DEFAULT 'INSTALLATION',
    `status` ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `technicianNotes` TEXT NULL,
    `completionNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `work_orders_workOrderCode_key`(`workOrderCode`),
    INDEX `work_orders_customerId_idx`(`customerId`),
    INDEX `work_orders_technicianId_idx`(`technicianId`),
    INDEX `work_orders_installationId_idx`(`installationId`),
    INDEX `work_orders_status_idx`(`status`),
    INDEX `work_orders_priority_idx`(`priority`),
    INDEX `work_orders_type_idx`(`type`),
    INDEX `work_orders_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_order_materials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workOrderId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `notes` TEXT NULL,

    INDEX `work_order_materials_workOrderId_idx`(`workOrderId`),
    INDEX `work_order_materials_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_installationId_fkey` FOREIGN KEY (`installationId`) REFERENCES `installations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_materials` ADD CONSTRAINT `work_order_materials_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_order_materials` ADD CONSTRAINT `work_order_materials_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
