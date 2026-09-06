from __future__ import annotations

from pathlib import Path
from typing import Any, Literal
import json
import os

import joblib
import numpy as np
import pandas as pd
import sklearn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .feature_builder import MODEL_FEATURES, build_features

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

DEPLOY_CONFIG_PATH = DATA_DIR / "selected_model_config.json"
HISTORY_PATH = DATA_DIR / "05_api_ready_risk_view.csv"
REFERENCE_PATH = DATA_DIR / "score_reference_quantiles.csv"
FEATURE_INPUT_PATH = DATA_DIR / "historical_feature_inputs_2024.csv"
ZONE_PROFILE_PATH = DATA_DIR / "zone_year_profiles_2024.csv"

MODEL_PATHS = {
    "6h": MODEL_DIR / "selected_model_6h.joblib",
    "24h": MODEL_DIR / "selected_model_24h.joblib",
}

with DEPLOY_CONFIG_PATH.open("r", encoding="utf-8") as fh:
    CONFIG = json.load(fh)

REQUIRED_SKLEARN = str(CONFIG.get("scikit_learn_version_required", "1.6.1"))
RUNTIME_SKLEARN = sklearn.__version__

HISTORY = pd.read_csv(HISTORY_PATH, parse_dates=["prediction_time"])
HISTORY["Province"] = HISTORY["Province"].astype(str).str.upper()

REFERENCE = pd.read_csv(REFERENCE_PATH)
REFERENCE["Province"] = REFERENCE["Province"].astype(str).str.upper()
REFERENCE["horizon"] = REFERENCE["horizon"].astype(str)

FEATURE_INPUTS = pd.read_csv(FEATURE_INPUT_PATH, parse_dates=["prediction_time"])
FEATURE_INPUTS["Province"] = FEATURE_INPUTS["Province"].astype(str).str.upper()

ZONE_PROFILES = pd.read_csv(ZONE_PROFILE_PATH)
ZONE_PROFILES["zone"] = ZONE_PROFILES["zone"].astype(str).str.upper()
ZONE_PROFILES["year"] = pd.to_numeric(ZONE_PROFILES["year"], errors="coerce").astype("Int64")

BUNDLES: dict[str, Any | None] = {"6h": None, "24h": None}
LOAD_ERRORS: dict[str, str | None] = {"6h": None, "24h": None}

# Model persistence with joblib is sensitive to sklearn versions.
# Refuse to pretend the model is ready if the runtime version is not the one
# used to create the deployment package.
if RUNTIME_SKLEARN != REQUIRED_SKLEARN:
    for horizon in ("6h", "24h"):
        LOAD_ERRORS[horizon] = (
            f"Version scikit-learn incompatible: runtime={RUNTIME_SKLEARN}, "
            f"requise={REQUIRED_SKLEARN}. Lancez pip install -r backend/requirements.txt."
        )
else:
    for horizon, path in MODEL_PATHS.items():
        if not path.exists():
            LOAD_ERRORS[horizon] = f"Fichier absent: {path.name}"
            continue
        try:
            BUNDLES[horizon] = joblib.load(path)
        except Exception as exc:
            LOAD_ERRORS[horizon] = f"Échec du chargement: {exc}"

API_ROOT_PATH = os.getenv("API_ROOT_PATH", "").rstrip("/")

app = FastAPI(
    title="JIRAMA Predictive API",
    version="1.0.0",
    root_path=API_ROOT_PATH,
    description=(
        "API du prototype académique JIRAMA. Les modèles 6h et 24h sont ceux "
        "sélectionnés par le Notebook 25. Les sorties sont des scores de risque "
        "relatifs / percentiles, pas des probabilités calibrées."
    ),
)

