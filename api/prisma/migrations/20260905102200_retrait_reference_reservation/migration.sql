-- Retrait de la reference courte des reservations (colonne inutilisee cote produit).
ALTER TABLE `reservations` DROP COLUMN `reference`;
