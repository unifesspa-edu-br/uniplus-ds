// ---- Mobile step accordion ----
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });
  overlay.addEventListener('click', (e) => { if (e.target.closest('.steps__item')) close(); });
})();

// ---- Wizard navigation ----
(function () {
  const TOTAL = 13;
  const LABELS = ['Tipo edital', 'Identificação', 'Modalidades', 'Vagas', 'Etapas',
    'Fórmula e precisão', 'Bônus', 'Desempate', 'Eliminação',
    'Docs por modalidade', 'Locais de prova', 'Atend. especial', 'Revisão e publicação'];

  const content = document.getElementById('step-content');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const barMeta = document.querySelector('.step-bar__meta');
  const navItems = document.querySelectorAll('#nav-steps .steps__item');
  const ovItems = document.querySelectorAll('#steps-overlay .steps__item');

  let current = 0; // índice base-0
  let started = false;

  const SVG_CHECK = `<svg class="num-icon num-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
  const SVG_HOURGLASS = `<svg class="num-icon num-hourglass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

  document.querySelectorAll('#nav-steps .steps__num, #steps-overlay .steps__num').forEach(badge => {
    const num = badge.textContent.trim();
    const textSpan = document.createElement('span');
    textSpan.className = 'num-text';
    textSpan.textContent = num;
    badge.innerHTML = SVG_CHECK + SVG_HOURGLASS;
    badge.prepend(textSpan);
  });

  function initCards() {
    document.querySelectorAll('.type-card').forEach((card) => {
      const input = card.querySelector('input[type="radio"]');
      if (!input) return;
      input.addEventListener('change', () => {
        document.querySelectorAll('.type-card').forEach((c) =>
          c.classList.toggle('is-selected', !!c.querySelector('input')?.checked));
      });
    });
  }

  function initCsel() {
    const grid = document.getElementById('modalidades-grid');
    const marcarTodos = document.getElementById('modalidade-marcar-todos');
    if (!grid || !marcarTodos) return;

    function getCheckboxes() {
      return [...grid.querySelectorAll('input[type="checkbox"]')];
    }

    marcarTodos.addEventListener('change', () => {
      getCheckboxes().forEach(chk => { chk.checked = marcarTodos.checked; });
    });

    grid.addEventListener('change', () => {
      const all = getCheckboxes();
      marcarTodos.checked = all.length > 0 && all.every(chk => chk.checked);
      marcarTodos.indeterminate = !marcarTodos.checked && all.some(chk => chk.checked);
    });
  }

  function initVagas() {
    const CURSOS = [
      { id: 1, nome: 'Ciências Sociais', grau: 'Bach.', campus: 'Campus de Marabá', unidade: 'Unidade I' },
      { id: 2, nome: 'Física', grau: 'Lic.', campus: 'Campus de Marabá', unidade: 'Unidade I' },
      { id: 3, nome: 'Licenciatura em Educação do Campo', grau: 'Lic.', campus: 'Campus de Marabá', unidade: 'Unidade I' },
      { id: 4, nome: 'Matemática', grau: 'Lic.', campus: 'Campus de Marabá', unidade: 'Unidade II' },
      { id: 5, nome: 'História', grau: 'Bach.', campus: 'Campus de Marabá', unidade: 'Unidade I' },
      { id: 6, nome: 'Sistemas de Informação', grau: 'Bach.', campus: 'Campus de Marabá', unidade: 'Unidade II' },
      { id: 7, nome: 'Engenharia de Produção', grau: 'Bach.', campus: 'Campus de Marabá', unidade: 'Unidade III' },
      { id: 8, nome: 'Medicina', grau: 'Bach.', campus: 'Campus de Marabá', unidade: 'Unidade I' },
    ];

    const vagasData = {}; // id → { vagas: 0, turno: '' }
    const addedIds = new Set();

    const btnAdd = document.getElementById('btn-add-curso');
    const modal = document.getElementById('vagas-modal');
    const modalClose = document.getElementById('vagas-modal-close');
    const modalCancel = document.getElementById('vagas-modal-cancel');
    const modalConfirm = document.getElementById('vagas-modal-confirm');
    const modalList = document.getElementById('vagas-modal-list');
    const marcarTodosVagas = document.getElementById('vagas-modal-marcar-todos');
    const tbody = document.getElementById('vagas-tbody');
    const cardsWrap = document.getElementById('vagas-cards');
    const cardsSection = document.getElementById('vagas-cards-wrap');
    const emptyState = document.getElementById('vagas-empty-state');
    const tableWrap = document.getElementById('vagas-table-wrap');
    const totalEl = document.getElementById('vagas-total');

    function updateTotal() {
      const total = Object.values(vagasData).reduce((s, d) => s + (d.vagas || 0), 0);
      if (totalEl) totalEl.textContent = total;
    }

    function updateEmpty() {
      const hasRows = addedIds.size > 0;
      if (emptyState) emptyState.hidden = hasRows;
      if (tableWrap) tableWrap.style.borderRadius = 'var(--radius-md) var(--radius-md) 0 0';
      if (cardsSection) cardsSection.hidden = !hasRows;
    }

    function counterHtml(id) {
      return `<div class="vagas-counter">
            <button class="vagas-counter__btn" type="button" data-action="dec" data-id="${id}" aria-label="Diminuir">−</button>
            <input class="vagas-counter__input" type="number" value="0" min="0" max="9999" data-id="${id}" aria-label="Vagas">
            <button class="vagas-counter__btn" type="button" data-action="inc" data-id="${id}" aria-label="Aumentar">+</button>
          </div>`;
    }

    function turnoHtml(id) {
      return `<select class="vagas-table__select" data-id="${id}" aria-label="Turno">
            <option value="">Selecione</option>
            <option value="matutino">Matutino</option>
            <option value="vespertino">Vespertino</option>
            <option value="noturno">Noturno</option>
          </select>`;
    }

    function trashHtml(id, label) {
      return `<button class="vagas-del" type="button" data-del="${id}" aria-label="Remover ${label}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          </button>`;
    }

    function addCurso(curso) {
      addedIds.add(curso.id);
      vagasData[curso.id] = { vagas: 0, turno: '' };

      // Linha na tabela desktop
      const tr = document.createElement('tr');
      tr.dataset.row = curso.id;
      tr.innerHTML = `
            <td>
              <div class="vagas-table__curso-nome">${curso.nome}</div>
              <div class="vagas-table__curso-grau">${curso.grau}</div>
            </td>
            <td>
              <div>${curso.campus}</div>
              <div class="vagas-table__campus-un">${curso.unidade}</div>
            </td>
            <td class="vagas-table__turno">${turnoHtml(curso.id)}</td>
            <td class="vagas-table__vagas">${counterHtml(curso.id)}</td>
            <td style="text-align:center">${trashHtml(curso.id, curso.nome)}</td>`;
      tbody.appendChild(tr);

      // Card mobile
      const card = document.createElement('div');
      card.className = 'vagas-card-item';
      card.dataset.row = curso.id;
      card.innerHTML = `
            <div class="vagas-card-item__curso">${curso.nome} — ${curso.grau}</div>
            <div class="vagas-card-item__campus">${curso.campus} — ${curso.unidade}</div>
            <div class="vagas-card-item__fields">
              <div>
                <div class="vagas-card-item__lbl">Turno</div>
                ${turnoHtml('m' + curso.id)}
              </div>
              <div>
                <div class="vagas-card-item__lbl">Vagas</div>
                ${counterHtml('m' + curso.id)}
              </div>
              <div>${trashHtml(curso.id, curso.nome)}</div>
            </div>`;
      cardsWrap.appendChild(card);

      updateEmpty();
      updateTotal();
    }

    function removeCurso(id) {
      addedIds.delete(id);
      delete vagasData[id];
      tbody.querySelector(`[data-row="${id}"]`)?.remove();
      cardsWrap.querySelector(`[data-row="${id}"]`)?.remove();
      updateEmpty();
      updateTotal();
    }

    function openModal() {
      modalList.innerHTML = '';
      CURSOS.forEach(curso => {
        const isAdded = addedIds.has(curso.id);
        const li = document.createElement('li');
        li.className = 'vagas-modal__item' + (isAdded ? ' is-added' : '');
        li.innerHTML = `
              <input type="checkbox" id="mc-${curso.id}" ${isAdded ? 'checked disabled' : ''}>
              <label for="mc-${curso.id}">
                <span class="vagas-modal__item__nome">${curso.nome} — ${curso.grau}</span>
                <span class="vagas-modal__item__info">${curso.campus} — ${curso.unidade}</span>
              </label>`;
        if (!isAdded) {
          const cb = li.querySelector('input');
          li.addEventListener('click', (e) => { if (e.target !== cb) cb.checked = !cb.checked; });
        }
        modalList.appendChild(li);
      });
      if (marcarTodosVagas) {
        marcarTodosVagas.checked = false;
        marcarTodosVagas.indeterminate = false;
      }
      modal.showModal();
      document.body.style.overflow = 'hidden';
      modalClose.focus();
    }

    function closeModal() {
      modal.close();
      document.body.style.overflow = '';
      btnAdd.focus();
    }

    function syncMarcarTodos() {
      const all = [...modalList.querySelectorAll('input[type="checkbox"]:not(:disabled)')];
      const nChecked = all.filter(cb => cb.checked).length;
      marcarTodosVagas.checked = all.length > 0 && nChecked === all.length;
      marcarTodosVagas.indeterminate = nChecked > 0 && nChecked < all.length;
    }

    if (marcarTodosVagas) {
      marcarTodosVagas.addEventListener('change', () => {
        modalList.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(cb => {
          cb.checked = marcarTodosVagas.checked;
        });
      });
      modalList.addEventListener('change', syncMarcarTodos);
    }

    // Eventos do modal
    btnAdd.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });
    modalConfirm.addEventListener('click', () => {
      modalList.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)').forEach(cb => {
        const id = parseInt(cb.id.replace('mc-', ''), 10);
        const curso = CURSOS.find(c => c.id === id);
        if (curso) addCurso(curso);
      });
      closeModal();
    });

    // Delegação de eventos para contadores, selects e exclusão
    const stepContent = document.getElementById('step-content');
    stepContent.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const id = actionBtn.dataset.id;
        const isDesktop = !id.startsWith('m');
        const baseId = isDesktop ? parseInt(id, 10) : parseInt(id.slice(1), 10);
        if (!(baseId in vagasData)) return;

        // Atualiza os dois inputs (desktop e mobile)
        const inputs = stepContent.querySelectorAll(
          `.vagas-counter__input[data-id="${baseId}"], .vagas-counter__input[data-id="m${baseId}"]`
        );
        let val = parseInt(inputs[0]?.value, 10) || 0;
        if (actionBtn.dataset.action === 'inc') val++;
        if (actionBtn.dataset.action === 'dec' && val > 0) val--;
        inputs.forEach(inp => { inp.value = val; });
        vagasData[baseId].vagas = val;
        updateTotal();
      }

      const delBtn = e.target.closest('[data-del]');
      if (delBtn) removeCurso(parseInt(delBtn.dataset.del, 10));
    });

    stepContent.addEventListener('change', (e) => {
      if (e.target.classList.contains('vagas-counter__input')) {
        const id = e.target.dataset.id;
        const baseId = id.startsWith('m') ? parseInt(id.slice(1), 10) : parseInt(id, 10);
        if (!(baseId in vagasData)) return;
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        e.target.value = val;
        stepContent.querySelectorAll(
          `.vagas-counter__input[data-id="${baseId}"], .vagas-counter__input[data-id="m${baseId}"]`
        ).forEach(inp => { inp.value = val; });
        vagasData[baseId].vagas = val;
        updateTotal();
      }

      if (e.target.classList.contains('vagas-table__select')) {
        const id = e.target.dataset.id;
        const baseId = id.startsWith('m') ? parseInt(id.slice(1), 10) : parseInt(id, 10);
        if (!(baseId in vagasData)) return;
        vagasData[baseId].turno = e.target.value;
        stepContent.querySelectorAll(
          `.vagas-table__select[data-id="${baseId}"], .vagas-table__select[data-id="m${baseId}"]`
        ).forEach(sel => { sel.value = e.target.value; });
      }
    });

    // Estado inicial: mostra empty-state
    updateEmpty();
  }

  function initEtapas() {
    const list = document.getElementById('etapas-list');
    const btnAdd = document.getElementById('btn-add-etapa');

    const SVG_UP = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>`;
    const SVG_DOWN = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
    const SVG_TRASH = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>`;
    const SVG_CAL = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;

    function createBlock() {
      const block = document.createElement('div');
      block.className = 'etapa-block';
      block.innerHTML = `
            <div class="etapa-block__header">
              <div class="etapa-block__tags">
                <span class="etapa-tag etapa-tag--num" role="button" tabindex="0">Etapas 1</span>
                <span class="etapa-tag" role="button" tabindex="0">Administrativa</span>
              </div>
              <span class="etapa-block__title-wrap">Inscrição de candidatos</span>
              <div class="etapa-block__actions">
                <button class="etapa-act-btn" data-action="up" type="button" aria-label="Mover para cima">${SVG_UP}</button>
                <button class="etapa-act-btn" data-action="down" type="button" aria-label="Mover para baixo">${SVG_DOWN}</button>
                <button class="etapa-act-btn etapa-act-btn--remove" data-action="remove" type="button" aria-label="Remover etapa">
                  ${SVG_TRASH}<span class="etapa-remover-label">Remover</span>
                </button>
              </div>
            </div>
            <div class="etapa-block__body">
              <div class="etapa-grid">
                <div class="etapa-grid__tipo form-field">
                  <label class="label">Tipo de etapa</label>
                  <select class="input">
                    <option value="">Selecione</option>
                    <option value="INSCRICAO_CANDIDATOS">INSCRICAO_CANDIDATOS - inscrição candidatos</option>
                    <option value="HOMOLOGACAO_INSCRICOES">HOMOLOGACAO_INSCRICOES - homologação de inscrições</option>
                    <option value="DIVULGACAO_RESULTADO_PARCIAL">DIVULGACAO_RESULTADO_PARCIAL - divulgação do resultado parcial</option>
                  </select>
                </div>
                <div class="etapa-grid__inicio form-field">
                  <label class="label">Início da jornada</label>
                  <div class="input-icon-wrap">
                    <input class="input etapa-date" type="date" value="2026-01-01">
                    <button type="button" class="input-icon-wrap__btn" aria-label="Abrir calendário">${SVG_CAL}</button>
                  </div>
                </div>
                <div class="etapa-grid__nome form-field">
                  <label class="label">Nome customizado (opcional)</label>
                  <input class="input" type="text" placeholder="Nome">
                </div>
                <div class="etapa-grid__fim-wrap">
                  <div class="form-field">
                    <label class="label">Fim da janela</label>
                    <div class="input-icon-wrap">
                      <input class="input etapa-date" type="date" value="2026-01-30">
                      <button type="button" class="input-icon-wrap__btn" aria-label="Abrir calendário">${SVG_CAL}</button>
                    </div>
                  </div>
                  <p class="etapa-hint">Pode ser igual ao início se a etapa ocorrer em 1 dia.</p>
                </div>
              </div>
              <label class="check-item">
                <input type="checkbox">
                <span>Esta etapa permite recurso?</span>
              </label>
            </div>`;

      // Calendário: botão abre o date picker nativo
      block.querySelectorAll('.input-icon-wrap__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const input = btn.previousElementSibling;
          try { input.showPicker(); } catch (e) { input.focus(); }
        });
      });

      // Tags: toggle is-active ao clicar
      block.querySelectorAll('.etapa-tag').forEach(tag => {
        function toggle() { tag.classList.toggle('is-active'); }
        tag.addEventListener('click', toggle);
        tag.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });

      // Ações: up / down / remove via delegação no bloco
      block.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn || btn.disabled) return;
        const a = btn.dataset.action;
        if (a === 'up') moveBlock(block, -1);
        if (a === 'down') moveBlock(block, 1);
        if (a === 'remove') removeBlock(block);
      });

      return block;
    }

    function renumber() {
      const blocks = list.querySelectorAll('.etapa-block');
      blocks.forEach((b, i) => {
        const numTag = b.querySelector('.etapa-tag--num');
        if (numTag) numTag.textContent = 'Etapas ' + (i + 1);
        b.querySelector('[data-action="up"]').disabled = i === 0;
        b.querySelector('[data-action="down"]').disabled = i === blocks.length - 1;
      });
    }

    function moveBlock(block, dir) {
      const blocks = [...list.querySelectorAll('.etapa-block')];
      const i = blocks.indexOf(block);
      const target = blocks[i + dir];
      if (!target) return;
      if (dir === -1) list.insertBefore(block, target);
      else list.insertBefore(target, block);
      renumber();
    }

    function removeBlock(block) {
      block.remove();
      renumber();
    }

    function addBlock() {
      const block = createBlock();
      list.appendChild(block);
      renumber();
      block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    btnAdd.addEventListener('click', addBlock);
    addBlock(); // bloco inicial
  }

  function initIdentificacao() {
    // Calendário
    const inputData = document.getElementById('f-data');
    const btnCal = document.getElementById('btn-calendar');
    if (inputData && btnCal) {
      btnCal.addEventListener('click', () => {
        try { inputData.showPicker(); } catch (e) { inputData.focus(); }
      });
    }

    // Upload
    const zone = document.getElementById('f-upload');
    const fileInput = document.getElementById('f-file-input');
    const listEl = document.getElementById('file-list');
    if (!zone || !fileInput || !listEl) return;

    let uploads = []; // { name, ext, progress }

    function getExt(name) { return name.split('.').pop().toLowerCase(); }

    function animateBar(bar, idx) {
      let pct = 0;
      const tick = setInterval(() => {
        pct = Math.min(pct + Math.random() * 18 + 7, 100);
        bar.style.width = pct + '%';
        if (pct >= 100) { clearInterval(tick); uploads[idx].progress = 100; }
      }, 80);
    }

    function renderList() {
      listEl.innerHTML = '';
      if (!uploads.length) {
        listEl.innerHTML = '<p class="file-list-empty">Nenhum arquivo adicionado.</p>';
        return;
      }
      uploads.forEach((f, i) => {
        const color = f.ext === 'pdf' ? 'var(--color-success-600)' : 'var(--color-primary)';
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
              <span class="file-badge file-badge--${f.ext}">${f.ext.toUpperCase()}</span>
              <div class="file-info">
                <span class="file-name"></span>
                <div class="file-progress">
                  <div class="file-progress__bar" id="fbar-${i}" style="width:${f.progress}%;background:${color}"></div>
                </div>
              </div>
              <button class="file-delete" type="button" data-idx="${i}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>`;
        div.querySelector('.file-name').textContent = f.name;
        div.querySelector('.file-delete').setAttribute('aria-label', 'Remover ' + f.name);
        listEl.appendChild(div);
        if (f.progress < 100) {
          animateBar(document.getElementById('fbar-' + i), i);
        }
      });
    }

    function addFiles(files) {
      Array.from(files).forEach(file => {
        const e = getExt(file.name);
        if (e !== 'pdf' && e !== 'png') return;
        uploads.push({ name: file.name, ext: e, progress: 0 });
      });
      renderList();
    }

    zone.addEventListener('click', (e) => {
      if (!e.target.closest('.file-delete')) fileInput.click();
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      addFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
      addFiles(fileInput.files);
      fileInput.value = '';
    });

    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-idx]');
      if (!btn) return;
      uploads.splice(Number(btn.dataset.idx), 1);
      renderList();
    });

    renderList();
  }

  function initBonus() {
    const chk = document.getElementById('f-bonus-ativo');
    const infoMsg = document.getElementById('bonus-info-msg');
    const config = document.getElementById('bonus-config');
    if (!chk) return;
    chk.addEventListener('change', () => {
      infoMsg.hidden = chk.checked;
      config.hidden = !chk.checked;
    });
  }

  function initDesempate() {
    const CRITERIOS = [
      { id: 1, nome: 'Candidato idoso (60+ anos)', fonte: 'Lei 10.741/2003 art. 27' },
      { id: 2, nome: 'Maior nota na Redação', fonte: 'Definido por cada edital' },
      { id: 3, nome: 'Maior idade cronológica', fonte: 'Costume administrativo' },
      { id: 4, nome: 'Menor número de inscrição', fonte: 'Definido por cada edital' },
      { id: 5, nome: 'Maior nota total no ENEM', fonte: 'Definido por cada edital' },
      { id: 6, nome: 'Maior nota em Ciências da Natureza', fonte: 'Definido por cada edital' },
      { id: 7, nome: 'Maior nota em Ciências Humanas', fonte: 'Definido por cada edital' },
    ];

    let order = []; // ids na ordem de exibição

    const list = document.getElementById('desempate-list');
    const btnAdd = document.getElementById('btn-add-criterio');
    const modal = document.getElementById('criterio-modal');
    const mClose = document.getElementById('criterio-modal-close');
    const mCancel = document.getElementById('criterio-modal-cancel');
    const mConfirm = document.getElementById('criterio-modal-confirm');
    const mList = document.getElementById('criterio-modal-list');

    function render() {
      list.innerHTML = '';
      order.forEach((id, i) => {
        const c = CRITERIOS.find(x => x.id === id);
        if (!c) return;
        const div = document.createElement('div');
        div.className = 'desempate-item';
        div.dataset.id = id;
        div.innerHTML = `
              <span class="desempate-num">${i + 1}º</span>
              <div class="desempate-info">
                <span class="desempate-nome">${c.nome}</span>
                <span class="desempate-fonte">${c.fonte}</span>
              </div>
              <div class="desempate-actions">
                <button class="desempate-btn" type="button" data-action="up" data-id="${id}" aria-label="Mover para cima"${i === 0 ? ' disabled' : ''}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button class="desempate-btn" type="button" data-action="down" data-id="${id}" aria-label="Mover para baixo"${i === order.length - 1 ? ' disabled' : ''}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <button class="desempate-btn" type="button" data-action="del" data-id="${id}" aria-label="Remover ${c.nome}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>`;
        list.appendChild(div);
      });
    }

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const idx = order.indexOf(id);
      if (btn.dataset.action === 'up' && idx > 0) {
        [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
      } else if (btn.dataset.action === 'down' && idx < order.length - 1) {
        [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      } else if (btn.dataset.action === 'del') {
        order.splice(idx, 1);
      }
      render();
    });

    function openModal() {
      mList.innerHTML = '';
      CRITERIOS.forEach(c => {
        const already = order.includes(c.id);
        const li = document.createElement('li');
        li.innerHTML = `
              <label class="vagas-modal__item${already ? ' is-disabled' : ''}">
                <input type="checkbox" value="${c.id}"${already ? ' disabled checked' : ''}>
                <div class="vagas-modal__item-info">
                  <span class="vagas-modal__item-nome">${c.nome}</span>
                  <span class="vagas-modal__item-sub">${c.fonte}</span>
                </div>
              </label>`;
        mList.appendChild(li);
      });
      modal.showModal();
      document.body.style.overflow = 'hidden';
      mList.querySelector('input:not([disabled])')?.focus();
    }

    function closeModal() {
      modal.close();
      document.body.style.overflow = '';
      btnAdd.focus();
    }

    btnAdd.addEventListener('click', openModal);
    mClose.addEventListener('click', closeModal);
    mCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });

    mConfirm.addEventListener('click', () => {
      mList.querySelectorAll('input:checked:not([disabled])').forEach(chk => {
        const id = Number(chk.value);
        if (!order.includes(id)) order.push(id);
      });
      render();
      closeModal();
    });
  }

  function initDocs() {
    const GROUPS = [
      {
        label: 'IDENTIFICACAO',
        docs: [
          { id: 'rg-cnh', nome: 'Documento de identidade (RG, CNH, CTPS)', desc: 'Documento oficial com foto.' },
          { id: 'cpf', nome: 'CPF', desc: 'Cadastro de Pessoa Física.' },
          { id: 'foto-3x4', nome: 'Foto 3x4 (digital)', desc: 'Foto recente de identificação, fundo claro.' },
        ]
      },
      {
        label: 'ESCOLARIDADE',
        docs: [
          { id: 'hist-em', nome: 'Histórico do Ensino Médio', desc: 'Histórico escolar completo do ensino médio, com todas as disciplinas e notas.' },
          { id: 'cert-em', nome: 'Certificado de Conclusão do Ensino Médio', desc: 'Certificado oficial de conclusão.' },
          { id: 'hist-grad', nome: 'Histórico de Graduação', desc: 'Histórico de curso superior anterior (transferência, portador de diploma).' },
          { id: 'diplo-grad', nome: 'Diploma de Graduação', desc: 'Diploma de curso superior.' },
        ]
      },
      {
        label: 'RENDA',
        docs: [
          { id: 'comp-renda', nome: 'Comprovantes de renda familiar', desc: 'Comprovantes dos últimos 3 meses de todos os membros da família.' },
          { id: 'decl-informal', nome: 'Declaração de renda informal', desc: 'Declaração de renda para trabalhadores informais ou autônomos.' },
        ]
      },
      {
        label: 'RACA_ETNIA',
        docs: [
          { id: 'decl-etnico', nome: 'Declaração de autorreconhecimento étnico-racial', desc: 'Autodeclaração assinada de identidade étnico-racial (preto, pardo, indígena).' },
          { id: 'decl-indigena', nome: 'Declaração de Pertencimento Indígena', desc: 'Declaração de pertencimento a comunidade indígena, assinada por 3 lideranças.' },
          { id: 'decl-quilombola', nome: 'Declaração de Pertencimento Quilombola', desc: 'Declaração de pertencimento a comunidade quilombola, assinada por 3 lideranças.' },
          { id: 'decl-territorial', nome: 'Declaração de Pertencimento Territorial (PSE Ed. Campo)', desc: 'Declaração de pertencimento a povo do campo, comunidade tradicional ou movimento social.' },
        ]
      },
      {
        label: 'SAUDE',
        docs: [
          { id: 'laudo-pcd', nome: 'Laudo médico para PcD', desc: 'Laudo médico com CID, conforme critério Grupo de Washington (Portaria MEC 2.027/2023).' },
          { id: 'auto-pcd', nome: 'Termo de autodeclaração PcD', desc: 'Termo onde o candidato se declara pessoa com deficiência, complementar ao laudo.' },
        ]
      },
      {
        label: 'RESIDENCIA',
        docs: [
          { id: 'comp-res', nome: 'Comprovante de residência', desc: 'Conta de luz, água, telefone ou contrato de aluguel dos últimos 3 meses.' },
        ]
      },
      {
        label: 'OUTROS',
        docs: [
          { id: 'carta-int', nome: 'Carta de Intenção (documento de inscrição)', desc: 'Texto argumentativo onde o candidato apresenta motivação para o curso. Avaliada como etapa, mas anexada na inscrição.' },
          { id: 'comp-prof', nome: 'Comprovante de atuação como professor rural', desc: 'Declaração de exercício da docência em escola pública rural (PSE Ed. Campo).' },
        ]
      },
    ];

    const ETAPAS = [
      { num: 'Etapa 1', cod: 'INSCRICAO_CANDIDATOS' },
      { num: 'Etapa 2', cod: 'HOMOLOGACAO_INSCRICOES' },
      { num: 'Etapa 3', cod: 'IMPORTACAO_NOTAS_ENEM' },
      { num: 'Etapa 4', cod: 'DIVULGACAO_RESULTADO_PARCIAL' },
      { num: 'Etapa 5', cod: 'DIVULGACAO_RESULTADO_FINAL' },
    ];

    const MODS = ['AC', 'V', 'LB_PPI', 'LB_Q', 'LB_PcD', 'LB_EP', 'LI_PPI', 'LI_Q', 'LI_PcD', 'LI_EP'];

    const listEl = document.getElementById('docs-list');
    if (!listEl) return;

    function buildExpand() {
      const etapasHtml = ETAPAS.map(e => `
            <label class="doc-etapa-item">
              <input type="checkbox" class="doc-etapa-chk" checked disabled>
              <span><span class="doc-etapa-num">${e.num} —</span><br>${e.cod}</span>
            </label>`).join('');

      const modsHtml = MODS.map(cod => `
            <label class="doc-mod-item">
              <input type="checkbox" checked>
              <span>${cod}</span>
            </label>`).join('');

      return `
            <strong class="doc-expand__q">Em quais etapas é obrigatório?</strong>
            <p class="doc-expand__hint">Marque "Todas as etapas" para exigir o documento desde a inscrição até o resultado final, ou escolha apenas as etapas específicas (ex.: só na homologação).</p>
            <label class="doc-expand__all">
              <input type="checkbox" class="doc-all-chk" checked>
              <span>Todas as etapas do edital</span>
            </label>
            <div class="doc-expand__etapas">${etapasHtml}</div>
            <strong class="doc-expand__q">Modalidades que devem entregar</strong>
            <div class="doc-expand__mods">${modsHtml}</div>`;
    }

    GROUPS.forEach(g => {
      const grpEl = document.createElement('div');
      grpEl.className = 'docs-group';
      grpEl.innerHTML = `<h2 class="docs-group__label">${g.label}</h2>`;

      g.docs.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'doc-item';
        item.innerHTML = `
              <div class="doc-item__row">
                <input type="checkbox" class="doc-checkbox" id="doc-${doc.id}">
                <div class="doc-item__info">
                  <label class="doc-item__name" for="doc-${doc.id}">${doc.nome}</label>
                  <span class="doc-item__desc">${doc.desc}</span>
                </div>
                <span class="doc-item__badge">Não faz parte do edital</span>
              </div>
              <div class="doc-expand" hidden>${buildExpand()}</div>`;
        grpEl.appendChild(item);
      });

      listEl.appendChild(grpEl);
    });

    listEl.addEventListener('change', (e) => {
      const item = e.target.closest('.doc-item');
      if (!item) return;

      if (e.target.classList.contains('doc-checkbox')) {
        const expand = item.querySelector('.doc-expand');
        const badge = item.querySelector('.doc-item__badge');
        expand.hidden = !e.target.checked;
        if (e.target.checked) {
          badge.textContent = 'Incluído';
          badge.className = 'doc-item__badge doc-item__badge--included';
        } else {
          badge.textContent = 'Não faz parte do edital';
          badge.className = 'doc-item__badge';
        }
      }

      if (e.target.classList.contains('doc-all-chk')) {
        item.querySelectorAll('.doc-etapa-chk').forEach(chk => {
          chk.checked = e.target.checked;
          chk.disabled = e.target.checked;
        });
      }
    });
  }

  function initAtend() {
    const CONDITIONS = [
      { id: 'pcd', nome: 'Pessoa com deficiência', laudo: true, isPcd: true },
      { id: 'disl', nome: 'Dislexia', laudo: true },
      { id: 'tdah', nome: 'Déficit de atenção (TDAH)', laudo: true },
      { id: 'discalc', nome: 'Discalculia', laudo: true },
      { id: 'diab', nome: 'Diabetes', laudo: true },
      { id: 'hosp', nome: 'Estudante em classe hospitalar', laudo: true },
      { id: 'gest', nome: 'Gestante' },
      { id: 'lact', nome: 'Lactante' },
      { id: 'idoso', nome: 'Idoso (60+ anos)' },
      { id: 'outra', nome: 'Outra condição específica', laudo: true },
    ];

    const RECURSOS = [
      { id: 'libras-int', nome: 'Tradutor-intérprete de Libras', desc: 'Profissional para tradução simultânea em Língua Brasileira de Sinais.' },
      { id: 'letra-amp', nome: 'Prova com letra ampliada', desc: 'Prova impressa com fonte tamanho 18 e figuras ampliadas.' },
      { id: 'letra-samp', nome: 'Prova com letra superampliada', desc: 'Prova impressa com fonte tamanho 24 e figuras ampliadas.' },
      { id: 'braile', nome: 'Prova em braile', desc: 'Prova impressa em sistema braile.' },
      { id: 'videoprova', nome: 'Videoprova em Libras', desc: 'Versão videogravada da prova em Língua Brasileira de Sinais.' },
      { id: 'leitor-tel', nome: 'Uso de leitor de tela', desc: 'Software leitor de tela em prova digital.' },
      { id: 'guia-int', nome: 'Guia-intérprete', desc: 'Profissional para candidatos com surdocegueira.' },
      { id: 'ledor', nome: 'Auxílio para leitura (ledor)', desc: 'Profissional para leitura da prova.' },
      { id: 'transcritor', nome: 'Auxílio para transcrição (transcritor)', desc: 'Profissional para transcrição das respostas.' },
      { id: 'leit-lab', nome: 'Leitura labial', desc: 'Aplicador treinado para leitura labial.' },
      { id: 'tempo-adic', nome: 'Tempo adicional', desc: 'Tempo adicional para realização da prova (até 1h conforme regulamento do edital).' },
      { id: 'sala-ac', nome: 'Sala de fácil acesso', desc: 'Sala térrea ou com acesso por elevador, sem barreiras arquitetônicas.' },
      { id: 'calc', nome: 'Calculadora', desc: 'Uso de calculadora como auxílio para candidato com discalculia.' },
      { id: 'mesa-br', nome: 'Mesa sem braço', desc: 'Mobiliário específico: mesa/cadeira sem braço (mobilidade reduzida, deficiência física, lactantes).' },
      { id: 'apoio-pes', nome: 'Apoio para pernas e pés', desc: 'Mobiliário específico: apoio para pernas e pés, geralmente combinado com mesa sem braço.' },
      { id: 'acomp-lac', nome: 'Acompanhante para o lactente', desc: 'Adulto acompanhante para cuidar da criança durante a prova da lactante (regra operacional INEP; não consta como recurso do item 4.2.2, mas é oferta institucional vinculada ao atendimento).', ext: true },
      { id: 'sala-ind', nome: 'Sala individual ou reduzida', desc: 'Sala com poucos candidatos para redução de estímulos (TEA, TDAH). Extensão local — não consta no item 4.2.2 do Edital ENEM 52/2025.', ext: true },
    ];

    const PCD_TIPOS = [
      'Deficiência física',
      'Deficiência visual — Cegueira',
      'Deficiência visual — Baixa visão',
      'Deficiência auditiva — Surdez severa/profunda',
      'Deficiência auditiva — Surdez parcial',
      'Deficiência intelectual',
      'Deficiência psicossocial',
      'Deficiência múltipla',
      'Transtorno do espectro autista (TEA)',
      'Altas habilidades / Superdotação',
    ];

    function makeCard(id, nome, opts = {}) {
      const card = document.createElement('label');
      card.className = 'atend-card';
      card.innerHTML = `
            <input type="checkbox" id="${id}"${opts.isPcd ? ' data-pcd' : ''}>
            <div class="atend-card__body">
              <span class="atend-card__name">${nome}</span>
              ${opts.laudo ? '<span class="atend-badge atend-badge--laudo">Exige laudo</span>' : ''}
              ${opts.ext ? '<span class="atend-badge atend-badge--ext">Extensão local</span>' : ''}
              ${opts.desc ? `<span class="atend-card__desc">${opts.desc}</span>` : ''}
            </div>`;
      return card;
    }

    const condGrid = document.getElementById('atend-cond-grid');
    if (condGrid) {
      CONDITIONS.forEach(c => condGrid.appendChild(
        makeCard('cond-' + c.id, c.nome, { laudo: c.laudo, isPcd: c.isPcd })
      ));
    }

    const pcdGrid = document.getElementById('pcd-tipos-grid');
    if (pcdGrid) {
      PCD_TIPOS.forEach((tipo, i) => pcdGrid.appendChild(
        makeCard('pcd-tipo-' + i, tipo)
      ));
    }

    const recGrid = document.getElementById('atend-rec-grid');
    if (recGrid) {
      RECURSOS.forEach(r => recGrid.appendChild(
        makeCard('rec-' + r.id, r.nome, { desc: r.desc, ext: r.ext })
      ));
    }

    condGrid && condGrid.addEventListener('change', (e) => {
      if (e.target.hasAttribute('data-pcd')) {
        const sub = document.getElementById('pcd-subblock');
        if (sub) sub.hidden = !e.target.checked;
      }
    });
  }

  function initRevisao() {
    const NAMES = [
      'Tipo do edital', 'Identificação', 'Modalidades', 'Vagas',
      'Etapas', 'Fórmula de classificação', 'Bônus', 'Critérios de desempate',
      'Notas mínimas e cláusulas', 'Documentos por modalidade',
      'Locais de prova', 'Atendimento especializado',
    ];
    const list = document.getElementById('revisao-list');
    if (!list) return;
    NAMES.forEach((nome, i) => {
      const item = document.createElement('div');
      item.className = 'revisao-item';
      item.dataset.revIdx = i;
      item.innerHTML = `
            <div class="revisao-item__icon"></div>
            <div class="revisao-item__meta">
              <span class="revisao-item__num">Passo ${String(i + 1).padStart(2, '0')}</span>
              <span class="revisao-item__name">${nome}</span>
            </div>
            <span class="revisao-chip"></span>
            <button class="btn btn--sm btn--ghost revisao-item__go" data-goto="${i}">Ir para</button>`;
      list.appendChild(item);
    });
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-goto]');
      if (btn) goTo(Number(btn.dataset.goto));
    });
  }

  function refreshRevisao() {
    const list = document.getElementById('revisao-list');
    const summary = document.getElementById('revisao-summary');
    if (!list) return;

    const ICON_OK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`;
    const ICON_PENDING = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M8 12h8"/></svg>`;

    let done = 0;
    list.querySelectorAll('.revisao-item').forEach(item => {
      const i = Number(item.dataset.revIdx);
      const ok = Boolean(slots[i]?.filled);
      if (ok) done++;

      item.classList.toggle('revisao-item--ok', ok);
      item.classList.toggle('revisao-item--pending', !ok);

      item.querySelector('.revisao-item__icon').innerHTML = ok ? ICON_OK : ICON_PENDING;

      const chip = item.querySelector('.revisao-chip');
      chip.textContent = ok ? 'Concluído' : 'Pendente';
      chip.className = 'revisao-chip ' + (ok ? 'revisao-chip--ok' : 'revisao-chip--pending');
    });

    if (summary) {
      const pct = Math.round(done / 12 * 100);
      const allDone = done === 12;
      summary.className = 'revisao-summary' + (allDone ? ' revisao-summary--done' : '');
      const pending = 12 - done;
      summary.innerHTML = `
            <div class="revisao-summary__info">
              <span class="revisao-summary__count">${done} <small style="font-size:.9rem;font-weight:var(--weight-normal);color:var(--text-secondary)">/ 12</small></span>
              <span class="revisao-summary__detail">${allDone ? 'Tudo pronto para publicar!' : `${pending} passo${pending > 1 ? 's' : ''} pendente${pending > 1 ? 's' : ''}`}</span>
            </div>
            <div class="revisao-progress"><div class="revisao-progress__bar" style="width:${pct}%"></div></div>
            <span class="revisao-summary__pct">${pct}%</span>`;
    }
  }

  function initPolos() {
    const POLOS = [
      'Marabá (PA)', 'Canaã dos Carajás (PA)', 'Rondon do Pará (PA)',
      'Santana do Araguaia (PA)', 'São Félix do Xingu (PA)', 'Xinguara (PA)',
      'Abel Figueiredo (PA)', 'Água Azul do Norte (PA)', 'Almeirim (PA)',
      'Anapu (PA)', 'Bannach (PA)', 'Bom Jesus do Tocantins (PA)',
      'Brejo Grande do Araguaia (PA)', 'Conceição do Araguaia (PA)',
      'Cumaru do Norte (PA)', 'Curionópolis (PA)', 'Dom Eliseu (PA)',
      'Eldorado dos Carajás (PA)', 'Floresta do Araguaia (PA)',
      'Goianésia do Pará (PA)', 'Itupiranga (PA)', 'Jacundá (PA)',
      'Novo Repartimento (PA)', 'Ourilândia do Norte (PA)', 'Palestina do Pará (PA)',
      'Parauapebas (PA)', 'Piçarra (PA)', 'Redenção (PA)', 'Rio Maria (PA)',
      'São Domingos do Araguaia (PA)', 'São Geraldo do Araguaia (PA)',
      'São João do Araguaia (PA)', 'Sapucaia (PA)', 'Tucumã (PA)',
      'Tucuruí (PA)',
    ];

    const listEl = document.getElementById('polo-list');
    if (!listEl) return;

    POLOS.forEach((city, i) => {
      const id = 'polo-' + i;
      const item = document.createElement('div');
      item.className = 'polo-item';
      item.innerHTML = `
            <label class="polo-item__row">
              <input type="checkbox" class="polo-checkbox" id="${id}">
              <span class="polo-item__name">${city}</span>
            </label>
            <div class="polo-item__expand" hidden>
              <span class="polo-expand__label">Capacidade máxima de inscritos:</span>
              <input type="number" class="input polo-expand__cap" placeholder="sem limite" min="1">
              <span class="polo-expand__hint">Vazio = sem limite (o que pode estourar a capacidade real do local).</span>
            </div>`;
      listEl.appendChild(item);
    });

    listEl.addEventListener('change', (e) => {
      if (!e.target.classList.contains('polo-checkbox')) return;
      const item = e.target.closest('.polo-item');
      if (!item) return;
      item.querySelector('.polo-item__expand').hidden = !e.target.checked;
    });
  }

  // Slots render-once: cada step vive no DOM após a primeira visita
  const slots = Array.from({ length: TOTAL }, () => {
    const div = document.createElement('div');
    div.hidden = true;
    content.appendChild(div);
    return { el: div, inited: false, filled: false };
  });

  function goTo(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    current = idx;

    const slot = slots[idx];
    if (!slot.inited) {
      const tpl = document.getElementById('step-' + (idx + 1));
      if (tpl) slot.el.appendChild(tpl.content.cloneNode(true));
      slot.inited = true;

      if (idx === 0) initCards();
      if (idx === 1) initIdentificacao();
      if (idx === 2) initCsel();
      if (idx === 3) initVagas();
      if (idx === 4) initEtapas();
      if (idx === 6) initBonus();
      if (idx === 7) initDesempate();
      if (idx === 9) initDocs();
      if (idx === 10) initPolos();
      if (idx === 11) initAtend();
      if (idx === 12) initRevisao();
    }

    if (idx === 12) refreshRevisao();

    slots.forEach((s, i) => { s.el.hidden = i !== idx; });
    if (started) {
      const heading = slot.el.querySelector('.step-head h1, .step-head h2, h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
    started = true;

    // Atualiza stepper desktop
    navItems.forEach((item, i) => {
      const s = slots[i];
      item.classList.toggle('is-active', i === idx);
      item.classList.toggle('is-done', s.inited && s.filled && i !== idx);
      item.classList.toggle('is-pending', s.inited && !s.filled && i !== idx);
    });

    // Atualiza stepper mobile overlay
    ovItems.forEach((item, i) => {
      const s = slots[i];
      item.classList.toggle('is-active', i === idx);
      item.classList.toggle('is-done', s.inited && s.filled && i !== idx);
      item.classList.toggle('is-pending', s.inited && !s.filled && i !== idx);
    });

    // Atualiza barra mobile
    if (barMeta) {
      const num = String(idx + 1).padStart(2, '0');
      barMeta.textContent = 'Etapa ' + (idx + 1) + ' de ' + TOTAL + ' (' + num + ' ' + LABELS[idx] + ')';
    }
    // Atualiza barra de progresso
    document.querySelector('.step-bar')
      ?.style.setProperty('--step-progress', ((idx + 1) / TOTAL * 100).toFixed(2) + '%');

    // Atualiza botões
    btnPrev.hidden = idx === 0;
    const isLast = idx === TOTAL - 1;
    btnNext.querySelector('svg') && (btnNext.querySelector('svg').style.display = isLast ? 'none' : '');
    btnNext.childNodes[0].textContent = isLast ? 'Publicar ' : 'Próximo ';
  }

  btnNext.addEventListener('click', () => {
    if (current < TOTAL - 1) {
      slots[current].filled = true;
      goTo(current + 1);
    }
  });
  btnPrev.addEventListener('click', () => { if (current > 0) goTo(current - 1); });

  navItems.forEach((item, i) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => goTo(i));
  });
  ovItems.forEach((item, i) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => goTo(i));
  });

  goTo(0);
})();
