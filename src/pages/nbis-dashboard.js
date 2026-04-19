import { fetchNbisPrices, fetchEvents } from "../services/api.js";

const priceOutput = document.getElementById("price-output");
const eventsOutput = document.getElementById("events-output");

async function loadPrices() {
  try {
    const csvText = await fetchNbisPrices();
    priceOutput.textContent = csvText;
  } catch (error) {
    priceOutput.textContent = `Error: ${error.message}`;
  }
}

function renderEvents(events) {
  if (!events.length) {
    eventsOutput.innerHTML = "<p>No events found.</p>";
    return;
  }

  const html = events.map(event => `
    <article class="event-card">
      <div class="event-top">
        <span class="event-date">${event.date}</span>
        <span class="event-tag">${event.tag}</span>
      </div>
      <h3>${event.title}</h3>
      <p>${event.impact}</p>
      <a href="${event.url}" target="_blank" rel="noopener noreferrer">Read more</a>
    </article>
  `).join("");

  eventsOutput.innerHTML = html;
}

async function loadEvents() {
  try {
    const data = await fetchEvents();
    renderEvents(data.events);
  } catch (error) {
    eventsOutput.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function init() {
  await loadPrices();
  await loadEvents();
}

init();
