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
            <p class="label">${label}</p>
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
          <input type="checkbox" name="deficiencia" value="${x}" onchange="_controleNaoPossuo(this,'deficiencia','Não Possuo')">
          <span>${x}</span>
        </label>
      `).join('');
    }

    const atendBox = document.getElementById('atendimentoBox');
    if (atendBox) {
      atendBox.innerHTML = atendimentos.map(x => `
        <label class="insc-chip">
          <input type="checkbox" name="atendimento" value="${x}" onchange="_controleNaoPossuo(this,'atendimento','Não Necessito')">
          <span>${x}</span>
        </label>
      `).join('');
    }
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
    const novoModelo = document.getElementById('rg_novo_modelo')?.checked;
    const divAntigo = document.getElementById('rgModeloAntigo');
    const divNovo = document.getElementById('rgModeloNovo');
    const textoModelo = document.getElementById('rgModeloTexto');
    if (divAntigo) divAntigo.hidden = !!novoModelo;
    if (divNovo) divNovo.hidden = !novoModelo;
    if (textoModelo) textoModelo.textContent = novoModelo ? 'Novo modelo de RG' : 'Modelo antigo de RG';
    if (novoModelo) _sincronizarRgComCpf();
  };

  window._sincronizarRgComCpf = function () {
    const novoModelo = document.getElementById('rg_novo_modelo')?.checked;
    const cpfValue = document.getElementById('cpf')?.value || '';
    if (novoModelo) {
      const el = document.getElementById('rg_novo_numero');
      if (el) el.value = cpfValue;
    }
  };

  window._calcularValidadeCIN = function () {
    const novoModelo = document.getElementById('rg_novo_modelo')?.checked;
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
      sel.innerHTML = '<option value="">Selecione</option>' + lista.map(x => `<option>${x}</option>`).join('');
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
    if (!isSim) document.querySelectorAll('input[name="cota_quilombola"]').forEach(r => r.checked = false);
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
    let opcoes = ['<option value="">Selecione</option>'];
    if (curso1) {
      opcoes.push(`<option value="primeira">PARTICIPAR APENAS DE ${curso1.toUpperCase()}</option>`);
    } else {
      opcoes = ['<option value="">Selecione o curso primeiro</option>'];
    }
    if (temSegunda && curso2) {
      opcoes.push(`<option value="segunda">PARTICIPAR APENAS DE ${curso2.toUpperCase()}</option>`);
    }
    opcoes.push('<option value="nao_participar">Não Participar</option>');
    lista.innerHTML = opcoes.join('');
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

  function validarPassoAtual() {
    const erros = [];

    if (currentStep === 2) {
      ['nome','desejaNomeSocial','cpf','data_nasc','sexo_civil','raca','sexo_biologico','identidade_genero','orientacao_sexual']
        .forEach(id => { if (!req(id)) erros.push('Preencha: ' + id.replace(/_/g, ' ')); });
      if (req('desejaNomeSocial') === 'Sim' && !req('nomeSocial')) erros.push('Preencha: Nome Social.');
      const novoModelo = document.getElementById('rg_novo_modelo')?.checked;
      if (novoModelo) {
        _sincronizarRgComCpf();
        if (!req('cpf')) erros.push('Preencha: CPF para usar o novo modelo de RG.');
        if (!req('rg_novo_orgao_expedidor')) erros.push('Preencha: Órgão Expedidor (novo RG).');
        if (!req('rg_novo_data_emissao')) erros.push('Preencha: Data de Emissão (novo RG).');
      } else {
        if (!req('rg')) erros.push('Preencha: Número do RG.');
        if (!req('rg_orgao_expedidor')) erros.push('Preencha: Órgão Expedidor.');
        if (!req('rg_data_expedicao')) erros.push('Preencha: Data de Expedição.');
      }
      racaEscolhida = req('raca');
      deficienciasMarcadas = [...document.querySelectorAll('input[name="deficiencia"]:checked')].map(x => x.value);
      if (!deficienciasMarcadas.length) erros.push('Marque pelo menos uma opção de deficiência (ou Não Possuo).');
    }

    if (currentStep === 3) {
      ['telefone','email','cep','estado','cidade','tipoLocalidade'].forEach(id => {
        if (!req(id)) erros.push('Preencha: ' + id.replace(/_/g, ' '));
      });
      const email = req('email');
      const confirmEmail = req('confirmar_email');
      if (confirmEmail && email !== confirmEmail) erros.push('Os e-mails não coincidem.');
      const loc = req('tipoLocalidade');
      if (['Aldeia','Comunidade','Quilombo'].includes(loc)) {
        if (!req('selectEtnia')) erros.push('Selecione etnia/comunidade.');
        if (req('selectEtnia') === 'Não encontrei minha etnia/comunidade' && !req('inputOutraEtnia')) {
          erros.push('Digite o nome da etnia/comunidade.');
        }
      }
    }

    if (currentStep === 4) {
      const temSegunda = ['Vestibular','PSVR'].includes(psEscolhido);
      const semPresencial = ['SISU'];
      if (!semPresencial.includes(psEscolhido) && !req('cidade_prova')) erros.push('Informe a cidade de prova.');
      if (!req('curso_opcao_1')) erros.push('Selecione a 1ª opção de curso.');
      if (temSegunda && !req('curso_opcao_2')) erros.push('Selecione a 2ª opção de curso.');
      if (temSegunda && req('curso_opcao_1') && req('curso_opcao_2') && req('curso_opcao_1') === req('curso_opcao_2')) {
        erros.push('A 2ª opção deve ser diferente da 1ª.');
      }
      if (!req('lista_espera')) erros.push('Selecione a opção de lista de espera.');
    }

    if (currentStep === 5) {
      if (!document.querySelector('input[name="atendimento"]:checked')) {
        erros.push('Informe se necessita atendimento especializado.');
      }
    }

    if (currentStep === 6 && !isTransferencia()) {
      if (!document.querySelector('input[name="escola_publica"]:checked')) erros.push('Responda: escola pública.');
      if (!document.querySelector('input[name="renda_minima"]:checked')) erros.push('Responda: renda familiar.');
    }

    if (currentStep === 8) {
      if (!document.getElementById('aceite_termos')?.checked) erros.push('Aceite os termos para finalizar.');
    }

    if (erros.length) {
      alert('Atenção:\n\n- ' + [...new Set(erros)].join('\n- '));
      return false;
    }
    return true;
  }

  /* ---- navigation ---- */

  function nextStep() {
    if (!validarPassoAtual()) return;
    if (currentStep === getLastStep()) {
      alert('Inscrição enviada com sucesso!');
      return;
    }
    currentStep = getNextStep();
    renderView();
    window.scrollTo(0, 0);
  }

  function prevStep() {
    currentStep = getPrevStep();
    renderView();
    window.scrollTo(0, 0);
  }

  /* ---- init ---- */

  const SVG_CHECK = `<svg class="num-icon num-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
  const SVG_HOURGLASS = `<svg class="num-icon num-hourglass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

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

    renderView();
  });

})();
