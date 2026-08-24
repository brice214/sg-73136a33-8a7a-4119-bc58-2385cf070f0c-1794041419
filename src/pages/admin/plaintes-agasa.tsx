import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";

interface Complaint {
  id: string;
  user_id: string;
  agency: string;
  type: string;
  product: string;
  merchant: string | null;
  official_price: number | null;
  practiced_price: number | null;
  details: string | null;
  location_label: string | null;
  status: string;
  photo_urls: string[];
  created_at: string;
  profiles?: { full_name: string | null };
}

const statusLabels = {
  soumise: "En attente",
  en_cours: "En cours",
  resolue: "Résolue",
  rejetee: "Rejetée",
};

const statusColors = {
  soumise: "bg-amber-500",
  en_cours: "bg-blue-500",
  resolue: "bg-green-600",
  rejetee: "bg-destructive",
};

export default function PlaintesAgasaPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState<string>("en_cours");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("complaints")
        .select("*, profiles(full_name)")
        .eq("agency", "AGASA")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur chargement", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function openResponse(complaint: Complaint) {
    setSelectedComplaint(complaint);
    setResponseText("");
    setNewStatus(complaint.status === "soumise" ? "en_cours" : complaint.status);
    setResponseDialog(true);
  }

  async function handleResponse() {
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("complaints")
        .update({
          status: newStatus,
        })
        .eq("id", selectedComplaint.id);

      if (error) throw error;

      toast({ title: "Réponse enregistrée" });
      setResponseDialog(false);
      loadComplaints();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  const filteredComplaints = complaints.filter((c) =>
    filterStatus === "all" ? true : c.status === filterStatus
  );

  return (
    <AdminLayout>
      <SEO title="Plaintes AGASA - MISSU BALA Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Plaintes AGASA</h1>
          <p className="text-muted-foreground mt-1">Gérer les signalements citoyens</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {complaints.filter((c) => c.status === "soumise").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                En cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {complaints.filter((c) => c.status === "en_cours").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Résolues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter((c) => c.status === "resolue").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Rejetées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {complaints.filter((c) => c.status === "rejetee").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtrer par statut</CardTitle>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="soumise">En attente</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="resolue">Résolues</SelectItem>
                  <SelectItem value="rejetee">Rejetées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Citoyen</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Commerce</TableHead>
                  <TableHead>Statut</TableHead>
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
                ) : filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Aucune plainte
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(complaint.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {complaint.profiles?.full_name || "Anonyme"}
                      </TableCell>
                      <TableCell>{complaint.product}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {complaint.merchant || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                          {statusLabels[complaint.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openResponse(complaint)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Traiter
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Traiter la plainte</DialogTitle>
            </DialogHeader>

            {selectedComplaint && (
              <div className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produit:</span>
                    <span className="font-medium">{selectedComplaint.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commerce:</span>
                    <span className="font-medium">{selectedComplaint.merchant || "—"}</span>
                  </div>
                  {selectedComplaint.details && (
                    <div className="border-t pt-2 mt-2">
                      <span className="text-muted-foreground block mb-1">Détails:</span>
                      <p className="text-sm">{selectedComplaint.details}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Nouveau statut</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="resolue">Résolue</SelectItem>
                      <SelectItem value="rejetee">Rejetée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setResponseDialog(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button onClick={handleResponse} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}