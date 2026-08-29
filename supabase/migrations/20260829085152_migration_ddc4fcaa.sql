-- Créer la table pour stocker les modèles de documents

CREATE TABLE IF NOT EXISTS document_templates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Activer RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Politique : Super Admin et AGASA peuvent lire/écrire les templates d'agrément sanitaire
CREATE POLICY document_templates_backoffice ON document_templates
  FOR ALL
  USING (is_backoffice_admin(ARRAY['super_admin'::text, 'agasa'::text]))
  WITH CHECK (is_backoffice_admin(ARRAY['super_admin'::text, 'agasa'::text]));

-- Vérifier la création
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'document_templates'
ORDER BY ordinal_position;