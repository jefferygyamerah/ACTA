# ACTA presentation website

Static Spanish-first presentation of the ACTA prototype for the Caja de Ahorros
hackathon challenge. It is separate from the ACTA application and does not talk
to it: no API calls, no case data, immutable synthetic illustration data only.

## Run locally

Requires Node.js 24 (the same runtime as the app). From the repository root:

```powershell
node website/serve.mjs
```

Then open http://127.0.0.1:4321/ . The server binds only to loopback, serves
only the `website/` directory, rejects path traversal, dotfiles, unknown file
types and non-GET/HEAD methods. The ACTA app remains available separately at
http://127.0.0.1:4318/ and its historical evidence server at 127.0.0.1:4320;
this site does not modify or depend on either.

To stop the server, close the console or stop the recorded Node process
(PID and command are kept in `.local/website-server.json` when started through
the project tooling).

## Delivery scope (honest)

- Spanish by default with a complete English toggle persisted in localStorage;
  readable without JavaScript, with reduced motion and on 360/390 px screens.
- All interactive controls are illustrative: the source-review demo, the visit
  tabs and the acknowledgement/reset control save nothing and call no APIs.
- Real application captures in `assets/app-*.png` are unedited copies of the
  verified workflow-v6 run (2026-09-10); see `assets/PROVENANCE.md`.
- `assets/branch-visit.webp` and `assets/branch-review.webp` are delivered,
  user-accepted generated conceptual scenes (1600x1062 WebP; provenance and
  measured inspection in `artifacts/evidence/website/generated/`). They are
  static local files, served like any other asset.
- The final-video area is intentionally non-interactive until a real final
  asset exists.
- Local-only delivery: the site runs from this machine on loopback. No
  publication, no hosting, no bank deployment. Donor acknowledgements stay
  in the repository README/NOTICE, per project policy.

## Files

| File | Purpose |
|---|---|
| index.html | Six-section presentation of the two-visit case |
| evidence.html | Curated verified evidence and limits |
| styles.css | Brand palette, responsive layout, reduced-motion fallbacks |
| site.js | Language toggle, source demo, visit tabs, acknowledgement, reveals |
| serve.mjs | Loopback-only static server (port 4321) |
| assets/ | Real app captures + provenance; delivered conceptual scenes |

Verification output (screenshots, contact sheets, JSON/report) lives under
`artifacts/evidence/website/` in the repository, not in this directory.
