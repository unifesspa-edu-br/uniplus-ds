/* =============================================================================
 * uniplus-a11y.js — AccessibilityBar runtime
 * =============================================================================
 * Wires up [data-a11y="<key>"][data-value="<v>"] buttons to <html> attrs.
 *
 *   data-a11y="theme"      data-value="light|dark|auto"   radio (always set)
 *   data-a11y="contrast"   data-value="on"                toggle override
 *   data-a11y="font-scale" data-value="md|lg|xl|2xl"      radio
 *   data-a11y="font-mode"  data-value="legible"           toggle
 *
 * Visual theme is computed:
 *   contrast=on  → data-theme="contrast"  (override)
 *   else         → data-theme=<state.theme>  (light | dark | auto)
 *
 * Persists in localStorage. Updates aria-pressed across button groups.
 * Production version will be an Angular service consuming the same contract.
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
  state.fontScale = state.fontScale || 'md';
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

  function applyFontScale(value) {
    state.fontScale = value || 'md';
    if (state.fontScale === 'md') root.removeAttribute('data-font-scale');
    else root.setAttribute('data-font-scale', state.fontScale);
    persist();
    updatePressed('font-scale', state.fontScale);
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

  // Apply saved state on init -------------------------------------------------
  applyVisualTheme();
  updatePressed('theme', state.theme);
  updatePressed('contrast', state.contrast ? 'on' : 'off');
  applyFontScale(state.fontScale);
  applyFontMode(state.fontMode);

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
    } else if (key === 'font-scale') {
      applyFontScale(value);
    } else if (key === 'font-mode') {
      const isActive = btn.getAttribute('aria-pressed') === 'true';
      applyFontMode(isActive ? 'default' : value);
    }
  });

  // Expose for testing
  window.UniA11y = {
    applyTheme, applyContrast, applyFontScale, applyFontMode,
    getState: () => ({ ...state }),
  };
})();
