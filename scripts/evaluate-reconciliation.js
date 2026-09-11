import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LocalRuntime } from '../src/runtime/index.js';
import { importDocument, extractionRequest, factFields, documentKinds } from '../src/reconciliation/documents.js';
import { root, sha256 } from '../src/runtime/assets.js';

const evidenceDir = path.resolve(root, 'artifacts/evidence/reconciliation');
const sourcePath = path.resolve(root, 'artifacts/research/market/unfamiliar-documents.md');
const fixturePath = path.resolve(root, 'fixtures/reconciliation/unfamiliar.json');
const markdownEvidencePath = path.resolve(root, 'artifacts/evidence/reconciliation/unfamiliar-evaluation.json');
const reportEvidencePath = path.resolve(root, 'artifacts/evidence/reconciliation/unfamiliar-evaluation.md');
const artifactShaPrefix = 'unfamiliar-evaluation';
const policyScope = {
  application: ['holder', 'identityNumber', 'address', 'issuedAt'],
  identity: ['holder', 'identityNumber', 'expiresAt'],
  address: ['holder', 'address', 'issuedAt'],
  income: ['holder', 'incomeSource', 'issuedAt'],
  other: factFields,
};

await mkdir(evidenceDir, { recursive: true });
const sourceMarkdown = await readFile(sourcePath, 'utf8');
const sourceMarkdownSha256 = sha256(sourceMarkdown);
const fixtureText = await readFile(fixturePath, 'utf8');
const fixtureSha256 = sha256(fixtureText);
const fixture = JSON.parse(fixtureText);
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true }).trim();
const startedAt = new Date().toISOString();

