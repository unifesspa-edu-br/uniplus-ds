# Component API — Uni+ Design System

> Contrato canônico de **todo componente do design system**: anatomia HTML,
> classes, ARIA, slots e comportamento esperado.
>
> Este repositório é CSS-only. Implementações Angular, Web Components ou de
> outros frameworks devem viver nos projetos consumidores e mapear este contrato
> sem criar wrappers ou APIs TypeScript neste pacote.

---

## Botões — `.btn`

### Anatomia
```html
<button class="btn btn--<variant> btn--<size>" disabled>
  <svg class="btn__icon" aria-hidden="true">…</svg>
  <span>Texto da ação</span>
</button>
```

### Variantes
| Modifier | Quando usar |
|---|---|
| `btn--primary` (default) | 1 por view — ação principal |
| `btn--secondary` | Ação alternativa (borda primary) |
| `btn--tertiary` | Ações leves (sem borda) |
| `btn--danger` | Ações irreversíveis |
| `btn--sm` / `btn--md` / `btn--lg` | piso de 44px nos três (WCAG 2.5.5); sm/md só reduzem tipografia e padding, lg sobe para 48px |
| `btn--icon-only btn--circle` | Botão circular só com ícone (≥44, inclusive com `btn--sm`) |
| `btn--icon-only btn--rect` | Quadrado com radius pequeno (close de modal) |
| `btn--full` | `width: 100%` |
| `btn--pill` / `btn--rect` | Override do radius (pill é default) |

### Estados
Todos cobertos por CSS: default, hover, focus-visible (3px ring), active, disabled.

### ARIA contract
- `aria-label` **obrigatório** em `btn--icon-only`
- `aria-pressed` em toggle buttons
- Nunca simule botão com `<div>` — sempre `<button>` ou `<a>`

---

## Form fields — `.field` + `.input` / `.select` / `.textarea`

### Anatomia
```html
<div class="field is-error">
  <label class="field__label is-required" for="cpf">CPF</label>
  <input class="input" id="cpf" name="cpf" required
         aria-describedby="cpf-hint cpf-error" aria-invalid="false"
         data-format="cpf">
  <p id="cpf-hint" class="field__hint">11 dígitos.</p>
  <p id="cpf-error" class="field__error" hidden>CPF inválido.</p>
</div>
```

### Input com addon
```html
<div class="input-group">
  <span class="input-group__addon"><svg/></span>
  <input class="input">
</div>
```

### ARIA contract
- `<label for>` **obrigatório** apontando ao `id` do input
- `aria-describedby` chaine: `<hint-id> <error-id>`
- `aria-invalid` reflete o estado
- `aria-required` derivado de `required`
- **`aria-describedby` deve incluir todos os ids relevantes**; UniForm faz isso automaticamente

---

## Tag — `.tag`

### Anatomia
```html
<span class="tag tag--<variant>">
  <span class="tag__dot" aria-hidden="true"></span>
  Label
</span>
```

### Variantes
- Soft (default): `success` / `warning` / `danger` / `info` / `primary` / neutro
- Solid (call-out, uppercase): adicionar `tag--solid`

---

## Alert — `.alert`

### Anatomia
```html
<div class="alert alert--<variant>" role="alert" aria-live="polite">
  <svg class="alert__icon" aria-hidden="true">…</svg>
  <div class="alert__body">
    <p class="alert__title">Inscrição confirmada</p>
    <p class="alert__msg">Você se inscreveu no edital SISU 2026.1.</p>
  </div>
</div>
```

### ARIA contract
- `role="alert"` + `aria-live="polite"` para info/success/warning
- `aria-live="assertive"` apenas em `danger` que exige atenção imediata
- **Não** use `role="alert"` em alerts decorativos não dinâmicos

---

## Card — `.card`

```html
<article class="card card--interactive" tabindex="0">
  <div class="card__header"><!-- tags + meta --></div>
  <h3 class="card__title">Título</h3>
  <p class="card__desc">Descrição</p>
  <div class="card__footer"><!-- ações --></div>
</article>
```

`card--interactive`: hover sobe a border-color para primary + shadow-1. Foco recebe o ring.

---

## Edital row — `.edital-row`

