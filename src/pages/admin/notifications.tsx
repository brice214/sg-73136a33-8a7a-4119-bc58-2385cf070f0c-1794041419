import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  sent_by: string | null;
};

export default function NotificationsPage() {
  const { session } = useAdminAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
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

  async function handleSend() {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Titre et message sont obligatoires",
      });
      return;
    }

    try {
      setSending(true);
      const { error } = await supabase.from("notifications").insert({
        title: formData.title.trim(),
        body: formData.body.trim(),
        sent_by: session!.user.id,
      });

      if (error) throw error;

      toast({
        title: "Annonce envoyée",
        description: "La notification a été enregistrée avec succès",
      });

      setFormData({ title: "", body: "" });
      loadNotifications();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur envoi",
        description: error.message,
      });
    } finally {
      setSending(false);
    }
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Notifications Push
          </h1>
          <p className="text-muted-foreground mt-1">
            Envoyez des annonces aux utilisateurs de l'application mobile
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire envoi */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Nouvelle annonce
                </CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    FCM à venir
                  </Badge>
                  <p className="text-xs mt-2">
                    Actuellement enregistré en base de données. La notification push mobile sera
                    implémentée prochainement via Firebase Cloud Messaging.
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de l'annonce"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Contenu de l'annonce"
                    rows={6}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.body.length}/500 caractères
                  </p>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={sending || !formData.title.trim() || !formData.body.trim()}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Envoi..." : "Envoyer l'annonce"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Historique */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Historique des annonces
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucune annonce envoyée</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{notif.title}</h3>
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {notif.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}