import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Plus, Pencil, Trash2, List, FolderTree } from "lucide-react";

type MercurialeProduct = {
  id: number;
  product: string;
  unit: string;
  price_wholesale: number;
  price_semi: number;
  price_retail: number;
  group_id: number | null;
  category_id: number | null;
  subcategory_id: number | null;
  mercuriale_groups: { name: string } | null;
  mercuriale_categories: { name: string } | null;
  mercuriale_subcategories: { name: string } | null;
};

type Group = {
  id: number;
  name: string;
  sort_order: number;
};

type Category = {
  id: number;
  group_id: number;
  name: string;
  sort_order: number;
};

type Subcategory = {
  id: number;
  category_id: number;
  name: string;
  sort_order: number;
};

export default function MercurialeForm() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [viewMode, setViewMode] = useState<"list" | "hierarchy">("list");

  const [products, setProducts] = useState<MercurialeProduct[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [editingProduct, setEditingProduct] = useState<MercurialeProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formProduct, setFormProduct] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formGroupId, setFormGroupId] = useState<number | null>(null);
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
  const [formSubcategoryId, setFormSubcategoryId] = useState<number | null>(null);
  const [formPriceWholesale, setFormPriceWholesale] = useState("");
  const [formPriceSemi, setFormPriceSemi] = useState("");
  const [formPriceRetail, setFormPriceRetail] = useState("");

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadProducts(), loadGroups(), loadCategories(), loadSubcategories()]);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("mercuriale")
      .select(`
        *,
        mercuriale_groups(name),
        mercuriale_categories(name),
        mercuriale_subcategories(name)
      `)
      .order("product");
    
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }
    setProducts(data || []);
  }

  async function loadGroups() {
    const { data, error } = await supabase.from("mercuriale_groups").select("*").order("sort_order");
    if (error) return;
    setGroups(data || []);
  }

  async function loadCategories() {
    const { data, error } = await supabase.from("mercuriale_categories").select("*").order("sort_order");
    if (error) return;
    setCategories(data || []);
  }

  async function loadSubcategories() {
    const { data, error } = await supabase.from("mercuriale_subcategories").select("*").order("sort_order");
    if (error) return;
    setSubcategories(data || []);
  }

  function resetForm() {
    setFormProduct("");
    setFormUnit("kg");
    setFormGroupId(null);
    setFormCategoryId(null);
    setFormSubcategoryId(null);
    setFormPriceWholesale("");
    setFormPriceSemi("");
    setFormPriceRetail("");
    setEditingProduct(null);
  }

  function openCreateDialog() {
    resetForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(product: MercurialeProduct) {
    setEditingProduct(product);
    setFormProduct(product.product);
    setFormUnit(product.unit);
    setFormGroupId(product.group_id);
    setFormCategoryId(product.category_id);
    setFormSubcategoryId(product.subcategory_id);
    setFormPriceWholesale(product.price_wholesale.toString());
    setFormPriceSemi(product.price_semi.toString());
    setFormPriceRetail(product.price_retail.toString());
    setIsDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formProduct.trim() || !formSubcategoryId) {
      toast({ variant: "destructive", title: "Erreur", description: "Produit et sous-catégorie requis" });
      return;
    }

    const payload = {
      product: formProduct.trim(),
      unit: formUnit,
      group_id: formGroupId,
      category_id: formCategoryId,
      subcategory_id: formSubcategoryId,
      price_wholesale: Number(formPriceWholesale) || 0,
      price_semi: Number(formPriceSemi) || 0,
      price_retail: Number(formPriceRetail) || 0,
    };

    if (editingProduct) {
      const { error } = await supabase.from("mercuriale").update(payload).eq("id", editingProduct.id);
      if (error) {
        toast({ variant: "destructive", title: "Erreur", description: error.message });
        return;
      }
      toast({ title: "Produit modifié avec succès" });
    } else {
      const { error } = await supabase.from("mercuriale").insert(payload);
      if (error) {
        toast({ variant: "destructive", title: "Erreur", description: error.message });
        return;
      }
      toast({ title: "Produit créé avec succès" });
    }

    setIsDialogOpen(false);
    resetForm();
    loadProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Confirmer la suppression de ce produit ?")) return;

    const { error } = await supabase.from("mercuriale").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Produit supprimé avec succès" });
    loadProducts();
  }

  const filteredCategories = categories.filter((c) => c.group_id === formGroupId);
  const filteredSubcategories = subcategories.filter((s) => s.category_id === formCategoryId);

  const hierarchyData = groups.map((group) => {
    const groupCategories = categories.filter((c) => c.group_id === group.id);
    return {
      group,
      categories: groupCategories.map((category) => {
        const categorySubcategories = subcategories.filter((s) => s.category_id === category.id);
        return {
          category,
          subcategories: categorySubcategories.map((subcategory) => ({
            subcategory,
            products: products.filter((p) => p.subcategory_id === subcategory.id),
          })),
        };
      }),
    };
  });

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Mercuriale des prix
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Mercuriale des prix</h1>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produits ({products.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                Vue liste
              </Button>
              <Button
                variant={viewMode === "hierarchy" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("hierarchy")}
              >
                <FolderTree className="h-4 w-4 mr-2" />
                Vue hiérarchique
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Groupe → Catégorie</TableHead>
                  <TableHead>Sous-catégorie</TableHead>
                  <TableHead>Gros (FCFA)</TableHead>
                  <TableHead>Semi-gros (FCFA)</TableHead>
                  <TableHead>Détail (FCFA)</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.product}</TableCell>
                    <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.mercuriale_groups?.name || "—"} → {product.mercuriale_categories?.name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.mercuriale_subcategories?.name || "—"}</TableCell>
                    <TableCell>{product.price_wholesale}</TableCell>
                    <TableCell>{product.price_semi}</TableCell>
                    <TableCell>{product.price_retail}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {hierarchyData.map(({ group, categories }) => (
                <AccordionItem key={group.id} value={`group-${group.id}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📁</span>
                      <span className="font-semibold">{group.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="multiple" className="space-y-2 ml-6">
                      {categories.map(({ category, subcategories }) => (
                        <AccordionItem key={category.id} value={`cat-${category.id}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📂</span>
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 ml-6">
                              {subcategories.map(({ subcategory, products }) => (
                                <div key={subcategory.id} className="border rounded-lg p-3">
                                  <div className="flex items-center gap-2 font-medium mb-2">
                                    <span className="text-lg">📄</span>
                                    <span>{subcategory.name}</span>
                                    <span className="text-sm text-muted-foreground">({products.length})</span>
                                  </div>
                                  {products.length > 0 && (
                                    <div className="ml-8 space-y-1">
                                      {products.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between text-sm py-1">
                                          <div>
                                            <span className="font-medium">{product.product}</span>
                                            <span className="text-muted-foreground ml-2">({product.unit})</span>
                                          </div>
                                          <div className="flex gap-4 text-muted-foreground">
                                            <span>Gros: {product.price_wholesale}</span>
                                            <span>Semi: {product.price_semi}</span>
                                            <span>Détail: {product.price_retail}</span>
                                            <div className="flex gap-1">
                                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(product)}>
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="h-3 w-3 text-destructive" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsDialogOpen(false)}>
          <Card className="w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nom du produit *</Label>
                  <Input value={formProduct} onChange={(e) => setFormProduct(e.target.value)} placeholder="Ex: Tomate" />
                </div>
                <div>
                  <Label>Unité *</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="unité">unité</option>
                    <option value="sac">sac</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Groupe *</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formGroupId || ""}
                    onChange={(e) => {
                      setFormGroupId(Number(e.target.value) || null);
                      setFormCategoryId(null);
                      setFormSubcategoryId(null);
                    }}
                  >
                    <option value="">Sélectionner</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Catégorie *</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formCategoryId || ""}
                    onChange={(e) => {
                      setFormCategoryId(Number(e.target.value) || null);
                      setFormSubcategoryId(null);
                    }}
                    disabled={!formGroupId}
                  >
                    <option value="">Sélectionner</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Sous-catégorie *</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formSubcategoryId || ""}
                    onChange={(e) => setFormSubcategoryId(Number(e.target.value) || null)}
                    disabled={!formCategoryId}
                  >
                    <option value="">Sélectionner</option>
                    {filteredSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Prix gros (FCFA)</Label>
                  <Input
                    type="number"
                    value={formPriceWholesale}
                    onChange={(e) => setFormPriceWholesale(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Prix semi-gros (FCFA)</Label>
                  <Input
                    type="number"
                    value={formPriceSemi}
                    onChange={(e) => setFormPriceSemi(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Prix détail (FCFA)</Label>
                  <Input
                    type="number"
                    value={formPriceRetail}
                    onChange={(e) => setFormPriceRetail(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>{editingProduct ? "Modifier" : "Créer"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}