**Recomendação:** prefira lista (`.edital-row`) ao card grid em telas com >5 itens.
Melhor para leitores de tela e baixa visão.

```html
<article class="edital-row" role="listitem" tabindex="0">
  <div class="edital-row__body">
    <div class="edital-row__head">
      <span class="tag tag--solid tag--success">Inscrições abertas</span>
      <span class="card__meta">Edital 12/2026</span>
    </div>
    <h3 class="edital-row__title">SISU 2026.1</h3>
    <p class="edital-row__desc">…</p>
    <div class="edital-row__meta">…</div>
  </div>
  <div class="edital-row__actions">…</div>
</article>
```

Wrapper container precisa ter `role="list"`.

---

## Pager (cursor-based) — `.pager`

Documentado completamente em `docs/cursor-pagination.md`. **Nunca paginação numerada.**

```html
<nav class="pager" aria-label="Paginação">
  <button class="pager__btn" data-pager="prev" disabled aria-label="Página anterior">
    <svg/> Anterior
  </button>
  <span class="pager__status" aria-live="polite">
    <span class="pager__page">Página 1</span> · 20 resultados nesta página
  </span>
  <button class="pager__btn" data-pager="next" aria-label="Próxima página">
    Próximo <svg/>
  </button>
</nav>
```

---

## Status timeline — `.uni-timeline`

```html
<ol class="uni-timeline">
  <li class="uni-timeline__item is-<state>">       <!-- done | current | blocked | danger -->
    <div class="uni-timeline__dot">N | check</div>
    <div class="uni-timeline__body">
      <div class="uni-timeline__head">
        <h4 class="uni-timeline__title">Etapa</h4>
        <span class="uni-timeline__when">12 mar · 14:32</span>
      </div>
      <p class="uni-timeline__desc">…</p>
    </div>
  </li>
</ol>
```

Estados: `is-done` (verde, check), `is-current` (primary, número), `is-blocked` (cinza),
`is-danger` (vermelho, reprovação).

---

## Dialog / Modal / Bottom-sheet — `.uni-dialog`

`<dialog>` nativo. `.showModal()` faz focus trap automaticamente.

```html
<dialog class="uni-dialog" id="confirm-cancel" aria-labelledby="cc-title">
  <div class="uni-dialog__panel">
    <div class="uni-dialog__header">
      <h3 class="uni-dialog__title" id="cc-title">Cancelar inscrição?</h3>
      <button class="btn btn--tertiary btn--icon-only btn--rect" aria-label="Fechar">×</button>
    </div>
    <div class="uni-dialog__body">…</div>
    <div class="uni-dialog__footer">
      <button class="btn btn--tertiary">Voltar</button>
      <button class="btn btn--danger">Sim, cancelar</button>
    </div>
  </div>
</dialog>
```

Em mobile (<640px) vira bottom-sheet automaticamente.

---

## Drawer — `.uni-drawer`

Same nativeshell as Dialog, side-anchored. Acionado via `data-drawer-trigger`.

```html
<button data-drawer-trigger="user-drawer" aria-haspopup="dialog" aria-expanded="false">
  Menu
</button>

<dialog class="uni-drawer" id="user-drawer" aria-labelledby="drawer-title">
  <div class="uni-drawer__panel">
    <div class="uni-drawer__header">
      <h3 class="uni-drawer__title" id="drawer-title">Menu</h3>
      <button data-drawer-close aria-label="Fechar">×</button>
    </div>
    <div class="uni-drawer__body">…</div>
  </div>
</dialog>
```

`.uni-drawer--right` para ancorar à direita (padrão é à esquerda).

**`aria-expanded` é sincronizado INLINE no close handler**, não via evento `close`
do dialog. Razão: alguns browsers não disparam `close` confiável.

---

## Topbar / Gov.br stripe / Accessibility menu

