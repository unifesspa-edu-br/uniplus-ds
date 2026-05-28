# ADR-0004 — Hero estático de edital em destaque no lugar do carrossel-herói

- **Status:** Accepted
- **Data:** 2026-05-28
- **Escopo:** Design System (`uniplus-ds`)
- **Issue:** unifesspa-edu-br/uniplus-ds#17

## Contexto

A home do **Portal do Candidato** (`ui_kits/portal/index.html`) abria com um
carrossel-herói de 3 editais (SISU, Pós-graduação, Vestibular Indígena). Embora
fosse **manual** (nunca auto-rotacionava) e seguisse a estrutura do WAI-ARIA APG,
dois problemas estruturais ficaram evidentes ao testar no mobile:

1. **Quebra de layout no mobile (iPhone SE, 375×667):**
   - Um único slide tinha ~733px de altura — **mais alto que o viewport**.
   - A ilustração decorativa (`order:-1`, ~310px) subia para o topo, ocupando
     todo o espaço "acima da dobra" com um placeholder sem informação.
   - Os controles (setas, dots, "Slide X de Y") caíam em ~y970 — **abaixo da
     dobra** —, de modo que a existência dos slides 2 e 3 era praticamente
     indescobrível.
   - Os botões flutuantes (VLibras, voltar-ao-topo) **sobrepunham** a área dos
     controles.
   - Não havia suporte a **swipe**.

2. **Redundância:** os três editais do carrossel **já apareciam logo abaixo**,
   na seção "Editais abertos" (lista/cards), que é escaneável e filtrável. O
   carrossel duplicava conteúdo já disponível numa forma melhor.

A questão de fundo: *carrosséis-herói devem ser usados num portal de governo
mobile-first — e, se sim, onde e como?*

## Pesquisa / literatura consultada

- **Nielsen Norman Group:** carrosséis **não devem auto-rotacionar no mobile**
  (a página é curta, o usuário rola rápido e não vê a troca); animações de
  rotação prejudicam usuários com deficiências motoras, baixa visão, baixo
  letramento e distúrbios vestibulares. No mobile, os **dots são sinalizadores
  fracos**, a maioria **abandona após 3–4 itens** e **swipe é esperado**.
- **Baymard Institute:** ~46% dos carrosséis de home têm problemas de
  usabilidade; **a maioria dos usuários nunca vê além do primeiro slide**. A
  recomendação explícita: *"uma alternativa mais simples e que funciona bem é
  usar seções de conteúdo estáticas"*. Para mobile: **evitar auto-rotação**,
  **suportar swipe** e **não tornar o carrossel a única rota** para conteúdo.
- **W3C WAI-ARIA APG — Carousel Pattern:** define o carrossel acessível
  (rotação pausável, botões nativos, slides ocultos removidos da árvore de
  acessibilidade, navegação por teclado). É o padrão a seguir *quando* um
  carrossel for usado.
- **Gov.br DS / e-MAG 3.1:** o Padrão Digital de Governo **possui** um
  componente Carousel oficial — logo, carrosséis **não são proibidos** pela
  norma; ela exige implementação acessível. WCAG 2.1 SC **2.2.2 (Pause, Stop,
  Hide)** aplica-se a conteúdo que se move/atualiza automaticamente; como nosso
  herói não auto-rotacionava, já era atendido.

### Referências

- NN/g — Auto-forwarding: <https://www.nngroup.com/articles/auto-forwarding/> · Mobile carousels: <https://www.nngroup.com/articles/mobile-carousels/> · Designing effective carousels: <https://www.nngroup.com/articles/designing-effective-carousels/>
- Baymard — 10 UX requirements for homepage carousels: <https://baymard.com/blog/homepage-carousel>
- W3C WAI-ARIA APG — Carousel: <https://www.w3.org/WAI/ARIA/apg/patterns/carousel/>
- Gov.br DS — Carousel: <https://www.gov.br/ds/components/carousel> · Acessibilidade: <https://www.gov.br/ds/acessibilidade>
- WCAG 2.1 SC 2.2.2 (Pause, Stop, Hide): <https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html>

## Decisão

1. **Substituir o carrossel-herói da home do Portal por uma seção estática** de
   **um único edital em destaque** (o de maior prioridade), com tag de status,
   título, lead e CTAs — acima da lista "Editais abertos" já existente. É a
   "seção de conteúdo estática" recomendada pela Baymard como alternativa ao
   carrossel.
2. **Mobile-first:** a ilustração do hero é **decorativa** (`aria-hidden`) e fica
   **oculta em telas estreitas** (`max-width: 767px`), garantindo que o conteúdo
   e o CTA permaneçam acima da dobra — corrige a causa raiz da quebra.
3. **O componente `.carousel` permanece na biblioteca do DS** (`components.css`),
   pois o Gov.br DS o prevê e há casos legítimos (ex.: galeria de imagens
   genuinamente sequencial). Deixa de ser o padrão do **herói da home**.

### Onde e como usar carrossel no Uni+ (diretriz)

- **Evitar** carrossel como herói de página ou para conteúdo que também existe
  numa lista/grade na mesma tela (redundância).
- **Preferir** seção estática (1 destaque) ou grade de cards (N destaques, todos
  visíveis) quando o objetivo é "mostrar vários itens".
- **Se um carrossel for realmente necessário:** nunca auto-rotacionar; suportar
  swipe no mobile; seguir o WAI-ARIA APG; limitar a poucos itens; não ser a
  única rota para o conteúdo; respeitar `prefers-reduced-motion`.

## Consequências

**Positivas**
- Elimina a quebra de layout no mobile (conteúdo e CTA acima da dobra).
- Remove a redundância com a lista de editais.
- Melhor descoberta, menos JS, menos superfície de manutenção/a11y.
- Alinhamento a NN/g, Baymard, WAI-ARIA APG e ao espírito do Gov.br DS/e-MAG.

**Negativas / custos**
- Apenas **um** edital ganha destaque visual no topo (antes eram três em
  rotação). Mitigação: os demais seguem imediatamente visíveis na lista; o
  destaque deve apontar para o edital de maior prioridade no momento.
- O componente `.carousel` fica sem uso em kits — é intencional (continua
  documentado para uso futuro legítimo).

## Alternativas descartadas

- **Manter o carrossel e só corrigir o mobile** (tirar a ilustração do topo,
  reduzir altura, adicionar swipe): resolveria a quebra, mas manteria a
  redundância com a lista e a baixa descoberta dos slides 2–3 que a literatura
  documenta. Mais código para um padrão que a evidência desaconselha aqui.
- **Grade "Em destaque" de 2–3 cards estáticos:** alternativa válida (todos
  visíveis, sem rotação), mas a lista logo abaixo já cumpre esse papel; um único
  hero forte comunica prioridade com menos repetição.

## Implementação

- `ui_kits/portal/index.html`: trocar a `<section class="carousel">` por
  `<section class="hero">` estática; remover o CSS `.slide-edital*`/`.slide-alert`
  /`.slide-info` e o IIFE do carrossel; adicionar o CSS `.hero*`.
- `ui_kits/portal/README.md`: atualizar a descrição do fluxo e a nota de a11y.
- `components.css`: **não** alterar — o componente `.carousel` permanece no DS.
