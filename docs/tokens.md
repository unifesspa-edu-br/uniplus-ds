# Token reference — Uni+ Design System

> Toda CSS custom property exposta por `tokens.css`. Use por nome,
> nunca hardcode hex/px. Tokens flutuam por tema; valores aqui são da
> paleta **light** (default).

---

## Brand — Gov.br azul institucional

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-primary` | `#1351b4` | `#60a5fa` | alias do 600, default em CTAs |
| `--color-primary-50` | `#f0f5ff` | `#1e293b` | banner tint, hover suave |
| `--color-primary-100` | `#d6e4ff` | `#1e3a5f` | hover tint forte |
| `--color-primary-200` | `#adc6ff` | — | borda ativa em outline btn |
| `--color-primary-500` | `#2670e8` | `#60a5fa` | acent vivo |
| `--color-primary-600` | `#1351b4` | `#60a5fa` | **PRIMARY** — fundo de CTA |
| `--color-primary-700` | `#0c4194` | `#3b82f6` | fundo de hover do primary |
| `--color-primary-800` | `#0c326f` | `#2563eb` | fundo escuro / active, sidebar admin |
| `--color-primary-900` | `#071d41` | `#1e3a8a` | gov.br topbar background |

> ⚠️ A escala primary é **superfície/fundo** — vira azul escuro no dark. Para
> **texto** use os tokens semânticos: `--text-link` (links), `--text-heading`
> (h1/h2), `--text-on-primary-tint` (texto sobre tint `--color-primary-50`).
> Reusar a escala como cor de texto reprova AA no dark (`#2563eb`/`#3b82f6`
> sobre `#1e293b` ≈ 2.8–3.9:1).

---

## Neutros

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-neutral-0`   | `#ffffff` | — | branco puro |
| `--color-neutral-50`  | `#f8fafc` | — | page background |
| `--color-neutral-100` | `#f1f5f9` | — | hover background, inset |
| `--color-neutral-200` | `#e2e8f0` | — | border-subtle |
| `--color-neutral-300` | `#cbd5e1` | — | form border |
| `--color-neutral-400` | `#94a3b8` | — | muted strong |
| `--color-neutral-500` | `#8899a8` | — | text secondary (AA on white) |
| `--color-neutral-600` | `#64748b` | — | text medium |
| `--color-neutral-700` | `#475569` | — | text strong |
| `--color-neutral-800` | `#333333` | — | text primary |
| `--color-neutral-900` | `#181f2d` | — | text on light, fallback |
| `--color-neutral-950` | `#0a1628` | — | quase preto |

---

## Feedback

Cada cor tem **3 níveis**: `50` (tint, background), `600` (dot/icon), `700` (text on tint).

| Família | 50 (bg) | 600 (dot) | 700 (text on bg) | -solid (white-text bg) |
|---|---|---|---|---|
| success | `#e7f4e9` | `#168821` | `#0a5a16` | `#168821` |
| warning | `#fef0c8` | `#c2850c` | `#5a3e08` | `#845a0a` |
| danger  | `#fcf0ee` | `#e52207` | `#c92a2a` | `#c92a2a` |
| info    | `#eff6ff` | `#2565ae` | `#0c326f` | `#1351b4` |

**`-solid` tokens permanecem escuros em ambos os temas** para garantir
≥ 4.5:1 com texto branco — usados em `.tag--solid` e em qualquer fundo
de feedback que comporte texto branco.

---

