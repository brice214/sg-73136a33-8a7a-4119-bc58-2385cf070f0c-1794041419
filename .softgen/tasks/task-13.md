---
title: Module Mon Compte (Tous rôles)
status: done
priority: low
type: feature
tags: [all-roles, account]
created_by: agent
created_at: 2026-08-24T16:59:00Z
position: 12
---

## Notes
Page /admin/compte pour tous les administrateurs. Modification du nom complet (admin_users.full_name) et changement de mot de passe (Supabase Auth). Validation côté client.

## Checklist
- [x] Page /admin/compte avec 2 cartes: Profil + Sécurité
- [x] Carte Profil: champ full_name, bouton Enregistrer
- [x] Carte Sécurité: nouveau mdp, confirmation
- [x] Update admin_users.full_name via Supabase client
- [x] Changement mdp via supabase.auth.updateUser()
- [x] Validation: mdp >= 8 caractères, confirmation identique

## Acceptance
- Modification full_name fonctionne
- Changement mdp via Supabase Auth fonctionne
- Erreurs validation affichées clairement