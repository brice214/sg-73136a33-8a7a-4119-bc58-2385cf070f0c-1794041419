import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Bell, Trash2 } from "lucide-react";

export default function PolitiqueConfidentialite() {
  return (
    <>
      <SEO
        title="Politique de confidentialité - MISSU BALA"
        description="Politique de confidentialité et protection des données personnelles de l'application MISSU BALA"
      />
      <div className="min-h-screen bg-background">
        {/* En-tête */}
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="h-12 w-12" />
              <h1 className="text-4xl font-display font-bold">
                Politique de confidentialité
              </h1>
            </div>
            <p className="text-lg text-white/90">
              Protection des données personnelles de l'application MISSU BALA
            </p>
            <p className="text-sm text-white/80 mt-2">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </header>

        {/* Contenu */}
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  MISSU BALA est une application mobile citoyenne développée pour améliorer la régulation des prix et la qualité des produits au Gabon. 
                  Cette politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément 
                  aux lois gabonaises et internationales en vigueur.
                </p>
              </CardContent>
            </Card>

            {/* 1. Responsable du traitement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Database className="h-6 w-6" />
                  1. Responsable du traitement des données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Entités responsables :</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>AGASA</strong> (Agence Gabonaise de Sécurité Alimentaire) - Régulation sanitaire et alimentaire</li>
                    <li><strong>AGANOR</strong> (Agence Gabonaise de Normalisation) - Normalisation et certification des produits</li>
                    <li><strong>DGCCRF</strong> (Direction Générale de la Concurrence, de la Consommation et de la Répression des Fraudes) - Contrôle des prix et protection des consommateurs</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Contact pour vos données personnelles :</p>
                  <p className="text-muted-foreground">
                    Email : <span className="text-primary font-medium">contact@missubala.ga</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Données collectées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Eye className="h-6 w-6" />
                  2. Données collectées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-3">Lors de l'inscription :</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Nom et prénom</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse email (optionnelle)</li>
                    <li>Localisation (ville/commune)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-3">Lors de l'utilisation de l'application :</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Signalements et plaintes (texte, photos, localisation)</li>
                    <li>Historique de consultation de la mercuriale des prix</li>
                    <li>Scans de codes-barres pour vérification de produits</li>
                    <li>Données de navigation et d'utilisation de l'application</li>
                    <li>Interactions avec les actualités et contenus WebTV</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-3">Données techniques :</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Type d'appareil et système d'exploitation</li>
                    <li>Identifiant unique de l'appareil</li>
                    <li>Adresse IP</li>
                    <li>Version de l'application</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 3. Finalités du traitement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Lock className="h-6 w-6" />
                  3. Finalités du traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">Vos données sont collectées et traitées pour :</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Créer et gérer votre compte utilisateur</li>
                  <li>Traiter vos signalements et plaintes auprès des autorités compétentes</li>
                  <li>Vous informer des prix officiels et des produits réglementés</li>
                  <li>Améliorer la protection des consommateurs gabonais</li>
                  <li>Vous envoyer des notifications importantes (alertes sanitaires, mises à jour de prix)</li>
                  <li>Réaliser des statistiques anonymisées pour améliorer l'application</li>
                  <li>Lutter contre la fraude et les pratiques commerciales abusives</li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Base légale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Shield className="h-6 w-6" />
                  4. Base légale du traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">Le traitement de vos données repose sur :</p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4">
                  <li><strong>Votre consentement</strong> : lors de l'inscription et de l'utilisation de l'application</li>
                  <li><strong>L'exécution d'une mission d'intérêt public</strong> : régulation des prix, protection des consommateurs, sécurité alimentaire</li>
                  <li><strong>Le respect d'obligations légales</strong> : transmission des plaintes aux autorités compétentes (AGASA, AGANOR, DGCCRF)</li>
                </ul>
              </CardContent>
            </Card>

            {/* 5. Partage des données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Database className="h-6 w-6" />
                  5. Partage et destinataires des données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">Vos données peuvent être partagées avec :</p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4">
                  <li><strong>Les institutions de régulation</strong> : AGASA, AGANOR, DGCCRF (dans le cadre de vos signalements)</li>
                  <li><strong>Les prestataires techniques</strong> : hébergement des données, services de notifications push</li>
                  <li><strong>Les autorités judiciaires</strong> : sur réquisition légale uniquement</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground italic">
                  Nous ne vendons jamais vos données à des tiers à des fins commerciales.
                </p>
              </CardContent>
            </Card>

            {/* 6. Durée de conservation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Database className="h-6 w-6" />
                  6. Durée de conservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Données de compte</strong> : conservées tant que votre compte est actif</li>
                  <li><strong>Signalements et plaintes</strong> : conservés 5 ans après traitement (obligations légales)</li>
                  <li><strong>Données de navigation</strong> : conservées 12 mois maximum</li>
                  <li><strong>Comptes inactifs</strong> : supprimés après 3 ans sans connexion (avec notification préalable)</li>
                </ul>
              </CardContent>
            </Card>

            {/* 7. Sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Lock className="h-6 w-6" />
                  7. Sécurité des données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Chiffrement des données sensibles (SSL/TLS)</li>
                  <li>Hébergement sécurisé sur des serveurs protégés</li>
                  <li>Authentification forte et gestion des accès</li>
                  <li>Sauvegardes régulières</li>
                  <li>Audits de sécurité périodiques</li>
                </ul>
              </CardContent>
            </Card>

            {/* 8. Vos droits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Eye className="h-6 w-6" />
                  8. Vos droits sur vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Conformément à la législation, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4">
                  <li><strong>Droit d'accès</strong> : consulter les données que nous détenons sur vous</li>
                  <li><strong>Droit de rectification</strong> : corriger vos données inexactes ou incomplètes</li>
                  <li><strong>Droit à l'effacement</strong> : supprimer votre compte et vos données (sauf obligations légales)</li>
                  <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données pour motifs légitimes</li>
                  <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
                  <li><strong>Droit de retirer votre consentement</strong> : à tout moment pour les traitements basés sur le consentement</li>
                </ul>
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="font-semibold text-primary mb-2">Pour exercer vos droits :</p>
                  <p className="text-muted-foreground">
                    Contactez-nous à : <span className="text-primary font-medium">contact@missubala.ga</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Nous nous engageons à répondre dans un délai de 30 jours maximum.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 9. Notifications push */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Bell className="h-6 w-6" />
                  9. Notifications push
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Nous pouvons vous envoyer des notifications pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Alertes sanitaires urgentes (rappels de produits, contaminations)</li>
                  <li>Mises à jour de la mercuriale des prix</li>
                  <li>Réponses à vos signalements</li>
                  <li>Actualités importantes des institutions de régulation</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground italic">
                  Vous pouvez désactiver les notifications dans les paramètres de votre appareil à tout moment.
                </p>
              </CardContent>
            </Card>

            {/* 10. Cookies et traceurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Database className="h-6 w-6" />
                  10. Cookies et traceurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  L'application utilise des technologies de suivi pour améliorer votre expérience :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement de l'application (session, authentification)</li>
                  <li><strong>Cookies analytiques</strong> : mesure d'audience et statistiques d'utilisation (anonymisés)</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Aucun cookie publicitaire ou de ciblage comportemental n'est utilisé.
                </p>
              </CardContent>
            </Card>

            {/* 11. Mineurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Shield className="h-6 w-6" />
                  11. Protection des mineurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  L'application MISSU BALA est destinée aux personnes majeures (18 ans et plus). Si un mineur utilise l'application, 
                  le consentement parental est requis. Si nous découvrons qu'un mineur a fourni des données sans autorisation parentale, 
                  nous supprimerons ces données immédiatement.
                </p>
              </CardContent>
            </Card>

            {/* 12. Modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Lock className="h-6 w-6" />
                  12. Modifications de la politique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment pour refléter 
                  les évolutions légales, techniques ou organisationnelles. Toute modification substantielle vous sera notifiée 
                  par notification push ou email au moins 30 jours avant son application.
                </p>
              </CardContent>
            </Card>

            {/* 13. Réclamations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Shield className="h-6 w-6" />
                  13. Réclamations et autorité de contrôle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Si vous estimez que vos droits sur vos données personnelles ne sont pas respectés, vous pouvez :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Nous contacter directement : <span className="text-primary font-medium">contact@missubala.ga</span></li>
                  <li>Déposer une réclamation auprès de l'autorité gabonaise de protection des données personnelles</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Lock className="h-6 w-6" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :
                </p>
                <div className="space-y-2">
                  <p className="font-semibold">Email : <span className="text-primary">contact@missubala.ga</span></p>
                  <p className="text-sm text-muted-foreground">
                    Nous nous engageons à répondre dans les meilleurs délais à toutes vos demandes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-muted/50 py-8 mt-16">
          <div className="container mx-auto px-4 max-w-4xl text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MISSU BALA - Application citoyenne de régulation | République Gabonaise</p>
            <p className="mt-2">AGASA • AGANOR • DGCCRF</p>
          </div>
        </footer>
      </div>
    </>
  );
}