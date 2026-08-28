import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export default function AgrementSanitaire() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
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

-Vu la constitution,
-Vu la loi n°007/2010 du 12 juillet 2010 relative à la sécurité sanitaire des aliments,
-Vu le décret n°00158/PR/MAEP du 11 février 2011 portant création de l'Agence Gabonaise de Sécurité Alimentaire,

DECIDE:

Article 1er: Un agrément sanitaire de catégorie {{categorie}}, classe {{classe}} est délivré à l'établissement {{etablissement}} ({{abreviation}}), sis à {{ville}}, {{arrondissement}}, {{quartier}}, pour l'exercice des activités suivantes: {{activites}}.

Article 2: Le présent agrément est valable jusqu'au {{validite}}.

Article 3: Le numéro d'agrément attribué est: {{numero_agrement}}.

Article 4: Cet agrément peut être suspendu ou retiré en cas de non-respect des conditions d'hygiène et de sécurité alimentaire.`);

  const replaceVariables = (text: string) => {
    return text
      .replace(/{{etablissement}}/g, formData.etablissement)
      .replace(/{{abreviation}}/g, formData.abreviation)
      .replace(/{{ville}}/g, formData.ville)
      .replace(/{{arrondissement}}/g, formData.arrondissement)
      .replace(/{{quartier}}/g, formData.quartier)
      .replace(/{{activites}}/g, formData.activites)
      .replace(/{{numero_agrement}}/g, formData.numero_agrement)
      .replace(/{{validite}}/g, formData.validite)
      .replace(/{{categorie}}/g, formData.categorie)
      .replace(/{{classe}}/g, formData.classe)
      .replace(/{{telephone}}/g, formData.telephone)
      .replace(/{{email}}/g, formData.email)
      .replace(/{{objet_social}}/g, formData.objet_social)
      .replace(/{{adresse_bp}}/g, formData.adresse_bp);
  };

  const generatePDF = () => {
    if (!formData.etablissement || !formData.numero_agrement) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Établissement et N° Agrément sont requis",
      });
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header - Titre ministère
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const titreMinistere = "MINISTERE DE L'AGRICULTURE ET DE L'ALIMENTATION";
    const titreWidth = doc.getTextWidth(titreMinistere);
    doc.text(titreMinistere, (pageWidth - titreWidth) / 2, 25);

    // Note: Logos AGASA et Sceau République à ajouter manuellement
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Logo AGASA", 15, 20);
    doc.text("Sceau République", pageWidth - 40, 20);

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(15, 30, pageWidth - 15, 30);

    // Titre AGRÉMENT SANITAIRE avec Catégorie et Classe
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titreAgrement = "AGRÉMENT SANITAIRE";
    const agrementWidth = doc.getTextWidth(titreAgrement);
    doc.text(titreAgrement, (pageWidth - agrementWidth) / 2, 42);

    // Catégorie (gauche)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Catégorie", 15, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(formData.categorie, 15, 48);

    // Classe (droite)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Classe", pageWidth - 30, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(formData.classe, pageWidth - 30, 48);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Niveau sanitaire", pageWidth - 38, 52);

    // Contenu légal
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const contenuFinal = replaceVariables(contenuLegal);
    const lignes = doc.splitTextToSize(contenuFinal, pageWidth - 30);
    doc.text(lignes, 15, 60);

    // Tableau informations établissement
    const tableY = 60 + (lignes.length * 5) + 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS DE L'ÉTABLISSEMENT", 15, tableY);

    doc.setFont("helvetica", "normal");
    let currentY = tableY + 7;
    const ligneHeight = 6;

    doc.text(`Établissement: ${formData.etablissement}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Abréviation: ${formData.abreviation}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Adresse BP: ${formData.adresse_bp}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Téléphone: ${formData.telephone}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Email: ${formData.email}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Objet social: ${formData.objet_social}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Localisation: ${formData.ville}, ${formData.arrondissement}, ${formData.quartier}`, 15, currentY);
    currentY += ligneHeight + 3;
    doc.text(`Activité(s): ${formData.activites}`, 15, currentY);
    currentY += ligneHeight + 3;
    doc.text(`N° Agrément: ${formData.numero_agrement}`, 15, currentY);
    currentY += ligneHeight;
    doc.text(`Validité: ${formData.validite}`, 15, currentY);

    // Footer
    currentY += 20;
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(`Fait à Libreville, le ${new Date().toLocaleDateString("fr-FR")}`, 15, currentY);
    currentY += 10;
    doc.text("Le Directeur Général de l'AGASA", 15, currentY);

    // Télécharger
    doc.save(`Agrement_${formData.numero_agrement || "AGASA"}.pdf`);
    toast({ title: "PDF généré", description: "Le document a été téléchargé" });
  };

  return (
    <AdminLayout role="agasa">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Agrément Sanitaire</h1>
            <p className="text-muted-foreground mt-1">
              Génération des documents d'agrément sanitaire
            </p>
          </div>
          <Button onClick={generatePDF} className="gap-2">
            <Download className="h-4 w-4" />
            Générer PDF
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations de l'opérateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="etablissement">Établissement/Entreprise *</Label>
                  <Input
                    id="etablissement"
                    value={formData.etablissement}
                    onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                    placeholder="Nom complet"
                  />
                </div>

                <div>
                  <Label htmlFor="abreviation">Abréviation</Label>
                  <Input
                    id="abreviation"
                    value={formData.abreviation}
                    onChange={(e) => setFormData({ ...formData, abreviation: e.target.value })}
                    placeholder="Ex: SABC"
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
                    placeholder="contact@exemple.ga"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="objet_social">Objet social</Label>
                  <Input
                    id="objet_social"
                    value={formData.objet_social}
                    onChange={(e) => setFormData({ ...formData, objet_social: e.target.value })}
                    placeholder="Description de l'activité"
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
                    placeholder="Ex: 1er arrondissement"
                  />
                </div>

                <div>
                  <Label htmlFor="quartier">Quartier</Label>
                  <Input
                    id="quartier"
                    value={formData.quartier}
                    onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                    placeholder="Ex: Nombakélé"
                  />
                </div>

                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(val) => setFormData({ ...formData, categorie: val })}
                  >
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
                  <Select
                    value={formData.classe}
                    onValueChange={(val) => setFormData({ ...formData, classe: val })}
                  >
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

                <div className="sm:col-span-2">
                  <Label htmlFor="activites">Activité(s)</Label>
                  <Textarea
                    id="activites"
                    value={formData.activites}
                    onChange={(e) => setFormData({ ...formData, activites: e.target.value })}
                    placeholder="Liste des activités autorisées"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="numero_agrement">N° Agrément *</Label>
                  <Input
                    id="numero_agrement"
                    value={formData.numero_agrement}
                    onChange={(e) => setFormData({ ...formData, numero_agrement: e.target.value })}
                    placeholder="Ex: AGASA/2024/001"
                  />
                </div>

                <div>
                  <Label htmlFor="validite">Validité</Label>
                  <Input
                    id="validite"
                    type="date"
                    value={formData.validite}
                    onChange={(e) => setFormData({ ...formData, validite: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Éditeur de contenu légal */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu légal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {{"{{"}}etablissement{{"}}"}}, {{"{{"}}abreviation{{"}}"}}, {{"{{"}}ville{{"}}"}}, {{"{{"}}arrondissement{{"}}"}}, {{"{{"}}quartier{{"}}"}}, {{"{{"}}activites{{"}}"}}, {{"{{"}}numero_agrement{{"}}"}}, {{"{{"}}validite{{"}}"}}, {{"{{"}}categorie{{"}}"}}, {{"{{"}}classe{{"}}"}}
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
        </div>
      </div>
    </AdminLayout>
  );
}