## Surfaces (semânticas — flutuam por tema)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--surface-page` | `#f8fafc` | `#0f172a` | body background |
| `--surface-card` | `#ffffff` | `#1e293b` | cards, modais (uso básico) |
| `--surface-elevated` | `#ffffff` | `#28344a` | **NOVO (F-013)** — modal, drawer, dropdown, tooltip |
| `--surface-subtle` | `#f1f5f9` | `#334155` | hover, inset, filter chips |
| `--surface-banner` | `#eff6ff` | `#1e2945` | hero / carrossel slide (F-008: distinto de card no dark) |
| `--surface-inverse` | `#071d41` | `#020617` | gov.br topbar, footer escuro |
| `--surface-overlay` | `rgba(7,29,65,.55)` | `rgba(0,0,0,.55)` | dialog backdrop (F-033: menos opaco no dark) |
| `--surface-disabled` | `#e2e8f0` | `#2d3a52` | **NOVO (F-002)** — fundo de botão/input desabilitado |
| `--surface-accessibility-bar` | `#0b2754` | `#050b1c` | **NOVO (F-020)** — fundo da barra de acessibilidade |

> **Implementação:** os pares acima usam `light-dark()` em `tokens.css`,
> alimentado por `color-scheme` em `:root`. Não existe mais bloco dark
> duplicado (F-007 resolvido).

---

## Borders

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--border-subtle` | `#e2e8f0` | `#3f4d65` | dividers, card border (F-032: subido no dark) |
| `--border-default` | `#cbd5e1` | `#475569` | input border, modal |
| `--border-strong` | `#64748b` | `#94a3b8` | input hover (F-006 fechado: era `#94a3b8`/2.7:1 no light) |

---

## Text

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--text-primary` | `#333333` | `#f1f5f9` | corpo, default |
| `--text-secondary` | `#5b6b7d` | `#cbd5e1` | secundário (F-010: era `#8899a8` 4.6:1, agora 5.6:1) |
| `--text-muted` | `#64748b` | `#94a3b8` | captions, hint (F-010: era `#94a3b8` 3.4:1, agora 4.8:1) |
| `--text-placeholder` | `#94a3b8` | `#94a3b8` | **NOVO (F-010)** — placeholder de input (3:1 floor para UI) |
| `--text-disabled` | `#94a3b8` | `#64748b` | **NOVO (F-002)** — texto em controle desabilitado |
| `--text-on-primary` | `#ffffff` | `#0f172a` | texto sobre primary |
| `--text-on-inverse` | `#ffffff` | `#ffffff` | texto sobre surface-inverse |
| `--text-heading` | `#0c326f` | `#dbe9ff` | h1 / h2 — **desacoplado** de `--color-primary-800` (que vira `#2563eb` no dark, 2.8:1) |
| `--text-title-soft` | `#2565ae` | `#93c5fd` | titles em destaque suave |
| `--text-link` | `#1351b4` | `#93c5fd` | links inline |
| `--text-on-primary-tint` | `#0c4194` | `#93c5fd` | **NOVO** — texto/realce sobre tint `--color-primary-50` (chips, drawer ativo, hover `.btn--secondary`) |

> **Tokens de texto não aliasam a escala.** `--text-heading`/`-link`/`-title-soft`
> e `--text-on-primary-tint` são pares `light-dark()` explícitos. A escala
> `--color-primary-600/700/800` flipa para azul escuro no dark porque serve de
> **fundo** (botões, gov-bar); reusá-la como texto reprovava AA no dark.

**AAA-safe alternative:** as combinações default agora passam AA com folga
depois do F-010. Para >7:1 explicitamente (ex.: legal text), use
`--text-heading` (13.4:1 vs branco) ou tokenize um novo `--text-aaa` em
ADR antes de espalhar.

---

## Focus ring

| Token | Light | Dark |
|---|---|---|
| `--focus-ring-color` | `#3b82f6` | `#93c5fd` |
| `--focus-ring-width` | `3px` | `3px` |
| `--focus-ring-offset` | `2px` | `2px` |
| `--focus-ring` (composite) | `0 0 0 3px #3b82f6` | `0 0 0 3px #93c5fd` |

Aplicado automaticamente em `:focus-visible` por `base.css`.

---

## Typography

### Family
| Token | Valor | Uso |
|---|---|---|
| `--font-sans` | `Inter, system-ui, …` | corpo, headings |
| `--font-mono` | `JetBrains Mono, ui-monospace, …` | CPF, edital ID, código |

