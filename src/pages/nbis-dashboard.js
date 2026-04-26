import { fetchEvents, fetchHealth, fetchNbisPrices, getApiBase } from "../services/api.js";

const elements = {
  apiBase:          document.getElementById("api-base-output"),
  backendStatus:    document.getElementById("backend-status"),
  headerDataStatus: document.getElementById("header-data-status"),
  dataStatus:       document.getElementById("data-status"),
  lastClose:        document.getElementById("last-close"),
  highPrice:        document.getElementById("high-price"),
  lowPrice:         document.getElementById("low-price"),
  sessionCount:     document.getElementById("session-count"),
  avgVolume:        document.getElementById("avg-volume"),
  priceTableOutput: document.getElementById("price-table-output"),
  pctChangeOutput:  document.getElementById("pct-change-output"),
  volumeOutput:     document.getElementById("volume-output"),
  eventsOutput:     document.getElementById("events-output"),
  priceStatsOutput: document.getElementById("price-stats-output"),
  momentumOutput:   document.getElementById("momentum-output"),
  rangeOutput:      document.getElementById("range-output"),
  ocOutput:         document.getElementById("oc-output"),
  systemOutput:     document.getElementById("system-output"),
  lastRefresh:      document.getElementById("last-refresh"),
};

const usd = (v) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const vol = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);
const pct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
const signed = (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}`;

function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const [headerLine, ...rows] = lines;
  if (!headerLine || !rows.length) return [];
  const headers = headerLine.split(",");
  return rows
    .map((r) => r.split(","))
    .filter((c) => c.length === headers.length)
    .map((c) => ({ date: c[0], open: +c[1], high: +c[2], low: +c[3], close: +c[4], volume: +c[5] }))
    .filter((e) => !Number.isNaN(e.close));
}

function setDataStatus(html) {
  if (elements.headerDataStatus) elements.headerDataStatus.innerHTML = html;
  if (elements.dataStatus) elements.dataStatus.innerHTML = html;
}

// ── KPI CHIPS ────────────────────────────────────────────────────────────────
function renderChips(prices) {
  const latest = prices[prices.length - 1];
  const highs   = prices.map((e) => e.high);
  const lows    = prices.map((e) => e.low);
  const avgVol  = prices.reduce((s, e) => s + e.volume, 0) / prices.length;

  elements.lastClose.textContent    = usd(latest.close);
  elements.highPrice.textContent    = usd(Math.max(...highs));
  elements.lowPrice.textContent     = usd(Math.min(...lows));
  elements.sessionCount.textContent = String(prices.length);
  if (elements.avgVolume) elements.avgVolume.textContent = vol(avgVol);
}

// ── PANEL 1: OHLC TABLE ───────────────────────────────────────────────────
function renderPriceTable(prices) {
  const rows = prices.slice(-10).reverse().map((e) => {
    const move = e.close - e.open;
    const cls  = move >= 0 ? "value-up" : "value-down";
    return `<tr><td>${e.date}</td><td>${usd(e.open)}</td><td>${usd(e.close)}</td><td>${usd(e.high)}</td><td>${usd(e.low)}</td><td class="${cls}">${signed(move)}</td></tr>`;
  }).join("");
  elements.priceTableOutput.innerHTML = `
    <table class="price-table">
      <thead><tr><th>Date</th><th>Open</th><th>Close</th><th>High</th><th>Low</th><th>Move</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── PANEL 2: DAILY % CHANGE ───────────────────────────────────────────────
