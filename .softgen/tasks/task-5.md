---
title: Module Actualités Blog (Super Admin)
status: done
priority: high
type: feature
tags: [super-admin, blog, crud]
created_by: agent
created_at: 2026-08-24T16:52:00Z
position: 5
---

## Notes
Super Admin gère uniquement les actualités du Blog (source='blog'). Schéma DB: excerpt, tag, tag_color, published_date, sort_order. Pas d'upload image dans cette version.

## Checklist
- [x] Page /admin/actualites avec tableau news où source='blog'
- [x] Dialog création: title, excerpt, tag, tag_color
- [x] Dialog modification: mêmes champs
- [x] Suppression avec confirmation
- [x] Filtres: tag_color, recherche titre/excerpt/tag

## Acceptance
- Super Admin voit uniquement source='blog'
- CRUD complet fonctionne correctement
- Filtres appliquent les critères