// ---- Sidebar collapse toggle (persisted) ----
(function () {
  const SHELL = document.getElementById('admin-shell');
  const BTN = document.getElementById('sidebar-toggle');
  const SIDEBAR = document.getElementById('admin-sidebar');
  const DESKTOP = window.matchMedia('(min-width: 1024px)');
  const PAGE_REGIONS = [
    document.querySelector('.skip-link'),
    document.querySelector('.gov-bar'),
    document.querySelector('.admin-main'),
  ].filter(Boolean);
  const KEY = 'uniplus.admin.sidebar';
  if (!SHELL || !BTN || !SIDEBAR) return;

  let saved = 'expanded';
  try { saved = localStorage.getItem(KEY) || 'expanded'; } catch (_) { }

  function setSidebarInteractive(interactive) {
    if (interactive) {
      SIDEBAR.removeAttribute('aria-hidden');
      SIDEBAR.removeAttribute('inert');
      SIDEBAR.inert = false;
    } else {
      SIDEBAR.setAttribute('aria-hidden', 'true');
      SIDEBAR.setAttribute('inert', '');
      SIDEBAR.inert = true;
    }
  }

  function setPageInteractive(interactive) {
    PAGE_REGIONS.forEach((region) => {
      if (interactive) {
        region.removeAttribute('aria-hidden');
        region.removeAttribute('inert');
        region.inert = false;
      } else {
        region.setAttribute('aria-hidden', 'true');
        region.setAttribute('inert', '');
        region.inert = true;
      }
    });
  }

  function applyDesktop(state) {
    SHELL.removeAttribute('data-sidebar-mobile');
    document.body.classList.remove('has-sidebar-open');
    setSidebarInteractive(true);
    setPageInteractive(true);

    if (state === 'collapsed') {
      SHELL.setAttribute('data-sidebar', 'collapsed');
      BTN.setAttribute('aria-expanded', 'false');
      BTN.setAttribute('aria-label', 'Expandir menu lateral');
    } else {
      SHELL.removeAttribute('data-sidebar');
      BTN.setAttribute('aria-expanded', 'true');
      BTN.setAttribute('aria-label', 'Recolher menu lateral');
    }
  }

  function openMobile() {
    SHELL.removeAttribute('data-sidebar');
    SHELL.setAttribute('data-sidebar-mobile', 'open');
    document.body.classList.add('has-sidebar-open');
    setSidebarInteractive(true);
    BTN.setAttribute('aria-expanded', 'true');
    BTN.setAttribute('aria-label', 'Fechar menu lateral');
    SIDEBAR.querySelector('[data-sidebar-close], a')?.focus();
    setPageInteractive(false);
  }

  function closeMobile(options = {}) {
    SHELL.removeAttribute('data-sidebar-mobile');
    document.body.classList.remove('has-sidebar-open');
    setPageInteractive(true);
    setSidebarInteractive(false);
    BTN.setAttribute('aria-expanded', 'false');
    BTN.setAttribute('aria-label', 'Abrir menu lateral');
    if (options.restoreFocus) BTN.focus();
  }

  function syncLayout() {
    if (DESKTOP.matches) applyDesktop(saved);
    else closeMobile({ restoreFocus: false });
  }

  BTN.addEventListener('click', () => {
    if (!DESKTOP.matches) {
      if (SHELL.getAttribute('data-sidebar-mobile') === 'open') closeMobile({ restoreFocus: true });
      else openMobile();
      return;
    }

    saved = SHELL.getAttribute('data-sidebar') === 'collapsed' ? 'expanded' : 'collapsed';
    applyDesktop(saved);
    try { localStorage.setItem(KEY, saved); } catch (_) { }
  });

  document.querySelectorAll('[data-sidebar-close]').forEach((control) => {
    control.addEventListener('click', () => closeMobile({ restoreFocus: true }));
  });

  SIDEBAR.addEventListener('click', (e) => {
    if (!DESKTOP.matches && e.target.closest('a')) closeMobile({ restoreFocus: false });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && SHELL.getAttribute('data-sidebar-mobile') === 'open') {
      closeMobile({ restoreFocus: true });
    }
  });

  if (DESKTOP.addEventListener) DESKTOP.addEventListener('change', syncLayout);
  else DESKTOP.addListener(syncLayout);
  syncLayout();
})();