### Size — fluido com `clamp()`
| Token | Mobile (360) | Desktop (≥1440) | Uso |
|---|---|---|---|
| `--text-xs` | `12px` | `12px` | caption, tag |
| `--text-sm` | `14px` | `14px` | body small, metadado |
| `--text-base` | `16px` | `16px` | **body default** |
| `--text-md` | `16px` | `18px` | lead, subhero |
| `--text-lg` | `18px` | `20px` | h4 |
| `--text-xl` | `20px` | `24px` | h3 |
| `--text-2xl` | `24px` | `32px` | h2 |
| `--text-3xl` | `30px` | `40px` | h1 |
| `--text-4xl` | `36px` | `48px` | hero |

### Line-height
| Token | Valor | Uso |
|---|---|---|
| `--leading-tight` | `1.15` | display |
| `--leading-snug` | `1.3` | h3-h4 |
| `--leading-normal` | `1.5` | body (WCAG 1.4.12) |
| `--leading-relaxed` | `1.6` | lead, prose longa |

### Weight
`--weight-regular` 400 · `--weight-medium` 500 · `--weight-semibold` 600 · `--weight-bold` 700

---

## Spacing — multiples of 4

| Token | Valor (rem / px) |
|---|---|
| `--space-0` | 0 |
| `--space-1` | 0.25 / 4 |
| `--space-2` | 0.5 / 8 |
| `--space-3` | 0.75 / 12 |
| `--space-4` | 1 / 16 |
| `--space-5` | 1.25 / 20 |
| `--space-6` | 1.5 / 24 |
| `--space-7` | 2 / 32 |
| `--space-8` | 2.5 / 40 |
| `--space-9` | 3 / 48 |
| `--space-10` | 4 / 64 |
| `--space-11` | 6 / 96 |

### Exceções tokenizadas (F-028)

| Token | Valor | Uso |
|---|---|---|
| `--space-half-2` | 0.375 / 6 | gap em chip/tag/segmented |
| `--space-half-3` | 0.625 / 10 | padding-inline em chip/tag |

Usadas apenas onde a grid de 4 é grossa demais para o componente — typically
chips, tags, pequenos pills. Nada além disso fora da escala. Se você precisa
de 22px, está usando mal.

---

## Radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 2px | divider, micro |
| `--radius-sm` | 4px | inputs |
| `--radius-md` | 8px | dialogs, alerts |
| `--radius-lg` | 12px | cards |
| `--radius-xl` | 16px | hero, banner |
| `--radius-pill` | 9999px | botões primary, tags |
| `--radius-circle` | 50% | avatars, icon-only buttons |

---

## Elevation (shadows)

Restritas. **Default = border-subtle, sombra apenas em overlays.**

| Token | Uso | Notas |
|---|---|---|
| `--shadow-1` | hover de cards | dark adiciona ring sutil (F-014) |
| `--shadow-2` | dropdown, toast | dark: shadow + ring de luz para profundidade |
| `--shadow-3` | modal, drawer | dark idem |

No tema escuro, as sombras combinam um dim escuro com um ring sutil de luz
(`0 0 0 1px rgba(255,255,255,.06)`) — sem isso a sombra preta some sobre o
fundo já escuro.

---

## Component-scoped tokens (NOVOS — pós-auditoria)

Tokens introduzidos pela auditoria 25-mai-2026 para destravar F-002/003/004.
Componentes consomem estes em vez de `--color-neutral-*` direto.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--avatar-bg` | `#d6e4ff` | `color-mix(primary 28%, slate-800)` | F-004 |
| `--avatar-fg` | `#0c326f` | `#ffffff` | F-004 |
| `--skeleton-from` | `#f1f5f9` | `#2d3a52` | F-003 (gradient stop A) |
| `--skeleton-to` | `#e2e8f0` | `#3f4d68` | F-003 (gradient stop B) |

