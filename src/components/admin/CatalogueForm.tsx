import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

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

export default function CatalogueForm() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");

  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  const [newGroupName, setNewGroupName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryGroupId, setNewCategoryGroupId] = useState<number | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadGroups(), loadCategories(), loadSubcategories()]);
  }

  async function loadGroups() {
    const { data, error } = await supabase.from("mercuriale_groups").select("*").order("sort_order");
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }
    setGroups(data || []);
  }

  async function loadCategories() {
    const { data, error } = await supabase.from("mercuriale_categories").select("*").order("sort_order");
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }
    setCategories(data || []);
  }

  async function loadSubcategories() {
    const { data, error } = await supabase.from("mercuriale_subcategories").select("*").order("sort_order");
    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }
    setSubcategories(data || []);
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;

    const maxOrder = groups.length > 0 ? Math.max(...groups.map((g) => g.sort_order)) : 0;

    const { error } = await supabase.from("mercuriale_groups").insert({
      name: newGroupName.trim(),
      sort_order: maxOrder + 1,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Groupe créé avec succès" });
    setNewGroupName("");
    loadGroups();
  }

  async function handleUpdateGroup(id: number, name: string) {
    const { error } = await supabase.from("mercuriale_groups").update({ name: name.trim() }).eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Groupe modifié avec succès" });
    setEditingGroup(null);
    loadGroups();
  }

  async function handleDeleteGroup(id: number) {
    if (!confirm("Supprimer ce groupe et toutes ses catégories/sous-catégories ?")) return;

    const { error } = await supabase.from("mercuriale_groups").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Groupe supprimé avec succès" });
    loadData();
  }

  async function handleMoveGroup(id: number, direction: "up" | "down") {
    const index = groups.findIndex((g) => g.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === groups.length - 1)) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = groups[index];
    const swap = groups[swapIndex];

    await supabase.from("mercuriale_groups").update({ sort_order: swap.sort_order }).eq("id", current.id);
    await supabase.from("mercuriale_groups").update({ sort_order: current.sort_order }).eq("id", swap.id);

    loadGroups();
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim() || !newCategoryGroupId) return;

    const maxOrder =
      categories.filter((c) => c.group_id === newCategoryGroupId).length > 0
        ? Math.max(...categories.filter((c) => c.group_id === newCategoryGroupId).map((c) => c.sort_order))
        : 0;

    const { error } = await supabase.from("mercuriale_categories").insert({
      group_id: newCategoryGroupId,
      name: newCategoryName.trim(),
      sort_order: maxOrder + 1,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Catégorie créée avec succès" });
    setNewCategoryName("");
    setNewCategoryGroupId(null);
    loadCategories();
  }

  async function handleUpdateCategory(id: number, name: string) {
    const { error } = await supabase.from("mercuriale_categories").update({ name: name.trim() }).eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Catégorie modifiée avec succès" });
    setEditingCategory(null);
    loadCategories();
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Supprimer cette catégorie et toutes ses sous-catégories ?")) return;

    const { error } = await supabase.from("mercuriale_categories").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Catégorie supprimée avec succès" });
    loadData();
  }

  async function handleMoveCategory(id: number, direction: "up" | "down") {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const siblingCategories = categories.filter((c) => c.group_id === category.group_id);
    const index = siblingCategories.findIndex((c) => c.id === id);

    if ((direction === "up" && index === 0) || (direction === "down" && index === siblingCategories.length - 1)) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = siblingCategories[index];
    const swap = siblingCategories[swapIndex];

    await supabase.from("mercuriale_categories").update({ sort_order: swap.sort_order }).eq("id", current.id);
    await supabase.from("mercuriale_categories").update({ sort_order: current.sort_order }).eq("id", swap.id);

    loadCategories();
  }

  async function handleCreateSubcategory() {
    if (!newSubcategoryName.trim() || !newSubcategoryCategoryId) return;

    const maxOrder =
      subcategories.filter((s) => s.category_id === newSubcategoryCategoryId).length > 0
        ? Math.max(...subcategories.filter((s) => s.category_id === newSubcategoryCategoryId).map((s) => s.sort_order))
        : 0;

    const { error } = await supabase.from("mercuriale_subcategories").insert({
      category_id: newSubcategoryCategoryId,
      name: newSubcategoryName.trim(),
      sort_order: maxOrder + 1,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Sous-catégorie créée avec succès" });
    setNewSubcategoryName("");
    setNewSubcategoryCategoryId(null);
    loadSubcategories();
  }

  async function handleUpdateSubcategory(id: number, name: string) {
    const { error } = await supabase.from("mercuriale_subcategories").update({ name: name.trim() }).eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Sous-catégorie modifiée avec succès" });
    setEditingSubcategory(null);
    loadSubcategories();
  }

  async function handleDeleteSubcategory(id: number) {
    if (!confirm("Supprimer cette sous-catégorie ?")) return;

    const { error } = await supabase.from("mercuriale_subcategories").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
      return;
    }

    toast({ title: "Sous-catégorie supprimée avec succès" });
    loadSubcategories();
  }

  async function handleMoveSubcategory(id: number, direction: "up" | "down") {
    const subcategory = subcategories.find((s) => s.id === id);
    if (!subcategory) return;

    const siblingSubcategories = subcategories.filter((s) => s.category_id === subcategory.category_id);
    const index = siblingSubcategories.findIndex((s) => s.id === id);

    if ((direction === "up" && index === 0) || (direction === "down" && index === siblingSubcategories.length - 1)) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const current = siblingSubcategories[index];
    const swap = siblingSubcategories[swapIndex];

    await supabase.from("mercuriale_subcategories").update({ sort_order: swap.sort_order }).eq("id", current.id);
    await supabase.from("mercuriale_subcategories").update({ sort_order: current.sort_order }).eq("id", swap.id);

    loadSubcategories();
  }

  function getCategoryGroup(categoryId: number) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return null;
    return groups.find((g) => g.id === category.group_id) || null;
  }

  function getSubcategoryCategory(subcategoryId: number) {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    if (!subcategory) return null;
    return categories.find((c) => c.id === subcategory.category_id) || null;
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FolderTree className="h-8 w-8 text-primary" />
            Catalogue des produits
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
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-primary" />
          Catalogue des produits
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Groupes ({groups.length})</TabsTrigger>
          <TabsTrigger value="categories">Catégories ({categories.length})</TabsTrigger>
          <TabsTrigger value="subcategories">Sous-catégories ({subcategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer un groupe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Nom du groupe</Label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Fruits et légumes"
                  />
                </div>
                <Button onClick={handleCreateGroup} className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des groupes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        {editingGroup?.id === group.id ? (
                          <Input
                            defaultValue={group.name}
                            onBlur={(e) => handleUpdateGroup(group.id, e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium">{group.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleMoveGroup(group.id, "up")}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleMoveGroup(group.id, "down")}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingGroup(group)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteGroup(group.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer une catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Groupe parent</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newCategoryGroupId || ""}
                    onChange={(e) => setNewCategoryGroupId(Number(e.target.value) || null)}
                  >
                    <option value="">Sélectionner un groupe</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Nom de la catégorie</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Légumes"
                  />
                </div>
              </div>
              <Button onClick={handleCreateCategory} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Créer la catégorie
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const group = getCategoryGroup(category.id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="text-muted-foreground">{group?.name}</TableCell>
                        <TableCell>
                          {editingCategory?.id === category.id ? (
                            <Input
                              defaultValue={category.name}
                              onBlur={(e) => handleUpdateCategory(category.id, e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium">{category.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleMoveCategory(category.id, "up")}>
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleMoveCategory(category.id, "down")}>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer une sous-catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Catégorie parente</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newSubcategoryCategoryId || ""}
                    onChange={(e) => setNewSubcategoryCategoryId(Number(e.target.value) || null)}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((c) => {
                      const group = getCategoryGroup(c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {group?.name} → {c.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <Label>Nom de la sous-catégorie</Label>
                  <Input
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Ex: Tomates"
                  />
                </div>
              </div>
              <Button onClick={handleCreateSubcategory} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Créer la sous-catégorie
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des sous-catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Groupe → Catégorie</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((subcategory) => {
                    const category = getSubcategoryCategory(subcategory.id);
                    const group = category ? getCategoryGroup(category.id) : null;
                    return (
                      <TableRow key={subcategory.id}>
                        <TableCell className="text-muted-foreground">
                          {group?.name} → {category?.name}
                        </TableCell>
                        <TableCell>
                          {editingSubcategory?.id === subcategory.id ? (
                            <Input
                              defaultValue={subcategory.name}
                              onBlur={(e) => handleUpdateSubcategory(subcategory.id, e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium">{subcategory.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleMoveSubcategory(subcategory.id, "up")}>
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleMoveSubcategory(subcategory.id, "down")}>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingSubcategory(subcategory)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteSubcategory(subcategory.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}