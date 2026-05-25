/* =============================================================================
 * uniplus-backtotop.js — Floating "Back to top" action
 * =============================================================================
 * Attaches to any <button class="uni-back-to-top" data-back-to-top>.
 * Shows/hides based on scroll threshold (default 400px). On click, scrolls
 * to the page top and moves focus back to <main id="main"> (or the first
 * landmark) so screen reader announcement is consistent.
 *
 * Respects prefers-reduced-motion (instant jump instead of smooth scroll).
 * ========================================================================== */
(function () {
  'use strict';

  const THRESHOLD = 400;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;

    let visible = false;
    let raf = 0;

    function sync() {
      raf = 0;
      const shouldShow = window.scrollY > THRESHOLD;
      if (shouldShow !== visible) {
        visible = shouldShow;
        // `hidden` is the source of truth so the documented markup
        // `<button hidden data-back-to-top>` un-hides once past the threshold.
        btn.hidden = !visible;
        btn.classList.toggle('is-visible', visible); // visual fade only
        btn.setAttribute('aria-hidden', String(!visible));
        btn.tabIndex = visible ? 0 : -1;
      }
    }

    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(sync);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      // Restore focus to main landmark so the next Tab is predictable
      const main = document.getElementById('main') || document.querySelector('main');
      if (main) {
        const prev = main.tabIndex;
        main.tabIndex = -1;
        main.focus({ preventScroll: true });
        // Restore original tabIndex after focus moves elsewhere
        setTimeout(() => { main.tabIndex = prev; }, 0);
      }
    });

    // Initial state — hidden until the user scrolls past the threshold.
    btn.hidden = true;
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
