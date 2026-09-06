
import joblib
import numpy as np
import pandas as pd


def risk_level(percentile):
    if percentile is None or pd.isna(percentile):
        return "UNKNOWN"

    if percentile >= 99:
        return "CRITICAL"

    if percentile >= 95:
        return "HIGH"

    if percentile >= 80:
        return "MODERATE"

    return "LOW"


def load_model(model_path):
    return joblib.load(model_path)


def predict_raw_score(bundle, row):
    features = bundle["features"]

    X = pd.DataFrame([row])

    missing = [
        feature
        for feature in features
        if feature not in X.columns
    ]

    if missing:
        raise ValueError(
            f"Features manquantes : {missing}"
        )

    X_transformed = bundle["preprocessor"].transform(
        X[features]
    )

    scores = np.column_stack(
        [
            model.predict_proba(
                X_transformed
            )[:, 1]
            for model in bundle["models"]
        ]
    )

    return float(
        scores.mean(axis=1)[0]
    )


def score_to_percentile(
    score,
    province,
    horizon,
    reference_table,
):
    province = str(
        province
    ).strip().upper()

    reference = reference_table[
        reference_table["Province"].eq(province)
        &
        reference_table["horizon"].eq(horizon)
    ].sort_values("score_value")

    if reference.empty:
        raise ValueError(
            f"Aucune référence pour {province} / {horizon}"
        )

    x = reference[
        "score_value"
    ].to_numpy(
        dtype=float
    )

    y = reference[
        "percentile"
    ].to_numpy(
        dtype=float
    )

    return float(
        np.interp(
            score,
            x,
            y,
            left=y[0],
            right=y[-1],
        )
    )


def predict_risk(
    row,
    province,
    horizon,
    model_path,
    reference_table,
):
    bundle = load_model(
        model_path
    )

    raw_score = predict_raw_score(
        bundle,
        row,
    )

    percentile = score_to_percentile(
        raw_score,
        province,
        horizon,
        reference_table,
    )

    return {
        "horizon": horizon,
        "model": bundle.get("model_name"),
        "risk_score": raw_score,
        "risk_percentile": percentile,
        "risk_level": risk_level(percentile),
        "is_calibrated_probability": False,
    }
