import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, Upload, FileSpreadsheet, Edit, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/ui/seo";

type Product = {
  barcode: string;
  name: string;
  brand: string | null;
  category: string | null;
  origin: string | null;
  image_url: string | null;
  ingredients: string[];
  allergens: string[];
  nutri_score: string | null;
  authentic: boolean;
  authenticity_note: string | null;
  aganor_certified: boolean;
  warnings: string[];
  institution: string;
};

export default function Produits() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  const [formData, setFormData] = useState<Product>({
    barcode: "",
    name: "",
    brand: "",
    category: "",
    origin: "",
    image_url: "",
    ingredients: [],
    allergens: [],
    nutri_score: "",
    authentic: true,
    authenticity_note: "",
    aganor_certified: false,
    warnings: [],
    institution: "aganor",
  });

  const [ingredientsText, setIngredientsText] = useState("");
  const [allergensText, setAllergensText] = useState("");
  const [warningsText, setWarningsText] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.barcode.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("institution", "aganor")
        .order("name", { ascending: true });

      if (error) throw error;
      setProducts((data || []) as Product[]);
      setFilteredProducts((data || []) as Product[]);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData(product);
    setIngredientsText(product.ingredients.join(", "));
    setAllergensText(product.allergens.join(", "));
    setWarningsText(product.warnings.join(", "));
    setIsDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      barcode: "",
      name: "",
      brand: "",
      category: "",
      origin: "",
      image_url: "",
      ingredients: [],
      allergens: [],
      nutri_score: "",
      authentic: true,
      authenticity_note: "",
      aganor_certified: false,
      warnings: [],
      institution: "aganor",
    });
    setIngredientsText("");
    setAllergensText("");
    setWarningsText("");
    setEditingProduct(null);
    setIsDialogOpen(false);
  }

  async function handleSave() {
    if (!formData.barcode || !formData.name) {
      toast({ variant: "destructive", title: "Erreur", description: "Code-barres et nom sont requis" });
      return;
    }

    try {
      const payload = {
        ...formData,
        institution: "aganor",
        ingredients: ingredientsText.split(",").map((s) => s.trim()).filter(Boolean),
        allergens: allergensText.split(",").map((s) => s.trim()).filter(Boolean),
        warnings: warningsText.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("barcode", editingProduct.barcode);

        if (error) throw error;
        toast({ title: "Produit mis à jour avec succès" });
      } else {
        const { error } = await supabase.from("products").insert([payload]);

        if (error) throw error;
        toast({ title: "Produit créé avec succès" });
      }

      loadProducts();
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("barcode", id);
      if (error) throw error;
      
      toast({ title: "Produit supprimé avec succès" });
      loadProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setImportErrors([]);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  }

  function parseCSV(text: string) {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) {
      setImportErrors(["Fichier CSV vide ou invalide"]);
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const requiredColumns = ["barcode", "name"];
    const missing = requiredColumns.filter(col => !headers.includes(col));

    if (missing.length > 0) {
      setImportErrors([`Colonnes requises manquantes: ${missing.join(", ")}`]);
      return;
    }

    const preview: any[] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || "";
      });
      preview.push(row);
    }

    setCsvPreview(preview);
  }

  async function handleImport() {
    if (!csvFile) {
      toast({ variant: "destructive", title: "Erreur", description: "Aucun fichier sélectionné" });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

        const products: any[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map(v => v.trim());
          const row: any = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
          });

          if (!row.barcode || !row.name) {
            errors.push(`Ligne ${i + 1}: barcode et name sont requis`);
            continue;
          }

          products.push({
            barcode: row.barcode,
            name: row.name,
            brand: row.brand || null,
            category: row.category || null,
            origin: row.origin || null,
            image_url: row.image_url || null,
            ingredients: row.ingredients ? row.ingredients.split(";").map((s: string) => s.trim()) : [],
            allergens: row.allergens ? row.allergens.split(";").map((s: string) => s.trim()) : [],
            nutri_score: row.nutri_score || null,
            authentic: row.authentic?.toLowerCase() === "true" || row.authentic === "1",
            authenticity_note: row.authenticity_note || null,
            aganor_certified: row.aganor_certified?.toLowerCase() === "true" || row.aganor_certified === "1",
            warnings: row.warnings ? row.warnings.split(";").map((s: string) => s.trim()) : [],
            institution: "aganor",
          });
        }

        if (errors.length > 0) {
          setImportErrors(errors);
          return;
        }

        const { error } = await supabase.from("products").insert(products);
        if (error) throw error;

        toast({ title: `${products.length} produits importés avec succès` });
        setImportSuccess(true);
        loadProducts();
        
        setTimeout(() => {
          setIsImportDialogOpen(false);
          setCsvFile(null);
          setCsvPreview([]);
          setImportErrors([]);
          setImportSuccess(false);
        }, 2000);
      };
      reader.readAsText(csvFile);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  }

  function downloadTemplate() {
    const template = `barcode,name,brand,category,origin,image_url,ingredients,allergens,nutri_score,authentic,aganor_certified,warnings
ABC123,Produit exemple,Marque A,Catégorie 1,Gabon,https://example.com/image.jpg,Ingrédient1;Ingrédient2,Allergène1,A,true,true,Avertissement1`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_produits.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const totalProducts = products.length;
  const certified = products.filter((p) => p.aganor_certified).length;
  const authentic = products.filter((p) => p.authentic).length;

  return (
    <AdminLayout>
      <SEO title="Produits AGANOR - MISSU BALA Admin" noIndex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Mes produits AGANOR</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importer
            </Button>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total produits</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certifiés AGANOR</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{certified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Authentiques</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{authentic}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des produits</CardTitle>
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun produit disponible</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code-barres</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.barcode}>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {product.aganor_certified && (
                            <Badge variant="default" className="bg-accent">
                              Certifié
                            </Badge>
                          )}
                          {!product.authentic && (
                            <Badge variant="destructive">Non authentique</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.barcode)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialogue d'importation CSV */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Importer des produits en masse
              </DialogTitle>
            </DialogHeader>

            {!importSuccess ? (
              <div className="space-y-6">
                <Alert>
                  <AlertDescription>
                    <strong>Format CSV attendu:</strong> barcode, name (requis) | brand, category, origin, image_url, ingredients, allergens, nutri_score, authentic, aganor_certified, warnings (optionnels)
                    <br />
                    <strong>Listes séparées par ;</strong> (ex: ingredients: "Eau;Sucre;Sel")
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Télécharger le modèle CSV
                  </Button>
                </div>

                <div>
                  <Label>Fichier CSV/Excel</Label>
                  <Input 
                    type="file" 
                    accept=".csv,.xlsx" 
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>

                {importErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {importErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {csvPreview.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Prévisualisation ({csvPreview.length} premières lignes)</h3>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Marque</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Certifié</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-sm">{row.barcode}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.brand || "-"}</TableCell>
                              <TableCell>{row.category || "-"}</TableCell>
                              <TableCell>
                                {row.aganor_certified === "true" || row.aganor_certified === "1" ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={csvPreview.length === 0 || importErrors.length > 0}
                  >
                    Importer {csvPreview.length > 0 && `(${csvPreview.length}+ produits)`}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Import réussi !</h3>
                <p className="text-muted-foreground">Les produits ont été importés avec succès.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}