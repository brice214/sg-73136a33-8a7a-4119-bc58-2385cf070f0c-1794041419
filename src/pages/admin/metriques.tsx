import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Activity, AlertCircle, Crown, TrendingUp, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Metrics = {
  citizens: {
    total: number;
    active7d: number;
    active30d: number;
  };
  scans: {
    total: number;
    last30days: number;
  };
  complaints: {
    byAgency: { agency: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
  topProducts: { product_name: string; brand: string | null; count: number }[];
  premium: {
    activeSubscriptions: number;
    totalRevenue: number;
  };
};

export default function MetriquesPage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      setLoading(true);

      // Citoyens
      const { count: totalCitizens } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: scans7d } = await supabase
        .from("scan_history")
        .select("user_id")
        .gte("created_at", sevenDaysAgo.toISOString());

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: scans30d } = await supabase
        .from("scan_history")
        .select("user_id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const active7d = new Set(scans7d?.map((s) => s.user_id) || []).size;
      const active30d = new Set(scans30d?.map((s) => s.user_id) || []).size;

      // Scans
      const { count: totalScans } = await supabase
        .from("scan_history")
        .select("*", { count: "exact", head: true });

      const { count: scans30dCount } = await supabase
        .from("scan_history")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Plaintes par agence
      const { data: complaintsByAgency } = await supabase
        .from("complaints")
        .select("agency");

      const agencyCounts = (complaintsByAgency || []).reduce((acc, c) => {
        acc[c.agency] = (acc[c.agency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byAgency = Object.entries(agencyCounts).map(([agency, count]) => ({
        agency,
        count,
      }));

      // Plaintes par statut
      const { data: complaintsByStatus } = await supabase
        .from("complaints")
        .select("status");

      const statusCounts = (complaintsByStatus || []).reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }));

      // Top 10 produits scannés
      const { data: allScans } = await supabase
        .from("scan_history")
        .select("product_name, brand");

      const productCounts = (allScans || []).reduce((acc, scan) => {
        const key = `${scan.product_name}|${scan.brand || ""}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProducts = Object.entries(productCounts)
        .map(([key, count]) => {
          const [product_name, brand] = key.split("|");
          return { product_name, brand: brand || null, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Premium
      const { data: activeSubscriptions } = await supabase
        .from("subscriptions")
        .select("plan_code, premium_plans(price_fcfa)")
        .eq("status", "active");

      const activeSubs = activeSubscriptions?.length || 0;
      const totalRevenue = (activeSubscriptions || []).reduce((sum, sub) => {
        const plan = sub.premium_plans as any;
        return sum + (plan?.price_fcfa || 0);
        }, 0);

      setMetrics({
        citizens: {
          total: totalCitizens || 0,
          active7d,
          active30d,
        },
        scans: {
          total: totalScans || 0,
          last30days: scans30dCount || 0,
        },
        complaints: {
          byAgency,
          byStatus,
        },
        topProducts,
        premium: {
          activeSubscriptions: activeSubs,
          totalRevenue,
        },
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur chargement métriques",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (session?.user.role !== "super_admin") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Accès réservé au Super Admin</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Métriques - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Métriques globales
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyses détaillées de l'activité sur MISSU BALA
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        ) : !metrics ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Aucune donnée disponible</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Citoyens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Citoyens inscrits</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.citizens.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total utilisateurs app</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Actifs 7 jours</CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.citizens.active7d}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((metrics.citizens.active7d / (metrics.citizens.total || 1)) * 100).toFixed(1)}% du total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Actifs 30 jours</CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.citizens.active30d}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((metrics.citizens.active30d / (metrics.citizens.total || 1)) * 100).toFixed(1)}% du total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Scans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Scans totaux</CardTitle>
                  <Package className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.scans.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">Depuis le lancement</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Scans 30 jours</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.scans.last30days}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((metrics.scans.last30days / (metrics.scans.total || 1)) * 100).toFixed(1)}% du total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Plaintes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Plaintes par agence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.complaints.byAgency.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune plainte</p>
                  ) : (
                    <div className="space-y-3">
                      {metrics.complaints.byAgency.map((item) => (
                        <div key={item.agency} className="flex items-center justify-between">
                          <Badge variant="outline">{item.agency}</Badge>
                          <span className="text-lg font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Plaintes par statut
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.complaints.byStatus.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune plainte</p>
                  ) : (
                    <div className="space-y-3">
                      {metrics.complaints.byStatus.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <Badge variant="secondary">{item.status}</Badge>
                          <span className="text-lg font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top produits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Top 10 produits scannés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun scan enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {metrics.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{product.product_name}</p>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {product.count} scans
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Abonnés Premium</CardTitle>
                  <Crown className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.premium.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Abonnements actifs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Premium</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.premium.totalRevenue.toLocaleString()} FCFA</div>
                  <p className="text-xs text-muted-foreground mt-1">Revenus cumulés</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}