function normalizeFixtureField(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function expectedLineIds(lines, value) {
  if (!value) return [];
  return lines.filter(line => line.text.includes(value)).map(line => line.id);
}

function literalMatch(line, expected) {
  return expected !== null && typeof line.text === 'string' && line.text.includes(expected);
}

function validateField(rawValue, fieldName, expected, docLines) {
  if (rawValue === null) {
    if (expected === null) {
      return { pass: true, expected: null, actual: null, line: null, reason: null };
    }
    return { pass: false, expected, actual: null, line: null, reason: 'missing_field' };
  }
  if (!rawValue || typeof rawValue !== 'object' || typeof rawValue.line !== 'number' || typeof rawValue.value !== 'string') {
    return { pass: false, expected, actual: rawValue, line: rawValue?.line ?? null, reason: 'invalid_payload' };
  }
  const line = docLines.find(item => item.id === rawValue.line);
  if (!line) {
    return { pass: false, expected, actual: rawValue.value, line: rawValue.line, reason: 'line_not_found' };
  }
  if (rawValue.value !== expected) {
    return { pass: false, expected, actual: rawValue.value, line: rawValue.line, reason: 'value_mismatch' };
  }
  const expectedLines = expectedLineIds(docLines, expected);
  if (!literalMatch(line, expected) || !expectedLines.includes(rawValue.line)) {
    return { pass: false, expected, actual: rawValue.value, line: rawValue.line, reason: 'source_line_mismatch' };
  }
  return { pass: true, expected, actual: rawValue.value, line: rawValue.line, reason: null, sourceLine: line.text };
}

function normalizeExpected(rawFixture) {
  const expected = {};
  for (const field of factFields) expected[field] = normalizeFixtureField(rawFixture?.fields?.[field]?.value ?? null);
  return {
    kind: rawFixture.kind,
    fields: expected,
    absentFields: rawFixture.absentFields ?? Object.entries(expected).filter(([, value]) => value === null).map(([field]) => field),
    ambiguityNotes: rawFixture.ambiguityNotes,
  };
}

function evaluateRaw(expectedFixture, rawExtraction, document, parseError) {
  const checks = [];
  if (parseError) {
    const message = parseError.message ?? String(parseError);
    checks.push({ field: 'kind', pass: false, expected: expectedFixture.kind, actual: null, reason: 'parse_error', detail: message });
    for (const field of factFields) {
      checks.push({ field, pass: false, expected: expectedFixture.fields[field] ?? null, actual: null, line: null, reason: 'parse_error', detail: message });
    }
    return checks;
  }
  const kindActual = rawExtraction?.kind;
  checks.push({ field: 'kind', pass: expectedFixture.kind === kindActual, expected: expectedFixture.kind, actual: kindActual, reason: expectedFixture.kind === kindActual ? null : 'kind_mismatch' });
  for (const field of factFields) {
    checks.push({
      field,
      ...validateField(rawExtraction?.[field] ?? null, field, expectedFixture.fields[field] ?? null, document.lines),
    });
  }
  return checks;
}

function evaluatePolicy(expectedFixture, rawExtraction, document, parseError) {
  const checks = [];
  const expectedKind = expectedFixture.kind;
  if (parseError) {
    const message = parseError.message ?? String(parseError);
    checks.push({ field: 'kind', pass: false, expected: expectedKind, actual: null, reason: 'parse_error', detail: message });
    for (const field of policyScope[expectedKind] ?? factFields) {
      checks.push({ field, pass: false, expected: expectedFixture.fields[field] ?? null, actual: null, line: null, reason: 'parse_error', detail: message });
    }
    return checks;
  }
  const modelKind = rawExtraction?.kind;
  checks.push({ field: 'kind', pass: expectedKind === modelKind, expected: expectedKind, actual: modelKind, reason: expectedKind === modelKind ? null : 'kind_mismatch' });
  if (!documentKinds.includes(modelKind)) {
    for (const field of policyScope[expectedKind] ?? factFields) {
      checks.push({ field, pass: false, expected: expectedFixture.fields[field] ?? null, actual: null, line: null, reason: 'invalid_model_kind' });
    }
    return checks;
  }
  const scopedFields = policyScope[expectedKind] ?? factFields;
  for (const field of scopedFields) {
    checks.push({
      field,
      ...validateField(rawExtraction?.[field] ?? null, field, expectedFixture.fields[field] ?? null, document.lines),
      note: expectedKind !== modelKind ? 'scope_mismatch_model_kind' : null,
    });
  }
  return checks;
}

function countPasses(checks) {
  return checks.reduce((n, check) => (check.pass ? n + 1 : n), 0);
}

function makeMarkdownSummary(report) {
  const lines = [];
  lines.push('# Unfamiliar synthetic reconciliation evaluation');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Source scope: ${report.scopes?.source?.path}`);
  lines.push(`Source markdown sha256: ${report.scopes.source.sha256}`);
  lines.push(`Fixture sha256: ${report.scopes.fixture.sha256}`);
  lines.push(`Git source commit: ${report.sourceCommit}`);
  lines.push('');
  lines.push('## Run identity');
  lines.push(`SDK: ${report.runtime.identity.sdkVersion}`);
  lines.push(`Addon: ${report.runtime.identity.addonVersion}`);
  lines.push(`Model ID: ${report.runtime.identity.modelId}`);
  lines.push(`Platform: ${report.runtime.identity.platform}/${report.runtime.identity.arch}`);
  lines.push('');
  lines.push('## Dataset');
  lines.push(`Count: ${report.dataset.totalDocuments}`);
  lines.push(`Model: ${report.dataset.model}`);
  lines.push('');
  lines.push('## Accuracy view 1 (raw fields + kind)');
  lines.push(`Pass: ${report.rawAccuracy.passed}/${report.rawAccuracy.total}`);
  lines.push('');
  lines.push('## Accuracy view 2 (policy-scoped fields)');
  lines.push(`Pass: ${report.policyAccuracy.passed}/${report.policyAccuracy.total}`);
  lines.push('');
  lines.push('## Per-document summary');
  for (const item of report.results) {
    lines.push(`### ${item.name}`);
    lines.push(`- expected kind: ${item.expectedKind}`);
    lines.push(`- model kind: ${item.modelKind || 'N/A'}`);
    lines.push(`- kind match (raw/policy): ${item.rawChecks.find(x => x.field === 'kind')?.pass ? 'raw pass' : 'raw fail'} / ${item.policyChecks.find(x => x.field === 'kind')?.pass ? 'policy pass' : 'policy fail'}`);
    lines.push(`- raw elapsed ms: ${item.runtime?.elapsedMs}`);
    lines.push(`- raw prompt sha256: ${item.request?.sha256}`);
    lines.push('- raw failures:');
    const rawFails = item.rawChecks.filter(check => !check.pass);
    if (!rawFails.length) {
      lines.push('  - none');
    } else {
      for (const failure of rawFails) {
        lines.push(`  - ${failure.field}: ${failure.reason}`);
      }
    }
    lines.push('- policy failures:');
    const policyFails = item.policyChecks.filter(check => !check.pass);
    if (!policyFails.length) {
      lines.push('  - none');
    } else {
      for (const failure of policyFails) {
        lines.push(`  - ${failure.field}: ${failure.reason}`);
      }
    }
    if (item.injectionFlags?.length) {
      lines.push('- injection flags:');
      for (const flag of item.injectionFlags) lines.push(`  - ${flag}`);
    }
    if (item.errors?.length) {
      lines.push('- errors:');
      for (const err of item.errors) lines.push(`  - ${err}`);
    }
    lines.push('');
  }
  lines.push('## Notes');
  lines.push('This is a small synthetic unfamiliar-fixture check authored with research assistance.');
  lines.push('No bank validation is claimed; it is a scoped model-reading behavior check only.');
  return `${lines.join('\n')}\n`;
}

