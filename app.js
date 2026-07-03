// Prep Tracker — app logic. No framework, no backend, localStorage only.

const STORAGE_KEYS = {
  days: "prepTracker.days",
  materials: "prepTracker.materials",
  mocks: "prepTracker.mocks",
  openWeeks: "prepTracker.openWeeks",
  settings: "prepTracker.settings",
};

const DAY_MS = 24 * 60 * 60 * 1000;

const WEEK_PHASES = {
  1: "Basics",
  2: "Intermediate",
  3: "Behavioral",
  4: "Advanced",
  5: "Applications",
};

// ---------- State load/save ----------

function loadState() {
  let days = readJSON(STORAGE_KEYS.days);
  if (!days) {
    days = JSON.parse(JSON.stringify(SEED_DAYS));
    // tasks stored as objects with done flag for per-task checkboxes
    days = days.map((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (typeof t === "string" ? { text: t, done: false } : t)),
      completedAt: d.completedAt || null,
    }));
    writeJSON(STORAGE_KEYS.days, days);
  } else {
    // migrate days saved before completedAt tracking existed
    days = days.map((d) => (d.completedAt !== undefined ? d : { ...d, completedAt: null }));
  }

  let materials = readJSON(STORAGE_KEYS.materials);
  if (!materials) {
    materials = JSON.parse(JSON.stringify(SEED_MATERIALS));
    writeJSON(STORAGE_KEYS.materials, materials);
  }

  let mocks = readJSON(STORAGE_KEYS.mocks);
  if (!mocks) {
    mocks = JSON.parse(JSON.stringify(SEED_MOCK_TESTS));
    writeJSON(STORAGE_KEYS.mocks, mocks);
  }

  let openWeeks = readJSON(STORAGE_KEYS.openWeeks);
  if (!openWeeks) {
    openWeeks = { 1: true, 2: false, 3: false, 4: false, 5: false };
    writeJSON(STORAGE_KEYS.openWeeks, openWeeks);
  }

  let settings = readJSON(STORAGE_KEYS.settings);
  if (!settings) {
    settings = { theme: "dark", startDate: null, paused: false, pauseHistory: [] };
    writeJSON(STORAGE_KEYS.settings, settings);
  }

  return { days, materials, mocks, openWeeks, settings };
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to read", key, e);
    return null;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const state = loadState();

function saveDays() { writeJSON(STORAGE_KEYS.days, state.days); }
function saveMaterials() { writeJSON(STORAGE_KEYS.materials, state.materials); }
function saveMocks() { writeJSON(STORAGE_KEYS.mocks, state.mocks); }
function saveOpenWeeks() { writeJSON(STORAGE_KEYS.openWeeks, state.openWeeks); }
function saveSettings() { writeJSON(STORAGE_KEYS.settings, state.settings); }

// ---------- Utilities ----------

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let toastTimer = null;
function showToast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

const ENCOURAGEMENTS = [
  "Nice work — one step closer.",
  "Logged. Keep the streak going.",
  "That's progress worth noting.",
  "Done and saved.",
  "Good pace — keep it up.",
];

function randomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

// ---------- Dashboard ----------

function computeStreak(days) {
  const sorted = [...days].sort((a, b) => b.id - a.id);
  let streak = 0;
  for (const d of sorted) {
    if (d.completed) streak++;
    else break;
  }
  return streak;
}

function renderDashboard() {
  const totalDays = state.days.length;
  const completedDays = state.days.filter((d) => d.completed).length;
  const pct = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;
  const streak = computeStreak(state.days);
  const mocksLogged = state.mocks.length;
  const materialsCount = state.materials.length;

  const el = document.getElementById("dashboard");
  el.innerHTML = `
    <div class="stat-card accent-terracotta">
      <div class="stat-value">${pct}%</div>
      <div class="stat-label">Overall complete</div>
    </div>
    <div class="stat-card accent-sage">
      <div class="stat-value">${streak}</div>
      <div class="stat-label">Day streak</div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-value">${mocksLogged}/4</div>
      <div class="stat-label">Mock tests logged</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${materialsCount}</div>
      <div class="stat-label">Materials saved</div>
    </div>
  `;
}

