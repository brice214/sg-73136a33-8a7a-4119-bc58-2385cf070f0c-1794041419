---
title: Authentification et structure de base
status: in_progress
priority: urgent
type: feature
tags: [auth, layout, supabase]
created_by: agent
created_at: 2026-08-24T15:53:00Z
position: 1
---

## Notes
Mise en place de l'authentification Supabase, écran de connexion, structure de base du backoffice avec sidebar et routing par rôle. Configuration du design system institutionnel (vert, or, rouge).

## Checklist
- [ ] Setup design system (globals.css + tailwind - vert #1B6B3C, or #D4A843)
- [ ] Configuration Supabase client
- [ ] Écran de connexion (email + password)
- [ ] Hook useAuth avec vérification admin_users
- [ ] Layout backoffice avec sidebar
- [ ] Routing par rôle (super_admin, agasa, aganor, dgccrf)
- [ ] Détection comptes bloqués
- [ ] Page 404 custom

## Acceptance
- Connexion redirige vers le bon dashboard selon le rôle
- Comptes bloqués (is_blocked=true) ne peuvent pas se connecter
- Comptes citoyens (non dans admin_users) sont refusés