-- Migration : Suppression des colonnes redondantes pour garantir la cohérence taxonomique
-- Les noms affichés proviendront désormais UNIQUEMENT des tables de référence via jointures

ALTER TABLE mercuriale DROP COLUMN IF EXISTS group_name;
ALTER TABLE mercuriale DROP COLUMN IF EXISTS category;
ALTER TABLE mercuriale DROP COLUMN IF EXISTS subcategory;

-- Vérification de la structure finale
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mercuriale' 
ORDER BY ordinal_position;