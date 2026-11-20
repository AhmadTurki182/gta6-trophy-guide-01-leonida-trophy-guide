'use strict';

/* Leonida Trophy Guide — tracker for the 55 GTA 6 trophies.
   Static data lives in data/trophies.json; progress lives only in this
   browser (localStorage) and can be exported to a file and imported back. */

var DATA_URL = 'data/trophies.json';
var STORAGE_KEY = 'leonida-trophy-guide-v1';

var STAGES = [
  { id: 1, title: 'Stage 1 — Play the story', blurb: 'Chapters 1 to 5, in order. Story trophies pop as you finish chapters and key missions. Do the side content that shows up along the way, and keep a manual save at the start of every chapter.' },
  { id: 2, title: 'Stage 2 — Side content as it appears', blurb: 'Character quest lines (Andy, Kenton, Billy, Randy, Tyrone, Bret), stranger strands, races, robberies and world activities. Most of these stay open after the credits, but take them when they appear.' },
  { id: 3, title: 'Stage 3 — After the credits: the 100% checklist', blurb: 'Open Progress, then Stats, then 100% Completion and work it through. This is the long grind — around 100 hours — and it carries A Long Road, the Gold for full completion.' },
  { id: 4, title: 'Stage 4 — Clean-up and the platinum', blurb: 'Sweep up whatever is left on the checklist, then Vice Got a Price! unlocks by itself the moment the other 54 are earned.' }
];

var KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online'
};

var state = {
  trophies: [],
  earned: {},
  filter: 'all',
  query: '',
  hideSpoilers: true,
  openGuide: -1
};

function loadStoredProgress() {
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    var saved = JSON.parse(raw);
    if (saved && Array.isArray(saved.earned)) {
      saved.earned.forEach(function (index) {
        if (typeof index === 'number' && index >= 0 && index < state.trophies.length) {
          state.earned[index] = true;
        }
      });
    }
    if (saved && typeof saved.hideSpoilers === 'boolean') {
      state.hideSpoilers = saved.hideSpoilers;
    }
  } catch (err) {
    /* A damaged save is ignored; the tracker starts fresh. */
  }
}

function saveProgress() {
  try {
    var earned = Object.keys(state.earned).map(function (key) { return Number(key); });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      app: 'leonida-trophy-guide',
      version: 1,
      hideSpoilers: state.hideSpoilers,
      earned: earned.sort(function (a, b) { return a - b; })
    }));
  } catch (err) {
    /* Private browsing can refuse storage; the page still works. */
  }
}

function earnedCount() {
  return Object.keys(state.earned).length;
}

function isSpoilerMasked(trophy, index) {
  return state.hideSpoilers && trophy.kind === 'story' && !state.earned[index];
}

function trophyMatches(trophy, index) {
  var filter = state.filter;
  if (filter === 'missable' && !trophy.missable) return false;
  if (filter === 'online') return false;
  if (filter !== 'all' && filter !== 'missable' && trophy.kind !== filter) return false;
  if (state.query) {
    var haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind]
      .concat(trophy.steps || []).join(' ').toLowerCase();
    if (haystack.indexOf(state.query) === -1) return false;
  }
  return true;
}

function gradeTallyText() {
  var grades = ['Platinum', 'Gold', 'Silver', 'Bronze'];
  return grades.map(function (grade) {
    var total = state.trophies.filter(function (t) { return t.grade === grade; }).length;
    var done = state.trophies.filter(function (t, i) {
      return t.grade === grade && state.earned[i];
    }).length;
    return grade + ' ' + done + '/' + total;
  }).join('  ·  ');
}

function renderProgress() {
  var total = state.trophies.length;
  var done = earnedCount();
  var pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('earned-count').textContent = String(done);
  document.getElementById('grade-tally').textContent = gradeTallyText();
  var fill = document.getElementById('progress-fill');
  fill.style.width = pct + '%';
  var bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(done));
  var note = document.getElementById('progress-note');
  if (done === 0) {
    note.textContent = 'Nothing earned yet — the road starts with Gone Fishing in Chapter 1.';
  } else if (done === total) {
    note.textContent = 'Platinum! Every trophy earned — Leonida Legend.';
  } else {
    note.textContent = pct + '% complete — ' + (total - done) + ' to go. Next: finish the stage with the most unearned trophies.';
  }
}

