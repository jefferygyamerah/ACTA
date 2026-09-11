# Provenance and attribution

ACTA is a separate banking prototype. **Vigía was developed by Jeffery Gyamerah's hackathon teammate.** Its MIT copyright notice names Luis Alain and is preserved in [third-party/VIGIA-LICENSE](third-party/VIGIA-LICENSE).

## Vigía

Source: https://github.com/cpu-16/vigia/tree/942b94307265f383ac941141a6a503e69ebcd079

- Reused: `src/core/sello.js` (canonical JSON, Ed25519 signing), synthetic guide and original 20 evaluation cases.
- Adapted: guide parsing and procedure selection in `src/sucursal/`. ACTA supplies the entire bounded guide to the model, validates a section identifier, and resolves exact source spans on the server. The upstream top-two lexical gate, generated amount parsing and hybrid embeddings were omitted.
- Reimplemented for ACTA: case service, SQLite transactional persistence, immutable exact-text review, idempotent saving, session selection/revision guards, trusted-key verification, HTTP host, Spanish UI and controlled contact template.
- Omitted: upstream HTTP host, event JSONL store, case state machine, general UI, voice controls, network/P2P, dictation, semantic model and standalone verifier assets. No dormant routes require a donor checkout.

The complete original source hashes and decisions are recorded in [donor-inventory.json](third-party/donor-inventory.json). Existing protocol/guide identifiers are preserved.

## Notare

Source: https://github.com/jefferygyamerah/notare/tree/974eecd7cac8a1527e68e890e50cf6907a5198b1

ACTA adapts the narrow LLM worker entry and the load/completion metric collection pattern from `packages/runtime/bare-entry.ts`, `shared-runtime.ts` and `worker.ts`. The same MIT notice is retained. The QVAC 0.18.2 compatibility pin and verified Qwen model manifest are reused as measured compatibility references. ACTA has its own worker and source/revision record contract. No clinical data model, mobile app, OCR, medical model or encrypted vault is imported.

## ACTA planning and packaged profile

Planning source: ACTA commit `ee3bde35a6d2debe0b9679404ef195a2f237be88`. Research, privacy boundaries and accepted decisions are carried into this workspace; their historical assertions do not count as current test evidence.

Delivery records and brand tokens were scaffolded by the user's packaged app-e2e-factory profile. Source colors: [brand provenance](docs/plans/acta/05-brand.md). Poppins is named with a system fallback; no standalone web font or bank logo binary is bundled. ACTA owns its wordmark.

## Runtime dependencies

QVAC SDK and Qwen3 model: Apache-2.0, versions and immutable model revision in MODEL-MANIFEST.json. Installed dependencies retain their own license files. The project MIT license does not relicense external bank publications or runtime dependencies.

## Documentary reconciliation extension

The extension reuses ACTA CaseService, SQLite Store, local QVAC runtime, canonical source parser, Ed25519 verifier and Caja-derived UI styles. New components implement text-PDF intake, source-linked extraction proposals, synthetic-policy comparison, explicit document replacement and successive reviewed records.

pdf-parse 2.4.5 (Apache-2.0) and its PDF.js dependencies perform local PDF text extraction; installed packages preserve their license notices. No OCR model or cloud extraction service was added. Synthetic PDF fixture typography embeds Arial from the local Windows installation for demonstration documents; no bank logo or official form is reproduced.