_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://jirama-predictive.onrender.com",
]
_extra_cors = os.getenv("CORS_ORIGINS", "").strip()
if _extra_cors:
    _cors_origins.extend([origin.strip() for origin in _extra_cors.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Autorise aussi un frontend Render dont le sous-domaine peut varier.
    allow_origin_regex=r"https://[a-zA-Z0-9-]+\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    province: str = Field(..., examples=["ANTANANARIVO"])
    features: dict[str, Any]


class RawFeatureRequest(BaseModel):
    province: str = Field(..., examples=["ANTANANARIVO"])
    timestamp: str = Field(..., examples=["2024-12-31T23:00:00"])

    hydro_mw: float
    hfo_mw: float
    go_mw: float
    solar_mw: float
    hybrid_mw: float
    demand_mw: float

    demand_pred_1h: float
    demand_pred_6h: float
    demand_pred_24h: float
    generation_pred_1h: float
    generation_pred_6h: float
    generation_pred_24h: float

    planned_known_now: int = 0
    planned_known_next_1h: int = 0
    planned_known_next_6h: int = 0
    planned_known_next_24h: int = 0
    hours_to_next_known_planned_outage: float | None = None


def _json_safe_features(features: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for name, value in features.items():
        if value is None or pd.isna(value):
            result[name] = None
        elif isinstance(value, (np.integer, int)):
            result[name] = int(value)
        else:
            result[name] = float(value)
    return result


def _zone_profile(province: str, year: int) -> tuple[dict[str, Any], int, bool]:
    province = province.upper().strip()
    rows = ZONE_PROFILES.loc[ZONE_PROFILES["zone"].eq(province)].copy()
    if rows.empty:
        raise ValueError(f"Aucun profil énergétique disponible pour {province}")

    exact = rows.loc[rows["year"].eq(year)]
    if not exact.empty:
        row = exact.iloc[-1]
        return row.to_dict(), int(row["year"]), False

    rows = rows.dropna(subset=["year"]).sort_values("year")
    row = rows.iloc[-1]
    return row.to_dict(), int(row["year"]), True


def _raw_from_history_row(row: pd.Series) -> dict[str, Any]:
    hours_to = row.get("hours_to_next_known_planned_outage")
    return {
        "province": str(row["Province"]),
        "timestamp": pd.Timestamp(row["prediction_time"]).isoformat(),
        "hydro_mw": float(row["hydro_mw"]),
        "hfo_mw": float(row["hfo_mw"]),
        "go_mw": float(row["go_mw"]),
        "solar_mw": float(row["solar_mw"]),
        "hybrid_mw": float(row["hybrid_mw"]),
        "demand_mw": float(row["demand_mw"]),
        "demand_pred_1h": float(row["demand_pred_1h"]),
        "demand_pred_6h": float(row["demand_pred_6h"]),
        "demand_pred_24h": float(row["demand_pred_24h"]),
        "generation_pred_1h": float(row["generation_pred_1h"]),
        "generation_pred_6h": float(row["generation_pred_6h"]),
        "generation_pred_24h": float(row["generation_pred_24h"]),
        "planned_known_now": int(row["planned_known_now"]),
        "planned_known_next_1h": int(row["planned_known_next_1h"]),
        "planned_known_next_6h": int(row["planned_known_next_6h"]),
        "planned_known_next_24h": int(row["planned_known_next_24h"]),
        "hours_to_next_known_planned_outage": (
            None if pd.isna(hours_to) else float(hours_to)
        ),
    }


def _build_from_raw(raw: dict[str, Any]) -> tuple[dict[str, float], dict[str, Any]]:
    province = str(raw["province"]).upper().strip()
    timestamp = pd.Timestamp(raw["timestamp"])
    profile, profile_year, fallback = _zone_profile(province, int(timestamp.year))
    normalized = dict(raw)
    normalized["province"] = province
    normalized["timestamp"] = timestamp
    features = build_features(normalized, zone_profile=profile)
    meta = {
        "province": province,
        "timestamp": timestamp.isoformat(),
        "feature_count": len(features),
        "profile_year_used": profile_year,
        "profile_fallback": fallback,
        "feature_semantics": "MATCHES_NOTEBOOK24_47_FEATURES",
    }
    return features, meta


def _model_list(bundle: Any) -> list[Any]:
    if isinstance(bundle, dict):
        for key in ("models", "bagged_models", "estimators"):
            value = bundle.get(key)
            if isinstance(value, (list, tuple)) and value:
                return list(value)
    raise ValueError("Le bundle ne contient pas la liste des modèles PU baggés attendue.")


def _expected_features(bundle: Any) -> list[str]:
    if not isinstance(bundle, dict):
        raise ValueError("Format de bundle inattendu.")
    features = bundle.get("features") or bundle.get("feature_names")
    if not features:
        raise ValueError("Le bundle ne contient pas la liste des variables attendues.")
    return list(features)


def _score_bundle(bundle: Any, features: dict[str, Any]) -> float:
    expected = _expected_features(bundle)
    missing = [name for name in expected if name not in features]
    if missing:
        preview = ", ".join(missing[:12])
        suffix = "…" if len(missing) > 12 else ""
        raise ValueError(f"{len(missing)} variable(s) manquante(s): {preview}{suffix}")

    row = pd.DataFrame([{name: features[name] for name in expected}])
    preprocessor = bundle.get("preprocessor") if isinstance(bundle, dict) else None
    X = preprocessor.transform(row[expected]) if preprocessor is not None else row[expected]

    scores = np.column_stack(
        [estimator.predict_proba(X)[:, 1] for estimator in _model_list(bundle)]
    )
    return float(scores.mean(axis=1)[0])


def _risk_level(percentile: float) -> str:
    if percentile >= 99:
        return "CRITICAL"
    if percentile >= 95:
        return "HIGH"
    if percentile >= 80:
        return "MODERATE"
    return "LOW"


def _score_to_percentile(
    province: str,
    horizon: Literal["6h", "24h"],
    score: float,
) -> float:
    reference = REFERENCE[
        REFERENCE["Province"].eq(province)
        & REFERENCE["horizon"].eq(horizon)
    ].sort_values("score_value")

    if reference.empty:
        raise ValueError(f"Aucune référence de percentile pour {province} / {horizon}")

    x = reference["score_value"].to_numpy(dtype=float)
    y = reference["percentile"].to_numpy(dtype=float)

    return float(
        np.interp(
            score,
            x,
            y,
            left=y[0],
            right=y[-1],
        )
    )


def _zone_payload(row: pd.Series) -> dict[str, Any]:
    return {
        "province": str(row["Province"]),
        "risk6h": {
            "model": str(row["selected_model_6h"]),
            "score": float(row["selected_risk_score_6h"]),
            "percentile": float(row["selected_risk_percentile_6h"]),
            "level": str(row["selected_risk_level_6h"]),
            "status": str(row["selected_model_status_6h"]),
        },
        "risk24h": {
            "model": str(row["selected_model_24h"]),
            "score": float(row["selected_risk_score_24h"]),
            "percentile": float(row["selected_risk_percentile_24h"]),
            "level": str(row["selected_risk_level_24h"]),
            "status": str(row["selected_model_status_24h"]),
        },
        "planned": {
            "now": int(row["planned_known_now"]),
            "next1h": int(row["planned_known_next_1h"]),
            "next6h": int(row["planned_known_next_6h"]),
            "next24h": int(row["planned_known_next_24h"]),
        },
    }


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "service": "JIRAMA Predictive API",
        "docs": "/docs",
        "health": "/health",
        "score_semantics": "RISK_RANKING_SCORE_NOT_PROBABILITY",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    model_ready = {h: BUNDLES[h] is not None for h in ("6h", "24h")}
    all_ready = all(model_ready.values())
    return {
        "status": "ok",
        "mode": "MODEL_READY" if all_ready else "MODEL_RUNTIME_ERROR",
        "models_ready": model_ready,
        "model_load_errors": LOAD_ERRORS,
        "scikit_learn_runtime": RUNTIME_SKLEARN,
        "scikit_learn_required": REQUIRED_SKLEARN,
        "history_rows": int(len(HISTORY)),
        "quantile_reference_rows": int(len(REFERENCE)),
        "feature_input_rows": int(len(FEATURE_INPUTS)),
        "feature_builder_ready": True,
        "model_feature_count": len(MODEL_FEATURES),
        "production_ready": bool(CONFIG.get("production_ready", False)),
        "score_semantics": "RISK_RANKING_SCORE_NOT_PROBABILITY",
    }


@app.get("/models")
def models() -> dict[str, Any]:
    result: dict[str, Any] = {
        "version": CONFIG.get("version"),
        "1h": CONFIG.get("1h", {"status": "INSUFFICIENT_LOCAL_DATA"}),
    }
    for horizon in ("6h", "24h"):
        cfg = dict(CONFIG.get(horizon, {}))
        cfg["loaded"] = BUNDLES[horizon] is not None
        cfg["load_error"] = LOAD_ERRORS[horizon]
        if BUNDLES[horizon] is not None:
            cfg["features"] = _expected_features(BUNDLES[horizon])
            cfg["feature_count"] = len(cfg["features"])
            cfg["bagged_model_count"] = len(_model_list(BUNDLES[horizon]))
        result[horizon] = cfg
    return result


@app.get("/models/{horizon}/template")
def model_template(horizon: Literal["6h", "24h"]) -> dict[str, Any]:
    bundle = BUNDLES[horizon]
    if bundle is None:
        raise HTTPException(status_code=503, detail=LOAD_ERRORS[horizon])
    features = _expected_features(bundle)
    return {
        "horizon": horizon,
        "province": "ANTANANARIVO",
        "feature_count": len(features),
        "features": features,
        "request_template": {
            "province": "ANTANANARIVO",
            "features": {name: None for name in features},
        },
        "note": (
            "Les valeurs nulles servent uniquement de gabarit. Pour une vraie prédiction, "
            "fournissez les 47 valeurs construites avec la même logique que l'entraînement."
        ),
    }


@app.post("/features/build")
def features_build(request: RawFeatureRequest) -> dict[str, Any]:
    try:
        raw = request.model_dump()
        features, meta = _build_from_raw(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        **meta,
        "features": _json_safe_features(features),
        "note": (
            "Ces 47 variables reproduisent la structure utilisée par le Notebook 24. "
            "Les parts du mix énergétique proviennent du profil annuel de la zone."
        ),
    }


@app.get("/features/latest")
def features_latest() -> dict[str, Any]:
    latest = FEATURE_INPUTS["prediction_time"].max()
    snapshot = FEATURE_INPUTS.loc[
        FEATURE_INPUTS["prediction_time"].eq(latest)
    ].sort_values("Province")

    zones = []
    for _, row in snapshot.iterrows():
        raw = _raw_from_history_row(row)
        features, meta = _build_from_raw(raw)
        zones.append({
            **meta,
            "features": _json_safe_features(features),
            "planned": {
                "now": raw["planned_known_now"],
                "next1h": raw["planned_known_next_1h"],
                "next6h": raw["planned_known_next_6h"],
                "next24h": raw["planned_known_next_24h"],
                "hoursToNextKnown": raw["hours_to_next_known_planned_outage"],
            },
        })

    return {
        "snapshotTime": pd.Timestamp(latest).isoformat(),
        "snapshotLabel": pd.Timestamp(latest).strftime("%d/%m/%Y %H:%M"),
        "rowCount": int(len(FEATURE_INPUTS)),
        "featureCount": len(MODEL_FEATURES),
        "zones": zones,
        "source": "REBUILT_2024_FEATURE_INPUTS_MATCHING_NOTEBOOK24",
        "realtime": False,
        "note": (
            "Replay historique 2024 : les 47 features sont reconstruites puis envoyées "
            "aux vrais modèles .joblib. Ce n'est pas encore un flux JIRAMA temps réel."
        ),
    }


@app.get("/features/{province}")
def features_province(province: str, timestamp: str | None = None) -> dict[str, Any]:
    province = province.upper().strip()
    rows = FEATURE_INPUTS.loc[FEATURE_INPUTS["Province"].eq(province)].copy()
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Province inconnue: {province}")

    if timestamp is None:
        row = rows.sort_values("prediction_time").iloc[-1]
    else:
        target = pd.Timestamp(timestamp)
        exact = rows.loc[rows["prediction_time"].eq(target)]
        if exact.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Aucune observation pour {province} à {target}",
            )
        row = exact.iloc[0]

    raw = _raw_from_history_row(row)
    features, meta = _build_from_raw(raw)
    return {
        **meta,
        "raw": raw,
        "features": _json_safe_features(features),
    }


@app.get("/historical/latest")
def historical_latest() -> dict[str, Any]:
    latest = HISTORY["prediction_time"].max()
    snapshot = HISTORY.loc[HISTORY["prediction_time"] == latest].copy()
    snapshot = snapshot.sort_values("Province")
    return {
        "snapshotTime": latest.isoformat(sep=" "),
        "snapshotLabel": latest.strftime("%d/%m/%Y %H:%M"),
        "rowCount": int(len(HISTORY)),
        "zones": [_zone_payload(row) for _, row in snapshot.iterrows()],
        "source": "NOTEBOOK25_HISTORICAL_API_READY_VIEW",
    }


@app.get("/historical/{province}")
def historical_province(province: str, limit: int = 168) -> dict[str, Any]:
    province = province.upper().strip()
    rows = HISTORY.loc[HISTORY["Province"] == province].sort_values("prediction_time").tail(max(1, min(limit, 1000)))
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Province inconnue: {province}")
    return {
        "province": province,
        "rows": [
            {
                "prediction_time": row["prediction_time"].isoformat(sep=" "),
                **_zone_payload(row),
            }
            for _, row in rows.iterrows()
        ],
    }


@app.post("/predict/{horizon}")
def predict(horizon: Literal["6h", "24h"], request: PredictionRequest) -> dict[str, Any]:
    bundle = BUNDLES[horizon]
    if bundle is None:
        raise HTTPException(status_code=503, detail=LOAD_ERRORS[horizon])

    province = request.province.upper().strip()
    known = set(REFERENCE["Province"].dropna().unique())
    if province not in known:
        raise HTTPException(status_code=400, detail=f"Province non supportée: {province}")

    try:
        score = _score_bundle(bundle, request.features)
        percentile = _score_to_percentile(province, horizon, score)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction: {exc}") from exc

    cfg = CONFIG[horizon]
    return {
        "province": province,
        "horizon": horizon,
        "risk": {
            "raw_score": score,
            "percentile": percentile,
            "level": _risk_level(percentile),
        },
        "model": {
            "name": cfg.get("model"),
            "status": cfg.get("status"),
            "version": CONFIG.get("version"),
            "bagged_models": len(_model_list(bundle)),
            "feature_count": len(_expected_features(bundle)),
        },
        "probability": None,
        "is_calibrated_probability": False,
        "score_semantics": cfg.get(
            "score_semantics",
            "RISK_RANKING_SCORE_NOT_PROBABILITY",
        ),
        "message": (
            "Le percentile est un classement historique. "
            "Ce résultat n'est pas une probabilité calibrée de coupure."
        ),
    }
