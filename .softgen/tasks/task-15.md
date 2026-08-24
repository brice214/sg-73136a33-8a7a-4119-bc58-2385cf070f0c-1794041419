---
title: Modules AGANOR
status: todo
priority: high
type: feature
tags: [aganor, produits, scans]
created_by: agent
created_at: 2026-08-24T19:30:00Z
position: 15
---

## Notes
Implémenter registre produits et statistiques scans pour AGANOR.

## Checklist
- [ ] Créer /admin/produits.tsx (CRUD produits, barcode, manufacturer, category)
- [ ] Créer /admin/stats-scans.tsx (métriques scans, top produits, timeline)
- [ ] Ajouter liens sidebar pour AGANOR
- [ ] Schéma DB: tables products + scan_history

## Acceptance
- Admin AGANOR gère catalogue produits (ajouter/modifier/supprimer)
- Admin AGANOR voit stats scans en temps réel