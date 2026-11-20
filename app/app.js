'use strict';

var STORAGE_KEY = 'leonida-trophy-guide-v1';
var SPOILER_KEY = 'leonida-trophy-guide-spoilers';
var state = { earned: {}, spoilers: false, filter: 'all', grade: 'all', query: '' };
var trophies = [];

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') state.earned = parsed;
    }
  } catch (e) { state.earned = {}; }
  try { state.spoilers = localStorage.getItem(SPOILER_KEY) === '1'; } catch (e) { state.spoilers = false; }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.earned)); } catch (e) { /* storage unavailable */ }
}

function saveSpoilers() {
  try { localStorage.setItem(SPOILER_KEY, state.spoilers ? '1' : '0'); } catch (e) { /* storage unavailable */ }
}

function earnedCount() {
  return trophies.filter(function (t) { return state.earned[t.id]; }).length;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isStory(t) { return t.category === 'story'; }

function spoilerHidden(t) {
  return state.spoilers && t.hidden && !state.earned[t.id];
}

function matches(t) {
  if (state.filter === 'story' && !isStory(t)) return false;
  if (state.filter === 'missable' && !t.missable) return false;
  if (state.filter === 'collectibles' && t.category !== 'collectibles') return false;
  if (state.filter === 'activities' && t.category !== 'activities') return false;
  if (state.filter === 'earned' && !state.earned[t.id]) return false;
  if (state.filter === 'todo' && state.earned[t.id]) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.query) {
    var q = state.query.toLowerCase();
    var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (hay.indexOf(q) === -1) return false;
  }
  return true;
}

function renderProgress() {
  var total = trophies.length;
  var done = earnedCount();
  document.getElementById('earned-count').textContent = String(done);
  document.getElementById('bar-fill').style.width = total ? Math.round(done / total * 100) + '%' : '0%';
  var grades = ['platinum', 'gold', 'silver', 'bronze'];
  var parts = grades.map(function (g) {
    var have = trophies.filter(function (t) { return t.grade === g && state.earned[t.id]; }).length;
    var all = trophies.filter(function (t) { return t.grade === g; }).length;
    return gradeLabel(g) + ' ' + have + '/' + all;
  });
  document.getElementById('grade-counts').textContent = parts.join('  ·  ');
}

function trophyNode(t) {
  var li = document.createElement('li');
  li.className = 'trophy grade-' + t.grade + (state.earned[t.id] ? ' earned' : '');
  li.dataset.id = String(t.id);

  var check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = !!state.earned[t.id];
  check.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  check.addEventListener('change', function () {
    if (check.checked) state.earned[t.id] = true; else delete state.earned[t.id];
    saveState();
    renderAll();
  });

  var body = document.createElement('div');
  body.className = 'trophy-body';

  var head = document.createElement('div');
  head.className = 'trophy-head';
  var name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = t.name;
  var badge = document.createElement('span');
  badge.className = 'grade-badge';
  badge.textContent = gradeLabel(t.grade);
  head.appendChild(name);
  head.appendChild(badge);
  if (t.missable) {
    var flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = 'Missable';
    head.appendChild(flag);
  }
  if (t.hidden) {
    var hid = document.createElement('span');
    hid.className = 'hidden-flag';
    hid.textContent = 'Hidden';
    head.appendChild(hid);
  }
  if (t.count) {
    var cnt = document.createElement('span');
    cnt.className = 'count-flag';
    cnt.textContent = 'Target: ' + Number(t.count).toLocaleString('en-US');
    head.appendChild(cnt);
  }

  var desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = spoilerHidden(t) ? 'Hidden trophy — earn it to reveal the description.' : t.description;

  var guideBtn = document.createElement('button');
  guideBtn.className = 'guide-btn';
  guideBtn.textContent = spoilerHidden(t) ? 'Guide hidden until earned' : 'How to earn it';
  var guide = document.createElement('p');
  guide.className = 'trophy-guide';
  guide.hidden = true;
  guide.textContent = t.guide;
  guideBtn.addEventListener('click', function () {
    if (spoilerHidden(t)) return;
    guide.hidden = !guide.hidden;
    guideBtn.textContent = guide.hidden ? 'How to earn it' : 'Hide guide';
  });

  var meta = document.createElement('p');
  meta.className = 'trophy-meta';
  meta.textContent = 'Roadmap stage ' + t.stage + ' · ' + t.category;

  body.appendChild(head);
  body.appendChild(desc);
  body.appendChild(guideBtn);
  body.appendChild(guide);
  body.appendChild(meta);
  li.appendChild(check);
  li.appendChild(body);
  return li;
}

function renderList() {
  var list = document.getElementById('trophy-list');
  list.textContent = '';
  var shown = trophies.filter(matches);
  shown.forEach(function (t) { list.appendChild(trophyNode(t)); });
  document.getElementById('shown-count').textContent = '(' + shown.length + ' shown)';
  document.getElementById('empty-note').hidden = shown.length !== 0;
}

function renderSpoilerNote() {
  var note = document.getElementById('spoiler-note');
  note.textContent = state.spoilers
    ? 'Spoiler protection is on: story trophy descriptions and guides stay hidden until you earn them.'
    : 'Spoiler protection is off: story trophy details are visible.';
  document.getElementById('spoiler-toggle').checked = state.spoilers;
}

function renderAll() {
  renderProgress();
  renderList();
  renderSpoilerNote();
}

function exportProgress() {
  var ids = trophies.filter(function (t) { return state.earned[t.id]; }).map(function (t) { return t.id; });
  var blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide', earned: ids }, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function importProgress(file) {
  var reader = new FileReader();
  reader.addEventListener('load', function () {
    try {
      var parsed = JSON.parse(String(reader.result));
      var ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      var next = {};
      ids.forEach(function (id) {
        var n = Number(id);
        if (trophies.some(function (t) { return t.id === n; })) next[n] = true;
      });
      state.earned = next;
      saveState();
      renderAll();
    } catch (e) {
      window.alert('That file is not a Leonida Trophy Guide progress export.');
    }
  });
  reader.readAsText(file);
}

function wire() {
  document.getElementById('search').addEventListener('input', function (e) {
    state.query = e.target.value.trim();
    renderList();
  });
  document.getElementById('filters').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    state.filter = btn.dataset.filter;
    var buttons = document.querySelectorAll('#filters button');
    buttons.forEach(function (b) { b.classList.toggle('on', b === btn); });
    renderList();
  });
  document.getElementById('grade-filter').addEventListener('change', function (e) {
    state.grade = e.target.value;
    renderList();
  });
  document.getElementById('spoiler-toggle').addEventListener('change', function (e) {
    state.spoilers = e.target.checked;
    saveSpoilers();
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-file').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (window.confirm('Clear all earned trophies?')) {
      state.earned = {};
      saveState();
      renderAll();
    }
  });
}

fetch('data/trophies.json')
  .then(function (r) { if (!r.ok) throw new Error('trophies.json failed to load'); return r.json(); })
  .then(function (data) {
    trophies = data.trophies.slice().sort(function (a, b) { return a.id - b.id; });
    loadState();
    wire();
    renderAll();
  })
  .catch(function () {
    document.getElementById('trophy-list').textContent = 'Could not load the trophy list.';
  });
