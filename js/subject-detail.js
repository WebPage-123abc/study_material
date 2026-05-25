/**
 * subject-detail.js — Logic for subject-detail.html.
 * Reads ?id= URL param, renders subject header, unit accordions,
 * mark-as-complete, and favorite buttons.
 *
 * URL format: subject-detail.html?id=math
 * The `id` must match a subject id in data/data.json.
 */

/* ── Category configuration ──
   To add a new resource category:
   1. Add it to data.json under unit.resources
   2. Add an entry here with a label and SVG icon
*/
const CATEGORY_CONFIG = {
  notes: {
    label: 'Notes',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>`,
  },
  pdfs: {
    label: 'PDFs',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>`,
  },
  videos: {
    label: 'Videos',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>`,
  },
  pyqs: {
    label: 'PYQs',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>`,
  },
  practice: {
    label: 'Practice',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>`,
  },
  links: {
    label: 'External Links',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>`,
  },
};

const HEART_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
</svg>`;

const HEART_OUTLINE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg>`;

const CHEVRON_DOWN = `<svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>`;

const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>`;

const RESOURCES_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
</svg>`;

const EXT_LINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>`;

/* ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const {
    loadData, getSubjectById, isUnitComplete, toggleUnitComplete,
    isFavorited, toggleFavorite, countUnitResources,
    getCompletedUnits, recordVisit, hexToRgba
  } = window.StudyHub;

  /* ── Read subject ID from URL ── */
  const params = new URLSearchParams(window.location.search);
  const subjectId = params.get('id');

  if (!subjectId) {
    showError('No subject specified. <a href="subjects.html">Go to subjects</a>.');
    return;
  }

  await loadData();
  const subject = getSubjectById(subjectId);

  if (!subject) {
    showError(`Subject "${subjectId}" not found. <a href="subjects.html">Go to subjects</a>.`);
    return;
  }

  /* Record this visit in recently opened */
  recordVisit(subjectId);

  /* Sidebar user info */
  const { getData } = window.StudyHub;
  const data = getData();
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = data.meta.studentName;
  const sidebarInitial = document.getElementById('sidebar-user-initial');
  if (sidebarInitial) sidebarInitial.textContent = data.meta.studentName.charAt(0).toUpperCase();

  /* ── Render subject header ── */
  renderSubjectHeader(subject);

  /* ── Render units ── */
  renderUnits(subject);

  /* ── Expand / Collapse All ── */
  const expandAllBtn = document.getElementById('expand-all-btn');
  let allExpanded = false;

  expandAllBtn?.addEventListener('click', () => {
    allExpanded = !allExpanded;
    document.querySelectorAll('.accordion').forEach(acc => {
      acc.classList.toggle('open', allExpanded);
    });
    expandAllBtn.textContent = allExpanded ? 'Collapse All' : 'Expand All';
  });

  /* Expand first unit by default */
  const firstUnit = document.querySelector('.accordion');
  if (firstUnit) firstUnit.classList.add('open');
});

/* ── Render subject header ── */
function renderSubjectHeader(subject) {
  const colorLight = window.StudyHub.hexToRgba(subject.color, 0.12);

  /* Breadcrumb */
  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="index.html">Dashboard</a>
      <span class="breadcrumb-sep">›</span>
      <a href="subjects.html">Subjects</a>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${subject.name}</span>
    `;
  }

  /* Header block */
  const header = document.getElementById('subject-header');
  if (header) {
    header.style.setProperty('--subject-color', subject.color);
    header.innerHTML = `
      <div class="subject-header-icon" style="background:${colorLight}">
        ${subject.icon}
      </div>
      <div class="subject-header-info">
        <span class="subject-header-badge">${subject.shortName}</span>
        <h2>${subject.name}</h2>
        <p>${subject.description}</p>
      </div>
    `;
  }
}

