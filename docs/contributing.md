# CONTRIBUTING — Uni+ Design System

> Guia operacional pra quem vai codar o frontend. Leia ANTES de abrir o
> primeiro PR. Toda decisão arquitetural não-óbvia é uma ADR — ler
> `uniplus-web/docs/adrs/` antes de divergir.

---

## Estrutura

```
libs/shared-ui/src/styles/
  tokens.css           ← design tokens (cores, espaço, type, motion)
  base.css             ← reset + utilitários a11y + tipografia
  components.css       ← CSS dos componentes (BEM)
  uniplus-a11y.js      ← AccessibilityBar runtime
  uniplus-toast.js     ← UniToast API
  uniplus-form.js      ← UniForm validation + CPF mask
  uniplus-backtotop.js ← back-to-top runtime

libs/shared-ui/src/lib/components/
  <kebab-name>/        ← um folder por componente Angular standalone
    <name>.ts
    <name>.html        (opcional, prefiro template inline)
    <name>.spec.ts
    index.ts
```

Em produção, `apps/portal/src/styles.css` faz:

```css
@import 'tailwindcss';
@import '@uniplus/shared-ui/styles/tokens.css';
@import '@uniplus/shared-ui/styles/base.css';
@import '@uniplus/shared-ui/styles/components.css';

@theme inline {
  --color-primary: var(--color-primary);
  --color-primary-600: var(--color-primary-600);
  --color-primary-800: var(--color-primary-800);
  --color-surface-page: var(--surface-page);
  --color-surface-card: var(--surface-card);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-border: var(--border-default);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --font-sans: var(--font-sans);
}
```

---

## Como adicionar um novo componente

### 1. Decida se ele precisa existir

Antes de criar, verifique:

- Existe no `@govbr-ds/core`? Use o oficial.
- Existe no PrimeNG? Use a versão unstyled + PassThrough nossa.
- Já existe um componente nosso que cobre 80%? Estenda em vez de duplicar.

### 2. Escreva o CSS primeiro (no `components.css`)

```css
/* ============================================================================
 * <NOME COMPONENTE>
 * Pattern: <descreva o markup esperado>
 * ARIA: <listar role/aria-* obrigatórios>
 * ========================================================================== */
.uni-<componente> {
  /* base */
}
.uni-<componente>__<elemento> { /* part */ }
.uni-<componente>--<variante> { /* modifier */ }
```

Regras:
- **Tokens, nunca hex literal.** `var(--color-primary)`, não `#1351b4`.
- **Mobile-first.** Estado base = 360px. `@media (min-width: …)` aditivo.
- **Estados completos:** default, hover, focus-visible, active, disabled.
- **`min-height: var(--touch-min)`** em qualquer interativo.
- **Sem `:focus`**, só `:focus-visible`. (Já coberto por `base.css` em fallback.)
- **`prefers-reduced-motion`**: animações condicionais ou usar `--duration-*`.

### 3. Adicione um preview card

`preview/comp-<nome>.html` — copia o template dos cards existentes.
Register em `register_assets` no Design System tab.

### 4. Escreva o componente Angular standalone

```typescript
// libs/shared-ui/src/lib/components/edital-row/edital-row.ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ptl-edital-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="edital-row" tabindex="0" (keydown.enter)="open.emit()">
      <div class="edital-row__body">
        <div class="edital-row__head">
          <ptl-tag [variant]="edital().statusTag" solid>{{ edital().statusLabel }}</ptl-tag>
          <span class="card__meta">{{ edital().numero }}</span>
        </div>
        <h3 class="edital-row__title">{{ edital().titulo }}</h3>
        <p class="edital-row__desc">{{ edital().descricao }}</p>
      </div>
      <div class="edital-row__actions">
        <a [routerLink]="['/editais', edital().id]">Ver edital</a>
        <button class="btn btn--primary" (click)="inscrever.emit()">Inscrever-me</button>
      </div>
    </article>
  `,
})
export class EditalRowComponent {
  edital = input.required<Edital>();
  open = output<void>();
  inscrever = output<void>();
}
```

Regras Angular:
- **Standalone sempre.** Sem `NgModule`.
- **Signals**: `input.required<T>()`, `input<T>(default)`, `output<T>()`, `signal()`, `computed()`, `effect()`.
- **`ChangeDetectionStrategy.OnPush`** sempre.
- **Selector prefix `ptl-`** (Portal) / `slc-` (Seleção) / `ing-` (Ingresso) / `ui-` (shared). Definido em ADR-0014.
- **Template inline** quando ≤ 60 linhas. HTML separado quando > 60.
- **Estilos inline com `@apply` ou utility classes** quando o componente reusa apenas tokens. Evite arquivo `.css` próprio — o `components.css` global cobre.
- **`(click)` evita; prefira semânticos**: `<button>` ou `<a>` reais sempre. Evite `(click)` em `<div>`.

### 5. Teste

Lint CSS na raiz do design system:

```bash
npm run lint:css
npm run lint:css:fix
```

O hook `.husky/pre-commit` roda `npx lint-staged`, aplicando `stylelint --fix`
nos arquivos `*.css` staged.

```typescript
describe('EditalRowComponent', () => {
  it('renders title and meta from input', () => { /* … */ });
  it('emits inscrever on button click', () => { /* … */ });
  it('emits open on Enter when row is focused', () => { /* … */ });
  it('has aria-label that includes status', () => { /* … */ });
});
```

Cobertura mínima:
- Render dos inputs principais
- Cada `output` emitindo
- Keyboard interaction (Enter, Space, Esc onde aplicável)
- ARIA attrs presentes
- Diferença visual entre states (hover/focus visualmente) — usar Storybook ou Playwright snapshot

### 6. Abra PR usando o template (próxima seção)

---

## PR template

```markdown
## O que muda

