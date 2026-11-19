// Leonida Trophy Guide — bootstrap: load the trophy data, wire the tracker
// controls, and keep the checklist saved in the browser.
import {
  EARNED_KEY,
  exportProgressJson,
  loadEarned,
  loadSettings,
  parseImportedProgress,
  readShotMode,
  saveEarned,
  saveSettings,
} from './state.js';
import {
  applyShotMode,
  renderList,
  renderMissableCallout,
  renderProgress,
  syncFilterControls,
} from './ui.js';

const list = document.getElementById('trophy-list');
const response = await fetch('data/trophies.json');
const doc = await response.json();
const trophies = doc.trophies;

let earned = loadEarned();
let settings = loadSettings();

// Screenshot captures may preview a few trophies as earned (?demo=2,3,7).
// Those ticks are display-only: they never touch localStorage.
const { shot, demoEarned } = readShotMode();
const displayEarned = new Set(earned);
for (const id of demoEarned) {
  const trophy = trophies.find((t) => t.id === id);
  if (trophy) displayEarned.add(trophy.name);
}

function currentFilters() {
  return {
    grade: settings.grade,
    kind: settings.kind,
    visibility: settings.visibility,
    earned: settings.earned,
    missableOnly: settings.missableOnly,
    search: settings.search,
  };
}

function renderAll() {
  renderProgress(trophies, displayEarned);
  renderList(trophies, displayEarned, currentFilters(), settings.spoiler, onToggle);
}

function onToggle(name, checked) {
  if (checked) earned.add(name);
  else earned.delete(name);
  displayEarned.clear();
  for (const n of earned) displayEarned.add(n);
  saveEarned(earned);
  renderAll();
}

function setSpoiler(on) {
  settings.spoiler = on;
  saveSettings(settings);
  const toggle = document.getElementById('spoiler-toggle');
  if (toggle) toggle.checked = on;
  renderAll();
}

// Filter controls: every change saves the settings and re-renders.
function bindControl(id, key, eventName = 'change') {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener(eventName, () => {
    settings[key] = el.type === 'checkbox' ? el.checked : el.value;
    saveSettings(settings);
    renderAll();
  });
}
bindControl('grade-filter', 'grade');
bindControl('kind-filter', 'kind');
bindControl('visibility-filter', 'visibility');
bindControl('earned-filter', 'earned');
bindControl('missable-only', 'missableOnly');
bindControl('search', 'search', 'input');
bindControl('spoiler-toggle', 'spoiler');

// Export: download a JSON file with the ticked trophy names.
document.getElementById('export-btn')?.addEventListener('click', () => {
  const blob = new Blob([exportProgressJson(earned)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  const status = document.getElementById('export-status');
  if (status) status.textContent = `Exported ${earned.size} earned trophies to leonida-progress.json.`;
});

// Import: read a progress file back and restore the ticks.
document.getElementById('import-file')?.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  const status = document.getElementById('export-status');
  if (!file) return;
  const imported = parseImportedProgress(await file.text());
  if (!imported) {
    if (status) status.textContent = 'That file could not be read as trophy progress. Export a fresh file and try again.';
    event.target.value = '';
    return;
  }
  const known = new Set(trophies.map((t) => t.name));
  earned = new Set([...imported].filter((name) => known.has(name)));
  displayEarned.clear();
  for (const n of earned) displayEarned.add(n);
  saveEarned(earned);
  if (status) status.textContent = `Imported ${earned.size} earned trophies from ${file.name}.`;
  event.target.value = '';
  renderAll();
});

// Reset: clear every tick after a confirmation.
document.getElementById('reset-btn')?.addEventListener('click', () => {
  if (!window.confirm('Clear all earned ticks? You can export first to keep a backup.')) return;
  earned = new Set();
  displayEarned.clear();
  saveEarned(earned);
  renderAll();
});

renderMissableCallout(trophies);
syncFilterControls(settings);
renderAll();
applyShotMode(shot, setSpoiler);
