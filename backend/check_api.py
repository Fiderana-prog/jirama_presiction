import json
import requests

API = "http://127.0.0.1:8000"

print("HEALTH")
print(json.dumps(requests.get(f"{API}/health").json(), indent=2, ensure_ascii=False))

print("\nMODELS")
models = requests.get(f"{API}/models").json()
print(json.dumps(models, indent=2, ensure_ascii=False))
