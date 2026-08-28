-- Mettre à jour les politiques RLS pour isoler les produits par institution

-- 1. Supprimer l'ancienne politique de lecture
DROP POLICY IF EXISTS products_read_all ON products;

-- 2. Créer nouvelle politique de lecture avec filtre institution
CREATE POLICY products_read_backoffice ON products
  FOR SELECT
  USING (
    is_backoffice_admin(ARRAY['super_admin'::text])
    OR (is_backoffice_admin(ARRAY['aganor'::text]) AND institution = 'aganor')
  );

-- 3. Mettre à jour la politique d'écriture pour inclure le filtre institution
DROP POLICY IF EXISTS products_write_backoffice ON products;

CREATE POLICY products_write_backoffice ON products
  FOR ALL
  USING (
    is_backoffice_admin(ARRAY['super_admin'::text])
    OR (is_backoffice_admin(ARRAY['aganor'::text]) AND institution = 'aganor')
  )
  WITH CHECK (
    is_backoffice_admin(ARRAY['super_admin'::text])
    OR (is_backoffice_admin(ARRAY['aganor'::text]) AND institution = 'aganor')
  );

-- Vérifier les politiques créées
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';