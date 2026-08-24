---
title: Module Premium (Super Admin)
status: todo
priority: medium
type: feature
tags: [super-admin, crud]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 11
---

## Notes
CRUD premium_plans (offres) + gestion subscriptions (octroi manuel, annulation). Liste abonnés actifs/expirés.

## Checklist
- [ ] Page /admin/premium avec 2 onglets (Offres / Abonnés)
- [ ] Onglet Offres: CRUD premium_plans (code, name, price_fcfa, period_months, features[], is_active)
- [ ] Onglet Abonnés: tableau subscriptions avec filtres statut
- [ ] Bouton "Octroyer Premium" (sélectionner citoyen + plan + durée)
- [ ] Bouton Annuler abonnement (status='cancelled')
- [ ] Badge couleur par statut (active=vert, expired=gris, cancelled=rouge)

## Acceptance
- CRUD offres fonctionne
- Octroi manuel crée subscription avec source='backoffice'
- Annulation change statut immédiatement