---
title: Module Premium (Super Admin)
status: done
priority: medium
type: feature
tags: [super-admin, premium]
created_by: agent
created_at: 2026-08-24T16:57:00Z
position: 10
---

## Notes
Super Admin gère les offres Premium et abonnements. Tables: premium_plans (offres), subscriptions (abonnements utilisateurs). CRUD offres, octroi manuel, annulation.

## Checklist
- [ ] Page /admin/premium avec 2 sections: Offres + Abonnés
- [ ] Section Offres: CRUD premium_plans (name, code, price_fcfa, period_months, features[], is_active)
- [ ] Section Abonnés: liste subscriptions avec user email, plan, dates, statut
- [ ] Octroi manuel: sélectionner user + plan → insert subscription avec source='backoffice'
- [ ] Annulation: changer status='cancelled' immédiatement
- [ ] Filtres: plan, statut, recherche user

## Acceptance
- CRUD offres fonctionne
- Octroi manuel crée subscription avec source='backoffice'
- Annulation change statut immédiatement