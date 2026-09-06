# Intégration Notebook 25

Le dashboard a été mis à jour pour utiliser les résultats réels du Notebook 25.

## Changements principaux

- suppression des scores de risque fictifs du dashboard ;
- suppression des fausses probabilités de coupure ;
- utilisation de percentiles de risque relatifs ;
- modèle 6h : `HIST_GRADIENT_BOOSTING` — `EXPERIMENTAL` ;
- modèle 24h : `RANDOM_FOREST` — `MVP_CANDIDATE` ;
- horizon 1h affiché comme indisponible faute de données locales suffisantes ;
- carte adaptée aux 6 zones de modélisation ;
- intégration des 12 visualisations du Notebook 25 ;
- onglet `Modèles IA` ajouté ;
- alertes calculées depuis les niveaux réels du snapshot au lieu d'être codées en dur ;
- indication claire que le snapshot est historique (`31/12/2024 23:00`) et non temps réel.

## Données intégrées

- `lib/step25Data.js` : synthèse prête pour l'interface ;
- `public/model-results/` : 12 visualisations PNG ;
- `public/model-data/` : principaux CSV / JSON de l'étape 25.

## Vérification

Les fichiers JSX modifiés ont été vérifiés syntaxiquement avec TypeScript (`tsc --allowJs --jsx preserve --noEmit`).
