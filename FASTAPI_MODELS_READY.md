# Connexion réelle des modèles Notebook 25 à FastAPI

Le ZIP `deployment_package` est maintenant intégré dans `backend/`.

## Fichiers intégrés

```text
backend/
├── app/
│   ├── main.py
│   └── prediction_engine.py
├── data/
│   ├── 05_api_ready_risk_view.csv
│   ├── score_reference_quantiles.csv
│   └── selected_model_config.json
├── models/
│   ├── selected_model_6h.joblib
│   └── selected_model_24h.joblib
├── requirements.txt
└── verify_models.py
```

Les modèles sont ceux du Notebook 25 :

- 6 h : `HIST_GRADIENT_BOOSTING` — `EXPERIMENTAL`
- 24 h : `RANDOM_FOREST` — `MVP_CANDIDATE`
- 1 h : indisponible, données locales insuffisantes.

Chaque bundle utilise 47 variables et 10 modèles de PU bagging.

## 1. Installer le backend avec la bonne version de scikit-learn

Les `.joblib` ont été créés avec **scikit-learn 1.6.1**. Il faut conserver cette version.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 2. Vérifier les modèles

```bash
python verify_models.py
```

Le résultat attendu contient :

```text
6h: OK | model=HIST_GRADIENT_BOOSTING | features=47 | bagged_models=10
24h: OK | model=RANDOM_FOREST | features=47 | bagged_models=10
```

## 3. Lancer FastAPI

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Puis ouvrir :

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/models`
- `http://127.0.0.1:8000/docs`

Quand tout est correct, `/health` renvoie `mode: MODEL_READY`.

## 4. Endpoints de prédiction

```text
POST /predict/6h
POST /predict/24h
```

L'API applique :

```text
47 features
→ préprocesseur sauvegardé
→ 10 modèles PU bagging
→ score moyen
→ table de quantiles Notebook 25
→ percentile
→ LOW / MODERATE / HIGH / CRITICAL
```

La table `score_reference_quantiles.csv` contient la référence par province et horizon.

## 5. Important : ce qui manque encore pour une prédiction dynamique dans le dashboard

Les modèles sont maintenant réellement chargés par FastAPI, mais une prédiction nouvelle demande
les **47 variables d'entrée**. Le ZIP Notebook 25 contient les modèles et les quantiles, mais pas
une source temps réel fournissant ces 47 variables.

Le dashboard continue donc d'afficher le snapshot historique du Notebook 25 pour ses cartes.
Il peut maintenant confirmer que le moteur ML est chargé (`MODEL_READY`).

Pour rendre les cartes réellement dynamiques, la prochaine étape est de brancher un
**Feature Builder** sur une source de données :

```text
données JIRAMA / CSV historique / API
→ construction des 47 features
→ POST /predict/6h et /predict/24h
→ dashboard
```

Ne pas remplacer les percentiles par des probabilités. Les bundles indiquent explicitement :
`RISK_RANKING_SCORE_NOT_PROBABILITY`.
