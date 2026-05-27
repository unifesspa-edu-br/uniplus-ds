/* =============================================================================
 * uniplus-vlibras.js — carregamento lazy do widget oficial VLibras (ADR-0003)
 * =============================================================================
 * O VLibras é a suíte oficial de tradução para Libras (Lei 10.436/2002,
 * Decreto 5.626/2005). É um runtime externo (vlibras.gov.br) pesado, então o
 * script só é carregado de forma não-bloqueante (requestIdleCallback / após o
 * load), preservando a performance inicial. O widget injeta o próprio botão
 * flutuante e o avatar 3D.
 *
 * Pré-requisito: a página deve conter o container do widget:
 *   <div vw class="enabled">
 *     <div vw-access-button class="active"></div>
 *     <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>
 *   </div>
 *
 * Em produção (uniplus-web) o carregamento é responsabilidade do shell, uma vez
 * por sessão — não por componente.
 * ========================================================================== */
(function () {
  'use strict';

  // Só ativa se o container do widget existir na página.
  if (!document.querySelector('[vw]')) return;

  var SRC = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  var started = false;

  function init() {
    try {
      // Sem argumento: o widget assume o rootPath padrão oficial
      // 'https://vlibras.gov.br/app/' (com barra final). Passar a URL sem a
      // barra final corrompia os caminhos de assets internos do widget — ex.:
      // as bandeiras do painel "Regionalismo" viravam imagens quebradas.
      if (window.VLibras && window.VLibras.Widget) new window.VLibras.Widget();
    } catch (_) { /* indisponibilidade do serviço externo não quebra a página */ }
  }

  function load() {
    if (started) return;
    started = true;
    if (window.VLibras && window.VLibras.Widget) { init(); return; }
    var s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.onload = init;
    document.body.appendChild(s);
  }

  // Lazy: não bloqueia o carregamento inicial.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 4000 });
  } else if (document.readyState === 'complete') {
    setTimeout(load, 1500);
  } else {
    window.addEventListener('load', function () { setTimeout(load, 1500); });
  }
})();
