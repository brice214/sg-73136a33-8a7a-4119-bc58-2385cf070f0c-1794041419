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
  id: number;
  group_name: string;
  category: string;
  subcategory: string;
  product: string;
  unit: string;
  price_wholesale: number;
  price_semi: number;
  price_retail: number;
  sort_order: number;
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
    group_name: "",
    category: "",
    subcategory: "",
    product: "",
    unit: "kg",
    price_wholesale: 0,
    price_semi: 0,
    price_retail: 0,
    sort_order: 0,
  });

  useEffect(() => {
    loadMercuriales();
  }, []);

  useEffect(() => {
    const filtered = mercuriales.filter(
      (m) =>
        m.product.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()) ||
        m.group_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMercuriales(filtered);
  }, [search, mercuriales]);

  async function loadMercuriales() {
    try {
      const { data, error } = await supabase
        .from("mercuriale")
        .select("*")
        .order("sort_order", { ascending: true });

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
      group_name: mercuriale.group_name,
      category: mercuriale.category,
      subcategory: mercuriale.subcategory,
      product: mercuriale.product,
      unit: mercuriale.unit,
      price_wholesale: mercuriale.price_wholesale,
      price_semi: mercuriale.price_semi,
      price_retail: mercuriale.price_retail,
      sort_order: mercuriale.sort_order,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      group_name: "",
      category: "",
      subcategory: "",
      product: "",
      unit: "kg",
      price_wholesale: 0,
      price_semi: 0,
      price_retail: 0,
      sort_order: 0,
    });
    setEditingMercuriale(null);
    setIsDialogOpen(false);
  }

  async function handleSave() {
    if (!formData.product || !formData.category || !formData.group_name) {
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

  async function handleDelete(id: number) {
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
  const avgPriceRetail =
    mercuriales.length > 0
      ? mercuriales.reduce((sum, m) => sum + m.price_retail, 0) / mercuriales.length
      : 0;

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
                    <Label htmlFor="product">Produit *</Label>
                    <Input
                      id="product"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      placeholder="ex: Tomate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="group_name">Groupe *</Label>
                    <Input
                      id="group_name"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      placeholder="ex: Mont-Bouët"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="ex: Légumes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Sous-catégorie *</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="ex: Fruits locaux"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price_wholesale">Prix Gros (FCFA) *</Label>
                    <Input
                      id="price_wholesale"
                      type="number"
                      value={formData.price_wholesale}
                      onChange={(e) => setFormData({ ...formData, price_wholesale: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_semi">Prix Demi-gros (FCFA) *</Label>
                    <Input
                      id="price_semi"
                      type="number"
                      value={formData.price_semi}
                      onChange={(e) => setFormData({ ...formData, price_semi: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_retail">Prix Détail (FCFA) *</Label>
                    <Input
                      id="price_retail"
                      type="number"
                      value={formData.price_retail}
                      onChange={(e) => setFormData({ ...formData, price_retail: Number(e.target.value) })}
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
                    <Label htmlFor="sort_order">Ordre d'affichage</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
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

        <div className="grid gap-6 md:grid-cols-2">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Prix moyen détail</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{avgPriceRetail.toFixed(0)} FCFA</div>
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
                    <TableHead>Groupe</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead className="text-right">Gros</TableHead>
                    <TableHead className="text-right">Demi-gros</TableHead>
                    <TableHead className="text-right">Détail</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMercuriales.map((mercuriale) => (
                    <TableRow key={mercuriale.id}>
                      <TableCell className="font-medium">{mercuriale.product}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mercuriale.category}</Badge>
                      </TableCell>
                      <TableCell>{mercuriale.group_name}</TableCell>
                      <TableCell>{mercuriale.unit}</TableCell>
                      <TableCell className="text-right">{mercuriale.price_wholesale} FCFA</TableCell>
                      <TableCell className="text-right">{mercuriale.price_semi} FCFA</TableCell>
                      <TableCell className="text-right font-semibold">{mercuriale.price_retail} FCFA</TableCell>
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