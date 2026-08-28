import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Mercuriale = {
  id: string;
  product_name: string;
  category: string;
  unit: string;
  min_price: number;
  max_price: number;
  average_price: number;
  market: string;
  updated_at: string;
};

export default function Mercuriale() {
  const { toast } = useToast();
  const [mercuriales, setMercuriales] = useState<Mercuriale[]>([]);
  const [filteredMercuriales, setFilteredMercuriales] = useState<Mercuriale[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMercuriale, setEditingMercuriale] = useState<Mercuriale | null>(null);

  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    unit: "kg",
    min_price: 0,
    max_price: 0,
    average_price: 0,
    market: "",
  });

  useEffect(() => {
    loadMercuriales();
  }, []);

  useEffect(() => {
    const filtered = mercuriales.filter(
      (m) =>
        m.product_name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()) ||
        m.market.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMercuriales(filtered);
  }, [search, mercuriales]);

  async function loadMercuriales() {
    try {
      const { data, error } = await supabase
        .from("mercuriale")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setMercuriales(data || []);
      setFilteredMercuriales(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(mercuriale: Mercuriale) {
    setEditingMercuriale(mercuriale);
    setFormData({
      product_name: mercuriale.product_name,
      category: mercuriale.category,
      unit: mercuriale.unit,
      min_price: mercuriale.min_price,
      max_price: mercuriale.max_price,
      average_price: mercuriale.average_price,
      market: mercuriale.market,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      product_name: "",
      category: "",
      unit: "kg",
      min_price: 0,
      max_price: 0,
      average_price: 0,
      market: "",
    });
    setEditingMercuriale(null);
    setIsDialogOpen(false);
  }

  async function handleSave() {
    if (!formData.product_name || !formData.category || !formData.market) {
      toast({ variant: "destructive", title: "Erreur", description: "Tous les champs sont requis" });
      return;
    }

    try {
      if (editingMercuriale) {
        const { error } = await supabase
          .from("mercuriale")
          .update(formData)
          .eq("id", editingMercuriale.id);

        if (error) throw error;
        toast({ title: "Mercuriale mise à jour avec succès" });
      } else {
        const { error } = await supabase.from("mercuriale").insert([formData]);

        if (error) throw error;
        toast({ title: "Mercuriale créée avec succès" });
      }

      loadMercuriales();
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirmer la suppression de cette entrée ?")) return;

    try {
      const { error } = await supabase.from("mercuriale").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Entrée supprimée avec succès" });
      loadMercuriales();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  const totalProducts = mercuriales.length;
  const avgPrice =
    mercuriales.length > 0
      ? mercuriales.reduce((sum, m) => sum + m.average_price, 0) / mercuriales.length
      : 0;
  const thisWeek = mercuriales.filter(
    (m) => new Date(m.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Mercuriale des prix</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMercuriale ? "Modifier l'entrée" : "Nouvelle entrée mercuriale"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_name">Produit *</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      placeholder="ex: Tomate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="ex: Légumes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min_price">Prix min (FCFA) *</Label>
                    <Input
                      id="min_price"
                      type="number"
                      value={formData.min_price}
                      onChange={(e) => setFormData({ ...formData, min_price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_price">Prix max (FCFA) *</Label>
                    <Input
                      id="max_price"
                      type="number"
                      value={formData.max_price}
                      onChange={(e) => setFormData({ ...formData, max_price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="average_price">Prix moyen (FCFA) *</Label>
                    <Input
                      id="average_price"
                      type="number"
                      value={formData.average_price}
                      onChange={(e) => setFormData({ ...formData, average_price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unité *</Label>
                    <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                      <SelectTrigger id="unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="unité">unité</SelectItem>
                        <SelectItem value="sac">sac</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="market">Marché *</Label>
                    <Input
                      id="market"
                      value={formData.market}
                      onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                      placeholder="ex: Mont-Bouët"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  {editingMercuriale ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total produits</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prix moyen</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgPrice.toFixed(0)} FCFA</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mises à jour (7j)</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{thisWeek}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des prix</CardTitle>
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
            ) : filteredMercuriales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune donnée disponible</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Marché</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead className="text-right">Prix min</TableHead>
                    <TableHead className="text-right">Prix moyen</TableHead>
                    <TableHead className="text-right">Prix max</TableHead>
                    <TableHead>Mise à jour</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMercuriales.map((mercuriale) => (
                    <TableRow key={mercuriale.id}>
                      <TableCell className="font-medium">{mercuriale.product_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mercuriale.category}</Badge>
                      </TableCell>
                      <TableCell>{mercuriale.market}</TableCell>
                      <TableCell>{mercuriale.unit}</TableCell>
                      <TableCell className="text-right">{mercuriale.min_price} FCFA</TableCell>
                      <TableCell className="text-right font-semibold">{mercuriale.average_price} FCFA</TableCell>
                      <TableCell className="text-right">{mercuriale.max_price} FCFA</TableCell>
                      <TableCell>{new Date(mercuriale.updated_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(mercuriale)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(mercuriale.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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