function renderRoadmap() {
  var grid = document.getElementById('stage-grid');
  grid.innerHTML = '';
  STAGES.forEach(function (stage) {
    var members = state.trophies
      .map(function (t, i) { return { trophy: t, index: i }; })
      .filter(function (entry) { return entry.trophy.stage === stage.id; });
    var done = members.filter(function (entry) { return state.earned[entry.index]; }).length;
    var card = document.createElement('article');
    card.className = 'stage-card';
    var title = document.createElement('h3');
    title.textContent = stage.title;
    card.appendChild(title);
    var blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    card.appendChild(blurb);
    var count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = done + ' of ' + members.length + ' earned';
    card.appendChild(count);
    var list = document.createElement('ul');
    list.className = 'stage-trophies';
    var shown = members.slice(0, 8);
    shown.forEach(function (entry) {
      var item = document.createElement('li');
      if (state.earned[entry.index]) item.className = 'is-earned';
      item.textContent = isSpoilerMasked(entry.trophy, entry.index)
        ? 'Hidden story trophy'
        : entry.trophy.name;
      list.appendChild(item);
    });
    if (members.length > shown.length) {
      var more = document.createElement('li');
      more.className = 'stage-more';
      more.textContent = '+ ' + (members.length - shown.length) + ' more in the checklist below';
      list.appendChild(more);
    }
    card.appendChild(list);
    grid.appendChild(card);
  });

  var missable = state.trophies
    .map(function (t, i) { return { trophy: t, index: i }; })
    .filter(function (entry) { return entry.trophy.missable; });
  var callout = document.getElementById('missable-callout');
  callout.innerHTML = '';
  var heading = document.createElement('h3');
  heading.textContent = 'Missable trophies — read this first';
  callout.appendChild(heading);
  if (missable.length === 0) {
    var none = document.createElement('p');
    none.textContent = 'No trophy on this list is missable.';
    callout.appendChild(none);
  } else {
    missable.forEach(function (entry) {
      var line = document.createElement('p');
      var flag = document.createElement('strong');
      flag.textContent = 'MISSABLE: ' + entry.trophy.name + ' — ';
      line.appendChild(flag);
      line.appendChild(document.createTextNode(
        'its Chapter 1 meditation with Lucia disappears after that chapter, ' +
        'and there is no mission replay. Meditate with her on the balcony ' +
        'the morning after Down to Earth, before Chapter 1 ends.'));
      callout.appendChild(line);
    });
    var saveTip = document.createElement('p');
    saveTip.textContent = 'Because there is no mission replay, keep a manual save at the start of every chapter and one more before the final mission. Everything else on the list can be finished after the story.';
    callout.appendChild(saveTip);
  }
}

function sourceLink(source) {
  if (source.url) {
    var link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }
  var span = document.createElement('span');
  span.textContent = source.name;
  return span;
}

