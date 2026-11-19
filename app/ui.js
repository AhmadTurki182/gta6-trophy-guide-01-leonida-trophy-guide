// Rendering for the Leonida Trophy Guide: progress, roadmap callout, filters
// and the trophy cards. All text comes from the trophy data; nothing here
// fetches from the network.
import { saveEarned, saveSettings } from './state.js';

const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

const KIND_LABEL = {
  story: 'Story',
  side: 'Side strand',
  activity: 'Activity',
  collectible: 'Collectible',
  exploration: 'Exploration',
  money: 'Money & robbery',
  platinum: 'Platinum & 100%',
};

// A story trophy whose name and description stay hidden while spoiler-free
// mode is on and the trophy is not earned yet.
export function isSpoilerHidden(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

// Does one trophy pass the current filters?
export function trophyMatches(trophy, earned, filters) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.visibility === 'visible' && trophy.hidden) return false;
  if (filters.visibility === 'hidden' && !trophy.hidden) return false;
  if (filters.earned === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.earned === 'unearned' && earned.has(trophy.name)) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.search) {
    const needle = filters.search.toLowerCase();
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

// Progress bar, counts and the per-grade breakdown in the hero.
export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const counts = document.getElementById('grade-counts');
  if (fill) fill.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
  if (text) {
    text.textContent = `${done} of ${total} earned${done === total && total > 0 ? ' — platinum time!' : ''}`;
  }
  if (counts) {
    counts.textContent = ['platinum', 'gold', 'silver', 'bronze']
      .map((grade) => {
        const ofGrade = trophies.filter((t) => t.grade === grade);
        const got = ofGrade.filter((t) => earned.has(t.name)).length;
        return `${GRADE_LABEL[grade]} ${got}/${ofGrade.length}`;
      })
      .join(' · ');
  }
}

// The missable-trophy callout under the roadmap.
export function renderMissableCallout(trophies) {
  const box = document.getElementById('missable-callout');
  if (!box) return;
  const missable = trophies.filter((t) => t.missable);
  box.textContent = `Missable trophies (${missable.length}): ${missable
    .map((t) => t.name)
    .join(' and ')}. Positive Mental Attitude is the only one that can lock you out — do the Chapter 1 balcony meditation before Chapter 1 ends. Strangers & Freaks needs Yago's timed race in Chapter 3.`;
}

// One trophy card: checkbox, official name and description, grade badge,
// missable and hidden flags, the guide in our own words, and its source.
export function buildTrophyCard(trophy, earned, spoilerOn, onToggle) {
  const card = document.createElement('article');
  card.className = 'trophy-card';
  if (earned.has(trophy.name)) card.classList.add('earned');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.name, box.checked));
  head.append(box);

  const title = document.createElement('div');
  title.className = 'trophy-title';
  const name = document.createElement('h3');
  const official = document.createElement('p');
  official.className = 'official';
  if (isSpoilerHidden(trophy, earned, spoilerOn)) {
    name.textContent = 'Hidden story trophy — earn it to reveal';
    name.classList.add('spoiler-hidden');
    official.textContent = 'Story trophy, hidden until earned (spoiler-free mode is on).';
  } else {
    name.textContent = trophy.name;
    official.textContent = `Official: ${trophy.description}`;
  }
  title.append(name, official);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `badge ${trophy.grade}`;
  gradeBadge.textContent = GRADE_LABEL[trophy.grade] || trophy.grade;
  badges.append(gradeBadge);
  const kindBadge = document.createElement('span');
  kindBadge.className = 'badge kind';
  kindBadge.textContent = KIND_LABEL[trophy.kind] || trophy.kind;
  badges.append(kindBadge);
  if (trophy.hidden) {
    const hiddenBadge = document.createElement('span');
    hiddenBadge.className = 'badge hidden-badge';
    hiddenBadge.textContent = 'Hidden on PlayStation';
    badges.append(hiddenBadge);
  }
  if (trophy.missable) {
    const missableBadge = document.createElement('span');
    missableBadge.className = 'badge missable';
    missableBadge.textContent = 'Missable — read the guide first';
    badges.append(missableBadge);
  }
  if (trophy.count) {
    const countBadge = document.createElement('span');
    countBadge.className = 'badge';
    countBadge.textContent = `Count: ${Number(trophy.count).toLocaleString('en-US')}`;
    badges.append(countBadge);
  }
  title.append(badges);
  head.append(title);
  card.append(head);

  if (isSpoilerHidden(trophy, earned, spoilerOn)) {
    const hiddenNote = document.createElement('p');
    hiddenNote.className = 'guide spoiler-hidden';
    hiddenNote.textContent = 'Guide hidden until this trophy is earned.';
    card.append(hiddenNote);
    return card;
  }

  const guide = document.createElement('p');
  guide.className = 'guide';
  const guideLabel = document.createElement('span');
  guideLabel.className = 'guide-label';
  guideLabel.textContent = 'Guide — ';
  guide.append(guideLabel, document.createTextNode(trophy.guide));
  card.append(guide);

  const source = document.createElement('p');
  source.className = 'source';
  source.append(document.createTextNode(`Source: ${trophy.source} — `));
  const link = document.createElement('a');
  link.href = trophy.sourceUrl;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = trophy.sourceUrl.replace(/^https?:\/\//, '');
  source.append(link);
  card.append(source);
  return card;
}

// Rebuild the whole trophy list for the current filters.
export function renderList(trophies, earned, filters, spoilerOn, onToggle) {
  const list = document.getElementById('trophy-list');
  if (!list) return;
  list.replaceChildren();
  const shown = trophies.filter((t) => trophyMatches(t, earned, filters));
  const count = document.getElementById('shown-count');
  if (count) count.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No trophies match these filters. Loosen a filter or clear the search.';
    list.append(empty);
    return;
  }
  for (const trophy of shown) {
    list.append(buildTrophyCard(trophy, earned, spoilerOn, onToggle));
  }
}

// Apply a screenshot mode from the URL: cover shows the main list with a
// few demo ticks, roadmap jumps to the roadmap, spoiler turns spoiler-free
// mode on, export highlights the export panel.
export function applyShotMode(shot, setSpoiler) {
  if (shot === 'roadmap') {
    document.getElementById('roadmap')?.scrollIntoView();
  } else if (shot === 'spoiler') {
    setSpoiler(true);
    document.getElementById('trophy-list')?.scrollIntoView();
  } else if (shot === 'export') {
    document.getElementById('export-panel')?.scrollIntoView();
    const status = document.getElementById('export-status');
    if (status) status.textContent = 'Example: export writes leonida-progress.json with your ticked trophies; import reads it back.';
  }
}

// Keep the filter controls in sync with the saved settings object.
export function syncFilterControls(settings) {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };
  setValue('grade-filter', settings.grade);
  setValue('kind-filter', settings.kind);
  setValue('visibility-filter', settings.visibility);
  setValue('earned-filter', settings.earned);
  const search = document.getElementById('search');
  if (search) search.value = settings.search;
  const missable = document.getElementById('missable-only');
  if (missable) missable.checked = settings.missableOnly;
  const spoiler = document.getElementById('spoiler-toggle');
  if (spoiler) spoiler.checked = settings.spoiler;
}

export { saveEarned, saveSettings };
