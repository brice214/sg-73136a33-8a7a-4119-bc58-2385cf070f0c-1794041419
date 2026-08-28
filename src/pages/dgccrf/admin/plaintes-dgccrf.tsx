import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Search, Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Complaint = {
  id: string;
  user_id: string;
  created_at: string;
  agency: string;
  type: string;
  product: string;
  merchant: string | null;
  official_price: number | null;
  practiced_price: number | null;
  details: string | null;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  photo_urls: string[];
  profiles?: { full_name: string } | null;
};

export default function PlaintesDGCCRF() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    const filtered = complaints.filter(
      (c) =>
        c.product.toLowerCase().includes(search.toLowerCase()) ||
        (c.merchant && c.merchant.toLowerCase().includes(search.toLowerCase())) ||
        c.type.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredComplaints(filtered);
  }, [search, complaints]);

  async function loadComplaints() {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*, profiles(full_name)")
        .eq("agency", "DGCCRF")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
      setFilteredComplaints(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur chargement", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleView(complaint: Complaint) {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setIsDialogOpen(true);
  }

  async function handleUpdateStatus() {
    if (!selectedComplaint) return;

    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", selectedComplaint.id);

      if (error) throw error;
      toast({ title: "Plainte mise à jour avec succès" });
      setIsDialogOpen(false);
      loadComplaints();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  const totalComplaints = complaints.length;
  const pending = complaints.filter((c) => c.status === "soumise").length;
  const resolved = complaints.filter((c) => c.status === "traitee").length;
  const inProgress = complaints.filter((c) => c.status === "en_cours").length;

  function getStatusBadge(status: string) {
    switch (status) {
      case "soumise":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Soumise</Badge>;
      case "en_cours":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">En cours</Badge>;
      case "traitee":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Traitée</Badge>;
      case "rejetee":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function getTypeBadge(type: string) {
    const labels: Record<string, string> = {
      prix: "Prix",
      qualite: "Qualité",
      hygiene: "Hygiène",
      autre: "Autre",
    };
    return <Badge variant="secondary">{labels[type] || type}</Badge>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Plaintes DGCCRF</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalComplaints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Soumises</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En cours</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Traitées</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{resolved}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des plaintes</CardTitle>
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
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune plainte disponible</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Citoyen</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Commerçant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.product}</TableCell>
                      <TableCell>{complaint.profiles?.full_name || "Non renseigné"}</TableCell>
                      <TableCell>{getTypeBadge(complaint.type)}</TableCell>
                      <TableCell>{complaint.merchant || "-"}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>{new Date(complaint.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleView(complaint)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la plainte</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Produit</Label>
                    <div className="mt-1 font-medium">{selectedComplaint.product}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedComplaint.type)}</div>
                  </div>
                </div>

                {selectedComplaint.merchant && (
                  <div>
                    <Label>Commerçant</Label>
                    <div className="mt-1">{selectedComplaint.merchant}</div>
                  </div>
                )}

                {selectedComplaint.official_price && selectedComplaint.practiced_price && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prix officiel</Label>
                      <div className="mt-1">{selectedComplaint.official_price} FCFA</div>
                    </div>
                    <div>
                      <Label>Prix pratiqué</Label>
                      <div className="mt-1 font-semibold text-destructive">{selectedComplaint.practiced_price} FCFA</div>
                    </div>
                  </div>
                )}

                {selectedComplaint.details && (
                  <div>
                    <Label>Détails</Label>
                    <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedComplaint.details}
                    </div>
                  </div>
                )}

                {selectedComplaint.location_label && (
                  <div>
                    <Label>Localisation</Label>
                    <div className="mt-1">{selectedComplaint.location_label}</div>
                  </div>
                )}

                {selectedComplaint.photo_urls.length > 0 && (
                  <div>
                    <Label>Photos</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {selectedComplaint.photo_urls.map((url, i) => (
                        <img key={i} src={url} alt={`Photo ${i + 1}`} className="rounded border" />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="status">Nouveau statut</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soumise">Soumise</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="traitee">Traitée</SelectItem>
                      <SelectItem value="rejetee">Rejetée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateStatus}>Mettre à jour</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}