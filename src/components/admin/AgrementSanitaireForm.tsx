import { useState, useEffect } from "react";
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

export default function AgrementSanitaireForm() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("formulaire");

  const [etablissement, setEtablissement] = useState("");
  const [abreviation, setAbreviation] = useState("");
  const [adresseBP, setAdresseBP] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [objetSocial, setObjetSocial] = useState("");
  const [ville, setVille] = useState("");
  const [arrondissement, setArrondissement] = useState("");
  const [quartier, setQuartier] = useState("");
  const [activites, setActivites] = useState("");
  const [numeroAgrement, setNumeroAgrement] = useState("");
  const [validite, setValidite] = useState("");
  const [categorie, setCategorie] = useState<"A" | "B" | "C">("A");
  const [classe, setClasse] = useState<"A" | "B" | "C">("A");

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

      const { error: uploadError } = await supabase.storage
        .from("agasa-documents")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

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
      .replace(/\{\{etablissement\}\}/g, etablissement)
      .replace(/\{\{abreviation\}\}/g, abreviation)
      .replace(/\{\{adresse_bp\}\}/g, adresseBP)
      .replace(/\{\{telephone\}\}/g, telephone)
      .replace(/\{\{email\}\}/g, email)
      .replace(/\{\{objet_social\}\}/g, objetSocial)
      .replace(/\{\{ville\}\}/g, ville)
      .replace(/\{\{arrondissement\}\}/g, arrondissement)
      .replace(/\{\{quartier\}\}/g, quartier)
      .replace(/\{\{activites\}\}/g, activites)
      .replace(/\{\{numero_agrement\}\}/g, numeroAgrement)
      .replace(/\{\{validite\}\}/g, validite)
      .replace(/\{\{categorie\}\}/g, categorie)
      .replace(/\{\{classe\}\}/g, classe)
      .replace(/\[DATE\]/g, new Date().toLocaleDateString("fr-FR"));
  }

  async function generatePDF() {
    if (!etablissement || !numeroAgrement) {
      toast({ variant: "destructive", title: "Erreur", description: "Établissement et N° agrément requis" });
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      if (logoAgasa) {
        const imgLogo = await fetch(logoAgasa).then((r) => r.blob()).then((b) => URL.createObjectURL(b));
        doc.addImage(imgLogo, "PNG", 15, 10, 40, 20);
      }

      if (sceauRepublique) {
        const imgSceau = await fetch(sceauRepublique).then((r) => r.blob()).then((b) => URL.createObjectURL(b));
        doc.addImage(imgSceau, "PNG", pageWidth - 55, 10, 40, 20);
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("MINISTÈRE DE L'AGRICULTURE ET DE L'ALIMENTATION", pageWidth / 2, 20, { align: "center" });

      doc.setDrawColor(0, 100, 0);
      doc.setLineWidth(0.5);
      doc.line(15, 35, pageWidth - 15, 35);

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("AGRÉMENT SANITAIRE", pageWidth / 2, 45, { align: "center" });

      doc.setFontSize(12);
      doc.text("Catégorie", 30, 50);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(categorie, 35, 58);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Classe", pageWidth - 45, 50);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(classe, pageWidth - 40, 58);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Niveau sanitaire", pageWidth - 52, 63);

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

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      toast({ title: "PDF généré avec succès", description: "Le document s'ouvre dans un nouvel onglet" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur génération PDF", description: error.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Agrément Sanitaire</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                    value={etablissement}
                    onChange={(e) => setEtablissement(e.target.value)}
                    placeholder="Nom complet de l'établissement"
                  />
                </div>

                <div>
                  <Label htmlFor="abreviation">Abréviation</Label>
                  <Input
                    id="abreviation"
                    value={abreviation}
                    onChange={(e) => setAbreviation(e.target.value)}
                    placeholder="ex: SARL, SA"
                  />
                </div>

                <div>
                  <Label htmlFor="adresse_bp">Adresse BP</Label>
                  <Input
                    id="adresse_bp"
                    value={adresseBP}
                    onChange={(e) => setAdresseBP(e.target.value)}
                    placeholder="BP 1234"
                  />
                </div>

                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+241 XX XX XX XX"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@entreprise.ga"
                  />
                </div>

                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Libreville"
                  />
                </div>

                <div>
                  <Label htmlFor="arrondissement">Arrondissement</Label>
                  <Input
                    id="arrondissement"
                    value={arrondissement}
                    onChange={(e) => setArrondissement(e.target.value)}
                    placeholder="1er arrondissement"
                  />
                </div>

                <div>
                  <Label htmlFor="quartier">Quartier</Label>
                  <Input
                    id="quartier"
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    placeholder="Akébé"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="objet_social">Objet social</Label>
                  <Textarea
                    id="objet_social"
                    value={objetSocial}
                    onChange={(e) => setObjetSocial(e.target.value)}
                    placeholder="Description de l'activité principale"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="activites">Activité(s) autorisée(s)</Label>
                  <Textarea
                    id="activites"
                    value={activites}
                    onChange={(e) => setActivites(e.target.value)}
                    placeholder="Liste des activités autorisées"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="numero_agrement">N° d'agrément *</Label>
                  <Input
                    id="numero_agrement"
                    value={numeroAgrement}
                    onChange={(e) => setNumeroAgrement(e.target.value)}
                    placeholder="N°AGASA/2024/XXX"
                  />
                </div>

                <div>
                  <Label htmlFor="validite">Validité</Label>
                  <Input
                    id="validite"
                    value={validite}
                    onChange={(e) => setValidite(e.target.value)}
                    placeholder="31/12/2025"
                  />
                </div>

                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select value={categorie} onValueChange={(val: "A" | "B" | "C") => setCategorie(val)}>
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
                  <Select value={classe} onValueChange={(val: "A" | "B" | "C") => setClasse(val)}>
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
  );
}