---
title: Module Métriques Globales (Super Admin)
status: done
priority: medium
type: feature
tags: [super-admin, analytics]
created_by: agent
created_at: 2026-08-24T16:55:00Z
position: 8
---

## Notes
Page /admin/metriques avec analyses détaillées. Données: profiles (citoyens), scan_history (scans 30j), complaints (par agence/statut), subscriptions (Premium). Graphiques temps réel.

## Checklist
- [ ] Page /admin/metriques avec cartes métriques
- [ ] Citoyens: total, actifs 7j/30j (dernière activité via scan_history)
- [ ] Scans: graphique 30j, total scans
- [ ] Plaintes: répartition par agence et statut
- [ ] Top 10 produits scannés (agrégation scan_history)
- [ ] Premium: abonnés actifs, revenus totaux FCFA

## Acceptance
- Toutes métriques affichent données temps réel
- Top 10 agrégations correctes
- Revenus calculés en FCFA