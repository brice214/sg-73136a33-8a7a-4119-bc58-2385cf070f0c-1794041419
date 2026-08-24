---
title: Module Actualités (Super Admin + AGASA)
status: todo
priority: high
type: feature
tags: [super-admin, agasa, crud]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 5
---

## Notes
CRUD news avec filtre source (agasa/blog). Super Admin voit tout, AGASA uniquement source='agasa'. Réordonnancement drag-and-drop. Tag color picker.

## Checklist
- [ ] Page /admin/actualites avec tableau filtrable
- [ ] Formulaire création/édition (source, tag, title, excerpt, published_date, tag_color)
- [ ] Filtre source (agasa/blog) - AGASA auto-lockée sur 'agasa'
- [ ] Réordonnancement (sort_order update)
- [ ] Color picker tag_color (vert/bleu/rouge/orange/violet)
- [ ] Suppression avec confirmation

## Acceptance
- Super Admin CRUD sur les 2 sources
- AGASA voit uniquement source='agasa'
- Réordonnancement sauvegarde sort_order