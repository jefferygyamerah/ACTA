# ACTA product and delivery plan

**Research update - 10 September 2026:** Panama's regulator documents onboarding and customer-update friction, and a vendor reports a close internal document assistant already deployed locally. Keep the incomplete-case review journey; its specific value at Caja remains a hypothesis to validate. See [Panama evidence and competitive check](research-panama.md).

**Bank submission: ACTA**

ACTA is a dedicated banking submission with its own five-minute video; the teammate continues Vigía. The repository currently contains documentation only. Application code has not been extracted or executed here, and all implementation details below are plans or explicitly identified upstream observations.

**Decision**

Build a staff-facing banking case assistant from the banking module (src/sucursal/) in Vigía.

Working pitch: “Procedimientos claros. Expedientes revisables. IA dentro de la sucursal.”

The user is a branch employee handling an incomplete customer request. The bottleneck is finding the applicable procedure, identifying missing information, and leaving a useful record for the next employee or supervisor. The smallest credible win is one synthetic account-opening request that ends with cited steps, a documented exception and a verifiable human-reviewed record.

Adoption path: a bank supplies a versioned approved guide and pilots the workflow with branch staff. The demonstration uses a fictitious bank and fictitious rules. It does not represent Caja policies or execute bank operations.

**What already exists**

Inspected Vigía commit 942b94307265f383ac941141a6a503e69ebcd079, including banking fixtures, guide, HTTP handlers, case state and direct dependencies.

Existing capabilities:

- Term-based retrieval over the local guide.
- QVAC selection of a supported procedure.
- Literal source-backed steps and citations.
- Explicit abstention outside guide coverage.
- Cases with cited steps and human observations.
- Persistent case history, closure, signed export and offline verification.

The guide contains account-opening requirements, document requirements and a missing-document exception. Those support a coherent daily-workflow demonstration.

The reported 18/20 total correct results include 5/5 out-of-scope abstentions. Many questions contain exact procedure identifiers. Preserve that evidence, but test ordinary staff phrasing before making stronger accuracy claims.

