/**
 * data.js — Core data layer for StudyHub
 *
 * HOW TO EDIT YOUR STUDY DATA:
 *   Open data/data.json and edit it directly.
 *   No other file needs to change when you add subjects, units, or resources.
 *
 * localStorage keys used across the app:
 *   sh_completed_units   — array of unit IDs marked complete
 *   sh_favorite_resources — array of saved resource objects
 *   sh_last_opened       — array of recently visited subject IDs (max 3)
 *   sh_study_streak      — { lastDate: "YYYY-MM-DD", count: number }
 *   sh_theme             — "light" or "dark"
 */

/* ── Cached data (populated by loadData) ── */
let _data = null;

/**
 * Fetch and cache data.json.
 * Call this once at the top of each page script, then use the helpers below.
 * @returns {Promise<Object>} The full data object
 */
async function loadData() {
  if (_data) return _data;
  const res = await fetch('/api/data');
  _data = await res.json();
  return _data;
}

/**
 * Get the cached data synchronously (only after loadData() has resolved).
 * @returns {Object}
 */
function getData() {
  if (!_data) throw new Error('Data not loaded yet — call loadData() first and await it.');
  return _data;
}

/**
 * Find a subject by its ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
function getSubjectById(id) {
  return getData().subjects.find(s => s.id === id);
}

/* ══════════════════════════════════════════════
   COMPLETED UNITS
   ══════════════════════════════════════════════ */

/**
 * Get array of completed unit IDs from localStorage.
 * @returns {string[]}
 */
function getCompletedUnits() {
  try {
    return JSON.parse(localStorage.getItem('sh_completed_units') || '[]');
  } catch { return []; }
}

/**
 * Check if a unit is marked complete.
 * @param {string} unitId
 * @returns {boolean}
 */
function isUnitComplete(unitId) {
  return getCompletedUnits().includes(unitId);
}

/**
 * Toggle a unit's completion status.
 * @param {string} unitId
 * @returns {boolean} New completed state
 */
function toggleUnitComplete(unitId) {
  const completed = getCompletedUnits();
  const idx = completed.indexOf(unitId);
  if (idx === -1) {
    completed.push(unitId);
  } else {
    completed.splice(idx, 1);
  }
  localStorage.setItem('sh_completed_units', JSON.stringify(completed));
  return idx === -1; // true = now complete
}

/**
 * Count completed units for a given subject.
 * @param {string} subjectId
 * @returns {number}
 */
function getSubjectCompletedCount(subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return 0;
  const completed = getCompletedUnits();
  return subject.units.filter(u => completed.includes(u.id)).length;
}

/* ══════════════════════════════════════════════
   FAVORITE RESOURCES
   Format: { subjectId, unitId, category, resourceIndex, title }
   ══════════════════════════════════════════════ */

/**
 * Get all favorited resources.
 * @returns {Array<Object>}
 */
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('sh_favorite_resources') || '[]');
  } catch { return []; }
}

/**
 * Create a unique key for a resource (to detect duplicates).
 */
function _favKey(fav) {
  return `${fav.subjectId}__${fav.unitId}__${fav.category}__${fav.resourceIndex}`;
}

/**
 * Check if a resource is favorited.
 * @param {Object} resource - { subjectId, unitId, category, resourceIndex }
 * @returns {boolean}
 */
function isFavorited(resource) {
  return getFavorites().some(f => _favKey(f) === _favKey(resource));
}

/**
 * Toggle a resource favorite.
 * @param {Object} resource - { subjectId, unitId, category, resourceIndex, title }
 * @returns {boolean} New favorited state
 */
function toggleFavorite(resource) {
  const favs = getFavorites();
  const key = _favKey(resource);
  const idx = favs.findIndex(f => _favKey(f) === key);
  if (idx === -1) {
    favs.push(resource);
    localStorage.setItem('sh_favorite_resources', JSON.stringify(favs));
    return true; // now favorited
  } else {
    favs.splice(idx, 1);
    localStorage.setItem('sh_favorite_resources', JSON.stringify(favs));
    return false; // now unfavorited
  }
}

/* ══════════════════════════════════════════════
   RECENTLY OPENED SUBJECTS
   ══════════════════════════════════════════════ */

/**
 * Get recently opened subject IDs (most recent first, max 3).
 * @returns {string[]}
 */
