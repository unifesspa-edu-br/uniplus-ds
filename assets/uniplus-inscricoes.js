// ============================================================================
// Utilitários compartilhados
// ============================================================================
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// ---- Mobile step overlay ----
(function () {
  const btn = document.getElementById('step-bar');
  const overlay = document.getElementById('steps-overlay');
  const closeBtn = document.getElementById('overlay-close');
  if (!btn || !overlay) return;

  function setBackground(inert) {
    [...overlay.parentElement.children].forEach(el => { if (el !== overlay) el.inert = inert; });
    const govBar = document.querySelector('.gov-bar');
    if (govBar) govBar.inert = inert;
  }

  function open() {
    overlay.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setBackground(true);
    closeBtn?.focus();
  }

  function close() {
    overlay.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setBackground(false);
    btn.focus();
  }

  btn.addEventListener('click', () => { if (overlay.hidden) open(); else close(); });
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) close(); });
  overlay.addEventListener('click', e => { if (e.target.closest('.steps__item')) close(); });
})();

// ---- Wizard ----
(function () {
  'use strict';

  const STEPS = [
    { id: 2, label: 'Identificação' },
    { id: 3, label: 'Endereço' },
    { id: 4, label: 'Curso e Cidade' },
    { id: 5, label: 'Atendimento' },
    { id: 6, label: 'Modalidades' },
    { id: 7, label: 'Comprovação' },
    { id: 8, label: 'Revisão' },
  ];

  const deficiencias = [
    'Não Possuo', 'Cegueira', 'Baixa Visão', 'Surdez', 'Auditiva', 'Física',
    'Surdocegueira', 'Intelectual', 'Transtorno do espectro autista (TEA)',
    'Altas habilidades / Superdotação', 'Visão Monocular',
  ];

  const atendimentos = [
    'Não Necessito', 'Prova Ampliada de 18 até 24',
    'Tempo Adicional (até 1 hora)', 'Prova em Braile',
    'Intérprete de Língua de Sinais', 'Ledor/Transcritor', 'Lactante',
  ];

  const etniasIndigenas = [
    'Amanayé','Anambé','Aparai','Apiaká','Arapiuns','Arara','Arara da Volta Grande',
    'Arara Vermelha','Araweté','Asurini do Tocantins','Asurini do Xingu','Atikun',
    'Awaeté-Parakanã','Borari','Cara Preta','Galibi-Marworno','Gavião Akrãtikatêjê',
    'Gavião Kyikatêjê','Gavião Parkatêjê','Guajajara','Guarani','Guarani-Mbya',
    'Hixkaryana','Jaraqui','Karajá','Katxuyana','Kayapó Mebêngôkre','Kayapó Xikrin',
    'Kraô','Kuruaya','Munduruku','Panará','Suruí-Aikewara','Tapajó','Tembé','Ticuna',
    'Tiriyó','Tunayana','Tupaiú','Turiwara','Waiwai','Wajãpi','Warao','Wayana',
    'Xikrin','Xipaya','Yanomami','Zo\'e','Não encontrei minha etnia/comunidade',
  ];

  const quilombos = [
    'Quilombo Araquembaua','Quilombo Baixo Jambuaçu','Quilombo Carará',
    'Quilombo Comunidade Porto Alegre','Quilombo Cupu','Quilombo de Anilzinho',
    'Quilombo de Calados','Quilombo de Engenho Mararia','Quilombo de Fugido',
    'Quilombo do Engenho','Quilombo Igarapé Preto','Quilombo Joana Peres',
    'Quilombo Remanescentes de quilombo de Varginha','Quilombo Santa Luzia do Traquateua',
    'Quilombo Teófilo','Quilombo Umarizal Beira','Quilombo Vila Nova Jutaí',
    'Quilombo Santa Maria do Traquateua','Não encontrei minha etnia/comunidade',
  ];

  let currentStep = 2;
  let psEscolhido = 'Vestibular';
  let racaEscolhida = '';
  let deficienciasMarcadas = [];

  function isTransferencia() {
    return ['TE', 'TI'].includes(psEscolhido);
  }

  function psRequereUploads() {
    if (!psEscolhido) return true;
    return ['TI', 'TE', 'PSE', 'EC'].includes(psEscolhido);
  }

  function getVisibleSteps() {
    return STEPS.filter(s => {
      if (isTransferencia() && s.id === 6) return false;
      if (!psRequereUploads() && s.id === 7) return false;
      return true;
    });
  }

  function getCurrentVisibleIndex() {
    const visible = getVisibleSteps();
    return Math.max(0, visible.findIndex(s => s.id === currentStep));
  }

  function getLastStep() {
    const visible = getVisibleSteps();
    return visible[visible.length - 1].id;
  }

  function getNextStep() {
    const visible = getVisibleSteps();
    const idx = getCurrentVisibleIndex();
    return visible[Math.min(idx + 1, visible.length - 1)].id;
  }

  function getPrevStep() {
    const visible = getVisibleSteps();
    const idx = getCurrentVisibleIndex();
    return visible[Math.max(idx - 1, 0)].id;
  }

  function normalizarCurrentStep() {
    const ids = getVisibleSteps().map(s => s.id);
    if (!ids.includes(currentStep)) {
      currentStep = currentStep < 6 ? 5 : 7;
    }
  }

  function renderView() {
    normalizarCurrentStep();

    const visible = getVisibleSteps();
    const totalSteps = visible.length;
    const currentIdx = getCurrentVisibleIndex();
    const currentLabel = visible[currentIdx].label;

    STEPS.forEach(s => {
      const el = document.getElementById('step-' + s.id);
      if (el) el.hidden = s.id !== currentStep;
    });

    const badge = document.querySelector('#step-' + currentStep + ' .step-head__badge');
    if (badge) badge.textContent = 'Passo ' + (currentIdx + 1);

    const visibleIds = new Set(visible.map(s => s.id));

    const allNavItems = document.querySelectorAll('#nav-steps .steps__item');
    allNavItems.forEach(item => { item.hidden = !visibleIds.has(+item.dataset.step); });
    const navItems = [...allNavItems].filter(i => !i.hidden);
    navItems.forEach((item, idx) => {
      item.classList.remove('is-active', 'is-done');
      if (idx === currentIdx) item.classList.add('is-active');
      else if (idx < currentIdx) item.classList.add('is-done');
      const numText = item.querySelector('.num-text');
      if (numText) numText.textContent = idx + 1;
      const labelEl = item.querySelector('.steps__label');
      const stepDef = STEPS.find(s => s.id === +item.dataset.step);
      if (labelEl && stepDef) labelEl.textContent = String(idx + 1).padStart(2, '0') + ' ' + stepDef.label;
    });

    const allOverlayItems = document.querySelectorAll('#steps-overlay .steps__item');
    allOverlayItems.forEach(item => { item.hidden = !visibleIds.has(+item.dataset.step); });
    const overlayItems = [...allOverlayItems].filter(i => !i.hidden);
    overlayItems.forEach((item, idx) => {
      item.classList.remove('is-active', 'is-done', 'is-pending');
      if (idx === currentIdx) item.classList.add('is-active');
      else if (idx < currentIdx) item.classList.add('is-done');
      const numText = item.querySelector('.num-text');
      if (numText) numText.textContent = idx + 1;
    });

    const stepBarMeta = document.getElementById('step-bar-meta');
    if (stepBarMeta) {
      const num = String(currentIdx + 1).padStart(2, '0');
      stepBarMeta.textContent = `Etapa ${currentIdx + 1} de ${totalSteps} (${num} ${currentLabel})`;
    }
    document.querySelector('.step-bar')
      ?.style.setProperty('--step-progress', ((currentIdx + 1) / totalSteps * 100).toFixed(2) + '%');

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) btnPrev.hidden = currentStep === STEPS[0].id;

    if (btnNext) {
      if (currentStep === getLastStep()) {
        btnNext.innerHTML = 'Finalizar Inscrição <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
      } else {
        btnNext.innerHTML = 'Próximo <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      }
    }

    if (currentStep === 6) configurarModalidades();
    if (currentStep === 7) renderUploads();
  }

  function configurarModalidades() {
    const divCotas = document.getElementById('div-cotas');
    if (!divCotas) return;
    divCotas.hidden = isTransferencia();

    if (!isTransferencia()) {
      const divPcD = document.getElementById('div-pcd');
      const divPPI = document.getElementById('div-ppi');
      const divIndigena = document.getElementById('div-indigena');
      if (divPcD) divPcD.hidden = !deficienciasMarcadas.length || deficienciasMarcadas.includes('Não Possuo');
      if (divPPI) divPPI.hidden = !(racaEscolhida === 'preta' || racaEscolhida === 'parda');
      if (divIndigena) divIndigena.hidden = racaEscolhida !== 'indigena';
    }
  }

  function renderUploads() {
    const container = document.getElementById('uploadsDinamicos');
    if (!container) return;
    let itens = [];
    if (psEscolhido === 'TI') itens = ['Histórico Escolar de Graduação'];
    else if (psEscolhido === 'TE') itens = ['Histórico Escolar da Graduação', 'Matriz Curricular da Graduação'];
    else if (psEscolhido === 'PSE') itens = ['Declaração de Pertencimento', 'Autodeclaração'];
    else if (psEscolhido === 'EC') itens = ['Declaração de Pertencimento à Comunidade do Campo'];

    container.innerHTML = itens.length
      ? itens.map((label, i) => `
          <div class="upload-section">
            <p class="label">${escapeHtml(label)}</p>
            <label class="upload-zone">
              <input id="upload_${i}" type="file" class="sr-only">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <span class="upload-zone__link">Selecionar arquivo</span>
              <span class="upload-zone__hint">PDF, JPG ou PNG · máx. 2 MB</span>
            </label>
          </div>
        `).join('')
      : '<p style="color:var(--text-secondary)">Nenhum documento exigido para o processo seletivo escolhido.</p>';
  }

  function initStatic() {

    const defBox = document.getElementById('deficienciasBox');

    if (defBox) {
      defBox.innerHTML = deficiencias.map(x => `
        <label class="insc-chip">
          <input
            type="checkbox"
            name="deficiencia"
            value="${escapeHtml(x)}">
          <span>${escapeHtml(x)}</span>
        </label>
      `).join('');
    }

    const atendBox = document.getElementById('atendimentoBox');

    if (atendBox) {
      atendBox.innerHTML = atendimentos.map(x => `
        <label class="insc-chip">
          <input
            type="checkbox"
            name="atendimento"
            value="${escapeHtml(x)}">
          <span>${escapeHtml(x)}</span>
        </label>
      `).join('');
    }

    if (defBox) {
      defBox.querySelectorAll('input[name="deficiencia"]').forEach(input => {
        input.addEventListener('change', () => {
          window._controleNaoPossuo(input, 'deficiencia', 'Não Possuo');
        });
      });
    }

    if (atendBox) {
      atendBox.querySelectorAll('input[name="atendimento"]').forEach(input => {
        input.addEventListener('change', () => {
          window._controleNaoPossuo(input, 'atendimento', 'Não Necessito');
        });
      });
    }

  }

  /* ---- scroll helpers ---- */

  let isKeyboardNavigating = false;

  /** Retorna o elemento que é o scroll container do wizard */
  function getWizardScroller() {
    return document.querySelector('.wiz-content');
  }

  function scrollWizardToTop() {
    const scroller = getWizardScroller();
    if (!scroller) return;

    requestAnimationFrame(() => {
      scroller.scrollTo({
        top: 0,
        left: 0,
        behavior: isKeyboardNavigating ? 'auto' : 'smooth'
      });
    });
  }

  /* ---- public helpers (called by inline onchange) ---- */

  window._controleNaoPossuo = function (cb, name, noneVal) {
    const group = [...document.querySelectorAll(`input[name="${name}"]`)];
    if (cb.value === noneVal && cb.checked) {
      group.forEach(i => { if (i !== cb) i.checked = false; });
    } else if (cb.value !== noneVal && cb.checked) {
      const none = group.find(i => i.value === noneVal);
      if (none) none.checked = false;
    }
  };

  window._toggleNomeSocial = function () {
    const el = document.getElementById('divNomeSocial');
    const sel = document.getElementById('desejaNomeSocial');
    if (el) el.hidden = sel?.value !== 'Sim';
  };

  window._toggleModeloRG = function () {
    const modeloAntigo =
      document.getElementById('rg_novo_modelo')?.checked;

    const divAntigo =
      document.getElementById('rgModeloAntigo');

    const divNovo =
      document.getElementById('rgModeloNovo');

    const textoModelo =
      document.getElementById('rgModeloTexto');

    if (divAntigo) {
      divAntigo.hidden = !modeloAntigo;
    }

    if (divNovo) {
      divNovo.hidden = modeloAntigo;
    }

    if (textoModelo) {
      textoModelo.textContent =
        modeloAntigo
          ? 'Modelo antigo de RG'
          : 'Novo modelo de RG';
    }

    // Se mudou para o modelo novo
    if (!modeloAntigo) {
      _sincronizarRgComCpf();
      _calcularValidadeCIN();
    }
  };

  window._sincronizarRgComCpf = function () {
    const novoModelo = !document.getElementById('rg_novo_modelo')?.checked;
    const cpfValue = document.getElementById('cpf')?.value || '';
    if (novoModelo) {
      const el = document.getElementById('rg_novo_numero');
      if (el) el.value = cpfValue;
    }
  };

  window._calcularValidadeCIN = function () {
    const novoModelo = !document.getElementById('rg_novo_modelo')?.checked;
    if (!novoModelo) return;
    const dataNasc = document.getElementById('data_nasc')?.value;
    const dataEmissao = document.getElementById('rg_novo_data_emissao')?.value;
    const validadeField = document.getElementById('rg_novo_validade');
    const hintEl = document.getElementById('rg_novo_validade_hint');
    if (!dataNasc || !dataEmissao || !validadeField) return;
    const nasc = new Date(dataNasc), emissao = new Date(dataEmissao);
    let idade = emissao.getFullYear() - nasc.getFullYear();
    const mesOff = emissao.getMonth() - nasc.getMonth();
    if (mesOff < 0 || (mesOff === 0 && emissao.getDate() < nasc.getDate())) idade--;
    if (idade >= 60) {
      validadeField.value = '';
      if (hintEl) hintEl.textContent = 'Validade indeterminada (60 anos ou mais na emissão).';
    } else {
      const anos = idade <= 11 ? 5 : 10;
      const expiry = new Date(emissao);
      expiry.setFullYear(expiry.getFullYear() + anos);
      validadeField.value = expiry.toISOString().split('T')[0];
      if (hintEl) hintEl.textContent = `Calculada automaticamente: ${anos} anos (faixa ${idade <= 11 ? '0 a 11' : '12 a 59'} anos).`;
    }
  };

  window._toggleEtnia = function () {
    const val = document.getElementById('tipoLocalidade')?.value;
    const div = document.getElementById('divEtnia');
    const sel = document.getElementById('selectEtnia');
    const lbl = document.getElementById('labelEtnia');
    let lista = [];
    if (val === 'Aldeia' || val === 'Comunidade') {
      lista = etniasIndigenas;
      if (lbl) lbl.textContent = 'Etnia Indígena / Comunidade *';
    } else if (val === 'Quilombo') {
      lista = quilombos;
      if (lbl) lbl.textContent = 'Nome do Quilombo *';
    }
    if (div) div.hidden = !lista.length;
    if (sel && lista.length) {
      sel.textContent = '';

      const opcaoInicial = document.createElement('option');
      opcaoInicial.value = '';
      opcaoInicial.textContent = 'Selecione';
      sel.appendChild(opcaoInicial);

      lista.forEach(x => {
        const option = document.createElement('option');
        option.value = x;
        option.textContent = x;
        sel.appendChild(option);
      });
    }
    _toggleOutraEtnia();
  };

  window._toggleOutraEtnia = function () {
    const val = document.getElementById('selectEtnia')?.value;
    const el = document.getElementById('inputOutraEtnia');
    if (el) el.hidden = val !== 'Não encontrei minha etnia/comunidade';
  };

  window._onEscolaPublicaChange = function () {
    const isSim = document.querySelector('input[name="escola_publica"]:checked')?.value === 'Sim';

    const divEP = document.getElementById('divPerguntaEP');
    const divQui = document.getElementById('div-quilombola');

    if (divEP) divEP.hidden = !isSim;
    if (divQui) divQui.hidden = !isSim;

    if (!isSim) {
      document.querySelectorAll('input[name="cota_ep"]').forEach(r => {
        r.checked = false;
      });

      document.querySelectorAll('input[name="cota_quilombola"]').forEach(r => {
        r.checked = false;
      });
    }
  };

  window._showByRadio = function (name, id) {
    const el = document.getElementById(id);
    if (el) el.hidden = document.querySelector(`input[name="${name}"]:checked`)?.value !== 'Sim';
  };

  window._atualizarListaEspera = function () {
    const lista = document.getElementById('lista_espera');
    const curso1 = document.getElementById('curso_opcao_1')?.value || '';
    const curso2 = document.getElementById('curso_opcao_2')?.value || '';
    const temSegunda = ['Vestibular', 'PSVR'].includes(psEscolhido);

    if (!lista) return;

    const valorAnterior = lista.value;

    lista.textContent = '';

    const criarOpcao = (value, texto) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = texto;
      lista.appendChild(option);
    };

    if (curso1) {
      criarOpcao('', 'Selecione');
      criarOpcao('primeira', `PARTICIPAR APENAS DE ${curso1.toUpperCase()}`);
    } else {
      criarOpcao('', 'Selecione o curso primeiro');
    }

    if (temSegunda && curso2) {
      criarOpcao('segunda', `PARTICIPAR APENAS DE ${curso2.toUpperCase()}`);
    }

    criarOpcao('nao_participar', 'Não Participar');

    const validos = [...lista.options].map(o => o.value);
    lista.value = validos.includes(valorAnterior) ? valorAnterior : '';
  };

  window._toggleSegundaOpcao = function () {
    const div = document.getElementById('divSegundaOpcao');
    const temSegunda = ['Vestibular', 'PSVR'].includes(psEscolhido);
    if (div) div.hidden = !temSegunda;
    _atualizarListaEspera();
  };

  /* ---- validation ---- */

  function req(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function labelText(id) {
    return (
      document
        .querySelector(`label[for="${id}"]`)
        ?.textContent
        ?.replace(/\*/g, '')
        .replace(/\(obrigatório\)/g, '')
        .trim() || id.replace(/_/g, ' ')
    );
  }

  function error(id, mensagem, labelCustom) {
    const field = document.getElementById(id);
    if (!field) return null;

    return {
      field,
      label: labelCustom || labelText(id),
      message: mensagem
    };
  }

  function errorGrupo(selector, label, mensagem) {
    const field = document.querySelector(selector);
    if (!field) return null;

    return {
      field,
      label,
      message: mensagem
    };
  }

  function clearErrorsWizard(root) {
    if (!root) return;

    root.querySelector('.error-summary')?.remove();

    root.querySelectorAll('[aria-invalid="true"]').forEach(el => {
      el.setAttribute('aria-invalid', 'false');
    });

    root.querySelectorAll('.is-error').forEach(el => {
      el.classList.remove('is-error');
    });

    root.querySelectorAll('.field__error[data-wizard-error="true"]').forEach(el => {
      el.remove();
    });
  }

  function applyWizardErrors(erros) {
    const stepEl = document.getElementById('step-' + currentStep);
    if (!stepEl) return;

    clearErrorsWizard(stepEl);

    const validErrors = erros.filter(Boolean);
    if (!validErrors.length) return;

    validErrors.forEach((err, index) => {
      const field = err.field;
      if (!field) return;

      if (!field.id) {
        field.id = `wizard-error-field-${currentStep}-${index}`;
      }

      field.setAttribute('aria-invalid', 'true');

      const wrapper =
        field.closest('.field') ||
        field.closest('.insc-rowq') ||
        field.closest('.insc-chip-grid') ||
        field.parentElement;

      wrapper?.classList.add('is-error');

      const errId = `${field.id}-error`;
      let errNode = document.getElementById(errId);

      if (!errNode) {
        errNode = document.createElement('p');
        errNode.id = errId;
        errNode.className = 'field__error';
        errNode.dataset.wizardError = 'true';

        if (field.matches('input[type="checkbox"], input[type="radio"]')) {
          const groupWrapper = field.closest(
            '.insc-chip-grid, .insc-rowq, label'
          );

          groupWrapper?.insertAdjacentElement('afterend', errNode);
        } else {
          field.insertAdjacentElement('afterend', errNode);
        }
      }

      const describedBy = field.getAttribute('aria-describedby') || '';
      const describedByIds = describedBy.split(/\s+/).filter(Boolean);

      if (!describedByIds.includes(errId)) {
        describedByIds.push(errId);
        field.setAttribute('aria-describedby', describedByIds.join(' '));
      }

      errNode.innerHTML = `
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        ${escapeHtml(err.message)}
      `;

      errNode.hidden = false;
    });

    const summary = document.createElement('div');

    summary.className = 'error-summary';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-labelledby', 'error-summary-title');
    summary.tabIndex = -1;

    const title = document.createElement('h2');

    title.id = 'error-summary-title';
    title.className = 'error-summary__title';

    title.innerHTML = `
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
    `;

    title.appendChild(
      document.createTextNode(
        validErrors.length === 1
          ? 'Há 1 erro no formulário'
          : `Há ${validErrors.length} erros no formulário`
      )
    );

    const list = document.createElement('ul');
    list.className = 'error-summary__list';

    validErrors.forEach(errorItem => {
      const li = document.createElement('li');
      const link = document.createElement('a');

      link.href = `#${errorItem.field.id}`;
      link.textContent = `${errorItem.label}: ${errorItem.message}`;

      li.appendChild(link);
      list.appendChild(li);
    });

    summary.appendChild(title);
    summary.appendChild(list);

    const stepHead = stepEl.querySelector('.step-head');

    if (stepHead) {
      stepHead.insertAdjacentElement('afterend', summary);
    } else {
      stepEl.prepend(summary);
    }

    /*
    * Links do resumo:
    * coloca o foco no campo e movimenta somente a .wiz-content.
    */
    summary.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();

        const targetId = link.getAttribute('href')?.slice(1);
        const target = targetId
          ? document.getElementById(targetId)
          : null;

        if (!target) return;

        const scroller = getWizardScroller();

        target.focus({
          preventScroll: true
        });

        if (!scroller) return;

        const scrollerRect = scroller.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const targetTop =
          scroller.scrollTop +
          targetRect.top -
          scrollerRect.top -
          24;

        scroller.scrollTo({
          top: Math.max(0, targetTop),
          left: 0,
          behavior: 'smooth'
        });
      });
    });

    /*
    * Aguarda a inserção e o cálculo da altura dos erros.
    * Depois movimenta somente o scroll interno e coloca
    * o foco no resumo sem permitir scroll automático externo.
    */
    requestAnimationFrame(() => {
      const scroller = getWizardScroller();

      if (scroller) {
        scroller.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      }

      summary.focus({
        preventScroll: true
      });

      /*
      * Garante novamente o topo após o foco,
      * pois alguns navegadores recalculam o scroll.
      */
      requestAnimationFrame(() => {
        if (scroller) {
          scroller.scrollTop = 0;
          scroller.scrollLeft = 0;
        }
      });
    });
  }

  function validateCurrentStep() {
    const erros = [];

    if (currentStep === 2) {
      ['nome', 'desejaNomeSocial', 'cpf', 'data_nasc', 'sexo_civil', 'sexo_biologico', 'identidade_genero', 'orientacao_sexual']
        .forEach(id => {
          if (!req(id)) erros.push(error(id, 'Este campo é obrigatório.'));
        });

      const dataNasc = req('data_nasc');

      if (dataNasc && !validateDateBirth(dataNasc)) {
        erros.push(error(
          'data_nasc',
          'Informe uma data de nascimento válida.'
        ));
      }

      const cpf = req('cpf');
      if (cpf && !validateCPF(cpf)) {
        erros.push(error('cpf', 'CPF inválido. Verifique os números e tente novamente.'));
      }

      if (req('desejaNomeSocial') === 'Sim' && !req('nomeSocial')) {
        erros.push(error('nomeSocial', 'Este campo é obrigatório.'));
      }

      const novoModelo = !document.getElementById('rg_novo_modelo')?.checked;

      if (novoModelo) {
        _sincronizarRgComCpf();

        if (!req('rg_novo_orgao_expedidor'))
          erros.push(error('rg_novo_orgao_expedidor', 'Este campo é obrigatório.'));

        if (!req('rg_novo_data_emissao'))
          erros.push(error('rg_novo_data_emissao', 'Este campo é obrigatório.'));
      } else {
        if (!req('rg'))
          erros.push(error('rg', 'Este campo é obrigatório.'));

        if (!req('rg_orgao_expedidor'))
          erros.push(error('rg_orgao_expedidor', 'Este campo é obrigatório.'));

        if (!req('rg_data_expedicao'))
          erros.push(error('rg_data_expedicao', 'Este campo é obrigatório.'));
      }

      deficienciasMarcadas = [...document.querySelectorAll('input[name="deficiencia"]:checked')].map(x => x.value);
      if (!deficienciasMarcadas.length) {
        erros.push(errorGrupo('#def', 'Deficiência', 'Marque pelo menos uma opção de deficiência ou “Não Possuo”.'));
      }
    }

    if (currentStep === 3) {
      // Campos sempre obrigatórios
      ['telefone', 'email', 'tipoLocalidade'].forEach(id => {
        if (!req(id)) erros.push(error(id, 'Este campo é obrigatório.'));
      });

      // Campos de endereço: só obrigatórios se foram buscados via CEP
      const enderecoFields = document.getElementById('enderecoFields');
      const enderecoVisivel = enderecoFields && !enderecoFields.hidden;
      if (enderecoVisivel) {
        ['cep', 'endereco_completo', 'estado', 'cidade'].forEach(id => {
          if (!req(id)) erros.push(error(id, 'Este campo é obrigatório.'));
        });
      } else {
        // Se endereço não foi buscado, valida se ao menos clicou no botão
        const btnCep = document.getElementById('btnBuscarCep');
        if (btnCep && !btnCep.closest('.form-grid__full')?.hidden) {
          erros.push(error('btnBuscarCep', 'Clique em "Buscar CEP" e informe o CEP para preencher os dados de endereço.', 'Endereço'));
        }
      }

      const email = req('email');
      const confirmEmail = req('confirmar_email');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        erros.push(error('email', 'Informe um e-mail válido, no formato nome@exemplo.com.'));
      }

      if (confirmEmail && email !== confirmEmail) {
        erros.push(error('confirmar_email', 'Os e-mails não coincidem.'));
      }

      const cep = req('cep');
      if (cep && !validateZipCode(cep)) {
        erros.push(error(
          'cep',
          'Informe um CEP válido com 8 números.'
        ));
      }

      const telefone = req('telefone');
      if (telefone && !validatePhone(telefone)) {
          erros.push(error(
              'telefone',
              'Informe um telefone válido com DDD.'
          ));
      }

      const loc = req('tipoLocalidade');
      if (['Aldeia', 'Comunidade', 'Quilombo'].includes(loc)) {
        if (!req('selectEtnia')) erros.push(error('selectEtnia', 'Selecione a etnia ou comunidade.'));
        if (req('selectEtnia') === 'Não encontrei minha etnia/comunidade' && !req('outraEtniaInput')) {
          erros.push(error('outraEtniaInput', 'Digite o nome da etnia ou comunidade.'));
        }
      }
    }

    if (currentStep === 4) {
      const temSegunda = ['Vestibular', 'PSVR'].includes(psEscolhido);
      const semPresencial = ['SISU'];

      if (!semPresencial.includes(psEscolhido) && !req('cidade_prova')) {
        erros.push(error('cidade_prova', 'Informe a cidade de prova.'));
      }
      if (!req('curso_opcao_1')) {
        erros.push(error('curso_opcao_1', 'Selecione a 1ª opção de curso.'));
      }
      if (temSegunda && !req('curso_opcao_2')) {
        erros.push(error('curso_opcao_2', 'Selecione a 2ª opção de curso.'));
      }
      if (temSegunda && req('curso_opcao_1') && req('curso_opcao_2') && req('curso_opcao_1') === req('curso_opcao_2')) {
        erros.push(error('curso_opcao_2', 'A 2ª opção deve ser diferente da 1ª.'));
      }
      if (!req('lista_espera')) {
        erros.push(error('lista_espera', 'Selecione a opção de lista de espera.'));
      }
    }

    if (currentStep === 5) {
      if (!document.querySelector('input[name="atendimento"]:checked')) {
        erros.push(errorGrupo('#atendiemntoError', 'Atendimento especializado', 'Informe se necessita de atendimento especializado.'));
      }
    }

    if (currentStep === 6 && !isTransferencia()) {
      if (!document.querySelector('input[name="escola_publica"]:checked')) {
        erros.push(errorGrupo('input[name="escola_publica"]', 'Escola pública', 'Responda se estudou todo o Ensino Médio em escola pública.'));
      }
      if (document.querySelector('input[name="escola_publica"]:checked')?.value === 'Sim' && !document.querySelector('input[name="cota_ep"]:checked')) {
        erros.push(errorGrupo('input[name="cota_ep"]', 'Reserva de Escola Pública', 'Responda se deseja concorrer às vagas reservadas de Escola Pública.'));
      }
      if (document.querySelector('input[name="escola_publica"]:checked')?.value === 'Sim' && !document.querySelector('input[name="cota_quilombola"]:checked')) {
        erros.push(errorGrupo('input[name="cota_quilombola"]', 'Comunidades quilombolas', 'Responda se deseja concorrer às vagas para comunidades quilombolas.'));
      }
      if (!document.querySelector('input[name="renda_minima"]:checked')) {
        erros.push(errorGrupo('input[name="renda_minima"]', 'Renda familiar', 'Responda se sua renda bruta familiar mensal por pessoa é menor ou igual a 1 salário mínimo.'));
      }
      if (document.querySelector('input[name="renda_minima"]:checked')?.value === 'Sim' && !document.querySelector('input[name="cota_renda"]:checked')) {
        erros.push(errorGrupo('input[name="cota_renda"]', 'Reserva de baixa renda', 'Responda se deseja concorrer às vagas reservadas de baixa renda.'));
      }
      if (!document.getElementById('div-pcd')?.hidden && !document.querySelector('input[name="cota_pcd"]:checked')) {
        erros.push(errorGrupo('input[name="cota_pcd"]', 'Vagas destinadas a PcD', 'Responda se deseja concorrer às vagas destinadas a PcD.'));
      }
      if (!document.getElementById('div-ppi')?.hidden && !document.querySelector('input[name="cota_preta_parda"]:checked')) {
        erros.push(errorGrupo('input[name="cota_preta_parda"]', 'Vagas para pessoas pretas ou pardas', 'Responda se deseja concorrer às vagas para pessoas autodeclaradas pretas ou pardas.'));
      }
      if (!document.getElementById('div-indigena')?.hidden && !document.querySelector('input[name="cota_indigena"]:checked')) {
        erros.push(errorGrupo('input[name="cota_indigena"]', 'Vagas para pessoas indígenas', 'Responda se deseja concorrer às vagas para pessoas autodeclaradas indígenas.'));
      }
    }

    if (currentStep === 8) {
      if (!document.getElementById('aceite_termos')?.checked) {
        erros.push(error('aceite_termos', 'Aceite os termos para finalizar.'));
      }
    }

    if (erros.length) {
      applyWizardErrors(erros);
      return false;
    }

    const stepEl = document.getElementById('step-' + currentStep);
    clearErrorsWizard(stepEl);
    return true;
  }

  /* ---- navigation ---- */

  function nextStep() {
    if (!validateCurrentStep()) return;
    if (currentStep === getLastStep()) {

      baixarComprovanteInscricao();
      alert('Inscrição enviada com sucesso!');
      return;
    }
    currentStep = getNextStep();
    renderView();
    scrollWizardToTop();
  }

  function prevStep() {
    currentStep = getPrevStep();
    renderView();
    scrollWizardToTop();
  }

  /* ---- init ---- */

  const SVG_CHECK = `<svg class="num-icon num-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
  const SVG_HOURGLASS = `<svg class="num-icon num-hourglass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

  /* ---- keyboard detection ---- */

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#nav-steps .steps__num, #steps-overlay .steps__num').forEach(badge => {
      const num = badge.textContent.trim();
      const textSpan = document.createElement('span');
      textSpan.className = 'num-text';
      textSpan.textContent = num;
      badge.innerHTML = SVG_CHECK + SVG_HOURGLASS;
      badge.prepend(textSpan);
    });

    initStatic();
    _toggleModeloRG();
    configureDateBirth();
    ConfigureDataFields();

    const divNomeSocial = document.getElementById('divNomeSocial');
    if (divNomeSocial) divNomeSocial.hidden = true;
    const divEtnia = document.getElementById('divEtnia');
    if (divEtnia) divEtnia.hidden = true;
    const inputOutraEtnia = document.getElementById('inputOutraEtnia');
    if (inputOutraEtnia) inputOutraEtnia.hidden = true;
    const divPerguntaEP = document.getElementById('divPerguntaEP');
    if (divPerguntaEP) divPerguntaEP.hidden = true;
    const divQui = document.getElementById('div-quilombola');
    if (divQui) divQui.hidden = true;
    const divRenda = document.getElementById('divPerguntaRenda');
    if (divRenda) divRenda.hidden = true;
    _toggleSegundaOpcao();

    document.getElementById('btn-next')?.addEventListener('click', nextStep);
    document.getElementById('btn-prev')?.addEventListener('click', prevStep);

  });

  function cpfMask(input) {
    let valor = input.value.replace(/\D/g, '');

    valor = valor.substring(0, 11);

    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = valor;
  }

  window.cpfMask = cpfMask;

  function validateCPF(cpf) {

    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11)
        return false;

    // Elimina sequências iguais
    if (/^(\d)\1+$/.test(cpf))
        return false;

    let soma = 0;

    for (let i = 0; i < 9; i++)
        soma += parseInt(cpf.charAt(i)) * (10 - i);

    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    if (resto !== parseInt(cpf.charAt(9)))
        return false;

    soma = 0;

    for (let i = 0; i < 10; i++)
        soma += parseInt(cpf.charAt(i)) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    return resto === parseInt(cpf.charAt(10));
  }

  window.validateCPF = validateCPF;

  function phoneMask(input) {

    let v = input.value.replace(/\D/g, '');

    v = v.substring(0, 11);

    if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }

    input.value = v;
  }

  function validatePhone(valor) {

    const numero = valor.replace(/\D/g, '');

    if (!(numero.length === 10 || numero.length === 11))
        return false;

    const ddd = parseInt(numero.substring(0, 2), 10);

    return ddd >= 11 && ddd <= 99;
  }

  window.phoneMask = phoneMask;
  window.validatePhone = validatePhone;

  function zipCodeMask(input) {

    let v = input.value.replace(/\D/g, '').slice(0, 8);

    v = v.replace(/^(\d{5})(\d)/, '$1-$2');

    input.value = v;
  }

  function validateZipCode(valor) {

    const cep = valor.replace(/\D/g, '');

    return cep.length === 8;
  }

  window.zipCodeMask = zipCodeMask;
  window.validateZipCode = validateZipCode;

  function configureDateBirth() {
    const input = document.getElementById('data_nasc');
    if (!input) return;

    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');

    input.max = `${yyyy}-${mm}-${dd}`;
    input.min = '1900-01-01';
  }

  function validateDateBirth(valor) {
    if (!valor) return false;

    const data = new Date(valor + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const minimo = new Date('1900-01-01T00:00:00');

    if (isNaN(data.getTime())) return false;
    if (data > hoje) return false;
    if (data < minimo) return false;

    return true;
  }

  function ConfigureDataFields() {
    const hoje = new Date().toISOString().split('T')[0];

    [
      'data_nasc',
      'rg_data_expedicao',
      'rg_novo_data_emissao'
    ].forEach(id => {
      const campo = document.getElementById(id);
      if (!campo) return;

      campo.min = '1900-01-01';
      campo.max = hoje;
    });
  }


})();