- [ ] Novo componente: `<nome>` em `libs/shared-ui/src/lib/components/<nome>/`
- [ ] CSS adicionado a `components.css`
- [ ] Preview card em `preview/comp-<nome>.html`
- [ ] Documentação em `docs/component-api.md` atualizada
- [ ] ADR (se decisão arquitetural não-óbvia): `docs/adrs/NNNN-<slug>.md`

## Checklist

### Design
- [ ] Mobile-first (testado em 360 / 768 / 1024 / 1280)
- [ ] Tokens, sem hex literal
- [ ] Estados completos: default, hover, focus-visible, active, disabled
- [ ] Sombras restritas (border default, shadow apenas em overlays)

### Acessibilidade
- [ ] Touch target ≥ 44×44 em todo interativo
- [ ] Foco visível (3px solid `var(--focus-ring-color)`)
- [ ] ARIA contract documentado (role, aria-*, aria-live, focus management)
- [ ] Testado com leitor de tela (NVDA Windows / VoiceOver macOS)
- [ ] `prefers-reduced-motion` honrado
- [ ] WCAG 2.1 AA piso, AAA onde viável
- [ ] Contraste documentado em `docs/contrast.md`

### Performance
- [ ] OnPush
- [ ] Sem `effect()` sem cleanup quando inscreve em observable
- [ ] Imagens otimizadas (`<img loading="lazy" decoding="async">`)
- [ ] `track` em `@for`

### Conteúdo
- [ ] Copy em pt-BR institucional acolhedor
- [ ] Sentence case (UPPERCASE só em KPI eyebrow / tag solid)
- [ ] LGPD: sem PII em telas públicas

### Tests
- [ ] Unit ≥ 80% lines
- [ ] E2E (Playwright) cobrindo o happy path
- [ ] a11y (axe DevTools) sem violations sérias/críticas
- [ ] Snapshot (light + dark + contrast themes)
```

---

## Convenções

### Naming

- **Arquivos**: `kebab-case` (`edital-row.ts`, `comp-edital-row.html`)
- **Classes CSS**: `kebab-case` BEM (`.edital-row__body`, `.btn--primary`)
- **Componentes Angular**: `PascalCase` + sufixo `Component` (`EditalRowComponent`)
- **Selectors**: `ptl-edital-row` (kebab + prefix)
- **CSS custom properties**: `--<categoria>-<escala>` (`--color-primary-600`, `--space-4`)
- **Tipos branded**: `Cursor`, `EditalId`, `Cpf` em `shared-core/types`

### Copy

| Estado | Padrão | Exemplo |
|---|---|---|
| Botão de ação | Verbo curto | "Inscrever-me", "Salvar" |
| Confirmação destrutiva | Verbo + objeto | "Sim, cancelar inscrição" |
| Erro de campo | O quê + como corrigir | "CPF inválido. Verifique os números." |
| Vazio | Reconhecer + ação | "Você ainda não tem inscrições. Veja os editais abertos." |
| Carregando | Gerundio | "Carregando seus editais…" |
| Tooltip | Conciso | "Recolher menu" |

**Nunca:** "Submeter", "Popular", "Validar credenciais", emoji, "Caro usuário".

### Commits

Padrão Conventional Commits:

```
feat(shared-ui): add ptl-edital-row component
fix(portal): drawer aria-expanded not syncing on close
docs: add cursor-pagination guide
style(shared-ui): tokens — slate-based dark theme
test(shared-ui): add a11y assertions for dropdown menu
```

---

## A11y testing

### Manual

1. **Tab pela tela inteira sem mouse.** Toda ação importante deve ser
   alcançável e visível em foco.
2. **NVDA (Windows) ou VoiceOver (macOS)** — leia a tela toda do começo ao fim.
   Hierarquia de headings (H1 → H2 → H3) deve fazer sentido. Landmarks
   (`header`, `nav`, `main`, `footer`) anunciados.
3. **Zoom 200%** — Chrome → Ctrl++ várias vezes. Nada deve quebrar.
4. **Daltonismo** — Chrome DevTools → Rendering → Emulate vision deficiencies →
   `Deuteranopia`, `Protanopia`, `Tritanopia`. Status nunca pode depender só de cor.

### Automatizado

- **Playwright + axe-core** em cada PR — sem violations sérias/críticas.
- **Stylelint** garantindo tokens (regex em `--color-`, fail em hex hardcoded em `.ts` / `.html`).

### Personas para revisar mentalmente

Reler briefing-ux.md §4. Se a decisão não passa por Dona Marta (62, glaucoma),
Lucas (19, dislexia), Sr. Pedro (70, cataratas), Ana (28, só teclado),
Carla (35, NVDA + zoom), João (24, daltônico) — refazer.

---

## Onde pedir ajuda

- **Design questions** → ler `briefing-ux.md` + `docs/component-api.md`. Em
  caso de gap, abrir issue.
- **A11y duvidoso** → `docs/contrast.md` + axe DevTools. Em último caso,
  parceria com o NAIA da Unifesspa para teste com usuários reais.
- **ADRs** → `docs/adrs/`. Toda decisão não-óbvia precisa ser registrada.
- **Cursor pagination** → `docs/cursor-pagination.md`.
- **Discussões maiores** → email institucional + Google Chat.
