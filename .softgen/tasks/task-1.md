---
title: Authentification et structure de base
status: in_progress
priority: urgent
type: feature
tags: [auth, layout]
created_by: agent
created_at: 2026-08-24T15:53:00Z
position: 1
---

## Notes
Page de connexion qui vérifie admin_users + is_blocked. Layout principal avec sidebar verte pour navigation. Protection routes via AdminAuthProvider.

## Checklist
- [x] Service adminAuthService (signIn vérifie admin_users + is_blocked)
- [x] Context AdminAuthProvider avec session persistée
- [x] Page /login avec formulaire et gestion erreurs
- [x] Composant Sidebar avec navigation filtrée par rôle
- [x] Layout AdminLayout avec protection routes
- [x] Redirection index.tsx → /login
- [x] Page /admin/dashboard avec stats de base
- [ ] Gestion refresh token automatique

## Acceptance
- Connexion avec compte super_admin fonctionne
- Comptes bloqués (is_blocked=true) ne peuvent pas se connecter
- Comptes citoyens (non dans admin_users) sont refusés