/* =============================================================================
 * uniplus-overlay.js — Drawer & Dialog runtime (Padrão CRUD administrativo)
 * =============================================================================
 * Liga gatilhos a <dialog> nativos (.uni-drawer e .uni-dialog) sem dependências.
 *
 *   <button data-drawer-trigger="ID" aria-haspopup="dialog" aria-expanded="false">
 *   <button data-dialog-trigger="ID" aria-haspopup="dialog" aria-expanded="false">
 *   ... dentro do <dialog id="ID">:
 *   <button data-drawer-close> | <button data-dialog-close>
 *
 * Comportamento (contrato de acessibilidade):
 *   - Abre com dialog.showModal() → foco automático, trap de foco e Esc nativos.
 *   - aria-expanded do gatilho é sincronizado na ABERTURA e em TODO fechamento
 *     (botão fechar, clique no backdrop, Esc/cancel, evento close).
 *   - Ao fechar, o foco volta para o gatilho que abriu o overlay.
 *   - Clique no backdrop (área fora do __panel) fecha.
 *
 * Não controla menus (.menu) — esse contrato (setas/Esc/foco no 1º item) é
 * tratado por helper próprio quando necessário.
 * ========================================================================== */
(function () {
  'use strict';

  if (typeof document === 'undefined') return;

  // Guarda o gatilho que abriu cada <dialog> para restaurar foco/aria ao fechar.
  var triggerFor = new WeakMap();

  function openDialog(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (dialog.open) return;
    if (trigger) {
      triggerFor.set(dialog, trigger);
      trigger.setAttribute('aria-expanded', 'true');
    }
    dialog.showModal();
  }

  function closeDialog(dialog) {
    if (!dialog || !dialog.open) return;
    dialog.close(); // dispara o evento 'close' → syncClosed cuida de aria/foco
  }

  // Sincroniza aria-expanded e devolve o foco ao gatilho. Idempotente.
  function syncClosed(dialog) {
    var trigger = triggerFor.get(dialog);
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      // só devolve foco se o foco ainda estiver dentro (ou foi para o body)
      if (typeof trigger.focus === 'function') trigger.focus();
      triggerFor.delete(dialog);
    }
  }

  // Delegação única de cliques: abrir / fechar / backdrop.
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-drawer-trigger],[data-dialog-trigger]');
    if (opener) {
      var id = opener.getAttribute('data-drawer-trigger') || opener.getAttribute('data-dialog-trigger');
      var target = id && document.getElementById(id);
      if (target) { e.preventDefault(); openDialog(target, opener); }
      return;
    }

    var closer = e.target.closest('[data-drawer-close],[data-dialog-close]');
    if (closer) {
      e.preventDefault();
      closeDialog(closer.closest('dialog'));
      return;
    }

    // Clique no backdrop: o alvo é o próprio <dialog> (fora do __panel).
    if (e.target.matches && e.target.matches('dialog.uni-drawer, dialog.uni-dialog')) {
      closeDialog(e.target);
    }
  });

  // Garante sync ao fechar por qualquer via (Esc dispara 'cancel' depois 'close').
  function bind(dialog) {
    if (dialog.__uniOverlayBound) return;
    dialog.__uniOverlayBound = true;
    dialog.addEventListener('close', function () { syncClosed(dialog); });
    // 'cancel' = Esc; deixa o fechamento nativo seguir e o 'close' sincroniza.
  }

  function bindAll() {
    document.querySelectorAll('dialog.uni-drawer, dialog.uni-dialog').forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  // Exposto para overlays criados dinamicamente.
  window.UniOverlay = { open: openDialog, close: closeDialog, bind: bind };
})();