// ============================================================================
// USER MENU
// ============================================================================
(function () {
  const btn = document.getElementById('user-menu-btn');
  const menu = document.getElementById('user-menu');
  if (!btn || !menu) return;

  function open() {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    menu.querySelector('[role="menuitem"]')?.focus();
  }

  function close() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden ? open() : close();
  });

  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      close();
      btn.focus();
    }
  });
})();

// ============================================================================
// VIEW TOGGLE — list / cards
// ============================================================================
(function () {
  const body = document.body;
  const btnList = document.getElementById('view-list');
  const btnCards = document.getElementById('view-cards');
  const viewMedia = window.matchMedia('(min-width:600px)');

  if (!btnList || !btnCards) return;

  function syncControls() {
    const storedView =
      body.getAttribute('data-view') === 'cards'
        ? 'cards'
        : 'list';

    const effectiveView = viewMedia.matches ? storedView : 'list';

    btnList.setAttribute(
      'aria-pressed',
      effectiveView === 'list'
    );

    btnCards.setAttribute(
      'aria-pressed',
      effectiveView === 'cards'
    );
  }

  function setView(view) {
    body.setAttribute('data-view', view);
    syncControls();

    try {
      localStorage.setItem('uniplus.editais.view', view);
    } catch (_) {}
  }

  let initial = 'list';

  try {
    const saved = localStorage.getItem('uniplus.editais.view');
    if (saved === 'list' || saved === 'cards') initial = saved;
  } catch (_) {}

  setView(initial);

  btnList.addEventListener('click', () => setView('list'));
  btnCards.addEventListener('click', () => setView('cards'));

  if (viewMedia.addEventListener) {
    viewMedia.addEventListener('change', syncControls);
  } else {
    viewMedia.addListener(syncControls);
  }
})();