Faixa institucional gov.br no topo + topbar da aplicação. As preferências de
acessibilidade ficam num **menu (disclosure) no header** — ver
[`.a11y-menu`](#accessibility-menu--a11y-menu) — não mais numa barra fixa
(ADR-0002).

```html
<!-- Gov.br stripe -->
<div class="gov-bar" role="region" aria-label="Identificação do Governo Federal">…</div>

<!-- Brand topbar (o botão de acessibilidade mora no slot de ações) -->
<header class="topbar" role="banner">
  <div class="topbar__brand">…</div>
  <nav class="topbar__nav" aria-label="Navegação principal">…</nav>
  <div class="topbar__actions">…</div>
</header>
```

### Contrato de responsividade e contraste

- `gov-bar`, `subnav` e superfícies inversas usam `--text-on-inverse` para
  texto, ícones, bordas de ação e hover. Não use `--color-neutral-0` para texto
  de header; no tema `contrast`, branco fixo quebra a hierarquia esperada
  porque o texto de header precisa virar amarelo.
- `.topbar__actions` é o slot canônico para busca, notificações, avatar, o botão
  de acessibilidade e demais botões de topo. Em telas estreitas, o user chip
  pode virar icon-only, mas precisa preservar `aria-label` com o nome/ação
  completos.

---

## Accessibility menu — `.a11y-menu`

Preferências de exibição (tema, alto contraste, fonte legível) acessadas por um
**botão no header** que abre um popover (desktop) / bottom-sheet (mobile). É o
padrão **disclosure** do WAI-APG — `button[aria-expanded][aria-controls]` →
`role="region"` — **não** um `role="menu"` (que é para comandos). Não-modal:
`Esc` fecha e devolve o foco ao gatilho; clique fora fecha. Decisão e fontes em
[ADR-0002](adrs/ADR-0002-acessibilidade-popover-e-controles-enxutos.md).

- **Não há controle de tamanho de fonte** — removido (ADR-0002), delegado ao
  zoom nativo do navegador, como e-MAG 3.1 e gov.br/ds. O popover traz uma dica
  de `Ctrl +` / `Ctrl −`.
- Tema é radio (`light`/`dark`/`auto`, com `auto` = `prefers-color-scheme`);
  contraste e fonte legível são toggles. Estado em `localStorage`, escrito como
  atributos no `<html>`.
- O `<html>` não deve depender de cor isolada: o `aria-pressed` dos `.a11y-opt`
  comunica o estado.

```html
<div class="a11y-menu" data-a11y-menu>
  <button class="a11y-menu__trigger" type="button"
          aria-expanded="false" aria-controls="a11y-popover-portal"
          aria-label="Preferências de acessibilidade" data-a11y-menu-trigger>
    <svg aria-hidden="true">…</svg>
  </button>
  <div class="a11y-menu__backdrop" hidden aria-hidden="true"></div>
  <div class="a11y-menu__popover" id="a11y-popover-portal"
       role="region" aria-label="Preferências de acessibilidade" hidden>
    <p class="a11y-menu__title">Acessibilidade</p>
    <div class="a11y-menu__group" role="group" aria-label="Tema">
      <span class="a11y-menu__group-label">Tema</span>
      <div class="a11y-menu__options">
        <button class="a11y-opt" data-a11y="theme" data-value="light" aria-pressed="false">…Claro</button>
        <button class="a11y-opt" data-a11y="theme" data-value="dark" aria-pressed="false">…Escuro</button>
        <button class="a11y-opt" data-a11y="theme" data-value="auto" aria-pressed="true">…Sistema</button>
      </div>
    </div>
    <div class="a11y-menu__group" role="group" aria-label="Ajustes de leitura">
      <span class="a11y-menu__group-label">Leitura</span>
      <div class="a11y-menu__options">
        <button class="a11y-opt" data-a11y="contrast" data-value="on" aria-pressed="false">…Alto contraste</button>
        <button class="a11y-opt" data-a11y="font-mode" data-value="legible" aria-pressed="false">Fonte legível</button>
      </div>
    </div>
    <p class="a11y-menu__hint">Para ampliar o texto, use o zoom do navegador (<kbd>Ctrl</kbd> <kbd>+</kbd> / <kbd>Ctrl</kbd> <kbd>−</kbd>).</p>
  </div>
</div>
```

Lógica em `uniplus-a11y.js` (abre/fecha + foco + Esc; contrato `data-a11y` no
`<html>`). Preview canônico: `preview/comp-a11y-menu.html`. Apps consumidores
podem adaptar em serviços próprios, desde que preservem persistência e o
contrato ARIA acima.

---

## Page header — `.page-header`

Cabeçalho canônico para página ou bloco principal: título, descrição opcional e
slot de ações à direita. No mobile, empilha conteúdo e ações.

```html
<div class="page-header">
  <div class="page-header__content">
    <h1 class="page-header__title">Painel de processos</h1>
    <p class="page-header__desc">Visão geral dos editais, inscrições e prazos.</p>
  </div>
  <div class="page-header__actions">
    <button class="btn btn--primary">Novo edital</button>
  </div>
</div>
```

Use `h1` uma vez por página. Em seções internas, mantenha a mesma anatomia com
`h2.page-header__title`.

---

## Breadcrumb — `.breadcrumb`

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="#" class="breadcrumb__link">Início</a></li>
    <li class="breadcrumb__item"><a href="#" class="breadcrumb__link">Editais</a></li>
    <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">SISU 2026.1</span></li>
  </ol>
</nav>
```

> 4 níveis: truncar com "…" (item com `aria-label="Níveis intermediários"`).
> Último item: `aria-current="page"`, não-interativo.

---

## Dropdown menu — `.menu`

```html
<div class="menu-wrapper">
  <button id="user-menu-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="user-menu">
    <span class="avatar">JF</span> Jeferson
  </button>
  <ul class="menu" role="menu" id="user-menu" aria-labelledby="user-menu-btn" hidden>
    <li class="menu__group-title" role="presentation">Conta</li>
    <li role="none"><a class="menu__item" role="menuitem" href="#">Meu perfil</a></li>
    <li class="menu__divider" role="separator"></li>
    <li role="none"><a class="menu__item menu__item--danger" role="menuitem">Sair</a></li>
  </ul>
</div>
```

### ARIA contract
- Trigger: `aria-haspopup="menu"` + `aria-expanded` + `aria-controls`
- Container: `role="menu"` + `aria-labelledby`
- Items: `role="menuitem"` em `<a>` ou `<button>`
- Group title: `role="presentation"` + classe
- Foco vai pro primeiro item ao abrir, Esc fecha + restaura foco no trigger, ↑↓ navegam, → entra em submenu (futuro)

---

## Toast — `UniToast.show()`

```typescript
UniToast.show({
  type: 'success' | 'warning' | 'danger' | 'info',
  title: string,
  message: string,
  duration: number,  // ms; 0 = sticky. Default 6000; danger é sempre sticky.
});
```

Regions auto-mounted:
- `aria-live="polite"` para success/warning/info
- `aria-live="assertive"` separada para danger

Apps consumidores podem encapsular `UniToast.show()` em serviços próprios, mas
o contrato público deste pacote é a API JavaScript acima e as regiões
`aria-live`.

---

## Carrossel — `.carousel`

**Manual sempre. Nunca auto-rotate (WCAG 2.2.2). Máximo 3 slides.**

```html
<div class="carousel" role="region" aria-roledescription="carousel" aria-label="Editais em destaque">
  <div class="carousel__viewport">
    <div class="carousel__track">
      <div class="carousel__slide" role="group" aria-roledescription="slide" aria-label="1 de 3: …">…</div>
      <!-- até 3 -->
    </div>
  </div>
  <div class="carousel__controls">
    <button class="carousel__nav" aria-label="Slide anterior" disabled>‹</button>
    <div class="carousel__dots" role="tablist">
      <button class="carousel__dot" role="tab" aria-current="true" aria-label="Slide 1: …"></button>
    </div>
    <span class="carousel__status" aria-live="polite">Slide 1 de 3</span>
    <button class="carousel__nav" aria-label="Próximo slide">›</button>
  </div>
</div>
```

Setas do teclado funcionam quando carrossel tem foco.

---

## Segmented control / View toggle — `.segmented`

```html
<div class="segmented" role="group" aria-label="Modo de visualização">
  <button class="segmented__btn" aria-pressed="true">Lista</button>
  <button class="segmented__btn" aria-pressed="false">Cards</button>
</div>
```

Radio behavior: apenas um ativo de cada vez. Persiste em `localStorage` se for preferência.

---

## Tabela responsiva mobile-first — `.table-responsive`

Wrapper canônico para tabelas administrativas. Em desktop renderiza como tabela;
em mobile cada `<tr>` vira card, usando `data-label` em cada `<td>`.

```html
<div class="table-responsive">
  <table>
    <thead>
      <tr><th>Edital</th><th class="table-responsive__num">Inscritos</th></tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Edital">
          <span class="table-responsive__primary">SISU 2026.1</span>
          <span class="table-responsive__meta">Edital 12/2026</span>
        </td>
        <td data-label="Inscritos" class="table-responsive__num">12.483</td>
      </tr>
    </tbody>
  </table>
</div>
```

Todo `<td>` precisa de `data-label`; sem isso, o card mobile perde contexto.
Use `.table-responsive__num` para números tabulares alinhados à direita.

---

## Stepper — `.stepper`

> **Limite de 5 passos (ADR-0001).** O stepper horizontal só é usado em fluxos
> com **até 5 passos**. Acima disso, use o [`.step-rail`](#step-rail--step-rail).
> O `.stepper` aplica `overflow-x: auto` como guard: se for usado com passos
> demais, rola na horizontal em vez de cortar o último passo — mas isso é
> degradação, não o uso pretendido.

Horizontal (≤ 5 passos), em desktop:

```html
<div class="stepper" aria-label="Etapas da inscrição">
  <div class="stepper__step is-done"><div class="stepper__dot is-done">1</div><span class="stepper__label">Dados</span></div>
  <div class="stepper__bar is-done"></div>
  <div class="stepper__step is-current"><div class="stepper__dot is-current">2</div><span class="stepper__label">Contato</span></div>
  …
</div>
```

`stepper--vertical` é a variante vertical simples para poucos passos:

```html
<div class="stepper stepper--vertical" aria-label="Etapas da inscrição">
  <div class="stepper__step is-done"><div class="stepper__dot is-done">1</div><span class="stepper__label">Dados pessoais</span></div>
  <div class="stepper__bar is-done"></div>
  <div class="stepper__step is-current"><div class="stepper__dot is-current">2</div><span class="stepper__label">Contato</span></div>
</div>
```

Preview canônico: `preview/comp-stepper.html`.

---

## Step rail — `.step-rail`

Navegação vertical de etapas para **fluxos longos (> 5 passos)** — ex.: o wizard
de inscrição de 12 etapas. No desktop (≥768px) aparece como coluna lateral; em
telas estreitas (inclusive 320px) colapsa em um cabeçalho textual **"Etapa X de
N"** + nome do passo atual + barra de progresso, com a lista completa em
*progressive disclosure* via `<details>` (sem JS).

- Marque o passo corrente com `aria-current="step"` no `.step-rail__step`.
- O marcador (`.step-rail__marker`) é decorativo (`aria-hidden`): o estado é
  comunicado pelo texto e por `aria-current`, não só pela cor (e-MAG/WCAG 1.4.1).
- O cabeçalho mobile (`.step-rail__summary`) é o `<summary>` do `<details>` —
  acessível por teclado nativamente.

A lista (`.step-rail__content`) é **irmã** do `<details>`, não filha: o
`<details>` contém apenas o `<summary>` (toggle do mobile) e a visibilidade da
lista é controlada por `[open] ~`. Isso evita depender do mecanismo interno do
`<details>` (`content-visibility` / `::details-content`), cujo comportamento
varia entre navegadores.

```html
<nav class="step-rail" aria-label="Etapas da inscrição">
  <details class="step-rail__mobile">
    <summary class="step-rail__summary" aria-controls="step-list">
      <span class="step-rail__summary-count">Etapa 3 de 12</span>
      <span class="step-rail__summary-name">Endereço</span>
      <span class="step-rail__progress" aria-hidden="true"><span style="width:25%"></span></span>
      <svg class="step-rail__chevron" viewBox="0 0 24 24" …><path d="M6 9l6 6 6-6"/></svg>
    </summary>
  </details>
  <div class="step-rail__content" id="step-list">
    <p class="step-rail__title">Passos</p>
    <ol class="step-rail__list">
      <li class="step-rail__step is-done"><span class="step-rail__marker" aria-hidden="true"><svg …/></span><span class="step-rail__label">Dados</span></li>
      <li class="step-rail__step is-current" aria-current="step"><span class="step-rail__marker" aria-hidden="true">3</span><span class="step-rail__label">Endereço</span></li>
      <li class="step-rail__step"><span class="step-rail__marker" aria-hidden="true">4</span><span class="step-rail__label">Escolaridade</span></li>
      …
    </ol>
  </div>
</nav>
```

Previews canônicos: `preview/comp-step-rail.html` e `preview/pattern-wizard.html`.

---

## Sidebar colapsável (Admin)

Sidebar administrativa canônica para painéis CEPS/CRCA. No desktop ela pode ser
colapsada; no mobile ela abre como off-canvas modal leve, com backdrop e gestão
de foco.

```html
<div class="admin-shell" id="admin-shell">
  <aside class="sidebar" id="admin-sidebar" aria-label="Navegação lateral">
    <div class="sidebar__brand">
      <div class="sidebar__mark" aria-hidden="true">U+</div>
      <div>
        <div class="sidebar__brand-title">Uni+ Admin</div>
        <div class="sidebar__brand-sub">CEPS · Seleção</div>
      </div>
      <button class="sidebar__close" type="button"
              aria-label="Fechar menu lateral" data-sidebar-close>
        <svg aria-hidden="true">…</svg>
      </button>
    </div>

    <div class="sidebar__label">Painéis</div>
    <a href="#" class="is-active" data-tooltip="Painel de processos"
       data-tooltip-position="right" aria-label="Painel de processos">…</a>

    <div class="sidebar__bottom">
      <div class="avatar avatar--sm">JF</div>
      <div class="sidebar__user-info">
        <strong>Jeferson</strong>
        <span>Administrador</span>
      </div>
    </div>
  </aside>

  <div class="sidebar-backdrop" aria-hidden="true" data-sidebar-close></div>

  <header class="admin-header">
    <button class="sidebar-toggle" type="button"
            aria-label="Abrir menu lateral"
            aria-expanded="false" aria-controls="admin-sidebar">
      …
    </button>
  </header>
</div>
```

### Desktop

- O estado colapsado pertence ao app consumidor; persista a preferência em
  storage local e reflita em `data-sidebar="collapsed"` no shell. A ausência
  desse atributo representa o estado expandido.
- O avatar do footer permanece visível quando colapsado. O texto do usuário
  usa `.sidebar__user-info` e pode ser ocultado visualmente pelo CSS.
- Use `[data-tooltip]` em itens icon-only quando a sidebar estiver colapsada,
  mantendo `aria-label` ou texto acessível equivalente.

### Mobile

- O mesmo botão de menu abre o off-canvas com `data-sidebar-mobile="open"` no
  shell e `aria-expanded="true"` no trigger.
- A sidebar deve ter `id` estável referenciado por `aria-controls`.
- O backdrop e o botão interno de fechar usam `data-sidebar-close`; a
  visibilidade do backdrop vem do estado `data-sidebar-mobile="open"`.
- Ao abrir, mova foco para o botão de fechar ou primeiro item navegável; ao
  fechar por clique, Escape ou backdrop, restaure foco para o trigger.
- Enquanto aberta, marque as regiões de conteúdo atrás da sidebar com `inert`
  e `aria-hidden="true"`; remova ambos ao fechar.
- A ordem visual não pode provocar overflow horizontal em 320/375px.

Tooltip on hover quando colapsada via CSS `[data-tooltip]:hover::after`.

---

## File uploader — `.uni-uploader`

Drag-and-drop + button trigger + lista com progress + error states. Spec completa
em `preview/comp-uploader.html`.

---

## Back-to-top — `.uni-back-to-top`

Floating action. Aparece após 400px scroll. Auto-mounted via `uniplus-backtotop.js`.

Inicie o botão com `hidden`: o script alterna `hidden` conforme o scroll (fonte de
verdade para presença), usa `.is-visible` apenas para o fade visual e mantém
`aria-hidden`/`tabindex` coerentes. Nenhum CSS adicional é necessário.

```html
<button class="uni-back-to-top" data-back-to-top type="button" hidden
        aria-label="Voltar ao topo da página">
  <svg aria-hidden="true"><!-- seta para cima --></svg>
</button>
```

---

## Empty state

```html
<div class="empty-state" role="status">
  <div class="empty-state__icon" aria-hidden="true"><svg/></div>
  <h3 class="empty-state__title">Você ainda não tem inscrições</h3>
  <p class="empty-state__desc">Veja os editais abertos e escolha um para começar.</p>
  <button class="btn btn--primary">Ver editais abertos</button>
</div>
```

> **Variante de erro de rede:** adicionar `empty-state--error` no container. Ícone vira danger, título vira danger-700. Botão passa a "Tentar de novo".
>
> Cobertura: preview/comp-empty.html.

---

## Avatar — `.avatar`

```html
<span class="avatar avatar--<size>">JF</span>    <!-- initial -->
<span class="avatar"><img src="…" alt=""></span>  <!-- foto -->
```

Sizes: `avatar--sm` (32), default (40), `avatar--lg` (56).
Cor da inicial é determinística quando o app consumidor fornece uma função de
hash estável para o nome exibido.

---

## Divider — `.divider`

`<hr class="divider">` ou `.divider--vertical` em flex containers.

---

## Skeleton loader — `.skeleton`

```html
<div class="skeleton skeleton--text" aria-hidden="true" style="width: 240px"></div>
<div class="skeleton skeleton--card" aria-hidden="true"></div>
```

Gradient de `--skeleton-from` → `--skeleton-to` (theme-aware desde F-003). Em
`prefers-reduced-motion`, animação some e o background fica estático.

**Modifiers:**
- `--text` (1em, margin-block 0.25em)
- `--title` (1.5em, width 60%)
- `--circle` (radius circle)
- `--card` (height 120px, radius lg)

Use dentro de wrapper com `aria-busy="true"` + `aria-label="Carregando"`.

---

## Tooltip — `[data-tooltip]`

```html
<button data-tooltip="Recolher menu"
        data-tooltip-position="right"
        aria-label="Recolher menu">
  <svg/>
</button>
```

Posições suportadas: `top` (default), `bottom`, `left`, `right`.
NUNCA substitui `aria-label` em icônico-only — mantenha ambos para leitores de tela.

---

## Spinner — `.spinner`

```html
<span class="spinner" role="status" aria-label="Carregando"></span>
```

Indeterminado. Sizes: `--sm` (14px), `--md` (20px), `--lg` (32px). Em `prefers-reduced-motion`
roda mais devagar em vez de parar (ainda precisa indicar atividade).

Dentro de botão, use `<button class="btn" data-loading="true">…<span class="spinner"></span></button>` —
o CSS preserva a largura do botão e troca o conteúdo.

---

## Padrões compostos (não-componentes — composição)

### Filter bar
Documentado em `preview/comp-filter-bar.html`. Use `.filter-bar` + `.filter-chip` +
`.input-group` para search. **Sempre `role="search"` no container.**

### Error summary
Documentado em `preview/comp-form-validation.html`. Auto-gerado por `UniForm.applyErrors()`.

### KPI card
```html
<div class="kpi"><span class="kpi__label">EDITAIS ATIVOS</span><span class="kpi__num">12</span><span class="kpi__delta">↑ 2</span></div>
```
**Único lugar com UPPERCASE permitido** (eyebrow). Números com `font-variant-numeric: tabular-nums`.

---

## O que vem por aí (backlog priorizado)

Pós-auditoria (25 mai 2026). Skeleton, Spinner e Empty-state já saíram do TODO
(F-023, F-041). Restantes:

1. **DatePicker** — pattern para consumo de PrimeNG Calendar + passthrough
2. **Combobox / Autocomplete** — combobox pattern WAI-ARIA
3. **Confirmation destrutiva** — modal + "type DELETE"
4. **Cookie banner LGPD** — consentimento obrigatório
5. **GovBrButton** — login oficial com selo
6. **Stepper vertical** mobile (12+ passos do wizard)
7. **Toast queue limit** (max 3 visíveis)
8. **Self-host das fontes** (F-011 — LGPD)
9. **Tema `contrast` validado com usuários reais do NAIA**
10. **Stylelint config materializado** (F-044)
