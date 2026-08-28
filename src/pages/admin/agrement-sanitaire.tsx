import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  etablissement: string;
  abreviation: string;
  adresse_bp: string;
  telephone: string;
  email: string;
  objet_social: string;
  ville: string;
  arrondissement: string;
  quartier: string;
  activites: string;
  numero_agrement: string;
  validite: string;
  categorie: "A" | "B" | "C";
  classe: "A" | "B" | "C";
}

export default function AgrementSanitaire() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("formulaire");
  const [formData, setFormData] = useState<FormData>({
    etablissement: "",
    abreviation: "",
    adresse_bp: "",
    telephone: "",
    email: "",
    objet_social: "",
    ville: "",
    arrondissement: "",
    quartier: "",
    activites: "",
    numero_agrement: "",
    validite: "",
    categorie: "A",
    classe: "A",
  });

  const [contenuLegal, setContenuLegal] = useState(`Le Directeur Général de l'Agence Gabonaise de Sécurité Alimentaire,

- Vu la Constitution ;
- Vu la Loi n°021/2019 du 16 décembre 2019 relative à la sécurité sanitaire des aliments ;
- Vu le Décret n°00162/PR/MAEP du 28 février 2020 portant organisation et fonctionnement de l'AGASA ;

Accorde le présent AGRÉMENT SANITAIRE à :

Établissement : {{etablissement}} ({{abreviation}})
Adresse : {{adresse_bp}}
Ville : {{ville}}, Arrondissement : {{arrondissement}}, Quartier : {{quartier}}
Téléphone : {{telephone}}
Email : {{email}}
Objet social : {{objet_social}}

Activité(s) autorisée(s) : {{activites}}

N° d'agrément : {{numero_agrement}}
Validité : {{validite}}

Fait à Libreville, le [DATE]

Le Directeur Général de l'AGASA`);

  const [logoAgasa, setLogoAgasa] = useState<string | null>(null);
  const [sceauRepublique, setSceauRepublique] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSceau, setUploadingSceau] = useState(false);

  useEffect(() => {
    loadLogos();
  }, []);

  async function loadLogos() {
    try {
      // Récupérer les URLs publiques des logos depuis Supabase Storage
      const { data: logoList } = await supabase.storage.from("agasa-documents").list("logos");
      
      if (logoList) {
        const agasaFile = logoList.find((f) => f.name === "logo-agasa.png");
        const sceauFile = logoList.find((f) => f.name === "sceau-republique.png");

        if (agasaFile) {
          const { data } = supabase.storage.from("agasa-documents").getPublicUrl("logos/logo-agasa.png");
          setLogoAgasa(data.publicUrl);
        }

        if (sceauFile) {
          const { data } = supabase.storage.from("agasa-documents").getPublicUrl("logos/sceau-republique.png");
          setSceauRepublique(data.publicUrl);
        }
      }
    } catch (error: any) {
      console.error("Erreur chargement logos:", error);
    }
  }

  async function handleUploadLogo(file: File, type: "agasa" | "sceau") {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Erreur", description: "Seules les images sont acceptées" });
      return;
    }

    try {
      if (type === "agasa") setUploadingLogo(true);
      else setUploadingSceau(true);

      const fileName = type === "agasa" ? "logo-agasa.png" : "sceau-republique.png";
      const filePath = `logos/${fileName}`;

      // Upload vers Supabase Storage (bucket agasa-documents)
      const { error: uploadError } = await supabase.storage
        .from("agasa-documents")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data } = supabase.storage.from("agasa-documents").getPublicUrl(filePath);

      if (type === "agasa") {
        setLogoAgasa(data.publicUrl);
        toast({ title: "Logo AGASA uploadé avec succès" });
      } else {
        setSceauRepublique(data.publicUrl);
        toast({ title: "Sceau République uploadé avec succès" });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur upload", description: error.message });
    } finally {
      if (type === "agasa") setUploadingLogo(false);
      else setUploadingSceau(false);
    }
  }

  function replaceVariables(text: string): string {
    return text
      .replace(/\{\{etablissement\}\}/g, formData.etablissement)
      .replace(/\{\{abreviation\}\}/g, formData.abreviation)
      .replace(/\{\{adresse_bp\}\}/g, formData.adresse_bp)
      .replace(/\{\{telephone\}\}/g, formData.telephone)
      .replace(/\{\{email\}\}/g, formData.email)
      .replace(/\{\{objet_social\}\}/g, formData.objet_social)
      .replace(/\{\{ville\}\}/g, formData.ville)
      .replace(/\{\{arrondissement\}\}/g, formData.arrondissement)
      .replace(/\{\{quartier\}\}/g, formData.quartier)
      .replace(/\{\{activites\}\}/g, formData.activites)
      .replace(/\{\{numero_agrement\}\}/g, formData.numero_agrement)
      .replace(/\{\{validite\}\}/g, formData.validite)
      .replace(/\{\{categorie\}\}/g, formData.categorie)
      .replace(/\{\{classe\}\}/g, formData.classe)
      .replace(/\[DATE\]/g, new Date().toLocaleDateString("fr-FR"));
  }

  async function generatePDF() {
    if (!formData.etablissement || !formData.numero_agrement) {
      toast({ variant: "destructive", title: "Erreur", description: "Établissement et N° agrément requis" });
      return;
    }

    try {
      // PDF en paysage (landscape)
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header - Logos et titre ministère
      if (logoAgasa) {
        const imgLogo = await fetch(logoAgasa).then((r) => r.blob()).then((b) => URL.createObjectURL(b));
        doc.addImage(imgLogo, "PNG", 15, 10, 40, 20);
      }

      if (sceauRepublique) {
        const imgSceau = await fetch(sceauRepublique).then((r) => r.blob()).then((b) => URL.createObjectURL(b));
        doc.addImage(imgSceau, "PNG", pageWidth - 55, 10, 40, 20);
      }

      // Titre ministère (centré)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("MINISTÈRE DE L'AGRICULTURE ET DE L'ALIMENTATION", pageWidth / 2, 20, { align: "center" });

      // Ligne de séparation
      doc.setDrawColor(0, 100, 0);
      doc.setLineWidth(0.5);
      doc.line(15, 35, pageWidth - 15, 35);

      // Titre "AGRÉMENT SANITAIRE" avec Catégorie et Classe
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("AGRÉMENT SANITAIRE", pageWidth / 2, 45, { align: "center" });

      // Catégorie (gauche)
      doc.setFontSize(12);
      doc.text("Catégorie", 30, 50);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(formData.categorie, 35, 58);

      // Classe (droite)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Classe", pageWidth - 45, 50);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(formData.classe, pageWidth - 40, 58);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Niveau sanitaire", pageWidth - 52, 63);

      // Contenu légal avec variables remplacées
      const contenu = replaceVariables(contenuLegal);
      const lines = doc.splitTextToSize(contenu, pageWidth - 40);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      let yPosition = 75;

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      // Ouvrir le PDF dans le navigateur au lieu de le télécharger
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      toast({ title: "PDF généré avec succès", description: "Le document s'ouvre dans un nouvel onglet" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur génération PDF", description: error.message });
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Agrément Sanitaire</h1>
            <p className="text-muted-foreground">Générer des agréments sanitaires officiels</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="formulaire">
              <FileText className="h-4 w-4 mr-2" />
              Formulaire
            </TabsTrigger>
            <TabsTrigger value="parametres">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formulaire" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'opérateur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="etablissement">Établissement/Entreprise *</Label>
                    <Input
                      id="etablissement"
                      value={formData.etablissement}
                      onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                      placeholder="Nom complet de l'établissement"
                    />
                  </div>

                  <div>
                    <Label htmlFor="abreviation">Abréviation</Label>
                    <Input
                      id="abreviation"
                      value={formData.abreviation}
                      onChange={(e) => setFormData({ ...formData, abreviation: e.target.value })}
                      placeholder="ex: SARL, SA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse_bp">Adresse BP</Label>
                    <Input
                      id="adresse_bp"
                      value={formData.adresse_bp}
                      onChange={(e) => setFormData({ ...formData, adresse_bp: e.target.value })}
                      placeholder="BP 1234"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@entreprise.ga"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      placeholder="Libreville"
                    />
                  </div>

                  <div>
                    <Label htmlFor="arrondissement">Arrondissement</Label>
                    <Input
                      id="arrondissement"
                      value={formData.arrondissement}
                      onChange={(e) => setFormData({ ...formData, arrondissement: e.target.value })}
                      placeholder="1er arrondissement"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quartier">Quartier</Label>
                    <Input
                      id="quartier"
                      value={formData.quartier}
                      onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                      placeholder="Akébé"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="objet_social">Objet social</Label>
                    <Textarea
                      id="objet_social"
                      value={formData.objet_social}
                      onChange={(e) => setFormData({ ...formData, objet_social: e.target.value })}
                      placeholder="Description de l'activité principale"
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="activites">Activité(s) autorisée(s)</Label>
                    <Textarea
                      id="activites"
                      value={formData.activites}
                      onChange={(e) => setFormData({ ...formData, activites: e.target.value })}
                      placeholder="Liste des activités autorisées"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero_agrement">N° d'agrément *</Label>
                    <Input
                      id="numero_agrement"
                      value={formData.numero_agrement}
                      onChange={(e) => setFormData({ ...formData, numero_agrement: e.target.value })}
                      placeholder="N°AGASA/2024/XXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="validite">Validité</Label>
                    <Input
                      id="validite"
                      value={formData.validite}
                      onChange={(e) => setFormData({ ...formData, validite: e.target.value })}
                      placeholder="31/12/2025"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select value={formData.categorie} onValueChange={(val: any) => setFormData({ ...formData, categorie: val })}>
                      <SelectTrigger id="categorie">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="classe">Classe</Label>
                    <Select value={formData.classe} onValueChange={(val: any) => setFormData({ ...formData, classe: val })}>
                      <SelectTrigger id="classe">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contenu légal du document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {`Variables disponibles: {{etablissement}}, {{abreviation}}, {{ville}}, {{arrondissement}}, {{quartier}}, {{activites}}, {{numero_agrement}}, {{validite}}, {{categorie}}, {{classe}}`}
                  </p>
                  <Textarea
                    value={contenuLegal}
                    onChange={(e) => setContenuLegal(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button onClick={generatePDF} size="lg" className="w-full">
                  <FileText className="h-5 w-5 mr-2" />
                  Générer le PDF (paysage)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parametres" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des logos officiels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Logo AGASA */}
                  <div className="space-y-4">
                    <div>
                      <Label>Logo AGASA</Label>
                      <p className="text-sm text-muted-foreground mb-3">Format PNG recommandé (transparent)</p>
                    </div>

                    {logoAgasa && (
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <img src={logoAgasa} alt="Logo AGASA" className="max-h-32 mx-auto" />
                      </div>
                    )}

                    <div>
                      <Input
                        id="logo-agasa-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadLogo(file, "agasa");
                        }}
                        disabled={uploadingLogo}
                        className="cursor-pointer"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      onClick={() => document.getElementById("logo-agasa-upload")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingLogo ? "Upload en cours..." : "Changer le logo AGASA"}
                    </Button>
                  </div>

                  {/* Sceau République */}
                  <div className="space-y-4">
                    <div>
                      <Label>Sceau de la République</Label>
                      <p className="text-sm text-muted-foreground mb-3">Format PNG recommandé (transparent)</p>
                    </div>

                    {sceauRepublique && (
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <img src={sceauRepublique} alt="Sceau République" className="max-h-32 mx-auto" />
                      </div>
                    )}

                    <div>
                      <Input
                        id="sceau-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadLogo(file, "sceau");
                        }}
                        disabled={uploadingSceau}
                        className="cursor-pointer"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingSceau}
                      onClick={() => document.getElementById("sceau-upload")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingSceau ? "Upload en cours..." : "Changer le sceau"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}