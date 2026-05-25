/**
 * app.js — Global logic for all pages.
 * Handles: sidebar toggle, dark/light mode, active nav link, sidebar subject list.
 * This script runs on every page.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { loadData, getData, getTheme, saveTheme, getSubjectById } = window.StudyHub;

  /* ── Apply saved theme immediately ── */
  applyTheme(getTheme());

  /* ── Load data to populate sidebar subjects ── */
  try {
    await loadData();
    renderSidebarSubjects();
  } catch (e) {
    console.error('Failed to load data:', e);
  }

  /* ── Active nav link ── */
  setActiveNavLink();

  /* ── Sidebar toggle (mobile) ── */
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('sidebar-overlay');
  const hamburgerBtn   = document.getElementById('hamburger-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', openSidebar);
  sidebarCloseBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  /* Close sidebar on sidebar nav link click (mobile) */
  sidebar?.querySelectorAll('.sidebar-link, .sidebar-subject-item').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  /* ── Dark/light mode toggle ── */
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });
});

/* ── Theme application ── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (theme === 'dark') {
    // Sun icon (click to go light)
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>`;
  } else {
    // Moon icon (click to go dark)
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>`;
  }
}

/* ── Active nav link ── */
function setActiveNavLink() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
}

/* ── Render sidebar subject list ── */
function renderSidebarSubjects() {
  const list = document.getElementById('sidebar-subjects-list');
  if (!list) return;

  const { subjects } = window.StudyHub.getData();
  const currentPage = window.location.pathname;

  list.innerHTML = subjects.map(subject => `
    <a href="subject-detail.html?id=${subject.id}" class="sidebar-subject-item">
      <span class="sidebar-subject-dot" style="background:${subject.color}"></span>
      <span>${subject.name}</span>
    </a>
  `).join('');
}

/* ── Toast notification utility ── */
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
};
