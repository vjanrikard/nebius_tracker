function readConfiguredApiBase() {
  const configured = globalThis?.NEBIUS_CONFIG?.API_BASE?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "http://127.0.0.1:8000";
}

export function getApiBase() {
  return readConfiguredApiBase();
}

async function fetchFromApi(pathname, responseType = "json") {
  const response = await fetch(`${getApiBase()}${pathname}`);

  if (!response.ok) {
    throw new Error(`${pathname} returned ${response.status}`);
  }

  if (responseType === "text") {
    return response.text();
  }

  return response.json();
}

export function fetchNbisPrices() {
  return fetchFromApi("/api/nbis", "text");
}

export function fetchEvents() {
  return fetchFromApi("/api/events");
}

export function fetchHealth() {
  return fetchFromApi("/health");
}
const API_BASE = "http://127.0.0.1:8000";

export async function fetchNbisPrices() {
  const response = await fetch(`${API_BASE}/api/nbis`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NBIS prices: ${response.status}`);
  }
  return await response.text();
}

export async function fetchEvents() {
  const response = await fetch(`${API_BASE}/api/events`);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }
  return await response.json();
}
