/**
 * search.js — Logic for search.html.
 * Reads ?q= URL param, performs live search across subjects/units/resources,
 * and renders grouped results with highlighted matches.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { loadData, getData, search } = window.StudyHub;

  await loadData();
  const data = getData();

  /* Sidebar user info */
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = data.meta.studentName;
  const sidebarInitial = document.getElementById('sidebar-user-initial');
  if (sidebarInitial) sidebarInitial.textContent = data.meta.studentName.charAt(0).toUpperCase();

  const searchInput = document.getElementById('search-input');
  const searchForm  = document.getElementById('search-form');
  const resultsArea = document.getElementById('search-results');
  const resultsInfo = document.getElementById('results-info');

  /* ── Pre-fill from URL param ── */
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
    runSearch(initialQuery);
  } else {
    showEmpty('Type something to search across all subjects, units, and resources.');
  }

  /* ── Live search on input ── */
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value;
    if (q.trim().length < 2) {
      showEmpty('Type at least 2 characters to search.');
      if (resultsInfo) resultsInfo.textContent = '';
      return;
    }
    runSearch(q.trim());
    /* Update URL without reloading */
    const url = new URL(window.location.href);
    url.searchParams.set('q', q.trim());
    window.history.replaceState({}, '', url);
  });

  /* ── Prevent form submission (we search live) ── */
  searchForm?.addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput?.value.trim();
    if (q && q.length >= 2) runSearch(q);
  });

  /* ── Run search and render results ── */
  function runSearch(query) {
    if (!resultsArea) return;
    const { subjects, units, resources } = search(query);
    const total = subjects.length + units.length + resources.length;

    if (resultsInfo) {
      resultsInfo.textContent = total === 0
        ? `No results for "${query}"`
        : `${total} result${total !== 1 ? 's' : ''} for "${query}"`;
    }

    if (total === 0) {
      resultsArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try a different keyword — subject name, unit title, or resource name.</p>
        </div>
      `;
      return;
    }

    let html = '';

    if (subjects.length > 0) {
      html += `
        <div class="search-result-group">
          <div class="search-result-group-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            Subjects (${subjects.length})
          </div>
          ${subjects.map(s => `
            <a href="subject-detail.html?id=${s.id}" class="search-result-item">
              <h4>${s.icon} ${highlight(s.name, query)}</h4>
              <p>${highlight(s.description, query)}</p>
              <div class="search-result-meta"><span>${s.shortName}</span></div>
            </a>
          `).join('')}
        </div>
      `;
    }

    if (units.length > 0) {
      html += `
        <div class="search-result-group">
          <div class="search-result-group-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Units (${units.length})
          </div>
          ${units.map(({ subject, unit }) => `
            <a href="subject-detail.html?id=${subject.id}" class="search-result-item">
              <h4>${highlight(unit.title, query)}</h4>
              <p>${highlight(unit.description, query)}</p>
              <div class="search-result-meta">
                <span>${subject.icon} ${subject.name}</span>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    if (resources.length > 0) {
      const CATEGORY_LABELS = {
        notes: 'Notes', pdfs: 'PDFs', videos: 'Videos',
        pyqs: 'PYQs', practice: 'Practice', links: 'External Links'
      };
      html += `
        <div class="search-result-group">
          <div class="search-result-group-label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Resources (${resources.length})
          </div>
          ${resources.map(({ subject, unit, category, resource }) => `
            <a href="subject-detail.html?id=${subject.id}" class="search-result-item">
              <h4>${highlight(resource.title, query)}</h4>
              ${resource.description ? `<p>${highlight(resource.description, query)}</p>` : ''}
              <div class="search-result-meta">
                <span>${subject.icon} ${subject.name}</span>
                <span>•</span>
                <span>${unit.title}</span>
                <span>•</span>
                <span>${CATEGORY_LABELS[category] || category}</span>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    resultsArea.innerHTML = html;
  }

  function showEmpty(message) {
    if (!resultsArea) return;
    resultsArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>Search your study resources</h3>
        <p>${message}</p>
      </div>
    `;
  }
});

/* ── Highlight matching text ── */
function highlight(text, query) {
  if (!query || !text) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}
