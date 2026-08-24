---
title: Module Bannières Publicitaires (Super Admin)
status: done
priority: medium
type: feature
tags: [super-admin, publicite, crud]
created_by: agent
created_at: 2026-08-24T16:54:00Z
position: 7
---

## Notes
Super Admin gère les bannières pub de l'app mobile. Schéma DB: title, image_url (bucket 'banners'), link_url, is_active, position, sort_order, start_date, end_date.

## Checklist
- [ ] Page /admin/publicite avec tableau banners
- [ ] Upload image → bucket 'banners' puis image_url
- [ ] Dialog création: title, upload, link_url, position, dates
- [ ] Aperçu bannière (comme dans app mobile)
- [ ] Activation/désactivation toggle (is_active)
- [ ] Suppression avec confirmation
- [ ] Réordonnancement drag-and-drop → sort_order

## Acceptance
- Upload génère signed URL
- Aperçu affiche comme dans l'app mobile
- Activation toggle masque/affiche