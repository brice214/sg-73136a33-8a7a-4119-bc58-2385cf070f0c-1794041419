import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

type WebTVVideo = {
  id: number;
  title: string;
  description: string;
  tag: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string;
  published_date: string;
  is_published: boolean;
  sort_order: number;
};

export default function WebTVPage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<WebTVVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WebTVVideo | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    video_url: "",
    thumbnail_url: "",
    duration: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("webtv")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setVideos(data || []);
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
    if (!formData.title.trim() || !formData.video_url.trim() || !formData.duration.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre, URL vidéo et durée requis",
      });
      return;
    }

    try {
      setSubmitting(true);
      const maxSortOrder = videos.reduce((max, v) => Math.max(max, v.sort_order), 0);

      const { error } = await supabase.from("webtv").insert({
        title: formData.title,
        description: formData.description || "",
        tag: formData.tag || "Général",
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url || null,
        duration: formData.duration,
        sort_order: maxSortOrder + 1,
        published_date: new Date().toISOString(),
        is_published: true,
      });

      if (error) throw error;

      toast({ title: "Vidéo créée avec succès" });
      setCreateDialogOpen(false);
      resetForm();
      loadVideos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur création",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!selectedVideo || !formData.title.trim() || !formData.video_url.trim() || !formData.duration.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre, URL vidéo et durée requis",
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("webtv")
        .update({
          title: formData.title,
          description: formData.description || "",
          tag: formData.tag || "Général",
          video_url: formData.video_url,
          thumbnail_url: formData.thumbnail_url || null,
          duration: formData.duration,
        })
        .eq("id", selectedVideo.id);

      if (error) throw error;

      toast({ title: "Vidéo modifiée avec succès" });
      setEditDialogOpen(false);
      resetForm();
      loadVideos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur modification",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(video: WebTVVideo) {
    try {
      const { error } = await supabase
        .from("webtv")
        .update({ is_published: !video.is_published })
        .eq("id", video.id);

      if (error) throw error;

      toast({
        title: video.is_published ? "Vidéo dépubliée" : "Vidéo publiée",
      });
      loadVideos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  }

  async function handleDelete() {
    if (!selectedVideo) return;

    try {
      const { error } = await supabase
        .from("webtv")
        .delete()
        .eq("id", selectedVideo.id);

      if (error) throw error;

      toast({ title: "Vidéo supprimée" });
      setDeleteDialogOpen(false);
      setSelectedVideo(null);
      loadVideos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur suppression",
        description: error.message,
      });
    }
  }

  function openCreateDialog() {
    resetForm();
    setCreateDialogOpen(true);
  }

  function openEditDialog(video: WebTVVideo) {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      tag: video.tag,
      video_url: video.video_url || "",
      thumbnail_url: video.thumbnail_url || "",
      duration: video.duration,
    });
    setEditDialogOpen(true);
  }

  function openDeleteDialog(video: WebTVVideo) {
    setSelectedVideo(video);
    setDeleteDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      tag: "",
      video_url: "",
      thumbnail_url: "",
      duration: "",
    });
    setSelectedVideo(null);
  }

  function extractYoutubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

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
      <SEO title="WebTV - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              WebTV
            </h1>
            <p className="text-muted-foreground mt-1">
              Publier des vidéos Youtube pour l'application mobile
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle vidéo
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Aucune vidéo</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => {
              const youtubeId = video.video_url ? extractYoutubeId(video.video_url) : null;
              const thumbnailUrl = video.thumbnail_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

              return (
                <Card key={video.id} className={!video.is_published ? "opacity-60" : ""}>
                  <CardContent className="p-4 space-y-3">
                    {thumbnailUrl && (
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          variant={video.is_published ? "default" : "secondary"}
                          className="absolute top-2 right-2"
                        >
                          {video.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{video.tag}</Badge>
                      <span>•</span>
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublish(video)}
                        className="flex-1"
                      >
                        {video.is_published ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Publier
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(video)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(video)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog Création */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle vidéo WebTV</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la vidéo"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Ex: Santé, Économie, Reportage..."
                />
              </div>
              <div>
                <Label htmlFor="video_url">URL Youtube *</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="thumbnail_url">URL Miniature (optionnel)</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://... (auto-généré si vide)"
                />
              </div>
              <div>
                <Label htmlFor="duration">Durée *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Ex: 5:30, 12:45"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Modification */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la vidéo</DialogTitle>
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-tag">Tag</Label>
                <Input
                  id="edit-tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-video-url">URL Youtube *</Label>
                <Input
                  id="edit-video-url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-thumbnail-url">URL Miniature</Label>
                <Input
                  id="edit-thumbnail-url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Durée *</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={submitting}>
                {submitting ? "Modification..." : "Modifier"}
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
                La vidéo "{selectedVideo?.title}" sera définitivement supprimée. Cette action est irréversible.
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