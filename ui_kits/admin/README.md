# Administração — UI kit

Hi-fi mobile-first recreation of the **selecao** (CEPS) admin app — Painel de processos.

**Renders at 360, 768, 1024 and 1440.** Below 1024 the sidebar collapses (hamburger trigger in topbar); below 768 the data table goes into card layout with `data-label` row headers.

- Built entirely on `tokens.css` + `base.css` + `components.css`
- Same Gov.br stripe / a11y bar / brand are reused from Portal kit (admin login screens use them)
- Table demonstrates the responsive collapse pattern — copy this when building any admin table in Angular

## Caveats

- Sidebar menu is static. In Angular it would be `[routerLinkActive]` + a CDK menu trigger for mobile drawer.
- Notification dot is decorative; real component should expose count + `aria-label="3 notificações não lidas"`.
