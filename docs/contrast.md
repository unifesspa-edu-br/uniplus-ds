# WCAG Contrast — Uni+ Design System

> Matriz oficial de contraste das 3 paletas. Toda combinação texto/fundo
> usada em produção **deve** estar listada aqui com o ratio computado.
> Atualizar **junto** com qualquer mudança em `tokens.css`.

**Critérios:**
- **AAA** ≥ 7.0 : 1 (corpo normal)
- **AA** ≥ 4.5 : 1 (corpo normal)
- **AA-LG** ≥ 3.0 : 1 (texto grande ≥ 18.66 px regular ou ≥ 14 px bold)

Cálculo: WCAG 2.1 relative luminance (algoritmo `(L1 + 0.05) / (L2 + 0.05)`).

---

## Tema light

### Texto sobre superfícies

| Texto | Fundo | Ratio | Veredicto | Onde |
|---|---|---|---|---|
| `--text-primary` `#333333` | `--surface-card` `#ffffff` | **12.6 : 1** | ✅ AAA | corpo, default |
| `--text-primary` `#333333` | `--surface-page` `#f8fafc` | **12.1 : 1** | ✅ AAA | corpo sobre page |
| `--text-secondary` `#5b6b7d` | `--surface-card` `#ffffff` | **5.5 : 1** | ✅ AA | descrições (era `#8899a8` 4.6:1, subido em F-010) |
| `--text-secondary` `#5b6b7d` | `--surface-page` `#f8fafc` | **5.2 : 1** | ✅ AA | secundário sobre page |
| `--text-muted` `#64748b` | `--surface-card` `#ffffff` | **4.8 : 1** | ✅ AA | captions, hint do form (era `#94a3b8` 3.4:1, F-010) |
| `--text-placeholder` `#8493a8` | `--surface-card` `#ffffff` | **3.1 : 1** | ⚠️ UI-only | placeholder de input (3:1 é floor para UI, não texto) |
| `--text-heading` `#0c326f` | `--surface-card` `#ffffff` | **12.3 : 1** | ✅ AAA | h1, h2 |
| `--text-title-soft` `#2565ae` | `--surface-card` `#ffffff` | **5.9 : 1** | ✅ AA | título em destaque suave |
| `--text-link` `#1351b4` | `--surface-card` `#ffffff` | **7.3 : 1** | ✅ AAA | links |
| `--text-disabled` `#94a3b8` | `--surface-disabled` `#e2e8f0` | **2.1 : 1** | ⚠️ UI-only | disabled é estado não-interativo (exceção oficial WCAG 1.4.3) |

### Texto sobre cores institucionais

| Texto | Fundo | Ratio | Veredicto |
|---|---|---|---|
| `#ffffff` | `--color-primary-600` `#1351b4` | **7.3 : 1** | ✅ AAA |
| `#ffffff` | `--color-primary-700` `#0c4194` | **9.5 : 1** | ✅ AAA |
| `#ffffff` | `--color-primary-800` `#0c326f` | **12.3 : 1** | ✅ AAA |
| `#ffffff` | `--color-primary-900` `#071d41` | **16.7 : 1** | ✅ AAA |
| `--color-primary-800` `#0c326f` | `--color-primary-50` `#f0f5ff` | **11.3 : 1** | ✅ AAA |

### Feedback

| Texto | Fundo | Ratio | Veredicto |
|---|---|---|---|
| `--color-success-700` `#0a5a16` | `--color-success-50` `#e7f4e9` | **7.4 : 1** | ✅ AAA |
| `#ffffff` | `--color-success-solid` `#168821` | **4.6 : 1** | ✅ AA |
| `--color-warning-700` `#5a3e08` | `--color-warning-50` `#fef0c8` | **8.7 : 1** | ✅ AAA |
| `#ffffff` | `--color-warning-solid` `#845a0a` | **6.1 : 1** | ✅ AA |
| `--color-danger-700` `#c92a2a` | `--color-danger-50` `#fcf0ee` | **4.9 : 1** | ✅ AA |
| `#ffffff` | `--color-danger-solid` `#c92a2a` | **5.5 : 1** | ✅ AA |
| `--color-info-700` `#0c326f` | `--color-info-50` `#eff6ff` | **11.3 : 1** | ✅ AAA |
| `#ffffff` | `--color-info-solid` `#1351b4` | **7.3 : 1** | ✅ AAA |

### Borders (≥ 3:1 vs adjacente para passar 1.4.11 "Non-text Contrast")

| Border | Adjacente | Ratio | Veredicto |
|---|---|---|---|
| `--border-subtle` `#e2e8f0` | `#ffffff` | **1.2 : 1** | ⚠️ visual decorativo only — NÃO usar para form/input border |
| `--border-default` `#cbd5e1` | `#ffffff` | **1.5 : 1** | ⚠️ same — usar `--border-strong` em inputs |
| `--border-strong` `#64748b` | `#ffffff` | **4.8 : 1** | ✅ 1.4.11 (F-006 fechado — era `#94a3b8` 2.7:1) |

