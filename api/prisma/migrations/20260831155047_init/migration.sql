-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `motDePasseHash` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NULL,
    `role` ENUM('CLIENT', 'RESTAURATEUR') NOT NULL DEFAULT 'CLIENT',
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieLe` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unites` (
    `id` VARCHAR(191) NOT NULL,
    `libelle` VARCHAR(191) NOT NULL,
    `type` ENUM('TABLE', 'COMPTOIR') NOT NULL,
    `capacite` INTEGER NOT NULL,
    `divisible` BOOLEAN NOT NULL DEFAULT false,
    `tailleMin` INTEGER NOT NULL DEFAULT 1,
    `tailleMax` INTEGER NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creneaux` (
    `id` VARCHAR(191) NOT NULL,
    `periode` ENUM('MIDI', 'SOIR') NOT NULL,
    `heureDebut` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `creneaux_periode_heureDebut_key`(`periode`, `heureDebut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `creneauId` VARCHAR(191) NOT NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `services_date_idx`(`date`),
    UNIQUE INDEX `services_date_creneauId_key`(`date`, `creneauId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fermetures` (
    `id` VARCHAR(191) NOT NULL,
    `dateDebut` DATE NOT NULL,
    `dateFin` DATE NOT NULL,
    `motif` VARCHAR(191) NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fermetures_dateDebut_dateFin_idx`(`dateDebut`, `dateFin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `uniteId` VARCHAR(191) NOT NULL,
    `nombreConvives` INTEGER NOT NULL,
    `statut` ENUM('CONFIRMEE', 'ANNULEE', 'HONOREE', 'ABSENTE') NOT NULL DEFAULT 'CONFIRMEE',
    `note` VARCHAR(191) NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieLe` DATETIME(3) NOT NULL,
    `annuleLe` DATETIME(3) NULL,

    UNIQUE INDEX `reservations_reference_key`(`reference`),
    INDEX `reservations_serviceId_statut_idx`(`serviceId`, `statut`),
    INDEX `reservations_utilisateurId_statut_idx`(`utilisateurId`, `statut`),
    INDEX `reservations_uniteId_serviceId_idx`(`uniteId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_creneauId_fkey` FOREIGN KEY (`creneauId`) REFERENCES `creneaux`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_uniteId_fkey` FOREIGN KEY (`uniteId`) REFERENCES `unites`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