// ============================================================================
// SUBNAV FADE
// ============================================================================
(function () {
  const nav = document.querySelector('.subnav');
  if (!nav) return;

  function update() {
    const overflow = nav.scrollWidth - nav.clientWidth;

    if (overflow <= 1) {
      nav.removeAttribute('data-fade');
      return;
    }

    const atStart = nav.scrollLeft <= 1;
    const atEnd = nav.scrollLeft >= overflow - 1;

    nav.setAttribute(
      'data-fade',
      atStart ? 'right' : atEnd ? 'left' : 'both'
    );
  }

  nav.addEventListener('scroll', update, {
    passive: true
  });

  window.addEventListener('resize', update);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    [...nav.children].forEach((c) => ro.observe(c));
  }

  update();
})();

// ============================================================================
// DRAWERS
// ============================================================================
(function () {

  function closeDrawer(dlg) {
    if (!dlg) return;

    dlg.close();

    const trigger = document.querySelector(
      `[data-drawer-trigger="${dlg.id}"]`
    );

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  document.addEventListener('click', (e) => {

    const open = e.target.closest('[data-drawer-trigger]');

    if (open) {
      const dlg = document.getElementById(
        open.dataset.drawerTrigger
      );

      if (dlg) {
        dlg.showModal();
        open.setAttribute('aria-expanded', 'true');
      }
    }

    const close = e.target.closest('[data-drawer-close]');

    if (close) {
      closeDrawer(close.closest('dialog'));
    }
  });

  document.querySelectorAll('.uni-drawer').forEach((dlg) => {

    dlg.addEventListener('close', () => {
      const trigger = document.querySelector(
        `[data-drawer-trigger="${dlg.id}"]`
      );

      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) {
        closeDrawer(dlg);
      }
    });

    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setTimeout(() => {
          const trigger = document.querySelector(
            `[data-drawer-trigger="${dlg.id}"]`
          );

          if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
          }
        }, 0);
      }
    });

  });

})();

