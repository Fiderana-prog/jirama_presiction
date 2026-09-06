"use client";

import usePredictionApiData from "../hooks/usePredictionApiData";

const levelClasses = {
  CRITICAL: "bg-red-500/15 text-red-300 border-red-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  MODERATE: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  LOW: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

function fmt(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(digits);
}

function RiskBadge({ level }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${levelClasses[level] || "border-slate-600 bg-slate-700 text-slate-300"}`}>
      {level}
    </span>
  );
}

function ModelCard({ model, title }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">{title}</span>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{model.model}</h3>
          <p className="mt-1 text-xs text-slate-400">Complexité retenue : {model.complexity}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${model.status === "MVP_CANDIDATE" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
          {model.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-800/70 p-3">
          <span className="block text-xs text-slate-400">Forward moyen</span>
          <strong className="text-lg">{fmt(model.forwardMeanPercentile, 2)}e</strong>
        </div>
        <div className="rounded-xl bg-slate-800/70 p-3">
          <span className="block text-xs text-slate-400">Pire incident</span>
          <strong className="text-lg">{fmt(model.forwardWorstPercentile, 2)}e</strong>
        </div>
        <div className="rounded-xl bg-slate-800/70 p-3">
          <span className="block text-xs text-slate-400">Top 10 %</span>
          <strong className="text-lg">{fmt(model.top10Rate * 100, 1)} %</strong>
        </div>
        <div className="rounded-xl bg-slate-800/70 p-3">
          <span className="block text-xs text-slate-400">Incidents évalués</span>
          <strong className="text-lg">{model.incidentsEvaluated}</strong>
        </div>
      </div>
    </article>
  );
}

export default function PredictionsView({ onNavigateBack }) {
  const { data: step25Data, apiState } = usePredictionApiData();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Notebook 25 intégré</span>
          <h2 className="mt-1 text-2xl font-black">Résultats prédictifs du prototype</h2>
          <p className="mt-1 text-sm text-slate-300">
            {apiState.inferenceReady ? "Replay ML recalculé" : "Snapshot historique"} : {step25Data.snapshotLabel} • 6 zones de modélisation • {step25Data.rowCount.toLocaleString("fr-FR")} lignes horaires
          </p>
        </div>
        {onNavigateBack && (
          <button type="button" onClick={onNavigateBack} className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white hover:bg-orange-600">
            ← Dashboard
          </button>
        )}
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${apiState.connected ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100" : "border-slate-500/20 bg-slate-500/10 text-slate-200"}`}>
        <strong>API FastAPI :</strong>{" "}
        {apiState.connected
          ? apiState.inferenceReady
            ? "connectée — Feature Builder 47 variables actif. Le dashboard appelle réellement /predict/6h et /predict/24h pour les 6 zones."
            : apiState.mode === "MODEL_READY_PREDICTION_ERROR"
              ? `connectée, mais le recalcul par modèle a échoué : ${apiState.error || "erreur inconnue"}`
              : "connectée en mode historique — vérifiez le chargement des modèles .joblib et la version scikit-learn."
          : "indisponible — affichage de secours avec les données statiques du Notebook 25."}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        <strong>Interprétation :</strong> les valeurs sont des percentiles de risque relatifs. Un percentile de 90 signifie que le score est supérieur à environ 90 % des heures historiques de la même zone. Ce n'est pas une probabilité de coupure.
      </div>

      {apiState.inferenceReady && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          <strong>Source du calcul :</strong> les 47 variables sont reconstruites par FastAPI à partir du replay 2024, puis envoyées aux vrais bundles PU 6h et 24h. Ce calcul est dynamique, mais la source de données reste historique tant qu'un flux opérationnel JIRAMA n'est pas branché.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Horizon 1h</span>
          <h3 className="mt-2 text-xl font-black">Indisponible</h3>
          <p className="mt-2 text-sm text-slate-400">Données locales insuffisantes pour entraîner et valider un modèle 1h crédible.</p>
          <span className="mt-4 inline-flex rounded-full bg-slate-700 px-3 py-1 text-xs font-black text-slate-200">INSUFFICIENT_LOCAL_DATA</span>
        </article>
        <ModelCard title="Horizon 6h" model={step25Data.model6h} />
        <ModelCard title="Horizon 24h" model={step25Data.model24h} />
      </div>

      <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 text-white shadow-xl">
        <div className="border-b border-white/10 p-5">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Snapshot par zone</span>
          <h3 className="mt-1 text-xl font-black">Risques 6h et 24h</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Zone</th>
                <th className="px-5 py-3">6h percentile</th>
                <th className="px-5 py-3">6h niveau</th>
                <th className="px-5 py-3">24h percentile</th>
                <th className="px-5 py-3">24h niveau</th>
                <th className="px-5 py-3">Planifiée connue 24h</th>
              </tr>
            </thead>
            <tbody>
              {step25Data.provinces.map((zone) => (
                <tr key={zone.province} className="border-t border-white/5">
                  <td className="px-5 py-4 font-black">{zone.province}</td>
                  <td className="px-5 py-4">{fmt(zone.risk6h.percentile)}e</td>
                  <td className="px-5 py-4"><RiskBadge level={zone.risk6h.level} /></td>
                  <td className="px-5 py-4">{fmt(zone.risk24h.percentile)}e</td>
                  <td className="px-5 py-4"><RiskBadge level={zone.risk24h.level} /></td>
                  <td className="px-5 py-4">{zone.planned.next24h ? "Oui" : "Non"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
          <h3 className="font-black">Forward Chaining — 6h</h3>
          <img className="mt-4 w-full rounded-xl border border-white/10" src="/model-results/02_forward_comparison_6h.png" alt="Comparaison Forward Chaining 6h" />
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
          <h3 className="font-black">Forward Chaining — 24h</h3>
          <img className="mt-4 w-full rounded-xl border border-white/10" src="/model-results/02_forward_comparison_24h.png" alt="Comparaison Forward Chaining 24h" />
        </article>
      </div>
    </section>
  );
}
