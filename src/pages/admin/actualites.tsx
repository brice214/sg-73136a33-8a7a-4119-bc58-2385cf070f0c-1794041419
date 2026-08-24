import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

type NewsArticle = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  source: string;
  tag_color: string | null;
  published_at: string | null;
  sort_order: number;
  created_at: string;
};

const TAG_COLORS = [
  { value: "red", label: "Rouge" },
  { value: "blue", label: "Bleu" },
  { value: "green", label: "Vert" },
  { value: "yellow", label: "Jaune" },
  { value: "purple", label: "Violet" },
  { value: "orange", label: "Orange" },
];

export default function ActualitesPage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPublished, setFilterPublished] = useState<string>("all");
  const [filterTagColor, setFilterTagColor] = useState<string>("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tag_color: "",
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("source", "blog")
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Fichier doit être une image",
      });
      return;
    }

    setFormData({ ...formData, imageFile: file });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadImage(): Promise<string | null> {
    if (!formData.imageFile) return null;

    const fileName = `${Date.now()}_${formData.imageFile.name}`;
    const { data, error } = await supabase.storage
      .from("news-images")
      .upload(fileName, formData.imageFile);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("news-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async function handleCreate() {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre et contenu requis",
      });
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadImage();

      const maxSortOrder = articles.reduce((max, a) => Math.max(max, a.sort_order), 0);

      const { error } = await supabase.from("news").insert({
        title: formData.title,
        content: formData.content,
        image_url: imageUrl,
        source: "blog",
        tag_color: formData.tag_color || null,
        sort_order: maxSortOrder + 1,
      });

      if (error) throw error;

      toast({ title: "Article créé avec succès" });
      setCreateDialogOpen(false);
      resetForm();
      loadArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur création",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedArticle || !formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre et contenu requis",
      });
      return;
    }

    try {
      setUploading(true);
      let imageUrl = selectedArticle.image_url;

      if (formData.imageFile) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from("news")
        .update({
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
          tag_color: formData.tag_color || null,
        })
        .eq("id", selectedArticle.id);

      if (error) throw error;

      toast({ title: "Article modifié avec succès" });
      setEditDialogOpen(false);
      resetForm();
      loadArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur modification",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!selectedArticle) return;

    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", selectedArticle.id);

      if (error) throw error;

      toast({ title: "Article supprimé" });
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
      loadArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur suppression",
        description: error.message,
      });
    }
  }

  async function togglePublish(article: NewsArticle) {
    try {
      const newPublishedAt = article.published_at ? null : new Date().toISOString();

      const { error } = await supabase
        .from("news")
        .update({ published_at: newPublishedAt })
        .eq("id", article.id);

      if (error) throw error;

      toast({
        title: newPublishedAt ? "Article publié" : "Article mis en brouillon",
      });
      loadArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  }

  function openCreateDialog() {
    resetForm();
    setCreateDialogOpen(true);
  }

  function openEditDialog(article: NewsArticle) {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      tag_color: article.tag_color || "",
      imageFile: null,
    });
    setImagePreview(article.image_url);
    setEditDialogOpen(true);
  }

  function openDeleteDialog(article: NewsArticle) {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      title: "",
      content: "",
      tag_color: "",
      imageFile: null,
    });
    setImagePreview(null);
    setSelectedArticle(null);
  }

  const filteredArticles = articles.filter((article) => {
    const matchSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPublished =
      filterPublished === "all" ||
      (filterPublished === "published" && article.published_at) ||
      (filterPublished === "draft" && !article.published_at);

    const matchTag =
      filterTagColor === "all" || article.tag_color === filterTagColor;

    return matchSearch && matchPublished && matchTag;
  });

  if (session?.user.role !== "super_admin") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Accès réservé au Super Admin</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Actualités Blog
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérer les actualités du blog (source='blog')
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel article
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Titre ou contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={filterPublished} onValueChange={setFilterPublished}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="published">Publiés</SelectItem>
                    <SelectItem value="draft">Brouillons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tag couleur</Label>
                <Select value={filterTagColor} onValueChange={setFilterTagColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {TAG_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Aucun article trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                {article.image_url && (
                  <div className="relative h-48 w-full bg-muted">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                    {article.tag_color && (
                      <Badge
                        variant="outline"
                        className={`shrink-0 bg-${article.tag_color}-100 text-${article.tag_color}-800 border-${article.tag_color}-300`}
                      >
                        {TAG_COLORS.find((c) => c.value === article.tag_color)?.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {article.published_at ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Publié
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="w-3 h-3" />
                        Brouillon
                      </Badge>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(article.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublish(article)}
                      className="flex-1"
                    >
                      {article.published_at ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(article)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(article)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog Création */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvel article blog</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'article"
                />
              </div>
              <div>
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenu de l'article..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="tag_color">Tag couleur</Label>
                <Select
                  value={formData.tag_color}
                  onValueChange={(value) => setFormData({ ...formData, tag_color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une couleur" />
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
              <div>
                <Label htmlFor="image">Image (optionnel)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2 relative h-48 w-full rounded-lg overflow-hidden">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={uploading}
              >
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={uploading}>
                {uploading ? "Upload..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Modification */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Titre *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Contenu *</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="edit-tag">Tag couleur</Label>
                <Select
                  value={formData.tag_color}
                  onValueChange={(value) => setFormData({ ...formData, tag_color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une couleur" />
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
              <div>
                <Label htmlFor="edit-image">Nouvelle image (optionnel)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2 relative h-48 w-full rounded-lg overflow-hidden">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={uploading}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={uploading}>
                {uploading ? "Upload..." : "Modifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Suppression */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                L'article "{selectedArticle?.title}" sera définitivement supprimé. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}