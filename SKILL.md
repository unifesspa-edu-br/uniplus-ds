---
name: uniplus-design
description: Use this skill to generate well-branded interfaces and assets for Uni+ (Sistema Unificado de Seleção e Ingresso da Unifesspa — UNIFESSPA, Marabá/PA), either for production reference or throwaway prototypes/mocks. Contains the canonical CSS-only design tokens, typography, components, assets and UI kits. Mobile-first, accessible (WCAG 2.1 AA + e-MAG 3.1), Inter font, light/dark/system themes, Gov.br DS aligned. Serves as visual and accessibility reference for Angular, PrimeNG unstyled, Tailwind, or other frontend stacks.
user-invocable: true
---

Read the `README.md` file at the root of this skill first — it explains the principles, the stack target, and how the CSS files compose.

If creating **visual artifacts** (slides, mocks, throwaway prototypes), copy the relevant assets out (`assets/`, `tokens.css` + `base.css` + `components.css`) and build static HTML files. Always start mobile (360px) and reflow up.

If working on **production code**, treat this repository as a CSS-only reference
contract. Import or copy the three CSS files into the consuming app and bridge
tokens into Tailwind via `@theme inline` when relevant (snippet in README). Do
not create Angular wrappers in this package.

If invoked without guidance, ask what they want to build, then act as an expert
designer/frontend dev — output static HTML artifacts or framework-specific
consumer code depending on need.

## Quick context

- Public-sector federal Brazilian system. WCAG/e-MAG/LGPD/Gov.br DS compliance is **mandatory**.
- Three Uni+ apps can consume this DS contract: `portal` (candidatos), `selecao`
  (CEPS), `ingresso` (CRCA). Their framework wrappers live outside this package.
- Personas include low literacy, low vision, dyslexia, color blindness — accessibility is the floor.
- Tone: pt-BR, acolhedor + formal-institucional, sentence case, **never emoji**, "você" not "tu".
- Use the public contract in `README.md`, `docs/`, `tokens.css`, `base.css` and
  `components.css` as the source of truth. Internal raw briefings are not
  versioned in this public repository.

## Files in this skill

- `tokens.css` — design tokens (Inter, light/dark/system/contrast, fluid type, spacing, radius, focus). Tailwind 4/5 `@theme inline` ready.
- `base.css` — reset + typography + a11y utilities (skip-link, sr-only, focus). Imports `tokens.css`.
- `components.css` — CSS components (Button, Input, Tag, Alert, Card, Topbar, Stepper, Avatar). BEM-style. Imports `base.css`.
- `assets/` — Unifesspa logos, sign-out icon, frame decoration.
- `preview/` — Design-System cards.
- `ui_kits/portal/index.html` — Portal do Candidato home (mobile-first).
- `ui_kits/admin/index.html` — Admin Painel de processos (mobile-first).
