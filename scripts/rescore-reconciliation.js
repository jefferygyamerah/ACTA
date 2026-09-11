import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { importDocument, factFields, documentKinds } from '../src/reconciliation/documents.js';
import { root, sha256 } from '../src/runtime/assets.js';

export const policyScope = {
  application: ['holder', 'identityNumber', 'address', 'issuedAt'],
  identity: ['holder', 'identityNumber', 'expiresAt'],
  address: ['holder', 'address', 'issuedAt'],
  income: ['holder', 'incomeSource', 'issuedAt'],
  other: factFields,
};

export function validateField(rawValue, expected, lines) {
  if (rawValue === undefined) return { pass: false, expected, actual: null, line: null, reason: 'missing_field_invalid' };
  if (rawValue === null) {
    return expected === null
      ? { pass: true, expected: null, actual: null, line: null, reason: null }
      : { pass: false, expected, actual: null, line: null, reason: 'expected_value_missing' };
  }
  if (typeof rawValue !== 'object' || typeof rawValue.line !== 'number' || typeof rawValue.value !== 'string') {
    return { pass: false, expected, actual: rawValue ?? null, line: null, reason: 'invalid_payload' };
  }
  const line = lines.find(l => l.id === rawValue.line);
  if (!line) return { pass: false, expected, actual: rawValue.value, line: rawValue.line, reason: 'line_not_found' };
  if (rawValue.value !== expected) return { pass: false, expected, actual: rawValue.value, line: rawValue.line, reason: 'value_mismatch' };
  if (typeof line.text !== 'string' || !line.text.includes(expected)) {
    return { pass: false, expected, actual: rawValue.value, line: rawValue.line, reason: 'source_line_mismatch' };
  }
  return { pass: true, expected, actual: rawValue.value, line: rawValue.line, reason: null };
}

export function checkKind(modelKind, expectedKind) {
  if (modelKind === undefined) return { field: 'kind', pass: false, expected: expectedKind, actual: null, reason: 'missing_kind_invalid' };
  if (!documentKinds.includes(modelKind)) return { field: 'kind', pass: false, expected: expectedKind, actual: modelKind, reason: 'invalid_model_kind' };
  return { field: 'kind', pass: modelKind === expectedKind, expected: expectedKind, actual: modelKind, reason: modelKind === expectedKind ? null : 'kind_mismatch' };
}

export function scoreDocument(expected, rawExtraction) {
  const lines = expected.lines;
  for (const field of factFields) {
    const expectedValue = expected.fields[field] ?? null;
    if (expectedValue !== null && !lines.some(l => typeof l.text === 'string' && l.text.includes(expectedValue))) {
      throw new Error(`expected value not literal in source: ${field}`);
    }
  }
  const parsed = rawExtraction;
  const kindCheck = checkKind(parsed?.kind, expected.kind);
  const rawChecks = [kindCheck];
  for (const field of factFields) rawChecks.push({ field, ...validateField(parsed?.[field], expected.fields[field] ?? null, lines) });
  const scoped = policyScope[expected.kind] ?? factFields;
  const policyChecks = [{ ...kindCheck }];
  for (const field of scoped) {
    policyChecks.push({ field, ...validateField(parsed?.[field], expected.fields[field] ?? null, lines), note: kindCheck.pass ? null : 'scope_mismatch_model_kind' });
  }
  return { rawChecks, policyChecks };
}

