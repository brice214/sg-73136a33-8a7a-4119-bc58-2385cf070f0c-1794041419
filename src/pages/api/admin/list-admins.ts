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
    // Vérifier que l'utilisateur est authentifié
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // Vérifier que c'est un super_admin
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

    // Récupérer tous les admin_users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (adminError) throw adminError;

    // Récupérer les emails depuis auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Enrichir avec emails
    const enrichedAdmins = (adminUsers || []).map((admin) => {
      const authUser = (users as any[]).find((u) => u.id === admin.id);
      return {
        ...admin,
        email: authUser?.email || null,
      };
    });

    return res.status(200).json({ admins: enrichedAdmins });
  } catch (error: any) {
    console.error("Erreur liste admins:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}