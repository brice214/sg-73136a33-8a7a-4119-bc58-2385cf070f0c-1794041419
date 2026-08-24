import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AlertCircle, Package, Newspaper, Scan, Users, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";

interface DashboardStats {
  complaintsAgasa: number;
  complaintsDgccrf: number;
  complaintsPending: number;
  complaintsResolved: number;
  scansWeek: number;
  productsTotal: number;
  newsRecent: any[];
  usersTotal: number;
}

export default function DashboardPage() {
  const { session } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [complaintsAgasa, complaintsDgccrf, complaintsPending, complaintsResolved, scansWeek, productsTotal, newsRecent, usersTotal] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "DGCCRF"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "soumise"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "resolue"),
        supabase.from("scan_history").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
        supabase.from("products").select("barcode", { count: "exact", head: true }),
        supabase.from("news").select("*").order("published_date", { ascending: false }).limit(5),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        complaintsAgasa: complaintsAgasa.count || 0,
        complaintsDgccrf: complaintsDgccrf.count || 0,
        complaintsPending: complaintsPending.count || 0,
        complaintsResolved: complaintsResolved.count || 0,
        scansWeek: scansWeek.count || 0,
        productsTotal: productsTotal.count || 0,
        newsRecent: newsRecent.data || [],
        usersTotal: usersTotal.count || 0,
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Dashboard - MISSU BALA Backoffice" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, {session?.user.full_name || "Administrateur"}
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plaintes AGASA</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.complaintsAgasa}</div>
              <p className="text-xs text-muted-foreground mt-1">Total enregistré</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plaintes DGCCRF</CardTitle>
              <AlertCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.complaintsDgccrf}</div>
              <p className="text-xs text-muted-foreground mt-1">Total enregistré</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scans 7 jours</CardTitle>
              <Scan className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.scansWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">Dernière semaine</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits registre</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.productsTotal}</div>
              <p className="text-xs text-muted-foreground mt-1">Total catalogue</p>
            </CardContent>
          </Card>
        </div>

        {/* Statut plaintes */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Statut des plaintes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">En attente</span>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  {stats.complaintsPending}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Résolues</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {stats.complaintsResolved}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Utilisateurs mobile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.usersTotal}</div>
              <p className="text-sm text-muted-foreground mt-2">Citoyens inscrits</p>
            </CardContent>
          </Card>
        </div>

        {/* Dernières actualités */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Dernières actualités
            </CardTitle>
            <CardDescription>5 publications les plus récentes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.newsRecent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune actualité publiée</p>
            ) : (
              <div className="space-y-3">
                {stats.newsRecent.map((news) => (
                  <div key={news.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {news.tag}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{news.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(news.published_date).toLocaleDateString("fr-FR")} · {news.source.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}