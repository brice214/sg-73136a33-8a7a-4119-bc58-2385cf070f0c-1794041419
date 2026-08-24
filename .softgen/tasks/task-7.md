---
title: Module WebTV (Super Admin)
status: todo
priority: medium
type: feature
tags: [super-admin, crud]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 7
---

## Notes
CRUD webtv avec upload miniature (Storage bucket webtv_thumbnails). Publication/dépublication, réordonnancement.

## Checklist
- [ ] Page /admin/webtv avec grille cards
- [ ] Formulaire création/édition (title, description, duration, tag, video_url, thumbnail upload)
- [ ] Upload miniature → Storage webtv_thumbnails
- [ ] Toggle publication (is_published)
- [ ] Réordonnancement drag-and-drop
- [ ] Suppression avec confirmation

## Acceptance
- Upload miniature génère signed URL
- Publication toggle masque/affiche dans l'app mobile
- Réordonnancement sauvegarde sort_order