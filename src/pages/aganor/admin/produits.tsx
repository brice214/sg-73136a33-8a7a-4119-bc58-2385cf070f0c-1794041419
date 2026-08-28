import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Product = {
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
  institution: string;
};

export default function Produits() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Product>({
    barcode: "",
    name: "",
    brand: "",
    category: "",
    origin: "",
    image_url: "",
    ingredients: [],
    allergens: [],
    nutri_score: "",
    authentic: true,
    authenticity_note: "",
    aganor_certified: false,
    warnings: [],
    institution: "aganor",
  });

  const [ingredientsText, setIngredientsText] = useState("");
  const [allergensText, setAllergensText] = useState("");
  const [warningsText, setWarningsText] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.barcode.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  async function loadProducts() {
    try {
      const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true });

      if (error) throw error;
      setProducts((data || []) as Product[]);
      setFilteredProducts((data || []) as Product[]);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData(product);
    setIngredientsText(product.ingredients.join(", "));
    setAllergensText(product.allergens.join(", "));
    setWarningsText(product.warnings.join(", "));
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      barcode: "",
      name: "",
      brand: "",
      category: "",
      origin: "",
      image_url: "",
      ingredients: [],
      allergens: [],
      nutri_score: "",
      authentic: true,
      authenticity_note: "",
      aganor_certified: false,
      warnings: [],
      institution: "aganor",
    });
    setIngredientsText("");
    setAllergensText("");
    setWarningsText("");
    setEditingProduct(null);
    setIsDialogOpen(false);
  }

  async function handleSave() {
    if (!formData.barcode || !formData.name) {
      toast({ variant: "destructive", title: "Erreur", description: "Code-barres et nom sont requis" });
      return;
    }

    try {
      const payload = {
        ...formData,
        institution: "aganor",
        ingredients: ingredientsText.split(",").map((s) => s.trim()).filter(Boolean),
        allergens: allergensText.split(",").map((s) => s.trim()).filter(Boolean),
        warnings: warningsText.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("barcode", editingProduct.barcode);

        if (error) throw error;
        toast({ title: "Produit mis à jour avec succès" });
      } else {
        const { error } = await supabase.from("products").insert([payload]);

        if (error) throw error;
        toast({ title: "Produit créé avec succès" });
      }

      loadProducts();
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleDelete(barcode: string) {
    if (!confirm("Confirmer la suppression de ce produit ?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("barcode", barcode);

      if (error) throw error;
      toast({ title: "Produit supprimé avec succès" });
      loadProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  const totalProducts = products.length;
  const certified = products.filter((p) => p.aganor_certified).length;
  const authentic = products.filter((p) => p.authentic).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gestion des produits</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="barcode">Code-barres *</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Ex: 3760123456789"
                      disabled={!!editingProduct}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Chocolat noir 70%"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marque</Label>
                    <Input
                      id="brand"
                      value={formData.brand || ""}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Ex: Lindt"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Chocolaterie"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">Origine</Label>
                    <Input
                      id="origin"
                      value={formData.origin || ""}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="Ex: Gabon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nutri_score">Nutri-Score</Label>
                    <Input
                      id="nutri_score"
                      value={formData.nutri_score || ""}
                      onChange={(e) => setFormData({ ...formData, nutri_score: e.target.value.toUpperCase() })}
                      placeholder="A, B, C, D, E"
                      maxLength={1}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="ingredients">Ingrédients (séparés par des virgules)</Label>
                  <Textarea
                    id="ingredients"
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    placeholder="Ex: Pâte de cacao, Sucre, Beurre de cacao"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="allergens">Allergènes (séparés par des virgules)</Label>
                  <Textarea
                    id="allergens"
                    value={allergensText}
                    onChange={(e) => setAllergensText(e.target.value)}
                    placeholder="Ex: Lait, Fruits à coque"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="warnings">Avertissements (séparés par des virgules)</Label>
                  <Textarea
                    id="warnings"
                    value={warningsText}
                    onChange={(e) => setWarningsText(e.target.value)}
                    placeholder="Ex: Contient des traces de fruits à coque"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="authentic">Produit authentique</Label>
                    <Switch
                      id="authentic"
                      checked={formData.authentic}
                      onCheckedChange={(checked) => setFormData({ ...formData, authentic: checked })}
                    />
                  </div>

                  {!formData.authentic && (
                    <div>
                      <Label htmlFor="authenticity_note">Note d'authenticité</Label>
                      <Textarea
                        id="authenticity_note"
                        value={formData.authenticity_note || ""}
                        onChange={(e) => setFormData({ ...formData, authenticity_note: e.target.value })}
                        placeholder="Raison de la non-authenticité"
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="aganor_certified">Certifié AGANOR</Label>
                    <Switch
                      id="aganor_certified"
                      checked={formData.aganor_certified}
                      onCheckedChange={(checked) => setFormData({ ...formData, aganor_certified: checked })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>{editingProduct ? "Mettre à jour" : "Créer"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total produits</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certifiés AGANOR</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{certified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Authentiques</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{authentic}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des produits</CardTitle>
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun produit disponible</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code-barres</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.barcode}>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {product.aganor_certified && (
                            <Badge variant="default" className="bg-accent">
                              Certifié
                            </Badge>
                          )}
                          {!product.authentic && (
                            <Badge variant="destructive">Non authentique</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.barcode)}>
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