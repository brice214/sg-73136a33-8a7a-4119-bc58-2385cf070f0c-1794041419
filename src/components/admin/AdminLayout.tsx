import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Sidebar } from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { session, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  );
}