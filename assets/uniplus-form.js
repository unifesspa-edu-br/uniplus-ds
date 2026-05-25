/* =============================================================================
 * uniplus-form.js — Accessible form validation helpers
 * =============================================================================
 * UniForm.validate(formEl, rules?) → { ok, errors }
 *   errors = [{ field, label, message }]
 * UniForm.applyErrors(formEl, errors) — sets aria-invalid, reveals .field__error
 *   nodes (matched by id), moves focus to first invalid field, builds an
 *   error-summary at the top of the form.
 * UniForm.clear(formEl) — clears aria-invalid, hides errors.
 *
 * Built-in rules pulled from data-* attributes on fields:
 *   required, minlength, maxlength, pattern, type=email, type=cpf (special).
 * For custom rules, pass them in the second arg keyed by input name.
 * ========================================================================== */
(function () {
  'use strict';

  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function validate(formEl, custom) {
    custom = custom || {};
    const errors = [];
    const inputs = $$('input[name], select[name], textarea[name]', formEl);
    const seenRadioGroups = new Set();

    for (const el of inputs) {
      if (el.disabled || el.type === 'hidden') continue;

      // ---- Checkbox: estado marcado, não value (ex.: consentimento LGPD) ----
      if (el.type === 'checkbox') {
        if (el.required && !el.checked) {
          const label = labelFor(formEl, el);
          errors.push({ field: el, label, message: 'É necessário marcar esta opção para continuar.' });
        }
        continue;
      }

      // ---- Radio: valida o GRUPO pelo name, uma única vez ----
      if (el.type === 'radio') {
        if (!el.name || seenRadioGroups.has(el.name)) continue;
        seenRadioGroups.add(el.name);
        const group = $$(`input[type="radio"][name="${cssEscape(el.name)}"]`, formEl)
          .filter(r => !r.disabled);
        if (!group.length) continue;
        const required = group.some(r => r.required);
        const checked = group.some(r => r.checked);
        if (required && !checked) {
          // Reporta no primeiro radio do grupo — não duplica em cada opção.
          errors.push({ field: group[0], label: groupLabel(formEl, group), message: 'Selecione uma das opções.' });
        }
        continue;
      }

      const v = el.value.trim();
      const label = labelFor(formEl, el);

      // Ordem das mensagens: required → email → cpf → minLength → maxLength → pattern → custom
      // Required
      if (el.required && !v) {
        errors.push({ field: el, label, message: 'Este campo é obrigatório.' });
        continue;
      }
      // Email
      if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        errors.push({ field: el, label, message: 'Informe um e-mail válido, no formato nome@exemplo.com.' });
        continue;
      }
      // CPF (mask + check digit)
      if (el.dataset.format === 'cpf' && v && !isValidCPF(v)) {
        errors.push({ field: el, label, message: 'CPF inválido. Verifique os números e tente novamente.' });
        continue;
      }
      // Min length — só quando há conteúdo (igual à constraint nativa)
      if (el.minLength > 0 && v && v.length < el.minLength) {
        errors.push({ field: el, label, message: `Informe ao menos ${el.minLength} caracteres.` });
        continue;
      }
      // Max length — pega tooLong mesmo com novalidate (atributo só limita digitação)
      if (el.maxLength > 0 && v && v.length > el.maxLength) {
        errors.push({ field: el, label, message: `Use no máximo ${el.maxLength} caracteres.` });
        continue;
      }
      // Pattern — ancorado como a constraint nativa; usa o title como mensagem se houver
      if (el.pattern && v && !patternMatches(el.pattern, v)) {
        const hint = el.title && el.title.trim();
        errors.push({ field: el, label, message: hint || 'O formato informado não é válido.' });
        continue;
      }
      // Custom
      if (custom[el.name]) {
        const r = custom[el.name](v, el);
        if (r) errors.push({ field: el, label, message: r });
      }
    }

    return { ok: errors.length === 0, errors };
  }

  function labelFor(formEl, el) {
    return formEl.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || el.name;
  }

  function groupLabel(formEl, group) {
    const legend = group[0].closest('fieldset')?.querySelector('legend')?.textContent?.trim();
    return legend || labelFor(formEl, group[0]);
  }

  function patternMatches(pattern, value) {
    try {
      return new RegExp(`^(?:${pattern})$`, 'u').test(value);
    } catch (_) {
      return new RegExp(`^(?:${pattern})$`).test(value);
    }
  }

  function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&');
  }

  function applyErrors(formEl, errors) {
    clear(formEl);
    if (!errors.length) return;

    // 1) Per-field
    for (const err of errors) {
      err.field.setAttribute('aria-invalid', 'true');
      err.field.closest('.field')?.classList.add('is-error');
      const errId = err.field.id + '-error';
      let errNode = document.getElementById(errId);
      if (!errNode) {
        errNode = document.createElement('p');
        errNode.id = errId;
        errNode.className = 'field__error';
        err.field.closest('.field')?.appendChild(errNode);
        const describedBy = err.field.getAttribute('aria-describedby') || '';
        err.field.setAttribute('aria-describedby', (describedBy + ' ' + errId).trim());
      }
      errNode.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>${escapeHtml(err.message)}`;
      errNode.hidden = false;
    }

    // 2) Top summary
    let sum = formEl.querySelector('.error-summary');
    if (!sum) {
      sum = document.createElement('div');
      sum.className = 'error-summary';
      sum.setAttribute('role', 'alert');
      sum.setAttribute('aria-labelledby', 'error-summary-title');
      sum.tabIndex = -1;
      formEl.prepend(sum);
    }
    sum.innerHTML = `
      <h2 id="error-summary-title" class="error-summary__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        Há ${errors.length === 1 ? '1 erro' : errors.length + ' erros'} no formulário
      </h2>
      <ul class="error-summary__list">
        ${errors.map(e => `<li><a href="#${e.field.id}">${escapeHtml(e.label)}: ${escapeHtml(e.message)}</a></li>`).join('')}
      </ul>
    `;
    sum.focus();
    // Skip browser default scroll-to-hash: use programmatic scroll on field click
    sum.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) { target.focus({ preventScroll: false }); }
      });
    });
  }

  function clear(formEl) {
    formEl.querySelectorAll('[aria-invalid="true"]').forEach(el => {
      el.setAttribute('aria-invalid', 'false');
      el.closest('.field')?.classList.remove('is-error');
    });
    formEl.querySelectorAll('.field__error').forEach(el => { el.hidden = true; });
    formEl.querySelector('.error-summary')?.remove();
  }

  function isValidCPF(raw) {
    const cpf = raw.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }

  function maskCPF(value) {
    const v = value.replace(/\D/g, '').slice(0, 11);
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  // Auto-attach CPF mask to inputs with data-format="cpf"
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches && el.matches('input[data-format="cpf"]')) {
      const pos = el.selectionEnd;
      el.value = maskCPF(el.value);
      // Restore caret near end (lazy)
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  window.UniForm = { validate, applyErrors, clear, isValidCPF, maskCPF };
})();
