/* Leonida Trophy Guide — tracker logic.
   Loads app/data/trophies.json (a file inside app/, never the network),
   keeps earned progress in localStorage, and renders the checklist,
   the roadmap, the missable list and the spoiler-safe view. */
(function () {
  "use strict";

  var STORE_KEY = "leonida-trophy-progress-v1";
  var SPOILER_KEY = "leonida-trophy-spoiler-v1";
  var DATA_URL = "data/trophies.json";

  var trophies = [];
  var roadmap = [];
  var earned = {};
  var spoilerOn = false;
  var activeFilter = "all";
  var activeGrade = "";
  var query = "";
  var selectedId = null;
  var currentView = "checklist";

  var listEl = document.getElementById("trophyList");
  var detailEl = document.getElementById("detail");
  var missableEl = document.getElementById("missableList");
  var roadmapEl = document.getElementById("roadmapList");
  var searchEl = document.getElementById("search");
  var gradeEl = document.getElementById("gradeFilter");
  var spoilerEl = document.getElementById("spoilerToggle");
  var countEl = document.getElementById("resultCount");
  var earnedEl = document.getElementById("earnedCount");
  var fillEl = document.getElementById("progressFill");
  var pctEl = document.getElementById("progressPct");

  function loadStored() {
    try { earned = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; }
    catch (e) { earned = {}; }
    spoilerOn = localStorage.getItem(SPOILER_KEY) === "1";
    spoilerEl.checked = spoilerOn;
  }

  function saveStored() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(earned));
      localStorage.setItem(SPOILER_KEY, spoilerOn ? "1" : "0");
    } catch (e) { /* private mode: progress just does not persist */ }
  }

  function isEarned(t) { return !!earned[t.id]; }
  function isStory(t) { return t.kind === "story"; }
  function isSpoiled(t) { return spoilerOn && isStory(t) && !isEarned(t); }

  function gradeLabel(g) {
    return g.charAt(0).toUpperCase() + g.slice(1);
  }

  function kindLabel(t) {
    if (t.kind === "story") return "Story";
    if (t.kind === "collectible") return "Collectible";
    if (t.kind === "activity") return "Activity";
    return "Leonida";
  }

  function visibleName(t) {
    return isSpoiled(t) ? "Hidden story trophy" : t.name;
  }

  function visibleDesc(t) {
    return isSpoiled(t) ? "Hidden until earned — turn the spoiler setting off to see it." : t.description;
  }

  function matchesFilter(t) {
    if (activeGrade && t.grade !== activeGrade) return false;
    if (activeFilter === "story" && !isStory(t)) return false;
    if (activeFilter === "missable" && !t.missable) return false;
    if (activeFilter === "collectible" && t.kind !== "collectible") return false;
    if (activeFilter === "activity" && t.kind !== "activity") return false;
    if (activeFilter === "earned" && !isEarned(t)) return false;
    if (activeFilter === "remaining" && isEarned(t)) return false;
    if (query) {
      var hay = (t.name + " " + t.description + " " + (t.guide || "")).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function tagHtml(t) {
    var out = '<span class="grade ' + t.grade + '">' + gradeLabel(t.grade) + "</span>";
    out += '<span class="tag kind">' + kindLabel(t) + "</span>";
    if (t.missable) out += '<span class="tag miss">MISSABLE</span>';
    if (t.hidden) out += '<span class="tag hidden">Hidden</span>';
    if (t.count) out += '<span class="tag count">PSN count: ' + t.count + "</span>";
    return out;
  }

  function itemHtml(t) {
    var cls = "item" + (isEarned(t) ? " earned" : "") + (selectedId === t.id ? " selected" : "");
    return '<li class="' + cls + '" data-id="' + t.id + '">' +
      '<input type="checkbox" ' + (isEarned(t) ? "checked" : "") + ' aria-label="Earned: ' + escapeHtml(visibleName(t)) + '">' +
      '<div class="body"><div class="name">' + escapeHtml(visibleName(t)) + "</div>" +
      '<div class="desc">' + escapeHtml(visibleDesc(t)) + "</div>" +
      '<div class="meta">' + tagHtml(t) + "</div></div></li>";
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function renderList() {
    var shown = trophies.filter(matchesFilter);
    listEl.innerHTML = shown.map(itemHtml).join("");
    countEl.textContent = shown.length + " of 55 trophies shown" +
      (activeFilter !== "all" ? " — filter: " + activeFilter : "") +
      (query ? ' — search: "' + query + '"' : "");
    var miss = trophies.filter(function (t) { return t.missable; });
    missableEl.innerHTML = miss.map(itemHtml).join("");
  }

  function renderProgress() {
    var n = trophies.filter(isEarned).length;
    var total = trophies.length || 55;
    earnedEl.textContent = String(n);
    fillEl.style.width = Math.round(n / total * 100) + "%";
    pctEl.textContent = Math.round(n / total * 100) + "% to the platinum — " +
      (total - n) + " to go";
  }

  function renderDetail() {
    var t = null;
    for (var i = 0; i < trophies.length; i++) {
      if (trophies[i].id === selectedId) { t = trophies[i]; break; }
    }
    if (!t) {
      detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide, its sources and when it can be missed.</p>';
      return;
    }
    var html = "<h3>" + escapeHtml(visibleName(t)) + "</h3>" +
      '<p class="official">Official: "' + escapeHtml(visibleDesc(t)) + '"</p>' +
      '<div class="meta">' + tagHtml(t) + "</div>";
    if (t.missable) {
      html += '<p class="warn"><strong>Missable.</strong> Do this before the finale or while the moment is available — see the guide below.</p>';
    }
    if (isSpoiled(t)) {
      html += '<p class="guide">This story trophy is hidden until you earn it. Turn the spoiler setting off, or tick it earned, to read its guide.</p>';
    } else {
      html += '<p class="guide">' + escapeHtml(t.guide || "") + "</p>";
    }
    var src = (t.sources || []).map(escapeHtml).join("; ");
    html += '<p class="sources"><strong>Sources:</strong> ' + src +
      ". Guide written in our own words from the official description; where the official list pins down no place or step, the guide says so.</p>";
    detailEl.innerHTML = html;
  }

  function stageCount(stage) {
    var list = trophies.filter(function (t) { return t.stage === stage; });
    var done = list.filter(isEarned).length;
    return done + " / " + list.length + " earned";
  }

  function renderRoadmap() {
    roadmapEl.innerHTML = roadmap.map(function (s) {
      return "<li><div class=\"stage-head\"><h3>Stage " + s.stage + " — " +
        escapeHtml(s.title) + "</h3><span class=\"stage-count\">" +
        stageCount(s.stage) + "</span></div><p>" + escapeHtml(s.text) + "</p></li>";
    }).join("");
  }

  function renderAll() {
    renderList();
    renderProgress();
    renderDetail();
    renderRoadmap();
  }

  function setView(view) {
    currentView = view;
    var views = ["checklist", "roadmap", "missable", "sources"];
    views.forEach(function (v) {
      var section = document.getElementById("view-" + v);
      if (section) section.hidden = (v !== view);
    });
    var tabs = document.querySelectorAll(".tab");
    tabs.forEach(function (tab) {
      tab.classList.toggle("active", tab.getAttribute("data-view") === view);
    });
    if (view === "roadmap") renderRoadmap();
  }

  function exportProgress() {
    var payload = {
      app: "leonida-trophy-guide",
      exportedAt: new Date().toISOString(),
      earned: Object.keys(earned).filter(function (k) { return earned[k]; }).map(Number),
      spoiler: spoilerOn
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "leonida-trophy-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var ids = Array.isArray(data.earned) ? data.earned : (Array.isArray(data) ? data : []);
        var next = {};
        ids.forEach(function (id) { next[Number(id)] = true; });
        earned = next;
        if (typeof data.spoiler === "boolean") {
          spoilerOn = data.spoiler;
          spoilerEl.checked = spoilerOn;
        }
        saveStored();
        renderAll();
        countEl.textContent = "Progress imported: " + ids.length + " trophies earned.";
      } catch (e) {
        countEl.textContent = "That file could not be imported — it is not a progress export from this guide.";
      }
    };
    reader.readAsText(file);
  }

  function toggleEarned(id) {
    if (earned[id]) { delete earned[id]; } else { earned[id] = true; }
    saveStored();
    renderAll();
  }

  function bindEvents() {
    listEl.addEventListener("click", function (ev) {
      var li = ev.target.closest("li[data-id]");
      if (!li) return;
      var id = Number(li.getAttribute("data-id"));
      if (ev.target.tagName === "INPUT") { toggleEarned(id); return; }
      selectedId = id;
      renderList();
      renderDetail();
    });
    missableEl.addEventListener("click", function (ev) {
      var li = ev.target.closest("li[data-id]");
      if (!li) return;
      var id = Number(li.getAttribute("data-id"));
      if (ev.target.tagName === "INPUT") { toggleEarned(id); return; }
      selectedId = id;
      setView("checklist");
      renderList();
      renderDetail();
    });
    searchEl.addEventListener("input", function () {
      query = searchEl.value.trim().toLowerCase();
      renderList();
    });
    gradeEl.addEventListener("change", function () {
      activeGrade = gradeEl.value;
      renderList();
    });
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter");
        renderList();
      });
    });
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var view = tab.getAttribute("data-view");
        if (location.hash !== "#/" + view) location.hash = "#/" + view;
        setView(view);
      });
    });
    window.addEventListener("hashchange", function () {
      var view = location.hash.replace("#/", "") || "checklist";
      if (["checklist", "roadmap", "missable", "sources"].indexOf(view) !== -1) setView(view);
    });
    spoilerEl.addEventListener("change", function () {
      spoilerOn = spoilerEl.checked;
      saveStored();
      renderAll();
    });
    document.getElementById("exportBtn").addEventListener("click", exportProgress);
    document.getElementById("importBtn").addEventListener("click", function () {
      document.getElementById("importFile").click();
    });
    document.getElementById("importFile").addEventListener("change", function (ev) {
      if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
      ev.target.value = "";
    });
    document.getElementById("resetBtn").addEventListener("click", function () {
      if (!window.confirm("Clear all earned trophies?")) return;
      earned = {};
      saveStored();
      renderAll();
    });
  }

  function boot() {
    loadStored();
    bindEvents();
    var initial = location.hash.replace("#/", "") || "checklist";
    if (["checklist", "roadmap", "missable", "sources"].indexOf(initial) !== -1) {
      currentView = initial;
    }
    fetch(DATA_URL).then(function (res) { return res.json(); }).then(function (data) {
      trophies = data.trophies || [];
      roadmap = data.roadmap || [];
      setView(currentView);
      renderAll();
    }).catch(function () {
      listEl.innerHTML = "<li class=\"item\"><div class=\"body\"><div class=\"name\">Could not load the trophy list</div>" +
        "<div class=\"desc\">app/data/trophies.json did not load. Serve app/ from a static server and reload.</div></div></li>";
    });
  }

  boot();
})();
