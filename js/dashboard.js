/**
 * dashboard.js — Logic for index.html (the dashboard/home page).
 * Renders stats, progress bars, recently opened subjects, and search.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const {
    loadData, getData, updateStreak,
    getCompletedUnits, getFavorites, getLastOpened,
    getSubjectCompletedCount, hexToRgba
  } = window.StudyHub;

  /* Load data and update streak on page load */
  await loadData();
  const streakCount = updateStreak();
  const data = getData();

  /* Populate student name in welcome section */
  const nameEls = document.querySelectorAll('[data-student-name]');
  nameEls.forEach(el => el.textContent = data.meta.studentName);

  const semesterEl = document.querySelector('[data-semester]');
  if (semesterEl) semesterEl.textContent = data.meta.semester;

  /* Update sidebar user info */
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = data.meta.studentName;
  const sidebarInitial = document.getElementById('sidebar-user-initial');
  if (sidebarInitial) sidebarInitial.textContent = data.meta.studentName.charAt(0).toUpperCase();

  /* ── STAT CARDS ── */
  const completedUnits = getCompletedUnits();
  const favorites = getFavorites();

  document.getElementById('stat-subjects').textContent  = data.subjects.length;
  document.getElementById('stat-units').textContent     = data.subjects.reduce((s, sub) => s + sub.units.length, 0);
  document.getElementById('stat-completed').textContent = completedUnits.length;
  document.getElementById('stat-favorites').textContent = favorites.length;

  /* ── STUDY STREAK ── */
  const streakEl = document.getElementById('streak-count');
  if (streakEl) streakEl.textContent = `${streakCount} Day${streakCount !== 1 ? 's' : ''}`;

  /* ── PROGRESS BARS ── */
  const progressList = document.getElementById('progress-list');
  if (progressList) {
    progressList.innerHTML = data.subjects.map((subject, i) => {
      const completed = getSubjectCompletedCount(subject.id);
      const total = subject.units.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const colorLight = hexToRgba(subject.color, 0.12);

      return `
        <a href="subject-detail.html?id=${subject.id}"
           class="progress-item fade-in fade-in-delay-${Math.min(i + 1, 7)}"
           data-testid="progress-item-${subject.id}">
          <div class="progress-item-icon" style="background:${colorLight}">
            ${subject.icon}
          </div>
          <div class="progress-item-info">
            <h4>${subject.name}</h4>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill"
                   style="width:${pct}%; background:${subject.color}"></div>
            </div>
            <div class="progress-item-meta">
              <span>${completed} / ${total} Units</span>
              <span style="color:${subject.color}; font-weight:600">${pct}%</span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  /* ── RECENTLY OPENED ── */
  const recentSection = document.getElementById('recent-subjects');
  if (recentSection) {
    const lastOpened = getLastOpened();
    if (lastOpened.length === 0) {
      recentSection.innerHTML = `
        <div class="empty-state" style="padding: 30px 20px">
          <div class="empty-icon">📂</div>
          <h3>No recent subjects yet</h3>
          <p>Start studying to see them here.</p>
        </div>
      `;
    } else {
      recentSection.innerHTML = lastOpened.map(id => {
        const subject = data.subjects.find(s => s.id === id);
        if (!subject) return '';
        const completed = getSubjectCompletedCount(subject.id);
        return `
          <a href="subject-detail.html?id=${subject.id}" class="recent-card">
            <div class="recent-card-icon">${subject.icon}</div>
            <div class="recent-card-info">
              <h4>${subject.name}</h4>
              <p>${completed} / ${subject.units.length} units complete</p>
            </div>
          </a>
        `;
      }).filter(Boolean).join('');
    }
  }

  /* ── SEARCH BAR ── */
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  searchForm?.addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput?.value.trim();
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  });

  /* Navigate on enter key */
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
  });
});
