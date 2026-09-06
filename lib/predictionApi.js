const API_BASE_URL =
  process.env.NEXT_PUBLIC_PREDICTION_API_URL || "http://localhost:8000";

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json();
}

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.detail || `Erreur API ${response.status}`);
  }
  return payload;
}

export async function getApiHealth() {
  return apiGet("/health");
}

export async function getLatestSnapshot() {
  return apiGet("/historical/latest");
}

export async function getLatestFeatureSnapshot() {
  return apiGet("/features/latest");
}

export async function getProvinceFeatures(province, timestamp = null) {
  const encoded = encodeURIComponent(province);
  const suffix = timestamp ? `?timestamp=${encodeURIComponent(timestamp)}` : "";
  return apiGet(`/features/${encoded}${suffix}`);
}

export async function buildFeatures(rawInput) {
  return apiPost("/features/build", rawInput);
}

export async function getModels() {
  return apiGet("/models");
}

export async function requestPrediction(horizon, province, features) {
  return apiPost(`/predict/${horizon}`, { province, features });
}

export { API_BASE_URL };