const runtime = new LocalRuntime();
const results = [];
let runtimeIdentity = null;

try {
  for (const entry of fixture.documents) {
    const expected = normalizeExpected(entry.expected);
    const item = {
      id: entry.id,
      name: entry.name,
      expectedKind: expected.kind,
      expectedAmbiguityNotes: expected.ambiguityNotes,
      requestedSourceLineCount: null,
      policyScopeFields: policyScope[expected.kind] ?? [],
      request: null,
      rawChecks: [],
      policyChecks: [],
      rawOutput: null,
      modelExtractionParseError: null,
      errors: [],
      runtime: {
        startedAt: null,
        endedAt: null,
        elapsedMs: null,
        requestSha256: null,
        runId: null,
        identity: null,
      },
      injectionFlags: [],
      modelKind: null,
      inferenceOutputSha256: null,
    };
    try {
      const imported = await importDocument({ name: entry.name, text: entry.text });
      item.requestedSourceLineCount = imported.lines.length;
      const request = extractionRequest(imported);
      const requestHash = sha256(JSON.stringify(request));
      const started = new Date().toISOString();
      const start = performance.now();
      const inference = await runtime.infer(request);
      const elapsedMs = performance.now() - start;
      runtimeIdentity = inference.identity;

      item.request = { sha256: requestHash, payload: request };
      item.runtime = {
        startedAt: started,
        endedAt: new Date().toISOString(),
        elapsedMs: Number(elapsedMs.toFixed(2)),
        requestSha256: requestHash,
        runId: inference.runId,
        identity: runtimeIdentity,
      };
      item.inferenceOutputSha256 = inference.outputSha256;
      item.rawOutput = inference.outputText;

      let parsed = null;
      try {
        parsed = JSON.parse(inference.outputText);
      } catch (error) {
        item.modelExtractionParseError = String(error);
        item.errors.push(error.message || String(error));
      }
      item.modelKind = parsed?.kind ?? null;
      const expectedAndPresent = factFields.reduce((acc, field) => { acc[field] = { value: expected.fields[field], present: expected.fields[field] !== null }; return acc; }, {});
      const missingSourceLineText = imported.lines.map(line => ({ id: line.id, text: line.text }));
      const rawChecks = evaluateRaw({
        kind: expected.kind,
        fields: expected.fields,
        absentFields: expected.absentFields,
      }, parsed, { lines: missingSourceLineText }, parsed ? null : new Error(item.modelExtractionParseError || 'parse_error'));
      const policyChecks = evaluatePolicy({
        kind: expected.kind,
        fields: expected.fields,
      }, parsed, { lines: missingSourceLineText }, parsed ? null : new Error(item.modelExtractionParseError || 'parse_error'));
      item.rawChecks = rawChecks;
      item.policyChecks = policyChecks;

      if (expected.kind === 'other' && rawChecks.some(check => check.field !== 'kind' && check.pass && check.actual !== null && check.actual !== undefined)) {
        item.injectionFlags.push('Field extracted while expected kind was other; fixture 6 expects all fields absent.');
      }
      for (const field of Object.keys(expectedAndPresent)) {
        const expectedValue = expectedAndPresent[field];
        const raw = rawChecks.find(check => check.field === field);
        if (raw && raw.pass && expectedValue.present && !expected?.absenceNotes?.[field]) {
          continue;
        }
      }
      item.policyScopedResult = countPasses(policyChecks);
      item.rawResult = countPasses(rawChecks);
    } catch (error) {
      item.errors.push(error.message || String(error));
      item.rawChecks = evaluateRaw({ kind: expected.kind, fields: expected.fields, absentFields: expected.absentFields }, null, { lines: [] }, error);
      item.policyChecks = evaluatePolicy({ kind: expected.kind, fields: expected.fields }, null, { lines: [] }, error);
      item.modelExtractionParseError = item.modelExtractionParseError || String(error);
    }

    if (expected.kind === 'other' && (!item.rawChecks.find(r => r.field === 'kind') || !item.rawChecks.find(r => r.field === 'kind').pass)) {
      item.injectionFlags.push('Kind did not classify as other.');
    }
    if (expected.kind === 'other' && item.rawChecks.some(check => ['holder', 'identityNumber', 'address', 'issuedAt', 'expiresAt', 'incomeSource'].includes(check.field) && check.actual)) {
      item.injectionFlags.push('Embedded instruction or untrusted prompt-like line was extracted as fact.');
    }
    if (!item.rawChecks.length) {
      item.rawChecks = evaluateRaw({ kind: expected.kind, fields: expected.fields, absentFields: expected.absentFields }, null, { lines: [] }, new Error('no_checks'));
      item.policyChecks = evaluatePolicy({ kind: expected.kind, fields: expected.fields }, null, { lines: [] }, new Error('no_checks'));
    }
    results.push(item);
  }
} finally {
  await runtime.close();
}

