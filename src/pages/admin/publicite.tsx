import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Banner = {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  position: string;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
};

export default function PublicitePage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    link_url: "",
    position: "home_top",
    start_date: "",
    end_date: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
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

  async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("banners").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleCreate() {
    if (!formData.title.trim() || !imageFile) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre et image requis",
      });
      return;
    }

    try {
      setSubmitting(true);
      const imageUrl = await uploadImage(imageFile);
      const maxSortOrder = banners.reduce((max, b) => Math.max(max, b.sort_order), 0);

      const { error } = await supabase.from("banners").insert({
        title: formData.title,
        image_url: imageUrl,
        link_url: formData.link_url || null,
        position: formData.position,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: true,
        sort_order: maxSortOrder + 1,
      });

      if (error) throw error;

      toast({ title: "Bannière créée avec succès" });
      setCreateDialogOpen(false);
      resetForm();
      loadBanners();
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
    if (!selectedBanner || !formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Titre requis",
      });
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = selectedBanner.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from("banners")
        .update({
          title: formData.title,
          image_url: imageUrl,
          link_url: formData.link_url || null,
          position: formData.position,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .eq("id", selectedBanner.id);

      if (error) throw error;

      toast({ title: "Bannière modifiée avec succès" });
      setEditDialogOpen(false);
      resetForm();
      loadBanners();
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

  async function toggleActive(banner: Banner) {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;

      toast({
        title: banner.is_active ? "Bannière désactivée" : "Bannière activée",
      });
      loadBanners();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  }

  async function handleDelete() {
    if (!selectedBanner) return;

    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", selectedBanner.id);

      if (error) throw error;

      toast({ title: "Bannière supprimée" });
      setDeleteDialogOpen(false);
      setSelectedBanner(null);
      loadBanners();
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

  function openEditDialog(banner: Banner) {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      link_url: banner.link_url || "",
      position: banner.position,
      start_date: banner.start_date || "",
      end_date: banner.end_date || "",
    });
    setEditDialogOpen(true);
  }

  function openDeleteDialog(banner: Banner) {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      title: "",
      link_url: "",
      position: "home_top",
      start_date: "",
      end_date: "",
    });
    setImageFile(null);
    setSelectedBanner(null);
  }

  const positionLabels: Record<string, string> = {
    home_top: "Accueil - Haut",
    home_middle: "Accueil - Milieu",
    home_bottom: "Accueil - Bas",
    scan_result: "Résultat scan",
  };

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
              Publicité
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérer les bannières publicitaires de l'application mobile
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle bannière
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : banners.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Aucune bannière</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4 space-y-3">
                  {banner.image_url && (
                    <div className="relative aspect-[3/1] bg-muted rounded-lg overflow-hidden">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant={banner.is_active ? "default" : "secondary"}
                        className="absolute top-2 right-2"
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{banner.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{positionLabels[banner.position]}</Badge>
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Lien
                        </a>
                      )}
                    </div>
                    {(banner.start_date || banner.end_date) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {banner.start_date && `Du ${new Date(banner.start_date).toLocaleDateString()}`}
                        {banner.end_date && ` au ${new Date(banner.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(banner)}
                      className="flex-1"
                    >
                      {banner.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(banner)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle bannière publicitaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nom de la campagne"
                />
              </div>
              <div>
                <Label htmlFor="image">Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format recommandé: 1200x400px (ratio 3:1)
                </p>
              </div>
              <div>
                <Label htmlFor="link_url">URL de destination (optionnel)</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(positionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Date début (optionnel)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Date fin (optionnel)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
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
              <DialogTitle>Modifier la bannière</DialogTitle>
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
                <Label htmlFor="edit-image">Nouvelle image (optionnel)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour conserver l'image actuelle
                </p>
              </div>
              <div>
                <Label htmlFor="edit-link-url">URL de destination</Label>
                <Input
                  id="edit-link-url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(positionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Date début</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-date">Date fin</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
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
                La bannière "{selectedBanner?.title}" sera définitivement supprimée. Cette action est irréversible.
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