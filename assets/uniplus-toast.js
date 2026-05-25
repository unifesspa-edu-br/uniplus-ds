/* =============================================================================
 * uniplus-toast.js — Toast notifications (accessible)
 * =============================================================================
 * Auto-creates two regions on first use:
 *   - polite  → info / success / warning
 *   - assertive → danger (errors must announce immediately)
 *
 * Usage:
 *   UniToast.show({ type: 'success', title: 'Inscrição enviada', message: '…' });
 *   UniToast.show({ type: 'danger',  title: 'Erro de rede',     message: '…', duration: 0 });
 *
 * duration 0 = sticky (require manual close). Default for danger=0, others=6000ms.
 * ========================================================================== */
(function () {
  'use strict';

  let stack = null;
  let politeRegion = null;
  let assertiveRegion = null;

  function ensureStack() {
    if (stack) return stack;
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
    return stack;
  }

  function ensureRegion(assertive) {
    const existing = assertive ? assertiveRegion : politeRegion;
    if (existing) return existing;
    const host = ensureStack();
    const ul = document.createElement('ul');
    ul.className = 'toast-region';
    ul.setAttribute('role', 'list');
    ul.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    ul.setAttribute('aria-atomic', 'false');
    ul.style.listStyle = 'none';
    /* F-021: assertive toasts (danger) visually pinned ABOVE polite so a
     * stuck error never gets hidden by a chatty info toast. */
    if (assertive) host.prepend(ul);
    else host.appendChild(ul);
    if (assertive) assertiveRegion = ul; else politeRegion = ul;
    return ul;
  }

  const ICONS = {
    success: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
    warning: '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    danger:  '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    info:    '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8h.01M11 12h1v4h1"/></svg>',
  };

  function show({ type = 'info', title = '', message = '', duration } = {}) {
    const assertive = type === 'danger';
    if (duration === undefined) duration = assertive ? 0 : 6000;
    const region = ensureRegion(assertive);

    const li = document.createElement('li');
    li.className = `toast toast--${type}`;
    li.setAttribute('role', assertive ? 'alert' : 'status');

    li.innerHTML = `
      ${ICONS[type] || ICONS.info}
      <div class="toast__body">
        ${title ? `<p class="toast__title">${escapeHtml(title)}</p>` : ''}
        ${message ? `<p class="toast__msg">${escapeHtml(message)}</p>` : ''}
      </div>
      <button class="toast__close" aria-label="Fechar notificação">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    `;

    const dismiss = () => {
      li.style.transition = 'opacity 180ms';
      li.style.opacity = '0';
      setTimeout(() => li.remove(), 200);
    };
    li.querySelector('.toast__close').addEventListener('click', dismiss);
    if (duration > 0) setTimeout(dismiss, duration);

    region.appendChild(li);
    return { dismiss };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.UniToast = { show };
})();
