/**
 * favorites.js — Logic for favorites.html.
 * Reads saved favorites from localStorage, looks up resource details,
 * and renders them grouped by subject and unit.
 */

const HEART_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
</svg>`;

const EXT_LINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>`;

document.addEventListener('DOMContentLoaded', async () => {
  const { loadData, getData, getFavorites, toggleFavorite } = window.StudyHub;

  await loadData();
  const data = getData();

  /* Sidebar user info */
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = data.meta.studentName;
  const sidebarInitial = document.getElementById('sidebar-user-initial');
  if (sidebarInitial) sidebarInitial.textContent = data.meta.studentName.charAt(0).toUpperCase();

  renderFavorites(data);

  /* ── Render helpers ── */
  function renderFavorites(data) {
    const container = document.getElementById('favorites-container');
    const countEl = document.getElementById('favorites-count');
    if (!container) return;

    const favs = getFavorites();

    if (countEl) countEl.textContent = favs.length;

    if (favs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🤍</div>
          <h3>No saved resources yet</h3>
          <p>Open any subject and click the heart icon on a resource to save it here.</p>
        </div>
      `;
      return;
    }

    /* Group favorites by subjectId, then unitId */
    const grouped = {};
    for (const fav of favs) {
      if (!grouped[fav.subjectId]) grouped[fav.subjectId] = {};
      if (!grouped[fav.subjectId][fav.unitId]) grouped[fav.subjectId][fav.unitId] = [];
      grouped[fav.subjectId][fav.unitId].push(fav);
    }

    let html = '';
    for (const [subjectId, unitGroups] of Object.entries(grouped)) {
      const subject = data.subjects.find(s => s.id === subjectId);
      if (!subject) continue;

      html += `
        <div class="favorites-group fade-in">
          <div class="favorites-group-header">
            <span class="favorites-group-icon">${subject.icon}</span>
            <h3>${subject.name}</h3>
            <span class="badge badge-muted">${subject.shortName}</span>
          </div>
      `;

      for (const [unitId, items] of Object.entries(unitGroups)) {
        const unit = subject.units.find(u => u.id === unitId);
        if (!unit) continue;

        html += `
          <div class="favorites-unit-group">
            <div class="favorites-unit-label">${unit.title}</div>
            <div class="resource-grid">
              ${items.map(fav => renderFavCard(subject, unit, fav)).join('')}
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    container.innerHTML = html;

    /* Wire up unfavorite buttons */
    container.querySelectorAll('.unfav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const resource = JSON.parse(btn.dataset.resource);
        toggleFavorite(resource);
        window.showToast('Removed from favorites.', 'info');
        renderFavorites(data); // Re-render
      });
    });
  }

  function renderFavCard(subject, unit, fav) {
    /* Look up the actual resource from data */
    const cats = unit.resources || {};
    const items = cats[fav.category];
    const item = items && items[fav.resourceIndex];

    const title = item ? item.title : fav.title;
    const description = item ? item.description : '';
    const url = item ? item.url : '#';
    const isPlaceholder = !url || url === '#';

    const favData = JSON.stringify({
      subjectId: fav.subjectId,
      unitId: fav.unitId,
      category: fav.category,
      resourceIndex: fav.resourceIndex,
      title: fav.title
    });

    const CATEGORY_LABELS = {
      notes: 'Notes', pdfs: 'PDFs', videos: 'Videos',
      pyqs: 'PYQs', practice: 'Practice', links: 'External Links'
    };

    return `
      <div class="resource-card">
        <div class="resource-card-top">
          <div>
            <span class="badge badge-muted" style="margin-bottom:5px; display:inline-flex">
              ${CATEGORY_LABELS[fav.category] || fav.category}
            </span>
            <h4>${title}</h4>
          </div>
          <button class="unfav-btn fav-btn active"
                  data-resource='${favData}'
                  title="Remove from favorites">
            ${HEART_FILLED}
          </button>
        </div>
        ${description ? `<p>${description}</p>` : ''}
        <div style="display:flex; gap:8px; align-items:center; margin-top:4px">
          ${isPlaceholder
            ? `<span class="resource-card-link placeholder">${EXT_LINK_ICON} Not available yet</span>`
            : `<a href="${url}" target="_blank" rel="noopener noreferrer" class="resource-card-link available">${EXT_LINK_ICON} Open</a>`
          }
          <a href="subject-detail.html?id=${subject.id}" class="btn btn-ghost btn-sm">
            View in ${subject.shortName}
          </a>
        </div>
      </div>
    `;
  }
});
