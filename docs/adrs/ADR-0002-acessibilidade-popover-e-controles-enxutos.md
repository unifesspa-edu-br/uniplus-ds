# ADR-0002 — Acessibilidade: popover no header em vez de barra fixa, com controles enxutos

- **Status:** Accepted
- **Data:** 2026-05-26
- **Escopo:** Design System (`uniplus-ds`)
- **Issue:** unifesspa-edu-br/uniplus-ds#6

## Contexto

A `.a11y-bar` ocupava uma faixa permanente em todas as telas:

- **Desktop (≥768px):** controles sempre abertos numa barra de largura total — uma row fixa só para preferências.
- **Mobile (≤767px):** um botão "Acessibilidade" que expandia os controles empilhados (fonte A/A+/A++, tema Claro/Escuro/Sistema, Contraste, Fonte legível, Ajuda).

Dois problemas:

1. **Peso visual / "desordem":** uma seção inteira de controles competindo com o conteúdo, principalmente no mobile.
2. **Duplicação de rótulo:** "Acessibilidade" aparece na faixa institucional gov.br **e** no toggle da barra, confundindo o usuário.

A questão de fundo: *qual a forma correta de oferecer preferências de exibição (fonte/tema/contraste) num portal de governo* — e *quais controles realmente devem existir*.

## Pesquisa / literatura consultada

- **WAI (W3C) e comunidade de acessibilidade:** *overlays/widgets automáticos de acessibilidade* são reprovados — não substituem acessibilidade real, forçam reconfiguração em cada site e podem conflitar com a tecnologia assistiva do próprio usuário. O botão **flutuante** de acessibilidade é a assinatura visual desse anti-padrão. (Distingue-se de controles **nativos** legítimos, que é o nosso caso.)
- **Nielsen Norman Group:** prover controle de fonte com unidades relativas, mas **respeitando as preferências do navegador**; e **desencoraja oferecer customização de esquema de cores**, preferindo `prefers-color-scheme` do sistema operacional.
- **Barra de Acessibilidade oficial do Governo Federal (IDG/gov.br):** mantém **alto contraste** + âncoras de salto (Alt+1/2/3) e **removeu os botões de aumentar/diminuir fonte**, com a justificativa oficial de que "os navegadores já têm esse recurso nativo, conhecido pela maioria".
- **e-MAG (obrigatório):** acessibilidade descobrível **no topo**, teclas de atalho (Alt+1/2/3), **alto contraste**, **fonte legível** e identificação de links.
- **WCAG 2.1:** não exige widget algum — exige que o **conteúdo** seja acessível (reflow 1.4.10, redimensionar texto a 200% via zoom do navegador 1.4.4, contraste 4.5:1). Controles de página são complemento, não requisito.

### Referências

- WAI/overlays: <https://www.accessibility.works/blog/avoid-accessibility-overlay-tools-toolbar-plugins/> · <https://wcagsafe.com/blog/accessibility-overlays-dont-work>
- NN/g: <https://www.nngroup.com/articles/let-users-control-font-size/> · <https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/>
- e-MAG: <https://emag.governoeletronico.gov.br/padroes-0033.php>
- Barra oficial (IDG): <https://barra.governoeletronico.gov.br/instrucoes_novo.html>

## Decisão

1. **Eliminar a barra de acessibilidade fixa.** Nenhuma row permanente de controles, em nenhuma largura de tela.
2. **Ponto de entrada:** um **botão-ícone de acessibilidade no header** (glifo de acesso universal, com nome acessível "Preferências de acessibilidade") que abre um **popover** no desktop e um **bottom-sheet/painel** no mobile. Descobrível no topo (e-MAG), sob demanda, **não flutuante** (evita a estética de overlay reprovada).
3. **Enxugar os controles** ao que os padrões realmente pedem:
   - **Remover** o tamanho de fonte (A / A+ / A++) — delegado ao **zoom nativo do navegador** (Ctrl/+/−), como fez a barra oficial do governo e recomenda a NN/g.
   - **Manter alto contraste** — núcleo do e-MAG e da barra oficial.
   - **Manter fonte legível** (apoio à dislexia) — sancionado pelo e-MAG.
   - **Tema:** manter Claro / Escuro / **Sistema**, com `Sistema` (= `prefers-color-scheme`) como padrão — honra a recomendação da NN/g de respeitar o SO, oferecendo override manual, que hoje é norma.
4. **Manter/garantir skip-links e atalhos** (Alt+1/2/3) e o "Pular para o conteúdo" — e-MAG.
5. **Desfazer a duplicação de rótulo:** o link "Acessibilidade" da faixa gov.br permanece reservado para a futura **declaração de acessibilidade** (convenção gov.br); o widget de **preferências** é o botão-ícone do header — semanticamente distintos.

## Consequências

**Positivas**
- Remove a "desordem" pela raiz: menos controles + sem row fixa.
- Alinhamento total a e-MAG, gov.br/IDG, NN/g e WCAG.
- Acessibilidade real preservada: `auto`/`prefers-color-scheme`, contraste, zoom nativo, skip-links — sem mimetizar overlay.

**Negativas / custos**
- Remoção de feature (A/A+/A++): usuários que não conhecem o zoom do navegador perdem o atalho visual. Mitigação: o popover pode trazer uma dica curta ("use Ctrl + e Ctrl − para ampliar") se necessário.
- Novo padrão de componente (botão + popover/bottom-sheet) a manter e versionar; a contrato JS atual (`uniplus-a11y.js`) precisa de ajuste no gatilho.

## Alternativas descartadas

- **Manter a barra fixa** (status quo): a "desordem" e a duplicação permanecem.
- **Botão flutuante (FAB):** mimetiza a estética dos overlays reprovados pela WAI.
- **Reusar o link "Acessibilidade" da gov.br** como gatilho das preferências: foge da convenção gov.br (esse link = declaração de acessibilidade) e mistura dois conceitos distintos.
- **Remover o tema por completo** (só `prefers-color-scheme`): NN/g desencoraja customização de cor, mas um toggle claro/escuro é norma moderna e de baixo risco — mantido em forma enxuta.

## Implementação (follow-up)

- `components.css`: remover `.a11y-bar` fixa; adicionar componente de botão + popover/bottom-sheet.
- `assets/uniplus-a11y.js`: ajustar o gatilho (abrir/fechar popover, foco, Esc) — mantém o contrato `data-a11y`.
- Remover os botões `data-a11y="font-scale"` dos kits; manter `theme`, `contrast`, `font-mode`.
- Atualizar `docs/component-api.md` e os previews; remover/!atualizar `comp-a11y-bar.html`.
