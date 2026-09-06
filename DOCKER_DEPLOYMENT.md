# Déploiement Docker — JIRAMA Predictive

Cette version exécute trois conteneurs :

```text
Navigateur
   |
   v
Nginx :80
   |----------------------|
   v                      v
Frontend Vinext :3000     FastAPI :8000
                           |
                           +-- Feature Builder (47 variables)
                           +-- HGB 6h (.joblib)
                           +-- Random Forest 24h (.joblib)
                           +-- Quantiles Notebook 25
```

Le navigateur appelle l'API via **`/api` sur le même domaine**. Il ne dépend donc pas de
`localhost:8000` une fois déployé sur un serveur.

## 1. Prérequis

Installer Docker Engine et le plugin Docker Compose sur la machine de déploiement.

Vérification :

```bash
docker --version
docker compose version
```

## 2. Premier lancement local

À la racine du projet :

```bash
cp .env.docker.example .env
docker compose build
docker compose up -d
```

Suivre le démarrage :

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

Ouvrir :

```text
Dashboard : http://localhost:8080/dashboard
Accueil   : http://localhost:8080/
API health: http://localhost:8080/api/health
Swagger   : http://localhost:8080/api/docs
```

Le health doit contenir :

```json
"mode": "MODEL_READY",
"feature_builder_ready": true,
"model_feature_count": 47
```

## 3. Test automatique

```bash
bash scripts/docker-smoke-test.sh
```

Le script vérifie Nginx, `/api/health`, les 47 variables d'Antananarivo et le dashboard.

## 4. Arrêter / redémarrer

```bash
docker compose stop
docker compose start
```

Arrêt complet :

```bash
docker compose down
```

Après modification du code ou des modèles :

```bash
docker compose up -d --build
```

## 5. Déploiement sur un VPS Ubuntu

Copier le projet sur le VPS, puis créer `.env` :

```env
HTTP_PORT=80
```

Lancer :

```bash
docker compose up -d --build
```

Avec le pare-feu UFW :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

À ce stade l'application est accessible par l'IP publique du serveur.

## 6. HTTPS et nom de domaine

Pour une vraie mise en ligne, ajouter ensuite un nom de domaine et HTTPS. Le plus simple est
de placer un reverse proxy TLS (Caddy, Traefik ou Nginx + Certbot) devant cette stack. Ne pas
exposer directement les ports internes `3000` et `8000` à Internet : seul le gateway HTTP/HTTPS
doit être public.

## 7. Ce que Docker ne change pas

Le projet reste un prototype académique : `production_ready=false`. Les sorties 6h/24h sont
des **scores de risque relatifs convertis en percentiles**, pas des probabilités calibrées.
Le Feature Builder automatique utilise actuellement le replay historique 2024. Une exploitation
temps réel nécessitera de remplacer cette source par des flux opérationnels fiables.

## 8. Dépannage

### Port 8080 déjà utilisé

Modifier `.env` :

```env
HTTP_PORT=8081
```

Puis :

```bash
docker compose up -d
```

### Backend non sain

```bash
docker compose logs backend
```

Vérifier notamment que `scikit-learn runtime` et `required` valent tous les deux `1.6.1`.

### Rebuild propre

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```
