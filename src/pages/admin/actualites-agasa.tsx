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
import { SEO } from "@/components/ui/seo";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  tag: string;
  tag_color: string;
  source: string;
  published_date: string;
  sort_order: number;
}

const TAG_COLORS = [
  { value: "red", label: "Rouge" },
  { value: "blue", label: "Bleu" },
  { value: "green", label: "Vert" },
  { value: "yellow", label: "Jaune" },
  { value: "purple", label: "Violet" },
  { value: "orange", label: "Orange" },
];

export default function ActualitesAgasa() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    tag: "",
    tag_color: "blue",
  });

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("source", "agasa")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setArticles(data || []);
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
    if (!formData.title || !formData.excerpt || !formData.tag) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre, résumé et tag requis",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const maxSortOrder = articles.reduce((max, a) => Math.max(max, a.sort_order), 0);

      const { error } = await supabase.from("news").insert([{
        title: formData.title,
        excerpt: formData.excerpt,
        tag: formData.tag,
        tag_color: formData.tag_color,
        source: "agasa",
        sort_order: maxSortOrder + 1,
        published_date: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast({ title: "Actualité créée" });
      setIsCreateOpen(false);
      setFormData({ title: "", excerpt: "", tag: "", tag_color: "blue" });
      loadArticles();
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
    if (!selectedArticle) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("news")
        .update({
          title: formData.title,
          excerpt: formData.excerpt,
          tag: formData.tag,
          tag_color: formData.tag_color,
        })
        .eq("id", selectedArticle.id);

      if (error) throw error;

      toast({ title: "Actualité modifiée" });
      setIsEditOpen(false);
      loadArticles();
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

  async function handleDelete(article: NewsArticle) {
    if (!confirm(`Supprimer "${article.title}" ?`)) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", article.id);
      if (error) throw error;

      toast({ title: "Actualité supprimée" });
      loadArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur suppression",
        description: error.message,
      });
    }
  }

  function openEdit(article: NewsArticle) {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      tag: article.tag,
      tag_color: article.tag_color,
    });
    setIsEditOpen(true);
  }

  const filteredArticles = articles.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <SEO title="Actualités AGASA - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              Actualités AGASA
            </h1>
            <p className="text-muted-foreground mt-1">Gérez les actualités AGASA</p>
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
              <div className="text-3xl font-bold text-primary">{articles.length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Publiées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {articles.filter((a) => a.published_date).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {articles.filter((a) => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(a.published_date) > weekAgo;
                }).length}
              </div>
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
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune actualité</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${item.tag_color}20`,
                            borderColor: item.tag_color,
                            color: item.tag_color,
                          }}
                        >
                          {item.tag}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.published_date).toLocaleDateString("fr-FR")}
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
              <DialogTitle>Nouvelle actualité AGASA</DialogTitle>
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
                <Label htmlFor="excerpt">Résumé *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Résumé de l'actualité"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="tag">Tag *</Label>
                <Input
                  id="tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Ex: Sécurité alimentaire, Contrôles..."
                />
              </div>

              <div>
                <Label htmlFor="tag_color">Couleur du tag</Label>
                <Select value={formData.tag_color} onValueChange={(val) => setFormData({ ...formData, tag_color: val })}>
                  <SelectTrigger id="tag_color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="edit_excerpt">Résumé *</Label>
                <Textarea
                  id="edit_excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit_tag">Tag *</Label>
                <Input
                  id="edit_tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit_tag_color">Couleur du tag</Label>
                <Select value={formData.tag_color} onValueChange={(val) => setFormData({ ...formData, tag_color: val })}>
                  <SelectTrigger id="edit_tag_color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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