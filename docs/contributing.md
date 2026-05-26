# CONTRIBUTING — Uni+ Design System

> Guia operacional para contribuir no pacote CSS-only do Uni+ Design System.
> Leia antes de abrir o primeiro PR. Toda decisão arquitetural não-óbvia deve
> ficar documentada antes de virar contrato público.

---

## Decisão arquitetural

Este repositório é **CSS-only**. Ele fornece tokens, reset/base, classes de
componentes, helpers JavaScript vanilla, previews, UI kits e documentação de
contrato. Ele não entrega wrappers Angular, componentes TypeScript, selectors
`ptl-*`/`slc-*`/`ing-*` nem APIs `input()`/`output()`.

Projetos consumidores podem implementar Angular, Web Components, React, Vue ou
HTML server-rendered usando este contrato como referência. Essas implementações
devem viver nos seus próprios repositórios ou módulos, mantendo compatibilidade
com a anatomia HTML, classes, ARIA e comportamento documentados aqui.

## Documentação evolui junto

Qualquer mudança em `tokens.css`, `components.css`, `assets/*.js`,
`preview/` ou `ui_kits/` que altere contrato público, comportamento,
responsividade, ARIA ou contraste deve atualizar a documentação no mesmo PR.
Use:

- `docs/component-api.md` para anatomia HTML, classes, ARIA e foco;
- `docs/contrast.md` para tokens de cor, contraste e superfícies inversas;
- `README.md` e `SKILL.md` quando a mudança alterar uso, status, validação ou
  regra de consumo do pacote CSS-only.

Documentação não é etapa posterior: ela faz parte do definition of done do DS.

## Estrutura

```
.
  tokens.css                    ← design tokens
  base.css                      ← reset, tipografia e utilitários a11y
  components.css                ← CSS dos componentes e patterns
  assets/
    uniplus-a11y.js             ← runtime de preferências de acessibilidade
    uniplus-toast.js            ← API UniToast
    uniplus-form.js             ← validação leve + máscara de CPF
    uniplus-backtotop.js        ← botão voltar ao topo
  preview/                      ← cards e índice navegável
  ui_kits/portal/               ← kit do Portal do Candidato
  ui_kits/admin/                ← kit administrativo
  docs/                         ← contratos, tokens, contraste e guias
```

Em HTML estático, carregue:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
```

Em apps consumidores com Tailwind, preserve a ordem e adapte os caminhos à
forma como o DS for publicado ou copiado:

```css
@import 'tailwindcss';
@import './tokens.css';
@import './base.css';
@import './components.css';

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
- Existe no stack consumidor, como PrimeNG unstyled? Documente o mapeamento em
  vez de duplicar comportamento.
- Já existe um componente/pattern nosso que cobre 80%? Estenda em vez de
  duplicar.

### 2. Escreva o CSS primeiro (no `components.css`)

```css
/* ============================================================================
 * <NOME COMPONENTE>
 * Pattern: <descreva o markup esperado>
 * ARIA: <listar role/aria-* obrigatórios>
 * ========================================================================== */
.<componente> {
  /* base */
}
.<componente>__<elemento> { /* part */ }
.<componente>--<variante> { /* modifier */ }
```

Regras:
- **Tokens, nunca hex literal.** `var(--color-primary)`, não `#1351b4`.
- **Mobile-first.** Estado base = 320px, com verificação explícita em 375px
  (iPhone SE). `@media (min-width: …)` aditivo.
- **Estados completos:** default, hover, focus-visible, active, disabled.
- **`min-height: var(--touch-min)`** em qualquer interativo.
- **Sem `:focus`**, só `:focus-visible`. (Já coberto por `base.css` em fallback.)
- **`prefers-reduced-motion`**: animações condicionais ou usar `--duration-*`.

### 3. Adicione um preview card

`preview/comp-<nome>.html` — copia o template dos cards existentes.

### 4. Documente o contrato

Atualize `docs/component-api.md` com:

- anatomia HTML mínima;
- classes base, elementos e modificadores;
- atributos ARIA e comportamento de teclado;
- estados obrigatórios;
- referência ao preview canônico.

Não documente inputs/outputs Angular neste repositório. Se um app consumidor
criar wrapper Angular, ele deve manter documentação própria e apontar para este
contrato como fonte visual/acessível.

### 5. Teste

Lint CSS na raiz do design system:

```bash
npm run lint:css
npm run lint:css:fix
```

O hook `.husky/pre-commit` roda `npx lint-staged`, aplicando `stylelint --fix`
nos arquivos `*.css` staged.

Cobertura mínima manual:

