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
