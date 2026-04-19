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
  const response = await fetch(`${getApiBase()}${pathname}`, { cache: "no-store" });

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
