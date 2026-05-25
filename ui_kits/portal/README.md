# Portal do Candidato — UI kit

Hi-fi mobile-first recreation of the **Portal do Candidato** logged-in home (Sistema Uni+).

**Renders at 360, 768, 1024 and 1280+.** Drag the preview width slider to verify reflow.

- Gov.br stripe → AccessibilityBar → brand header → sub-nav → **carrossel manual de 3 slides** → busca + filtros → **lista de editais (toggle Lista / Cards)** → "Como funciona" → footer
- Built entirely on `tokens.css` + `base.css` + `components.css` from project root
- No inline color values (all via design tokens), every interactive ≥44×44
- `data-theme="auto"` on `<html>` — follows OS `prefers-color-scheme`

## Decisões de acessibilidade

- **Lista é o modo padrão.** É melhor para leitores de tela (cada edital é um `<article role="listitem">`, lido em ordem natural, com hierarquia limpa) e para baixa visão (tipografia maior, conteúdo encadeado em vez de em colunas). O usuário pode trocar para Cards pelo segmented control — a escolha persiste em `localStorage`.
- **Carrossel é manual.** Nunca auto-rotaciona (WCAG 2.2.2). Prev/next + dots, com `aria-live="polite"` anunciando &ldquo;Slide X de Y&rdquo; quando muda. Setas do teclado funcionam quando o carrossel tem foco. Boundaries desabilitam prev/next (não cicla).
- **Filtros + busca** sempre visíveis, com label `sr-only` no campo de busca, `role="search"` no container e `aria-pressed` nos chips. `aria-live` anuncia &ldquo;3 editais encontrados&rdquo;.

## Caveats

- Filtros e busca estão visualmente prontos mas sem JS de filtragem real (este é UI kit, não app). A implementação fica na lib Angular.
- Illustrações dos slides são placeholders. Briefing §8 pede arte autoral amazônica/paraense.
