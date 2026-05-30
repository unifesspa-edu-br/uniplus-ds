# Portal do Candidato — UI kit

Hi-fi mobile-first reference for a future **Portal do Candidato** authenticated experience (Sistema Uni+).

**Renders at 360, 768, 1024 and 1280+.** Drag the preview width slider to verify reflow.

- Gov.br stripe → AccessibilityBar → brand header → sub-nav → **hero de edital em destaque (estático)** → busca + filtros → **lista de editais** (toggle Lista / Cards só em 600px+) → "Como funciona" → footer
- Built entirely on `tokens.css` + `base.css` + `components.css` from project root
- No inline color values (all via design tokens), every interactive ≥44×44
- `data-theme="auto"` on `<html>` — follows OS `prefers-color-scheme`

## Decisões de acessibilidade

- **Uma navegação por contexto.** No desktop, a `subnav` é a navegação principal do Portal do Candidato; no mobile, os mesmos destinos ficam no drawer acionado pelo botão de menu (ver [ADR-0005](../../docs/adrs/ADR-0005-navegacao-unica-do-portal.md)). O header fica reservado para identidade, acessibilidade e conta do usuário. O item ativo usa estilo visual e `aria-current="page"`.
- **Lista é o modo canônico no mobile.** Abaixo de 600px, o Portal usa uma lista rica em formato de card compacto e oculta o toggle `Lista / Cards` (ver [ADR-0006](../../docs/adrs/ADR-0006-lista-cards-mobile-portal.md)). Em 600px+, o usuário pode trocar para Cards pelo segmented control; a escolha persiste em `localStorage`, mas não degrada a experiência mobile.
- **Hero estático em vez de carrossel.** O destaque do topo é uma seção estática de um único edital (ver [ADR-0004](../../docs/adrs/ADR-0004-hero-estatico-no-lugar-de-carrossel.md)). A literatura de UX (NN/g, Baymard) mostra que carrosséis têm baixa descoberta no mobile e que a maioria dos usuários nunca vê além do primeiro slide; aqui os editais já estão disponíveis na lista abaixo, então o carrossel era redundante e quebrava no mobile. O componente `.carousel` segue no DS para casos que o justifiquem.
- **Filtros + busca** sempre visíveis, com label `sr-only` no campo de busca, `role="search"` no container e `aria-pressed` nos chips. `aria-live` anuncia &ldquo;3 editais encontrados&rdquo;.

## Caveats

- Filtros e busca estão visualmente prontos mas sem JS de filtragem real (este é UI kit, não app). A implementação fica na lib Angular.
- A ilustração do hero é placeholder. Briefing §8 pede arte autoral amazônica/paraense.