- `preview/index.html` e UI kits relevantes em 320, 360, 375, 390, 768,
  1024 e 1280px;
- temas `light`, `dark` e `contrast`;
- navegação por teclado;
- zoom 200%;
- estados default, hover, focus-visible, active e disabled;
- ausência de overflow horizontal visual não intencional;
- headers e superfícies inversas usando tokens semânticos, especialmente
  `--text-on-inverse` no tema `contrast`;
- status com texto/ícone, não apenas cor.

### 6. Abra PR usando o template (próxima seção)

---

## PR template

```markdown
## O que muda

- [ ] Novo componente/pattern CSS
- [ ] CSS atualizado em `components.css`
- [ ] Preview card em `preview/comp-<nome>.html`
- [ ] Documentação em `docs/component-api.md` atualizada
- [ ] `docs/contrast.md` atualizado quando houver mudança de cor
- [ ] Decisão arquitetural registrada quando a mudança alterar contrato público

## Checklist

### Design
- [ ] Mobile-first (testado em 320 / 360 / 375 / 390 / 768 / 1024 / 1280)
- [ ] Tokens, sem hex literal
- [ ] Headers/superfícies inversas usam tokens semânticos, não branco fixo
- [ ] Estados completos: default, hover, focus-visible, active, disabled
- [ ] Sombras restritas (border default, shadow apenas em overlays)
- [ ] Sem overflow horizontal, exceto em containers explicitamente roláveis

### Acessibilidade
- [ ] Touch target ≥ 44×44 em todo interativo
- [ ] Foco visível (3px solid `var(--focus-ring-color)`)
- [ ] ARIA contract documentado (role, aria-*, aria-live, focus management)
- [ ] Off-canvas/drawer/sidebar mobile com Escape, foco restaurado e fundo inerte
- [ ] Testado com leitor de tela (NVDA Windows / VoiceOver macOS)
- [ ] `prefers-reduced-motion` honrado
- [ ] WCAG 2.1 AA piso, AAA onde viável
- [ ] Contraste documentado em `docs/contrast.md`

### Performance
- [ ] Imagens otimizadas (`<img loading="lazy" decoding="async">`)
- [ ] Sem scripts bloqueantes desnecessários nos previews/UI kits
- [ ] Animações respeitam `prefers-reduced-motion`

### Conteúdo
- [ ] Copy em pt-BR institucional acolhedor
- [ ] Sentence case (UPPERCASE só em KPI eyebrow / tag solid)
- [ ] LGPD: sem PII em telas públicas

### Tests
- [ ] `npm run lint:css`
- [ ] Teste manual em 320 / 360 / 375 / 390 / 768 / 1024 / 1280
- [ ] Teste manual em `light` / `dark` / `contrast`
- [ ] Navegação por teclado e zoom 200%
- [ ] Axe/Playwright ou equivalente para mudanças em headers, UI kits ou ARIA
- [ ] Screenshots ou links de preview quando houver mudança visual
```

---

## Convenções

### Naming

- **Arquivos**: `kebab-case` (`edital-row.ts`, `comp-edital-row.html`)
- **Classes CSS**: `kebab-case` BEM (`.edital-row__body`, `.btn--primary`)
- **CSS custom properties**: `--<categoria>-<escala>` (`--color-primary-600`, `--space-4`)
- **Previews**: `preview/comp-<nome>.html`

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
feat(components): adiciona edital row
fix(components): sincroniza aria-expanded do drawer
docs: adiciona guia de paginacao por cursor
style(tokens): ajusta tema dark baseado em slate
test(a11y): documenta verificacao manual do menu
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

- **Stylelint** garantindo tokens e bloqueando hex literal fora de `tokens.css`.
- **Playwright + axe-core**, quando configurado no projeto consumidor ou na CI
  deste pacote, deve falhar em violations sérias/críticas e cobrir pelo menos
  320/375px nos UI kits quando a mudança tocar headers, navegação ou ARIA.

### Personas para revisar mentalmente

Revise mentalmente pessoas com baixa visão, dislexia, navegação só por teclado,
uso de leitor de tela, zoom alto e daltonismo. Se o componente não funciona
para esses cenários, refaça o contrato antes de abrir PR.

---

## Onde pedir ajuda

- **Design questions** → ler `docs/component-api.md` e os previews. Em
  caso de gap, abrir issue.
- **A11y duvidoso** → `docs/contrast.md` + axe DevTools. Em último caso,
  parceria com o NAIA da Unifesspa para teste com usuários reais.
- **ADRs/decisões** → registrar antes de mudar contrato público.
- **Cursor pagination** → `docs/cursor-pagination.md`.
- **Discussões maiores** → email institucional + Google Chat.
