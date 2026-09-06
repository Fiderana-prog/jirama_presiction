# Modèles Notebook 25 requis

Copiez ici les deux fichiers du `deployment_package/models/` généré par le Notebook 25 :

- `selected_model_6h.joblib`
- `selected_model_24h.joblib`

Sans ces fichiers, l'API fonctionne en mode `HISTORICAL_REPLAY_ONLY` : le dashboard est connecté à FastAPI et lit le snapshot historique, mais `POST /predict/6h` et `POST /predict/24h` renvoient HTTP 503.

Les modèles ont été préparés avec `scikit-learn 1.6.1`.