function renderPctChange(prices) {
  const rows = prices.slice(-10).reverse().map((e) => {
    const change = ((e.close - e.open) / e.open) * 100;
    const cls    = change >= 0 ? "value-up" : "value-down";
    const bar    = "█".repeat(Math.min(Math.round(Math.abs(change) * 2), 12));
    return `<tr><td>${e.date}</td><td class="${cls}">${pct(change)}</td><td class="${cls}" style="letter-spacing:-.05em;font-size:10px">${bar}</td></tr>`;
  }).join("");
  elements.pctChangeOutput.innerHTML = `
    <table class="price-table">
      <thead><tr><th>Date</th><th>Change</th><th>Bar</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── PANEL 3: VOLUME PROFILE ───────────────────────────────────────────────
function renderVolume(prices) {
  const recent   = prices.slice(-10).reverse();
  const maxVol   = Math.max(...recent.map((e) => e.volume));
  const rows = recent.map((e) => {
    const barLen = Math.round((e.volume / maxVol) * 12);
    const bar    = "█".repeat(barLen);
    const move   = e.close - e.open;
    const cls    = move >= 0 ? "value-up" : "value-down";
    return `<tr><td>${e.date}</td><td>${vol(e.volume)}</td><td class="${cls}" style="letter-spacing:-.05em;font-size:10px">${bar}</td></tr>`;
  }).join("");
  elements.volumeOutput.innerHTML = `
    <table class="price-table">
      <thead><tr><th>Date</th><th>Volume</th><th>Rel.</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── PANEL 5: PRICE STATISTICS ─────────────────────────────────────────────
function renderPriceStats(prices) {
  const closes  = prices.map((e) => e.close).sort((a, b) => a - b);
  const median  = closes[Math.floor(closes.length / 2)];
  const avg     = closes.reduce((s, v) => s + v, 0) / closes.length;
  const latest  = prices[prices.length - 1].close;
  const w52h    = Math.max(...prices.map((e) => e.high));
  const w52l    = Math.min(...prices.map((e) => e.low));
  const fromH   = ((latest - w52h) / w52h) * 100;
  const fromL   = ((latest - w52l) / w52l) * 100;
  const range   = w52h - w52l;
  const pos     = Math.round(((latest - w52l) / range) * 20);
  const gauge   = "─".repeat(pos) + "●" + "─".repeat(20 - pos);

  elements.priceStatsOutput.innerHTML = `
    <table class="price-table">
      <tbody>
        <tr><td>Last Close</td><td class="value-up">${usd(latest)}</td></tr>
        <tr><td>Avg Close</td><td>${usd(avg)}</td></tr>
        <tr><td>Median Close</td><td>${usd(median)}</td></tr>
        <tr><td>52W High</td><td>${usd(w52h)}</td></tr>
        <tr><td>52W Low</td><td>${usd(w52l)}</td></tr>
        <tr><td>From 52W High</td><td class="value-down">${pct(fromH)}</td></tr>
        <tr><td>From 52W Low</td><td class="value-up">${pct(fromL)}</td></tr>
      </tbody>
    </table>
    <div style="margin-top:12px;font-size:9px;color:var(--muted);letter-spacing:.04em">52W RANGE POSITION</div>
    <div style="margin-top:6px;font-size:10px;color:var(--cool);letter-spacing:-.02em;font-family:inherit">${gauge}</div>`;
}

// ── PANEL 6: MOMENTUM ─────────────────────────────────────────────────────
function renderMomentum(prices) {
  const recent = prices.slice(-20).reverse();
  let streak = 0;
  const dir = recent[0].close >= recent[0].open ? "up" : "down";
  for (const e of recent) {
    const d = e.close >= e.open ? "up" : "down";
    if (d === dir) streak++; else break;
  }
  const moves   = prices.slice(-20).map((e) => ((e.close - e.open) / e.open) * 100);
  const avgMove = moves.reduce((s, v) => s + v, 0) / moves.length;
  const upDays  = prices.slice(-20).filter((e) => e.close >= e.open).length;
  const downDays = 20 - upDays;
  const winRate = (upDays / 20) * 100;
  const streakCls = dir === "up" ? "value-up" : "value-down";
  const streakLabel = dir === "up" ? "▲ UP" : "▼ DOWN";

  elements.momentumOutput.innerHTML = `
    <table class="price-table">
      <tbody>
        <tr><td>Current Streak</td><td class="${streakCls}">${streak} days ${streakLabel}</td></tr>
        <tr><td>Avg Daily Move</td><td class="${avgMove >= 0 ? "value-up" : "value-down"}">${pct(avgMove)}</td></tr>
        <tr><td>Up Days (20d)</td><td class="value-up">${upDays} sessions</td></tr>
        <tr><td>Down Days (20d)</td><td class="value-down">${downDays} sessions</td></tr>
        <tr><td>Win Rate (20d)</td><td class="${winRate >= 50 ? "value-up" : "value-down"}">${winRate.toFixed(1)}%</td></tr>
      </tbody>
    </table>`;
}

// ── PANEL 7: DAILY RANGE ──────────────────────────────────────────────────
function renderRange(prices) {
  const rows = prices.slice(-10).reverse().map((e) => {
    const spread = e.high - e.low;
    const spreadPct = (spread / e.low) * 100;
    return `<tr><td>${e.date}</td><td>${usd(spread)}</td><td>${pct(spreadPct)}</td></tr>`;
  }).join("");
  elements.rangeOutput.innerHTML = `
    <table class="price-table">
      <thead><tr><th>Date</th><th>H-L Spread</th><th>Range %</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── PANEL 8: OPEN vs CLOSE ────────────────────────────────────────────────
function renderOC(prices) {
  const rows = prices.slice(-10).reverse().map((e) => {
    const move = e.close - e.open;
    const cls  = move >= 0 ? "value-up" : "value-down";
    const result = move >= 0 ? "▲ BULL" : "▼ BEAR";
    return `<tr><td>${e.date}</td><td>${usd(e.open)}</td><td>${usd(e.close)}</td><td class="${cls}">${result}</td></tr>`;
  }).join("");
  elements.ocOutput.innerHTML = `
    <table class="price-table">
      <thead><tr><th>Date</th><th>Open</th><th>Close</th><th>Result</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── PANEL 9: SYSTEM STATUS ────────────────────────────────────────────────
function renderSystem(backendOk, prices) {
  const now      = new Date();
  const latest   = prices[prices.length - 1];
  const sessions = prices.length;
  const statusCls = backendOk ? "value-up" : "value-down";
  const statusTxt = backendOk ? "● ONLINE" : "● OFFLINE";

  elements.systemOutput.innerHTML = `
    <table class="price-table">
      <tbody>
        <tr><td>Backend</td><td class="${statusCls}">${statusTxt}</td></tr>
        <tr><td>API Base</td><td style="color:var(--cool);font-size:10px">${getApiBase()}</td></tr>
        <tr><td>Data Source</td><td>Stooq proxy</td></tr>
        <tr><td>Refresh Rate</td><td>5 min</td></tr>
        <tr><td>Sessions Loaded</td><td>${sessions}</td></tr>
        <tr><td>Latest Date</td><td>${latest.date}</td></tr>
        <tr><td>Last Updated</td><td>${now.toLocaleTimeString("nb-NO")}</td></tr>
        <tr><td>Version</td><td>v2.0</td></tr>
      </tbody>
    </table>`;
}

// ── BACKEND STATUS ────────────────────────────────────────────────────────
async function loadBackendStatus() {
  elements.apiBase.textContent = getApiBase();
  setDataStatus('<span style="color:var(--warn)">● connecting...</span>');
  try {
    const result = await fetchHealth();
    const ok = result.status === "ok";
    const html = ok
      ? '<span style="color:var(--ok)">● online</span>'
      : '<span style="color:var(--hot)">● unavailable</span>';
    elements.backendStatus.innerHTML = html;
    setDataStatus(html);
    return ok;
  } catch {
    const html = '<span style="color:var(--hot)">● offline</span>';
    elements.backendStatus.innerHTML = html;
    setDataStatus(html);
    return false;
  }
}

// ── EVENTS ────────────────────────────────────────────────────────────────
async function loadEvents() {
  try {
    const data = await fetchEvents();
    const events = data.events ?? [];
    if (!events.length) {
      elements.eventsOutput.innerHTML = '<p class="status-message">No events found.</p>';
      return;
    }
    const cards = events.map((e) => `
      <article class="event-card">
        <div class="event-top">
          <span>${e.date}</span>
          <span class="event-tag">${e.tag}</span>
        </div>
        <h3>${e.title}</h3>
        <p>${e.impact}</p>
        <a href="${e.url}" target="_blank" rel="noopener noreferrer">Read more</a>
      </article>`).join("");
    elements.eventsOutput.innerHTML = `<div class="events-list">${cards}</div>`;
  } catch (err) {
    elements.eventsOutput.innerHTML = `<p class="status-message">${err.message}</p>`;
  }
}

// ── PRICES (all panels) ───────────────────────────────────────────────────
async function loadPrices(backendOk) {
  try {
    const csvText = await fetchNbisPrices();
    const prices  = parseCsv(csvText);
    if (!prices.length) throw new Error("No price rows returned from backend");

    renderChips(prices);
    renderPriceTable(prices);
    renderPctChange(prices);
    renderVolume(prices);
    renderPriceStats(prices);
    renderMomentum(prices);
    renderRange(prices);
    renderOC(prices);
    renderSystem(backendOk, prices);
  } catch (err) {
    const msg = `<p class="status-message">${err.message}</p>`;
    [elements.priceTableOutput, elements.pctChangeOutput, elements.volumeOutput,
     elements.priceStatsOutput, elements.momentumOutput, elements.rangeOutput,
     elements.ocOutput].forEach((el) => { if (el) el.innerHTML = msg; });
  }
}

function startClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const tick = () => { el.textContent = new Date().toUTCString().replace("GMT", "UTC"); };
  tick();
  setInterval(tick, 1000);
}

const REFRESH_MS = 5 * 60 * 1000;

async function init() {
  startClock();
  const backendOk = await loadBackendStatus();
  await Promise.all([loadPrices(backendOk), loadEvents()]);
  if (elements.lastRefresh) elements.lastRefresh.textContent = `updated ${new Date().toLocaleTimeString("nb-NO")}`;
}

init();
setInterval(async () => {
  const backendOk = await loadBackendStatus();
  await loadPrices(backendOk);
  if (elements.lastRefresh) elements.lastRefresh.textContent = `updated ${new Date().toLocaleTimeString("nb-NO")}`;
}, REFRESH_MS);