/* ── Render all units ── */
function renderUnits(subject) {
  const list = document.getElementById('units-list');
  if (!list) return;

  list.innerHTML = subject.units.map((unit, i) => renderUnit(subject, unit, i)).join('');

  /* Wire up accordion toggles */
  list.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', (e) => {
      /* Don't toggle accordion when clicking the check button */
      if (e.target.closest('.accordion-check')) return;
      const accordion = header.closest('.accordion');
      accordion.classList.toggle('open');
    });
  });

  /* Wire up completion checkboxes */
  list.querySelectorAll('.accordion-check').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const unitId = btn.dataset.unitId;
      const isNowComplete = window.StudyHub.toggleUnitComplete(unitId);
      btn.classList.toggle('checked', isNowComplete);
      btn.innerHTML = isNowComplete ? CHECK_ICON : '';
      btn.title = isNowComplete ? 'Mark as incomplete' : 'Mark as complete';
      window.showToast(isNowComplete ? 'Unit marked complete!' : 'Unit unmarked.', isNowComplete ? 'success' : 'info');
      checkAllComplete(subject);
    });
  });

  /* Wire up favorite buttons */
  list.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const resource = JSON.parse(btn.dataset.resource);
      const isNowFav = window.StudyHub.toggleFavorite(resource);
      btn.classList.toggle('active', isNowFav);
      btn.innerHTML = isNowFav ? HEART_FILLED : HEART_OUTLINE;
      btn.title = isNowFav ? 'Remove from favorites' : 'Add to favorites';
      window.showToast(isNowFav ? 'Added to favorites!' : 'Removed from favorites.', 'info');
    });
  });

  /* Check for full completion */
  checkAllComplete(subject);
}

/* ── Build a single unit accordion ── */
function renderUnit(subject, unit, index) {
  const isComplete = window.StudyHub.isUnitComplete(unit.id);
  const resourceCount = window.StudyHub.countUnitResources(unit);
  const colorLight = window.StudyHub.hexToRgba(subject.color, 0.12);

  return `
    <div class="accordion" data-unit-id="${unit.id}">
      <div class="accordion-header">
        <button class="accordion-check ${isComplete ? 'checked' : ''}"
                data-unit-id="${unit.id}"
                title="${isComplete ? 'Mark as incomplete' : 'Mark as complete'}">
          ${isComplete ? CHECK_ICON : ''}
        </button>
        <div class="accordion-info">
          <div class="accordion-unit-label">Unit ${index + 1}</div>
          <div class="accordion-title">${unit.title}</div>
        </div>
        <div class="accordion-meta">
          <span class="accordion-count">
            ${RESOURCES_ICON}
            ${resourceCount} Resources
          </span>
          ${CHEVRON_DOWN}
        </div>
      </div>
      <div class="accordion-body">
        <p class="accordion-desc">${unit.description}</p>
        ${renderResourceCategories(subject, unit)}
      </div>
    </div>
  `;
}

/* ── Build resource categories inside a unit ── */
function renderResourceCategories(subject, unit) {
  const categories = unit.resources || {};
  return Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
    const items = categories[key];
    if (!items || items.length === 0) return '';
    return `
      <div class="resource-category">
        <div class="resource-category-header">
          ${config.icon}
          <span class="resource-category-label">${config.label}</span>
          <span class="resource-category-count">${items.length}</span>
        </div>
        <div class="resource-grid">
          ${items.map((item, idx) => renderResourceCard(subject, unit, key, item, idx)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

/* ── Build a single resource card ── */
function renderResourceCard(subject, unit, category, item, idx) {
  const isPlaceholder = !item.url || item.url === '#';
  const favData = JSON.stringify({
    subjectId: subject.id,
    unitId: unit.id,
    category,
    resourceIndex: idx,
    title: item.title
  });
  const isFav = window.StudyHub.isFavorited({
    subjectId: subject.id, unitId: unit.id, category, resourceIndex: idx
  });

  return `
    <div class="resource-card">
      <div class="resource-card-top">
        <h4>${item.title}</h4>
        <button class="fav-btn ${isFav ? 'active' : ''}"
                data-resource='${favData}'
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFav ? HEART_FILLED : HEART_OUTLINE}
        </button>
      </div>
      ${item.description ? `<p>${item.description}</p>` : ''}
      ${isPlaceholder
        ? `<span class="resource-card-link placeholder">
             ${EXT_LINK_ICON} Not available yet
           </span>`
        : `<a href="${item.url}" target="_blank" rel="noopener noreferrer"
              class="resource-card-link available">
             ${EXT_LINK_ICON} Open
           </a>`
      }
    </div>
  `;
}

/* ── Check if all units are complete; show banner ── */
function checkAllComplete(subject) {
  const banner = document.getElementById('completion-banner');
  if (!banner) return;
  const allDone = subject.units.every(u => window.StudyHub.isUnitComplete(u.id));
  banner.style.display = allDone ? 'flex' : 'none';
}

/* ── Error state ── */
function showError(message) {
  const main = document.querySelector('.page');
  if (main) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>${message}</p>
      </div>
    `;
  }
}
