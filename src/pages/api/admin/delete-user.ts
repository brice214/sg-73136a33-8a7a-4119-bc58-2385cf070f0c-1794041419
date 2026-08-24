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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Non authentifié" });
    }

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

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId requis" });
    }

    // Supprimer le profile d'abord
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

    // Supprimer l'utilisateur auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Erreur suppression utilisateur:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}