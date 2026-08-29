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
import { Plus, Edit, Trash2, Search, Newspaper, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/ui/seo";

type News = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  tag_color: string;
  source: string;
  sort_order: number;
  published_date: string;
};

export default function ActualitesDGCCRF() {
  const { toast } = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tag: "",
    tag_color: "#1B6B3C",
    published_date: new Date().toISOString().split("T")[0],
    sort_order: 0,
  });

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    const filtered = news.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        n.tag.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredNews(filtered);
  }, [search, news]);

  async function loadNews() {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("source", "dgccrf")
        .order("published_date", { ascending: false });

      if (error) throw error;
      setNews(data || []);
      setFilteredNews(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(newsItem: News) {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      content: newsItem.content,
      tag: newsItem.tag,
      tag_color: newsItem.tag_color,
      published_date: newsItem.published_date,
      sort_order: newsItem.sort_order,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      tag: "",
      tag_color: "#1B6B3C",
      published_date: new Date().toISOString().split("T")[0],
      sort_order: 0,
    });
    setEditingNews(null);
    setIsDialogOpen(false);
  }

  async function handleSave() {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast({ variant: "destructive", title: "Erreur", description: "Tous les champs sont requis" });
      return;
    }

    try {
      const payload = { ...formData, source: "dgccrf" };

      if (editingNews) {
        const { error } = await supabase.from("news").update(payload).eq("id", editingNews.id);

        if (error) throw error;
        toast({ title: "Actualité mise à jour avec succès" });
      } else {
        const { error } = await supabase.from("news").insert([payload]);

        if (error) throw error;
        toast({ title: "Actualité créée avec succès" });
      }

      loadNews();
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Confirmer la suppression de cette actualité ?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Actualité supprimée avec succès" });
      loadNews();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  const totalNews = news.length;
  const published = news.filter((n) => new Date(n.published_date) <= new Date()).length;

  return (
    <AdminLayout>
      <SEO title="Actualités DGCCRF - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Mes actualités DGCCRF</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle actualité
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Modifier l'actualité" : "Nouvelle actualité"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Label htmlFor="excerpt">Résumé *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Résumé court (150 caractères max)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu complet *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Contenu détaillé de l'actualité"
                    rows={8}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tag">Tag</Label>
                    <Input
                      id="tag"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="ex: Alerte, Info, Communiqué"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag_color">Couleur du tag</Label>
                    <Input
                      id="tag_color"
                      type="color"
                      value={formData.tag_color}
                      onChange={(e) => setFormData({ ...formData, tag_color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="published_date">Date de publication</Label>
                    <Input
                      id="published_date"
                      type="date"
                      value={formData.published_date}
                      onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                    />
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
                <Button onClick={handleSave}>{editingNews ? "Mettre à jour" : "Créer"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total actualités</CardTitle>
              <Newspaper className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalNews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Publiées</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{published}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des actualités</CardTitle>
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
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune actualité disponible</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Date publication</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((newsItem) => (
                    <TableRow key={newsItem.id}>
                      <TableCell className="font-medium">{newsItem.title}</TableCell>
                      <TableCell>
                        {newsItem.tag && (
                          <Badge style={{ backgroundColor: newsItem.tag_color }} className="text-white">
                            {newsItem.tag}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(newsItem.published_date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{newsItem.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(newsItem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(newsItem.id)}>
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