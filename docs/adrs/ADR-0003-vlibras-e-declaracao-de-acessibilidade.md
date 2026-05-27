# ADR-0003 — VLibras e declaração de acessibilidade

- **Status:** Accepted
- **Data:** 2026-05-27
- **Escopo:** Design System (`uniplus-ds`) + contrato para a aplicação
- **Issue:** unifesspa-edu-br/uniplus-ds#8

## Contexto

O gov.br/ds prevê dois itens institucionais de acessibilidade que o Uni+ ainda
não tem (registrados como fora de escopo no [ADR-0002](ADR-0002-acessibilidade-popover-e-controles-enxutos.md)):

1. **VLibras** — suíte oficial de tradução de conteúdo para Libras (avatar
   sinalizando), do MGISP/SGD + MDHC + UFPB/LAVID.
2. **Declaração de acessibilidade** — página descrevendo os recursos de
   acessibilidade do sistema, alvo do link "Acessibilidade" da faixa gov.br
   (hoje `href="#"`).

Há uma **tensão aparente com o ADR-018**, que estabeleceu "tokens Gov.br como
CSS, **sem runtime JS do Gov.br**". Mas o ADR-018 trata da **biblioteca de
componentes de UI** (motivo de adotarmos PrimeNG unstyled em vez dos componentes
JS do `@govbr-ds`). O VLibras **não é componente de UI** — é uma **ferramenta
assistiva** com base legal própria. Logo, adotá-lo **não contradiz** o ADR-018.

## Base legal e normativa

- **Lei nº 10.436/2002** reconhece a Libras como meio legal de comunicação e
  expressão das pessoas surdas.
- **Decreto nº 5.626/2005** regulamenta a lei e impõe que instituições públicas
  garantam acesso à informação às pessoas surdas.
- O **gov.br/ds** inclui o VLibras no conjunto de acessibilidade. Como autarquia
  federal, a Unifesspa deve oferecê-lo.
- e-MAG/WCAG: Libras complementa (não substitui) legendas/transcrições.

### Como o VLibras se integra (widget oficial)

```html
<div vw class="enabled">
  <div vw-access-button class="active"></div>
  <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>
</div>
<script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
<script>new window.VLibras.Widget();</script>
```

> Use o construtor **sem argumento** (snippet oficial atual): o `rootPath`
> assume o padrão `https://vlibras.gov.br/app/`. É a forma adotada no helper
> `assets/uniplus-vlibras.js`.

É um **runtime externo** (script de `vlibras.gov.br`) que injeta um **botão
flutuante** próprio + um avatar 3D. O peso e a origem externa são os principais
trade-offs.

## Decisão (proposta)

1. **Adotar o VLibras oficial** (widget canônico), sem fork nem reimplementação.
2. **Carregamento lazy/deferido:** o script só é carregado de forma não
   bloqueante (`requestIdleCallback`/`defer`), para não penalizar o carregamento
   inicial com um runtime externo pesado. O botão flutuante do VLibras aparece
   após o carregamento.
   - Observação: o VLibras tem **botão flutuante próprio** — isso **não**
     contradiz o ADR-0002 (que evitou FAB para *preferências*): aqui o FAB é a
     UX **canônica e legalmente motivada** do VLibras, não uma invenção nossa.
3. **Propriedade no shell da aplicação:** em produção (uniplus-web), o VLibras é
   responsabilidade do **shell**, carregado uma vez por sessão — não é um
   componente do DS embutido em cada tela. O DS **documenta o contrato** e
   **demonstra** nos kits (lazy), validando que não há conflito de `z-index`
   com popovers/drawers/toasts.
4. **Declaração de acessibilidade:** o DS provê uma **página de declaração
   modelo** (`acessibilidade.html`) com a estrutura recomendada (recursos
   suportados, grau de conformidade WCAG/e-MAG, limitações conhecidas, contato e
   data de revisão). O link "Acessibilidade" da faixa gov.br aponta para ela. A
   aplicação **adapta o conteúdo institucional** (datas, contatos e status de
   conformidade reais) — o DS entrega o template, não os dados definitivos.

## Consequências

**Positivas**
- Conformidade com a legislação de Libras e com o gov.br/ds.
- Sem fork: manutenção zero do tradutor; atualizações vêm da fonte oficial.
- Lazy-load preserva a performance inicial.

**Negativas / trade-offs**
- Dependência de **runtime externo** (`vlibras.gov.br`) — origem de terceiro,
  com implicações de privacidade/disponibilidade. Mitigação: lazy, e o widget é
  opcional ao uso do site.
- O DS passa a ter (no showcase) um script externo — diferente do restante, que
  é estático/offline. Mitigação: isolado, lazy, documentado.
- Avatar 3D é pesado; só carrega sob demanda.

## Alternativas descartadas

- **Reimplementar/forkar o VLibras:** custo de manutenção altíssimo, sem ganho.
- **Não oferecer Libras:** descumpre a base legal e o gov.br/ds.
- **Carregar o script de forma síncrona no `<head>`:** penaliza todas as páginas
  com um runtime externo pesado.
- **Embutir o VLibras como componente do DS por tela:** duplicaria o widget;
  ele é por-sessão, responsabilidade do shell.

## Implementação (follow-up, após aprovação)

- Guia/`docs/component-api.md`: contrato de integração do VLibras (snippet +
  lazy-load + nota de z-index) e do link de declaração.
- Kits Admin/Portal/hub: VLibras lazy demonstrado; validar z-index contra
  popover de acessibilidade, drawer e toasts.
- Criar a página de declaração modelo (`acessibilidade.html`) e apontar o link
  "Acessibilidade" da faixa gov.br (Admin, Portal e hub) para ela.

## Atualização (2026-05-27) — defeito de assets do VLibras e shim de fallback

Ao validar a implementação, constatou-se que **a infra do próprio VLibras está
servindo imagens quebradas**: requisições aos PNGs internos do widget
(`.../app//assets/brazil.png`, `1AC.png`, … — bandeiras do Regionalismo e logos
dos Realizadores) retornam **302 → `cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@sgd/app/assets/...`**,
que por sua vez responde **301 → `text/plain`** (não a imagem). Isso ocorre em
**qualquer site** que embuta o widget oficial — é defeito externo, não da nossa
integração (o snippet usa `new VLibras.Widget()` sem argumento, o `rootPath`
padrão oficial; assets com versão como `access_icon.svg?v=…` carregam 200).

**Investigação:** os mesmos assets existem **funcionais** no mirror do
repositório no jsDelivr —
`cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@master/app/assets/X.png`
responde **200 image/png**. Só o branch `@sgd` (alvo do redirect da
vlibras.gov.br) está quebrado.

**Decisão:** **manter o VLibras** nos kits/hub/declaração (o objetivo é oferecer
Libras), com um **shim de fallback cirúrgico** em `assets/uniplus-vlibras.js`:
ao detectar o evento `error` de uma imagem do widget, reaponta **apenas aquele
asset** para o mirror funcional (`@master`). O carregamento primário permanece
100% oficial; avatar/`.svg`/`.jpg` não disparam erro e ficam intocados. Quando
o VLibras corrigir a origem, o shim deixa de atuar (nenhum `error`).

> Alternativas descartadas: **remover o widget** (não atende ao objetivo de
> oferecer Libras); **apontar todo o `rootPath` para o jsDelivr** (frágil —
> alguns assets retornaram 403 no mirror e o player do avatar pode não servir
> bem por lá).
