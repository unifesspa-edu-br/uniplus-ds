# Uni+ Design System

Design System do **Uni+ - Sistema Unificado de Selecao e Ingresso da
Unifesspa**. Este repositório concentra tokens, estilos base, componentes CSS,
helpers JavaScript, previews e UI kits usados para padronizar as interfaces dos
fluxos de selecao, inscricao, acompanhamento, classificacao e ingresso.

O pacote é estático, CSS-only e serve como fonte publica de referencia para
interfaces Uni+ em Angular, PrimeNG unstyled, Tailwind ou outros stacks. Este
repositório nao entrega wrappers Angular nem componentes TypeScript; ele define
tokens, classes, anatomia HTML, comportamento esperado e contratos de
acessibilidade. Ele prioriza acessibilidade, consistencia institucional Gov.br,
mobile-first e LGPD.

## Status

- Auditoria completa do Design System realizada em 25-mai-2026.
- Pontos P0/P1 fechados e regressões de contraste/acessibilidade revisadas.
- UI kits `portal` e `admin` validados em 320, 360, 375, 390, 768, 1024 e
  1280px, nos temas `light`, `dark` e `contrast`, com checagem de overflow,
  axe serious/critical e contraste computado.
- `tokens.css`, `base.css` e `components.css` sao a base estavel.
- O arquivo historico `Auditoria do Design System.html` permanece como registro
  de contexto, nao como backlog ativo.

## Principios

- **Acessibilidade como piso:** WCAG 2.1 AA, e-MAG 3.1, foco visivel,
  navegacao por teclado, alvos interativos de pelo menos 44px e estado nunca
  comunicado apenas por cor.
- **Mobile-first:** a interface nasce em 320px, deve passar no iPhone SE
  (375px) e escala com breakpoints progressivos.
- **Tokens semanticos:** componentes consomem `--surface-*`, `--text-*`,
  `--border-*` e `--color-*`; hex literal fora de `tokens.css` e swatches
  demonstrativos e proibido.
- **Gov.br e Unifesspa:** a identidade visual usa a paleta institucional,
  estrutura publica federal e linguagem pt-BR clara.
- **LGPD:** exemplos nao devem expor CPF real, nome completo, endereco, e-mail
  real ou qualquer dado pessoal sensivel.

## Estrutura

```text
.
├── tokens.css                  # tokens de cor, tema, tipo, espacamento, foco
├── base.css                    # reset, tipografia, utilitarios e foco
├── components.css              # componentes e patterns CSS canonicos
├── assets/                     # logos e helpers JS de runtime
├── docs/                       # API de componentes, tokens, contraste e guias
├── preview/                    # cards de preview e indice navegavel
├── ui_kits/
│   ├── portal/                 # kit do Portal do Candidato
│   └── admin/                  # kit administrativo CEPS/CRCA
├── AGENTS.md                   # guia curto para contribuidores/agentes
├── SKILL.md                    # entrada de skill para reuso por agentes
└── Auditoria do Design System.html
```

Arquivos de trabalho local, capturas, dependencias instaladas e artefatos de
entrada ficam fora do versionamento por `.gitignore`.

## Temas

O Design System suporta quatro modos por `data-theme`:

```html
<html lang="pt-BR" data-theme="auto">
```

| Tema | Uso |
|---|---|
| `auto` | segue `prefers-color-scheme` |
| `light` | tema claro explicito |
| `dark` | tema escuro explicito |
| `contrast` | alto contraste com paleta dedicada |

Os tokens usam `light-dark()` com fallback claro para browsers sem suporte. O
tema `contrast` redefine superficies, texto, bordas e feedback com ratios
documentados em `docs/contrast.md`.

## Instalação

```bash
npm ci
```

O projeto usa `stylelint`, `stylelint-config-standard`, `lint-staged` e Husky
para validar CSS. Nao ha etapa de build obrigatoria: os previews e UI kits sao
HTML/CSS/JS estaticos.

