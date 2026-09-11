# Acceptance and evidence

Required gates: build, core, real runtime, workflow, persistence, real abstention, export integrity and same-machine clean setup. The packaged required check list is preserved in artifacts/evidence/acta/index.json.

- Core: source span authority, malformed selections, explicit exact-text review, idempotency, immutable records, stale source/facts, cancellation, switching cases, source-review forgery, template constraints, trusted-key/tamper verification, rejection of a corrupted stored record, model relevance rejection and canonical exclusion binding.
- Evaluation: freeze original 20 Vigía questions plus 12 ACTA ordinary/missing/unsupported/adversarial questions before measured runs. Retain per-question native results and failures; do not change expectations to improve a score.
- Browser: actual UI with real QVAC, inspected sources, missing document, unsupported question, prepared contact, explicit automated review, exact text including whitespace, durable reload, original and altered export.
- Persistence: browser reload, restarted service and separate Node process reading the durable SQLite record.
- Clean setup: source checkpoint, fresh npm ci, verified local model provisioning, build/core/actual browser workflow. Same-machine means same-machine; never infer independent-machine or physical-device acceptance.
- Evidence hashes inventory artifacts and source identity. The generic index validator does not itself validate model semantics or authenticate human acceptance.

The actor automation:synthetic-e2e is a test actor. Enforced offline inference is a separate gate from a local-only observed run. No bank employee acceptance, production approval or account operation is claimed.
