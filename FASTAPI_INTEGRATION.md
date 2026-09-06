# Intégration FastAPI — état actuel

## Ce qui est déjà connecté

Le dashboard appelle maintenant FastAPI au démarrage :

- `GET /health` pour connaître l'état des modèles ;
- `GET /historical/latest` pour charger le snapshot Notebook 25 via l'API ;
- si FastAPI est indisponible, le frontend retombe automatiquement sur `lib/step25Data.js`.

## Ce qui manque dans les fichiers reçus

Les deux ZIP reçus sont strictement identiques (même SHA-256) et correspondent tous les deux au projet dashboard. Ils ne contiennent pas :

- `selected_model_6h.joblib`
- `selected_model_24h.joblib`
- `prediction_engine.py`
- `score_reference_quantiles.csv`

Le fichier `08_selected_model_config.json` confirme pourtant que ces deux `.joblib` sont attendus dans `models/`.

## Pour activer les vraies prédictions

Copier les fichiers du Notebook 25 ici :

```text
backend/models/selected_model_6h.joblib
backend/models/selected_model_24h.joblib
```

Puis relancer FastAPI. `GET /health` passera automatiquement de :

```text
HISTORICAL_REPLAY_ONLY
```

à :

```text
MODEL_READY
```

Les endpoints suivants seront alors actifs :

```text
POST /predict/6h
POST /predict/24h
```

Ils attendent les variables d'entrée du modèle dans `features`. Une fois les `.joblib` présents, `GET /models` expose la liste exacte des variables attendues.

## Lancement local

Terminal 1 :

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Terminal 2 :

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Swagger : http://localhost:8000/docs