Sources: [guide](https://github.com/cpu-16/vigia/blob/942b94307265f383ac941141a6a503e69ebcd079/fixtures/sucursal/guia-bpl.md), [test questions](https://github.com/cpu-16/vigia/blob/942b94307265f383ac941141a6a503e69ebcd079/fixtures/sucursal/casos.json), [case state](https://github.com/cpu-16/vigia/blob/942b94307265f383ac941141a6a503e69ebcd079/src/sucursal/expediente.js), [HTTP routes](https://github.com/cpu-16/vigia/blob/942b94307265f383ac941141a6a503e69ebcd079/src/sucursal/http.js).

**Main journey**

1. An employee starts a synthetic account-opening request.
2. They ask in ordinary Spanish which documents the demonstration guide requires.
3. ACTA shows the relevant procedure and exact supporting passage.
4. The employee records a missing document and asks how to handle it.
5. The assistant returns the guide’s exception procedure; the employee records the request as pending and adds a human note.
6. When the next action is customer contact, the employee confirms the missing-item category and approved delivery route, then previews and reviews a template-based message, email or conversation guide. Use synthetic data and save the prepared wording with the demonstration case; copying it does not record contact as completed.
7. A separate out-of-scope question produces an unsupported result.
8. The employee reviews the steps, observation and communication draft, closes the review record and exports it.
9. Reload the saved record; verify the original export and reject a deliberately changed copy.

Closing a review record does not resolve missing documents, activate an account or certify a bank transaction. Keep request disposition separate from the record’s open/closed lifecycle.

**Bounded product improvement**

Make the case the center of the screen. Keep the request, guide section/version, cited steps, human observations and closure controls together.

Existing case observations can hold missing-information notes. A clearly labeled human disposition such as “Pending documents” is a small optional addition if persisted, exported and verified. An automatic document checklist is new functionality and should not be described as implemented.

Borrow Notare’s interaction pattern: source beside output, explicit correction, deliberate approval. Avoid porting patient/encounter state. Notare’s encrypted vault is a future adaptation; it is not a drop-in banking dependency.

**Customer-contact feature**

The agreed template-based scope, Panama legal sources, cybersecurity controls and synthetic-data boundary are maintained in [Customer contact, privacy and security](privacy-security.md). This feature is proposed and timeboxed; follow that document before implementation.

**Independent extraction**

Use a separate working copy and bank submission repo. Preserve MIT attribution and accurately identify inherited team components.

| Source | Purpose |
|---|---|
| Vigía src/sucursal/ | Retrieval, validated responses, routes and case workflow |
| src/core/runtime.js and rendimiento.js | Local QVAC inference and performance evidence |
| src/core/eventos.js and sello.js | Persistent events and signed closure |
| app/sucursal.html | Starting banking UI |
| app/verificar.html and verificar.js | Offline content verification |
| Banking fixtures and tests | Regression baseline |
| Notare review interaction | Source visibility, correction and approval design |

The current banking HTML also calls shared evidence, dictation and read-aloud routes. Supply those routes or remove their controls cleanly in the standalone host. Copying only src/sucursal will not make the app self-contained.

Retain the tested SDK version. Prioritize local execution on the actual demo machine. Voice is optional. Records signed by Vigía remain plaintext: signatures do not provide encryption, bank approval or independent identity verification.

**Evaluation**

Retain the existing 20 cases. Freeze 12 new questions before tuning:

- Four ordinary staff questions about documents and request handling.
- Three missing-information or exception questions.
- Three out-of-scope questions.
- Two attempts to induce unsupported or invented procedures.

Do not include procedure identifiers or exact expected phrases in the new questions.

Record procedure selection, supporting section, correct abstention, unsupported instruction count, latency and output. Separately check persistence, human observations, closure and export verification.

Acceptance for the demonstrated flow:

- Every published step has actual supporting source text.
- Unsupported examples abstain in the observed runs.
- Human observations are not presented as AI-verified facts.
- Pending-request status survives reload and export.
- Closed records reject silent edits.
- Original export verifies and changed export fails.
- Declared offline operation is observed after model provisioning.
- Hardware and model labels match the current run.

Report failures and denominators. Measure assisted task time directly; claim time saved only after measuring a comparable manual baseline.

**Five-minute banking video**

Target 4:50–4:55. Narration in Spanish. Use the whole video for banking.

| Time | Demonstration |
|---|---|
| 0:00–0:25 | Branch employee, incomplete request, concrete problem |
| 0:25–1:05 | Ordinary-language document question and source passage |
| 1:05–1:45 | Missing document, cited exception, human pending disposition |
| 1:45–2:25 | Prepare a minimal customer-contact template from the synthetic case; review and save it |
| 2:25–2:50 | Out-of-scope question and explicit abstention |
| 2:50–3:25 | Actual local execution without external connectivity; model/hardware |
| 3:25–4:10 | Human review, save/reload including the draft, and export |
| 4:10–4:30 | Original export verifies; altered copy fails |
| 4:30–4:55 | Small evaluation table, limits and proposed bank pilot |

Suggested opening:
“Cuando una solicitud llega incompleta, el colaborador necesita encontrar el procedimiento correcto y dejar claro qué falta. ACTA reúne la guía, la revisión y el expediente en un flujo que funciona con IA local.”

Suggested closing:
“Demostramos el flujo con una guía y solicitudes ficticias. El siguiente paso es evaluarlo con procedimientos aprobados y colaboradores de una sucursal, midiendo tiempo de revisión, correcciones y solicitudes que requieren seguimiento.”

**Nominal 18-hour allocation**

Adjust to the actual remaining time; this does not refresh the earlier estimate.

| Hours | Work | Exit condition |
|---|---|---|
| 0–2 | Separate copy, bank host, local model startup | Supported query works on the actual machine |
| 2–5 | Case-centered UI, human disposition and timeboxed contact draft | Missing-document journey and reviewed draft persist and export |
| 5–7 | Plain-language evaluation and focused fixes | Original and new cases measured |
| 7–9 | Persistence, offline operation and verification | Complete observed journey |
| 9–12 | Capture and assemble video | Spanish cut under five minutes |
| 12–14 | README, evidence and limited corrections | Reproducible setup and truthful claims |
| 14–16 | Verify access and submit | Repo/video accessible; submission receipt saved |
| 16–18 | Buffer | Recovery only |

If startup blocks the first slice, use the next block to repair it and retain the existing observation field instead of adding a new checklist or disposition UI.

Defer new OCR capture, SDK upgrades, clinical-model repurposing, encrypted-vault port, automatic supervisor messaging, account activation, transaction execution, a policy editor and new multi-agent workflows.

**First implementation checkpoint**

A bank-only entry point that runs a local supported query, opens a case, records a human observation, closes it and verifies its export. Once that works, improve presentation and evaluate ordinary staff phrasing.

The [Caja challenge](https://www.trydojo.io/hackathons/decentralized-ai-hackathon?tab=tracks) explicitly includes internal procedure assistance and document workflows. Its emphasis on applicability, local execution and demo quality supports this scope. Sponsor fit does not establish customer demand.
