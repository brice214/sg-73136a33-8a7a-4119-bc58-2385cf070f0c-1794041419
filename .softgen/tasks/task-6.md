---
title: Module Plaintes (Super Admin, AGASA, DGCCRF)
status: todo
priority: high
type: feature
tags: [super-admin, agasa, dgccrf]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 6
---

## Notes
Vue consolidée complaints. Super Admin voit tout, AGASA uniquement agency='AGASA', DGCCRF uniquement agency='DGCCRF'. Changement statut, vue détail avec photos signées.

## Checklist
- [ ] Page /admin/plaintes avec tableau filtrable
- [ ] Filtres: agence, statut, période
- [ ] Vue détail (drawer): produit, commerçant, localisation, photos, détails
- [ ] Changement statut (soumise/en_cours/traitee/transmise)
- [ ] Badge couleur par statut
- [ ] Affichage photos signées (Storage bucket complaints_photos)
- [ ] Calcul écart % prix (DGCCRF uniquement)

## Acceptance
- Super Admin voit toutes agences
- AGASA filtrée agency='AGASA' automatiquement
- DGCCRF filtrée agency='DGCCRF' automatiquement
- Photos Storage s'affichent avec URL signée