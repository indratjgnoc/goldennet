-- CreateTable
CREATE TABLE `inventory_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_categories_name_key`(`name`),
    INDEX `inventory_categories_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `contactName` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_suppliers_code_key`(`code`),
    INDEX `inventory_suppliers_name_idx`(`name`),
    INDEX `inventory_suppliers_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `unit` ENUM('PCS', 'UNIT', 'METER', 'BOX', 'ROLL', 'SET', 'PACK') NOT NULL,
    `stock` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `minimumStock` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `purchasePrice` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `location` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_items_code_key`(`code`),
    INDEX `inventory_items_categoryId_idx`(`categoryId`),
    INDEX `inventory_items_name_idx`(`name`),
    INDEX `inventory_items_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_ins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionCode` VARCHAR(191) NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `receivedById` INTEGER NOT NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_ins_transactionCode_key`(`transactionCode`),
    INDEX `stock_ins_supplierId_idx`(`supplierId`),
    INDEX `stock_ins_receivedById_idx`(`receivedById`),
    INDEX `stock_ins_transactionDate_idx`(`transactionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_in_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockInId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `unitPrice` DECIMAL(14, 2) NOT NULL,
    `subtotal` DECIMAL(16, 2) NOT NULL,

    INDEX `stock_in_items_stockInId_idx`(`stockInId`),
    INDEX `stock_in_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_outs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionCode` VARCHAR(191) NOT NULL,
    `issuedById` INTEGER NOT NULL,
    `technicianId` INTEGER NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `purpose` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_outs_transactionCode_key`(`transactionCode`),
    INDEX `stock_outs_issuedById_idx`(`issuedById`),
    INDEX `stock_outs_technicianId_idx`(`technicianId`),
    INDEX `stock_outs_transactionDate_idx`(`transactionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_out_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockOutId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,

    INDEX `stock_out_items_stockOutId_idx`(`stockOutId`),
    INDEX `stock_out_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `installations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `installationCode` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `technicianId` INTEGER NOT NULL,
    `installationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `address` TEXT NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `installations_installationCode_key`(`installationCode`),
    INDEX `installations_customerId_idx`(`customerId`),
    INDEX `installations_technicianId_idx`(`technicianId`),
    INDEX `installations_installationDate_idx`(`installationDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `installation_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `installationId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `notes` TEXT NULL,

    INDEX `installation_items_installationId_idx`(`installationId`),
    INDEX `installation_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `inventory_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ins` ADD CONSTRAINT `stock_ins_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `inventory_suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ins` ADD CONSTRAINT `stock_ins_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_in_items` ADD CONSTRAINT `stock_in_items_stockInId_fkey` FOREIGN KEY (`stockInId`) REFERENCES `stock_ins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_in_items` ADD CONSTRAINT `stock_in_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_outs` ADD CONSTRAINT `stock_outs_issuedById_fkey` FOREIGN KEY (`issuedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_outs` ADD CONSTRAINT `stock_outs_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out_items` ADD CONSTRAINT `stock_out_items_stockOutId_fkey` FOREIGN KEY (`stockOutId`) REFERENCES `stock_outs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out_items` ADD CONSTRAINT `stock_out_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `installations` ADD CONSTRAINT `installations_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `installations` ADD CONSTRAINT `installations_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `installation_items` ADD CONSTRAINT `installation_items_installationId_fkey` FOREIGN KEY (`installationId`) REFERENCES `installations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `installation_items` ADD CONSTRAINT `installation_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