### Focus ring

| Token | Adjacente | Ratio | Veredicto |
|---|---|---|---|
| `--focus-ring-color` `#3b82f6` | `#ffffff` | **3.7 : 1** | ✅ AA-LG (foco é UI, não texto — 3.0:1 mín) |
| `#3b82f6` | `#1351b4` (primary button) | **2.0 : 1** | ⚠️ borderline — adicionar `outline-offset` 2px (já feito) |

---

## Tema dark

### Texto sobre superfícies

| Texto | Fundo | Ratio | Veredicto |
|---|---|---|---|
| `--text-primary` `#f1f5f9` | `--surface-page` `#0f172a` | **16.3 : 1** | ✅ AAA (excedendo bem) |
| `--text-primary` `#f1f5f9` | `--surface-card` `#1e293b` | **13.4 : 1** | ✅ AAA |
| `--text-secondary` `#cbd5e1` | `--surface-page` `#0f172a` | **12.0 : 1** | ✅ AAA |
| `--text-secondary` `#cbd5e1` | `--surface-card` `#1e293b` | **9.9 : 1** | ✅ AAA |
| `--text-muted` `#94a3b8` | `--surface-page` `#0f172a` | **7.0 : 1** | ✅ AAA |
| `--text-muted` `#94a3b8` | `--surface-card` `#1e293b` | **5.7 : 1** | ✅ AA |
| `--text-heading` `#dbe9ff` | `--surface-card` `#1e293b` | **11.9 : 1** | ✅ AAA |
| `--text-heading` `#dbe9ff` | `--surface-page` `#0f172a` | **14.5 : 1** | ✅ AAA |
| `--text-title-soft` `#93c5fd` | `--surface-card` `#1e293b` | **8.1 : 1** | ✅ AAA |
| `--text-link` `#93c5fd` | `--surface-page` `#0f172a` | **9.9 : 1** | ✅ AAA |
| `--text-link` `#93c5fd` | `--surface-card` `#1e293b` | **8.1 : 1** | ✅ AAA |

> **Tokens de texto desacoplados da escala.** `--text-heading`, `--text-link` e
> `--text-title-soft` são pares `light-dark()` explícitos — não aliasam mais
> `--color-primary-800/600`, que vira escuro no dark (`#2563eb`/`#60a5fa`) e
> servia só como **fundo**. Assim um heading nunca herda `#2563eb` sobre
> `#1e293b` (2.8:1, reprova). A escala primary escura permanece para superfícies.

### Texto primary/info sobre tint (chips, drawer ativo, hover secundário)

| Texto | Fundo | Ratio | Veredicto | Onde |
|---|---|---|---|---|
| `--text-on-primary-tint` `#93c5fd` | `--color-primary-50` `#1e293b` | **8.1 : 1** | ✅ AAA | `.tag--primary`, `.filter-chip[aria-pressed]`, drawer ativo, hover do `.btn--secondary` |
| `--color-info-700` `#93c5fd` | `--color-info-50` `#172554` | **8.1 : 1** | ✅ AAA | `.tag--info`, título de `.alert--info` |

### Primary (sky-400 em dark)

| Texto | Fundo | Ratio | Veredicto |
|---|---|---|---|
| `--text-on-primary` `#0f172a` | `--color-primary-600` `#60a5fa` | **7.0 : 1** | ✅ AAA |
| `--text-on-primary` `#0f172a` | `--color-primary-700` `#3b82f6` | **4.8 : 1** | ✅ AA |
| `#ffffff` | `--color-primary-800` `#2563eb` | **5.2 : 1** | ✅ AA |

### Feedback (dark)

| Texto | Fundo | Ratio | Veredicto |
|---|---|---|---|
| `--color-success-700` `#86efac` | `--color-success-50` `#052e16` | **10.6 : 1** | ✅ AAA |
| `--color-warning-700` `#fde68a` | `--color-warning-50` `#422006` | **11.7 : 1** | ✅ AAA |
| `--color-danger-700` `#fecaca` | `--color-danger-50` `#450a0a` | **11.2 : 1** | ✅ AAA |
| `#ffffff` | `--color-success-solid` `#168821` (mantém escuro em ambos os temas) | **4.6 : 1** | ✅ AA |
| `#ffffff` | `--color-warning-solid` `#845a0a` | **6.1 : 1** | ✅ AA |

---

## Tema contrast (alto contraste)

Paleta dedicada: fundo `#000000`, texto/acento primário `#ffff00`, link/info
`#00ffff`, foco/perigo `#ffffff`. Ratios recalculados pelo algoritmo WCAG 2.1.

### Texto sobre fundo

