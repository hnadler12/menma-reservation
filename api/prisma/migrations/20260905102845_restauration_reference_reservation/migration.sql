-- Retour en arriere sur la migration precedente : la reference courte est finalement conservee.
-- Recreation de la colonne, avec backfill des lignes existantes pour respecter
-- la contrainte NOT NULL + UNIQUE avant de la reappliquer.
ALTER TABLE `reservations` ADD COLUMN `reference` VARCHAR(191) NULL;

UPDATE `reservations` SET `reference` = CONCAT('MENMA-LEGACY-', SUBSTRING(`id`, 1, 12)) WHERE `reference` IS NULL;

ALTER TABLE `reservations` MODIFY COLUMN `reference` VARCHAR(191) NOT NULL;

ALTER TABLE `reservations` ADD UNIQUE INDEX `reservations_reference_key`(`reference`);
