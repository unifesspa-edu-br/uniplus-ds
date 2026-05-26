# ADR-0001 — Limite de passos no stepper horizontal e rail vertical para fluxos longos

- **Status:** Accepted
- **Data:** 2026-05-26
- **Escopo:** Design System (`uniplus-ds`)
- **Issue:** unifesspa-edu-br/uniplus-ds#2

## Contexto

O componente `.stepper` horizontal distribui os passos com `flex: 0 0 auto`
(largura fixa por passo) e barras `flex: 1`. Quando a soma das larguras fixas
dos passos excede a largura do container, não há `overflow` nem `wrap`: os
últimos passos vazam para fora e são **cortados** na borda.

Isso foi observado em produção no preview `pattern-wizard.html`, que usava um
stepper horizontal de **12 passos**. Em um viewport de 838px o passo 12
("Confirmação") era cortado em ~97px (medido: `scrollWidth` 749 vs
`clientWidth` 652). O texto do `docs/component-api.md` chegava a endossar esse
uso ("o wizard usa 12 etapas").

A questão de fundo não é o corte em si, mas **quantos passos um stepper
horizontal comporta** antes de virar antipadrão de usabilidade.

## Literatura consultada

- **Material Design — Steppers:** stepper horizontal recomendado apenas para um
  "número pequeno" de passos; muitos passos pedem orientação vertical e, no
  mobile, um indicador textual/numérico em vez de rótulos.
- **Nielsen Norman Group:** progress trackers com muitos passos aumentam carga
  cognitiva e ansiedade; a recomendação é **agrupar** etapas e manter poucos
  marcadores visíveis.
- **GOV.UK Design System:** para serviços longos não usa stepper horizontal;
  adota o padrão **"Task list page"** (lista vertical com status) + "one thing
  per page". Referência forte por ser padrão de governo digital.
- **Gov.br DS (`br-step`):** o componente "Passo a passo" oficial prevê
  orientação **vertical** — logo, adotá-la é aderência ao padrão obrigatório
  (ver ADR-018 da plataforma), não desvio.
- **e-MAG 3.1 / WCAG 2.1 AA:** menos marcadores visíveis e "passo atual"
  inequívoco (não dependente só de cor) reduzem carga cognitiva — requisito de
  autarquia federal.

## Decisão

1. **Stepper horizontal é limitado a 5 passos.** Acima disso, o uso é proibido.
2. **Fluxos com mais de 5 passos usam o rail vertical (`.step-rail`)**:
   - **Desktop (≥768px):** coluna lateral com a lista de etapas.
   - **Telas estreitas (até 320px):** cabeçalho textual **"Etapa X de N"** +
     nome do passo atual + barra de progresso, com a lista completa em
     *progressive disclosure* (`<details>`/`<summary>`, sem JS).
3. **`.stepper` ganha `overflow-x: auto` como guard de degradação graciosa** —
   se alguém exceder o limite, rola na horizontal em vez de cortar passos. É
   rede de segurança, não autorização para abusar.
4. O estado do passo é comunicado por **texto + `aria-current="step"`**, nunca
   só por cor; marcadores gráficos são `aria-hidden`.

## Consequências

**Positivas**
- Elimina o corte de passos e o antipadrão de stepper horizontal longo.
- Mobile (incl. 320px) ganha um padrão canônico de progresso, sem rótulos
  espremidos.
- Aderência explícita a Material, NN/g, GOV.UK e Gov.br DS.

**Negativas / custos**
- Novo componente (`.step-rail`) a manter e versionar.
- Telas existentes com stepper horizontal > 5 passos precisam migrar (feito:
  `pattern-wizard.html`).

## Alternativas descartadas

- **Rolar o stepper horizontal (só o guard):** preserva o componente mas mantém
  o antipadrão de UX e esconde passos atrás de scroll.
- **Stepper horizontal compacto só com números:** perde os rótulos, que são o
  principal valor do indicador de progresso.

## Implementação

- `components.css`: `.stepper { overflow-x: auto }` + componente `.step-rail`.
- `preview/pattern-wizard.html`: migrado para `.step-rail`.
- `preview/comp-step-rail.html`: preview isolado do componente.
- `docs/component-api.md`: regra dos 5 passos e documentação do `.step-rail`.
