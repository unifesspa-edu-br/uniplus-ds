# Paginação cursor-based — Guia do time

> **Por que isso importa:** a API do Uni+ usa **cursor opaco transportado em
> headers HTTP `Link`** (RFC 8288). O body é sempre um array JSON puro do
> recurso, sem envelope. Toda paginação no frontend tem que seguir esse
> contrato — listar editais, inscrições, documentos, candidatos. Este guia é
> o padrão que você deve copiar.

> **ADRs canônicos:** ADR-0025 / ADR-0026 (coleções como array puro),
> ADR-0031 (cursor cifrado AES-GCM), ADR-0015-web (tipo `Cursor` branded no
> shared-core/http).

---

## 1. O contrato da API

A paginação é **baseada em cursor opaco**, transportada em **headers HTTP**
(RFC 8288), **não** num envelope no body. O body de uma coleção é **sempre
um array JSON puro** do recurso.

```
HTTP/1.1 200 OK
Link: <https://api/editais?cursor=eyJ...opaque>; rel="next",
      <https://api/editais?cursor=eyJ...opaque>; rel="prev",
      <https://api/editais>; rel="self"
X-Page-Size: 20
Content-Type: application/json

[
  { /* item */ },
  { /* item */ }
]
```

- **`Link`** (RFC 8288) carrega os cursores nas relações `rel="next"`, `rel="prev"` e `rel="self"`.
  O cursor vem no query param `cursor=` de cada URI.
- **Ausência de `rel="next"`** significa que não há próxima página — é assim que o front sabe que chegou ao fim. **Não existe campo `hasNext` no body**.
- **Cursores são opacos**: o front nunca decodifica, só extrai a URI do `Link` e repassa.
  No servidor o cursor é um payload AES-GCM cifrado (base64url), decodificado apenas no boundary HTTP.
- **`X-Page-Size`** é a quantidade de itens efetivamente retornados nesta página (confirmação),
  não o tamanho solicitado.

### Endpoints

```
GET /editais?cursor=<base64url>&limit=20    # cursor define posição E direção
GET /editais?limit=20                        # primeira página (sem cursor)
GET /editais                                 # primeira página, limit default = 20
```

- **`cursor`** (string opaca, base64url) — recebido do header `Link` da resposta anterior.
  Ausente ⇒ primeira página. **A direção (next/prev) está codificada dentro do cursor**,
  não há param `direction`.
- **`limit`** (inteiro) — tamanho da página. Default **20**, faixa válida **1–100**.

### Erros de cursor

| Situação                                        | HTTP | Código                               |
|-------------------------------------------------|------|--------------------------------------|
| Cursor malformado / adulterado / cross-resource | 400  | `uniplus.pagination.cursor_invalido` |
| Cursor expirado (TTL 15 min)                    | 410  | `uniplus.pagination.cursor_expirado` |
| `limit` não-numérico ou fora de [1,100]         | 422  | `uniplus.pagination.limit_invalido`  |

**Recuperação de `cursor_expirado` (410):** o usuário deixou a tela aberta >15 min.
Reset do paginador para a primeira página + toast informativo:
*"A listagem foi atualizada. Mostrando do início."* — não relançar erro para o usuário.

---

## 2. Por que cursor, não offset

| | **Offset** (`?page=12&perPage=20`) | **Cursor** (`?cursor=…&limit=20`) |
|---|---|---|
| Query SQL | `OFFSET 240 LIMIT 20` | `WHERE id > :decoded_cursor LIMIT 20` |
| Performance | O(n) — escaneia 240 linhas | O(log n) — usa índice |
| Linhas instáveis | Salta/repete quando algo é inserido | Estável |
| Total conhecido | Sim (custa um `COUNT(*)` extra) | Não |
| UX "página 3 de 12" | Possível | **Impossível** |

Em tabelas com 1M+ linhas (inscrições do SISU), offset com `OFFSET 50000` mata
o índice. Cursor é a única escolha viável em escala. O custo é UX: você não
pode prometer "página X de Y".

---

## 3. UI / Design System

O componente é `.pager` (em `components.css`). **Não existe mais paginação numerada** — foi removida.

```html
<nav class="pager" aria-label="Paginação dos editais">
  <button class="pager__btn" data-pager="prev" disabled aria-label="Página anterior">
    <svg>…</svg> Anterior
  </button>
  <span class="pager__status" aria-live="polite">
    <span class="pager__page">Página 1</span> · 20 resultados nesta página
  </span>
  <button class="pager__btn" data-pager="next" aria-label="Próxima página">
    Próximo <svg>…</svg>
  </button>
</nav>
```

