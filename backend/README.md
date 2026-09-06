# Backend FastAPI — JIRAMA Predictive

## 1. Installation

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Ajouter les modèles

Copier dans `backend/models/` :

```text
selected_model_6h.joblib
selected_model_24h.joblib
```

Ils doivent provenir du `deployment_package/models/` du Notebook 25.

## 3. Lancer l'API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API : http://localhost:8000
- Swagger : http://localhost:8000/docs
- Santé : http://localhost:8000/health
- Snapshot Notebook 25 : http://localhost:8000/historical/latest

## 4. Modes

- `MODEL_READY` : les deux `.joblib` sont présents et chargés.
- `HISTORICAL_REPLAY_ONLY` : les `.joblib` manquent ; le dashboard utilise alors le snapshot historique via FastAPI.

## 5. Prédiction réelle

Les endpoints `POST /predict/6h` et `POST /predict/24h` attendent un objet `features` contenant exactement les variables attendues par le bundle. La liste est visible dans `GET /models` une fois les modèles chargés.

Les résultats sont des scores de risque relatifs / percentiles et non des probabilités calibrées.

## Feature Builder 47 variables

Cette version ajoute `app/feature_builder.py` et un replay des entrées 2024.

```bash
python verify_feature_builder.py
python test_full_pipeline.py
```

Le dashboard appelle ensuite réellement `/predict/6h` et `/predict/24h` lorsque `/health`
indique `MODEL_READY`.
