# Feature Builder 47 variables + prédictions réelles FastAPI

Cette version connecte réellement le dashboard aux deux bundles `.joblib` du Notebook 25.

## Flux exécuté au chargement du dashboard

```text
historical_feature_inputs_2024.csv
        ↓
Feature Builder FastAPI
        ↓
47 variables identiques au Notebook 24
        ↓
POST /predict/6h  → HistGradientBoosting PU
POST /predict/24h → Random Forest PU
        ↓
score brut
        ↓
score_reference_quantiles.csv
        ↓
percentile + LOW / MODERATE / HIGH / CRITICAL
        ↓
dashboard React
```

Pour le replay historique, le dashboard effectue 12 appels de prédiction :
6 provinces × 2 horizons.

## Les 47 variables

Le Feature Builder reproduit la liste du Notebook 24 : production par source,
demande, parts du mix énergétique, prévisions 1h/6h/24h, déficits, marges,
ratios, variables cycliques du temps et contexte des coupures planifiées connu à t.

Les parts du mix énergétique sont récupérées dans le contexte annuel de la zone,
comme lors de la construction du dataset d'entraînement. Elles ne sont pas recalculées
à partir de la seule production instantanée.

## Important sur la source de données

Le calcul est désormais **réellement exécuté par les modèles `.joblib`**, mais les entrées
fournies automatiquement au dashboard sont encore un **replay historique 2024** construit
avec la même logique que le dataset académique. Ce n'est pas encore un flux opérationnel
JIRAMA temps réel.

L'endpoint `POST /features/build` est prévu pour remplacer plus tard ce replay par des données
réelles provenant d'une base, de fichiers ou d'une API.

## Installation

Depuis le dossier `backend` :

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Les modèles exigent `scikit-learn==1.6.1`.

## Vérifications

```bash
python verify_models.py
python verify_feature_builder.py
python test_full_pipeline.py
```

Le dernier test doit afficher les percentiles 6h et 24h des six provinces.

## Démarrer FastAPI

```bash
uvicorn app.main:app --reload --port 8000
```

Ouvrir :

- `http://localhost:8000/health`
- `http://localhost:8000/docs`
- `http://localhost:8000/features/latest`

Le `/health` attendu contient notamment :

```json
{
  "mode": "MODEL_READY",
  "models_ready": {"6h": true, "24h": true},
  "feature_builder_ready": true,
  "model_feature_count": 47
}
```

## Démarrer le dashboard

Depuis la racine du projet :

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Le frontend utilise `NEXT_PUBLIC_PREDICTION_API_URL=http://localhost:8000`.

Quand tout fonctionne, l'encart FastAPI du dashboard indique que le Feature Builder est actif
et que `/predict/6h` et `/predict/24h` sont réellement appelés.

## Pour passer au vrai temps réel

Remplacer la source `historical_feature_inputs_2024.csv` par un flux qui fournit au minimum :

- production hydro/HFO/GO/solaire/hybride ;
- demande actuelle ;
- demande prévue à 1h, 6h et 24h ;
- génération prévue à 1h, 6h et 24h ;
- coupures planifiées connues à l'instant de calcul.

Le Feature Builder pourra alors continuer à construire les 47 variables sans modifier les modèles.
