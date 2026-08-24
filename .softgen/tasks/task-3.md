---
title: Module Administrateurs (Super Admin)
status: todo
priority: high
type: feature
tags: [super-admin, admin-management]
created_by: agent
created_at: 2026-08-24T15:53:00Z
position: 3
---

## Notes
Gestion complète des comptes administrateurs: création (AGASA/AGANOR/DGCCRF), modification, blocage, réinitialisation mot de passe. Utilise service_role côté serveur uniquement.

## Checklist
- [ ] Route API /api/admin/list (GET - listUsers + join admin_users)
- [ ] Route API /api/admin/create (POST - createUser + insert admin_users)
- [ ] Route API /api/admin/update (PUT - updateUserById + update admin_users)
- [ ] Route API /api/admin/reset-password (POST - génère nouveau mot de passe)
- [ ] Route API /api/admin/block (POST - toggle is_blocked)
- [ ] Page /admin/administrateurs avec tableau
- [ ] Modal création avec rôle + nom + email
- [ ] Affichage mot de passe temporaire une seule fois
- [ ] Bouton "Copier" pour mot de passe
- [ ] Double confirmation pour suppression

## Acceptance
- Création d'un compte AGANOR fonctionne, affiche le mot de passe temporaire
- Blocage empêche immédiatement la connexion
- service_role jamais exposée au navigateur