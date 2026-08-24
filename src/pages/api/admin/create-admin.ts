import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Vérifier que le rôle est valide
    const validRoles = ["agasa", "aganor", "dgccrf"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }

    // Créer client admin avec service_role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Créer l'utilisateur dans auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;
    if (!authUser.user) throw new Error("Utilisateur non créé");

    // Créer l'entrée dans admin_users
    const { error: dbError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        id: authUser.user.id,
        full_name,
        role,
        is_blocked: false,
      });

    if (dbError) {
      // Rollback: supprimer l'utilisateur auth en cas d'erreur DB
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw dbError;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name,
        role,
      },
    });
  } catch (error: any) {
    console.error("Erreur création admin:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}