## Comandos

```bash
npm run lint:css
```

Valida `tokens.css`, `base.css` e `components.css`.

```bash
npm run lint:css:fix
```

Aplica correcoes automaticas de Stylelint quando possivel.

```bash
python3 -m http.server 8000
```

Serve o pacote localmente. Acesse:

- `http://localhost:8000/preview/index.html`
- `http://localhost:8000/ui_kits/portal/index.html`
- `http://localhost:8000/ui_kits/admin/index.html`

## Formatação e Editor

O repositório define um único padrão de formatação para evitar diffs de ruído
(arquivos que "mudam" sem conteúdo novo por causa de reformatação automática do
editor). A fonte única de formatação de CSS é o **Stylelint** — a mesma
ferramenta que roda no `pre-commit` via `lint-staged`.

Arquivos que estabelecem o contrato (não edite ad hoc):

| Arquivo | Papel |
|---|---|
| `.editorconfig` | Whitespace, charset UTF-8, fim de linha `LF`, indentação de 2 espaços e newline final — respeitado por qualquer editor. |
| `.gitattributes` | Normaliza o fim de linha para `LF` no Git, independente do SO. |
| `.vscode/settings.json` | Desliga o `formatOnSave` de formatadores concorrentes e faz o save aplicar o mesmo `stylelint --fix` do commit. |
| `.vscode/extensions.json` | Recomenda as extensões Stylelint e EditorConfig. |

### Configuração do VS Code (uma vez)

1. Ao abrir o repositório, aceite as extensões recomendadas (paleta de comandos →
   **"Extensions: Show Recommended Extensions"**) e instale **Stylelint** e
   **EditorConfig**.
2. **Não** use o Prettier neste repositório. Se o Prettier estiver definido como
   formatador padrão global, o `formatOnSave: false` do workspace já o neutraliza
   para os arquivos deste repo, mas confira que ele não está reescrevendo CSS no
   save.
3. Com isso, save e commit usam a **mesma** ferramenta com as **mesmas** regras,
   e o ruído de formatação deixa de aparecer nos diffs.

Outros editores precisam apenas de suporte a EditorConfig (nativo ou via plugin)
para herdar whitespace e fim de linha; a formatação de CSS continua garantida
pelo `stylelint --fix` no commit.

## Como Usar

Em HTML estatico, carregue os estilos nesta ordem:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
```

Em aplicações Angular/Tailwind, mantenha a mesma ordem no ponto de entrada de
estilos do projeto consumidor e exponha os tokens ao Tailwind via `@theme
inline`. Os caminhos abaixo sao ilustrativos; ajuste para a forma como estes
arquivos forem publicados ou copiados no app:

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./base.css";
@import "./components.css";

@theme inline {
  --color-primary: var(--color-primary);
  --color-surface-page: var(--surface-page);
  --color-surface-card: var(--surface-card);
  --color-text-primary: var(--text-primary);
  --color-text-heading: var(--text-heading);
  --color-border: var(--border-default);
  --radius-md: var(--radius-md);
  --font-sans: var(--font-sans);
}
```

## Componentes e Patterns

Os contratos canonicos ficam em `docs/component-api.md`. Exemplos principais:

- botoes, inputs, tags, alerts, cards e topbar;
- barra Gov.br/acessibilidade compacta e responsiva;
- stepper e wizard de inscricao;
- tabela responsiva mobile-first com `td[data-label]`;
- page header com titulo, descricao e slot de acoes;
- sidebar administrativa colapsavel no desktop e off-canvas no mobile;
- empty state, spinner, toast, drawer, dialog e uploader.

Cada componente novo deve ter CSS em `components.css`, exemplo em
`preview/comp-*.html` e documentacao em `docs/component-api.md`. Implementações
Angular, Web Components ou de outros frameworks devem viver nos projetos
consumidores, mapeando este contrato sem criar promessa de wrapper neste
repositório.

