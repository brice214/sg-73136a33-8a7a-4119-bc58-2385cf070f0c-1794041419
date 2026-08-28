-- Remplacer la politique RLS pour autoriser DGCCRF à écrire leurs actualités

DROP POLICY IF EXISTS news_write_backoffice ON news;

CREATE POLICY news_write_backoffice ON news
  FOR ALL
  USING (
    is_backoffice_admin(ARRAY['super_admin'::text]) 
    OR (is_backoffice_admin(ARRAY['agasa'::text]) AND (source = 'agasa'::text))
    OR (is_backoffice_admin(ARRAY['aganor'::text]) AND (source = 'aganor'::text))
    OR (is_backoffice_admin(ARRAY['dgccrf'::text]) AND (source = 'dgccrf'::text))
  )
  WITH CHECK (
    is_backoffice_admin(ARRAY['super_admin'::text]) 
    OR (is_backoffice_admin(ARRAY['agasa'::text]) AND (source = 'agasa'::text))
    OR (is_backoffice_admin(ARRAY['aganor'::text]) AND (source = 'aganor'::text))
    OR (is_backoffice_admin(ARRAY['dgccrf'::text]) AND (source = 'dgccrf'::text))
  );