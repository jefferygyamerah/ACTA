# Current ACTA delivery status — 2026-09-10

The default app serves **branch staff continuing a document review across two visits**. It reads synthetic text PDFs with local QVAC, preserves reviewed documents, prepares confirmed gaps, and retains both signed reviews.

| Slice | Current evidence | Remaining action |
|---|---|---|
| Build and deterministic tests | 35/35 tests passed; syntax/build check passed for 35 JavaScript files | Passed again in the isolated release snapshot |
| Real local QVAC and two visits | [workflow-v6](../../../artifacts/evidence/reconciliation/workflow-v6/workflow.json), 9/9 stages passed; all 50 recorded source hashes match | Passed again from fresh locked dependencies in local-release/workflow |
| Cross-case notes and explicit review | Draft note stayed in its case, intentionally cleared note stayed empty, saved note restored; case B used explicit manual setup excluded from model metrics | Passed within the recorded source scope |
| Durable records and originals | Two exact signed records across reload, service restart and independent Node process; original PDF bytes retained | Live store and signing key preserved during deployment |
| Export integrity | Original accepted; modified export rejected | No authenticated bank identity claimed |
| Development document reading | 5/5 policy-filtered required-field readings matched before review; zero corrections; 3 erroneous raw out-of-scope proposals retained | Not a general accuracy estimate |
| Unfamiliar document replay | [Corrected replay](../../../artifacts/evidence/reconciliation/unfamiliar-rescored.md): 24/42 raw field/kind checks, 14/28 policy checks; raw exact 0/6, scoped exact 1/6, kind 5/6 | Material extraction/injection errors remain; no new inference in this replay |
| Windows deployment | [Deployment receipt](../../../artifacts/evidence/reconciliation/local-deployment.json): tested release live on port4318, QVAC ready, automation false, existing cases preserved | Complete; same-machine scope |
| Presentation website | Local preview on http://127.0.0.1:4321/; warm-final 33/33 checks passed, seven website hashes independently matched; app source unchanged (50/50 hashes) | Complete on 2026-09-10, Panama UTC-5: 167px phone competition panel, full hero photo in first 390x844 viewport, concise bilingual captions/footer, numeral contrast 5.35–9.25:1. Desktop/phone/evidence pixels reviewed; mobile is Edge emulation. Image spend remains 13 of 30 Higgsfield credits; no public publication |
| Final video | [Exact proposed script and format](../../demo-reconciliation-es.md), 4:30 target, real Windows desktop and continuous local-inference shot, Spanish, 1080p, chosen ElevenLabs voice | Script and format approved; website verified 33/33. Exact Jeff narration generated once (194.35s, voice uFIr22uwx4X0yvGodynp); 467 spoken words aligned at 97.6% similarity. Desktop framing correction and native Higgsedit opening/closing in progress; final assembly and playback verification pending. No publication. |
| Banking demand | [Market analysis](06-market-usecase.md) uses primary evidence of friction and identifies competitors | Bank staff validation and measured benefit remain unperformed |

The service fixes now preserve positive retention reasons, immutable saved analysis, explicit response-review date and no date rollback, and unambiguous Spanish month dates. The UI preserves source-review gates and isolates notes between cases.

The unfamiliar model can cite nonexistent lines, include labels, confuse payment deadlines with expiration, and extract injected content from an irrelevant flyer. Literal source matching does not establish semantic correctness. Original faulty score artifacts remain retained and must not be quoted as valid. Eight fresh synthetic holdout documents are prepared but have not been evaluated.

No bank acceptance, production authentication/encryption, enforced network isolation, measured productivity gain, public submission, or unique-market capability is claimed. QVAC uses Qwen3-1.7B Q4_0 locally; no cloud inference is wired into ACTA.

Spark was unavailable before the deadline. The user authorized GLM Flash and Kimi K3 fallbacks and ongoing scoped source/test exchange. GLM Flash authored service fixes; Kimi K3 completed the bounded UI/E2E/report cleanup. [Continuation](../../../artifacts/evidence/reconciliation/continuation.md) holds current operational details.

The earlier procedure-selection bootstrap and its results below remain historical evidence of that earlier workflow.

---

# ACTA delivery status

State: local bootstrap, connected workflow, persistence and demo evidence completed.
Tested source checkpoint: `f436f21e627f4ff24a148d34316d9a9f3cb0393d`. Later closeout changes only document/package these results.