function renderChecklist() {
  var list = document.getElementById('trophy-list');
  var intro = document.getElementById('checklist-intro');
  var empty = document.getElementById('empty-state');
  list.innerHTML = '';

  var visible = state.trophies
    .map(function (t, i) { return { trophy: t, index: i }; })
    .filter(function (entry) { return trophyMatches(entry.trophy, entry.index); });

  if (state.filter === 'online') {
    intro.textContent = 'There are no online trophies in Grand Theft Auto VI — the whole list is single-player, so this filter is empty by design.';
  } else if (state.filter === 'missable') {
    intro.textContent = 'Trophies that can be missed if you play past a point of no return. Only one is confirmed on this list.';
  } else if (state.filter === 'all') {
    intro.textContent = 'Tick a trophy off when you earn it. Open a guide for steps and sources. Story trophies stay hidden while the spoiler setting is on.';
  } else {
    intro.textContent = 'Showing ' + KIND_LABELS[state.filter] + ' trophies.';
  }

  if (visible.length === 0) {
    empty.hidden = false;
    empty.textContent = state.query
      ? 'No trophies match "' + state.query + '". Try another word.'
      : 'Nothing to show for this filter.';
    return;
  }
  empty.hidden = true;

  visible.forEach(function (entry) {
    var trophy = entry.trophy;
    var index = entry.index;
    var masked = isSpoilerMasked(trophy, index);

    var item = document.createElement('li');
    item.className = 'trophy-row' + (state.earned[index] ? ' is-earned' : '');
    item.id = 'trophy-' + index;

    var check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'earn-check';
    check.checked = !!state.earned[index];
    check.setAttribute('aria-label', 'Mark ' + (masked ? 'hidden story trophy' : trophy.name) + ' as earned');
    check.addEventListener('change', function () { toggleEarned(index, check.checked); });
    item.appendChild(check);

    var body = document.createElement('div');
    body.className = 'trophy-body';

    var head = document.createElement('div');
    head.className = 'trophy-head';
    var name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = masked ? 'Hidden story trophy' : trophy.name;
    head.appendChild(name);
    var grade = document.createElement('span');
    grade.className = 'grade grade-' + trophy.grade.toLowerCase();
    grade.textContent = trophy.grade;
    head.appendChild(grade);
    if (trophy.hidden) {
      var hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag tag-hidden';
      hiddenTag.textContent = 'Hidden';
      head.appendChild(hiddenTag);
    }
    if (trophy.missable) {
      var missTag = document.createElement('span');
      missTag.className = 'tag tag-missable';
      missTag.textContent = 'Missable';
      head.appendChild(missTag);
    }
    body.appendChild(head);

    var desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = masked
      ? 'A story trophy. Earn it in the game to reveal its name and description.'
      : trophy.description + (trophy.count ? '  (Tracked: ' + trophy.count.toLocaleString('en-US') + ')' : '');
    body.appendChild(desc);

    var meta = document.createElement('p');
    meta.className = 'trophy-meta';
    meta.textContent = KIND_LABELS[trophy.kind] + ' · Roadmap stage ' + trophy.stage;
    body.appendChild(meta);

    var guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.className = 'guide-btn';
    guideBtn.setAttribute('aria-expanded', state.openGuide === index ? 'true' : 'false');
    guideBtn.textContent = state.openGuide === index ? 'Hide guide' : 'Show guide';
    guideBtn.addEventListener('click', function () { toggleGuide(index); });
    body.appendChild(guideBtn);

    if (state.openGuide === index) {
      body.appendChild(buildGuidePanel(trophy, masked));
    }

    item.appendChild(body);
    list.appendChild(item);
  });
}

function buildGuidePanel(trophy, masked) {
  var panel = document.createElement('div');
  panel.className = 'guide-panel';
  if (masked) {
    var hidden = document.createElement('p');
    hidden.textContent = 'This guide is hidden with the story spoilers. Earn the trophy, or switch the spoiler setting off, to read it.';
    panel.appendChild(hidden);
    return panel;
  }
  var guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  panel.appendChild(guide);

  if (trophy.steps && trophy.steps.length) {
    var stepsTitle = document.createElement('h4');
    stepsTitle.textContent = 'Steps';
    panel.appendChild(stepsTitle);
    var steps = document.createElement('ol');
    steps.className = 'guide-steps';
    trophy.steps.forEach(function (step) {
      var li = document.createElement('li');
      li.textContent = step;
      steps.appendChild(li);
    });
    panel.appendChild(steps);
  }

  if (trophy.sources && trophy.sources.length) {
    var sourcesTitle = document.createElement('h4');
    sourcesTitle.textContent = 'Sources';
    panel.appendChild(sourcesTitle);
    var sources = document.createElement('ul');
    sources.className = 'guide-sources';
    trophy.sources.forEach(function (source) {
      var li = document.createElement('li');
      li.appendChild(sourceLink(source));
      sources.appendChild(li);
    });
    panel.appendChild(sources);
  }
  return panel;
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderChecklist();
}

function toggleEarned(index, earned) {
  if (earned) {
    state.earned[index] = true;
  } else {
    delete state.earned[index];
  }
  saveProgress();
  var row = document.getElementById('trophy-' + index);
  if (row) row.classList.toggle('is-earned', earned);
  renderProgress();
  renderRoadmap();
}