**Regras de copy:**

- ✓ "Página N · K resultados nesta página"
- ✗ "Página 3 de 12" — não temos o total
- ✗ "Mostrando 21–40 de 247" — não temos o total
- ✓ "Próximo" / "Anterior"
- ✗ "Página seguinte" (verbose, ocupa espaço em mobile)

**Estados:**

| Situação | `prev` | `next` |
|---|---|---|
| Primeira página (`Link` não tem `rel="prev"`) | `disabled` | habilitado se `rel="next"` presente |
| Meio | habilitado | habilitado |
| Última página (`Link` não tem `rel="next"`) | habilitado | `disabled` |
| Lista vazia | `disabled` | `disabled` |

**Acessibilidade:**

- `<nav aria-label="Paginação…">` em volta
- `aria-live="polite"` no status, pra screen reader anunciar mudança
- Cada botão com `aria-label` redundante ao texto (cobre ícones-only em mobile)
- ≥ 44 × 44 (piso do design system)

---

## 4. Exemplo de implementação no app consumidor

Este exemplo é referência lógica para apps consumidores. O pacote Uni+ Design
System continua CSS-only e não entrega os arquivos TypeScript abaixo.

### 4.1. Parse do header `Link` no app consumidor

```typescript
type Cursor = string & { readonly __brand: 'Cursor' };

interface ParsedLinks {
  next?: Cursor;
  prev?: Cursor;
  self?: Cursor;
}

/** Extrai cursores das relações next/prev/self do header Link (RFC 8288). */
export function parseLinkHeader(header: string | null): ParsedLinks {
  if (!header) return {};
  const out: ParsedLinks = {};
  // Link: <https://api/x?cursor=A>; rel="next", <https://api/x?cursor=B>; rel="prev"
  const entries = header.split(/,(?=\s*<)/);
  for (const raw of entries) {
    const match = raw.trim().match(/^<([^>]+)>;\s*rel="?(next|prev|self)"?$/);
    if (!match) continue;
    const url = new URL(match[1]);
    const cursor = url.searchParams.get('cursor');
    if (cursor) out[match[2] as keyof ParsedLinks] = cursor as Cursor;
  }
  return out;
}

export function extractNextCursor(header: string | null): Cursor | undefined {
  return parseLinkHeader(header).next;
}
export function extractPrevCursor(header: string | null): Cursor | undefined {
  return parseLinkHeader(header).prev;
}
```

### 4.2. `CursorPaginator<T>` no app consumidor

```typescript
export interface CursorPage<T> {
  items: T[];
  next?: Cursor;
  prev?: Cursor;
  pageSize: number;     // do header X-Page-Size
}

export class CursorPaginator<T> {
  private history: Array<Cursor | undefined> = [undefined]; // undefined = first page
  private page: CursorPage<T> | null = null;

  get pageNumber() { return this.history.length; }
  get currentCursor() { return this.history.at(-1); }
  get items() { return this.page?.items ?? []; }
  get pageSize() { return this.page?.pageSize ?? 0; }

  // AUTORIDADE = presença de cursor next/prev no header Link, não um campo do body.
  get hasNext() { return !!this.page?.next; }
  get hasPrev() { return this.pageNumber > 1; }

  next() {
    const cur = this.page?.next;
    if (!cur) return;
    this.history = [...this.history, cur];
  }

  prev() {
    if (this.pageNumber <= 1) return;
    this.history = this.history.slice(0, -1);
  }

  reset() {
    this.history = [undefined];
    this.page = null;
  }

  setPage(p: CursorPage<T>) { this.page = p; }
}
```

### 4.3. Fluxo de consumo

```typescript
async function loadPage<T>(
  paginator: CursorPaginator<T>,
  list: (params: { cursor?: Cursor; limit: number }) => Promise<CursorPage<T>>,
  toast: { show(message: string): void },
) {
  try {
    const page = await list({ cursor: paginator.currentCursor, limit: 20 });
    paginator.setPage(page);
  } catch (err) {
    if (isCursorExpired(err)) {
      paginator.reset();
      toast.show('A listagem foi atualizada. Mostrando do início.');
      return;
    }
    throw err;
  }
}

function isCursorExpired(err: unknown) {
  return typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'uniplus.pagination.cursor_expirado';
}
```

