from app.main import MODEL_FEATURES, features_latest

snapshot = features_latest()

assert snapshot["featureCount"] == 47
assert len(snapshot["zones"]) == 6

for zone in snapshot["zones"]:
    features = zone["features"]
    assert list(features.keys()) == MODEL_FEATURES
    assert len(features) == 47

print("Feature Builder : OK")
print("Snapshot :", snapshot["snapshotLabel"])
print("Zones :", len(snapshot["zones"]))
print("Features par zone :", snapshot["featureCount"])
print("Source :", snapshot["source"])
print("Temps réel :", snapshot["realtime"])