// ============================================================================
// COTAS — fluxo novo integrado ao wizard original
// ----------------------------------------------------------------------------
// Este bloco foi isolado no final para não alterar a navegação original.
// Ele valida visualmente o novo bloco de cotas e sincroniza os radios antigos
// usados pela validação existente do wizard.
// ============================================================================
(function () {
  'use strict';

  const cotaHelpTexts = {
    pcdAuto: {
      titulo: 'Pessoa com deficiência',
      texto: 'Marque “Sim” se o candidato se autodeclara pessoa com deficiência, considerando impedimento de longo prazo de natureza física, mental, intelectual ou sensorial, conforme a legislação aplicável.'
    },
    pcdCota: {
      titulo: 'Concorrer às vagas PcD',
      texto: 'Marque “Sim” se, além de se autodeclarar pessoa com deficiência, o candidato deseja utilizar essa condição para concorrer às vagas reservadas para PcD.'
    },
    eepAuto: {
      titulo: 'Ensino médio em escola pública',
      texto: 'Marque “Sim” se o candidato cursou integralmente o ensino médio em escola pública no Brasil ou em escola comunitária do campo conveniada com o poder público, conforme as regras do edital.'
    },
    eepCota: {
      titulo: 'Concorrer às vagas de escola pública',
      texto: 'Marque “Sim” se o candidato deseja concorrer às vagas reservadas para quem cursou integralmente o ensino médio em escola pública ou escola comunitária do campo conveniada.'
    },
    raca: {
      titulo: 'Autodeclaração de cor/raça',
      texto: 'Selecione a opção com a qual o candidato se autodeclara. Para as modalidades PPI, são considerados candidatos autodeclarados pretos, pardos ou indígenas.'
    },
    ppiCota: {
      titulo: 'Concorrer às vagas PPI',
      texto: 'Marque “Sim” se o candidato se autodeclara preto, pardo ou indígena e deseja concorrer às vagas reservadas para PPI. Caso o candidato também seja quilombola e se autodeclare preto ou pardo, as modalidades podem acumular.'
    },
    qAuto: {
      titulo: 'Pessoa quilombola',
      texto: 'Marque “Sim” se o candidato se autodeclara quilombola, conforme as regras e documentos exigidos no edital do processo seletivo.'
    },
    qCota: {
      titulo: 'Concorrer às vagas quilombolas',
      texto: 'Marque “Sim” se o candidato, além de se autodeclarar quilombola, deseja concorrer às vagas reservadas para pessoas quilombolas.'
    },
    rendaAuto: {
      titulo: 'Renda familiar per capita',
      texto: 'Marque “Sim” se a renda familiar bruta mensal por pessoa for inferior a 1 salário mínimo, conforme cálculo e documentação exigidos no edital.'
    },
    rendaCota: {
      titulo: 'Concorrer às vagas de baixa renda',
      texto: 'Marque “Sim” se o candidato deseja concorrer às vagas reservadas para pessoas com renda familiar per capita inferior a 1 salário mínimo. Pela regra aplicada, candidatos LB também concorrem às modalidades LI correspondentes.'
    }
  };

  const cotaState = {
    pcdAuto: null,
    pcdCota: null,
    eepAuto: null,
    eepCota: null,
    raca: null,
    ppiCota: null,
    qAuto: null,
    qCota: null,
    rendaAuto: null,
    rendaCota: null
  };

  const cotaDesc = {
    AC: 'Ampla Concorrência.',
    AC_PcD: 'Ampla Concorrência - Pessoas com Deficiência.',
    LI_EP: 'Escola Pública, independente de renda.',
    LI_PcD: 'Escola Pública e Pessoa com Deficiência, independente de renda.',
    LI_PPI: 'Escola Pública e PPI, independente de renda.',
    LI_Q: 'Escola Pública e Quilombola, independente de renda.',
    LB_EP: 'Escola Pública, com renda familiar per capita inferior a 1 salário mínimo.',
    LB_PcD: 'Escola Pública e Pessoa com Deficiência, com renda familiar per capita inferior a 1 salário mínimo.',
    LB_PPI: 'Escola Pública e PPI, com renda familiar per capita inferior a 1 salário mínimo.',
    LB_Q: 'Escola Pública e Quilombola, com renda familiar per capita inferior a 1 salário mínimo.'
  };

  const cotaRoot = () => document.getElementById('div-cotas');
  const cota$$ = selector => cotaRoot() ? cotaRoot().querySelectorAll(selector) : [];

  function cotaModuleExists() {
    const root = cotaRoot();
    return Boolean(root && root.querySelector('.cotas-step'));
  }

  function cotaIsYes(value) {
    return value === 'sim';
  }

  function cotaIsPPI(raca) {
    return ['indigena', 'preta', 'parda'].includes(raca);
  }

  function cotaShow(id, visible = true) {
    const el = document.getElementById(`cota-${id}`);
    if (!el) return;

    el.classList.toggle('is-show', visible);

    if (!visible) {
      cotaClearFieldError(el);
    }
  }

  function cotaClearFields(names) {
    names.forEach(name => {
      cotaState[name] = null;

      cota$$(`[name="${name}"]`).forEach(input => {
        input.checked = false;
      });

      if (name === 'raca') {
        const select = document.getElementById('cota-raca');
        if (select) select.value = '';
      }

      const field = document.getElementById(`cota-field-${name}`);
      if (field) cotaClearFieldError(field);
    });
  }

  function cotaCreateRadioOptions() {
    cota$$('.cotas-options[data-name]').forEach(box => {

      const name = box.dataset.name;

      if (!name || box.dataset.cotaRadiosCreated === 'true') {
        return;
      }

      box.dataset.cotaRadiosCreated = 'true';

      // Remove qualquer conteúdo existente
      box.replaceChildren();

      [
        { value: 'sim', texto: 'Sim' },
        { value: 'nao', texto: 'Não' }
      ].forEach(item => {

        const label = document.createElement('label');
        label.className = 'cotas-opt';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = item.value;

        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + item.texto));

        box.appendChild(label);

      });

    });
  }

  function cotaBindEvents() {
    cota$$('input[type="radio"]').forEach(input => {
      if (input.dataset.cotaBinded === 'true') return;

      input.dataset.cotaBinded = 'true';
      input.addEventListener('change', event => {
        cotaState[event.target.name] = event.target.value;
        cotaClearFieldError(event.target.closest('.cotas-step'));
        cotaClearValidationSummary();
        cotaFlow();
      });
    });

    const racaSelect = document.getElementById('cota-raca');

    if (racaSelect && racaSelect.dataset.cotaBinded !== 'true') {
      racaSelect.dataset.cotaBinded = 'true';

      racaSelect.addEventListener('change', event => {
        cotaState.raca = event.target.value || null;
        cotaClearFieldError(event.target.closest('.cotas-step'));
        cotaClearValidationSummary();
        cotaFlow();
      });
    }
  }

  function cotaSetCompatRadio(name, value) {
    let radio = document.querySelector(`#cotas-compatibilidade-wizard input[name="${name}"][value="${value}"]`);

    // Fallback: permite funcionar mesmo se os radios antigos não estiverem
    // dentro de #cotas-compatibilidade-wizard, desde que ainda existam no HTML.
    if (!radio) {
      radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    }

    if (!radio) return;

    if (!radio.checked) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function cotaSyncCompatibility() {
    if (!cotaModuleExists()) return;

    const pcd = cotaIsYes(cotaState.pcdAuto) && cotaIsYes(cotaState.pcdCota);
    const escolaDeclarada = cotaIsYes(cotaState.eepAuto);
    const escolaCota = escolaDeclarada && cotaIsYes(cotaState.eepCota);
    const ppi = cotaIsPPI(cotaState.raca) && cotaIsYes(cotaState.ppiCota);
    const quilombola = cotaState.raca !== 'indigena' && cotaIsYes(cotaState.qAuto) && cotaIsYes(cotaState.qCota);
    const baixaRendaDeclarada = cotaIsYes(cotaState.rendaAuto);
    const baixaRendaCota = baixaRendaDeclarada && cotaIsYes(cotaState.rendaCota);

    cotaSetCompatRadio('cota_pcd', pcd ? 'Sim' : 'Não');
    cotaSetCompatRadio('escola_publica', escolaDeclarada ? 'Sim' : 'Não');
    cotaSetCompatRadio('cota_ep', escolaCota ? 'Sim' : 'Não');
    cotaSetCompatRadio('cota_quilombola', quilombola ? 'Sim' : 'Não');
    cotaSetCompatRadio('cota_preta_parda', (ppi && ['preta', 'parda'].includes(cotaState.raca)) ? 'Sim' : 'Não');
    cotaSetCompatRadio('cota_indigena', (ppi && cotaState.raca === 'indigena') ? 'Sim' : 'Não');
    cotaSetCompatRadio('renda_minima', baixaRendaDeclarada ? 'Sim' : 'Não');
    cotaSetCompatRadio('cota_renda', baixaRendaCota ? 'Sim' : 'Não');
  }

  function cotaFlow() {
    if (!cotaModuleExists()) return;

    const pcdDeclarado = cotaIsYes(cotaState.pcdAuto);
    cotaShow('pcd2', pcdDeclarado);

    if (!pcdDeclarado) {
      cotaClearFields(['pcdCota']);
    }

    const pcdOk = cotaState.pcdAuto === 'nao' || (pcdDeclarado && cotaState.pcdCota);
    cotaShow('eep1', Boolean(pcdOk));

    const escolaPublicaDeclarada = cotaIsYes(cotaState.eepAuto);
    cotaShow('eep2', escolaPublicaDeclarada);

    if (!escolaPublicaDeclarada) {
      cotaClearFields(['eepCota', 'raca', 'ppiCota', 'qAuto', 'qCota', 'rendaAuto', 'rendaCota']);
    }

    const escolaPublicaCota = escolaPublicaDeclarada && cotaIsYes(cotaState.eepCota);
    const eepOk = cotaState.eepAuto === 'nao' || escolaPublicaCota;

    cotaShow('raca1', escolaPublicaCota && eepOk);

    if (!escolaPublicaCota) {
      cotaClearFields(['raca', 'ppiCota', 'qAuto', 'qCota', 'rendaAuto', 'rendaCota']);
    }

    const candidatoPPI = cotaIsPPI(cotaState.raca);
    cotaShow('ppi2', escolaPublicaCota && candidatoPPI);

    if (!candidatoPPI) {
      cotaClearFields(['ppiCota']);
    }

    const racaOk = cotaState.raca && (!candidatoPPI || cotaState.ppiCota);
    const podeVerQuilombola = escolaPublicaCota && racaOk && cotaState.raca !== 'indigena';

    cotaShow('q1', Boolean(podeVerQuilombola));

    if (!podeVerQuilombola) {
      cotaClearFields(['qAuto', 'qCota']);
    }

    const quilombolaDeclarado = cotaIsYes(cotaState.qAuto) && podeVerQuilombola;
    cotaShow('q2', quilombolaDeclarado);

    if (!quilombolaDeclarado) {
      cotaClearFields(['qCota']);
    }

    const qOk = !podeVerQuilombola || cotaState.qAuto === 'nao' || (quilombolaDeclarado && cotaState.qCota);
    cotaShow('renda1', Boolean(escolaPublicaCota && racaOk && qOk));

    const baixaRendaDeclarada = cotaIsYes(cotaState.rendaAuto);
    cotaShow('renda2', baixaRendaDeclarada);

    if (!baixaRendaDeclarada) {
      cotaClearFields(['rendaCota']);
    }

    cotaSyncCompatibility();
    cotaCalculate();
  }

  function cotaCalculate() {
    const modalidades = ['AC'];

    const addModalidade = modalidade => {
      if (!modalidades.includes(modalidade)) {
        modalidades.push(modalidade);
      }
    };

    const pcd = cotaIsYes(cotaState.pcdAuto) && cotaIsYes(cotaState.pcdCota);
    const escola = cotaIsYes(cotaState.eepAuto) && cotaIsYes(cotaState.eepCota);
    const baixaRenda = cotaIsYes(cotaState.rendaAuto) && cotaIsYes(cotaState.rendaCota);

    const prefixos = baixaRenda ? ['LB', 'LI'] : ['LI'];
    const candidatoPPI = cotaIsPPI(cotaState.raca) && cotaIsYes(cotaState.ppiCota);
    const quilombola = cotaState.raca !== 'indigena' && cotaIsYes(cotaState.qAuto) && cotaIsYes(cotaState.qCota);

    if (pcd && !escola) {
      addModalidade('AC_PcD');
    }

    if (escola) {
      prefixos.forEach(prefixo => {
        // EP é acumulado com PPI/PcD/Quilombola, não substituído.
        addModalidade(`${prefixo}_EP`);

        if (pcd) {
          addModalidade(`${prefixo}_PcD`);
        }

        if (candidatoPPI) {
          addModalidade(`${prefixo}_PPI`);
        }

        if (quilombola) {
          addModalidade(`${prefixo}_Q`);
        }
      });
    }

    cotaRender(modalidades);
  }

  function cotaRender(modalidades) {
    const badges = document.getElementById('cota-badges');
    const status = document.getElementById('cota-status');
    const explain = document.getElementById('cota-explain');

    if (!badges || !status || !explain) return;

    badges.replaceChildren();

    modalidades.forEach((modalidade, index) => {
      const span = document.createElement('span');
      span.className = index === 0 ? 'cotas-badge primary' : 'cotas-badge';
      span.textContent = modalidade;
      badges.appendChild(span);
    });

    status.textContent = modalidades.length === 1
      ? 'Até agora, o candidato concorre somente à Ampla Concorrência.'
      : 'Modalidades possíveis conforme as respostas atuais.';

    explain.replaceChildren();

    modalidades.forEach(modalidade => {
      const li = document.createElement('li');

      const strong = document.createElement('strong');
      strong.textContent = `${modalidade}:`;

      li.appendChild(strong);
      li.appendChild(
        document.createTextNode(' ' + (cotaDesc[modalidade] || 'Descrição não cadastrada.'))
      );

      explain.appendChild(li);
    });
  }

  function cotaClearValidationSummary() {
    const summary = document.getElementById('cota-validation-summary');
    if (!summary) return;

    summary.textContent = '';
    summary.classList.remove('is-show');
  }

  function cotaClearFieldError(stepEl) {
    if (!stepEl) return;

    stepEl.classList.remove('is-invalid');
    stepEl.querySelectorAll('.cotas-field-error').forEach(error => error.remove());
    stepEl.querySelectorAll('.is-invalid').forEach(field => field.classList.remove('is-invalid'));
    stepEl.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  }

  function cotaSetFieldError(stepEl, message) {
    if (!stepEl) return;

    cotaClearFieldError(stepEl);
    stepEl.classList.add('is-invalid');

    const inputArea = stepEl.querySelector('.cotas-options, .cotas-select');
    if (inputArea) {
      inputArea.classList.add('is-invalid');
      inputArea.setAttribute('aria-invalid', 'true');
    }

    const error = document.createElement('p');
    error.className = 'cotas-field-error';
    error.textContent = message;

    const questionArea = stepEl.querySelector('.cotas-qrow > div:first-child') || stepEl;
    questionArea.appendChild(error);
  }

  function cotaFieldIsFilled(stepEl) {
    const radioBox = stepEl.querySelector('.cotas-options[data-name]');

    if (radioBox) {
      const name = radioBox.dataset.name;
      return Boolean(cotaState[name] || stepEl.querySelector(`input[name="${name}"]:checked`));
    }

    const select = stepEl.querySelector('select');

    if (select) {
      return Boolean(select.value);
    }

    return true;
  }

  function cotaValidate(showErrors = true) {
    if (!cotaModuleExists()) return true;

    const visibleSteps = [...cota$$('.cotas-step.is-show')];
    const invalidSteps = visibleSteps.filter(stepEl => !cotaFieldIsFilled(stepEl));

    if (showErrors) {
      visibleSteps.forEach(stepEl => cotaClearFieldError(stepEl));

      invalidSteps.forEach(stepEl => {
        const hasSelect = Boolean(stepEl.querySelector('select'));
        const message = hasSelect
          ? 'Campo obrigatório: selecione uma opção para continuar.'
          : 'Campo obrigatório: marque Sim ou Não para continuar.';

        cotaSetFieldError(stepEl, message);
      });

      const summary = document.getElementById('cota-validation-summary');

      if (summary) {
        if (invalidSteps.length) {
          summary.textContent = invalidSteps.length === 1
            ? 'Existe 1 campo obrigatório pendente nas modalidades. Preencha antes de avançar.'
            : `Existem ${invalidSteps.length} campos obrigatórios pendentes nas modalidades. Preencha antes de avançar.`;

          summary.classList.add('is-show');
        } else {
          cotaClearValidationSummary();
        }
      }

      if (invalidSteps.length) {
        invalidSteps[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

        const focusable = invalidSteps[0].querySelector('input, select, button, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
          focusable.focus({ preventScroll: true });
        }
      }
    }

    return invalidSteps.length === 0;
  }

  function cotaStepIsVisible() {
    const step = document.getElementById('step-6');
    return Boolean(step && !step.hidden && getComputedStyle(step).display !== 'none');
  }

  function cotaInstallNextValidation() {
    const nextButton = document.getElementById('btn-next');

    if (!nextButton || nextButton.dataset.cotaValidationInstalled === 'true') return;

    nextButton.dataset.cotaValidationInstalled = 'true';

    nextButton.addEventListener('click', event => {
      if (!cotaModuleExists() || !cotaStepIsVisible()) return;

      const cotasOk = cotaValidate(true);

      if (!cotasOk) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      cotaSyncCompatibility();
      cotaClearValidationSummary();

      // Não altera currentStep, não chama renderView e não pula etapa manualmente.
      // O wizard original continua responsável pela navegação.
    }, true);
  }

  function cotaResetForm() {
    if (!cotaModuleExists()) return;

    Object.keys(cotaState).forEach(key => {
      cotaState[key] = null;
    });

    cota$$('input[type="radio"]').forEach(input => {
      input.checked = false;
    });

    const raca = document.getElementById('cota-raca');
    if (raca) raca.value = '';

    ['pcd2', 'eep1', 'eep2', 'raca1', 'ppi2', 'q1', 'q2', 'renda1', 'renda2'].forEach(id => cotaShow(id, false));

    cota$$('.cotas-step').forEach(stepEl => cotaClearFieldError(stepEl));
    cotaClearValidationSummary();
    cotaSyncCompatibility();
    cotaRender(['AC']);
  }

  let cotaLastFocus = null;

  function cotaOpenHelp(chave) {
    const info = cotaHelpTexts[chave];
    if (!info) return;

    const modal = document.getElementById('cota-helpModal');
    const title = document.getElementById('cota-helpTitle');
    const text = document.getElementById('cota-helpText');

    if (!modal || !title || !text) return;

    cotaLastFocus = document.activeElement;

    title.textContent = info.titulo;
    text.textContent = info.texto;

    modal.classList.add('is-show');
    modal.setAttribute('aria-hidden', 'false');

    const closeButton = modal.querySelector('.cotas-help-modal-close');
    if (closeButton) closeButton.focus();
  }

  function cotaCloseHelp() {
    const modal = document.getElementById('cota-helpModal');
    if (!modal) return;

    if (modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.classList.remove('is-show');
    modal.setAttribute('aria-hidden', 'true');

    if (cotaLastFocus && typeof cotaLastFocus.focus === 'function') {
      cotaLastFocus.focus();
    }

    cotaLastFocus = null;
  }

  function cotaModalOutsideClick(event) {
    if (event.target && event.target.id === 'cota-helpModal') {
      cotaCloseHelp();
    }
  }

  function cotaHelpKey(event, chave) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cotaOpenHelp(chave);
    }
  }

  window.cotaOpenHelp = cotaOpenHelp;
  window.cotaCloseHelp = cotaCloseHelp;
  window.cotaModalOutsideClick = cotaModalOutsideClick;
  window.cotaHelpKey = cotaHelpKey;
  window.cotaResetForm = cotaResetForm;
  window.cotaValidate = cotaValidate;
  window.cotaSyncCompatibility = cotaSyncCompatibility;

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      cotaCloseHelp();
    }
  });

  let cotaInitialized = false;

  function cotaInit() {
    if (cotaInitialized) return;
    if (!cotaModuleExists()) return;

    cotaInitialized = true;

    cotaCreateRadioOptions();
    cotaBindEvents();
    cotaInstallNextValidation();
    cotaSyncCompatibility();
    cotaRender(['AC']);
  }

  window.cotaInit = cotaInit;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cotaInit);
  } else {
    cotaInit();
  }

