import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AlertCircle, Package, Newspaper, Scan, Users, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";
import { SEO } from "@/components/SEO";
import type { AdminRole } from "@/types/admin";

export default function DashboardPage() {
  const { session } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadStats(session.user.role);
    }
  }, [session]);

  const loadStats = async (role: AdminRole) => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (role === "super_admin") {
        // Super Admin : toutes les statistiques globales
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

      } else if (role === "aganor") {
        // AGANOR : uniquement ses produits et scans
        const [productsTotal, productsCertified, scansTotal, newsRecent] = await Promise.all([
          supabase.from("products").select("barcode", { count: "exact", head: true }).eq("institution", "aganor"),
          supabase.from("products").select("barcode", { count: "exact", head: true }).eq("institution", "aganor").eq("aganor_certified", true),
          supabase.from("scan_history").select("id", { count: "exact", head: true }),
          supabase.from("news").select("*").eq("source", "aganor").order("published_date", { ascending: false }).limit(5),
        ]);

        setStats({
          productsTotal: productsTotal.count || 0,
          productsCertified: productsCertified.count || 0,
          scansTotal: scansTotal.count || 0,
          newsRecent: newsRecent.data || [],
        });

      } else if (role === "agasa") {
        // AGASA : uniquement ses plaintes et actualités
        const [complaintsTotal, complaintsPending, complaintsResolved, newsRecent] = await Promise.all([
          supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA"),
          supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").eq("status", "soumise"),
          supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").eq("status", "resolue"),
          supabase.from("news").select("*").eq("source", "agasa").order("published_date", { ascending: false }).limit(5),
        ]);

        setStats({
          complaintsTotal: complaintsTotal.count || 0,
          complaintsPending: complaintsPending.count || 0,
          complaintsResolved: complaintsResolved.count || 0,
          newsRecent: newsRecent.data || [],
        });

      } else if (role === "dgccrf") {
        // DGCCRF : uniquement ses plaintes, actualités et mercuriale
        const [complaintsTotal, complaintsPending, complaintsResolved, mercurialeProducts, newsRecent] = await Promise.all([
          supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "DGCCRF"),
          supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "DGCCRF").eq("status", "soumise"),
          supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "DGCCRF").eq("status", "resolue"),
          supabase.from("mercuriale").select("id", { count: "exact", head: true }),
          supabase.from("news").select("*").eq("source", "dgccrf").order("published_date", { ascending: false }).limit(5),
        ]);

        setStats({
          complaintsTotal: complaintsTotal.count || 0,
          complaintsPending: complaintsPending.count || 0,
          complaintsResolved: complaintsResolved.count || 0,
          mercurialeProducts: mercurialeProducts.count || 0,
          newsRecent: newsRecent.data || [],
        });
      }
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

  const role = session?.user.role;

  return (
    <AdminLayout>
      <SEO title="Dashboard - MISSU BALA Backoffice" noIndex={true} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, {session?.user.full_name || "Administrateur"}
          </p>
        </div>

        {/* Super Admin Dashboard */}
        {role === "super_admin" && (
          <>
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
          </>
        )}

        {/* AGANOR Dashboard */}
        {role === "aganor" && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mes produits</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.productsTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total enregistrés</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certifiés AGANOR</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.productsCertified}</div>
                  <p className="text-xs text-muted-foreground mt-1">Produits certifiés</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scans total</CardTitle>
                  <Scan className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.scansTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">Tous les scans</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* AGASA Dashboard */}
        {role === "agasa" && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mes plaintes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.complaintsTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total AGASA</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.complaintsPending}</div>
                  <p className="text-xs text-muted-foreground mt-1">À traiter</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Résolues</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.complaintsResolved}</div>
                  <p className="text-xs text-muted-foreground mt-1">Clôturées</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* DGCCRF Dashboard */}
        {role === "dgccrf" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mes plaintes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.complaintsTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total DGCCRF</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.complaintsPending}</div>
                  <p className="text-xs text-muted-foreground mt-1">À traiter</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Résolues</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.complaintsResolved}</div>
                  <p className="text-xs text-muted-foreground mt-1">Clôturées</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mercuriale</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.mercurialeProducts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Produits répertoriés</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Dernières actualités - Toutes institutions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Mes dernières actualités
            </CardTitle>
            <CardDescription>5 publications les plus récentes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.newsRecent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune actualité publiée</p>
            ) : (
              <div className="space-y-3">
                {stats.newsRecent.map((news: any) => (
                  <div key={news.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    {news.tag && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        {news.tag}
                      </Badge>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{news.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(news.published_date).toLocaleDateString("fr-FR")}
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