"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import "./dashboard.css";
import PredictionsView from "../../components/PredictionsView";
import usePredictionApiData from "../../hooks/usePredictionApiData";

const MadagascarLeafletMap = dynamic(
  () => import("../../components/MadagascarLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] w-full items-center justify-center rounded-2xl bg-slate-900 text-sm text-slate-300">
        Chargement de la carte…
      </div>
    ),
  },
);

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "map", label: "Carte", icon: "map" },
  { id: "predictions", label: "Prédictions", icon: "pulse" },
  { id: "models", label: "Modèles IA", icon: "chart" },
  { id: "alerts", label: "Alertes", icon: "warning" },
];

const levelStyles = {
  CRITICAL: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30" },
  HIGH: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30" },
  MODERATE: { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/30" },
  LOW: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
};

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    grid: <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    map: <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></svg>,
    pulse: <svg {...common}><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>,
    warning: <svg {...common}><path d="M10.3 3.8 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>,
    chart: <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /></svg>,
    bell: <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>,
    user: <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
    pin: <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
    logout: <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  };

  return icons[name] ?? null;
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="JIRAMA Predictive">
      <img src="https://i.ibb.co/VWNN1s6Y/image.png" alt="JIRAMA Predictive Logo" />
    </div>
  );
}

function fmt(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(digits);
}

function RiskBadge({ level }) {
  const style = levelStyles[level] || levelStyles.LOW;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${style.bg} ${style.text} ${style.border}`}>
      {level}
    </span>
  );
}

function SnapshotCard({ title, risk, subtitle }) {
  const style = levelStyles[risk.level] || levelStyles.LOW;
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">{title}</span>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <strong className="block text-4xl font-black">{fmt(risk.percentile)}e</strong>
          <span className="text-xs text-slate-400">percentile historique</span>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${style.bg} ${style.text} ${style.border}`}>{risk.level}</span>
      </div>
      <p className="mt-4 text-xs text-slate-400">{subtitle}</p>
    </article>
  );
}