// ============================================================================
// ATENDIMENTO ESPECIALIZADO — uploads obrigatórios por recurso selecionado
// ============================================================================
  (function () {
    'use strict';

    const NONE_VALUE = 'Não Necessito';
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const docs = {
      'Prova Ampliada de 18 até 24': {
        titulo: 'Prova Ampliada de 18 até 24',
        descricao: 'Anexe o laudo médico que comprove a necessidade de prova ampliada.'
      },
      'Tempo Adicional (até 1 hora)': {
        titulo: 'Tempo Adicional (até 1 hora)',
        descricao: 'Anexe o laudo médico que comprove a necessidade de tempo adicional.'
      },
      'Prova em Braile': {
        titulo: 'Prova em Braile',
        descricao: 'Anexe o laudo médico que comprove a necessidade de prova em Braile.'
      },
      'Intérprete de Língua de Sinais': {
        titulo: 'Intérprete de Língua de Sinais',
        descricao: 'Anexe documento que comprove a necessidade de intérprete de Libras.'
      },
      'Ledor/Transcritor': {
        titulo: 'Ledor/Transcritor',
        descricao: 'Anexe o laudo médico que comprove a necessidade de ledor/transcritor.'
      },
      'Lactante': {
        titulo: 'Lactante',
        descricao: 'Anexe documento comprobatório conforme exigência do edital.'
      }
    };

    function slug(text) {
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
    }

    function selectedAtendimentos() {
      return [...document.querySelectorAll('input[name="atendimento"]:checked')]
        .map(input => input.value)
        .filter(value => value !== NONE_VALUE);
    }

    function getPanel() {
      return document.getElementById('atendimentoUploadsPanel');
    }

    function getList() {
      return document.getElementById('atendimentoUploadsList');
    }

    function fileIsValid(file) {
      if (!file) return false;

      const allowed = [
        'application/pdf',
        'image/jpeg',
        'image/png'
      ];

      return allowed.includes(file.type) && file.size <= MAX_FILE_SIZE;
    }

    function formatFileSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
    }

    function createUploadCard(value) {
      const item = docs[value] || {
        titulo: value,
        descricao: 'Anexe a documentação comprobatória correspondente.'
      };

      const id = `atendimento-upload-${slug(value)}`;

      const card = document.createElement('article');
      card.className = 'atendimento-upload-card';
      card.dataset.atendimento = value;
      card.innerHTML = `
        <div class="atendimento-upload-info">
          <span class="atendimento-upload-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <path d="M14 2v6h6"></path>
            </svg>
          </span>
          <div>
            <p class="atendimento-upload-name">${escapeHtml(item.titulo)}</p>
            <span class="atendimento-upload-badge">Obrigatório</span>
            <p class="atendimento-upload-desc">${escapeHtml(item.descricao)}</p>
          </div>
        </div>

        <div>
          <label class="atendimento-file-zone" for="${id}">
            <input id="${id}" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" data-atendimento-file="${escapeHtml(value)}">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <path d="M17 8l-5-5-5 5"></path>
              <path d="M12 3v12"></path>
            </svg>
            <span class="atendimento-file-main">Arraste ou selecione um arquivo</span>
            <span class="atendimento-file-hint">PDF, JPG ou PNG • até 2 MB</span>
          </label>
          <div class="atendimento-file-selected" data-file-name></div>
          <p class="atendimento-upload-error" data-upload-error></p>
        </div>
      `;

      return card;
    }

    function syncAtendimentoUploads() {
      const panel = getPanel();
      const list = getList();

      if (!panel || !list) return;

      const selected = selectedAtendimentos();

      [...list.querySelectorAll('.atendimento-upload-card')].forEach(card => {
        if (!selected.includes(card.dataset.atendimento)) {
          card.remove();
        }
      });

      selected.forEach(value => {
        const exists = list.querySelector(`.atendimento-upload-card[data-atendimento="${CSS.escape(value)}"]`);
        if (!exists) {
          list.appendChild(createUploadCard(value));
        }
      });

      panel.hidden = selected.length === 0;
    }

    function clearUploadError(card) {
      card.classList.remove('is-error');

      const error = card.querySelector('[data-upload-error]');
      if (error) {
        error.textContent = '';
        error.classList.remove('is-show');
      }
    }

    function setUploadError(card, message) {
      card.classList.add('is-error');

      const error = card.querySelector('[data-upload-error]');
      if (error) {
        error.textContent = message;
        error.classList.add('is-show');
      }
    }

    function validateAtendimentoUploads(showErrors = true) {
      const selected = selectedAtendimentos();

      if (!selected.length) return true;

      syncAtendimentoUploads();

      const cards = [...document.querySelectorAll('#atendimentoUploadsList .atendimento-upload-card')];
      let valid = true;
      let firstInvalid = null;

      cards.forEach(card => {
        const input = card.querySelector('input[type="file"]');
        const file = input?.files?.[0];

        clearUploadError(card);

        if (!file) {
          valid = false;
          firstInvalid = firstInvalid || card;

          if (showErrors) {
            setUploadError(card, 'Anexe o documento obrigatório para este atendimento.');
          }

          return;
        }

        if (!fileIsValid(file)) {
          valid = false;
          firstInvalid = firstInvalid || card;

          if (showErrors) {
            setUploadError(card, 'Arquivo inválido. Envie PDF, JPG ou PNG com até 5 MB.');
          }
        }
      });

      if (!valid && showErrors && firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.querySelector('input[type="file"]')?.focus({ preventScroll: true });
      }

      return valid;
    }

    function initAtendimentoUploads() {
      const atendimentoBox = document.getElementById('atendimentoBox');
      if (!atendimentoBox || atendimentoBox.dataset.uploadsInstalled === 'true') return;

      atendimentoBox.dataset.uploadsInstalled = 'true';

      atendimentoBox.addEventListener('change', event => {
        if (event.target.matches('input[name="atendimento"]')) {
          setTimeout(syncAtendimentoUploads, 0);
        }
      });

      document.addEventListener('change', event => {
        const input = event.target;

        if (!input.matches('input[data-atendimento-file]')) return;

        const card = input.closest('.atendimento-upload-card');
        const selectedBox = card?.querySelector('[data-file-name]');
        const file = input.files?.[0];

        clearUploadError(card);

        if (selectedBox) {
          if (file) {
            selectedBox.textContent = `${file.name} • ${formatFileSize(file.size)}`;
            selectedBox.classList.add('is-show');
          } else {
            selectedBox.textContent = '';
            selectedBox.classList.remove('is-show');
          }
        }
      });

      const nextButton = document.getElementById('btn-next');

      if (nextButton && nextButton.dataset.atendimentoUploadValidation !== 'true') {
        nextButton.dataset.atendimentoUploadValidation = 'true';

        nextButton.addEventListener('click', event => {
          const step5 = document.getElementById('step-5');
          const step5Visible = step5 && !step5.hidden && getComputedStyle(step5).display !== 'none';

          if (!step5Visible) return;

          if (!validateAtendimentoUploads(true)) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }, true);
      }

      syncAtendimentoUploads();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAtendimentoUploads);
    } else {
      initAtendimentoUploads();
    }

    window.validateAtendimentoUploads = validateAtendimentoUploads;
    window.syncAtendimentoUploads = syncAtendimentoUploads;
  })();

  // ============================================================================
  // Revisão de inscrição — resumo final
  // ============================================================================
  (function () {
    'use strict';

    function val(id) {
      const el = document.getElementById(id);
      if (!el) return '';

      if (el.tagName === 'SELECT') {
        return el.options[el.selectedIndex]?.textContent?.trim() || '';
      }

      return el.value?.trim() || '';
    }

    function dateFormat(value) {
      if (!value) return '';

      const partes = value.split('-');

      if (partes.length !== 3) {
        return value;
      }

      const [ano, mes, dia] = partes;

      return `${dia}/${mes}/${ano}`;
    }

    function checked(name) {
      return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
        .map(i => i.value);
    }

    function clear(el) {
      if (el) el.replaceChildren();
    }

    function item(label, value) {
      const div = document.createElement('div');
      div.className = 'review-item';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'review-label';
      labelSpan.textContent = label;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'review-value';
      valueSpan.textContent = value || 'Não informado';

      div.appendChild(labelSpan);
      div.appendChild(valueSpan);

      return div;
    }

    function empty(text) {
      const p = document.createElement('p');
      p.className = 'review-empty';
      p.textContent = text;
      return p;
    }

    function tags(values) {
      if (!values.length) {
        return empty('Nenhum item selecionado.');
      }

      const div = document.createElement('div');
      div.className = 'review-tags';

      values.forEach(v => {
        const span = document.createElement('span');
        span.className = 'review-tag';
        span.textContent = v;
        div.appendChild(span);
      });

      return div;
    }

    function filesResumo() {
      const fragment = document.createDocumentFragment();
      let total = 0;

      document.querySelectorAll('input[type="file"]').forEach(input => {
        const file = input.files?.[0];
        if (!file) return;

        total += 1;

        const label =
          input.dataset.atendimentoFile ||
          input.closest('.upload-section')?.querySelector('.label')?.textContent?.trim() ||
          'Documento';

        const div = document.createElement('div');
        div.className = 'review-file';

        const info = document.createElement('span');
        info.textContent = `${label}: ${file.name}`;

        const status = document.createElement('span');
        status.textContent = 'Anexado';

        div.appendChild(info);
        div.appendChild(status);

        fragment.appendChild(div);
      });

      if (!total) {
        fragment.appendChild(empty('Nenhum documento anexado.'));
      }

      return fragment;
    }

    function appendAll(el, nodes) {
      if (!el) return;

      clear(el);

      nodes.forEach(node => {
        el.appendChild(node);
      });
    }

    function renderReviewSummary() {
      if (document.getElementById('step-8')?.hidden) return;

      appendAll(document.getElementById('review-identificacao'), [
        item('Nome:', val('nome')),
        item('CPF:', val('cpf')),
        item('Nascimento:', dateFormat(val('data_nasc'))),
        item('Deficiência:', checked('deficiencia').join(', '))
      ]);

      appendAll(document.getElementById('review-contato'), [
        item('Telefone:', val('telefone')),
        item('E-mail:', val('email')),
        item('Endereço:', val('endereco_completo')),
        item('Cidade/UF:', `${val('cidade')} / ${val('estado')}`),
        item('Tipo de endereço:', val('tipoLocalidade'))
      ]);

      appendAll(document.getElementById('review-curso'), [
        item('1ª opção:', val('curso_opcao_1')),
        item('2ª opção:', val('curso_opcao_2')),
        item('Cidade de prova:', val('cidade_prova')),
        item('Lista de espera:', val('lista_espera'))
      ]);

      appendAll(document.getElementById('review-atendimento'), [
        tags(checked('atendimento'))
      ]);

      const modalidades = [...document.querySelectorAll('#cota-badges .cotas-badge')]
        .map(b => b.textContent.trim());

      appendAll(document.getElementById('review-modalidades'), [
        tags(modalidades)
      ]);

      appendAll(document.getElementById('review-documentos'), [
        filesResumo()
      ]);
    }

    document.getElementById('btn-next')?.addEventListener('click', () => {
      setTimeout(renderReviewSummary, 0);
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      setTimeout(renderReviewSummary, 0);
    });

    const step8 = document.getElementById('step-8');

    if (step8) {
      new MutationObserver(renderReviewSummary)
        .observe(step8, { attributes: true, attributeFilter: ['hidden'] });
    }

    window.renderReviewSummary = renderReviewSummary;
  })();
  // ============================================================================
  // Revisão de inscrição — resumo final
  // ============================================================================

  let outerScrollFrame = 0;

