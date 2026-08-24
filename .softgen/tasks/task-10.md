---
title: Module Notifications (Super Admin)
status: done
priority: medium
type: feature
tags: [super-admin, notifications]
created_by: agent
created_at: 2026-08-24T16:56:00Z
position: 9
---

## Notes
Super Admin envoie des annonces push. Table notifications: title, message, sent_at, sent_by. Interface indique que FCM est à venir (futur mobile). Historique des annonces envoyées.

## Checklist
- [ ] Page /admin/notifications avec formulaire envoi
- [ ] Formulaire: title, message, envoi → insert notifications
- [ ] Historique: tableau notifications avec tri sent_at desc
- [ ] Note visible: FCM à venir (actuellement DB uniquement)

## Acceptance
- Envoi annonce fonctionne
- Historique affiche toutes annonces envoyées
- Interface claire que FCM est à venir