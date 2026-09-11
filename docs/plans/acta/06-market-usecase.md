# ACTA: continuing a documentary review across visits

Decision date: 2026-09-10. This decision extends the existing ACTA application. It does not reset the hackathon deadline or establish a production banking deployment.

## The use case in one sentence

ACTA helps a branch employee review an account-opening document packet, prepare one justified list of remaining gaps, and continue the same case when the customer returns—preserving documents already checked and showing what the response resolved.

The direct user is the branch customer-service employee. The next consumer of the work is a supervisor or another employee taking over the case. The customer benefits if continuity reduces inconsistent or repeated requests; that benefit remains to be measured with actual users.

## Why this problem is credible

The strongest local demand signal is the Superintendencia de Bancos de Panamá's multi-bank simplification pilot. Its June 2025 announcement covers opening accounts and updating information. Its 2025 results presentation identifies inconsistent interpretations, gaps in customer updating and internal communication, and excessive requirements as improvement targets. The six named participating banks do not include Caja de Ahorros. This supports an institutional process problem; it does not prove this is Caja's largest bottleneck or give a repeat-visit rate.

Sources: [SBP pilot announcement](https://www.superbancos.gob.pa/node/1490), [SBP 2025 results presentation, page 23](https://www.superbancos.gob.pa/documentos/asunt_proy_int/Resultado2025.pdf), [SBP annual memory](https://www.superbancos.gob.pa/documentos/institucional/IA25/Memoria-2025.pdf).

Banco General's public update page describes recurring changes to personal information and supporting documentation for deposits. BAC documents an update process involving personal, residence and employment details, including retry paths. These are evidence of existing documentary workflows and existing digital solutions. Neither page measures how often a branch asks again for information already supplied.

Sources: [Banco General](https://www.bgeneral.com/actualiza-tus-datos/), [BAC help](https://ayuda.baccredomatic.com/seguridad_y_accesos/seguridad_y_privacidad/actualizar-mis-datos-desde-los-canales-digitales).

The three research agents' reports are retained for inspection: [Panama demand](../../../artifacts/research/market/panama-demand.md), [competitor coverage](../../../artifacts/research/market/competitor-gaps.md), [use-case challenger](../../../artifacts/research/market/usecase-challenger.md). Their statements about implementation status describe an earlier baseline and are not acceptance evidence for this extension. Historical regulatory material is research context only. The executable policy is deliberately synthetic.

## What is already solved elsewhere

Pega explicitly documents reuse of previously supplied documents and KYC information. Fenergo covers client lifecycle management, document collection and outreach. IBM Datacap, Tungsten TotalAgility and ABBYY offer document extraction and installed/private deployment options. IVCISA describes a Panamanian bank's DocuAssist built with Amazon Q and connected to Teams/SharePoint.

Therefore ACTA cannot credibly claim that document reuse, private document AI, banking assistants, or KYC case management have no solutions today. The narrower opportunity is a small, inspectable branch workflow that can be demonstrated locally, without a cloud inference dependency or a CORE integration. Whether that fills an underserved buying need is a hypothesis.

Sources: [Pega requirements and document reuse](https://academy.pega.com/topic/requirements-essentials/v1/in/32876/36576), [Fenergo platform](https://docs.fenergox.com/user-guides/the-fenergo-saas-platform/what-is-the-fenergo-platform), [IBM Datacap](https://www.ibm.com/docs/en/datacap/9.1.9?topic=overview), [Panama DocuAssist case](https://ivcisa.com/index.php/amazon-q-transformando-la-gestion-documental-en-la-banca-panamena/). Other vendor links and limits are preserved in the competitor report.

## The demonstration that makes the difference visible

Lucía Torres is entirely fictitious. On the first visit she supplies a request, a valid synthetic ID and an address document. The request says house 14; the document says house 41. An income document is absent.

1. QVAC reads actual text PDFs locally and proposes typed facts with page, line and exact source spans.
2. The employee checks the proposal. Source matching proves where the quoted text occurs; it does not prove that the model chose the right semantic field. Human review remains required.
3. ACTA applies a small, versioned synthetic policy to the reviewed facts. It distinguishes satisfied requirements, absent documents, contradictory information and unfinished internal review.
4. The prepared request asks about the address and income support. It does not ask again for the retained ID. Nothing is sent.
5. The first review is signed and saved. When the response arrives, the same case opens a new revision. A corrected address explicitly replaces the earlier document; a new income document is added; an identical ID is detected as a duplicate.
6. The new review shows resolved requirements and unchanged valid evidence. It saves a supervisor-ready record while retaining the prior review and original files. This is documentary readiness, not an account-opening decision.

The decisive moment is the second visit: two gaps become resolved while the already reviewed ID remains intact. A generic guide chatbot does not by itself demonstrate that continuity.

## Reuse is the default

| Existing ACTA asset | Use in this extension |
|---|---|
| Local QVAC worker, pinned SDK and verified model | Reused; bounded output size added for document reading |
| CaseService session, selection and revision controls | Reused through ReconciliationService inheritance |
| SQLite Store and atomic case/record transaction | Reused without a second database or migration framework |
| Canonical guide parser and exact source spans | Reused for the new synthetic policy |
| Ed25519 signing and trusted-key export verification | Reused with the existing record schema and an explicit workflow field |
| Caja-derived tokens, sidebar, cards and responsive styles | Reused; new document and comparison views added |
| Original procedure workflow and evidence | Retained under /legacy and in its original evidence folders |
| New components | Text-PDF intake, bounded extraction proposals, documentary comparison, explicit replacement links, visit history and change view |

## What remains unproven

No bank employee interview, observed branch baseline, deployment survey, willingness-to-pay evidence or production integration has been obtained. No staff minutes saved, reduced visits, revenue recovered or percentage cost reduction should be claimed. Competitor prices and total implementation costs were not established.

The five demonstration documents are development fixtures. Accuracy on them is not general document accuracy. Raw model outputs, filtered out-of-scope proposals and any review corrections must be reported separately. A small unfamiliar-fixture check is useful for exposing failures, but cannot establish bank-wide reliability.

The prototype accepts text PDFs, TXT and Markdown. It does not implement OCR, real customer authentication, bank authorization, encrypted storage or managed signing keys. It is a local synthetic prototype.

## Acceptance and falsifiers

The local build is useful only if the full two-visit workflow, source review, exact saved text, restart persistence, duplicate handling and tamper rejection can be demonstrated together. The authoritative test status is [00-status.md](00-status.md).

The market hypothesis weakens if branch staff already have the same continuity in their existing system; if they cannot review proposed facts efficiently; if repeat requests arise primarily from changing policy or missing external verification; or if centralized integration is required before any employee can use the result. These are practical validation questions, not implementation details that more UI polish can settle.

For a bank-user trial, compare ACTA with the employee's actual current process on the same synthetic packets. Predefine correct requests and contradictions. Record unsupported requests, missed conflicts, preserved valid documents, correction count, task completion, and employee time. Do not present a scripted spreadsheet baseline as measured bank behavior.
