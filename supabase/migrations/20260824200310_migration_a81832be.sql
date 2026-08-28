-- Ajouter foreign key entre complaints.user_id et profiles.id
-- Cela permet le JOIN direct dans les queries Supabase
ALTER TABLE complaints 
ADD CONSTRAINT complaints_user_id_profiles_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;