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
- [ ] Page /admin/compte avec 2 cartes: Profil + Sécurité
- [ ] Carte Profil: champ full_name, bouton Enregistrer
- [ ] Carte Sécurité: ancien mdp, nouveau mdp, confirmation
- [ ] Update admin_users.full_name via Supabase client
- [ ] Changement mdp via supabase.auth.updateUser()
- [ ] Validation: mdp >= 8 caractères, confirmation identique

## Acceptance
- Modification full_name fonctionne
- Changement mdp via Supabase Auth fonctionne
- Erreurs validation affichées clairement