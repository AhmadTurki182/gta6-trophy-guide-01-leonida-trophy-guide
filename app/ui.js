// Rendering: the roadmap, the trophy checklist, the filters and the progress
// readouts. Builds every row from the DOM API so trophy text is never parsed
// as HTML.
import { isEarned } from './state.js';

export const ROADMAP_STAGES = [
  { name: 'Chapter 1', note: 'Play the opening and finish the chapter. Do the Chapter 1 meditation spot before the chapter ends — it is the one missable trophy.' },
  { name: 'Chapter 2', note: 'Finish the chapter. Garage properties and the Scooter Bros app open here.' },
  { name: 'Chapter 3', note: 'Finish the chapter. New tools: Pay ’n’ Spray registration and the Snap Gun for jewelry jobs.' },
  { name: 'Chapter 4', note: 'Finish the chapter. Bank vaults open near the end — do the optional vault mission when it appears.' },
  { name: 'Finale', note: 'The final mission, then the platinum capstone once everything else is done.' },
  { name: 'Story mission', note: 'Six set story missions — unmissable. Finish each one and its trophy follows.' },
  { name: 'Side stories', note: 'Stranger strands and their finales. Eight strands count for Strangers & Freaks; Andy, Billy and Tyrone have their own trophies instead.' },
  { name: 'Open world', note: 'Activities, collectibles, robberies and exploration — most of the list lives here, and it all stays open after the credits.' },
  { name: 'Cleanup / 100%', note: 'Mop up the 100% completion checklist, then the platinum pops.' },
];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function kindMatches(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true || trophy.tags.includes('time-sensitive');
  if (kind === 'online') return false;
  return trophy.kind === kind || trophy.tags.includes(kind);
}

export function visibleTrophies(trophies, state, filters) {
  const q = filters.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!kindMatches(t, filters.kind)) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earnedOnly && !isEarned(state, t.name)) return false;
    if (q) {
      const hay = [t.name, t.description, t.guide, t.roadmap, ...(t.tags || [])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = 'badge ' + cls;
  s.textContent = text;
  return s;
}

function countLabel(trophy) {
  if (trophy.count === undefined) return null;
  if (trophy.id === 52 || trophy.id === 53) return '$' + trophy.count.toLocaleString('en-US');
  return String(trophy.count);
}

export function renderRoadmap(listEl, trophies, state) {
  listEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmap === stage.name);
    if (members.length === 0) continue;
    const li = document.createElement('li');
    const stageDiv = document.createElement('div');
    stageDiv.className = 'stage';
    stageDiv.textContent = stage.name + ' ';
    const small = document.createElement('small');
    small.textContent = stage.note;
    stageDiv.append(small);
    const namesDiv = document.createElement('div');
    namesDiv.className = 'stage-trophies';
    members.forEach((t, i) => {
      if (i > 0) namesDiv.append(document.createTextNode(' · '));
      const b = document.createElement('b');
      b.textContent = t.name + (isEarned(state, t.name) ? ' ✓' : '');
      if (t.missable) b.className = 'miss';
      namesDiv.append(b);
      if (t.missable) {
        const m = document.createElement('span');
        m.className = 'miss';
        m.textContent = ' (MISSABLE)';
        namesDiv.append(m);
      }
    });
    li.append(stageDiv, namesDiv);
    listEl.append(li);
  }
}

export function renderProgress(trophies, state, els) {
  const earnedCount = state.earned.length;
  const total = trophies.length;
  const pct = total === 0 ? 0 : Math.round((earnedCount / total) * 100);
  els.progressText.textContent = earnedCount + ' of ' + total + ' earned';
  els.progressPct.textContent = pct + '%';
  els.progressFill.style.width = pct + '%';
  if (els.trackerProgress) {
    els.trackerProgress.textContent = earnedCount + ' of ' + total + ' trophies earned (' + pct + '% to the platinum).';
  }
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  els.gradeChips.replaceChildren();
  for (const g of grades) {
    const got = trophies.filter((t) => t.grade === g && isEarned(state, t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    const chip = document.createElement('span');
    chip.innerHTML = '';
    const label = document.createElement('span');
    label.textContent = g.charAt(0).toUpperCase() + g.slice(1) + ' ';
    const num = document.createElement('b');
    num.textContent = got + '/' + all;
    chip.append(label, num);
    els.gradeChips.append(chip);
  }
}

function spoilerMasked(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !isEarned(state, trophy.name);
}

export function renderList(listEl, trophies, state, filters) {
  listEl.replaceChildren();
  const shown = visibleTrophies(trophies, state, filters);
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy';
    li.id = 'trophy-' + t.id;
    const earned = isEarned(state, t.name);
    if (earned) li.classList.add('earned');
    const masked = spoilerMasked(t, state);
    if (masked) li.classList.add('spoiler-hidden');

    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = earned;
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      li.dispatchEvent(new CustomEvent('trophy-toggle', { bubbles: true, detail: { name: t.name } }));
    });
    const main = document.createElement('div');
    main.className = 'trophy-main';

    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = t.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    main.append(name, desc);

    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.append(badge(t.grade, t.grade));
    if (t.kind !== 'missable') badges.append(badge(KIND_LABELS[t.kind] || t.kind, 'kind'));
    if (t.hidden) badges.append(badge('Hidden', 'hidden'));
    if (t.missable) badges.append(badge('Missable', 'missable'));
    if (t.tags.includes('time-sensitive')) badges.append(badge('Time-sensitive', 'missable'));
    const count = countLabel(t);
    if (count !== null) badges.append(badge('× ' + count, 'count'));
    main.append(badges);

    if (masked) {
      const note = document.createElement('p');
      note.className = 'spoiler-note';
      note.textContent = 'Hidden story trophy — earn it in game to reveal its name, description and guide.';
      main.append(note);
    } else {
      const guide = document.createElement('p');
      guide.className = 'trophy-guide';
      const label = document.createElement('strong');
      label.textContent = 'Guide: ';
      guide.append(label, document.createTextNode(t.guide));
      main.append(guide);

      const src = document.createElement('p');
      src.className = 'trophy-sources';
      src.append(document.createTextNode('Sources: '));
      (t.sources || []).forEach((s, i) => {
        if (i > 0) src.append(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = s.url;
        a.rel = 'noopener';
        a.textContent = s.name;
        src.append(a);
      });
      main.append(src);

      const meta = document.createElement('p');
      meta.className = 'trophy-meta';
      meta.textContent = 'Roadmap: ' + t.roadmap + (t.missable ? ' · Missable — keep a chapter save.' : '');
      main.append(meta);
    }

    head.append(box, main);
    li.append(head);
    listEl.append(li);
  }
  return shown.length;
}