**Regra:** componente nunca referencia `--color-neutral-*` direto. Sempre
passa por um token semântico (`--surface-*`, `--text-*`, `--border-*`,
`--avatar-*`, `--skeleton-*`).

---

## Touch targets

| Token | Valor | Uso |
|---|---|---|
| `--touch-min` | 44px | piso (WCAG 2.5.5 AAA) |
| `--touch-comfortable` | 48px | botões primary em mobile |

---

## Layout

| Token | Valor | Uso |
|---|---|---|
| `--measure-prose` | 70ch | max line-length em texto longo (WCAG 1.4.8) |
| `--content-max` | 1200px | container default |
| `--content-narrow` | 640px | login, forms |

---

## Motion

| Token | Valor |
|---|---|
| `--duration-fast` | 120ms |
| `--duration-base` | 200ms |
| `--duration-slow` | 320ms |
| `--ease-standard` | `cubic-bezier(.2, 0, .38, .9)` |
| `--ease-emphasized` | `cubic-bezier(.2, 0, 0, 1)` |

**Sempre dentro de `@media (prefers-reduced-motion: no-preference)`** ou condicionalmente
desligadas por `prefers-reduced-motion: reduce` — `base.css` já cobre globalmente.

---

## Z-index ladder

| Token | Valor | Uso |
|---|---|---|
| `--z-base` | 0 | default |
| `--z-sticky` | 10 | back-to-top, sticky headers |
| `--z-overlay` | 100 | dropdowns, popovers |
| `--z-modal` | 1000 | modais, drawer |
| `--z-toast` | 1100 | toasts (acima de modal) |

---

## Theme attributes (no `<html>`)

| Atributo | Valores | Efeito |
|---|---|---|
| `data-theme` | `auto` (default) / `light` / `dark` / `contrast` | tema visual |
| `data-font-scale` | `md` (default) / `lg` / `xl` / `2xl` | font-size root |
| `data-font-mode` | `default` (default) / `legible` | Atkinson Hyperlegible (futuro) |

Aplicados por `uniplus-a11y.js` baseados em escolhas do usuário (persiste em
`localStorage`). Em produção, vira `A11yService` Angular.

`data-theme="auto"` segue `prefers-color-scheme` do sistema. `data-theme="contrast"`
sobrescreve dark/light enquanto ativo.

---

## Tailwind 4/5 — `@theme inline` bridge

```css
@theme inline {
  --color-primary:        var(--color-primary);
  --color-primary-600:    var(--color-primary-600);
  --color-primary-800:    var(--color-primary-800);
  --color-surface-page:   var(--surface-page);
  --color-surface-card:   var(--surface-card);
  --color-text-primary:   var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-heading:   var(--text-heading);
  --color-border:         var(--border-default);
  --color-border-subtle:  var(--border-subtle);
  --radius-md:            var(--radius-md);
  --radius-lg:            var(--radius-lg);
  --radius-pill:          var(--radius-pill);
  --spacing-1:            var(--space-1);
  --spacing-4:            var(--space-4);
  --spacing-6:            var(--space-6);
  --font-sans:            var(--font-sans);
  --font-mono:            var(--font-mono);
}
```

Depois use em template: `bg-surface-card text-text-primary border-border rounded-md`.

---

## Lint rules (Stylelint)

Arquivo materializado em `.stylelintrc.json` na raiz (F-044). Resumo:

```json
{
  "rules": {
    "color-no-hex": [true, { "message": "Use --color-* tokens. Hex hardcoded é proibido." }],
    "declaration-property-value-disallowed-list": {
      "/^padding|margin/": ["/^\\d+px$/"],
      "font-family": ["/^(?!.*var\\()/"]
    },
    "custom-property-pattern": "^(color|surface|border|text|font|space|radius|shadow|duration|ease|touch|content|measure|z|focus|weight|leading|avatar|skeleton)-"
  }
}
```

Hex hardcoded falha o build. Use **só** tokens. Adicionado `avatar` e
`skeleton` ao pattern depois dos tokens novos.
