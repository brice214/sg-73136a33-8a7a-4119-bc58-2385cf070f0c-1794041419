import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  thisWeek: number;
  thisMonth: number;
}

export default function StatsAgasaPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [total, pending, inProgress, resolved, rejected, thisWeek, thisMonth] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").eq("status", "soumise"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").eq("status", "en_cours"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").eq("status", "resolue"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").eq("status", "rejetee"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").gte("created_at", weekAgo.toISOString()),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("agency", "AGASA").gte("created_at", monthAgo.toISOString()),
      ]);

      setStats({
        total: total.count || 0,
        pending: pending.count || 0,
        inProgress: inProgress.count || 0,
        resolved: resolved.count || 0,
        rejected: rejected.count || 0,
        thisWeek: thisWeek.count || 0,
        thisMonth: thisMonth.count || 0,
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

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <AdminLayout>
      <SEO title="Statistiques AGASA - MISSU BALA Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Statistiques AGASA</h1>
          <p className="text-muted-foreground mt-1">Analyse des plaintes et performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Total plaintes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Résolues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Taux résolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{resolutionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Répartition par statut</CardTitle>
              <CardDescription>Distribution actuelle des plaintes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">En attente</span>
                <span className="font-bold text-amber-500">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">En cours</span>
                <span className="font-bold text-blue-500">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Résolues</span>
                <span className="font-bold text-green-600">{stats.resolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rejetées</span>
                <span className="font-bold text-destructive">{stats.rejected}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Plaintes reçues par période</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cette semaine</span>
                <span className="font-bold text-primary">{stats.thisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ce mois</span>
                <span className="font-bold text-primary">{stats.thisMonth}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}