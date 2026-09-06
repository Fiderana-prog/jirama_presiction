from app.main import (
    BUNDLES,
    PredictionRequest,
    features_latest,
    health,
    predict,
)

status = health()
print("Mode API :", status["mode"])
print("Feature Builder :", status["feature_builder_ready"])
print("Modèles :", status["models_ready"])

if status["mode"] != "MODEL_READY":
    raise SystemExit(
        "Les modèles ne sont pas chargeables. Vérifiez que le venv utilise "
        "scikit-learn 1.6.1 puis relancez ce test."
    )

snapshot = features_latest()

for zone in snapshot["zones"]:
    province = zone["province"]
    request = PredictionRequest(province=province, features=zone["features"])
    result6 = predict("6h", request)
    result24 = predict("24h", request)
    print(
        province,
        "| 6h:", round(result6["risk"]["percentile"], 2), result6["risk"]["level"],
        "| 24h:", round(result24["risk"]["percentile"], 2), result24["risk"]["level"],
    )

print("Pipeline Feature Builder -> modèles -> percentiles : OK")
