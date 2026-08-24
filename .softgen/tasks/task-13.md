---
title: Module Mon Compte (Tous rôles)
status: todo
priority: low
type: feature
tags: [all-roles]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 13
---

## Notes
Profil admin: modification full_name, changement mot de passe via Supabase Auth.

## Checklist
- [ ] Page /admin/mon-compte avec 2 sections
- [ ] Section Profil: formulaire full_name (update admin_users)
- [ ] Section Sécurité: formulaire changement mdp (updateUser password)
- [ ] Validation: mdp min 8 caractères, confirmation match
- [ ] Toast succès/erreur

## Acceptance
- Modification nom met à jour admin_users.full_name
- Changement mdp via Supabase Auth fonctionne
- Erreurs validation affichées clairement