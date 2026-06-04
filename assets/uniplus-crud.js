/* =============================================================================
 * uniplus-crud.js — Comportamentos do Padrão CRUD administrativo
 * =============================================================================
 * Dirigido por data-* — nenhuma página precisa de JS inline para o básico.
 * Depende de uniplus-overlay.js (drawer/dialog), uniplus-form.js (validação) e
 * uniplus-toast.js (feedback). Todos opcionais: degrada com segurança se ausentes.
 *
 * CONTRATOS (atributos):
 *   Shell:    #admin-shell, #admin-sidebar, #sidebar-toggle, [data-sidebar-close]
 *   Tabs:     [role=tab][aria-controls], [role=tabpanel]
 *   Lista:    [data-scope] contendo
 *               [data-search-input]                      busca textual
 *               [data-chip][data-region="v"]             chips (aria-pressed)
 *               [data-select-filter][data-col="N"]       select opcional (coluna N)
 *               [data-search-table] com <tr [data-region]>
 *               [data-empty]   estado vazio
 *               [data-count]    contador
 *               [data-filter-clear]  botões "Limpar"
 *   Form:     [data-demo-form] (dentro ou não de <dialog>); submit com .spinner
 *   Modal:    gatilho [data-dialog-trigger="ID"] com data-fill-<slot>="..."
 *               → preenche [data-slot="<slot>"] no dialog;
 *               [data-show-if-positive="<slot>"] aparece se o valor numérico > 0
 *               [data-show-if-zero="<slot>"]     aparece se o valor numérico <= 0
 *             confirmação: [data-confirm-toast] com data-toast-{type,title,message}
 * ========================================================================== */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const ready = (fn) => (document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn) : fn());

  // ---- Sidebar mobile ----
  function initSidebar() {
    const SHELL = document.getElementById('admin-shell');
    const BTN = document.getElementById('sidebar-toggle');
    const SIDEBAR = document.getElementById('admin-sidebar');
    if (!SHELL || !BTN || !SIDEBAR) return;
    const MAIN = SHELL.querySelector('.admin-main');
    const D = window.matchMedia('(min-width: 1024px)');
    const isOpen = () => SHELL.getAttribute('data-sidebar-mobile') === 'open';
    // Off-canvas mobile: isola o conteúdo de fundo (inert + aria-hidden).
    const isolate = (on) => { if (!MAIN) return; MAIN.inert = on; if (on) MAIN.setAttribute('aria-hidden', 'true'); else MAIN.removeAttribute('aria-hidden'); };
    const open = () => { SHELL.setAttribute('data-sidebar-mobile', 'open'); SIDEBAR.removeAttribute('aria-hidden'); SIDEBAR.inert = false; isolate(true); BTN.setAttribute('aria-expanded', 'true'); SIDEBAR.querySelector('a')?.focus(); };
    // No desktop a sidebar é estática e SEMPRE acessível — só ocultamos de AT no mobile fechado.
    const close = () => { const was = isOpen(); SHELL.removeAttribute('data-sidebar-mobile'); isolate(false); BTN.setAttribute('aria-expanded', 'false'); if (!D.matches) { SIDEBAR.setAttribute('aria-hidden', 'true'); SIDEBAR.inert = true; } if (was) BTN.focus(); };
    const syncViewport = () => {
      if (D.matches) { SHELL.removeAttribute('data-sidebar-mobile'); isolate(false); SIDEBAR.removeAttribute('aria-hidden'); SIDEBAR.inert = false; BTN.setAttribute('aria-expanded', 'false'); }
      else if (!isOpen()) { SIDEBAR.setAttribute('aria-hidden', 'true'); SIDEBAR.inert = true; }
    };
    BTN.addEventListener('click', () => { if (D.matches) return; isOpen() ? close() : open(); });
    document.querySelectorAll('[data-sidebar-close]').forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !D.matches && isOpen()) close(); });
    D.addEventListener('change', syncViewport);
    syncViewport();
  }

  // ---- Tabs (role=tablist) ----
  function initTabs() {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    const panels = document.querySelectorAll('[role="tabpanel"]');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); t.setAttribute('tabindex', '-1'); });
        panels.forEach(p => { p.hidden = true; });
        tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true'); tab.removeAttribute('tabindex');
        const p = document.getElementById(tab.getAttribute('aria-controls')); if (p) p.hidden = false;
      });
      tab.addEventListener('keydown', e => {
        let idx = i;
        if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
        else return;
        e.preventDefault(); tabs[idx].click(); tabs[idx].focus();
      });
    });
  }

  // ---- Filtros de lista (busca + chips + select) + empty-state + contador ----
  function initFilters() {
    document.querySelectorAll('[data-scope]').forEach(scope => {
      const input = scope.querySelector('[data-search-input]');
      const table = scope.querySelector('[data-search-table]');
      const empty = scope.querySelector('[data-empty]');
      const count = scope.querySelector('[data-count]');
      const select = scope.querySelector('[data-select-filter]');
      const chips = scope.querySelectorAll('[data-chip]');
      const pager = scope.querySelector('.pager');
      if (!table || !table.tBodies[0]) return;
      const rows = Array.from(table.tBodies[0].rows);
      let region = '';

      function apply() {
        const q = (input?.value || '').trim().toLowerCase();
        const selVal = (select?.value || '').toLowerCase();
        const selCol = select ? parseInt(select.getAttribute('data-col'), 10) : -1;
        let visible = 0;
        rows.forEach(row => {
          const matchQ = !q || row.textContent.toLowerCase().includes(q);
          const matchRegion = !region || (row.getAttribute('data-region') || '') === region;
          const matchSel = !selVal || (row.cells[selCol]?.textContent.toLowerCase().includes(selVal));
          const show = matchQ && matchRegion && matchSel;
          row.hidden = !show;
          if (show) visible++;
        });
        if (count) count.textContent = String(visible);
        if (empty) empty.hidden = visible !== 0;
        if (table.parentElement) table.parentElement.hidden = visible === 0;
        if (pager) pager.hidden = visible === 0; // sem resultados → some a paginação
      }

      input?.addEventListener('input', apply);
      select?.addEventListener('change', apply);
      chips.forEach(chip => chip.addEventListener('click', () => {
        chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        region = chip.getAttribute('data-region') || '';
        apply();
      }));
      scope.querySelectorAll('[data-filter-clear]').forEach(btn => btn.addEventListener('click', () => {
        if (input) input.value = '';
        if (select) select.value = '';
        region = '';
        chips.forEach((c, i) => c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'));
        apply(); input?.focus();
      }));
    });
  }

  // ---- Submit de demonstração: validação → loading → toast → fecha drawer ----
  function initDemoForms() {
    document.querySelectorAll('[data-demo-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const dialog = form.closest('dialog');
        const submitBtn = (dialog || document).querySelector('button[type="submit"][form="' + form.id + '"]')
          || form.querySelector('button[type="submit"]');
        const res = window.UniForm ? UniForm.validate(form) : { ok: form.checkValidity(), errors: [] };
        if (!res.ok) {
          if (window.UniForm) UniForm.applyErrors(form, res.errors); // cria .field__error e move o foco
          else form.querySelector(':invalid')?.focus();
          return;
        }
        if (submitBtn) { submitBtn.setAttribute('data-loading', 'true'); submitBtn.setAttribute('aria-busy', 'true'); }
        window.setTimeout(() => {
          if (submitBtn) { submitBtn.removeAttribute('data-loading'); submitBtn.removeAttribute('aria-busy'); }
          if (dialog && window.UniOverlay) UniOverlay.close(dialog);
          if (window.UniForm) UniForm.clear(form);
          form.reset();
          // Ressincroniza campos condicionais após o reset (selects/checkboxes voltam ao default).
          form.querySelectorAll('select, input[type="checkbox"]').forEach(el => el.dispatchEvent(new Event('change', { bubbles: true })));
          const title = form.getAttribute('data-demo-form') || 'Registro salvo';
          if (window.UniToast) UniToast.show({ type: 'success', title, message: 'Alterações aplicadas (exemplo do kit — sem persistência real).' });
        }, 700);
      });
    });
  }

  // ---- Preenchimento de modal (data-fill-*) + impacto condicional ----
  function initDialogFill() {
    document.querySelectorAll('[data-dialog-trigger]').forEach(trigger => {
      const hasFill = Array.from(trigger.attributes).some(a => a.name.startsWith('data-fill-'));
      if (!hasFill) return;
      trigger.addEventListener('click', () => {
        const dialog = document.getElementById(trigger.getAttribute('data-dialog-trigger'));
        if (!dialog) return;
        Array.from(trigger.attributes).forEach(attr => {
          if (!attr.name.startsWith('data-fill-')) return;
          const slot = attr.name.slice('data-fill-'.length);
          dialog.querySelectorAll('[data-slot="' + slot + '"]').forEach(el => { el.textContent = attr.value; });
          const positive = parseFloat(attr.value) > 0;
          dialog.querySelectorAll('[data-show-if-positive="' + slot + '"]').forEach(el => {
            el.hidden = !positive;
          });
          dialog.querySelectorAll('[data-show-if-zero="' + slot + '"]').forEach(el => {
            el.hidden = positive;
          });
        });
      });
    });
  }

  // ---- Botão confirmar → fecha dialog + toast ----
  function initConfirmToast() {
    document.querySelectorAll('[data-confirm-toast]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dialog = btn.closest('dialog');
        if (dialog && window.UniOverlay) UniOverlay.close(dialog);
        if (window.UniToast) UniToast.show({
          type: btn.getAttribute('data-toast-type') || 'success',
          title: btn.getAttribute('data-toast-title') || 'Concluído',
          message: btn.getAttribute('data-toast-message') || ''
        });
      });
    });
  }

  ready(() => { initSidebar(); initTabs(); initFilters(); initDemoForms(); initDialogFill(); initConfirmToast(); });
})();
