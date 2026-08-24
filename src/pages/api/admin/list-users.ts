import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/database.types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vérifier authentification
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // Vérifier super_admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: "Token invalide" });
    }

    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminUser?.role !== "super_admin") {
      return res.status(403).json({ error: "Accès réservé au Super Admin" });
    }

    // Récupérer tous les profiles (citoyens uniquement, pas admin_users)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Filtrer pour exclure les admin_users
    const { data: adminIds } = await supabaseAdmin
      .from("admin_users")
      .select("id");

    const adminIdSet = new Set(adminIds?.map((a) => a.id) || []);
    const citizens = (profiles || []).filter((p) => !adminIdSet.has(p.id));

    // Enrichir avec last_sign_in_at depuis auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    const enriched = citizens.map((profile) => {
      const authUser = (users as any[]).find((u) => u.id === profile.id);
      return {
        ...profile,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        banned: authUser?.banned_until !== undefined && authUser?.banned_until !== null,
      };
    });

    return res.status(200).json({ users: enriched });
  } catch (error: any) {
    console.error("Erreur liste citoyens:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}