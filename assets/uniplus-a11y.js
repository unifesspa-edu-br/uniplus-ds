/* =============================================================================
 * uniplus-a11y.js — Accessibility menu runtime (ADR-0002)
 * =============================================================================
 * Wires up [data-a11y="<key>"][data-value="<v>"] buttons to <html> attrs e
 * controla o popover de preferências (botão disclosure no header).
 *
 *   data-a11y="theme"      data-value="light|dark|auto"   radio (always set)
 *   data-a11y="contrast"   data-value="on"                toggle override
 *   data-a11y="font-mode"  data-value="legible"           toggle
 *
 * Visual theme is computed:
 *   contrast=on  → data-theme="contrast"  (override)
 *   else         → data-theme=<state.theme>  (light | dark | auto)
 *
 * O controle de tamanho de fonte foi removido (ADR-0002): delegado ao zoom
 * nativo do navegador, como e-MAG 3.1 e gov.br/ds.
 *
 * Persiste em localStorage. Atualiza aria-pressed dos botões.
 * Versão de produção será um Angular service consumindo o mesmo contrato.
 * ========================================================================== */
(function () {
  'use strict';

  const STORE = 'uniplus.a11y';
  const root = document.documentElement;

  // Read saved state ----------------------------------------------------------
  let state = {};
  try { state = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; }
  catch (_) { state = {}; }
  // Defaults
  state.theme = state.theme || 'auto';
  state.contrast = !!state.contrast;
  state.fontMode = state.fontMode || 'default';

  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) {}
  }

  // ---- Visual theme (combines theme + contrast override) ----
  function applyVisualTheme() {
    root.setAttribute('data-theme', state.contrast ? 'contrast' : state.theme);
  }

  function applyTheme(value) {
    state.theme = value || 'auto';
    if (state.contrast === false) applyVisualTheme();
    persist();
    updatePressed('theme', state.theme);
  }

  function applyContrast(on) {
    state.contrast = !!on;
    applyVisualTheme();
    persist();
    updatePressed('contrast', state.contrast ? 'on' : 'off');
  }

  function applyFontMode(value) {
    state.fontMode = value || 'default';
    if (state.fontMode === 'default') root.removeAttribute('data-font-mode');
    else root.setAttribute('data-font-mode', state.fontMode);
    persist();
    updatePressed('font-mode', state.fontMode);
  }

  function updatePressed(key, activeValue) {
    document.querySelectorAll(`[data-a11y="${key}"]`).forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.value === activeValue));
    });
  }

  // ---- Accessibility menu (disclosure popover) ------------------------------
  // ADR-0002: botão no header abre um popover (desktop) / bottom-sheet (mobile).
  // Padrão de disclosure, não-modal: Esc fecha e devolve o foco ao gatilho;
  // clique fora fecha (foco vai para onde o usuário clicou).
  function setupA11yMenu() {
    document.querySelectorAll('[data-a11y-menu]').forEach((menu) => {
      const trigger = menu.querySelector('[data-a11y-menu-trigger]');
      const popover = menu.querySelector('.a11y-menu__popover');
      const backdrop = menu.querySelector('.a11y-menu__backdrop');
      if (!trigger || !popover) return;

      function onKeydown(e) {
        if (e.key === 'Escape') { e.preventDefault(); close(true); }
      }
      function onDocPointer(e) {
        if (!menu.contains(e.target)) close(false);
      }

      function open() {
        popover.hidden = false;
        if (backdrop) backdrop.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        const first = popover.querySelector('button, [href], input, select, textarea');
        if (first) first.focus();
        document.addEventListener('keydown', onKeydown);
        // capture: roda antes dos handlers internos, sem fechar em cliques internos
        document.addEventListener('click', onDocPointer, true);
      }
      function close(returnFocus) {
        // Se o foco está dentro do popover quando ele fecha — ex.: clique fora
        // sobre um elemento não-focável da página — devolve o foco ao gatilho
        // para não deixá-lo preso num elemento escondido (Codex P2).
        const focusWasInside = popover.contains(document.activeElement);
        popover.hidden = true;
        if (backdrop) backdrop.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', onKeydown);
        document.removeEventListener('click', onDocPointer, true);
        if (returnFocus || focusWasInside) trigger.focus();
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (trigger.getAttribute('aria-expanded') === 'true') close(true);
        else open();
      });
      if (backdrop) backdrop.addEventListener('click', () => close(true));
    });
  }

  // Apply saved state on init -------------------------------------------------
  root.removeAttribute('data-font-scale'); // ADR-0002: feature removida; limpa estado legado
  applyVisualTheme();
  updatePressed('theme', state.theme);
  updatePressed('contrast', state.contrast ? 'on' : 'off');
  applyFontMode(state.fontMode);
  setupA11yMenu();

  // Wire ----------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-a11y]');
    if (!btn) return;
    e.preventDefault();
    const key = btn.dataset.a11y;
    const value = btn.dataset.value;

    if (key === 'theme') {
      // Radio: clicking always sets the chosen theme.
      applyTheme(value);
    } else if (key === 'contrast') {
      // Toggle: clicking flips the override on/off.
      applyContrast(!state.contrast);
    } else if (key === 'font-mode') {
      const isActive = btn.getAttribute('aria-pressed') === 'true';
      applyFontMode(isActive ? 'default' : value);
    }
  });

  // Expose for testing
  window.UniA11y = {
    applyTheme, applyContrast, applyFontMode,
    getState: () => ({ ...state }),
  };
})();