Contrato transversal para exemplos e wrappers futuros:

- toda página HTML standalone inclui
  `<meta name="viewport" content="width=device-width, initial-scale=1">`;
- toda `.gov-bar` exibe "Mapa do site", "Acessibilidade" e "Privacidade",
  nessa ordem, com o link de acessibilidade apontando para a declaração pública
  ou template disponível;
- navegações coexistentes têm `aria-label` distinto e o item corrente usa
  `aria-current="page"` além da indicação visual;
- ações de conta, como "Sair", ficam em área/menu de conta, não dentro da
  navegação principal do produto.

## Previews

`preview/index.html` lista os cards agrupados por categoria:

- Colors
- Type
- Components
- Spacing
- Brand

Ao revisar mudancas visuais, abra o indice e confira os tres temas
(`light`, `dark`, `contrast`) em 320, 360, 375, 390, 768, 1024 e 1280px.
Use 375px como proxy obrigatorio de iPhone SE e trate overflow horizontal como
falha, exceto em containers explicitamente rolaveis.

## Validação Recomendada

Antes de abrir PR ou publicar mudancas:

```bash
npm run lint:css
```

Checklist manual:

- testar `preview/index.html`, `ui_kits/portal` e `ui_kits/admin`;
- alternar `data-theme="light"`, `dark` e `contrast`;
- validar 320, 360, 375, 390, 768, 1024 e 1280px;
- navegar por teclado;
- validar 200% zoom;
- conferir contraste de texto normal >= 4.5:1;
- confirmar que headers, subnav, Gov.br stripe e barra de acessibilidade usam
  `--text-on-inverse` em superficies inversas, inclusive no tema `contrast`;
- garantir ausencia de overflow horizontal visual nao intencional;
- garantir que todo interativo mantenha alvo minimo de 44px;
- confirmar que exemplos nao trazem PII real.

## Convenções de Código

- CSS mobile-first, com media queries aditivas por `min-width`.
- Classes em estilo BEM: `.componente`, `.componente__parte`,
  `.componente--variante`.
- Arquivos HTML de preview em kebab-case, por exemplo
  `preview/comp-empty-state.html`.
- Nada de emoji, gradientes decorativos ou icones inventados.
- SVG inline apenas quando necessario para demonstrar componente.
- Texto visivel em pt-BR, sentence case e tom institucional.

## Commits e PRs

Use Conventional Commits em portugues claro:

```text
feat(components): adiciona pattern de tabela responsiva
fix(tokens): corrige contraste do tema dark
docs: atualiza matriz de contraste
chore: configura stylelint e husky
```

PRs devem incluir:

- resumo objetivo do que mudou;
- screenshots ou links de preview quando houver mudanca visual;
- temas e viewports testados;
- comandos executados;
- riscos conhecidos ou limitacoes.

## Segurança e Privacidade

Este repositório é publico. Nao versionar:

- dados pessoais reais;
- arquivos de briefing interno bruto;
- tokens, chaves, dumps ou logs;
- capturas temporarias de verificacao;
- `node_modules/` ou artefatos de build.

Use dados ficticios e mascarados nos previews. Para exemplos de CPF, e-mail e
processos seletivos, mantenha valores sem correspondencia real.

## Documentação

A documentação faz parte do contrato público do DS e deve evoluir junto com
qualquer mudança de token, componente, helper JavaScript, preview ou UI kit.

- `docs/contributing.md` - fluxo de contribuicao e regras de componente.
- `docs/component-api.md` - API, markup e ARIA dos componentes.
- `docs/tokens.md` - referencia de tokens.
- `docs/contrast.md` - matriz WCAG por tema.
- `docs/cursor-pagination.md` - padrao de paginacao por cursor.

## Licença

Licenca ainda nao definida neste snapshot. Antes de redistribuir em pacotes ou
publicar artefatos derivados, alinhe a licenca com a Unifesspa.
