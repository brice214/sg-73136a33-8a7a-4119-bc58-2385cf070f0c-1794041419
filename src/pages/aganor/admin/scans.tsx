import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ScanLine, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/ui/seo";

type ScanHistory = {
  id: string;
  user_id: string;
  created_at: string;
  product_name: string;
  brand: string | null;
  barcode: string | null;
  status: string;
  nutri_score: string | null;
};

export default function Scans() {
  const { toast } = useToast();
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanHistory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    const filtered = scans.filter(
      (s) =>
        s.product_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.brand && s.brand.toLowerCase().includes(search.toLowerCase())) ||
        (s.barcode && s.barcode.includes(search))
    );
    setFilteredScans(filtered);
  }, [search, scans]);

  async function loadScans() {
    try {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setScans(data || []);
      setFilteredScans(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  const totalScans = scans.length;
  const uniqueUsers = new Set(scans.map((s) => s.user_id)).size;
  const authentic = scans.filter((s) => s.status === "authentique").length;

  return (
    <AdminLayout>
      <SEO title="Scans AGANOR - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Historique des scans</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total scans</CardTitle>
              <ScanLine className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalScans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{uniqueUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produits authentiques</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{authentic}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique des scans</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : filteredScans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun scan disponible</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Code-barres</TableHead>
                    <TableHead>Nutri-Score</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell>{new Date(scan.created_at).toLocaleString("fr-FR")}</TableCell>
                      <TableCell className="font-medium">{scan.product_name}</TableCell>
                      <TableCell>{scan.brand || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{scan.barcode || "-"}</TableCell>
                      <TableCell>
                        {scan.nutri_score ? (
                          <Badge
                            variant={
                              scan.nutri_score === "A"
                                ? "default"
                                : scan.nutri_score === "B"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {scan.nutri_score}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={scan.status === "authentique" ? "default" : "destructive"}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}