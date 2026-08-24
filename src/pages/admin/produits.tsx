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
import { Plus, Pencil, Trash2, Package } from "lucide-react";

interface Product {
  barcode: string;
  name: string;
  brand: string | null;
  category: string | null;
  origin: string | null;
  image_url: string | null;
  ingredients: string[];
  allergens: string[];
  nutri_score: string | null;
  authentic: boolean;
  authenticity_note: string | null;
  aganor_certified: boolean;
  warnings: string[];
}

const categories = [
  "Alimentaire",
  "Boissons",
  "Hygiène",
  "Cosmétiques",
  "Électronique",
  "Textile",
  "Mobilier",
  "Autre",
];

export default function ProduitsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    brand: "",
    category: "Alimentaire",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur chargement", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormData({
      barcode: "",
      name: "",
      brand: "",
      category: "Alimentaire",
    });
    setCreateDialog(true);
  }

  function openEdit(product: Product) {
    setSelectedProduct(product);
    setFormData({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand || "",
      category: product.category || "Alimentaire",
    });
    setEditDialog(true);
  }

  async function handleCreate() {
    if (!formData.barcode || !formData.name) {
      toast({ variant: "destructive", title: "Erreur", description: "Code-barres et nom requis" });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("products").insert([{
        barcode: formData.barcode,
        name: formData.name,
        brand: formData.brand || null,
        category: formData.category || null,
        authentic: true,
        aganor_certified: true,
      }]);

      if (error) throw error;

      toast({ title: "Produit créé" });
      setCreateDialog(false);
      setFormData({ barcode: "", name: "", brand: "", category: "" });
      loadProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur création", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          brand: formData.brand || null,
          category: formData.category || null,
        })
        .eq("barcode", selectedProduct.barcode);

      if (error) throw error;

      toast({ title: "Produit modifié" });
      setEditDialog(false);
      loadProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur modification", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Supprimer ${product.name} ?`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("barcode", product.barcode);

      if (error) throw error;

      toast({ title: "Produit supprimé" });
      loadProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur suppression", description: error.message });
    }
  }

  const filteredProducts = products.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.barcode.includes(searchQuery)) return false;
    return true;
  });

  return (
    <AdminLayout>
      <SEO title="Registre Produits - MISSU BALA Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Registre Produits</h1>
            <p className="text-muted-foreground mt-1">Catalogue AGANOR</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter produit
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Total produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{products.length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Certifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {products.filter((p) => p.aganor_certified).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Non certifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">
                {products.filter((p) => !p.aganor_certified).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {new Set(products.map((p) => p.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Nom ou code-barres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-48">
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
                  <TableHead>Code-barres</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Fabricant</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Aucun produit
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.barcode}>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.brand || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category || "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.aganor_certified ? (
                          <Badge className="bg-green-600">Certifié</Badge>
                        ) : (
                          <Badge className="bg-amber-500">Non certifié</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product)}>
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
              <DialogTitle>Nouveau produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="barcode">Code-barres *</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="ex: 3045320001235"
                />
              </div>
              <div>
                <Label htmlFor="name">Nom produit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Coca Cola 33cl"
                />
              </div>
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="ex: Coca Cola"
                />
              </div>
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
              <DialogTitle>Modifier produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code-barres</Label>
                <Input value={formData.barcode} disabled className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="edit_name">Nom produit *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_brand">Marque</Label>
                <Input
                  id="edit_brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_approved"
                  checked={formData.is_approved}
                  onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit_approved" className="cursor-pointer">
                  Produit approuvé
                </Label>
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