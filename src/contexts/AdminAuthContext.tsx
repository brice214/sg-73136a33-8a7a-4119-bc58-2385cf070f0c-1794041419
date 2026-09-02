import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { adminAuthService } from "@/services/adminAuthService";
import type { AdminSession } from "@/types/admin";

interface AdminAuthContextType {
  session: AdminSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Charger la session au montage
    adminAuthService.getCurrentSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // Routes publiques qui n'exigent pas d'authentification
    const publicRoutes = ["/login", "/politique-confidentialite"];

    // Écouter les changements
    const { data: { subscription } } = adminAuthService.onAuthStateChange((s) => {
      setSession(s);
      if (!s && !publicRoutes.includes(router.pathname)) {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const adminSession = await adminAuthService.signIn(email, password);
    setSession(adminSession);
    router.push("/admin/dashboard");
  };

  const signOut = async () => {
    await adminAuthService.signOut();
    setSession(null);
    router.push("/login");
  };

  return (
    <AdminAuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}