# Correction `step25Data is not defined`

L'erreur venait du composant `RiskDistribution` dans `app/dashboard/page.jsx`.

`step25Data` est créé dans `DashboardPage` par :

```jsx
const { data: step25Data, apiState } = usePredictionApiData();
```

Cette variable n'existe donc que dans la portée de `DashboardPage`.
Le composant `RiskDistribution`, défini en dehors de `DashboardPage`, essayait pourtant
d'utiliser directement `step25Data`.

La correction consiste à lui passer les données en propriété :

```jsx
function RiskDistribution({ horizon, data }) {
  const items = data?.riskDistribution?.[horizon] || {};
}
```

puis :

```jsx
<RiskDistribution horizon="24h" data={step25Data} />
```

Les dépendances `useMemo` ont aussi été corrigées pour que les cartes se recalculent lorsque
les données FastAPI remplacent le fallback statique.

## Relancer

Arrêter Vite avec `Ctrl+C`, puis :

```bash
npm run dev
```

Si le cache HMR garde l'ancienne erreur :

```bash
rm -rf node_modules/.vite .vite
npm run dev
```