| Slice | Status | Evidence / next action |
|---|---|---|
| Synthetic case and procedural sources | Passed in actual UI | [Screens and report](../../../artifacts/evidence/acta/report.html); desktop and mobile layouts inspected |
| Real local QVAC selection and abstention | Main flow passed; broad quality limit retained | [Runtime](../../../artifacts/evidence/acta/runtime-summary.json), [31/32 evaluation](../../../artifacts/evidence/acta/evaluation.json) |
| Review and durable save/reload | Passed | [Connected receipt](../../../artifacts/evidence/acta/workflow.json); exact bytes across browser reload, service restart and separate Node process |
| Verifiable export and tamper rejection | Passed | [Export checks](../../../artifacts/evidence/acta/export-check.json); original accepted, modified copy rejected against trusted key |
| Clean setup and demonstration | Passed within recorded scope | [Clean setup](../../../artifacts/evidence/acta/clean-setup.json), [195.72-second MP4](../../../artifacts/evidence/acta/demo-acta.mp4); Spanish captions, no voice narration |

Nine deterministic tests passed. All eight packaged evidence gates are recorded against the tested source; the generic verifier checked 16 artifact references. It checks inventory completeness and hashes, not independent semantic acceptance.

## Open limits

- Development evaluation: 31/32 delivered selections; 10/10 required abstentions. S05 (withdrawal folio assignment) incorrectly chooses ISL-REC-01 instead of RET-ISL-01. Raw model accuracy and earlier failed experiments are retained. Human source review remains necessary.
- The automation actor is explicit; no bank employee or user acceptance is claimed.
- Same-machine clean installation only. Enforced network isolation and independent-machine installation were not tested.
- Plaintext synthetic SQLite records and exports; no production authentication, key custody, encryption or bank deployment.
- The recording is actual browser footage with Spanish selectable captions. The separate 4:55 narration script has not been voice-recorded.

The original 18-hour estimate is historical; no exact deadline was supplied in this task. Work ran approximately 19:43–20:15 UTC on 2026-09-10. This does not reset a competition budget.

Next: use the [handoff](../../handoff.md) to run ACTA, inspect the retained case and address S05 before expanding beyond the onboarding demonstration.

## Audience and purpose clarification

Following feedback that the purpose was unclear, the opening screen now states the intended branch employee, the incomplete account-opening example and the reviewed handoff outcome. Step guidance distinguishes the employee's work from AI guide selection. Source confirmation now stays disabled until both required topics have a supporting result, matching the existing service rule.

Desktop/mobile rendering and the initial case flow were checked in an isolated synthetic store: [clarity receipt](../../../artifacts/evidence/clarity/ui-review.json), [opening screen](../../../artifacts/evidence/clarity/opening-desktop.png). This check did not rerun model inference or persistence acceptance. The earlier recording/index remain evidence of their identified source checkpoint and retain the earlier screen wording.

## Repository attribution and updated presentation

Per the user, donor acknowledgements stay in README/NOTICE and licence files, not the application or demo narrative. The report now links fresh footage with the clarified interface and without the old footer. [Updated workflow](../../../artifacts/evidence/acta/presentation/workflow.json) passed all eight stages with real inference, restart persistence and original/tampered export checks. [Presentation check](../../../artifacts/evidence/acta/presentation/presentation-check.json) confirms both live pages, retained repository acknowledgement and video playback. Duration 258.8 seconds; first selection plus relevance took 48.1 seconds in this run, cause not isolated. Earlier acceptance/index artifacts remain intact. This capture identifies HEAD plus dirty working-tree state and post-run source-file hashes; no clean-commit or human-acceptance claim.

User-confirmed competition: Decentralized AI Hackathon, Caja Track05. Live published cutoff: September11 08:00 Panama. Independent GLM5.3 and Fable5.1 packet reviews completed after explicit transmission approval: [adjudicated assessment](../../../artifacts/review/2026-09-10/assessment.md). Judge access, narrated pitch and actual submission remain outstanding.

## Current follow-up audit

The [saved-output validator replay](../../../artifacts/evidence/reconciliation/recorded-output-validation.json) confirms that source-line rejection does not prevent all semantic/injection errors. No new inference or approved record was produced in that replay. The [bank-user validation protocol](07-user-validation.md) and [Spanish judge brief](../../judge-brief-es.md) are prepared; neither constitutes bank validation or a completed final demo.
