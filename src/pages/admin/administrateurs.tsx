import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Lock, Unlock, Trash2, RefreshCw, Mail } from "lucide-react";
import type { AdminRole } from "@/types/admin";

interface AdminUser {
  id: string;
  role: string;
  full_name: string | null;
  created_at: string;
  is_blocked: boolean;
  email?: string;
}

const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  agasa: "AGASA",
  aganor: "AGANOR",
  dgccrf: "DGCCRF",
};

const roleBadgeColors: Record<AdminRole, string> = {
  super_admin: "bg-violet-500 text-white",
  agasa: "bg-green-600 text-white",
  aganor: "bg-blue-600 text-white",
  dgccrf: "bg-amber-500 text-white",
};

export default function AdministrateursPage() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    role: "agasa" as AdminRole,
    full_name: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "agasa" as AdminRole,
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    try {
      setLoading(true);

      // Récupérer le token d'accès
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ variant: "destructive", title: "Session expirée" });
        return;
      }

      // Appeler l'endpoint API sécurisé
      const response = await fetch("/api/admin/list-admins", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur chargement");
      }

      const { admins: enrichedAdmins } = await response.json();
      setAdmins(enrichedAdmins);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm({ ...createForm, password: pwd });
  }

  async function handleCreate() {
    if (!createForm.email || !createForm.password || !createForm.full_name || !createForm.role) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Tous les champs sont requis",
      });
      return;
    }

    setCreating(true);

    try {
      // Appeler l'endpoint API côté serveur
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          full_name: createForm.full_name,
          role: createForm.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur création");
      }

      toast({
        title: "Succès",
        description: "Administrateur créé avec succès",
      });

      setCreateOpen(false);
      setCreateForm({ email: "", password: "", full_name: "", role: "agasa" });
      loadAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur création",
        description: error.message,
      });
    } finally {
      setCreating(false);
    }
  }

  function openEdit(admin: AdminUser) {
    setEditAdmin(admin);
    setEditForm({
      full_name: admin.full_name || "",
      role: admin.role as AdminRole,
    });
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editAdmin) return;

    try {
      setEditing(true);

      const { error } = await supabase
        .from("admin_users")
        .update({
          full_name: editForm.full_name || null,
          role: editForm.role,
        })
        .eq("id", editAdmin.id);

      if (error) throw error;

      toast({ title: "Administrateur modifié" });
      setEditOpen(false);
      loadAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur modification",
        description: error.message,
      });
    } finally {
      setEditing(false);
    }
  }

  async function toggleBlock(admin: AdminUser) {
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_blocked: !admin.is_blocked })
        .eq("id", admin.id);

      if (error) throw error;

      toast({
        title: admin.is_blocked ? "Compte débloqué" : "Compte bloqué",
      });
      loadAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  }

  async function handleResetPassword(admin: AdminUser) {
    if (!admin.email) {
      toast({ variant: "destructive", title: "Email manquant" });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(admin.email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: `Lien de réinitialisation envoyé à ${admin.email}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  }

  async function handleDelete(admin: AdminUser) {
    if (!confirm(`Supprimer ${admin.full_name || admin.email} ?`)) return;

    try {
      const { error } = await supabase.from("admin_users").delete().eq("id", admin.id);

      if (error) throw error;

      toast({ title: "Administrateur supprimé" });
      loadAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur suppression",
        description: error.message,
      });
    }
  }

  const filteredAdmins = admins.filter((admin) => {
    if (filterRole !== "all" && admin.role !== filterRole) return false;
    if (filterStatus === "blocked" && !admin.is_blocked) return false;
    if (filterStatus === "active" && admin.is_blocked) return false;
    return true;
  });

  return (
    <AdminLayout>
      <SEO title="Administrateurs - MISSU BALA Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Administrateurs
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestion des comptes backoffice
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel administrateur</DialogTitle>
                <DialogDescription>
                  Créer un compte backoffice avec accès rôle
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value: AdminRole) =>
                      setCreateForm({ ...createForm, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agasa">AGASA</SelectItem>
                      <SelectItem value="aganor">AGANOR</SelectItem>
                      <SelectItem value="dgccrf">DGCCRF</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={createForm.full_name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, full_name: e.target.value })
                    }
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe temporaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      placeholder="Générer un mot de passe"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePassword}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Filtrer par rôle et statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="filterRole">Rôle</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger id="filterRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="agasa">AGASA</SelectItem>
                    <SelectItem value="aganor">AGANOR</SelectItem>
                    <SelectItem value="dgccrf">DGCCRF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="filterStatus">Statut</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="blocked">Bloqués</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Aucun administrateur
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {admin.email || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={roleBadgeColors[admin.role as AdminRole]}
                        >
                          {roleLabels[admin.role as AdminRole]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.is_blocked ? (
                          <Badge variant="destructive">Bloqué</Badge>
                        ) : (
                          <Badge className="bg-green-600">Actif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(admin)}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBlock(admin)}
                          >
                            {admin.is_blocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(admin)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(admin)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier administrateur</DialogTitle>
              <DialogDescription>
                Mettre à jour les informations
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Nom complet</Label>
                <Input
                  id="edit_full_name"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit_role">Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: AdminRole) =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger id="edit_role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agasa">AGASA</SelectItem>
                    <SelectItem value="aganor">AGANOR</SelectItem>
                    <SelectItem value="dgccrf">DGCCRF</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={editing}
              >
                Annuler
              </Button>
              <Button onClick={handleEdit} disabled={editing}>
                {editing ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}