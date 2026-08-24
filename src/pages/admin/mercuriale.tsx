import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, DollarSign, TrendingUp } from "lucide-react";

interface MercurialeItem {
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
}

const categories = ["Vivres", "Légumes", "Fruits", "Viandes", "Poissons", "Boissons", "Autre"];
const units = ["kg", "unité", "litre", "sac", "paquet", "boîte"];

export default function MercurialePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MercurialeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MercurialeItem | null>(null);

  const [formData, setFormData] = useState({
    group_name: "",
    category: "Vivres",
    subcategory: "",
    product: "",
    unit: "kg",
    price_wholesale: 0,
    price_semi: 0,
    price_retail: 0,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mercuriale")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur chargement", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormData({
      group_name: "",
      category: "Vivres",
      subcategory: "",
      product: "",
      unit: "kg",
      price_wholesale: 0,
      price_semi: 0,
      price_retail: 0,
    });
    setCreateDialog(true);
  }

  function openEdit(item: MercurialeItem) {
    setSelectedItem(item);
    setFormData({
      group_name: item.group_name,
      category: item.category,
      subcategory: item.subcategory,
      product: item.product,
      unit: item.unit,
      price_wholesale: item.price_wholesale,
      price_semi: item.price_semi,
      price_retail: item.price_retail,
    });
    setEditDialog(true);
  }

  async function handleCreate() {
    if (!formData.product || formData.price_retail <= 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Produit et prix détail requis" });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("mercuriale").insert([formData]);

      if (error) throw error;

      toast({ title: "Prix mercuriale créé" });
      setCreateDialog(false);
      loadItems();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur création", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("mercuriale")
        .update(formData)
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast({ title: "Prix mercuriale modifié" });
      setEditDialog(false);
      loadItems();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur modification", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: MercurialeItem) {
    if (!confirm(`Supprimer ${item.product} ?`)) return;

    try {
      const { error } = await supabase.from("mercuriale").delete().eq("id", item.id);

      if (error) throw error;

      toast({ title: "Prix mercuriale supprimé" });
      loadItems();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur suppression", description: error.message });
    }
  }

  const filteredItems = items.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (searchQuery && !item.product.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <SEO title="Mercuriale - MISSU BALA Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Mercuriale des prix</h1>
            <p className="text-muted-foreground mt-1">Prix de référence DGCCRF</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter prix
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{items.length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {new Set(items.map((i) => i.category)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Prix moyen détail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {items.length > 0
                  ? Math.round(items.reduce((sum, i) => sum + i.price_retail, 0) / items.length)
                  : 0}{" "}
                FCFA
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Produits suivis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{items.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Nom produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filterCat">Catégorie</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="filterCat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Prix gros</TableHead>
                  <TableHead>Prix demi-gros</TableHead>
                  <TableHead>Prix détail</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucun prix mercuriale
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell className="font-mono text-sm">{item.price_wholesale} FCFA</TableCell>
                      <TableCell className="font-mono text-sm">{item.price_semi} FCFA</TableCell>
                      <TableCell className="font-mono font-semibold text-primary">
                        {item.price_retail} FCFA
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau prix mercuriale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Nom produit *</Label>
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder="ex: Riz blanc"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="ex: Riz local"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="group_name">Groupe</Label>
                  <Input
                    id="group_name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    placeholder="ex: Céréales"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unité</Label>
                  <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_wholesale">Prix gros (FCFA)</Label>
                  <Input
                    id="price_wholesale"
                    type="number"
                    value={formData.price_wholesale}
                    onChange={(e) => setFormData({ ...formData, price_wholesale: parseInt(e.target.value) || 0 })}
                    placeholder="450"
                  />
                </div>
                <div>
                  <Label htmlFor="price_semi">Prix demi-gros (FCFA)</Label>
                  <Input
                    id="price_semi"
                    type="number"
                    value={formData.price_semi}
                    onChange={(e) => setFormData({ ...formData, price_semi: parseInt(e.target.value) || 0 })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="price_retail">Prix détail (FCFA) *</Label>
                  <Input
                    id="price_retail"
                    type="number"
                    value={formData.price_retail}
                    onChange={(e) => setFormData({ ...formData, price_retail: parseInt(e.target.value) || 0 })}
                    placeholder="550"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier prix mercuriale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_product">Nom produit *</Label>
                <Input
                  id="edit_product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger id="edit_category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_subcategory">Sous-catégorie</Label>
                  <Input
                    id="edit_subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_group_name">Groupe</Label>
                  <Input
                    id="edit_group_name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_unit">Unité</Label>
                  <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                    <SelectTrigger id="edit_unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_price_wholesale">Prix gros (FCFA)</Label>
                  <Input
                    id="edit_price_wholesale"
                    type="number"
                    value={formData.price_wholesale}
                    onChange={(e) => setFormData({ ...formData, price_wholesale: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_price_semi">Prix demi-gros (FCFA)</Label>
                  <Input
                    id="edit_price_semi"
                    type="number"
                    value={formData.price_semi}
                    onChange={(e) => setFormData({ ...formData, price_semi: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_price_retail">Prix détail (FCFA) *</Label>
                  <Input
                    id="edit_price_retail"
                    type="number"
                    value={formData.price_retail}
                    onChange={(e) => setFormData({ ...formData, price_retail: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}