function resetOuterWizardScroll() {
  const allowedScroller = document.querySelector('.wiz-content');

  const containers = [
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.querySelector('.admin-shell'),
    document.querySelector('.admin-main'),
    document.querySelector('.page--wizard'),
    document.querySelector('.wiz-body')
  ];

  containers.forEach(container => {
    if (!container || container === allowedScroller) return;

    container.scrollTop = 0;
    container.scrollLeft = 0;
  });

  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }
}

function scheduleOuterScrollReset() {
  if (outerScrollFrame) return;

  outerScrollFrame = requestAnimationFrame(() => {
    outerScrollFrame = 0;
    resetOuterWizardScroll();
  });
}

document.addEventListener(
  'focusin',
  event => {
    if (!event.target.closest('.wiz-content')) return;
    scheduleOuterScrollReset();
  },
  true
);
})();

// ============================================================================
// COMPROVANTE DE INSCRIÇÃO
// ============================================================================

function criarElemento(tag, {
  className = '',
  text = '',
  attributes = {}
} = {}) {
  const elemento = document.createElement(tag);

  if (className) {
    elemento.className = className;
  }

  if (text !== null && text !== undefined) {
    elemento.textContent = text;
  }

  Object.entries(attributes).forEach(([nome, valor]) => {
    if (valor !== null && valor !== undefined) {
      elemento.setAttribute(nome, String(valor));
    }
  });

  return elemento;
}


