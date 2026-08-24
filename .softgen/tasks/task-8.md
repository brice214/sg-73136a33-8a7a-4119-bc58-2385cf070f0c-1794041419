---
title: Module Bannières Publicitaires (Super Admin)
status: todo
priority: medium
type: feature
tags: [super-admin, crud]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 8
---

## Notes
CRUD banners avec upload image (Storage bucket banners). Aperçu mobile simulé, activation/désactivation, réordonnancement.

## Checklist
- [ ] Page /admin/bannieres avec grille cards + aperçu mobile
- [ ] Formulaire création (title, subtitle, image upload, link_url)
- [ ] Upload image → Storage banners
- [ ] Toggle activation (is_active)
- [ ] Réordonnancement drag-and-drop
- [ ] Aperçu simulation format mobile (ratio 16:9)
- [ ] Suppression avec confirmation

## Acceptance
- Upload génère signed URL
- Aperçu affiche comme dans l'app mobile
- Activation toggle masque/affiche