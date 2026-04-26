import { fetchEvents, fetchHealth, fetchNbisPrices, getApiBase } from "../services/api.js";

const elements = {
  apiBase: document.getElementById("api-base-output"),
  backendStatus: document.getElementById("backend-status"),
  headerDataStatus: document.getElementById("header-data-status"),
  dataStatus: document.getElementById("data-status"),
  lastClose: document.getElementById("last-close"),
  highPrice: document.getElementById("high-price"),
  lowPrice: document.getElementById("low-price"),
  sessionCount: document.getElementById("session-count"),
  priceTableOutput: document.getElementById("price-table-output"),
  eventsOutput: document.getElementById("events-output"),
  lastRefresh: document.getElementById("last-refresh"),
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedValue(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const [headerLine, ...rows] = lines;

  if (!headerLine || rows.length === 0) {
    return [];
  }

  const headers = headerLine.split(",");

  return rows
    .map((row) => row.split(","))
    .filter((columns) => columns.length === headers.length)
    .map((columns) => ({
      date: columns[0],
      open: Number(columns[1]),
      high: Number(columns[2]),
      low: Number(columns[3]),
      close: Number(columns[4]),
      volume: Number(columns[5]),
    }))
    .filter((entry) => !Number.isNaN(entry.close));
}

function renderPriceSummary(prices) {
  const latest = prices[prices.length - 1];
  const highs = prices.map((entry) => entry.high);
  const lows = prices.map((entry) => entry.low);

  elements.lastClose.textContent = formatCurrency(latest.close);
  elements.highPrice.textContent = formatCurrency(Math.max(...highs));
  elements.lowPrice.textContent = formatCurrency(Math.min(...lows));
  elements.sessionCount.textContent = String(prices.length);
}

function renderPriceTable(prices) {
  const latestRows = prices.slice(-10).reverse();
  const tableRows = latestRows
    .map((entry) => {
      const intradayMove = entry.close - entry.open;
      const valueClass = intradayMove >= 0 ? "value-up" : "value-down";

      return `
        <tr>
          <td>${entry.date}</td>
          <td>${formatCurrency(entry.open)}</td>
          <td>${formatCurrency(entry.close)}</td>
          <td>${formatCurrency(entry.high)}</td>
          <td>${formatCurrency(entry.low)}</td>
          <td class="${valueClass}">${formatSignedValue(intradayMove)}</td>
        </tr>
      `;
    })
    .join("");

  elements.priceTableOutput.innerHTML = `
    <table class="price-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Open</th>
          <th>Close</th>
          <th>High</th>
          <th>Low</th>
          <th>Move</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;
}

function renderEvents(events) {
  if (!events.length) {
    elements.eventsOutput.innerHTML = '<p class="status-message">No events found.</p>';
    return;
  }

  const cards = events
    .map(
      (event) => `
        <article class="event-card">
          <div class="event-top">
            <span>${event.date}</span>
            <span class="event-tag">${event.tag}</span>
          </div>
          <h3>${event.title}</h3>
          <p>${event.impact}</p>
          <a href="${event.url}" target="_blank" rel="noopener noreferrer">Read more</a>
        </article>
      `,
    )
    .join("");

  elements.eventsOutput.innerHTML = `<div class="events-list">${cards}</div>`;
}

function setDataStatus(html) {
  if (elements.headerDataStatus) elements.headerDataStatus.innerHTML = html;
  if (elements.dataStatus) elements.dataStatus.innerHTML = html;
}

async function loadBackendStatus() {
  elements.apiBase.textContent = getApiBase();
  setDataStatus('<span style="color:var(--t-amber)">● connecting...</span>');

  try {
    const result = await fetchHealth();
    const online = result.status === "ok";
    const statusHtml = online
      ? '<span style="color:var(--t-green)">● online</span>'
      : '<span style="color:var(--t-red)">● unavailable</span>';
    elements.backendStatus.innerHTML = statusHtml;
    setDataStatus(statusHtml);
  } catch (error) {
    const offlineHtml = `<span style="color:var(--t-red)">● offline</span>`;
    elements.backendStatus.innerHTML = offlineHtml;
    setDataStatus(offlineHtml);
  }
}

async function loadPrices() {
  try {
    const csvText = await fetchNbisPrices();
    const prices = parseCsv(csvText);

    if (!prices.length) {
      throw new Error("No price rows returned from backend");
    }

    renderPriceSummary(prices);
    renderPriceTable(prices);
  } catch (error) {
    elements.priceTableOutput.innerHTML = `<p class="status-message">${error.message}</p>`;
  }
}

async function loadEvents() {
  try {
    const data = await fetchEvents();
    renderEvents(data.events ?? []);
  } catch (error) {
    elements.eventsOutput.innerHTML = `<p class="status-message">${error.message}</p>`;
  }
}

function startClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toUTCString().replace("GMT", "UTC");
  };
  tick();
  setInterval(tick, 1000);
}

const PRICE_REFRESH_MS = 5 * 60 * 1000;

async function init() {
  startClock();
  await Promise.all([loadBackendStatus(), loadPrices(), loadEvents()]);

  if (elements.lastRefresh) {
    elements.lastRefresh.textContent = `updated ${new Date().toLocaleTimeString("nb-NO")}`;
  }
}

init();
setInterval(async () => {
  await Promise.all([loadBackendStatus(), loadPrices()]);
  if (elements.lastRefresh) {
    elements.lastRefresh.textContent = `updated ${new Date().toLocaleTimeString("nb-NO")}`;
  }
}, PRICE_REFRESH_MS);