// ============================================================================
// LEITURA DOS DADOS DO FORMULÁRIO
// ============================================================================

function obterValorCampo(id, fallback = 'Não informado') {
  const campo = document.getElementById(id);

  if (!campo) {
    return fallback;
  }

  // Select: usa o texto visível da opção selecionada.
  if (campo instanceof HTMLSelectElement) {
    const opcaoSelecionada =
      campo.options[campo.selectedIndex];

    const texto =
      opcaoSelecionada
        ?.textContent
        ?.trim();

    return (
      texto &&
      campo.value
    )
      ? texto
      : fallback;
  }

  const valor =
    campo.value
      ?.trim();

  return valor || fallback;
}


function obterDataFormatada(id, fallback = 'Não informado') {
  const valor =
    document
      .getElementById(id)
      ?.value
      ?.trim();

  if (!valor) {
    return fallback;
  }

  const partes =
    valor.split('-');

  if (partes.length !== 3) {
    return valor;
  }

  const [ano, mes, dia] =
    partes;

  return `${dia}/${mes}/${ano}`;
}


function obterCamposMarcados(
  name,
  fallback = 'Nenhum item selecionado'
) {
  const valores = [
    ...document.querySelectorAll(
      `input[name="${name}"]:checked`
    )
  ]
    .map(input =>
      input.value.trim()
    )
    .filter(Boolean);

  return valores.length
    ? valores.join(', ')
    : fallback;
}


function obterModalidadesCalculadas() {
  const modalidades = [
    ...document.querySelectorAll(
      '#cota-badges .cotas-badge'
    )
  ]
    .map(badge =>
      badge.textContent.trim()
    )
    .filter(Boolean);

  return modalidades.length
    ? modalidades.join(' · ')
    : 'AC';
}


function obterDocumentosAnexados() {
  const documentos = [];

  document
    .querySelectorAll(
      'input[type="file"]'
    )
    .forEach(input => {
      const arquivos = [
        ...(input.files || [])
      ];

      arquivos.forEach(arquivo => {
        const label =
          input.dataset.atendimentoFile ||
          input
            .closest('.upload-section')
            ?.querySelector('.label')
            ?.textContent
            ?.trim() ||
          'Documento';

        documentos.push({
          label,
          nome: arquivo.name
        });
      });
    });

  return documentos;
}


// ============================================================================
// UTILITÁRIOS
// ============================================================================

function normalizarNomeArquivo(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    );
}


function gerarProtocoloTemporario() {
  /*
   * Substitua posteriormente pelo protocolo
   * retornado pelo backend.
   */

  return (
    `UNI-${
      Date.now()
        .toString()
        .slice(-10)
    }`
  );
}


// ============================================================================
// COMPONENTES DO COMPROVANTE
// ============================================================================

function criarCampoComprovante(
  rotulo,
  valor
) {
  const campo =
    criarElemento(
      'div',
      {
        className:
          'comprovante__campo'
      }
    );

  const label =
    criarElemento(
      'span',
      {
        className:
          'comprovante__campo-label',

        text:
          rotulo
      }
    );

  const conteudo =
    criarElemento(
      'span',
      {
        className:
          'comprovante__campo-valor',

        text:
          valor ||
          'Não informado'
      }
    );

  campo.append(
    label,
    conteudo
  );

  return campo;
}


function criarTituloSecao(
  numero,
  titulo
) {
  const header =
    criarElemento(
      'header',
      {
        className:
          'comprovante__secao-header'
      }
    );

  const heading =
    criarElemento(
      'h3',
      {
        className:
          'comprovante__secao-titulo',

        text:
          `${numero}. ${titulo}`
      }
    );

  header.appendChild(
    heading
  );

  return header;
}


function criarCardComprovante(
  titulo,
  campos
) {
  const card =
    criarElemento(
      'section',
      {
        className:
          'comprovante__card'
      }
    );

  const header =
    criarElemento(
      'header',
      {
        className:
          'comprovante__card-header'
      }
    );

  const tituloCard =
    criarElemento(
      'h4',
      {
        className:
          'comprovante__card-title',

        text:
          titulo
      }
    );

  header.appendChild(
    tituloCard
  );

  const body =
    criarElemento(
      'div',
      {
        className:
          'comprovante__card-body'
      }
    );

  campos.forEach(
    ({ label, valor }) => {
      body.appendChild(
        criarCampoComprovante(
          label,
          valor
        )
      );
    }
  );

  card.append(
    header,
    body
  );

  return card;
}


// ============================================================================
// ESTRUTURA DO COMPROVANTE
// ============================================================================

function criarEstruturaComprovante({
  nome,
  cpf,
  dataInscricao
}) {
  const comprovante =
    criarElemento(
      'article',
      {
        className:
          'comprovante-pdf'
      }
    );


  // ==========================================================================
  // CABEÇALHO INSTITUCIONAL
  // ==========================================================================

  const cabecalho =
    criarElemento(
      'header',
      {
        className:
          'comprovante__header'
      }
    );


  const marca =
    criarElemento(
      'div',
      {
        className:
          'comprovante__marca',

        text:
          'U+'
      }
    );


  const instituicao =
    criarElemento(
      'div',
      {
        className:
          'comprovante__instituicao'
      }
    );


  const ministerio =
    criarElemento(
      'span',
      {
        className:
          'comprovante__ministerio',

        text:
          'MINISTÉRIO DA EDUCAÇÃO'
      }
    );


  const universidade =
    criarElemento(
      'h1',
      {
        className:
          'comprovante__universidade',

        text:
          'UNIVERSIDADE FEDERAL DO SUL E SUDESTE DO PARÁ'
      }
    );


  const sistema =
    criarElemento(
      'span',
      {
        className:
          'comprovante__sistema',

        text:
          'Sistema Uni+ · Portal do Candidato'
      }
    );


  instituicao.append(
    ministerio,
    universidade,
    sistema
  );


  cabecalho.append(
    marca,
    instituicao
  );


  // ==========================================================================
  // TÍTULO DO DOCUMENTO
  // ==========================================================================

  const documento =
    criarElemento(
      'section',
      {
        className:
          'comprovante__documento'
      }
    );


  const tipoDocumento =
    criarElemento(
      'span',
      {
        className:
          'comprovante__documento-tipo',

        text:
          'PROCESSO SELETIVO'
      }
    );


  const tituloDocumento =
    criarElemento(
      'h2',
      {
        className:
          'comprovante__titulo',

        text:
          'COMPROVANTE DE INSCRIÇÃO'
      }
    );


  const descricao =
    criarElemento(
      'p',
      {
        className:
          'comprovante__descricao',

        text:
          'Documento comprobatório dos dados registrados pelo candidato no ato da inscrição.'
      }
    );


  documento.append(
    tipoDocumento,
    tituloDocumento,
    descricao
  );


  // ==========================================================================
  // PROTOCOLO
  // ==========================================================================

  const protocolo =
    gerarProtocoloTemporario();


  const blocoProtocolo =
    criarElemento(
      'section',
      {
        className:
          'comprovante__protocolo'
      }
    );


  const campoProtocolo =
    criarCampoComprovante(
      'Número do protocolo',
      protocolo
    );


  const campoStatus =
    criarCampoComprovante(
      'Situação da inscrição',
      'INSCRIÇÃO CONFIRMADA'
    );


  campoStatus.classList.add(
    'comprovante__campo--status'
  );


  const campoData =
    criarCampoComprovante(
      'Data e horário',
      dataInscricao
    );


  blocoProtocolo.append(
    campoProtocolo,
    campoStatus,
    campoData
  );


  // ==========================================================================
  // IDENTIFICAÇÃO PRINCIPAL
  // ==========================================================================

  const identificacao =
    criarElemento(
      'section',
      {
        className:
          'comprovante__secao'
      }
    );


  identificacao.appendChild(
    criarTituloSecao(
      '1',
      'IDENTIFICAÇÃO DO CANDIDATO'
    )
  );


  const identificacaoGrid =
    criarElemento(
      'div',
      {
        className:
          'comprovante__identificacao-grid'
      }
    );


  identificacaoGrid.append(
    criarCampoComprovante(
      'Nome completo',
      nome
    ),

    criarCampoComprovante(
      'CPF',
      cpf
    )
  );


  identificacao.appendChild(
    identificacaoGrid
  );


  // ==========================================================================
  // DADOS DA INSCRIÇÃO
  // ==========================================================================

  const dadosInscricao =
    criarElemento(
      'section',
      {
        className:
          'comprovante__secao'
      }
    );


  dadosInscricao.appendChild(
    criarTituloSecao(
      '2',
      'DADOS DA INSCRIÇÃO'
    )
  );


  const cardsGrid =
    criarElemento(
      'div',
      {
        className:
          'comprovante__cards-grid'
      }
    );


  // ==========================================================================
  // CARD — IDENTIFICAÇÃO
  // ==========================================================================

  const cardIdentificacao =
    criarCardComprovante(
      'IDENTIFICAÇÃO',
      [
        {
          label:
            'Nome',

          valor:
            nome
        },

        {
          label:
            'CPF',

          valor:
            cpf
        },

        {
          label:
            'Nascimento',

          valor:
            obterDataFormatada(
              'data_nasc'
            )
        },

        {
          label:
            'Deficiência',

          valor:
            obterCamposMarcados(
              'deficiencia'
            )
        }
      ]
    );


  // ==========================================================================
  // CARD — CONTATO E ENDEREÇO
  // ==========================================================================

  const cidade =
    obterValorCampo(
      'cidade'
    );


  const estado =
    obterValorCampo(
      'estado'
    );


  const endereco_completo =
    obterValorCampo(
      'endereco_completo'
    );


  const cardContato =
    criarCardComprovante(
      'CONTATO E ENDEREÇO',
      [
        {
          label:
            'Telefone',

          valor:
            obterValorCampo(
              'telefone'
            )
        },

        {
          label:
            'E-mail',

          valor:
            obterValorCampo(
              'email'
            )
        },

        {
          label:
            'Endereço',

          valor:
            endereco_completo
        },

        {
          label:
            'Cidade / UF',

          valor:
            `${cidade} / ${estado}`
        },

        {
          label:
            'Tipo de endereço',

          valor:
            obterValorCampo(
              'tipoLocalidade'
            )
        }
      ]
    );


  // ==========================================================================
  // CARD — CURSO E PROVA
  // ==========================================================================

  const cardCurso =
    criarCardComprovante(
      'CURSO E PROVA',
      [
        {
          label:
            '1ª opção',

          valor:
            obterValorCampo(
              'curso_opcao_1'
            )
        },

        {
          label:
            '2ª opção',

          valor:
            obterValorCampo(
              'curso_opcao_2',
              'Não se aplica'
            )
        },

        {
          label:
            'Cidade de prova',

          valor:
            obterValorCampo(
              'cidade_prova',
              'Não se aplica'
            )
        },

        {
          label:
            'Lista de espera',

          valor:
            obterValorCampo(
              'lista_espera',
              'Não informado'
            )
        }
      ]
    );


  // ==========================================================================
  // CARD — ATENDIMENTO, MODALIDADES E DOCUMENTOS
  // ==========================================================================

  const documentos =
    obterDocumentosAnexados();


  const camposAtendimento = [
    {
      label:
        'Atendimento especializado',

      valor:
        obterCamposMarcados(
          'atendimento'
        )
    },

    {
      label:
        'Modalidades calculadas',

      valor:
        obterModalidadesCalculadas()
    }
  ];


  if (documentos.length) {
    documentos.forEach(
      documentoAnexado => {
        camposAtendimento.push({
          label:
            documentoAnexado.label,

          valor:
            `${documentoAnexado.nome} — Anexado`
        });
      }
    );
  } else {
    camposAtendimento.push({
      label:
        'Documentos anexados',

      valor:
        'Nenhum documento anexado'
    });
  }


  const cardAtendimento =
    criarCardComprovante(
      'ATENDIMENTO, MODALIDADES E DOCUMENTOS',
      camposAtendimento
    );


  cardsGrid.append(
    cardIdentificacao,
    cardContato,
    cardCurso,
    cardAtendimento
  );


  dadosInscricao.appendChild(
    cardsGrid
  );


  // ==========================================================================
  // DECLARAÇÃO
  // ==========================================================================

  const declaracao =
    criarElemento(
      'section',
      {
        className:
          'comprovante__declaracao'
      }
    );


  const tituloDeclaracao =
    criarElemento(
      'h3',
      {
        className:
          'comprovante__declaracao-titulo',

        text:
          'DECLARAÇÃO'
      }
    );


  const textoDeclaracao =
    criarElemento(
      'p',
      {
        className:
          'comprovante__declaracao-texto',

        text:
          'Este comprovante registra as informações declaradas pelo candidato no Sistema Uni+ e confirma a realização da inscrição no processo seletivo correspondente.'
      }
    );


  declaracao.append(
    tituloDeclaracao,
    textoDeclaracao
  );


  // ==========================================================================
  // RODAPÉ
  // ==========================================================================

  const rodape =
    criarElemento(
      'footer',
      {
        className:
          'comprovante__footer'
      }
    );


  const rodapePrincipal =
    criarElemento(
      'div',
      {
        className:
          'comprovante__footer-principal'
      }
    );


  rodapePrincipal.append(
    criarElemento(
      'span',
      {
        text:
          'Universidade Federal do Sul e Sudeste do Pará'
      }
    ),

    criarElemento(
      'span',
      {
        text:
          'Sistema Uni+'
      }
    )
  );


  const avisoRodape =
    criarElemento(
      'p',
      {
        className:
          'comprovante__footer-aviso',

        text:
          'Documento emitido eletronicamente. A guarda deste comprovante é de responsabilidade do candidato.'
      }
    );


  rodape.append(
    rodapePrincipal,
    avisoRodape
  );


  // ==========================================================================
  // MONTA O DOCUMENTO
  // ==========================================================================

  comprovante.append(
    cabecalho,
    documento,
    blocoProtocolo,
    identificacao,
    dadosInscricao,
    declaracao,
    rodape
  );


  return comprovante;
}


