---
title: Module WebTV (Super Admin)
status: done
priority: medium
type: feature
tags: [super-admin, webtv, crud]
created_by: agent
created_at: 2026-08-24T16:53:00Z
position: 6
---

## Notes
Super Admin publie des vidéos Youtube. Schéma DB: title, description, tag, video_url (URL Youtube), thumbnail_url, duration, published_date, is_published, sort_order.

## Checklist
- [ ] Page /admin/webtv avec tableau webtv
- [ ] Dialog création: title, description, tag, video_url (Youtube), duration, thumbnail_url
- [ ] Publication/dépublication toggle (is_published)
- [ ] Suppression avec confirmation
- [ ] Réordonnancement drag-and-drop → sort_order
- [ ] Aperçu embed Youtube

## Acceptance
- Upload URL Youtube fonctionne
- Publication toggle masque/affiche dans app mobile
- Réordonnancement sauvegarde sort_order