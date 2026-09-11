# ACTA website — warm-final refinements (round 6)

Date: 2026-09-10. Coding model: Kimi K3 (`kimi-code/k3`, user-authorized fallback).
Scope: `website/**`, `artifacts/evidence/website/warm-final/**`, `.local/website-*` only.
No app/runtime/data/model/key changes; app port 4318 was not started or touched;
verification is read-only against the local website service at 127.0.0.1:4321.
Earlier evidence rounds (including warm-polish 27/27) are preserved untouched.

## The six refinements — what changed and measured result

1. **Competition panel compacted on phone.** At 390px the panel is now a tight
   block: smaller type, inline presenter row, logo at 120x27px (aspect kept).
   Measured: **167px tall at 390px** (target <=200px; was ~284px). Check
   `comp-panel-compact-390`. Desktop panel unchanged (logo 180px, 188x43 natural).
2. **Hero photograph moved ahead of the long copy on phone.** `index.html` hero
   is now a `.hero-grid` with DOM order heading block -> photo -> supporting
   paragraph/actions. Measured at 390x844: photo top 517px, **100% of the photo
   inside the first viewport**; lead paragraph starts at 862px. DOM order check
   confirms h1 -> figure -> lead (keyboard/reading order). Desktop keeps the
   two-column composition (photo right column, 535px wide, vertically centered);
   check `hero-desktop-composition`. The support block renders statically
   (no scroll-reveal) so first-viewport copy is never hidden; all other reveals
   unchanged. Captures: `screenshots/hero-mobile-390.png`, `hero-desktop.png`.
3. **Concise captions.** Both generated-scene captions replaced with
   "Escena conceptual generada · Atención documental en sucursal." and
   "Escena conceptual generada · Revisión de un documento." (EN: "Document
   assistance at a branch." / "Reviewing a document at the branch."). Production
   exclusions and run-together text removed; a space separates tag and caption.
   ES and EN verified exactly after a locale toggle: check `caption-locale`.
4. **Footers consolidated** (index + evidence): three paragraphs each — synthetic
   scope + event identity (Decentralized AI Hackathon · Track05), the exact
   unchanged no-affiliation sentence, and logo ownership. Duplicated synthetic /
   not-official wording and the internal-port sentence removed (the app CTA
   nearby already points to 127.0.0.1:4318). Check `footer-consolidated`, both
   pages, both locales.
5. **Section numeral contrast.** `.sec-num` text now uses the existing `--warn`
   tone; gold remains on the border. Measured computed contrast: visita-1 6.19,
   visita-2 5.89, revision-humana 5.35 (warn on light grounds), fuentes 9.25
   (yellow on navy) — all >= 4.5:1. Check `sec-num-contrast`.
6. **README updated.** `website/README.md` no longer says the conceptual photos
   are pending; it records them as delivered/accepted static assets and states
   local-only loopback delivery (no publication/hosting).

## Verification

New helper `.local/website-warm-final-verify.mjs` (adapted from
`.local/website-warm-verify.mjs`; the older helper and its evidence are
untouched). It runs the full applicable regression set plus the new measured
checks above: **33/33 pass, 0 fail, 0 pending** — see `verification.json`,
which also records the seven fresh website source hashes and reconfirms all 50
app source hashes from workflow-v6 (no app/QVAC rerun).

Screenshots (`screenshots/`): settled desktop per-section captures, desktop and
mobile hero viewports, full-page desktop/mobile-390, close at mobile-390 and
1366x768, full-page evidence page. Every capture waits for image decode, scroll
stability and reveal opacity 1; the mobile hero check measures geometry at the
settled top rather than claiming promptness.

## Limits of this evidence

- Mobile results are Edge viewport emulation (Playwright), not a physical phone.
- The ACTA application (port 4318) was stopped during this round; the site's
  "Abrir ACTA" CTA target was therefore not exercised — no request to 4318/4320
  was made or required by any check.
- The app service, approved video script and all accepted media assets are
  unchanged; no narration, video, deployment or publication work was done here.
