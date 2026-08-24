import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Scan, TrendingUp, Package, BarChart3 } from "lucide-react";

interface ScanStats {
  totalScans: number;
  scansToday: number;
  scansWeek: number;
  scansMonth: number;
  topProducts: Array<{ barcode: string; name: string; count: number }>;
}

export default function ScansPage() {
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [totalScans, scansToday, scansWeek, scansMonth] = await Promise.all([
        supabase.from("scan_history").select("id", { count: "exact", head: true }),
        supabase.from("scan_history").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("scan_history").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
        supabase.from("scan_history").select("id", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
      ]);

      const { data: scansData } = await supabase
        .from("scan_history")
        .select("barcode, products(name)")
        .order("created_at", { ascending: false })
        .limit(1000);

      const barcodeCount: Record<string, { barcode: string; name: string; count: number }> = {};

      scansData?.forEach((scan: any) => {
        const barcode = scan.barcode;
        const name = scan.products?.name || "Produit inconnu";

        if (!barcodeCount[barcode]) {
          barcodeCount[barcode] = { barcode, name, count: 0 };
        }
        barcodeCount[barcode].count++;
      });

      const topProducts = Object.values(barcodeCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalScans: totalScans.count || 0,
        scansToday: scansToday.count || 0,
        scansWeek: scansWeek.count || 0,
        scansMonth: scansMonth.count || 0,
        topProducts,
      });
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
    }
  }

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
      <SEO title="Statistiques Scans - MISSU BALA Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Statistiques Scans</h1>
          <p className="text-muted-foreground mt-1">Analyse de l'utilisation du scanner produits</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scan className="h-4 w-4 text-primary" />
                Total scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalScans}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.scansToday}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                7 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.scansWeek}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.scansMonth}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top 10 produits scannés
            </CardTitle>
            <CardDescription>Les produits les plus consultés par les citoyens</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun scan enregistré</p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.barcode} className="flex items-center gap-4 pb-3 border-b last:border-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{product.barcode}</p>
                    </div>
                    <Badge className="bg-primary">{product.count} scans</Badge>
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