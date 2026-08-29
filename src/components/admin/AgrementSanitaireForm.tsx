import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export default function AgrementSanitaireForm() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
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
  const [categorie, setCategorie] = useState<"1" | "2" | "3">("1");
  const [classe, setClasse] = useState<"A" | "B" | "C">("A");
  const [dateInspection, setDateInspection] = useState("");

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
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadLogos();
    loadTemplate();
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Agrément Sanitaire</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

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

  async function loadTemplate() {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("content")
        .eq("id", "agrement_sanitaire")
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.content) {
        setContenuLegal(data.content);
      }
    } catch (error: any) {
      console.error("Erreur chargement modèle:", error);
    }
  }

  async function saveTemplate() {
    if (!contenuLegal.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Le contenu légal ne peut pas être vide" });
      return;
    }

    try {
      setSavingTemplate(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expirée");

      const { error } = await supabase.from("document_templates").upsert({
        id: "agrement_sanitaire",
        type: "agrement_sanitaire",
        content: contenuLegal,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: "Modèle enregistré avec succès", description: "Le modèle de document a été sauvegardé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setSavingTemplate(false);
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
      .replace(/\{\{etablissement\}\}/g, `<strong>${etablissement}</strong>`)
      .replace(/\{\{abreviation\}\}/g, `<strong>${abreviation}</strong>`)
      .replace(/\{\{adresse_bp\}\}/g, `<strong>${adresseBP}</strong>`)
      .replace(/\{\{telephone\}\}/g, `<strong>${telephone}</strong>`)
      .replace(/\{\{email\}\}/g, `<strong>${email}</strong>`)
      .replace(/\{\{objet_social\}\}/g, `<strong>${objetSocial}</strong>`)
      .replace(/\{\{ville\}\}/g, `<strong>${ville}</strong>`)
      .replace(/\{\{arrondissement\}\}/g, `<strong>${arrondissement}</strong>`)
      .replace(/\{\{quartier\}\}/g, `<strong>${quartier}</strong>`)
      .replace(/\{\{activites\}\}/g, `<strong>${activites}</strong>`)
      .replace(/\{\{numero_agrement\}\}/g, `<strong>${numeroAgrement}</strong>`)
      .replace(/\{\{validite\}\}/g, `<strong>${validite}</strong>`)
      .replace(/\{\{categorie\}\}/g, `<strong>${categorie}</strong>`)
      .replace(/\{\{classe\}\}/g, `<strong>${classe}</strong>`)
      .replace(/\{\{date_inspection\}\}/g, `<strong>${dateInspection ? new Date(dateInspection).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : ""}</strong>`)
      .replace(/\[DATE\]/g, `<strong>${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}</strong>`);
  }

  async function generatePDF() {
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      // En-tête avec logos
      if (logoAgasa) {
        const logoImg = await loadImage(logoAgasa);
        pdf.addImage(logoImg, "PNG", margin, y, 30, 30);
      }

      if (sceauRepublique) {
        const sceauImg = await loadImage(sceauRepublique);
        pdf.addImage(sceauImg, "PNG", pageWidth - margin - 30, y, 30, 30);
      }

      y += 35;

      // Contenu légal avec parsing HTML pour gras
      const processedContent = replaceVariables(contenuLegal);
      const lines = processedContent.split("\n");

      pdf.setFontSize(9.5);
      
      for (const line of lines) {
        if (y > pageHeight - 25) break; // Arrêter si on dépasse

        // Parser HTML simple pour gras
        const parts = line.split(/(<strong>.*?<\/strong>)/g);
        let xOffset = margin;

        for (const part of parts) {
          if (part.startsWith("<strong>")) {
            pdf.setFont("helvetica", "bold");
            const text = part.replace(/<\/?strong>/g, "");
            pdf.text(text, xOffset, y);
            xOffset += pdf.getTextWidth(text);
          } else if (part) {
            pdf.setFont("helvetica", "normal");
            const wrappedLines = pdf.splitTextToSize(part, contentWidth - (xOffset - margin));
            pdf.text(wrappedLines[0] || "", xOffset, y);
            
            // Lignes suivantes si wrap
            for (let i = 1; i < wrappedLines.length; i++) {
              y += 5;
              pdf.text(wrappedLines[i], margin, y);
            }
          }
        }
        
        y += 5;
      }

      // Disclaimer en bas (petit, gris, centré)
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont("helvetica", "normal");
      const disclaimer = "Ce document est la propriété de l'Agence Gabonaise de Sécurité Alimentaire. Il ne peut être consulté ou dupliqué sans autorisation.";
      const disclaimerWidth = pdf.getTextWidth(disclaimer);
      pdf.text(disclaimer, (pageWidth - disclaimerWidth) / 2, pageHeight - 10);

      pdf.save(`Agrement_Sanitaire_${numeroAgrement || "Document"}.pdf`);
      toast({ title: "PDF généré avec succès" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
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
                  <div className="flex gap-2">
                    {(["1", "2", "3"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategorie(cat)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          categorie === cat
                            ? "border-primary bg-primary/10 font-bold text-lg"
                            : "border-muted-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="classe">Classe</Label>
                  <div className="flex gap-2">
                    {(["A", "B", "C"] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setClasse(cls)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          classe === cls
                            ? "border-primary bg-primary/10 font-bold text-lg"
                            : "border-muted-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="date_inspection">Date d'inspection sanitaire</Label>
                  <Input
                    id="date_inspection"
                    type="date"
                    value={dateInspection}
                    onChange={(e) => setDateInspection(e.target.value)}
                  />
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
                  {`Variables disponibles (15): {{etablissement}}, {{abreviation}}, {{adresse_bp}}, {{telephone}}, {{email}}, {{objet_social}}, {{ville}}, {{arrondissement}}, {{quartier}}, {{activites}}, {{numero_agrement}}, {{validite}}, {{categorie}}, {{classe}}, {{date_inspection}}`}
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
              <div className="flex gap-3">
                <Button onClick={saveTemplate} variant="outline" size="lg" className="flex-1" disabled={savingTemplate}>
                  <Save className="h-5 w-5 mr-2" />
                  {savingTemplate ? "Enregistrement..." : "Enregistrer le modèle"}
                </Button>
                <Button onClick={generatePDF} size="lg" className="flex-1">
                  <FileText className="h-5 w-5 mr-2" />
                  Générer le PDF
                </Button>
              </div>
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