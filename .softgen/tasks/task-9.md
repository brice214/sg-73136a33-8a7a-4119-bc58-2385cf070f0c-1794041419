---
title: Module Métriques Globales (Super Admin)
status: todo
priority: medium
type: feature
tags: [super-admin, analytics]
created_by: agent
created_at: 2026-08-24T16:50:00Z
position: 9
---

## Notes
Dashboards analytics avancés: citoyens totaux/actifs, scans/jour (30j), plaintes par agence/statut, top 10 produits scannés, articles favoris, abonnés Premium + revenus.

## Checklist
- [ ] Page /admin/metriques avec KPI cards
- [ ] Graphique scans/jour (30 derniers jours)
- [ ] Graphique plaintes par agence et statut
- [ ] Top 10 produits scannés (scan_history aggregate)
- [ ] Top articles favoris (calcul depuis app mobile - stub si pas encore disponible)
- [ ] Compteur abonnés Premium actifs
- [ ] Calcul revenus Premium (SUM subscriptions.price)

## Acceptance
- Graphiques s'affichent avec données temps réel
- Top 10 agrégations correctes
- Revenus calculés en FCFA