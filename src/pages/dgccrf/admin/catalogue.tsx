import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, FolderTree, Layers, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Group = {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
};

type Category = {
  id: number;
  group_id: number;
  name: string;
  description: string | null;
  sort_order: number;
};

type Subcategory = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  sort_order: number;
};

export default function Catalogue() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("groups");

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupDialog, setGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({ name: "", description: "", sort_order: 0 });

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ group_id: 0, name: "", description: "", sort_order: 0 });

  // Subcategories
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryDialog, setSubcategoryDialog] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ category_id: 0, name: "", description: "", sort_order: 0 });

  useEffect(() => {
    loadGroups();
    loadCategories();
    loadSubcategories();
  }, []);

  async function loadGroups() {
    try {
      const { data, error } = await supabase
        .from("mercuriale_groups")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from("mercuriale_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function loadSubcategories() {
    try {
      const { data, error } = await supabase
        .from("mercuriale_subcategories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setSubcategories(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  // Groups handlers
  async function saveGroup() {
    if (!groupForm.name) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom est requis" });
      return;
    }

    try {
      if (editingGroup) {
        const { error } = await supabase
          .from("mercuriale_groups")
          .update(groupForm)
          .eq("id", editingGroup.id);
        if (error) throw error;
        toast({ title: "Groupe mis à jour" });
      } else {
        const { error } = await supabase.from("mercuriale_groups").insert([groupForm]);
        if (error) throw error;
        toast({ title: "Groupe créé" });
      }
      loadGroups();
      setGroupDialog(false);
      setGroupForm({ name: "", description: "", sort_order: 0 });
      setEditingGroup(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function deleteGroup(id: number) {
    if (!confirm("Supprimer ce groupe et toutes ses catégories?")) return;
    try {
      const { error } = await supabase.from("mercuriale_groups").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Groupe supprimé" });
      loadGroups();
      loadCategories();
      loadSubcategories();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  // Categories handlers
  async function saveCategory() {
    if (!categoryForm.name || !categoryForm.group_id) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom et le groupe sont requis" });
      return;
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("mercuriale_categories")
          .update(categoryForm)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast({ title: "Catégorie mise à jour" });
      } else {
        const { error } = await supabase.from("mercuriale_categories").insert([categoryForm]);
        if (error) throw error;
        toast({ title: "Catégorie créée" });
      }
      loadCategories();
      setCategoryDialog(false);
      setCategoryForm({ group_id: 0, name: "", description: "", sort_order: 0 });
      setEditingCategory(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Supprimer cette catégorie et toutes ses sous-catégories?")) return;
    try {
      const { error } = await supabase.from("mercuriale_categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Catégorie supprimée" });
      loadCategories();
      loadSubcategories();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  // Subcategories handlers
  async function saveSubcategory() {
    if (!subcategoryForm.name || !subcategoryForm.category_id) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom et la catégorie sont requis" });
      return;
    }

    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from("mercuriale_subcategories")
          .update(subcategoryForm)
          .eq("id", editingSubcategory.id);
        if (error) throw error;
        toast({ title: "Sous-catégorie mise à jour" });
      } else {
        const { error } = await supabase.from("mercuriale_subcategories").insert([subcategoryForm]);
        if (error) throw error;
        toast({ title: "Sous-catégorie créée" });
      }
      loadSubcategories();
      setSubcategoryDialog(false);
      setSubcategoryForm({ category_id: 0, name: "", description: "", sort_order: 0 });
      setEditingSubcategory(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function deleteSubcategory(id: number) {
    if (!confirm("Supprimer cette sous-catégorie?")) return;
    try {
      const { error } = await supabase.from("mercuriale_subcategories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Sous-catégorie supprimée" });
      loadSubcategories();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  function getGroupName(groupId: number) {
    return groups.find((g) => g.id === groupId)?.name || "—";
  }

  function getCategoryName(categoryId: number) {
    return categories.find((c) => c.id === categoryId)?.name || "—";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Catalogue mercuriale</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups">
              <FolderTree className="h-4 w-4 mr-2" />
              Groupes ({groups.length})
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Layers className="h-4 w-4 mr-2" />
              Catégories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="subcategories">
              <FileText className="h-4 w-4 mr-2" />
              Sous-catégories ({subcategories.length})
            </TabsTrigger>
          </TabsList>

          {/* GROUPS TAB */}
          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Groupes</CardTitle>
                  <Dialog open={groupDialog} onOpenChange={setGroupDialog}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setGroupForm({ name: "", description: "", sort_order: 0 });
                          setEditingGroup(null);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau groupe
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingGroup ? "Modifier" : "Nouveau"} groupe</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Nom *</Label>
                          <Input
                            value={groupForm.name}
                            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                            placeholder="ex: Mont-Bouët"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={groupForm.description || ""}
                            onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Ordre d'affichage</Label>
                          <Input
                            type="number"
                            value={groupForm.sort_order}
                            onChange={(e) => setGroupForm({ ...groupForm, sort_order: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setGroupDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={saveGroup}>{editingGroup ? "Modifier" : "Créer"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Aucun groupe</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell className="text-muted-foreground">{group.description || "—"}</TableCell>
                          <TableCell>{group.sort_order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingGroup(group);
                                  setGroupForm({
                                    name: group.name,
                                    description: group.description || "",
                                    sort_order: group.sort_order,
                                  });
                                  setGroupDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteGroup(group.id)}>
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

          {/* CATEGORIES TAB */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Catégories</CardTitle>
                  <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setCategoryForm({ group_id: 0, name: "", description: "", sort_order: 0 });
                          setEditingCategory(null);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle catégorie
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingCategory ? "Modifier" : "Nouvelle"} catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Groupe *</Label>
                          <Select
                            value={categoryForm.group_id.toString()}
                            onValueChange={(val) => setCategoryForm({ ...categoryForm, group_id: Number(val) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un groupe" />
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
                          <Label>Nom *</Label>
                          <Input
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            placeholder="ex: Légumes"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={categoryForm.description || ""}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Ordre d'affichage</Label>
                          <Input
                            type="number"
                            value={categoryForm.sort_order}
                            onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={saveCategory}>{editingCategory ? "Modifier" : "Créer"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Aucune catégorie</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Groupe</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getGroupName(category.group_id)}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{category.description || "—"}</TableCell>
                          <TableCell>{category.sort_order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryForm({
                                    group_id: category.group_id,
                                    name: category.name,
                                    description: category.description || "",
                                    sort_order: category.sort_order,
                                  });
                                  setCategoryDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
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

          {/* SUBCATEGORIES TAB */}
          <TabsContent value="subcategories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sous-catégories</CardTitle>
                  <Dialog open={subcategoryDialog} onOpenChange={setSubcategoryDialog}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSubcategoryForm({ category_id: 0, name: "", description: "", sort_order: 0 });
                          setEditingSubcategory(null);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle sous-catégorie
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSubcategory ? "Modifier" : "Nouvelle"} sous-catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Catégorie *</Label>
                          <Select
                            value={subcategoryForm.category_id.toString()}
                            onValueChange={(val) => setSubcategoryForm({ ...subcategoryForm, category_id: Number(val) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name} ({getGroupName(c.group_id)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Nom *</Label>
                          <Input
                            value={subcategoryForm.name}
                            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                            placeholder="ex: Fruits locaux"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={subcategoryForm.description || ""}
                            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Ordre d'affichage</Label>
                          <Input
                            type="number"
                            value={subcategoryForm.sort_order}
                            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, sort_order: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSubcategoryDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={saveSubcategory}>{editingSubcategory ? "Modifier" : "Créer"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {subcategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Aucune sous-catégorie</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subcategories.map((subcategory) => (
                        <TableRow key={subcategory.id}>
                          <TableCell className="font-medium">{subcategory.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getCategoryName(subcategory.category_id)}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{subcategory.description || "—"}</TableCell>
                          <TableCell>{subcategory.sort_order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingSubcategory(subcategory);
                                  setSubcategoryForm({
                                    category_id: subcategory.category_id,
                                    name: subcategory.name,
                                    description: subcategory.description || "",
                                    sort_order: subcategory.sort_order,
                                  });
                                  setSubcategoryDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteSubcategory(subcategory.id)}>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}