// ---------- Plan tab ----------

function renderPlan() {
  const container = document.getElementById("tab-plan");
  const weeks = [1, 2, 3, 4, 5];
  container.innerHTML = weeks.map((weekNum) => renderWeekGroup(weekNum)).join("");

  // wire up week toggles
  container.querySelectorAll(".week-header").forEach((btn) => {
    btn.addEventListener("click", () => {
      const week = Number(btn.dataset.week);
      state.openWeeks[week] = !state.openWeeks[week];
      saveOpenWeeks();
      renderPlan();
    });
  });

  // day checkboxes
  container.querySelectorAll(".day-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = Number(cb.dataset.id);
      const day = state.days.find((d) => d.id === id);
      day.completed = cb.checked;
      day.completedAt = cb.checked ? new Date().toISOString() : null;
      saveDays();
      if (cb.checked) showToast(randomEncouragement());
      renderDashboard();
      renderPlan();
      renderPace();
    });
  });

  // task checkboxes
  container.querySelectorAll(".task-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      const dayId = Number(cb.dataset.dayId);
      const taskIdx = Number(cb.dataset.taskIdx);
      const day = state.days.find((d) => d.id === dayId);
      day.tasks[taskIdx].done = cb.checked;
      saveDays();
      renderPlan();
    });
  });

  // notes
  container.querySelectorAll(".day-note").forEach((textarea) => {
    const save = () => {
      const id = Number(textarea.dataset.id);
      const day = state.days.find((d) => d.id === id);
      day.note = textarea.value;
      saveDays();
    };
    textarea.addEventListener("blur", save);
    textarea.addEventListener("change", save);
  });
}

function renderWeekGroup(weekNum) {
  const weekDays = state.days.filter((d) => d.week === weekNum);
  const completedCount = weekDays.filter((d) => d.completed).length;
  const progressPct = weekDays.length ? Math.round((completedCount / weekDays.length) * 100) : 0;
  const isOpen = !!state.openWeeks[weekNum];
  const phase = WEEK_PHASES[weekNum];

  return `
    <div class="week-group ${isOpen ? "open" : ""}">
      <button class="week-header" data-week="${weekNum}" aria-expanded="${isOpen}">
        <div class="week-title-block">
          <h2>Week ${weekNum}</h2>
          <div class="week-phase">${phase} · Days ${weekDays[0]?.id}–${weekDays[weekDays.length - 1]?.id} · ${completedCount}/${weekDays.length} done</div>
        </div>
        <div class="week-progress-track">
          <div class="week-progress-fill" style="width:${progressPct}%"></div>
        </div>
        <span class="week-chevron">▶</span>
      </button>
      <div class="week-days">
        ${weekDays.map(renderDayCard).join("")}
      </div>
    </div>
  `;
}

function renderDayCard(day) {
  const classes = ["day-card"];
  if (day.isMockTest) classes.push("mock-test");
  if (day.completed) classes.push("completed");

  const tasksHTML = day.tasks
    .map(
      (t, idx) => `
      <li>
        <input type="checkbox" class="task-checkbox" data-day-id="${day.id}" data-task-idx="${idx}" ${t.done ? "checked" : ""} id="task-${day.id}-${idx}" />
        <label for="task-${day.id}-${idx}" class="${t.done ? "task-done" : ""}">${escapeHTML(t.text)}</label>
      </li>`
    )
    .join("");

  const resourcesHTML = day.resources
    .map(
      (r) => `<a class="resource-link" href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(r.label)} ↗</a>`
    )
    .join("");

  return `
    <div class="${classes.join(" ")}">
      <div class="day-checkbox-wrap">
        <input type="checkbox" class="day-checkbox" data-id="${day.id}" ${day.completed ? "checked" : ""} aria-label="Mark Day ${day.id} complete" />
      </div>
      <div class="day-body">
        <div class="day-top-row">
          <span class="day-number">Day ${day.id}</span>
          <span class="day-title">${escapeHTML(day.title)}</span>
          ${day.isMockTest ? '<span class="mock-badge">Mock test</span>' : ""}
        </div>
        <ul class="day-tasks">${tasksHTML}</ul>
        ${day.resources.length ? `<div class="day-resources">${resourcesHTML}</div>` : ""}
        <textarea class="day-note" data-id="${day.id}" placeholder="Notes for this day...">${escapeHTML(day.note)}</textarea>
      </div>
    </div>
  `;
}

