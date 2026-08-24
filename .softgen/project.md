# MISSU BALA — Backoffice d'administration

## Vision
Backoffice web sécurisé par rôles pour gérer l'application mobile MISSU BALA (régulation citoyenne au Gabon). Interface permettant aux institutions (AGASA, AGANOR, DGCCRF) et au Super Admin de gérer le contenu, suivre les plaintes, et administrer l'application.

## Design
**Palette institutionnelle:**
- `--primary: 150 61% 26%` (vert #1B6B3C)
- `--accent: 43 68% 55%` (or #D4A843 - CTA secondaires)
- `--destructive: 4 69% 49%` (rouge #C0392B - alertes)
- `--background: 120 20% 97%` (fond clair #F6F8F6)
- `--foreground: 150 20% 15%` (texte sombre)
- `--muted: 120 15% 94%` (gris clair verdâtre)

**Typographie:**
- Headings: Fredoka (500, 600, 700) — arrondi, institutionnel moderne
- Body: Nunito (400, 500, 600) — lisible, professionnel

**Style:** Backoffice institutionnel moderne — sidebar sombre verte, cartes arrondies (border-radius 12-16px), badges de statut colorés, interface responsive desktop-first.

## Features
- Authentification multi-rôles avec Supabase Auth
- 4 dashboards (Super Admin, AGASA, AGANOR, DGCCRF)
- Gestion produits (AGANOR), actualités (AGASA/blog), mercuriale (DGCCRF)
- Suivi plaintes/signalements avec photos signées
- WebTV et bannières publicitaires (Super Admin)
- Gestion administrateurs (création, blocage, réinitialisation)
- Notifications push et Premium
- Métriques globales avec graphiques