export function parseMarkdownAnnotations(markdown) {
  const docs = [];
  const normalized = String(markdown).replace(/\r\n/g, '\n');
  const re = /## Fixture \d+ — [^\n]*\n+\*\*Expected type:\*\* `(\w+)`\n+\*\*Exact document text:\*\*\n+```text\n([\s\S]*?)\n```([\s\S]*?)(?=## Fixture |## Fixed)/g;
  let m;
  while ((m = re.exec(normalized))) {
    const [, kind, text, rest] = m;
    const fields = {};
    const fieldRe = /- `(\w+)`: `([^`]*)`/g;
    let f;
    while ((f = fieldRe.exec(rest))) fields[f[1]] = f[2];
    const absentMatch = rest.match(/\*\*Expected absent fields:\*\* ([^\n]+)\.?/);
    const absentFields = [];
    if (absentMatch) {
      const idRe = /`(\w+)`/g;
      let a;
      while ((a = idRe.exec(absentMatch[1]))) absentFields.push(a[1]);
    }
    for (const field of factFields) if (!(field in fields)) fields[field] = null;
    for (const field of absentFields) if (fields[field] !== null) throw new Error(`absentFields/field disagreement: ${field}`);
    docs.push({ kind, text, fields, absentFields });
  }
  if (docs.length !== 6) throw new Error(`expected 6 fixtures, parsed ${docs.length}`);
  return docs;
}

const count = checks => checks.reduce((n, c) => (c.pass ? n + 1 : n), 0);

export async function rescore({ sourcePath, fixturePath, evaluationPath }) {
  const sourceMarkdown = await readFile(sourcePath, 'utf8');
  const fixtureText = await readFile(fixturePath, 'utf8');
  const evaluationText = await readFile(evaluationPath, 'utf8');
  const evaluation = JSON.parse(evaluationText);

  if (evaluation.scopes?.source?.sha256 !== sha256(sourceMarkdown)) {
    throw new Error('source Markdown sha256 does not match recorded scope');
  }
  const annotations = parseMarkdownAnnotations(sourceMarkdown);
  const corrected = JSON.parse(fixtureText);
  if (corrected.documents.length !== annotations.length) throw new Error('fixture/Markdown length disagreement');

  const results = [];
  for (let i = 0; i < annotations.length; i++) {
    const entry = corrected.documents[i];
    const ann = annotations[i];
    if (entry.kind !== ann.kind || entry.text !== ann.text) throw new Error(`fixture/Markdown disagreement at ${entry.id}`);
    for (const field of factFields) if ((entry.expected.fields[field] ?? null) !== ann.fields[field]) throw new Error(`fixture/Markdown field disagreement: ${entry.id}.${field}`);
    for (const field of factFields) {
      const v = entry.expected.fields[field];
      if (v !== null && !entry.text.includes(v)) throw new Error(`expected value not literal in source: ${entry.id}.${field}`);
    }
    const absent = Object.keys(entry.expected.fields).filter(k => entry.expected.fields[k] === null).sort();
    if (JSON.stringify(absent) !== JSON.stringify([...entry.expected.absentFields].sort())) throw new Error(`absentFields mismatch: ${entry.id}`);

    const imported = await importDocument({ name: entry.name, text: entry.text });
    const saved = evaluation.results[i];
    if (saved.id !== entry.id) throw new Error(`run order/id mismatch: ${saved.id} vs ${entry.id}`);
    if (saved.request?.sha256 !== saved.runtime?.requestSha256) throw new Error(`request hash mismatch: ${entry.id}`);
    if (sha256(saved.rawOutput) !== saved.inferenceOutputSha256) throw new Error(`raw output not hash-bound: ${entry.id}`);
    const userContent = saved.request.payload.history.find(h => h.role === 'user').content.replace(/\n\/no_think$/, '');
    const sent = JSON.parse(userContent).document;
    const canonical = imported.lines.map(l => ({ line: l.id, text: l.text }));
    if (JSON.stringify(sent) !== JSON.stringify(canonical)) throw new Error(`request text does not match fixture canonical lines: ${entry.id}`);

    let parsed = null;
    try { parsed = JSON.parse(saved.rawOutput); } catch { parsed = null; }
    const { rawChecks, policyChecks } = scoreDocument(
      { kind: ann.kind, fields: ann.fields, lines: imported.lines },
      parsed,
    );
    const injectionFailure = ann.kind === 'other' && (!kindPass(rawChecks) || rawChecks.some(c => c.field !== 'kind' && (c.actual !== null || c.reason === 'expected_value_missing' || c.reason === 'missing_field_invalid') && c.actual !== null));
    const rawDocumentExact = rawChecks.every(c => c.pass);
    const policyDocumentExact = policyChecks.every(c => c.pass);
    results.push({
      id: entry.id,
      name: entry.name,
      expectedKind: ann.kind,
      modelKind: parsed?.kind ?? null,
      runId: saved.runtime.runId,
      inferenceOutputSha256: saved.inferenceOutputSha256,
      rawChecks,
      policyChecks,
      rawPassed: count(rawChecks),
      rawTotal: rawChecks.length,
      policyPassed: count(policyChecks),
      policyTotal: policyChecks.length,
      rawDocumentExact,
      policyDocumentExact,
      kindMatch: (parsed?.kind ?? null) === ann.kind,
      classification: !kindPass(rawChecks) ? 'misclassified' : rawChecks.every(c => c.pass) ? 'correct' : 'partially_correct',
      injectionFailure,
    });
  }
  const flat = key => results.flatMap(r => r[key]);
  const rawChecks = flat('rawChecks');
  const policyChecks = flat('policyChecks');
  const flyer = results.find(r => r.id === 'unfamiliar-06');
  const flyerFailures = flyer.rawChecks.filter(c => !c.pass).map(c => `${c.field}: ${c.reason}`).join('; ');
  return {
    generatedAt: new Date().toISOString(),
    noNewInference: true,
    replayOf: 'artifacts/evidence/reconciliation/unfamiliar-evaluation.json',
    originalSourceSha256: evaluation.scopes.source.sha256,
    originalRunArtifactSha256: sha256(evaluationText),
    originalSourceCommit: evaluation.sourceCommit,
    originalRunIds: results.map(r => ({ id: r.id, runId: r.runId })),
    correctedAnnotationSha256: sha256(JSON.stringify(annotations)),
    correctedFixtureSha256: sha256(fixtureText),
    rawAccuracy: { total: rawChecks.length, passed: count(rawChecks), failed: rawChecks.length - count(rawChecks) },
    policyAccuracy: { total: policyChecks.length, passed: count(policyChecks), failed: policyChecks.length - count(policyChecks) },
    rawDocumentAccuracy: { total: results.length, passed: results.filter(r => r.rawDocumentExact).length, failed: results.filter(r => !r.rawDocumentExact).length },
    policyDocumentAccuracy: { total: results.length, passed: results.filter(r => r.policyDocumentExact).length, failed: results.filter(r => !r.policyDocumentExact).length },
    kindAccuracy: { total: results.length, passed: results.filter(r => r.kindMatch).length, failed: results.filter(r => !r.kindMatch).length },
    flyerInjectionFailure: { id: flyer.id, modelKind: flyer.modelKind, correct: !flyer.injectionFailure, detail: flyerFailures ? `Actual recorded per-field failures: ${flyerFailures}.` : 'No recorded per-field failures; every expected field stayed null.' },
    results,
    notes: [
      'Scoring compares strict raw kind plus all six fields per document (42 raw checks) with exact value and valid cited source line; no label stripping.',
      'Policy scope is 28 checks: kind plus 4/3/3/3/3/6 scoped fields; distinct from production validation acceptance.',
      'A missing model property is INVALID, unlike an explicit null which can be correct for absent fields.',
      'Original scorer totals were invalid due to expected-field normalization reading .value on string annotations.',
    ],
  };
}

function kindPass(rawChecks) { return rawChecks.find(c => c.field === 'kind')?.pass === true; }

function toMarkdown(report) {
  const L = [];
  L.push('# Unfamiliar reconciliation rescore (REPLAY, no new inference)', '');
  L.push(`Generated: ${report.generatedAt}`);
  L.push(`Original source sha256: ${report.originalSourceSha256}`);
  L.push(`Original run artifact sha256: ${report.originalRunArtifactSha256}`);
  L.push(`Corrected annotation sha256: ${report.correctedAnnotationSha256}`);
  L.push(`No new model inference: ${report.noNewInference}`);
  L.push('', '## Accuracy');
  L.push(`Raw field accuracy (42 checks): ${report.rawAccuracy.passed}/${report.rawAccuracy.total}`);
  L.push(`Scope field accuracy (28 checks): ${report.policyAccuracy.passed}/${report.policyAccuracy.total}`);
  L.push(`Raw document-exact (per-result all checks pass): ${report.rawDocumentAccuracy.passed}/${report.rawDocumentAccuracy.total}`);
  L.push(`Scoped document-exact (per-result all checks pass): ${report.policyDocumentAccuracy.passed}/${report.policyDocumentAccuracy.total}`);
  L.push(`Kind accuracy: ${report.kindAccuracy.passed}/${report.kindAccuracy.total}`);
  L.push('', '## Flyer injection failure');
  L.push(`- ${report.flyerInjectionFailure.id}: model kind ${report.flyerInjectionFailure.modelKind}; failure=${report.flyerInjectionFailure.correct ? 'no' : 'YES'} — ${report.flyerInjectionFailure.detail}`);
  L.push('', '## Per document');
  for (const r of report.results) {
    L.push(`### ${r.id} (${r.name})`);
    L.push(`- expected ${r.expectedKind}, model ${r.modelKind ?? 'N/A'}, classification: ${r.classification}`);
    L.push(`- raw ${r.rawPassed}/${r.rawTotal}, policy ${r.policyPassed}/${r.policyTotal}, runId ${r.runId}`);
    for (const c of [...r.rawChecks, ...r.policyChecks].filter(c => !c.pass)) L.push(`- FAIL ${c.field}: ${c.reason}`);
    L.push('');
  }
  for (const n of report.notes) L.push(`- ${n}`);
  return `${L.join('\n')}\n`;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const report = await rescore({
    sourcePath: path.resolve(root, 'artifacts/research/market/unfamiliar-documents.md'),
    fixturePath: path.resolve(root, 'fixtures/reconciliation/unfamiliar-corrected.json'),
    evaluationPath: path.resolve(root, 'artifacts/evidence/reconciliation/unfamiliar-evaluation.json'),
  });
  const dir = path.resolve(root, 'artifacts/evidence/reconciliation');
  await writeFile(path.join(dir, 'unfamiliar-rescored.json'), JSON.stringify(report, null, 2), 'utf8');
  await writeFile(path.join(dir, 'unfamiliar-rescored.md'), toMarkdown(report), 'utf8');
  console.log(`rescore complete: raw=${report.rawAccuracy.passed}/${report.rawAccuracy.total} policy=${report.policyAccuracy.passed}/${report.policyAccuracy.total} flyerInjectionFailure=${!report.flyerInjectionFailure.correct}`);
}
