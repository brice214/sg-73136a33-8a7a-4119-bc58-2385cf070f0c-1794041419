-- Créer table des groupes
CREATE TABLE IF NOT EXISTS mercuriale_groups (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  description text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Créer table des catégories
CREATE TABLE IF NOT EXISTS mercuriale_categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_id bigint NOT NULL REFERENCES mercuriale_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, name)
);

-- Créer table des sous-catégories
CREATE TABLE IF NOT EXISTS mercuriale_subcategories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id bigint NOT NULL REFERENCES mercuriale_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Ajouter colonnes foreign keys à mercuriale
ALTER TABLE mercuriale ADD COLUMN IF NOT EXISTS group_id bigint NULL REFERENCES mercuriale_groups(id) ON DELETE SET NULL;
ALTER TABLE mercuriale ADD COLUMN IF NOT EXISTS category_id bigint NULL REFERENCES mercuriale_categories(id) ON DELETE SET NULL;
ALTER TABLE mercuriale ADD COLUMN IF NOT EXISTS subcategory_id bigint NULL REFERENCES mercuriale_subcategories(id) ON DELETE SET NULL;

-- Activer RLS sur les nouvelles tables
ALTER TABLE mercuriale_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercuriale_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercuriale_subcategories ENABLE ROW LEVEL SECURITY;

-- Policies: lecture publique, écriture DGCCRF/super_admin
CREATE POLICY "mercuriale_groups_read_authenticated" ON mercuriale_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "mercuriale_groups_write_backoffice" ON mercuriale_groups FOR ALL TO authenticated 
  USING (is_backoffice_admin(ARRAY['super_admin', 'dgccrf'])) 
  WITH CHECK (is_backoffice_admin(ARRAY['super_admin', 'dgccrf']));

CREATE POLICY "mercuriale_categories_read_authenticated" ON mercuriale_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "mercuriale_categories_write_backoffice" ON mercuriale_categories FOR ALL TO authenticated 
  USING (is_backoffice_admin(ARRAY['super_admin', 'dgccrf'])) 
  WITH CHECK (is_backoffice_admin(ARRAY['super_admin', 'dgccrf']));

CREATE POLICY "mercuriale_subcategories_read_authenticated" ON mercuriale_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "mercuriale_subcategories_write_backoffice" ON mercuriale_subcategories FOR ALL TO authenticated 
  USING (is_backoffice_admin(ARRAY['super_admin', 'dgccrf'])) 
  WITH CHECK (is_backoffice_admin(ARRAY['super_admin', 'dgccrf']));

-- Créer index pour performance
CREATE INDEX IF NOT EXISTS mercuriale_categories_group_idx ON mercuriale_categories(group_id);
CREATE INDEX IF NOT EXISTS mercuriale_subcategories_category_idx ON mercuriale_subcategories(category_id);
CREATE INDEX IF NOT EXISTS mercuriale_group_id_idx ON mercuriale(group_id);
CREATE INDEX IF NOT EXISTS mercuriale_category_id_idx ON mercuriale(category_id);
CREATE INDEX IF NOT EXISTS mercuriale_subcategory_id_idx ON mercuriale(subcategory_id);