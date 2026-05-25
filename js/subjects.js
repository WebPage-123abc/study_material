/**
 * subjects.js — Logic for subjects.html.
 * Renders all subjects as cards with completion progress.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { loadData, getData, getSubjectCompletedCount, hexToRgba } = window.StudyHub;

  await loadData();
  const data = getData();

  /* Update sidebar user info */
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = data.meta.studentName;
  const sidebarInitial = document.getElementById('sidebar-user-initial');
  if (sidebarInitial) sidebarInitial.textContent = data.meta.studentName.charAt(0).toUpperCase();

  /* ── RENDER SUBJECT CARDS ── */
  const grid = document.getElementById('subjects-grid');
  if (!grid) return;

  grid.innerHTML = data.subjects.map((subject, i) => {
    const completed = getSubjectCompletedCount(subject.id);
    const total = subject.units.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const colorLight = hexToRgba(subject.color, 0.12);

    return `
      <a href="subject-detail.html?id=${subject.id}"
         class="subject-card fade-in fade-in-delay-${Math.min(i + 1, 7)}"
         style="--subject-color: ${subject.color}; --subject-color-light: ${colorLight}"
         data-testid="subject-card-${subject.id}">
        <div class="subject-card-header">
          <div class="subject-card-icon">${subject.icon}</div>
          <span class="subject-card-badge">${subject.shortName}</span>
        </div>
        <h3>${subject.name}</h3>
        <p>${subject.description}</p>
        <div class="progress-bar-wrap" style="margin-bottom: 10px">
          <div class="progress-bar-fill"
               style="width:${pct}%; background:${subject.color}"></div>
        </div>
        <div class="subject-card-footer">
          <span>${completed} of ${total} units complete</span>
          <span style="color:${subject.color}; font-weight:600">${pct}%</span>
        </div>
      </a>
    `;
  }).join('');
});
