# Repository Guidelines

## Project Structure & Module Organization

This is a static Uni+ Design System package. Core CSS lives at the root:
`tokens.css` for design tokens, `base.css` for reset/accessibility utilities,
and `components.css` for reusable component classes and patterns. Runtime
helpers and institutional assets are in `assets/`. Component cards live in
`preview/`; the generated index is `preview/index.html`. Full-page kits live in
`ui_kits/portal/` and `ui_kits/admin/`. Technical references are in `docs/`.

## Build, Test, and Development Commands

Install tooling with:

```bash
npm ci
```

Run CSS linting:

```bash
npm run lint:css
npm run lint:css:fix
```

Serve locally with:

```bash
python3 -m http.server 8000
```

Review `preview/index.html`, `ui_kits/portal/index.html`, and
`ui_kits/admin/index.html` in light, dark, and contrast themes.

## Coding Style & Naming Conventions

Write mobile-first CSS and add breakpoints with `min-width`. Use design tokens
instead of literals: `var(--text-heading)`, not raw hex outside `tokens.css` or
explicit swatch demonstrations. Class names follow BEM-style patterns such as
`.page-header__actions` and `.btn--primary`. Preview file names use kebab-case:
`comp-empty-state.html`. Keep copy in pt-BR, sentence case, institutional, and
without emoji.

## Testing Guidelines

For this static package, manually verify every UI change at 360, 768, 1024, and
1280px, plus `light`, `dark`, and `contrast`. Keyboard-tab through interactive
surfaces, test 200% zoom, and confirm that status is not conveyed by color
alone. Run `npm run lint:css` before committing.

## Commit & Pull Request Guidelines

Use Conventional Commits, for example `feat(components): adiciona page header`,
`fix(tokens): corrige contraste dark`, or `docs: atualiza matriz WCAG`. Pull
requests should include the change summary, tested themes/viewports, screenshots
for visual updates, linked issues when applicable, and validation commands.

## Security & Configuration Tips

This repository is public. Do not commit real PII, internal raw briefings,
secrets, logs, local screenshots, `node_modules/`, or generated validation
artifacts. Keep Gov.br alignment, WCAG 2.1 AA, e-MAG 3.1, and LGPD as hard
constraints.
