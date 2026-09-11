# Current Windows release — 2026-09-10

ACTA is deployed at http://127.0.0.1:4318 from .local/releases/candidate-7dc602c459, with the original .local/data and .local/models. Live QVAC is ready. Existing cases and signing keys were preserved. Build35JS, all35tests and the nine-stage real QVAC workflow passed in the isolated fresh dependency installation.

See [deployment receipt](../artifacts/evidence/reconciliation/local-deployment.json), [Windows operations](local-windows.md), and [current continuation](../artifacts/evidence/reconciliation/continuation.md). The initial clean test failure due to the missing .local scratch directory is retained; create it before tests when using an external model directory.

The next step is user approval of the [exact Spanish script and video format](demo-reconciliation-es.md). No narration or final video assembly has begun. Use ElevenLabs voice uFIr22uwx4X0yvGodynp after approval. The earlier handoff sections below are historical.

---
# Current reconciliation handoff — 2026-09-10

The default app is now the two-visit document workflow. App health and the actual Node process were rechecked at 21:29 UTC: http://127.0.0.1:4318, PID72052, src/server.js, synthetic mode, runtime not loaded at that moment. The older report at http://127.0.0.1:4320/report.html (PID72872) presents the earlier procedure workflow. It is not the current reconciliation report.

Authoritative scope: [current status](plans/acta/00-status.md). Pending coding and provider approval: [continuation](../artifacts/evidence/reconciliation/continuation.md).

Latest complete real run: [workflow-v5](../artifacts/evidence/reconciliation/workflow-v5/workflow.json), all 8 stages passed. Isolated store: .local/reconciliation-e2e-y6uXIu. Both signed reviews and original identity bytes survived a service restart and an independent process. Current deterministic checks: 22/22 passed; build checked 33 JS files.

To inspect the retained automated store on an unused port, preserving the main app:

```powershell
$env:PORT = '4319'
$env:ACTA_DATA_DIR = (Resolve-Path '.local/reconciliation-e2e-y6uXIu').Path
$env:ACTA_AUTOMATION = '1'
node src/server.js
```

Do not launch a duplicate if that port is occupied. Verify the PID and command before stopping any server. This store and its review actor are synthetic automation evidence.

After the pending fixes, use a new evidence directory and preserve earlier successes/failures:

```powershell
npm.cmd test
npm.cmd run build
$env:ACTA_RECONCILIATION_EVIDENCE = 'artifacts/evidence/reconciliation/workflow-v6'
node scripts/reconciliation-e2e.js
```

Check that workflow-v6 is unused before running. Then inspect desktop/mobile screenshots, package the current video/report, and restart only the verified main app process to load the finished source. No source was committed or pushed for this extension.

Unfamiliar model outputs have material errors. Original scorer totals are invalid; [audit](../artifacts/evidence/reconciliation/evaluation-audit.md) explains the needed corrected replay. [Existing-validator replay](../artifacts/evidence/reconciliation/recorded-output-validation.json) records what was actually rejected or accepted without new inference. Human/bank validation remains unperformed; [proposed protocol](plans/acta/07-user-validation.md) is ready.

Historical handoff below describes the earlier procedure-selection checkpoint, not the current default app.

---

# ACTA local handoff

Source checkpoint tested: `f436f21e627f4ff24a148d34316d9a9f3cb0393d`, branch `main`. Subsequent documentation/evidence closeout does not change executable source.

## Running entry points

- App: http://127.0.0.1:4318
- Evidence report: http://127.0.0.1:4320/report.html

Background process IDs and log paths are recorded locally in `.local/running.json`, `.local/server.stdout.log`, `.local/server.stderr.log` and the corresponding evidence-server logs. Both bind loopback only. No public deployment or submission was performed.

Normal launch, using a fresh/default synthetic data store:

```powershell
npm.cmd ci --no-audit --no-fund
npm.cmd run provision
npm.cmd start
```

Default model: `.local/models/Qwen3-1.7B-Q4_0.gguf`. Default database and local signing key: `.local/data`. Model, key and database bytes stay outside Git.

## Exact retained demonstration

Case ID: `3ea3571f-c21f-4a8f-a512-1ef42103667d`.
Store: `.local/e2e-xM7biR`.
Exact reviewed text SHA-256:
`0085c3f623c92d242a29ccd4228a27584700d3f113d1a55f6c9a4a95f5a01909`.

To inspect that isolated test store on a separate port:

```powershell
$env:PORT = '4319'
$env:ACTA_DATA_DIR = (Resolve-Path '.local/e2e-xM7biR').Path
$env:ACTA_AUTOMATION = '1'
node src/server.js
```

This is explicitly the automated synthetic evidence workspace. Do not use it for real records.

## Validation and artifacts

```powershell
npm.cmd test
node scripts/validation.js
node scripts/evaluate.js
npm.cmd run test:e2e
node scripts/clean-setup.js
npm.cmd run verify -- artifacts/evidence/acta/reviewed-export.json artifacts/evidence/acta/trusted-public-key.txt
```

[Status](plans/acta/00-status.md) owns the passing scopes and limits. [Evidence index](../artifacts/evidence/acta/index.json) binds eight checks; [workflow](../artifacts/evidence/acta/workflow.json) binds real model prompts/results, citations, approval mechanics, persisted bytes and export. [Clean setup](../artifacts/evidence/acta/clean-setup.json) retains every command/exit and a second actual real-inference UI run.

[Video](../artifacts/evidence/acta/demo-acta.mp4): 195.72 seconds, actual browser footage with Spanish selectable captions and no voice narration. [Narration script](demo-es.md): planned 4:55 script. Local MP4/WebM files are ignored by Git; the report and JSON/screenshots are versioned.

## Remaining work

The known S05 folio question fails in the 32-case development evaluation; all ten required abstentions pass after relevance checking and canonical exclusion guards. Previous 27/32 and 30/32 candidates remain in the evidence folder. No claim of general model accuracy is made from the tuned development set.

Human acceptance, an independently installed second machine and enforced offline networking remain unverified. Production authentication, encrypted case storage, secure key custody and real bank guides are outside this prototype.

The first clean-install attempt failed because Windows PowerShell selected npm.ps1 under a restricted execution policy. The harness now uses npm.cmd; no system policy was changed. The original failure is retained. Windows sandbox helpers intermittently failed to create processes; authorized commands ran through reviewed elevated execution.

Next runnable action: open the local app, complete the synthetic missing-document case, or inspect the retained demonstration with the command above. Address S05 and evaluate fresh unseen questions before enlarging the supported workflow.
