---
title: Modules AGASA
status: in_progress
priority: high
type: feature
tags: [agasa, plaintes, statistiques]
created_by: agent
created_at: 2026-08-24T19:30:00Z
position: 14
---

## Notes
Implémenter les modules spécifiques AGASA (plaintes et statistiques).

## Checklist
- [x] Créer /admin/plaintes-agasa.tsx (tableau plaintes, filtres statut, réponses)
- [x] Créer /admin/stats-agasa.tsx (métriques plaintes AGASA, graphiques)
- [x] Ajouter liens sidebar pour AGASA
- [x] Schéma DB: table complaints avec agency='AGASA'

## Acceptance
- Admin AGASA peut voir et répondre aux plaintes AGASA
- Admin AGASA voit statistiques spécifiques