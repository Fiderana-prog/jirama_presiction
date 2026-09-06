# Déploiement JIRAMA Predictive sur Render

Ce dossier est prêt pour un déploiement Render en **2 Web Services Docker** :

- `jirama-predictive-api` : backend FastAPI + modèles IA
- `jirama-predictive` : frontend

Le fichier `render.yaml` décrit les deux services.

## 1. Tester une dernière fois en local

```bash
docker compose down
docker compose up -d --build
docker compose ps
```

Ouvrir ensuite :

- application : `http://localhost:8080`
- santé API via nginx : `http://localhost:8080/api/health`

## 2. Envoyer le projet vers GitHub

Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Prepare JIRAMA Predictive for Render"
git branch -M main
```

Créer ensuite un dépôt vide sur GitHub, puis :

```bash
git remote add origin https://github.com/VOTRE-UTILISATEUR/jirama-predictive.git
git push -u origin main
```

Si le dépôt Git existe déjà :

```bash
git add .
git commit -m "Prepare Render deployment"
git push
```

## 3. Créer les services avec Render Blueprint

1. Se connecter à Render.
2. Choisir **New +** puis **Blueprint**.
3. Connecter GitHub si nécessaire.
4. Sélectionner le dépôt `jirama-predictive`.
5. Render détecte `render.yaml`.
6. Render demandera les deux variables Supabase marquées `sync: false` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Recopier leurs valeurs depuis votre fichier local `.dev.vars`.
7. Vérifier les deux services puis lancer le déploiement.

Render construit les Dockerfiles automatiquement.

## 4. Vérifier d'abord le backend

Quand `jirama-predictive-api` est déployé, ouvrir :

`https://jirama-predictive-api.onrender.com/health`

Le JSON doit notamment indiquer :

- `status: ok`
- `mode: MODEL_READY`
- modèles 6 h et 24 h prêts
- Feature Builder prêt

## 5. Vérifier l'URL exacte du backend

Le fichier `render.yaml` suppose l'URL :

`https://jirama-predictive-api.onrender.com`

Si Render attribue une autre URL, ouvrir le service frontend > **Environment** et remplacer :

`NEXT_PUBLIC_PREDICTION_API_URL`

par l'URL réelle du backend, sans slash final.

Puis faire **Manual Deploy > Deploy latest commit** sur le frontend. Cette variable est utilisée pendant le build Docker.

## 6. Vérifier le frontend

Ouvrir :

`https://jirama-predictive.onrender.com`

Si Render attribue un autre nom au frontend, ce n'est pas grave : le backend accepte les sous-domaines `*.onrender.com` via CORS.

## 7. Tests essentiels après déploiement

Dans le dashboard :

- la page doit s'afficher avec les images ;
- FastAPI doit apparaître connecté ;
- les risques 6 h et 24 h doivent être calculés ;
- la carte doit s'afficher ;
- aucune erreur CORS ne doit apparaître dans la console du navigateur.

Tester directement :

- `/health` sur le backend
- `/docs` sur le backend pour Swagger

## 8. Si le build échoue

Lire **Render > Service > Logs** et conserver les dernières lignes de l'erreur.

Erreurs courantes :

- `No open ports detected` : vérifier que le serveur utilise `$PORT` ; c'est déjà prévu dans cette version.
- modèle introuvable : vérifier que `backend/models/` est bien présent dans GitHub.
- CSV introuvable : vérifier que `backend/data/` est bien présent dans GitHub.
- erreur CORS : vérifier l'URL du frontend dans `CORS_ORIGINS` ou le domaine `onrender.com`.
- frontend sans prédictions : vérifier `NEXT_PUBLIC_PREDICTION_API_URL` puis redéployer le frontend.

## Important

Le fichier `.dev.vars` est maintenant ignoré par Git. Ne le forcez pas avec `git add -f`. Les valeurs Supabase doivent être renseignées dans Render pendant la création du Blueprint. Ne publiez jamais une clé `service_role` Supabase ou un autre secret serveur.