function getLastOpened() {
  try {
    return JSON.parse(localStorage.getItem('sh_last_opened') || '[]');
  } catch { return []; }
}

/**
 * Record a subject visit (adds to front, deduplicates, keeps max 3).
 * @param {string} subjectId
 */
function recordVisit(subjectId) {
  let opened = getLastOpened().filter(id => id !== subjectId);
  opened.unshift(subjectId);
  opened = opened.slice(0, 3);
  localStorage.setItem('sh_last_opened', JSON.stringify(opened));
}

/* ══════════════════════════════════════════════
   STUDY STREAK
   ══════════════════════════════════════════════ */

/**
 * Get today's date as YYYY-MM-DD string.
 */
function _today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get yesterday's date as YYYY-MM-DD string.
 */
function _yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Update and return the current study streak count.
 * Call this once on page load to keep streak accurate.
 * @returns {number} Current streak day count
 */
function updateStreak() {
  let streak = { lastDate: '', count: 0 };
  try {
    streak = JSON.parse(localStorage.getItem('sh_study_streak') || '{}');
    if (!streak.lastDate) streak = { lastDate: '', count: 0 };
  } catch {}

  const today = _today();
  const yesterday = _yesterday();

  if (streak.lastDate === today) {
    // Already visited today — keep as-is
  } else if (streak.lastDate === yesterday) {
    // Consecutive day — increment
    streak.count = (streak.count || 0) + 1;
    streak.lastDate = today;
  } else {
    // Streak broken or first visit — reset
    streak.count = 1;
    streak.lastDate = today;
  }

  localStorage.setItem('sh_study_streak', JSON.stringify(streak));
  return streak.count;
}

/**
 * Get current streak count (without updating).
 * @returns {number}
 */
function getStreak() {
  try {
    const s = JSON.parse(localStorage.getItem('sh_study_streak') || '{}');
    return s.count || 0;
  } catch { return 0; }
}

/* ══════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════ */

/**
 * Get the saved theme preference.
 * @returns {'light'|'dark'}
 */
function getTheme() {
  return localStorage.getItem('sh_theme') || 'light';
}

/**
 * Save theme preference.
 * @param {'light'|'dark'} theme
 */
function saveTheme(theme) {
  localStorage.setItem('sh_theme', theme);
}

/* ══════════════════════════════════════════════
   RESOURCE HELPERS
   ══════════════════════════════════════════════ */

/**
 * Count total resources in a unit across all categories.
 * @param {Object} unit
 * @returns {number}
 */
function countUnitResources(unit) {
  const cats = unit.resources || {};
  return Object.values(cats).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
}

/**
 * Search across all subjects, units, and resources.
 * Returns matched results grouped by type.
 * @param {string} query
 * @returns {{ subjects: Array, units: Array, resources: Array }}
 */
function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { subjects: [], units: [], resources: [] };

  const subjects = [];
  const units = [];
  const resources = [];
  const data = getData();

  for (const subject of data.subjects) {
    if (subject.name.toLowerCase().includes(q) ||
        subject.description.toLowerCase().includes(q)) {
      subjects.push(subject);
    }
    for (const unit of subject.units) {
      if (unit.title.toLowerCase().includes(q) ||
          unit.description.toLowerCase().includes(q)) {
        units.push({ subject, unit });
      }
      const cats = unit.resources || {};
      for (const [category, items] of Object.entries(cats)) {
        if (!items) continue;
        items.forEach((item, idx) => {
          if (item.title.toLowerCase().includes(q) ||
              (item.description || '').toLowerCase().includes(q)) {
            resources.push({ subject, unit, category, resource: item, idx });
          }
        });
      }
    }
  }

  return { subjects, units, resources };
}

/* ══════════════════════════════════════════════
   COLOR HELPERS
   ══════════════════════════════════════════════ */

/**
 * Convert a hex color to rgba with given alpha.
 * @param {string} hex e.g. "#6366f1"
 * @param {number} alpha 0–1
 * @returns {string}
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* Export all helpers via window for use in inline scripts */
window.StudyHub = {
  loadData, getData, getSubjectById,
  getCompletedUnits, isUnitComplete, toggleUnitComplete, getSubjectCompletedCount,
  getFavorites, isFavorited, toggleFavorite,
  getLastOpened, recordVisit,
  updateStreak, getStreak,
  getTheme, saveTheme,
  countUnitResources, search, hexToRgba
};
