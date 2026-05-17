const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");

function closeNav() {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
  navMenu.classList.remove("is-open");
}

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  navMenu.classList.toggle("is-open", !open);
});

navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});

const STORAGE_KEY = "data-security-checklist";

function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecklist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const checkboxes = document.querySelectorAll("#checklist-items input[type='checkbox']");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const progressBar = document.querySelector(".progress-bar");

function updateProgress() {
  const total = checkboxes.length;
  const done = [...checkboxes].filter((cb) => cb.checked).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (progressFill) progressFill.style.width = `${pct}%`;
  if (progressLabel) progressLabel.textContent = `${pct}% complete`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(pct));
}

const saved = loadChecklist();

checkboxes.forEach((cb) => {
  const key = cb.dataset.key;
  if (key && saved[key]) cb.checked = true;

  cb.addEventListener("change", () => {
    const state = loadChecklist();
    if (key) state[key] = cb.checked;
    saveChecklist(state);
    updateProgress();
  });
});

updateProgress();

const revealTargets = document.querySelectorAll(
  ".card, .threat-card, .practice-item, .section-header, .checklist-panel"
);

revealTargets.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

revealTargets.forEach((el) => observer.observe(el));
