import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search, Newspaper } from "lucide-react";

interface News {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  image_url: string | null;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export default function ActualitesDgccrf() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Actualité",
    image_url: "",
    is_featured: false,
  });

  const categories = ["Actualité", "Événement", "Annonce", "Communiqué"];

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("source", "dgccrf")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur chargement",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formData.title || !formData.content) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre et contenu requis",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("news").insert([{
        title: formData.title,
        content: formData.content,
        source: "dgccrf",
        category: formData.category,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
        published_at: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast({ title: "Actualité créée" });
      setIsCreateOpen(false);
      setFormData({ title: "", content: "", category: "Actualité", image_url: "", is_featured: false });
      loadNews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur création",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedNews) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("news")
        .update({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          image_url: formData.image_url || null,
          is_featured: formData.is_featured,
        })
        .eq("id", selectedNews.id);

      if (error) throw error;

      toast({ title: "Actualité modifiée" });
      setIsEditOpen(false);
      loadNews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur modification",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(newsItem: News) {
    if (!confirm(`Supprimer "${newsItem.title}" ?`)) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", newsItem.id);
      if (error) throw error;

      toast({ title: "Actualité supprimée" });
      loadNews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur suppression",
        description: error.message,
      });
    }
  }

  function openEdit(newsItem: News) {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      image_url: newsItem.image_url || "",
      is_featured: newsItem.is_featured,
    });
    setIsEditOpen(true);
  }

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              Actualités DGCCRF
            </h1>
            <p className="text-muted-foreground mt-1">Gérez les actualités DGCCRF</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle actualité
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total actualités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{news.length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">À la une</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{news.filter((n) => n.is_featured).length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{news.filter((n) => n.published_at).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune actualité</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        {item.is_featured && <Badge className="bg-accent mr-2">À la une</Badge>}
                        {item.published_at ? (
                          <Badge className="bg-green-600">Publiée</Badge>
                        ) : (
                          <Badge variant="outline">Brouillon</Badge>
                        )}
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle actualité DGCCRF</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'actualité"
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

              <div>
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenu de l'actualité"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL image (optionnel)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Mettre à la une
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier l'actualité</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit_title">Titre *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div>
                <Label htmlFor="edit_content">Contenu *</Label>
                <Textarea
                  id="edit_content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="edit_image_url">URL image</Label>
                <Input
                  id="edit_image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit_is_featured" className="cursor-pointer">
                  Mettre à la une
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button onClick={handleEdit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}