function toggleGuide(index) {
  state.openGuide = state.openGuide === index ? -1 : index;
  try {
    var hash = state.openGuide === -1 ? '' : '#trophy-' + state.openGuide;
    window.history.replaceState(null, '', hash || window.location.pathname + window.location.search);
  } catch (err) {
    /* History may be unavailable; the guide still opens. */
  }
  renderChecklist();
  if (state.openGuide !== -1) {
    var row = document.getElementById('trophy-' + state.openGuide);
    if (row) row.scrollIntoView({ block: 'nearest' });
  }
}

function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll('#filters .chip').forEach(function (chip) {
    chip.classList.toggle('is-active', chip.getAttribute('data-filter') === filter);
  });
  renderChecklist();
}

function setStatus(message) {
  document.getElementById('toolbar-status').textContent = message;
}

function exportProgress() {
  var earned = Object.keys(state.earned).map(function (key) { return Number(key); })
    .sort(function (a, b) { return a - b; });
  var payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: earned
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  setStatus('Progress exported: ' + earned.length + ' of ' + state.trophies.length + ' trophies.');
}

function importProgress(file) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(String(reader.result));
      var earned = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(earned)) throw new Error('bad file');
      var next = {};
      var applied = 0;
      earned.forEach(function (index) {
        if (typeof index === 'number' && index >= 0 && index < state.trophies.length) {
          next[index] = true;
          applied += 1;
        }
      });
      state.earned = next;
      saveProgress();
      renderAll();
      setStatus('Progress imported: ' + applied + ' trophies marked earned.');
    } catch (err) {
      setStatus('That file could not be imported. Export progress first, then import the same kind of file.');
    }
  };
  reader.readAsText(file);
}

function applyHash() {
  var hash = window.location.hash || '';
  var trophyMatch = hash.match(/trophy-(\d+)/);
  var filterMatch = hash.match(/filter=([a-z]+)/);
  if (filterMatch && (filterMatch[1] === 'all' || KIND_LABELS[filterMatch[1]])) {
    setFilter(filterMatch[1]);
  }
  if (trophyMatch) {
    var index = Number(trophyMatch[1]);
    if (index >= 0 && index < state.trophies.length) {
      state.openGuide = index;
      renderChecklist();
      var row = document.getElementById('trophy-' + index);
      if (row) row.scrollIntoView();
    }
  }
}

function bindControls() {
  document.getElementById('search').addEventListener('input', function (event) {
    state.query = event.target.value.trim().toLowerCase();
    renderChecklist();
  });
  document.querySelectorAll('#filters .chip').forEach(function (chip) {
    chip.addEventListener('click', function () { setFilter(chip.getAttribute('data-filter')); });
  });
  document.getElementById('spoiler-toggle').addEventListener('change', function (event) {
    state.hideSpoilers = event.target.checked;
    saveProgress();
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-btn').addEventListener('click', function () {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', function (event) {
    if (event.target.files && event.target.files[0]) importProgress(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      state.earned = {};
      state.openGuide = -1;
      saveProgress();
      renderAll();
      setStatus('Progress cleared.');
    }
  });
}

function loadTrophies() {
  return window.fetch(DATA_URL).then(function (response) {
    if (!response.ok) throw new Error('trophies.json could not be loaded');
    return response.json();
  }).then(function (data) {
    var list = Array.isArray(data) ? data : data.trophies;
    if (!Array.isArray(list) || list.length === 0) throw new Error('no trophies in data');
    state.trophies = list;
    loadStoredProgress();
    document.getElementById('spoiler-toggle').checked = state.hideSpoilers;
    bindControls();
    renderAll();
    applyHash();
  }).catch(function (err) {
    document.getElementById('checklist-intro').textContent =
      'The trophy data could not be loaded. Serve this folder with a static server and reload.';
    document.getElementById('empty-state').hidden = false;
    document.getElementById('empty-state').textContent = String(err && err.message ? err.message : err);
  });
}

document.addEventListener('DOMContentLoaded', loadTrophies);