const rawChecks = results.flatMap(item => item.rawChecks);
const policyChecks = results.flatMap(item => item.policyChecks);
const rawAccuracy = { total: rawChecks.length, passed: countPasses(rawChecks), failed: rawChecks.filter(x => !x.pass).length };
const policyAccuracy = { total: policyChecks.length, passed: countPasses(policyChecks), failed: policyChecks.filter(x => !x.pass).length };

const report = {
  generatedAt: new Date().toISOString(),
  sourceCommit,
  dataset: {
    name: fixture.title ?? 'unfamiliar-reconciliation',
    asOf: fixture.asOf ?? new Date().toISOString().slice(0, 10),
    model: 'local Qwen3-1.7B via QVAC runtime',
    totalDocuments: fixture.documents.length,
  },
  scopes: {
    source: { path: sourcePath.replace(root + path.sep, ''), sha256: sourceMarkdownSha256 },
    fixture: { path: fixturePath.replace(root + path.sep, ''), sha256: fixtureSha256 },
  },
  runtime: {
    file: 'src/runtime/worker.js',
    identity: runtimeIdentity,
    startedAt,
  },
  rawAccuracy,
  policyAccuracy,
  results,
  notes: [
    'Raw false positives, source span mismatch, wrong kinds, missing values and unsupported dates are failures.',
    'Literal values are compared against the fixture source and validated with source-line anchors from canonicalized document lines.',
    'This is a small synthetic unfamiliar-fixture check authored with research support, not a broad benchmark or bank-validation run.',
    'Model reading uses literal source extraction only; no prompts were retuned after output review.',
  ],
  footer: {
    modelLimits: 'Model outputs are probabilistic and may succeed on this synthetic set while still failing on other document styles.',
    syntheticScopeOnly: true,
    noBankScope: true,
  },
};
await writeFile(markdownEvidencePath, makeMarkdownSummary(report), 'utf8');
await writeFile(markdownEvidencePath.replace(/\.md$/, '.json'), JSON.stringify(report, null, 2), 'utf8');
await writeFile(path.join(path.dirname(markdownEvidencePath), `${artifactShaPrefix}.json`), JSON.stringify(report, null, 2), 'utf8');
await writeFile(path.join(path.dirname(markdownEvidencePath), `${artifactShaPrefix}.md`), makeMarkdownSummary(report), 'utf8');

const status = rawAccuracy.failed === 0 && policyAccuracy.failed === 0 ? 'passed' : 'failed';
console.log(`unfamiliar reconciliation evaluation ${status}: raw=${rawAccuracy.passed}/${rawAccuracy.total} policy=${policyAccuracy.passed}/${policyAccuracy.total}`);
