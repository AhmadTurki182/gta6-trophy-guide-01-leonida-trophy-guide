// Trophy progress state: what the reader has earned, kept in localStorage,
// plus export to a file and import back. Nothing leaves the browser on its own.
export const STORAGE_KEY = 'leonida-trophy-guide-v1';

export function defaultState() {
  return { earned: [], spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return defaultState();
    return { earned: parsed.earned.filter((n) => typeof n === 'string'), spoiler: parsed.spoiler === true };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function isEarned(state, name) {
  return state.earned.includes(name);
}

export function toggleEarned(state, name) {
  const at = state.earned.indexOf(name);
  if (at === -1) state.earned.push(name);
  else state.earned.splice(at, 1);
  saveState(state);
  return state;
}

export function exportProgress(state, trophies) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    total: trophies.length,
    earned: [...state.earned],
    spoiler: state.spoiler,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImport(text, trophies) {
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('not a progress file');
  const known = new Set(trophies.map((t) => t.name));
  const earned = names.filter((n) => typeof n === 'string' && known.has(n));
  return { earned, spoiler: parsed && parsed.spoiler === true };
}

export function resetProgress(state) {
  state.earned = [];
  saveState(state);
  return state;
}