// ---------- Materials tab ----------

let materialSearchQuery = "";

function renderMaterials() {
  const listEl = document.getElementById("materials-list");
  const query = materialSearchQuery.trim().toLowerCase();

  let items = [...state.materials].sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1));
  if (query) {
    items = items.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (items.length === 0) {
    listEl.innerHTML = `<div class="empty-state">${
      query ? "Nothing matches that search yet." : "Nothing saved yet — add a link above to start your library."
    }</div>`;
    return;
  }

  listEl.innerHTML = items
    .map(
      (m) => `
    <div class="list-card" data-id="${m.id}">
      <div>
        <div class="item-title"><a href="${escapeHTML(m.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(m.title)} ↗</a></div>
        <div class="item-meta">Added ${escapeHTML(m.dateAdded)}</div>
        <div class="pill-row">
          <span class="pill type-pill">${escapeHTML(m.type)}</span>
          ${m.tags.map((t) => `<span class="pill">${escapeHTML(t)}</span>`).join("")}
        </div>
      </div>
      <button class="remove-btn" data-remove-material="${m.id}">Remove</button>
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll("[data-remove-material]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.removeMaterial);
      state.materials = state.materials.filter((m) => m.id !== id);
      saveMaterials();
      renderMaterials();
      renderDashboard();
    });
  });
}

function initMaterialForm() {
  const form = document.getElementById("material-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("mat-title").value.trim();
    const url = document.getElementById("mat-url").value.trim();
    const type = document.getElementById("mat-type").value;
    const tagsRaw = document.getElementById("mat-tags").value.trim();
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    if (!title || !url) return;

    const nextId = state.materials.length
      ? Math.max(...state.materials.map((m) => m.id)) + 1
      : 1;

    state.materials.push({
      id: nextId,
      title,
      url,
      type,
      tags,
      dateAdded: new Date().toISOString().slice(0, 10),
    });
    saveMaterials();
    form.reset();
    showToast("Saved to your library.");
    renderMaterials();
    renderDashboard();
  });

  document.getElementById("material-search").addEventListener("input", (e) => {
    materialSearchQuery = e.target.value;
    renderMaterials();
  });
}

// ---------- Mock tests tab ----------

function renderMocks() {
  const listEl = document.getElementById("mocks-list");
  const trendEl = document.getElementById("mock-trend");
  const items = [...state.mocks].sort((a, b) => (a.date < b.date ? 1 : -1));

  if (items.length === 0) {
    listEl.innerHTML = `<div class="empty-state">No mock tests logged yet — your first one is scheduled for Day 14. You've got this.</div>`;
    trendEl.innerHTML = "";
    return;
  }

  listEl.innerHTML = items
    .map(
      (m) => `
    <div class="list-card" data-id="${m.id}">
      <div>
        <div class="item-title">${escapeHTML(m.type)} — ${escapeHTML(m.score || "no score")}</div>
        <div class="item-meta">${escapeHTML(m.date)}</div>
        ${m.notes ? `<div class="item-notes">${escapeHTML(m.notes)}</div>` : ""}
      </div>
      <button class="remove-btn" data-remove-mock="${m.id}">Remove</button>
    </div>
  `
    )
    .join("");

  listEl.querySelectorAll("[data-remove-mock]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.removeMock);
      state.mocks = state.mocks.filter((m) => m.id !== id);
      saveMocks();
      renderMocks();
      renderDashboard();
    });
  });

  renderMockTrend(items, trendEl);
}

