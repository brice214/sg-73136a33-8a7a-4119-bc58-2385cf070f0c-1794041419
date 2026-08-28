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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, TrendingUp, DollarSign, List, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Mercuriale = {
  id: number;
  group_id: number | null;
  category_id: number | null;
  subcategory_id: number | null;
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

type Group = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  group_id: number;
  name: string;
};

type Subcategory = {
  id: number;
  category_id: number;
  name: string;
};

export default function Mercuriale() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [mercuriales, setMercuriales] = useState<Mercuriale[]>([]);
  const [filteredMercuriales, setFilteredMercuriales] = useState<Mercuriale[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMercuriale, setEditingMercuriale] = useState<Mercuriale | null>(null);

  // Hierarchy data
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [formData, setFormData] = useState({
    group_id: 0,
    category_id: 0,
    subcategory_id: 0,
    product: "",
    unit: "kg",
    price_wholesale: 0,
    price_semi: 0,
    price_retail: 0,
    sort_order: 0,
  });

  useEffect(() => {
    loadMercuriales();
    loadGroups();
    loadCategories();
    loadSubcategories();
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

  async function loadGroups() {
    try {
      const { data, error } = await supabase
        .from("mercuriale_groups")
        .select("id, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      console.error("Erreur chargement groupes:", error);
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from("mercuriale_categories")
        .select("id, group_id, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Erreur chargement catégories:", error);
    }
  }

  async function loadSubcategories() {
    try {
      const { data, error } = await supabase
        .from("mercuriale_subcategories")
        .select("id, category_id, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setSubcategories(data || []);
    } catch (error: any) {
      console.error("Erreur chargement sous-catégories:", error);
    }
  }

  function handleEdit(mercuriale: Mercuriale) {
    setEditingMercuriale(mercuriale);
    setFormData({
      group_id: mercuriale.group_id || 0,
      category_id: mercuriale.category_id || 0,
      subcategory_id: mercuriale.subcategory_id || 0,
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
      group_id: 0,
      category_id: 0,
      subcategory_id: 0,
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
    if (!formData.product || !formData.subcategory_id) {
      toast({ variant: "destructive", title: "Erreur", description: "Produit et sous-catégorie requis" });
      return;
    }

    try {
      // Get names for backward compatibility
      const group = groups.find((g) => g.id === formData.group_id);
      const category = categories.find((c) => c.id === formData.category_id);
      const subcategory = subcategories.find((s) => s.id === formData.subcategory_id);

      const payload = {
        group_id: formData.group_id,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        group_name: group?.name || "",
        category: category?.name || "",
        subcategory: subcategory?.name || "",
        product: formData.product,
        unit: formData.unit,
        price_wholesale: formData.price_wholesale,
        price_semi: formData.price_semi,
        price_retail: formData.price_retail,
        sort_order: formData.sort_order,
      };

      if (editingMercuriale) {
        const { error } = await supabase
          .from("mercuriale")
          .update(payload)
          .eq("id", editingMercuriale.id);

        if (error) throw error;
        toast({ title: "Mercuriale mise à jour avec succès" });
      } else {
        const { error } = await supabase.from("mercuriale").insert([payload]);

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

  // Filter categories and subcategories based on selection
  const filteredCategories = formData.group_id
    ? categories.filter((c) => c.group_id === formData.group_id)
    : categories;

  const filteredSubcategories = formData.category_id
    ? subcategories.filter((s) => s.category_id === formData.category_id)
    : subcategories;

  // Organize products by hierarchy for tree view
  const organizedData = groups.map((group) => ({
    group,
    categories: categories
      .filter((cat) => cat.group_id === group.id)
      .map((category) => ({
        category,
        subcategories: subcategories
          .filter((sub) => sub.category_id === category.id)
          .map((subcategory) => ({
            subcategory,
            products: mercuriales.filter((m) => m.subcategory_id === subcategory.id),
          })),
      })),
  }));

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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="group">Groupe *</Label>
                    <Select
                      value={formData.group_id.toString()}
                      onValueChange={(val) => {
                        setFormData({ ...formData, group_id: Number(val), category_id: 0, subcategory_id: 0 });
                      }}
                    >
                      <SelectTrigger id="group">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g.id} value={g.id.toString()}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category_id.toString()}
                      onValueChange={(val) => {
                        setFormData({ ...formData, category_id: Number(val), subcategory_id: 0 });
                      }}
                      disabled={!formData.group_id}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Sous-catégorie *</Label>
                    <Select
                      value={formData.subcategory_id.toString()}
                      onValueChange={(val) => setFormData({ ...formData, subcategory_id: Number(val) })}
                      disabled={!formData.category_id}
                    >
                      <SelectTrigger id="subcategory">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              Vue liste
            </TabsTrigger>
            <TabsTrigger value="hierarchy">
              <FolderTree className="h-4 w-4 mr-2" />
              Vue hiérarchique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
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
          </TabsContent>

          <TabsContent value="hierarchy">
            <Card>
              <CardHeader>
                <CardTitle>Organisation par groupes</CardTitle>
              </CardHeader>
              <CardContent>
                {organizedData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée. Créez des groupes dans le module Catalogue d'abord.
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {organizedData.map((groupData) => (
                      <AccordionItem key={groupData.group.id} value={`group-${groupData.group.id}`}>
                        <AccordionTrigger className="font-semibold text-primary">
                          📁 {groupData.group.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          {groupData.categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground pl-6">Aucune catégorie</p>
                          ) : (
                            <Accordion type="multiple" className="pl-4">
                              {groupData.categories.map((catData) => (
                                <AccordionItem key={catData.category.id} value={`cat-${catData.category.id}`}>
                                  <AccordionTrigger className="text-sm font-medium">
                                    📂 {catData.category.name}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    {catData.subcategories.length === 0 ? (
                                      <p className="text-sm text-muted-foreground pl-6">Aucune sous-catégorie</p>
                                    ) : (
                                      <Accordion type="multiple" className="pl-4">
                                        {catData.subcategories.map((subData) => (
                                          <AccordionItem key={subData.subcategory.id} value={`sub-${subData.subcategory.id}`}>
                                            <AccordionTrigger className="text-sm">
                                              📄 {subData.subcategory.name} ({subData.products.length} produits)
                                            </AccordionTrigger>
                                            <AccordionContent>
                                              {subData.products.length === 0 ? (
                                                <p className="text-sm text-muted-foreground pl-6">Aucun produit</p>
                                              ) : (
                                                <div className="pl-4 space-y-2">
                                                  {subData.products.map((product) => (
                                                    <div
                                                      key={product.id}
                                                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                                    >
                                                      <div>
                                                        <p className="font-medium">{product.product}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                          Unité: {product.unit}
                                                        </p>
                                                      </div>
                                                      <div className="text-right">
                                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                                          <div>
                                                            <p className="text-muted-foreground">Gros</p>
                                                            <p className="font-medium">{product.price_wholesale} FCFA</p>
                                                          </div>
                                                          <div>
                                                            <p className="text-muted-foreground">Demi-gros</p>
                                                            <p className="font-medium">{product.price_semi} FCFA</p>
                                                          </div>
                                                          <div>
                                                            <p className="text-muted-foreground">Détail</p>
                                                            <p className="font-semibold text-primary">
                                                              {product.price_retail} FCFA
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </AccordionContent>
                                          </AccordionItem>
                                        ))}
                                      </Accordion>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}