// Progress and settings storage for the Leonida Trophy Guide.
// Everything lives in the browser's localStorage; nothing is sent anywhere.
export const EARNED_KEY = 'leonida-trophy-earned-v1';
export const SETTINGS_KEY = 'leonida-trophy-settings-v1';

// Read the set of earned trophy names from localStorage. Bad data is ignored.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

// Persist the earned set. Returns true when the write worked.
export function saveEarned(earned) {
  try {
    localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
    return true;
  } catch {
    return false;
  }
}

// Read saved UI settings (spoiler mode and the last filters used).
export function loadSettings() {
  const defaults = {
    spoiler: false,
    grade: 'all',
    kind: 'all',
    visibility: 'all',
    earned: 'all',
    missableOnly: false,
    search: '',
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

// Persist UI settings.
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings are a convenience; the checklist itself matters more.
  }
}

// Serialise the earned set for export: a small JSON file the reader can keep.
export function exportProgressJson(earned) {
  return JSON.stringify(
    { app: 'leonida-trophy-guide', version: 1, earned: [...earned].sort() },
    null,
    2,
  );
}

// Parse an imported progress file. Accepts our export shape and a bare array
// of trophy names. Returns a Set of names, or null when the file is unusable.
export function parseImportedProgress(text) {
  try {
    const parsed = JSON.parse(text);
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) return null;
    const cleaned = names.filter((name) => typeof name === 'string');
    if (cleaned.length === 0 && names.length > 0) return null;
    return new Set(cleaned);
  } catch {
    return null;
  }
}

// Screenshot modes, read from the URL query string. These only change what
// the page shows for a deterministic capture; they never write to storage.
// ?shot=cover | roadmap | spoiler | export, and ?demo=1,2,3 to preview
// some trophies as earned in the capture.
export function readShotMode() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot') || '';
  const demo = params.get('demo') || '';
  const demoEarned = new Set(
    demo.split(',').map((s) => s.trim()).filter(Boolean).map(Number).filter((n) => n > 0),
  );
  return { shot, demoEarned };
}
