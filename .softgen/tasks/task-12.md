---
title: Module Citoyens (Super Admin)
status: done
priority: low
type: feature
tags: [super-admin, users]
created_by: agent
created_at: 2026-08-24T16:58:00Z
position: 11
---

## Notes
Super Admin liste tous les utilisateurs de l'app mobile (table profiles). Lecture seule avec actions: bloquer (empêche connexion) et supprimer compte. Schéma: id, email, full_name, created_at, last_sign_in_at.

## Checklist
- [ ] Page /admin/citoyens avec tableau profiles
- [ ] Colonnes: email, nom, inscription, dernière connexion
- [ ] Recherche par email/nom
- [ ] Bloquer utilisateur (via Supabase Auth Admin)
- [ ] Supprimer compte (via Supabase Auth Admin)
- [ ] Confirmation avant suppression

## Acceptance
- Liste affiche tous citoyens (non-admin)
- Recherche fonctionne
- Blocage/suppression fonctionnent via service_role côté serveur