// ============================================================================
// GERAÇÃO DO PDF
// ============================================================================

async function baixarComprovanteInscricao() {
  if (
    typeof window.html2canvas !==
    'function'
  ) {
    console.error(
      'A biblioteca html2canvas não está disponível.'
    );

    return;
  }


  if (
    !window.jspdf?.jsPDF
  ) {
    console.error(
      'A biblioteca jsPDF não está disponível.'
    );

    return;
  }


  /*
   * Atualiza a Revisão Final antes de coletar
   * os dados, caso a função esteja disponível.
   */
  if (
    typeof window.renderReviewSummary ===
    'function'
  ) {
    window.renderReviewSummary();
  }


  const nome =
    document
      .getElementById('nome')
      ?.value
      ?.trim() ||
    'candidato';


  const cpf =
    document
      .getElementById('cpf')
      ?.value
      ?.trim() ||
    'Não informado';


  const dataInscricao =
    new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle:
          'short',

        timeStyle:
          'medium'
      }
    ).format(
      new Date()
    );


  const comprovante =
    criarEstruturaComprovante({
      nome,
      cpf,
      dataInscricao
    });


  document.body.appendChild(
    comprovante
  );


  try {
    /*
     * Aguarda o navegador finalizar
     * o cálculo do layout.
     */
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(
          resolve
        );
      });
    });


    const canvas =
      await window.html2canvas(
        comprovante,
        {
          scale:
            2,

          backgroundColor:
            '#ffffff',

          useCORS:
            true,

          logging:
            false,

          scrollX:
            0,

          scrollY:
            0,

          windowWidth:
            comprovante.scrollWidth,

          windowHeight:
            comprovante.scrollHeight
        }
      );


    /*
     * PNG mantém textos e linhas
     * mais nítidos que JPEG.
     */
    const imagem =
      canvas.toDataURL(
        'image/png'
      );


    const {
      jsPDF
    } =
      window.jspdf;


    const pdf =
      new jsPDF({
        orientation:
          'portrait',

        unit:
          'mm',

        format:
          'a4',

        compress:
          true
      });


    const larguraPagina =
      pdf
        .internal
        .pageSize
        .getWidth();


    const alturaPagina =
      pdf
        .internal
        .pageSize
        .getHeight();


    /*
     * Margem menor para aproveitar melhor
     * a folha A4.
     */
    const margem =
      6;


    const larguraDisponivel =
      larguraPagina -
      margem * 2;


    const alturaDisponivel =
      alturaPagina -
      margem * 2;


    /*
     * Calcula a escala pela largura
     * e pela altura.
     *
     * Usa a menor escala para garantir
     * que o comprovante caiba inteiro
     * em uma página A4.
     */
    const escalaLargura =
      larguraDisponivel /
      canvas.width;


    const escalaAltura =
      alturaDisponivel /
      canvas.height;


    const escala =
      Math.min(
        escalaLargura,
        escalaAltura
      );


    const larguraImagem =
      canvas.width *
      escala;


    const alturaImagem =
      canvas.height *
      escala;


    /*
     * Centraliza o documento na folha.
     */
    const posicaoX =
      (
        larguraPagina -
        larguraImagem
      ) / 2;


    const posicaoY =
      (
        alturaPagina -
        alturaImagem
      ) / 2;


    pdf.addImage(
      imagem,
      'PNG',
      posicaoX,
      posicaoY,
      larguraImagem,
      alturaImagem
    );


    const nomeArquivo =
      normalizarNomeArquivo(
        nome
      );


    pdf.save(
      `comprovante-inscricao-${nomeArquivo}.pdf`
    );

  } catch (erro) {
    console.error(
      'Erro ao gerar o comprovante de inscrição.',
      erro
    );

  } finally {
    comprovante.remove();
  }
}

// ============================================================================
// MODAL DE BUSCA DE CEP
// ============================================================================

/** Abre o modal de busca de CEP */
function abrirModalCep() {
  const modal = document.getElementById('cepModal');
  const input = document.getElementById('cepInput');
  if (modal) {
    modal.showModal();
    setTimeout(() => input?.focus(), 100);
  }
}

/** Fecha o modal de busca de CEP */
function fecharModalCep() {
  const modal = document.getElementById('cepModal');
  modal?.close();
}

/**
 * Confirma o CEP informado no modal, preenche os campos
 * e exibe a seção de endereço.
 */
function confirmarCep() {
  const cep = document.getElementById('cepInput')?.value.trim();
  if (!cep) {
    alert('Informe um CEP antes de buscar.');
    return;
  }

  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    alert('CEP inválido. Informe um CEP com 8 dígitos.');
    return;
  }

  // --- Dados simulados de endereço ---
  // Em produção, substituir por consulta à API de CEP (ex.: ViaCEP)
  const enderecosSimulados = {
    '68500000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Rua Principal, 123, Centro' },
    '68501000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Av. Antônio Maia, 500, Cidade Nova' },
    '68502000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Rua do Comércio, 200, Bairro do Líder' },
    '68503000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Av. João Pinheiro Franco, 300, Folha 32' },
    '68504000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Rua Cinco, 50, Jardim Nova Vida' },
    '68505000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Av. Mutirão, 100, Novo Horizonte' },
    '68506000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Rua das Flores, 300, Bairro do Amapá' },
    '68507000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Rua São Paulo, 400, Bairro Independência' },
    '68508000': { estado: 'PA', cidade: 'Marabá', logradouro: 'Av. Getúlio Vargas, 150, Centro' },
    '66000000': { estado: 'PA', cidade: 'Belém', logradouro: 'Av. Presidente Vargas, 500, Centro' },
    '69000000': { estado: 'AM', cidade: 'Manaus', logradouro: 'Av. Eduardo Ribeiro, 600, Centro' }
  };

  const dados = enderecosSimulados[cepLimpo];

  if (!dados) {
    alert('CEP não encontrado na base de dados. Preencha os campos manualmente.');
    // Mesmo assim exibe os campos para preenchimento manual
    exibirCamposEndereco(cep);
    fecharModalCep();
    return;
  }

  // Preenche os campos
  document.getElementById('cep').value = cep;
  document.getElementById('estado').value = dados.estado;
  document.getElementById('cidade').value = dados.cidade;
  document.getElementById('endereco_completo').value = dados.logradouro;

  exibirCamposEndereco(cep);
  fecharModalCep();
}

/** Exibe a seção de campos de endereço e limpa o input do modal */
function exibirCamposEndereco(cep) {
  const div = document.getElementById('enderecoFields');
  if (div) {
    div.removeAttribute('hidden');
    div.style.display = ''; // garante que o form-grid funcione
  }

  // Esconde o botão de busca
  const btn = document.getElementById('btnBuscarCep');
  if (btn) {
    btn.closest('.form-grid__full')?.remove();
  }

  // Limpa o input do modal
  const input = document.getElementById('cepInput');
  if (input) input.value = '';
}

/** Fecha modal ao clicar fora (backdrop) */
document.addEventListener('click', function (e) {
  const modal = document.getElementById('cepModal');
  if (modal && e.target === modal) {
    fecharModalCep();
  }
});

// ============================================================================
// EXPÕE A FUNÇÃO GLOBALMENTE
// ============================================================================

window.baixarComprovanteInscricao = baixarComprovanteInscricao;
