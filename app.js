import { PUBLICATIONS, VENUE_ALIASES } from "./data/publications.js";
import { ABOUT } from "./data/about.js";
import { NEWS, SERVICE } from "./data/activities.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text) {
  const raw = String(text || "");
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let output = "";
  let lastIndex = 0;
  let match = regex.exec(raw);

  while (match) {
    output += escapeHtml(raw.slice(lastIndex, match.index));
    const label = escapeHtml(match[1]);
    const url = match[2];
    output += `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`;
    lastIndex = regex.lastIndex;
    match = regex.exec(raw);
  }

  output += escapeHtml(raw.slice(lastIndex));
  return output;
}

function isMyName(authorName) {
  const normalized = String(authorName || "")
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .trim();
  return normalized === "muyang li" || normalized === "m. li";
}

function formatAuthors(authors = []) {
  if (!Array.isArray(authors)) return "";
  return authors
    .map((author) => {
      const name = escapeHtml(String(author));
      return isMyName(author) ? `<span class="author-self">${name}</span>` : name;
    })
    .join(", ");
}

function formatVenue(venueKey, year) {
  const alias = VENUE_ALIASES[venueKey?.toLowerCase?.()] || null;
  if (!alias) return `${escapeHtml(venueKey || "Unknown venue")} ${escapeHtml(year)}`;
  return `${escapeHtml(alias.short)} ${escapeHtml(year)}`;
}

function formatLinks(links = []) {
  if (!Array.isArray(links) || links.length === 0) return "";
  const parts = links
    .filter((item) => item?.label && item?.url)
    .map(
      (item) =>
        `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`
    );
  return parts.join(' <span class="dot">&middot;</span> ');
}

function renderAbout() {
  const container = document.getElementById("about-content");
  if (!container) return;

  const bioHtml = (ABOUT.bio || [])
    .map((paragraph) => `<p>${renderInlineMarkdown(paragraph)}</p>`)
    .join("");

  const educationHtml = (ABOUT.education || [])
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.degree)}</strong>, ${escapeHtml(item.period)}<br>${escapeHtml(item.institution)}${item.note ? `, ${renderInlineMarkdown(item.note)}` : ""}</li>`
    )
    .join("");

  const interestsHtml = (ABOUT.researchInterests || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  container.innerHTML = `
    <div class="about-block">
      <h3>Brief Bio</h3>
      ${bioHtml}
    </div>
    <div class="about-block">
      <h3>Education</h3>
      <ul class="about-list">${educationHtml}</ul>
    </div>
    <div class="about-block">
      <h3>Research Interests</h3>
      <ul class="about-list">${interestsHtml}</ul>
    </div>
  `;
}

function renderPublications() {
  const container = document.getElementById("publication-sections");
  if (!container) return;

  const sorted = [...PUBLICATIONS].sort((a, b) => Number(b.year) - Number(a.year));

  const items = sorted
    .map((pub) => {
      const authors = formatAuthors(pub.authors);
      const links = formatLinks(pub.links);
      const note = pub.note ? `<span class="badge">${escapeHtml(pub.note)}</span>` : "";

      return `
        <li class="publication-item">
          <div class="pub-title">${escapeHtml(pub.title)}</div>
          <div class="pub-authors">${authors}</div>
          <div class="pub-venue">${formatVenue(pub.venue, pub.year)} ${note}</div>
          ${links ? `<div class="pub-links">${links}</div>` : ""}
        </li>
      `;
    })
    .join("");

  container.innerHTML = `
    <ol class="publication-list" reversed start="${sorted.length}">
      ${items}
    </ol>
  `;
}

function renderNews() {
  const container = document.getElementById("news-content");
  if (!container) return;

  const items = NEWS.map(
    (item) =>
      `<li><span class="news-date">${escapeHtml(item.date)}</span>${escapeHtml(item.text)}</li>`
  ).join("");

  container.innerHTML = `<ul class="news-list">${items}</ul>`;
}

function renderActivities() {
  const container = document.getElementById("activities-content");
  if (!container) return;

  const serviceHtml = SERVICE.map(
    (item) => `<li><strong>${escapeHtml(item.role)}:</strong> ${escapeHtml(item.details)}</li>`
  ).join("");

  container.innerHTML = `
    <div class="about-block">
      <h3>Academic Service</h3>
      <ul class="about-list">${serviceHtml}</ul>
    </div>
  `;
}

function setupThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const html = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  function isDarkActive() {
    const current = html.getAttribute("data-theme");
    return current === "dark" || (!current && mq.matches);
  }

  function updateButton() {
    const dark = isDarkActive();
    button.textContent = dark ? "\u2600" : "\u263E";
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  updateButton();

  button.addEventListener("click", () => {
    const next = isDarkActive() ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateButton();
  });

  mq.addEventListener("change", updateButton);
}

function setupToTopButton() {
  const button = document.getElementById("to-top-button");
  if (!button) return;

  const updateVisibility = () => {
    const show = window.scrollY > 240;
    button.classList.toggle("visible", show);
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateVisibility();
}

renderAbout();
renderPublications();
renderNews();
renderActivities();
setupThemeToggle();
setupToTopButton();