function renderMockTrend(items, trendEl) {
  // Parse numeric scores like "7/10" -> 0.7; skip anything unparseable.
  const points = [...items]
    .reverse()
    .map((m) => {
      const match = String(m.score || "").match(/(\d+(\.\d+)?)\s*\/\s*(\d+(\.\d+)?)/);
      if (!match) return null;
      const val = parseFloat(match[1]) / parseFloat(match[3]);
      return { date: m.date, val };
    })
    .filter(Boolean);

  if (points.length < 2) {
    trendEl.innerHTML = "";
    return;
  }

  const width = 600;
  const height = 120;
  const pad = 16;
  const stepX = (width - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = height - pad - p.val * (height - pad * 2);
    return { x, y, date: p.date };
  });

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const dots = coords
    .map((c) => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="#E76F51" />`)
    .join("");

  trendEl.innerHTML = `
    <div class="trend-chart">
      <h3>Score trend</h3>
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Mock test score trend over time">
        <path d="${pathD}" fill="none" stroke="#84A98C" stroke-width="2.5" />
        ${dots}
      </svg>
    </div>
  `;
}

function initMockForm() {
  const form = document.getElementById("mock-form");
  const dateInput = document.getElementById("mock-date");
  dateInput.valueAsDate = new Date();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("mock-date").value;
    const type = document.getElementById("mock-type").value;
    const score = document.getElementById("mock-score").value.trim();
    const notes = document.getElementById("mock-notes").value.trim();

    if (!date) return;

    const nextId = state.mocks.length ? Math.max(...state.mocks.map((m) => m.id)) + 1 : 1;
    state.mocks.push({ id: nextId, date, type, score, notes });
    saveMocks();
    form.reset();
    dateInput.valueAsDate = new Date();
    showToast("Mock test logged. " + randomEncouragement());
    renderMocks();
    renderDashboard();
  });
}

// ---------- Theme ----------

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.settings.theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = state.settings.theme === "dark" ? "Light mode" : "Dark mode";
}

function initThemeToggle() {
  document.getElementById("theme-toggle").addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    saveSettings();
    applyTheme();
  });
}

// ---------- Pace tracker ----------

function getPausedMs(uptoTime) {
  let total = 0;
  for (const seg of state.settings.pauseHistory) {
    const start = new Date(seg.pausedAt).getTime();
    const end = seg.resumedAt ? new Date(seg.resumedAt).getTime() : uptoTime;
    total += Math.max(0, end - start);
  }
  return total;
}

function getEffectiveNow() {
  if (state.settings.paused && state.settings.pauseHistory.length) {
    const last = state.settings.pauseHistory[state.settings.pauseHistory.length - 1];
    return new Date(last.pausedAt).getTime();
  }
  return Date.now();
}

function getElapsedMs() {
  if (!state.settings.startDate) return null;
  const start = new Date(state.settings.startDate + "T00:00:00").getTime();
  const now = getEffectiveNow();
  const paused = getPausedMs(now);
  return Math.max(0, now - start - paused);
}

function getExpectedDay() {
  const elapsed = getElapsedMs();
  if (elapsed === null) return null;
  const dayNum = Math.floor(elapsed / DAY_MS) + 1;
  return Math.min(35, Math.max(1, dayNum));
}

function getScheduleStatus() {
  const expectedDay = getExpectedDay();
  if (expectedDay === null) return null;
  const completedCount = state.days.filter((d) => d.completed).length;
  const diff = completedCount - expectedDay;
  let key, label;
  if (state.settings.paused) {
    key = "paused";
    label = "Paused";
  } else if (diff > 0) {
    key = "ahead";
    label = `Ahead by ${diff} day${diff === 1 ? "" : "s"}`;
  } else if (diff === 0) {
    key = "ontrack";
    label = "Right on schedule";
  } else {
    key = "behind";
    label = `Behind by ${-diff} day${-diff === 1 ? "" : "s"}`;
  }
  return { expectedDay, completedCount, diff, key, label };
}

function getMissedDays() {
  const expectedDay = getExpectedDay();
  if (expectedDay === null) return [];
  return state.days.filter((d) => d.id < expectedDay && !d.completed).map((d) => d.id);
}

function getLastActivityDaysAgo() {
  const dates = state.days.filter((d) => d.completedAt).map((d) => new Date(d.completedAt).getTime());
  if (!dates.length) return null;
  const mostRecent = Math.max(...dates);
  const now = getEffectiveNow();
  return Math.floor((now - mostRecent) / DAY_MS);
}

function formatElapsed(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}

function getPauseDurationDays() {
  if (!state.settings.paused || !state.settings.pauseHistory.length) return 0;
  const last = state.settings.pauseHistory[state.settings.pauseHistory.length - 1];
  return Math.floor((Date.now() - new Date(last.pausedAt).getTime()) / DAY_MS);
}

function getOffTrackBanner() {
  if (!state.settings.startDate) return null;
  const expectedDay = getExpectedDay();
  const lastActivity = getLastActivityDaysAgo();
  const gapDays = lastActivity !== null ? lastActivity : expectedDay !== null ? expectedDay - 1 : 0;

  if (state.settings.paused) {
    const pauseDays = getPauseDurationDays();
    if (pauseDays > 2) {
      return {
        title: "Paused and off track",
        text: `You've been paused for ${pauseDays} days. The plan is on hold, but the gap is real — resume when you're ready, and expect to spend a day or two catching back up.`,
      };
    }
    return null;
  }

  if (gapDays > 2) {
    return {
      title: "Off track — losing momentum",
      text: `It's been ${gapDays} days since your last completed day, and the timer never stopped running. The trend is negative — refocus and close the gap before it grows.`,
    };
  }
  return null;
}

