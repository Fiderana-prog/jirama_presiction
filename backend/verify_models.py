from pathlib import Path
import json
import sys

import sklearn

BASE = Path(__file__).resolve().parent
CONFIG = json.loads((BASE / "data" / "selected_model_config.json").read_text(encoding="utf-8"))
required = CONFIG.get("scikit_learn_version_required", "1.6.1")

print("Python:", sys.version.split()[0])
print("scikit-learn runtime:", sklearn.__version__)
print("scikit-learn required:", required)

if sklearn.__version__ != required:
    raise SystemExit(
        "\nVersion incompatible. Activez le venv backend puis exécutez:\n"
        "  pip install -r requirements.txt\n"
    )

import joblib

for horizon in ("6h", "24h"):
    path = BASE / "models" / f"selected_model_{horizon}.joblib"
    bundle = joblib.load(path)
    print(
        f"{horizon}: OK | model={bundle.get('model_name')} | "
        f"features={len(bundle.get('features', []))} | "
        f"bagged_models={len(bundle.get('models', []))}"
    )

print("\nLes deux modèles sont chargeables.")
