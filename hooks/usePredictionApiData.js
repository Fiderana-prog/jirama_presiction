"use client";

import { useEffect, useState } from "react";
import staticStep25Data from "../lib/step25Data";
import {
  getApiHealth,
  getLatestFeatureSnapshot,
  getLatestSnapshot,
  requestPrediction,
} from "../lib/predictionApi";

function mergeHistoricalSnapshot(snapshot) {
  if (!snapshot?.zones?.length) return staticStep25Data;
  return {
    ...staticStep25Data,
    snapshotTime: snapshot.snapshotTime || staticStep25Data.snapshotTime,
    snapshotLabel: snapshot.snapshotLabel || staticStep25Data.snapshotLabel,
    rowCount: snapshot.rowCount || staticStep25Data.rowCount,
    provinces: snapshot.zones,
    predictionSource: "NOTEBOOK25_HISTORICAL_OUTPUT",
    realtime: false,
  };
}

function predictionZone(featureZone, prediction6h, prediction24h) {
  return {
    province: featureZone.province,
    risk6h: {
      model: prediction6h.model.name,
      score: prediction6h.risk.raw_score,
      percentile: prediction6h.risk.percentile,
      level: prediction6h.risk.level,
      status: prediction6h.model.status,
    },
    risk24h: {
      model: prediction24h.model.name,
      score: prediction24h.risk.raw_score,
      percentile: prediction24h.risk.percentile,
      level: prediction24h.risk.level,
      status: prediction24h.model.status,
    },
    planned: featureZone.planned,
  };
}

async function recomputeWithModels(featureSnapshot) {
  const zones = await Promise.all(
    featureSnapshot.zones.map(async (zone) => {
      const [prediction6h, prediction24h] = await Promise.all([
        requestPrediction("6h", zone.province, zone.features),
        requestPrediction("24h", zone.province, zone.features),
      ]);

      return predictionZone(zone, prediction6h, prediction24h);
    }),
  );

  return {
    ...staticStep25Data,
    snapshotTime: featureSnapshot.snapshotTime,
    snapshotLabel: featureSnapshot.snapshotLabel,
    rowCount: featureSnapshot.rowCount,
    provinces: zones,
    predictionSource: "MODEL_RECOMPUTED_HISTORICAL_REPLAY",
    featureCount: featureSnapshot.featureCount,
    realtime: Boolean(featureSnapshot.realtime),
  };
}

export default function usePredictionApiData() {
  const [data, setData] = useState({
    ...staticStep25Data,
    predictionSource: "STATIC_FALLBACK",
    realtime: false,
  });

  const [apiState, setApiState] = useState({
    connected: false,
    mode: "STATIC_FALLBACK",
    modelsReady: { "6h": false, "24h": false },
    featureBuilderReady: false,
    inferenceReady: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const health = await getApiHealth();
        if (cancelled) return;

        const modelsReady = health.models_ready || { "6h": false, "24h": false };
        const canInfer =
          health.mode === "MODEL_READY" &&
          health.feature_builder_ready === true &&
          modelsReady["6h"] &&
          modelsReady["24h"];

        if (canInfer) {
          try {
            const featureSnapshot = await getLatestFeatureSnapshot();
            const recomputed = await recomputeWithModels(featureSnapshot);
            if (cancelled) return;

            setData(recomputed);
            setApiState({
              connected: true,
              mode: "MODEL_READY",
              modelsReady,
              featureBuilderReady: true,
              inferenceReady: true,
              error: null,
            });
            return;
          } catch (predictionError) {
            const historical = await getLatestSnapshot();
            if (cancelled) return;

            setData(mergeHistoricalSnapshot(historical));
            setApiState({
              connected: true,
              mode: "MODEL_READY_PREDICTION_ERROR",
              modelsReady,
              featureBuilderReady: Boolean(health.feature_builder_ready),
              inferenceReady: false,
              error:
                predictionError instanceof Error
                  ? predictionError.message
                  : String(predictionError),
            });
            return;
          }
        }

        const historical = await getLatestSnapshot();
        if (cancelled) return;

        setData(mergeHistoricalSnapshot(historical));
        setApiState({
          connected: true,
          mode: health.mode || "HISTORICAL_REPLAY_ONLY",
          modelsReady,
          featureBuilderReady: Boolean(health.feature_builder_ready),
          inferenceReady: false,
          error: health.model_load_errors
            ? Object.values(health.model_load_errors).filter(Boolean).join(" | ") || null
            : null,
        });
      } catch (error) {
        if (cancelled) return;
        setData({
          ...staticStep25Data,
          predictionSource: "STATIC_FALLBACK",
          realtime: false,
        });
        setApiState({
          connected: false,
          mode: "STATIC_FALLBACK",
          modelsReady: { "6h": false, "24h": false },
          featureBuilderReady: false,
          inferenceReady: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, apiState };
}