function RiskDistribution({ horizon, data }) {
  const items = data?.riskDistribution?.[horizon] || {};
  const order = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

  return (
    <div className="space-y-3">
      {order.map((level) => {
        const item = items[level] || { share: 0 };
        return (
          <div key={level}>
            <div className="mb-1 flex justify-between text-xs text-slate-300">
              <span>{level}</span>
              <strong>{fmt(item.share)} %</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div className={`h-full ${level === "LOW" ? "bg-emerald-500" : level === "MODERATE" ? "bg-yellow-500" : level === "HIGH" ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${item.share}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModelEvaluationCard({ model, horizon }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Modèle {horizon}</span>
          <h3 className="mt-1 text-xl font-black">{model.model}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${model.status === "MVP_CANDIDATE" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
          {model.status}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-800/70 p-3"><span className="block text-xs text-slate-400">Forward moyen</span><strong className="text-lg">{fmt(model.forwardMeanPercentile, 2)}e</strong></div>
        <div className="rounded-xl bg-slate-800/70 p-3"><span className="block text-xs text-slate-400">Pire incident</span><strong className="text-lg">{fmt(model.forwardWorstPercentile, 2)}e</strong></div>
        <div className="rounded-xl bg-slate-800/70 p-3"><span className="block text-xs text-slate-400">Top 10 %</span><strong className="text-lg">{fmt(model.top10Rate * 100)} %</strong></div>
        <div className="rounded-xl bg-slate-800/70 p-3"><span className="block text-xs text-slate-400">Incidents évalués</span><strong className="text-lg">{model.incidentsEvaluated}</strong></div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const { data: step25Data, apiState } = usePredictionApiData();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [province, setProvince] = useState("ALL");

  const selectedZone = useMemo(() => {
    if (province === "ALL") return null;
    return step25Data.provinces.find((zone) => zone.province === province) || null;
  }, [province, step25Data.provinces]);

  const max6h = useMemo(
    () => [...step25Data.provinces].sort(
      (a, b) => b.risk6h.percentile - a.risk6h.percentile
    )[0],
    [step25Data.provinces],
  );

  const max24h = useMemo(
    () => [...step25Data.provinces].sort(
      (a, b) => b.risk24h.percentile - a.risk24h.percentile
    )[0],
    [step25Data.provinces],
  );

  const risk6h = selectedZone?.risk6h || max6h.risk6h;
  const risk24h = selectedZone?.risk24h || max24h.risk24h;
  const zoneLabel6h = selectedZone ? selectedZone.province : `maximum snapshot : ${max6h.province}`;
  const zoneLabel24h = selectedZone ? selectedZone.province : `maximum snapshot : ${max24h.province}`;

  const alertZones = step25Data.provinces.filter((zone) => ["MODERATE", "HIGH", "CRITICAL"].includes(zone.risk24h.level));
  const activeLabel = tabs.find((item) => item.id === activeTab)?.label ?? "Dashboard";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="dashboard-shell"
    >
      <div className="background-overlay" />

      <header className="topbar">
        <a href="/"><BrandMark /></a>
        <nav className="main-nav" aria-label="Navigation principale">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="account-tools">
          <button type="button" className="icon-button" aria-label="Notifications" onClick={() => setActiveTab("alerts")}>
            <Icon name="bell" size={28} />
            <span className="notification-count">{alertZones.length}</span>
          </button>
          <div className="profile-menu-container">
            <button type="button" className="profile-button" aria-label="Profil utilisateur"><Icon name="user" size={28} /></button>
            <div className="profile-dropdown">
              <a href="/" className="dropdown-item"><Icon name="logout" size={18} /> Déconnexion</a>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-heading">
          <div>
            <span className="eyebrow">JIRAMA PREDICTIVE • NOTEBOOK 25</span>
            <h1>{activeLabel}</h1>
            <p>Résultats du prototype Madagascar • {apiState.inferenceReady ? "recalcul ML via FastAPI" : "snapshot historique"} {step25Data.snapshotLabel}.</p>
          </div>
          <div className="heading-actions">
            <label className="region-select">
              <Icon name="pin" size={19} />
              <select value={province} onChange={(event) => setProvince(event.target.value)}>
                <option value="ALL">Toutes les zones modèle</option>
                {step25Data.provinces.map((zone) => (
                  <option key={zone.province} value={zone.province}>{zone.province}</option>
                ))}
              </select>
            </label>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white">
              Version {step25Data.modelVersion}
            </span>
          </div>
        </section>

        {activeTab === "dashboard" && (
          <section className="space-y-6">
            <div className={`rounded-2xl border p-4 text-sm shadow-xl ${apiState.connected ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100" : "border-slate-500/25 bg-slate-500/10 text-slate-200"}`}>
              <strong>FastAPI :</strong>{" "}
              {apiState.connected
                ? apiState.inferenceReady
                  ? "connectée ; Feature Builder 47 variables actif ; /predict/6h et /predict/24h sont appelés pour recalculer les 6 zones."
                  : apiState.mode === "MODEL_READY_PREDICTION_ERROR"
                    ? `connectée, mais le recalcul ML a échoué : ${apiState.error || "erreur inconnue"}`
                    : "connectée au snapshot historique ; vérifiez les modèles .joblib et scikit-learn 1.6.1."
                : "non joignable, les données statiques locales sont utilisées en secours."}
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100 shadow-xl">
              <strong>Important :</strong> les valeurs affichées sont des percentiles de risque relatifs, pas des probabilités de coupure. {apiState.inferenceReady ? "Elles sont recalculées par les vrais modèles à partir des 47 variables du replay 2024." : "Les données affichées proviennent du snapshot historique."} Ce n'est pas encore un flux JIRAMA temps réel.
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <SnapshotCard title="Risque 24h" risk={risk24h} subtitle={`${zoneLabel24h} • Random Forest • MVP_CANDIDATE`} />
              <SnapshotCard title="Risque 6h" risk={risk6h} subtitle={`${zoneLabel6h} • HistGradientBoosting • EXPERIMENTAL`} />

              <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Horizon 1h</span>
                <strong className="mt-3 block text-3xl font-black">Indisponible</strong>
                <p className="mt-2 text-xs text-slate-400">Données locales insuffisantes pour un modèle 1h crédible.</p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Qualité étape 25</span>
                <strong className="mt-3 block text-4xl font-black">{step25Data.qualityChecksPassed}/{step25Data.qualityChecksTotal}</strong>
                <p className="mt-2 text-xs text-slate-400">Contrôles PASS • {step25Data.plotCount} visualisations enregistrées</p>
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div>
                <MadagascarLeafletMap data={step25Data.provinces} />
              </div>

              <div className="space-y-5">
                <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Historique 24h</span>
                  <h2 className="mt-1 text-xl font-black">Répartition des niveaux</h2>
                  <div className="mt-5"><RiskDistribution horizon="24h" data={step25Data} /></div>
                </article>

                <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">État du snapshot</span>
                  <h2 className="mt-1 text-xl font-black">Alertes de risque</h2>
                  {alertZones.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                      Aucune zone n'atteint MODERATE, HIGH ou CRITICAL sur le snapshot {step25Data.snapshotLabel}.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {alertZones.map((zone) => (
                        <div key={zone.province} className="flex items-center justify-between rounded-xl bg-slate-800/70 p-3 text-sm">
                          <strong>{zone.province}</strong>
                          <RiskBadge level={zone.risk24h.level} />
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            </div>
          </section>
        )}

        {activeTab === "map" && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Vue géographique</span>
              <h2 className="mt-1 text-2xl font-black">6 zones de modélisation Madagascar</h2>
              <p className="mt-2 text-sm text-slate-400">Les régions administratives servent uniquement de fond géographique. Les couleurs de risque sont attachées aux 6 zones du modèle.</p>
            </div>
            <MadagascarLeafletMap data={step25Data.provinces} />
          </section>
        )}

        {activeTab === "predictions" && (
          <PredictionsView onNavigateBack={() => setActiveTab("dashboard")} />
        )}

        {activeTab === "models" && (
          <section className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Modèle 1h</span>
                <h3 className="mt-2 text-xl font-black">Non retenu</h3>
                <p className="mt-2 text-sm text-slate-400">INSUFFICIENT_LOCAL_DATA</p>
              </article>
              <ModelEvaluationCard model={step25Data.model6h} horizon="6h" />
              <ModelEvaluationCard model={step25Data.model24h} horizon="24h" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {[
                ["/model-results/01_model_ranking_6h.png", "Classement des modèles — 6h"],
                ["/model-results/01_model_ranking_24h.png", "Classement des modèles — 24h"],
                ["/model-results/02_forward_comparison_6h.png", "Forward Chaining — 6h"],
                ["/model-results/02_forward_comparison_24h.png", "Forward Chaining — 24h"],
                ["/model-results/03_training_curve_selected_6h.png", "Courbe d'entraînement retenue — 6h"],
                ["/model-results/03_training_curve_selected_24h.png", "Courbe d'entraînement retenue — 24h"],
              ].map(([src, title]) => (
                <article key={src} className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-white shadow-xl">
                  <h3 className="font-black">{title}</h3>
                  <img className="mt-4 w-full rounded-xl border border-white/10 bg-white" src={src} alt={title} />
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-sm text-slate-300 shadow-xl">
              <strong className="text-white">Méthode :</strong> {step25Data.method} • Scores non calibrés • ready_for_api_prototype = {String(step25Data.readyForApiPrototype)} • production_ready = {String(step25Data.productionReady)}.
            </div>
          </section>
        )}

        {activeTab === "alerts" && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-white shadow-xl">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">Alertes dérivées du snapshot</span>
            <h2 className="mt-1 text-2xl font-black">Niveaux MODERATE / HIGH / CRITICAL</h2>
            <p className="mt-2 text-sm text-slate-400">Snapshot historique : {step25Data.snapshotLabel}.</p>

            {alertZones.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-emerald-100">
                <strong className="block text-lg">Aucune alerte élevée dans ce snapshot.</strong>
                <p className="mt-2 text-sm">Les six zones sont classées LOW à cet instant. Cela ne garantit pas l'absence de coupure : le système produit un classement relatif et les données locales restent limitées.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {alertZones.map((zone) => (
                  <article key={zone.province} className="rounded-xl border border-white/10 bg-slate-800/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{zone.province}</strong>
                      <RiskBadge level={zone.risk24h.level} />
                    </div>
                    <p className="mt-2 text-sm text-slate-400">24h : {fmt(zone.risk24h.percentile)}e percentile</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </motion.div>
  );
}