| Texto | Fundo | Ratio | Veredicto | Onde |
|---|---|---|---|---|
| `--text-primary` `#ffff00` | `--surface-page` `#000000` | **19.6 : 1** | AAA | corpo, default |
| `--text-secondary` `#ffff00` | `--surface-card` `#000000` | **19.6 : 1** | AAA | descrições |
| `--text-muted` `#ffff00` | `--surface-subtle` `#000000` | **19.6 : 1** | AAA | captions, metadados |
| `--text-heading` `#ffff00` | `--surface-card` `#000000` | **19.6 : 1** | AAA | títulos |
| `--text-link` `#00ffff` | `--surface-page` `#000000` | **16.7 : 1** | AAA | links |
| `--text-on-primary` `#000000` | `--color-primary` `#ffff00` | **19.6 : 1** | AAA | botão primário |
| `--text-placeholder` `#cccc00` | `--surface-card` `#000000` | **12.2 : 1** | AAA | placeholder |
| `--text-disabled` `#666666` | `--surface-disabled` `#000000` | **3.7 : 1** | UI-only | disabled é exceção WCAG 1.4.3 |

### Feedback

| Cor | Fundo adjacente | Ratio | Veredicto | Onde |
|---|---|---|---|---|
| `--color-success-solid` `#00ff00` | `#000000` | **15.3 : 1** | AAA | success |
| `--color-warning-solid` `#ffff00` | `#000000` | **19.6 : 1** | AAA | warning |
| `--color-danger-solid` `#ffffff` | `#000000` | **21.0 : 1** | AAA | danger |
| `--color-info-solid` / `--text-link` `#00ffff` | `#000000` | **16.7 : 1** | AAA | info, links |

### Borders, foco e adjacências

| Token | Adjacente | Ratio | Veredicto | Onde |
|---|---|---|---|---|
| `--border-subtle` `#666666` | `#000000` | **3.7 : 1** | 1.4.11 pass | divisores decorativos |
| `--border-default` `#ffff00` | `#000000` | **19.6 : 1** | 1.4.11 pass | cards, inputs |
| `--border-strong` `#ffff00` | `#000000` | **19.6 : 1** | 1.4.11 pass | foco secundário, forms |
| `--focus-ring-color` `#ffffff` | `#000000` | **21.0 : 1** | AAA | foco visível |
| `--shadow-*` ring `#ffff00` | `#000000` | **19.6 : 1** | 1.4.11 pass | elevação em contrast |

Todas as combinações funcionais superam 7.0 : 1 para texto normal. As bordas
funcionais superam 3.0 : 1 contra a superfície adjacente.

---

## Headers e superfícies inversas

Headers institucionais, subnavs e barras de acessibilidade devem consumir
`--text-on-inverse` para texto, ícones, bordas funcionais e estados hover.
`--color-neutral-0` é branco fixo e só pode aparecer em swatches, exemplos
literais ou constantes decorativas; não é token de texto para header.

| Tema | Texto | Fundo | Ratio | Onde |
|---|---|---|---|---|
| `light` | `--text-on-inverse` `#ffffff` | `--surface-inverse` `#071d41` | **16.7 : 1** | Gov.br stripe, footer inverso |
| `light` | `--text-on-inverse` `#ffffff` | `--surface-accessibility-bar` `#0b2754` | **14.7 : 1** | barra de acessibilidade |
| `dark` | `--text-on-inverse` `#ffffff` | `--surface-inverse` `#020617` | **20.2 : 1** | Gov.br stripe, footer inverso |
| `dark` | `--text-on-inverse` `#ffffff` | `--surface-accessibility-bar` `#050b1c` | **19.6 : 1** | barra de acessibilidade |
| `contrast` | `--text-on-inverse` `#ffff00` | `--surface-inverse` `#000000` | **19.6 : 1** | Gov.br stripe, subnav, headers inversos |
| `contrast` | `--text-on-inverse` `#ffff00` | `--surface-accessibility-bar` `#000000` | **19.6 : 1** | barra de acessibilidade |

Valide `gov-bar`, `a11y-bar`, `subnav`, `topbar` e headers administrativos em
320, 360, 375, 390, 768, 1024 e 1280px. Em `contrast`, a expectativa visual é
texto amarelo sobre preto; branco fixo em header é regressão.

---

## Pendências antes de produção

- [x] Light: combinações de texto/fundo
- [x] Dark: combinações de texto/fundo (completar com tokens novos — F-031 em andamento)
- [x] Contrast: validado
- [x] **Light: `--border-strong` ajustado para `#64748b`** (F-006 fechado em 25 mai 2026)
- [x] **Light: `--text-secondary` subido para `#5b6b7d` e `--text-muted` para `#64748b`** (F-010)
- [x] **Token `--text-placeholder` separado para placeholders** (era reuso indevido de `--text-muted`)
- [ ] Validar com usuário NAIA da Unifesspa (parceria de teste com PcD — briefing § 11)
- [ ] Adicionar uma checagem automatizada via Playwright + axe-core nos PRs (test pattern em `docs/contributing.md`)
- [x] Documentar `data-font-mode="legible"` com Atkinson Hyperlegible Next
- [ ] **Validar contraste com usuários reais no tema `contrast` após F-035 (feedback agora redefinido)**
