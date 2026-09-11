# Current default workflow: documentary continuity

The default Spanish UI serves a branch employee reviewing an account-opening packet across two visits. PDFParse extracts text locally from text PDFs; TXT/Markdown are also accepted. Original bytes, SHA-256, canonical text and page/line spans are retained. Scans without a text layer are rejected explicitly; OCR is not implemented.

QVAC proposes one document kind and six nullable source-bound fields using the already provisioned Qwen3 model. The service rejects unsupported literal values and nonexistent source lines, then filters fields by document kind while preserving out-of-scope proposals. This is syntactic evidence validation, not semantic correctness or injection immunity. The employee can correct the kind and literal fields before confirming. Manual reading is available and recorded explicitly when local inference fails.

The reconciliation service extends the existing case service, SQLite store, exact-review guards and Ed25519 export. A synthetic versioned guide checks the reviewed packet for matching holder/identity/address, document dates and missing income evidence. Pending or incomplete readings remain internal review rather than automatically becoming customer requests. No credit or account decision is made.

New files explicitly identify which document they replace. Identical original bytes are detected as duplicates. Prior documents and signed reviews remain retained; a response opens the next revision in the same case. The prepared request lists only reviewed missing/conflicting requirements. It is never sent by ACTA.

Current remaining review fixes and tested scope are in [delivery status](00-status.md). The old procedure-selection flow remains available at /legacy and continues to use its historical evidence and protocol identifiers.

---

# Implementation decisions

ACTA is a standalone Node.js 24 ESM application with a static Spanish browser interface and loopback-only HTTP service. QVAC 0.18.2 and native llama addon 0.45.0 are pinned. No framework, mobile surface or remote inference is required.

## Boundaries

Browser → case service → one QVAC worker → one verified local Qwen3-1.7B Q4_0 model. A dedicated Bare entry registers only LLM completion. Requests have a 90-second bound, one active inference, exact prompts and native metrics. The model chooses a canonical guide section or abstains; the server supplies the text. Whole-corpus selection replaces the upstream lexical top-two gate. A second local model pass checks whether the selected passage answers the question. Explicit canonical exclusions can veto a selection; their exact spans and raw model output are retained. These checks reduce errors but do not replace source review.

SQLite uses WAL, synchronous FULL and a transaction that saves the immutable signed record and case state together. Idempotency keys bind identical save requests. Exact reviewed Unicode text, whitespace and SHA-256 survive reload. Ed25519 exports are checked against the installation's independent trusted public key, not simply the key carried in the export.

The case service binds caseId, revision, guide hash/version, queryId, runId, canonical spans and exact final text. Fact changes invalidate prior results/review/contact. The service checks the active case, generation and source again after asynchronous completion and immediately before save. Saved records cannot be silently edited.

The browser uses a random session capability and server-owned active-case selection. Mutating requests require this capability and reject other origins/hosts. This is local synthetic session isolation, not authenticated multi-employee authorization.

## Contact template

A prepared message requires the reviewed documentary requirement and missing-document procedure, a controlled missing item and confirmed demonstration route. Internal notes are excluded. Prepared, reviewed and not-sent metadata persist in the record. There is no delivery capability.

## Provenance and portability

[NOTICE](../../../NOTICE.md) and [donor inventory](../../../third-party/donor-inventory.json) bind reused/adapted files and licenses. Model bytes, private keys and local databases remain outside Git. Model provisioning uses an immutable URL and verifies size/SHA-256. Paths are project-relative or environment-configurable.

Status colors green (#226548) and amber (#875510) are ACTA UI choices. Caja-derived colors retain their documented roles. Fonts use an offline system fallback.