function togglePause() {
  const nowISO = new Date().toISOString();
  if (state.settings.paused) {
    const last = state.settings.pauseHistory[state.settings.pauseHistory.length - 1];
    if (last) last.resumedAt = nowISO;
    state.settings.paused = false;
    showToast("Tracking resumed — the clock is running again.");
  } else {
    state.settings.pauseHistory.push({ pausedAt: nowISO, resumedAt: null });
    state.settings.paused = true;
    showToast("Paused. Your schedule waits for you.");
  }
  saveSettings();
  renderPace();
}

function renderPace() {
  const el = document.getElementById("pace-card");
  if (!el) return;

  if (!state.settings.startDate) {
    el.innerHTML = `
      <div class="pace-setup">
        <div>
          <p>Set the date you started (or plan to start) the 35-day plan. From there, Prep Tracker keeps an honest running count of whether you're ahead, on track, or falling behind — and lets you pause without losing your place.</p>
          <label for="pace-start-date">Start date</label>
          <input type="date" id="pace-start-date" />
        </div>
      </div>
    `;
    document.getElementById("pace-start-date").addEventListener("change", (e) => {
      if (!e.target.value) return;
      state.settings.startDate = e.target.value;
      saveSettings();
      renderPace();
    });
    return;
  }

  const status = getScheduleStatus();
  const elapsedMs = getElapsedMs();
  const missed = getMissedDays();
  const lastActivity = getLastActivityDaysAgo();
  const pausedTotalDays = Math.floor(getPausedMs(getEffectiveNow()) / DAY_MS);
  const offTrackBanner = getOffTrackBanner();

  const bannerHTML = offTrackBanner
    ? `
    <div class="pace-banner">
      <span class="banner-title">${escapeHTML(offTrackBanner.title)}</span>
      ${escapeHTML(offTrackBanner.text)}
    </div>
  `
    : "";

  const trendHTML =
    offTrackBanner && !state.settings.paused ? `<span class="trend-down">▼ Negative trend</span>` : "";

  const missedText =
    missed.length === 0
      ? "None — fully caught up."
      : `Day${missed.length > 1 ? "s" : ""} ${missed.slice(0, 6).join(", ")}${missed.length > 6 ? ` +${missed.length - 6} more` : ""}`;

  const lastActivityText =
    lastActivity === null
      ? "No days marked complete yet."
      : lastActivity === 0
      ? "Today"
      : `${lastActivity} day${lastActivity === 1 ? "" : "s"} ago`;

  el.innerHTML = `
    ${bannerHTML}
    <div class="pace-header">
      <div>
        <div class="pace-timer">Day ${status.expectedDay} of 35</div>
        <div class="pace-elapsed">${formatElapsed(elapsedMs)} since you started${pausedTotalDays > 0 ? ` · ${pausedTotalDays}d paused` : ""} ${trendHTML}</div>
      </div>
      <span class="pace-status-badge status-${status.key}">${status.label}</span>
    </div>
    <div class="pace-actions">
      <button class="pace-btn ${state.settings.paused ? "pause-active" : ""}" id="pace-pause-btn">${
        state.settings.paused ? "Resume tracking" : "Pause tracking"
      }</button>
      <button class="pace-change-date" id="pace-change-date-btn">Change start date</button>
    </div>
    <div class="pace-insights">
      <div class="pace-insight-row">
        <span class="insight-label">Days completed</span>
        <span class="insight-value">${status.completedCount} / 35</span>
      </div>
      <div class="pace-insight-row ${missed.length > 0 ? "warn" : ""}">
        <span class="insight-label">Missed so far</span>
        <span class="insight-value">${missedText}</span>
      </div>
      <div class="pace-insight-row ${lastActivity !== null && lastActivity >= 2 ? "warn" : ""}">
        <span class="insight-label">Last activity</span>
        <span class="insight-value">${lastActivityText}</span>
      </div>
    </div>
  `;

  document.getElementById("pace-pause-btn").addEventListener("click", togglePause);
  document.getElementById("pace-change-date-btn").addEventListener("click", () => {
    if (confirm("Change your start date? This resets the Day-1 anchor and pause history, but keeps all your completed days and notes.")) {
      state.settings.startDate = null;
      state.settings.paused = false;
      state.settings.pauseHistory = [];
      saveSettings();
      renderPace();
    }
  });
}

// ---------- Tabs ----------

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

// ---------- Reset ----------

function initReset() {
  const zone = document.getElementById("reset-zone");
  const btn = document.getElementById("reset-btn");

  btn.addEventListener("click", () => {
    zone.innerHTML = `
      <div class="confirm-box">
        <span>Erase all progress, materials, and mock logs?</span>
        <button class="confirm-yes" id="confirm-reset-yes">Yes, reset</button>
        <button class="confirm-no" id="confirm-reset-no">Cancel</button>
      </div>
    `;
    document.getElementById("confirm-reset-yes").addEventListener("click", () => {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      location.reload();
    });
    document.getElementById("confirm-reset-no").addEventListener("click", () => {
      restoreResetButton();
    });
  });

  function restoreResetButton() {
    zone.innerHTML = `<button class="reset-btn" id="reset-btn">Reset all data</button>`;
    initReset();
  }
}

// ---------- Init ----------

function init() {
  applyTheme();
  initThemeToggle();
  renderPace();
  renderDashboard();
  renderPlan();
  renderMaterials();
  renderMocks();
  initMaterialForm();
  initMockForm();
  initTabs();
  initReset();
  setInterval(renderPace, 60000);
}

init();
