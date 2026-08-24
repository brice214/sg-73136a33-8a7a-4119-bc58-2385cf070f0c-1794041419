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

interface PriceReference {
  id: string;
  product_name: string;
  category: string;
  unit: string;
  reference_price: number;
  min_price: number;
  max_price: number;
  region: string;
  updated_at: string;
}

const categories = [
  "Alimentaire",
  "Boissons",
  "Hygiène",
  "Cosmétiques",
  "Autre",
];

const units = [
  "kg",
  "unité",
  "litre",
  "sac",
  "paquet",
];

const regions = [
  "Libreville",
  "Port-Gentil",
  "Franceville",
  "Oyem",
  "Moanda",
  "Nationale",
];

export default function MercurialePage() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<PriceReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceReference | null>(null);

  const [formData, setFormData] = useState({
    product_name: "",
    category: "Alimentaire",
    unit: "kg",
    reference_price: 0,
    min_price: 0,
    max_price: 0,
    region: "Nationale",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  async function loadPrices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("price_references")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPrices(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur chargement", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormData({
      product_name: "",
      category: "Alimentaire",
      unit: "kg",
      reference_price: 0,
      min_price: 0,
      max_price: 0,
      region: "Nationale",
    });
    setCreateDialog(true);
  }

  function openEdit(price: PriceReference) {
    setSelectedPrice(price);
    setFormData({
      product_name: price.product_name,
      category: price.category,
      unit: price.unit,
      reference_price: price.reference_price,
      min_price: price.min_price,
      max_price: price.max_price,
      region: price.region,
    });
    setEditDialog(true);
  }

  async function handleCreate() {
    if (!formData.product_name || formData.reference_price <= 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Nom et prix référence requis" });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("price_references").insert([formData]);

      if (error) throw error;

      toast({ title: "Prix de référence créé" });
      setCreateDialog(false);
      loadPrices();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur création", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedPrice) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("price_references")
        .update(formData)
        .eq("id", selectedPrice.id);

      if (error) throw error;

      toast({ title: "Prix de référence modifié" });
      setEditDialog(false);
      loadPrices();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur modification", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(price: PriceReference) {
    if (!confirm(`Supprimer ${price.product_name} ?`)) return;

    try {
      const { error } = await supabase.from("price_references").delete().eq("id", price.id);

      if (error) throw error;

      toast({ title: "Prix de référence supprimé" });
      loadPrices();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur suppression", description: error.message });
    }
  }

  const filteredPrices = prices.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (filterRegion !== "all" && p.region !== filterRegion) return false;
    if (searchQuery && !p.product_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
              <div className="text-3xl font-bold text-primary">{prices.length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {new Set(prices.map((p) => p.category)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Régions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {new Set(prices.map((p) => p.region)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Dernière MAJ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-green-600">
                {prices.length > 0 ? new Date(prices[0].updated_at).toLocaleDateString("fr-FR") : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="grid gap-4 md:grid-cols-3">
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
              <div>
                <Label htmlFor="filterRegion">Région</Label>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger id="filterRegion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {regions.map((reg) => (
                      <SelectItem key={reg} value={reg}>
                        {reg}
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
                  <TableHead>Prix référence</TableHead>
                  <TableHead>Min - Max</TableHead>
                  <TableHead>Région</TableHead>
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
                ) : filteredPrices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucun prix de référence
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrices.map((price) => (
                    <TableRow key={price.id}>
                      <TableCell className="font-medium">{price.product_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{price.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{price.unit}</TableCell>
                      <TableCell className="font-mono font-semibold text-primary">
                        {price.reference_price} FCFA
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {price.min_price} - {price.max_price} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-accent">{price.region}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(price)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(price)}>
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
              <DialogTitle>Nouveau prix de référence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product_name">Nom produit *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
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
              <div>
                <Label htmlFor="reference_price">Prix de référence (FCFA) *</Label>
                <Input
                  id="reference_price"
                  type="number"
                  value={formData.reference_price}
                  onChange={(e) => setFormData({ ...formData, reference_price: parseFloat(e.target.value) || 0 })}
                  placeholder="ex: 500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_price">Prix min (FCFA)</Label>
                  <Input
                    id="min_price"
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: parseFloat(e.target.value) || 0 })}
                    placeholder="ex: 450"
                  />
                </div>
                <div>
                  <Label htmlFor="max_price">Prix max (FCFA)</Label>
                  <Input
                    id="max_price"
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: parseFloat(e.target.value) || 0 })}
                    placeholder="ex: 550"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="region">Région</Label>
                <Select value={formData.region} onValueChange={(val) => setFormData({ ...formData, region: val })}>
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((reg) => (
                      <SelectItem key={reg} value={reg}>
                        {reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <DialogTitle>Modifier prix de référence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_product_name">Nom produit *</Label>
                <Input
                  id="edit_product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
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
              <div>
                <Label htmlFor="edit_reference_price">Prix de référence (FCFA) *</Label>
                <Input
                  id="edit_reference_price"
                  type="number"
                  value={formData.reference_price}
                  onChange={(e) => setFormData({ ...formData, reference_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_min_price">Prix min (FCFA)</Label>
                  <Input
                    id="edit_min_price"
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_max_price">Prix max (FCFA)</Label>
                  <Input
                    id="edit_max_price"
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_region">Région</Label>
                <Select value={formData.region} onValueChange={(val) => setFormData({ ...formData, region: val })}>
                  <SelectTrigger id="edit_region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((reg) => (
                      <SelectItem key={reg} value={reg}>
                        {reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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