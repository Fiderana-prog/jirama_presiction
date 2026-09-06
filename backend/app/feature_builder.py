from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any
import math

import numpy as np
import pandas as pd

MODEL_FEATURES = [
    "hydro_mw", "hfo_mw", "go_mw", "solar_mw", "hybrid_mw",
    "generation_mw", "demand_mw",
    "hydro_share", "hfo_share", "go_share", "solar_share", "hybrid_share",
    "dispatchable_share", "renewable_share_proxy",
    "deficit_1h", "deficit_6h", "deficit_24h", "deficit_pred_max",
    "deficit_rate_1h", "deficit_rate_6h", "deficit_rate_24h",
    "demand_pred_1h", "demand_pred_6h", "demand_pred_24h",
    "generation_pred_1h", "generation_pred_6h", "generation_pred_24h",
    "generation_demand_ratio_1h", "generation_demand_ratio_6h", "generation_demand_ratio_24h",
    "margin_1h", "margin_6h", "margin_24h",
    "reserve_margin_1h", "reserve_margin_6h", "reserve_margin_24h",
    "worst_reserve_margin",
    "hour_sin", "hour_cos", "dow_sin", "dow_cos", "weekend",
    "planned_known_now", "planned_known_next_1h", "planned_known_next_6h",
    "planned_known_next_24h", "hours_to_next_known_planned_outage",
]

RAW_REQUIRED = [
    "timestamp", "province",
    "hydro_mw", "hfo_mw", "go_mw", "solar_mw", "hybrid_mw", "demand_mw",
    "demand_pred_1h", "demand_pred_6h", "demand_pred_24h",
    "generation_pred_1h", "generation_pred_6h", "generation_pred_24h",
    "planned_known_now", "planned_known_next_1h", "planned_known_next_6h",
    "planned_known_next_24h",
]


def _finite(value: Any, name: str) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} doit être numérique") from exc
    if not math.isfinite(result):
        raise ValueError(f"{name} doit être une valeur finie")
    return result


def _optional_float(value: Any) -> float | None:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    result = float(value)
    return result if math.isfinite(result) else None


def _safe_div(num: float, den: float) -> float:
    if den == 0:
        return float("nan")
    return num / den


def build_features(raw: dict[str, Any], zone_profile: dict[str, Any] | None = None) -> dict[str, float]:
    missing = [name for name in RAW_REQUIRED if name not in raw]
    if missing:
        raise ValueError(f"Champs bruts manquants : {missing}")

    timestamp = pd.Timestamp(raw["timestamp"])
    if pd.isna(timestamp):
        raise ValueError("timestamp invalide")

    hydro = _finite(raw["hydro_mw"], "hydro_mw")
    hfo = _finite(raw["hfo_mw"], "hfo_mw")
    go = _finite(raw["go_mw"], "go_mw")
    solar = _finite(raw["solar_mw"], "solar_mw")
    hybrid = _finite(raw["hybrid_mw"], "hybrid_mw")
    demand = _finite(raw["demand_mw"], "demand_mw")

    generation = hydro + hfo + go + solar + hybrid
    if generation <= 0:
        raise ValueError("La génération totale doit être > 0")

    values: dict[str, float] = {
        "hydro_mw": hydro,
        "hfo_mw": hfo,
        "go_mw": go,
        "solar_mw": solar,
        "hybrid_mw": hybrid,
        "generation_mw": generation,
        "demand_mw": demand,
    }

    # Pendant la construction du dataset Madagascar, les parts du mix énergétique
    # proviennent du contexte annuel par zone, et non du ratio horaire instantané.
    # Pour reproduire exactement l'entraînement, on utilise donc ce profil lorsqu'il
    # est disponible.
    if zone_profile is not None:
        for name in (
            "hydro_share", "hfo_share", "go_share", "solar_share", "hybrid_share",
            "dispatchable_share", "renewable_share_proxy",
        ):
            values[name] = _finite(zone_profile[name], name)
    else:
        values["hydro_share"] = hydro / generation
        values["hfo_share"] = hfo / generation
        values["go_share"] = go / generation
        values["solar_share"] = solar / generation
        values["hybrid_share"] = hybrid / generation
        values["dispatchable_share"] = values["hfo_share"] + values["go_share"] + values["hybrid_share"]
        values["renewable_share_proxy"] = values["hydro_share"] + values["solar_share"]

    for horizon in (1, 6, 24):
        d = _finite(raw[f"demand_pred_{horizon}h"], f"demand_pred_{horizon}h")
        g = _finite(raw[f"generation_pred_{horizon}h"], f"generation_pred_{horizon}h")
        deficit = d - g
        margin = g - d
        values[f"demand_pred_{horizon}h"] = d
        values[f"generation_pred_{horizon}h"] = g
        values[f"deficit_{horizon}h"] = deficit
        values[f"margin_{horizon}h"] = margin
        values[f"deficit_rate_{horizon}h"] = _safe_div(deficit, d)
        values[f"reserve_margin_{horizon}h"] = _safe_div(margin, d)
        values[f"generation_demand_ratio_{horizon}h"] = _safe_div(g, d)

    values["deficit_pred_max"] = max(values["deficit_1h"], values["deficit_6h"], values["deficit_24h"])
    values["worst_reserve_margin"] = min(values["reserve_margin_1h"], values["reserve_margin_6h"], values["reserve_margin_24h"])

    hour = timestamp.hour
    dow = timestamp.dayofweek
    values["hour_sin"] = math.sin(2 * math.pi * hour / 24.0)
    values["hour_cos"] = math.cos(2 * math.pi * hour / 24.0)
    values["dow_sin"] = math.sin(2 * math.pi * dow / 7.0)
    values["dow_cos"] = math.cos(2 * math.pi * dow / 7.0)
    values["weekend"] = int(dow >= 5)

    for name in (
        "planned_known_now", "planned_known_next_1h", "planned_known_next_6h", "planned_known_next_24h"
    ):
        values[name] = int(bool(raw[name]))

    hours_to = _optional_float(raw.get("hours_to_next_known_planned_outage"))
    values["hours_to_next_known_planned_outage"] = float("nan") if hours_to is None else hours_to

    return {name: values[name] for name in MODEL_FEATURES}
