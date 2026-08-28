-- Créer le bucket Supabase Storage pour les documents AGASA
INSERT INTO storage.buckets (id, name, public)
VALUES ('agasa-documents', 'agasa-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Politique d'accès: lecture publique, écriture pour admins authentifiés
CREATE POLICY "public_read_agasa_docs" ON storage.objects
FOR SELECT USING (bucket_id = 'agasa-documents');

CREATE POLICY "admin_write_agasa_docs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'agasa-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "admin_update_agasa_docs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'agasa-documents' 
  AND auth.uid() IS NOT NULL
);