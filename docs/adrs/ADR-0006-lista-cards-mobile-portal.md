# ADR-0006 — Lista única no mobile e toggle Lista/Cards só quando há diferença funcional

- **Status:** Accepted
- **Data:** 2026-05-30
- **Escopo:** Design System (`uniplus-ds`)
- **Issue:** unifesspa-edu-br/uniplus-ds#25
- **Formato:** MADR 4.0.0 adaptado para pt-BR e para o padrão local dos ADRs do DS

## Contexto e problema

O **UI kit do Portal do Candidato** (`ui_kits/portal/index.html`) exibe a seção
"Editais abertos" com um controle segmentado `Lista / Cards`. Em telas grandes,
as opções são funcionalmente diferentes: lista vertical para leitura densa e
grade de cards para varredura visual.

No mobile, porém, a opção `Cards` também é renderizada em uma única coluna. O
controle passa a ocupar espaço antes da busca e dos filtros, mas não entrega uma
mudança estrutural clara para a tarefa. Além disso, como a preferência é
persistida em `localStorage`, uma escolha feita em desktop pode afetar a
experiência em tela estreita.

A pergunta de decisão foi: *o Portal deve exibir o toggle `Lista / Cards` no
mobile quando as duas opções resultam em uma coluna vertical?*

## Direcionadores de decisão

- Mobile-first: a experiência em 320px, 375px e 414px não pode depender de
  controles secundários para ser compreensível.
- WCAG/e-MAG: a página deve reflowar sem rolagem horizontal e manter alvos de
  toque adequados.
- Carga cognitiva: controles raramente úteis competem com busca, filtros e
  conteúdo principal.
- Clareza semântica: `aria-pressed` é adequado para toggles reais, mas não deve
  expor uma escolha sem efeito perceptível no contexto atual.
- Consistência responsiva: uma preferência de visualização pode existir em
  desktop/tablet, desde que não degrade o mobile.
- Contrato público: o DS deve documentar quando um view toggle é recomendado e
  quando deve ser omitido.

## Opções consideradas

1. **Manter o toggle em todos os breakpoints.**
   - Simples para implementação, mas mantém a decisão artificial no mobile.
2. **Remover o toggle completamente.**
   - Reduz complexidade, mas perde uma alternativa útil em telas maiores, onde
     cards podem formar uma grade.
3. **Usar lista única no mobile e exibir `Lista / Cards` apenas onde há diferença
   funcional.**
   - Preserva a flexibilidade de desktop/tablet e remove o ruído no mobile.
4. **Renomear os modos para `Compacta / Detalhada`.**
   - Poderia justificar dois modos em mobile, mas exigiria dois layouts móveis
     realmente distintos e uma nova semântica de conteúdo.

## Resultado da decisão

Escolha: **opção 3 — lista única no mobile e toggle apenas quando há diferença
funcional**.

No Portal do Candidato:

- abaixo de `600px`, a seção "Editais abertos" usa uma única apresentação
  canônica: a lista rica (`.edital-row`), visualmente próxima de cards compactos;
- o controle `Lista / Cards` fica oculto no mobile;
- se `localStorage` guardar `cards`, o mobile continua exibindo a lista rica; a
  preferência volta a valer quando o viewport alcança `600px` ou mais;
- a opção `Cards` continua disponível a partir de `600px`, quando passa a formar
  uma grade de duas ou três colunas conforme o espaço.

### Consequências

**Positivas**

- Remove um controle de baixo valor no mobile.
- Mantém busca e filtros mais próximos do topo da seção.
- Evita que uma preferência desktop degrade a experiência mobile.
- Mantém o toggle onde ele entrega uma diferença clara de apresentação.
- Alinha o contrato do DS à recomendação de expor controles apenas quando eles
  ajudam a tarefa no contexto atual.

**Negativas / custos**

- Usuários não conseguem escolher cards no mobile. Mitigação: a lista rica já
  usa superfície, metadados e ações suficientes para funcionar como card
  compacto.
- Há uma regra responsiva adicional para sincronizar CSS, `localStorage` e
  estado acessível dos botões quando o viewport muda.

## Alternativas descartadas

- **Manter `Lista / Cards` no mobile:** rejeitado porque o nome promete dois
  formatos, mas ambos aparecem como coluna única.
- **Forçar grid de cards no mobile:** rejeitado porque prejudica leitura,
  comparação e reflow; em 320px a prioridade é coluna única.
- **Remover a lista e usar apenas cards em todos os tamanhos:** rejeitado porque
  a lista é melhor para leitura densa de editais homogêneos e para tecnologias
  assistivas.
- **Transformar o toggle em menu de preferências:** rejeitado por esconder uma
  escolha que só é útil em telas maiores; o problema é o breakpoint, não a
  aparência do controle.

## Implementação

- `ui_kits/portal/index.html`:
  - adicionar uma classe específica ao segmented control de editais;
  - ocultar o toggle abaixo de `600px`;
  - forçar `.view-list` no mobile mesmo quando `body[data-view="cards"]`;
  - manter a preferência persistida para `600px+`;
  - sincronizar `aria-pressed` com a view efetiva do breakpoint atual.
- `ui_kits/portal/README.md`: registrar que lista é canônica no mobile e que o
  toggle só aparece quando a grade de cards é funcionalmente diferente.
- `docs/component-api.md`: documentar a regra geral para view toggles no DS.
- `docs/adrs/README.md`: registrar esta ADR.

## Referências

- MADR 4.0.0 — template: <https://adr.github.io/madr/decisions/adr-template.html>
- MADR 4.0.0 — visão geral: <https://adr.github.io/madr/>
- Apple Human Interface Guidelines — Segmented controls: <https://developer.apple.com/design/human-interface-guidelines/segmented-controls>
- Material Design — Lists: <https://m1.material.io/components/lists.html>
- Material Design — Cards: <https://m2.material.io/components/cards>
- Baymard — Mobile product lists: <https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/product-list>
- W3C WAI — WCAG 1.4.10 Reflow: <https://w3c.github.io/wcag/understanding/reflow.html>
- W3C WAI — WCAG 2.5.5 Target Size (Enhanced): <https://w3c.github.io/wcag/understanding/target-size-enhanced.html>
- MDN — `aria-pressed`: <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed>
- eMAG 3.1: <https://emag.governoeletronico.gov.br/>
- Nielsen Norman Group — Heuristic Evaluation Workbook: <https://media.nngroup.com/media/articles/attachments/Heuristic_Evaluation_Workbook_-_Nielsen_Norman_Group.pdf>