### 4.4. Cliente HTTP com `fetch` + `parseLink`

```typescript
async function listEditais(params: { cursor?: Cursor; limit?: number }): Promise<CursorPage<Edital>> {
  const url = new URL('/editais', window.location.origin);
  if (params.cursor) url.searchParams.set('cursor', params.cursor);
  if (params.limit) url.searchParams.set('limit', String(params.limit));

  const response = await fetch(url);
  if (!response.ok) throw await response.json();

  const items = await response.json() as Edital[];
  const links = parseLinkHeader(response.headers.get('Link'));

  return {
    items,
    next: links.next,
    prev: links.prev,
    pageSize: Number(response.headers.get('X-Page-Size') ?? items.length),
  };
}
```

### 4.5. Markup do pager

```html
<nav class="pager" aria-label="Paginação">
  <button class="pager__btn" type="button" disabled aria-label="Página anterior">
    <svg aria-hidden="true">…</svg> Anterior
  </button>
  <span class="pager__status" aria-live="polite">
    <span class="pager__page">Página 1</span>
    · 20 resultados nesta página
  </span>
  <button class="pager__btn" type="button" aria-label="Próxima página">
    Próximo <svg aria-hidden="true">…</svg>
  </button>
</nav>
```

---

## 5. Edge cases

### Cursor expirado (TTL 15 min) ⇒ HTTP 410
Trate no fluxo de listagem do app consumidor. Reset + toast, jamais propagar
como erro bruto para a UI.

### Refresh / F5
Cursores são opacos e podem expirar. **Não persistir cursor na URL.** Refresh
volta pra primeira página — o usuário entende. Para deep link de item
específico, use rota dedicada (`/editais/:id`).

### Item inserido entre fetches
Cursor é estável quanto a duplicatas, mas pode deixar de mostrar item novo na
página atual. UX: toast "atualize para ver novos itens" via SSE no futuro.

### Filtro / ordenação mudou
**Sempre `reset()` o paginador quando filtro ou ordenação mudam.** Cursores
estão acoplados à query que os gerou; reusar em filtro diferente retorna 400
`cursor_invalido`.

### Mudança de `limit`
Idem — resetar. O limit está implícito no cursor.

---

## 6. O que NÃO fazer

- ❌ Esperar campo `hasNext` no body. A presença/ausência de `rel="next"` no `Link` é a única verdade.
- ❌ Esperar envelope no body (`{ data: [...], meta: {...} }`). Body é array puro.
- ❌ Calcular total fingindo: `pageNumber × pageSize` não é o total.
- ❌ Mostrar "Última página" como botão (não temos a referência sem buscar tudo).
- ❌ Permitir input numérico de página. Cursor não suporta jump direto.
- ❌ Cachear cursores entre sessões. Opacos + TTL 15 min ⇒ vão expirar.
- ❌ Decodificar cursor pra extrair informação. É opaco por contrato.
- ❌ Passar `direction=next|prev` na URL. A direção está codificada no cursor.

---

## 7. Checklist de PR no app consumidor

Quando você adicionar uma lista paginada nova:

- [ ] Cliente HTTP retorna `CursorPage<T>` usando `parseLinkHeader`
- [ ] Estado local usa um `CursorPaginator<T>` equivalente
- [ ] Template usa o markup `.pager` documentado aqui (nunca paginação numerada)
- [ ] Filtros, ordenação e mudança de `limit` chamam `reset()`
- [ ] Tratamento de `uniplus.pagination.cursor_expirado` (410) ⇒ reset + toast
- [ ] Estado vazio cobre "primeira página vazia" (empty state amigável)
- [ ] Loading state em transição (preferir skeleton)
- [ ] `aria-label` no `<nav>` descreve o que está paginado
- [ ] Teste e2e: 1ª página sem `prev`, meio com ambos, última sem `next`, expirado ⇒ reset

---

## Referências

- **ADRs:** ADR-0015-web (tipo `Cursor` branded), ADR-0025 / ADR-0026 (array puro), ADR-0031 (cursor cifrado AES-GCM)
- **RFC 8288** — [Web Linking](https://datatracker.ietf.org/doc/html/rfc8288)
- **Stripe API design** — [Pagination](https://stripe.com/docs/api/pagination)
- **GitHub REST API v3** — [Traversing with pagination](https://docs.github.com/en/rest/guides/using-pagination-in-the-rest-api)
