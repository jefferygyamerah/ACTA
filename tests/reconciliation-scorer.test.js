import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateField, checkKind, parseMarkdownAnnotations, scoreDocument } from '../scripts/rescore-reconciliation.js';
import { root } from '../src/runtime/assets.js';

const lines = [
  { id: 1, text: 'Nombre: Esteban Ríos Valdés' },
  { id: 2, text: 'Fecha de vencimiento: 22/06/2034' },
];

test('string annotation exact match on cited line passes', () => {
  const r = validateField({ line: 1, value: 'Esteban Ríos Valdés' }, 'Esteban Ríos Valdés', lines);
  assert.equal(r.pass, true);
});

test('label-stripped value is a failure, not stripped or forgiven', () => {
  const r = validateField({ line: 1, value: 'Nombre: Esteban Ríos Valdés' }, 'Esteban Ríos Valdés', lines);
  assert.equal(r.pass, false);
  assert.equal(r.reason, 'value_mismatch');
});

test('missing model property is INVALID, distinct from explicit null', () => {
  const missing = validateField(undefined, null, lines);
  assert.equal(missing.pass, false);
  assert.equal(missing.reason, 'missing_field_invalid');
  const explicitNull = validateField(null, null, lines);
  assert.equal(explicitNull.pass, true);
  const nullWhereExpected = validateField(null, 'x', lines);
  assert.equal(nullWhereExpected.pass, false);
});

test('wrong cited line fails even when value is literal elsewhere', () => {
  const r = validateField({ line: 2, value: 'Esteban Ríos Valdés' }, 'Esteban Ríos Valdés', lines);
  assert.equal(r.pass, false);
  assert.equal(r.reason, 'source_line_mismatch');
});

test('absent field with erroneous injected value fails', () => {
  const r = validateField({ line: 2, value: '22/06/2034' }, null, lines);
  assert.equal(r.pass, false);
});

test('unknown kind is invalid', () => {
  assert.equal(checkKind('invoice', 'other').pass, false);
  assert.equal(checkKind('other', 'other').pass, true);
  assert.equal(checkKind(undefined, 'other').reason, 'missing_kind_invalid');
});

test('corrected fixture agrees with source Markdown annotations', async () => {
  const md = await readFile(path.resolve(root, 'artifacts/research/market/unfamiliar-documents.md'), 'utf8');
  const fixture = JSON.parse(await readFile(path.resolve(root, 'fixtures/reconciliation/unfamiliar-corrected.json'), 'utf8'));
  const annotations = parseMarkdownAnnotations(md);
  assert.equal(annotations.length, fixture.documents.length);
  annotations.forEach((ann, i) => {
    const doc = fixture.documents[i];
    assert.equal(doc.kind, ann.kind);
    assert.equal(doc.text, ann.text);
    assert.deepEqual(doc.expected.fields, ann.fields);
    assert.deepEqual([...doc.expected.absentFields].sort(), [...ann.absentFields].sort());
  });
});

test('disagreement between fixture and Markdown throws', async () => {
  const md = await readFile(path.resolve(root, 'artifacts/research/market/unfamiliar-documents.md'), 'utf8');
  const annotations = parseMarkdownAnnotations(md);
  const bad = { kind: annotations[0].kind, fields: { ...annotations[0].fields, holder: 'wrong' }, lines: [{ id: 1, text: annotations[0].text }] };
  assert.throws(() => scoreDocument(bad, {}), /does not match|not literal/);
});
