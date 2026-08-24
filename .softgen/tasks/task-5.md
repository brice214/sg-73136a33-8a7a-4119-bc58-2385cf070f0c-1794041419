---
title: Module Actualités Blog (Super Admin)
status: in_progress
priority: high
type: feature
tags: [super-admin, blog, crud]
created_by: agent
created_at: 2026-08-24T16:52:00Z
position: 5
---

## Notes
Super Admin gère uniquement les actualités du Blog (source='blog'). Chaque dashboard peut publier ses propres actualités selon sa source (AGASA publie source='agasa', etc.). Upload image vers bucket 'news-images', réordonnancement, publication/dépublication.

## Checklist
- [ ] Page /admin/actualites avec tableau news où source='blog'
- [ ] Dialog création: title, content, image upload, tag_color
- [ ] Upload image → bucket 'news-images' puis image_url dans news
- [ ] Dialog modification: mêmes champs
- [ ] Publication/dépublication toggle (published_at)
- [ ] Suppression avec confirmation
- [ ] Réordonnancement drag-and-drop → sort_order
- [ ] Filtres: tag_color, publié/brouillon

## Acceptance
- Super Admin voit uniquement source='blog'
- Upload image fonctionne vers bucket 'news-images'
- Réordonnancement sauvegarde sort_order correctement