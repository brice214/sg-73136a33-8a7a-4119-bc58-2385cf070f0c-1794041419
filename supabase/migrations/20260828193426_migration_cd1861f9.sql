-- Étape 1: Ajouter la colonne institution SANS modifier RLS

-- 1. Ajouter la colonne
ALTER TABLE products ADD COLUMN IF NOT EXISTS institution text;

-- 2. Assigner les produits existants au Super Admin par défaut
UPDATE products SET institution = 'super_admin' WHERE institution IS NULL;

-- 3. Rendre la colonne NOT NULL
ALTER TABLE products ALTER COLUMN institution SET NOT NULL;

-- 4. Ajouter contrainte de validation
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_institution_check;
ALTER TABLE products ADD CONSTRAINT products_institution_check 
  CHECK (institution IN ('super_admin', 'aganor'));

-- 5. Vérifier le résultat
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE institution = 'aganor') as produits_aganor,
  COUNT(*) FILTER (WHERE institution = 'super_admin') as produits_super_admin
FROM products;