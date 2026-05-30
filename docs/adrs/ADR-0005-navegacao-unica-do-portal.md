# ADR-0005 — Navegação única por contexto no UI kit do Portal do Candidato

- **Status:** Accepted
- **Data:** 2026-05-30
- **Escopo:** Design System (`uniplus-ds`)
- **Issue:** unifesspa-edu-br/uniplus-ds#21

## Contexto

O **UI kit estático do Portal do Candidato** (`ui_kits/portal/index.html`) é um
artefato de referência do Design System. Ele ainda não representa um portal real
em produção; define a anatomia HTML, classes, ARIA e comportamento responsivo
que aplicações futuras poderão implementar.

Nesse kit, o estado autenticado de referência exibia duas navegações
equivalentes no desktop:

1. a navegação embutida na `topbar`, com `Editais`, `Minhas inscrições`,
   `Resultados` e `Ajuda`;
2. a `subnav` imediatamente abaixo, com os mesmos destinos e estado ativo mais
   detalhado (`Editais abertos`, badge de inscrições, ícones e destaque visual).

Essa duplicação criava dois problemas no contrato de referência:

- **Carga cognitiva e hierarquia visual:** uma aplicação consumidora herdaria
  dois menus concorrentes para a mesma tarefa logo no topo da tela.
- **Acessibilidade:** pessoas que usam leitor de tela, lista de links,
  landmarks ou navegação por teclado encontravam destinos repetidos sem ganho
  funcional claro.

A pergunta de decisão foi: *qual padrão de navegação deve ser canônico no UI kit
do portal para orientar aplicações futuras com UX moderna, elegante, funcional e
boa para pessoas com deficiência visual?*

## Pesquisa / literatura consultada

- **Gov.br DS — Menu:** o menu principal e o menu contextual devem ter níveis
  claros de navegação; menus contextuais devem ser simples e o DS recomenda
  evitar links comuns nos dois menus.
- **Gov.br DS — Header:** o header identifica o site/sistema e agrupa
  funcionalidades essenciais; a documentação de acessibilidade recomenda
  ordem lógica, textos descritivos e não sobrecarregar o header.
- **GOV.UK Design System — Navigate a service:** separa elementos gerais do
  governo/organização dos elementos de navegação do serviço. A ordem deve ir do
  mais geral no topo para o mais específico abaixo.
- **W3C WAI — Navigation landmarks:** quando há mais de uma navegação, cada uma
  precisa de rótulo único; landmarks ajudam usuários de tecnologia assistiva a
  pular para a região correta.
- **MDN — `aria-current`:** quando um link é visualmente indicado como item
  atual em um conjunto de links, essa informação deve ser exposta de forma
  programática com `aria-current`.
- **Nielsen Norman Group — Menu Design Checklist:** recomenda navegação visível
  em telas maiores, labels claros, contraste adequado e indicação inequívoca da
  localização atual.
- **Material Design — Navigation drawer:** drawers são adequados para acesso a
  destinos no mobile e devem ter estado ativo claro; também recomenda evitar
  combinar componentes primários concorrentes para os mesmos destinos.

### Referências

- Gov.br DS — Menu: <https://www.gov.br/ds/components/menu>
- Gov.br DS — Header: <https://www.gov.br/ds/components/header?tab=acessibilidade>
- GOV.UK — Help users navigate a service: <https://design-system.service.gov.uk/patterns/navigate-a-service/>
- W3C WAI — Navigation landmark: <https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html>
- MDN — `aria-current`: <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current>
- NN/g — Menu Design Checklist: <https://media.nngroup.com/media/articles/attachments/PDF_Menu-Design-Checklist.pdf>
- Material Design — Navigation drawer: <https://m2.material.io/components/navigation-drawer>

## Decisão

1. **Adotar uma navegação por contexto.**
   - No desktop (`min-width: 1024px`), a `subnav` é a navegação principal do
     UI kit do Portal do Candidato.
   - No mobile e tablet estreito, a `subnav` fica oculta e os mesmos destinos
     aparecem no drawer acionado pelo botão de menu.
2. **Reservar a `topbar` para identidade e ações globais.**
   - A `topbar` mantém marca, título do sistema, preferências de acessibilidade,
     área de conta do usuário de referência e acionador do menu mobile.
   - A `topbar` não repete os links da navegação do Portal no desktop.
3. **Expor a navegação de forma semântica e programática.**
   - A navegação do Portal recebe `aria-label="Navegação do Portal do Candidato"`.
   - O item atual usa `aria-current="page"` além do estado visual `.is-active`.
   - Ações de conta, como `Sair`, ficam fora do landmark de navegação do Portal
     e usam um grupo separado (`aria-label="Ações da conta"`).
   - Ícones continuam decorativos (`aria-hidden`) quando o texto já nomeia o
     destino.
4. **Não transformar a `subnav` em componente de abas.**
   - Os destinos navegam entre áreas/páginas do serviço, não alternam painéis
     na mesma tela. Portanto, links em `<nav>` são o padrão correto; `role="tab"`
     e `aria-selected` não se aplicam aqui.

## Consequências

**Positivas**

- Elimina a duplicação visual observada no desktop.
- Reduz links repetidos para leitores de tela e navegação por teclado.
- Mantém navegação visível em telas maiores, sem esconder tudo em hamburger.
- Mantém o padrão mobile já esperado: botão de menu + drawer modal.
- Dá ao item atual uma indicação visual e uma indicação programática.
- Separa melhor identidade institucional, ações globais e navegação do serviço.

**Negativas / custos**

- A `topbar` deixa de ter links principais no desktop neste kit específico.
  Mitigação: a navegação permanece visível logo abaixo, com melhor estado ativo
  e mais informação contextual.
- Há duas marcações dos mesmos destinos de navegação no HTML de referência
  (drawer e `subnav`) para atender layouts responsivos. Mitigação: só uma delas
  é renderizada por contexto; a implementação consumidora deve manter os
  destinos sincronizados e deixar ações de conta em uma seção separada.

## Alternativas descartadas

- **Manter as duas navegações visíveis no desktop.** Rejeitado por duplicar
  links e criar hierarquia concorrente sem ganho funcional.
- **Remover a `subnav` e manter apenas a navegação da `topbar`.** Rejeitado
  porque a `subnav` comunica melhor o estado atual, comporta badge de pendência
  e se aproxima do padrão de navegação de serviço abaixo do header global.
- **Usar só drawer/hamburger em todos os tamanhos.** Rejeitado porque esconder a
  navegação em desktop reduz descoberta e contraria a recomendação de manter
  navegação visível em telas maiores.
- **Trocar por tabs ARIA.** Rejeitado porque os links representam navegação
  entre áreas do serviço, não alternância de painéis locais.

## Implementação

- `ui_kits/portal/index.html`: remover a `.topbar__nav` duplicada; manter
  `subnav` como navegação desktop; envolver apenas os destinos do Portal no
  `<nav>` do drawer mobile; manter `Sair` fora do landmark em um grupo
  "Ações da conta"; aplicar `aria-current="page"` no item ativo.
- `ui_kits/portal/README.md`: registrar o contrato "uma navegação por contexto"
  e referenciar esta ADR.
