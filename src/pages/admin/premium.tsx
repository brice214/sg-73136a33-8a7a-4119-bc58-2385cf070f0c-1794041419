import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Crown, Plus, Edit, Trash2, UserPlus, Ban, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type PremiumPlan = {
  id: number;
  code: string;
  name: string;
  price_fcfa: number;
  period_months: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
};

type Subscription = {
  id: string;
  user_id: string;
  plan_code: string;
  status: string;
  source: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
};

type SubscriptionEnriched = Subscription & {
  user_email?: string;
  plan_name?: string;
};

export default function PremiumPage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSub, setSearchSub] = useState("");
  const [planDialog, setPlanDialog] = useState<{ open: boolean; plan?: PremiumPlan }>({
    open: false,
  });
  const [grantDialog, setGrantDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    price_fcfa: "",
    period_months: "",
    features: "",
    is_active: true,
  });
  const [grantForm, setGrantForm] = useState({
    user_email: "",
    plan_code: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([loadPlans(), loadSubscriptions()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPlans() {
    const { data, error } = await supabase
      .from("premium_plans")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    setPlans(data || []);
  }

  async function loadSubscriptions() {
    const { data: subs, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrichir avec emails
    const { data: profiles } = await supabase.from("profiles").select("id, email");
    const { data: plansData } = await supabase.from("premium_plans").select("code, name");

    const enriched = (subs || []).map((sub) => ({
      ...sub,
      user_email: profiles?.find((p) => p.id === sub.user_id)?.email || "Inconnu",
      plan_name: plansData?.find((p) => p.code === sub.plan_code)?.name || sub.plan_code,
    }));

    setSubscriptions(enriched);
  }

  function openPlanDialog(plan?: PremiumPlan) {
    if (plan) {
      setFormData({
        code: plan.code,
        name: plan.name,
        price_fcfa: plan.price_fcfa.toString(),
        period_months: plan.period_months.toString(),
        features: plan.features.join("\n"),
        is_active: plan.is_active,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        price_fcfa: "",
        period_months: "",
        features: "",
        is_active: true,
      });
    }
    setPlanDialog({ open: true, plan });
  }

  async function handleSavePlan() {
    if (!formData.code.trim() || !formData.name.trim() || !formData.price_fcfa) {
      toast({ variant: "destructive", title: "Champs requis manquants" });
      return;
    }

    try {
      const planData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        price_fcfa: parseInt(formData.price_fcfa),
        period_months: parseInt(formData.period_months) || 1,
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        is_active: formData.is_active,
      };

      if (planDialog.plan) {
        const { error } = await supabase
          .from("premium_plans")
          .update(planData)
          .eq("id", planDialog.plan.id);
        if (error) throw error;
        toast({ title: "Offre modifiée" });
      } else {
        const { error } = await supabase.from("premium_plans").insert(planData);
        if (error) throw error;
        toast({ title: "Offre créée" });
      }

      setPlanDialog({ open: false });
      loadPlans();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleDeletePlan(id: number) {
    try {
      const { error } = await supabase.from("premium_plans").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Offre supprimée" });
      setDeleteDialog(null);
      loadPlans();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleGrantSubscription() {
    if (!grantForm.user_email.trim() || !grantForm.plan_code) {
      toast({ variant: "destructive", title: "Email et plan requis" });
      return;
    }

    try {
      // Trouver user_id depuis email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", grantForm.user_email.trim())
        .single();

      if (!profile) {
        toast({ variant: "destructive", title: "Utilisateur introuvable" });
        return;
      }

      // Trouver period_months du plan
      const plan = plans.find((p) => p.code === grantForm.plan_code);
      if (!plan) {
        toast({ variant: "destructive", title: "Plan introuvable" });
        return;
      }

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + plan.period_months);

      const { error } = await supabase.from("subscriptions").insert({
        user_id: profile.id,
        plan_code: grantForm.plan_code,
        source: "backoffice",
        status: "active",
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      toast({ title: "Abonnement octroyé" });
      setGrantDialog(false);
      setGrantForm({ user_email: "", plan_code: "" });
      loadSubscriptions();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleCancelSubscription(id: string) {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Abonnement annulé" });
      loadSubscriptions();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.user_email?.toLowerCase().includes(searchSub.toLowerCase()) ||
      s.plan_name?.toLowerCase().includes(searchSub.toLowerCase())
  );

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
      <SEO title="Premium - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Crown className="w-8 h-8 text-accent" />
            Gestion Premium
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les offres Premium et les abonnements des utilisateurs
          </p>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans">Offres Premium</TabsTrigger>
            <TabsTrigger value="subscribers">Abonnés ({subscriptions.length})</TabsTrigger>
          </TabsList>

          {/* Section Offres */}
          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Offres Premium</CardTitle>
                  <Button onClick={() => openPlanDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une offre
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucune offre Premium</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                      <Card key={plan.id} className="relative">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <Badge variant="secondary" className="mt-1">
                                {plan.code}
                              </Badge>
                            </div>
                            {plan.is_active ? (
                              <Badge>Actif</Badge>
                            ) : (
                              <Badge variant="outline">Inactif</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {plan.price_fcfa.toLocaleString()} FCFA
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {plan.period_months} mois
                            </p>
                          </div>
                          <div className="space-y-1">
                            {plan.features.map((f, i) => (
                              <p key={i} className="text-sm text-muted-foreground">
                                ✓ {f}
                              </p>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPlanDialog(plan)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialog(plan.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section Abonnés */}
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Abonnés Premium</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchSub}
                        onChange={(e) => setSearchSub(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button onClick={() => setGrantDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Octroyer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : filteredSubs.length === 0 ? (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucun abonné trouvé</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Offre</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubs.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.user_email}</TableCell>
                          <TableCell>{sub.plan_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{sub.source}</Badge>
                          </TableCell>
                          <TableCell>
                            {sub.status === "active" ? (
                              <Badge>Actif</Badge>
                            ) : (
                              <Badge variant="destructive">Annulé</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(sub.started_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            {sub.expires_at
                              ? new Date(sub.expires_at).toLocaleDateString("fr-FR")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {sub.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelSubscription(sub.id)}
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                Annuler
                              </Button>
                            )}
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

        {/* Dialog Offre */}
        <Dialog open={planDialog.open} onOpenChange={(open) => setPlanDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {planDialog.plan ? "Modifier l'offre" : "Créer une offre"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="premium-annual"
                  disabled={!!planDialog.plan}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium Annuel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix FCFA *</label>
                  <Input
                    type="number"
                    value={formData.price_fcfa}
                    onChange={(e) => setFormData({ ...formData, price_fcfa: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Durée (mois) *</label>
                  <Input
                    type="number"
                    value={formData.period_months}
                    onChange={(e) =>
                      setFormData({ ...formData, period_months: e.target.value })
                    }
                    placeholder="12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fonctionnalités (une par ligne)</label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Scans illimités&#10;Historique complet&#10;Support prioritaire"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <label className="text-sm font-medium">Offre active</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanDialog({ open: false })}>
                Annuler
              </Button>
              <Button onClick={handleSavePlan}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Octroi */}
        <Dialog open={grantDialog} onOpenChange={setGrantDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Octroyer un abonnement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email utilisateur *</label>
                <Input
                  type="email"
                  value={grantForm.user_email}
                  onChange={(e) => setGrantForm({ ...grantForm, user_email: e.target.value })}
                  placeholder="utilisateur@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Offre *</label>
                <select
                  value={grantForm.plan_code}
                  onChange={(e) => setGrantForm({ ...grantForm, plan_code: e.target.value })}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="">Sélectionner une offre</option>
                  {plans
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.period_months} mois - {p.price_fcfa} FCFA)
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleGrantSubscription}>Octroyer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Suppression */}
        <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette offre ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Les abonnements existants ne seront pas affectés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialog && handleDeletePlan(deleteDialog)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}