// Bootstrap: load the trophy data, wire the controls, and render the guide.
// A `?shot=` query only sets a view a reader can reach by hand (a filter, the
// spoiler switch, a scroll target) — it exists so screenshots show real states.
import { loadState, saveState, toggleEarned, exportProgress, parseImport, resetProgress, isEarned } from './state.js';
import { renderRoadmap, renderProgress, renderList } from './ui.js';

const els = {
  progressText: document.getElementById('progressText'),
  progressPct: document.getElementById('progressPct'),
  progressFill: document.getElementById('progressFill'),
  gradeChips: document.getElementById('gradeChips'),
  trackerProgress: document.getElementById('trackerProgress'),
  roadmapList: document.getElementById('roadmapList'),
  trophyList: document.getElementById('trophyList'),
  listCount: document.getElementById('listCount'),
  filterNote: document.getElementById('filterNote'),
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('gradeFilter'),
  earnedOnly: document.getElementById('earnedOnly'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  kindFilters: document.getElementById('kindFilters'),
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
  resetBtn: document.getElementById('resetBtn'),
  savedNote: document.getElementById('savedNote'),
};

let trophies = [];
const state = loadState();
const filters = { kind: 'all', grade: 'all', search: '', earnedOnly: false };

function renderAll() {
  renderRoadmap(els.roadmapList, trophies, state);
  renderProgress(trophies, state, els);
  const shown = renderList(els.trophyList, trophies, state, filters);
  els.listCount.textContent = 'Showing ' + shown + ' of ' + trophies.length + ' trophies.';
  if (filters.kind === 'online') {
    els.filterNote.textContent = 'There are no online trophies — all 55 are single-player, so this filter lists none.';
  } else if (filters.kind === 'missable') {
    els.filterNote.textContent = 'Only one trophy is truly missable (Positive Mental Attitude). Yago’s racing strand, part of Strangers & Freaks, is time-sensitive — save first.';
  } else {
    els.filterNote.textContent = '';
  }
}

function setKind(kind) {
  filters.kind = kind;
  for (const b of els.kindFilters.querySelectorAll('button')) {
    const active = b.dataset.kind === kind;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  }
  renderAll();
}

function flashSaved(message) {
  els.savedNote.textContent = message;
  setTimeout(() => { els.savedNote.textContent = ''; }, 4000);
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  trophies = doc.trophies;

  els.spoilerToggle.checked = state.spoiler;
  els.trophyList.addEventListener('trophy-toggle', (event) => {
    toggleEarned(state, event.detail.name);
    renderAll();
    flashSaved('Progress saved in this browser.');
  });

  els.kindFilters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-kind]');
    if (button) setKind(button.dataset.kind);
  });
  els.gradeFilter.addEventListener('change', () => { filters.grade = els.gradeFilter.value; renderAll(); });
  els.search.addEventListener('input', () => { filters.search = els.search.value; renderAll(); });
  els.earnedOnly.addEventListener('change', () => { filters.earnedOnly = els.earnedOnly.checked; renderAll(); });
  els.spoilerToggle.addEventListener('change', () => {
    state.spoiler = els.spoilerToggle.checked;
    saveState(state);
    renderAll();
  });
  els.exportBtn.addEventListener('click', () => {
    exportProgress(state, trophies);
    flashSaved('Progress exported — keep the file to import it back later.');
  });
  els.importFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImport(await file.text(), trophies);
      state.earned = imported.earned;
      state.spoiler = imported.spoiler;
      els.spoilerToggle.checked = state.spoiler;
      saveState(state);
      renderAll();
      flashSaved('Imported ' + imported.earned.length + ' earned trophies.');
    } catch {
      flashSaved('That file is not a Leonida progress export.');
    }
    event.target.value = '';
  });
  els.resetBtn.addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies in this browser?')) {
      resetProgress(state);
      renderAll();
      flashSaved('Progress cleared.');
    }
  });

  applyShotPreset();
  renderAll();
}

// Screenshot presets: states the reader can reach by hand, applied on load.
function applyShotPreset() {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (!shot) return;
  const byId = (id) => trophies.find((t) => t.id === id);
  if (shot === 'cover') {
    if (state.earned.length === 0) {
      state.earned = [2, 3, 4, 8, 15, 16, 21, 30, 35, 42, 44, 54].map((id) => byId(id).name);
      saveState(state);
    }
    state.spoiler = false;
    els.spoilerToggle.checked = false;
    setKind('all');
    setTimeout(() => document.getElementById('tracker').scrollIntoView({ block: 'start', behavior: 'instant' }), 60);
  } else if (shot === 'roadmap') {
    setTimeout(() => document.getElementById('roadmap').scrollIntoView({ block: 'start', behavior: 'instant' }), 60);
  } else if (shot === 'spoiler') {
    state.spoiler = true;
    els.spoilerToggle.checked = true;
    saveState(state);
    setKind('missable');
    setTimeout(() => document.getElementById('tracker').scrollIntoView({ block: 'start', behavior: 'instant' }), 60);
  } else if (shot === 'collectibles') {
    state.spoiler = false;
    els.spoilerToggle.checked = false;
    setKind('collectibles');
    setTimeout(() => document.getElementById('tracker').scrollIntoView({ block: 'start', behavior: 'instant' }), 60);
  }
}

boot();
