---
title: Module Agrément Sanitaire AGASA
status: done
priority: high
type: feature
tags: [agasa, agrément, pdf]
created_by: agent
created_at: 2026-08-28T07:50:00Z
position: 17
---

## Notes
Module pour générer des agréments sanitaires en PDF pour l'AGASA.
Formulaire complet + éditeur enrichi + génération PDF conforme au modèle officiel.

Les logos (AGASA et Sceau République) doivent être ajoutés manuellement par l'utilisateur dans public/.

## Checklist
- [x] Créer /admin/agrement-sanitaire.tsx avec formulaire complet
- [x] Intégrer éditeur de texte enrichi pour le contenu légal
- [x] Implémenter génération PDF avec jsPDF (logo, sceau, mise en page)
- [x] Ajouter lien sidebar AGASA
- [x] Note: Logos à ajouter manuellement par utilisateur dans public/

## Acceptance
- Admin AGASA peut créer un agrément avec tous les champs
- Le PDF généré respecte la mise en page officielle
- Les variables du formulaire s'insèrent automatiquement dans le contenu