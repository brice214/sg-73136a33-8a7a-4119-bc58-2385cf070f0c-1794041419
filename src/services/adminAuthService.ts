import { supabase } from "@/integrations/supabase/client";
import type { AdminUser, AdminSession } from "@/types/admin";

export const adminAuthService = {
  /**
   * Connexion backoffice - vérifie admin_users et is_blocked
   */
  async signIn(email: string, password: string): Promise<AdminSession> {
    // 1. Connexion Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Authentification échouée");

    // 2. Vérifier admin_users
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      throw new Error("Accès réservé aux administrateurs");
    }

    // 3. Vérifier blocage
    if (adminUser.is_blocked) {
      await supabase.auth.signOut();
      throw new Error("Compte bloqué. Contactez le Super Admin.");
    }

    return {
      user: {
        ...adminUser,
        email: authData.user.email,
      },
      accessToken: authData.session!.access_token,
    };
  },

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Récupérer la session en cours
   */
  async getCurrentSession(): Promise<AdminSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !adminUser || adminUser.is_blocked) {
      await supabase.auth.signOut();
      return null;
    }

    return {
      user: {
        ...adminUser,
        email: session.user.email,
      },
      accessToken: session.access_token,
    };
  },

  /**
   * Écouter les changements de session
   */
  onAuthStateChange(callback: (session: AdminSession | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        callback(null);
        return;
      }

      const adminSession = await this.getCurrentSession();
      callback(adminSession);
    });
  },
};